import { SlashCommandBuilder } from '@discordjs/builders';
import { CloseReason } from '@prisma/client';
import {
  Client,
  CommandInteraction,
  GuildMemberRoleManager,
  MessageActionRow,
  MessageButtonStyle,
  TextChannel,
  ThreadChannel,
} from 'discord.js';

import { MessageError, StoredCommand } from '../types';
import { closeTicket, createTicket, sendAnonMessage } from '../tickets';
import {
  ChannelType,
  ApplicationCommandPermissionType,
} from 'discord-api-types/v9';
import {
  modRoleId,
  generatedTicketType,
  ticketTypes,
  ticketChannelId,
  buttonsMessage,
} from '../config.json';
import { generateButtonData } from '../buttons/createTicketButton';
const commandData: StoredCommand = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Commands related to tickets')
    .setDefaultPermission(true)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('close')
        .setDescription('Close the current ticket')
        .addStringOption((option) =>
          option
            .setName('type')
            .setDescription('The type / reason for the ticket')
            .setRequired(true)
            .addChoices(
              ...Object.values(CloseReason).map((reason) => {
                let name = reason.toLowerCase();
                name = name
                  .replaceAll('_', ' ')
                  .replace(/\w\S*/g, (w) =>
                    w.replace(/^\w/, (c) => c.toUpperCase()),
                  );
                return { name, value: reason as string };
              }),
            ),
        )
        .addStringOption((option) =>
          option
            .setName('description')
            .setDescription(
              'A brief description of the ticket, not required for invalid tickets',
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('open')
        .setDescription('Open a new ticket with user provided')
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('The user to open a ticket for')
            .setRequired(true),
        )
        .addBooleanOption((option) =>
          option
            .setName('anonymous')
            .setDescription("Open the ticket as the 'moderators' not you")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option.setName('message').setDescription('An initial message'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('send-message')
        .setDescription('Send an anonymous message to the ticket')
        .addChannelOption((option) =>
          option
            .setName('ticket')
            .setRequired(true)
            .setDescription('The ticket to send the message to')
            .addChannelTypes(
              ChannelType.GuildPrivateThread,
              ChannelType.GuildPublicThread,
            ),
        )
        .addStringOption((option) =>
          option
            .setName('message')
            .setRequired(true)
            .setDescription('The message to send'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('send-buttons').setDescription('Send ticket buttons'),
    ),
  guildOnly: true,
  permissions: [
    {
      id: modRoleId,
      type: ApplicationCommandPermissionType.Role,
      permission: true,
    },
  ],

  async execute(interaction: CommandInteraction, client: Client) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild || !interaction.member)
      throw new MessageError('This command must be used in a guild');
    let hasModRole = false;
    if (interaction.member.roles instanceof GuildMemberRoleManager) {
      hasModRole = interaction.member.roles.cache.get(modRoleId) ? true : false;
    } else {
      hasModRole = interaction.member.roles.includes(modRoleId);
    }
    if (!hasModRole) {
      throw new MessageError(
        'You do not have the correct roles to use this command. \nPlease contact your administrator if this is in error!',
      );
    }
    const subcommandName = interaction.options.getSubcommand();
    switch (subcommandName) {
      case 'close':
        const type = interaction.options.get('type');
        if (!type) {
          throw new MessageError('Type option is missing');
        }
        const description = interaction.options.get('description');

        await closeTicket(interaction, {
          reason: type.value as CloseReason,
          description: description?.value as string | undefined,
          client,
        });
        break;
      case 'open':
        const channel = interaction.guild.channels.cache.get(ticketChannelId);
        if (!(channel instanceof TextChannel)) {
          throw new Error('Tickets cannot be created in news channels!');
        }
        const user = interaction.options.getUser('target');
        if (!user) {
          throw new Error('Target is a required option!');
        }
        const anonymous = interaction.options.getBoolean('anonymous');
        // !anonymous will not work as this is a boolean. Must check for null instead
        if (anonymous === null) {
          throw new Error('Anonymous option is a required option!');
        }
        const message = interaction.options.getString('message');

        await createTicket({
          channel,
          userId: user.id,
          ticketType: generatedTicketType,
          userDisplayName: user.username,
          modGeneratedOptions: {
            message,
            creatorDisplayName: `${interaction.user.username}#${interaction.user.discriminator}`,
            anonymous,
            creatorId: interaction.user.id,
          },
        });
        await interaction.editReply({
          content: 'Ticket has been created! You may dismiss this message',
        });
        break;
      case 'send-buttons':
        if (!interaction.channel || !interaction.guild) {
          throw new MessageError('This command can only be used in a guild!');
        }
        if (!interaction.memberPermissions?.has('ADMINISTRATOR')) {
          throw new MessageError(
            'You need the administrator permission to do this action!',
          );
        }
        const row = new MessageActionRow();
        if (ticketTypes.length > 5) {
          throw new Error('Only 5 ticket types allowed!');
        }
        ticketTypes.forEach((ticketType) => {
          row.addComponents(
            generateButtonData({
              ticketType: ticketType.name,
              style: ticketType.style as MessageButtonStyle,
            }),
          );
        });
        await interaction.channel.send({
          content: buttonsMessage,
          components: [row],
        });
        await interaction.editReply({
          content: 'Buttons sent',
        });
        break;
      case 'send-message':
        const ticket = interaction.options.getChannel('ticket');
        if (!ticket) {
          throw new MessageError('Ticket is a required option!');
        }
        if (!(ticket instanceof ThreadChannel))
          throw new MessageError('Ticket option must be a thread!');
        const messageContent = interaction.options.getString('message');
        if (!messageContent) {
          throw new MessageError('Message is a required option!');
        }
        await sendAnonMessage(
          ticket,
          messageContent,
          interaction.user.id,
          client,
        );
        await interaction.editReply({
          content: `Anonymous message sent to <#${ticket.id}>`,
        });
        break;
      default:
        throw new Error('Unknown subcommand');
    }
  },
};

module.exports = commandData;
