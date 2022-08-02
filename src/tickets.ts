import {
  Client,
  CommandInteraction,
  TextChannel,
  ThreadChannel,
  Collection,
} from 'discord.js';
import { Snowflake, ThreadAutoArchiveDuration } from 'discord-api-types/v9';
import {
  ticketTypes,
  lockTime,
  generatedMessage,
  autoArchiveDuration,
  anonymousUser,
} from './config.json';
import { MessageError, TicketConfig } from './types';
import { CurrentEditingTickets, prisma } from './index';
import { CloseReason } from '.prisma/client';
import axios from 'axios';
import { sendLog } from './sendLog';
import { embedBlue, embedGreen, embedOrange, embedRed } from './consts';

const ticketMap: Collection<string, TicketConfig> = new Collection();
const ticketList: string[] = [];
ticketTypes.forEach((ticketType) => {
  ticketMap.set(ticketType.name, ticketType as TicketConfig);
  ticketList.push(ticketType.name.toUpperCase());
});

type createTicketArgs = {
  channel: TextChannel;
  userId: Snowflake;
  userDisplayName: string;
  ticketType: string;
  modGeneratedOptions?: {
    message: string | null;
    creatorDisplayName: string;
    creatorId: Snowflake;
    anonymous: boolean;
  };
};
const createTicket = async ({
  channel,
  userId,
  userDisplayName,
  ticketType,
  modGeneratedOptions,
}: createTicketArgs): Promise<void> => {
  const textId = (await axios.get('https://uuid.rocks/nanoid?len=10'))
    .data as string;
  const thread = await channel.threads.create({
    name: `${userDisplayName}-${textId}`,
    autoArchiveDuration: autoArchiveDuration as ThreadAutoArchiveDuration,
    //type: 'GUILD_PRIVATE_THREAD', // Uncomment this when in production, in testing private threads cannot be used
    type: 'GUILD_PUBLIC_THREAD',
    reason: `User (${userId}) created a ${ticketType} ticket.`,
    invitable: false,
  });

  await prisma.ticket.create({
    data: {
      id: thread.id,
      textId,
      ticketType: ticketType.toUpperCase(),
      userId: userId,
      modGeneratedById: modGeneratedOptions?.creatorId,
    },
  });
  const ticketData = ticketMap.get(ticketType);
  if (!ticketData) {
    throw new Error('That ticket type was not found!');
  }
  if (modGeneratedOptions) {
    let messageString = generatedMessage.replace('{{user}}', `<@${userId}>`);
    if (!modGeneratedOptions.anonymous) {
      messageString = messageString.replace(
        '{{creator}}',
        `<@${modGeneratedOptions.creatorId}>`,
      );
    } else {
      messageString = messageString.replace('{{creator}}', anonymousUser);
    }
    const sentInitialMessage = await thread.send({
      content: messageString,
    });
    if (modGeneratedOptions.message) {
      await thread.send({
        content: `> ${modGeneratedOptions?.message.replace(
          /\n/,
          '\n > ',
        )}\n - ${
          modGeneratedOptions.anonymous
            ? anonymousUser
            : modGeneratedOptions?.creatorDisplayName
        }`,
      });
    }
    await sendLog({
      title: 'Ticket created',
      message: modGeneratedOptions.message
        ? `**Content:**\n${modGeneratedOptions.message} `
        : undefined,
      userId: modGeneratedOptions?.creatorId,
      client: channel.client,
      ticketId: thread.id,
      targetUserId: userId,
      guildId: channel.guild?.id,
      messageId: sentInitialMessage.id,
      color: embedGreen,
    });
  } else {
    const messageString = ticketData.message.replace(
      '{{user}}',
      `<@${userId}>`,
    );
    const sentInitialMessage = await thread.send({
      content: messageString,
    });
    await sendLog({
      title: `${ticketData.name.replace(
        /\w\S*/g,
        (w) => w.replace(/^\w/, (c) => c.toUpperCase()), // Capitalize first letter
      )} ticket created`,
      client: channel.client,
      ticketId: thread.id,
      userId: userId, // This is the Action By field
      guildId: channel.guild?.id,
      messageId: sentInitialMessage.id,
      color: embedGreen,
    });
  }
};

const sendAnonMessage = async (
  channel: ThreadChannel,
  message: string,
  authorId: Snowflake,
  client: Client,
): Promise<void> => {
  const ticketDBData = await prisma.ticket.findUnique({
    where: { id: channel.id },
  });
  if (!ticketDBData) throw new MessageError('This ticket could not be found!');
  if (ticketDBData.locked) {
    throw new MessageError('That ticket is locked!');
  }

  const formattedMessage = `> ${message.replace(
    /\n/,
    '\n > ',
  )}\n - ${anonymousUser}`;

  await channel.send(formattedMessage);
  await sendLog({
    title: 'Anonymous message sent',
    message: `**Content:**\n${message}`,
    userId: authorId,
    client,
    ticketId: channel.id,
    color: embedBlue,
  });
};

const closeTicket = async (
  interaction: CommandInteraction,
  {
    reason,
    description,
    client,
  }: { reason: CloseReason; description?: string; client: Client },
): Promise<void> => {
  const channel = interaction.channel;
  if (!(channel instanceof ThreadChannel))
    throw new MessageError('This is not a ticket!');
  const ticketDBData = await prisma.ticket.findUnique({
    where: { id: channel.id },
  });
  if (!ticketDBData) throw new MessageError('This ticket could not be found!');
  if (ticketDBData.lockAt) {
    const lockAtTimestamp = Math.round(ticketDBData.lockAt.getTime() / 1000);
    const message = `This ticket was already closed and will be locked at <t:${lockAtTimestamp}:F> <t:${lockAtTimestamp}:R>`;
    if (ticketDBData.lockAt < new Date()) {
      // Have to reply before archiving ticket

      await interaction.editReply({
        content:
          'This ticket has already been locked. Please open another ticket',
      });
      await channel.edit(
        { locked: true, archived: true },
        `Closed ticket closed again by ${interaction.user.username}#${interaction.user.discriminator}`,
      ); // TODO CHECK IF REARCHIVING IS NEEDED
      await prisma.ticket.update({
        data: {
          locked: true,
        },
        where: { id: channel.id },
      });

      return;
    } else {
      await interaction.editReply({
        content: message,
      });
      await channel.setArchived(
        true,
        `Ticket closed again by ${interaction.user.username}#${interaction.user.discriminator}`,
      );
      await sendLog({
        title: 'Ticket re-closed',
        message: `**Reason:** \`${reason}\`${
          description ? `\n**Description:**\n${description}` : ''
        }`,
        userId: interaction.user.id,
        client: client,
        ticketId: channel.id,
        color: embedRed,
      });
      return;
    }
  } else {
    await prisma.ticket.update({
      data: {
        lockAt: new Date(Date.now() + lockTime),
        closeReason: reason,
        closeDescription: description,
      },
      where: { id: channel.id },
    });
    const lockAtTimestamp = Math.round((Date.now() + lockTime) / 1000);
    //CurrentEditingTickets.set(channel.id, true); // This is done because sending the message 'seems' like someone else unarchiving it
    await channel.send({
      content: `This ticket has been closed. To reopen the ticket unarchive the thread by sending a message or clicking on the unarchive button.
                \nOtherwise this ticket will be locked at <t:${lockAtTimestamp}:F> <t:${lockAtTimestamp}:R>`,
    });
    await interaction.editReply({
      content: 'The ticket has been closed',
    });

    await channel.setArchived(
      true,
      `Ticket closed by ${interaction.user.username}#${interaction.user.discriminator}`,
    );
    //CurrentEditingTickets.delete(channel.id);
    await sendLog({
      title: 'Ticket closed',
      message: `**Reason:** \`${reason}\`${
        description ? `\n**Description:**\n${description}` : ''
      }`,
      userId: interaction.user.id,
      client: client,
      ticketId: channel.id,
      color: embedRed,
    });
  }
};

const checkPendingLocks = async (client: Client) => {
  const tickets = await prisma.ticket.findMany({
    where: {
      AND: [
        {
          lockAt: {
            not: null,
          },
        },
        {
          locked: false,
        },
      ],
    },
  });
  tickets.forEach(async (ticket) => {
    if (ticket.lockAt && ticket.lockAt < new Date()) {
      const channel = (await client.channels.fetch(ticket.id)) as
        | ThreadChannel
        | undefined;
      if (!channel) {
        return;
      }
      CurrentEditingTickets.set(channel.id, true); // This is done because sending the message 'seems' like someone else unarchiving it
      await channel.send(
        'This ticket is now locked and cannot be reopened. \nIf you would like to reach out again, please create another ticket.',
      );
      await channel.edit(
        { locked: true, archived: true },
        'Closed ticket auto locked',
      );
      await prisma.ticket.update({
        data: {
          locked: true,
        },
        where: { id: channel.id },
      });
      await sendLog({
        title: 'Ticket auto-locked',
        ticketId: channel.id,
        client: client,
        color: embedOrange,
      });
      CurrentEditingTickets.delete(channel.id);
    }
  });
};

export {
  createTicket,
  closeTicket,
  checkPendingLocks,
  ticketList,
  sendAnonMessage,
};
