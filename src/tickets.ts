import { TextChannel } from 'discord.js';
import { Snowflake } from 'discord-api-types';
import { ticketTypes } from './config.json';
import { TicketConfig } from './types';

const ticketMap: Map<string, TicketConfig> = new Map();
ticketTypes.forEach((ticketType) => {
  ticketMap.set(ticketType.name, ticketType as TicketConfig);
});

type createTicketArgs = {
  channel: TextChannel;
  userId: Snowflake;
  ticketType: string;
};
const createTicket = async ({
  channel,
  userId,
  ticketType,
}: createTicketArgs): Promise<void> => {
  const thread = await channel.threads.create({
    name: `${ticketType} ticket`,
    autoArchiveDuration: 60,
    //type: 'GUILD_PRIVATE_THREAD', // Uncomment this when in production, in testing private threads cannot be used
    type: 'GUILD_PUBLIC_THREAD',
    reason: `User (${userId}) created a ${ticketType} ticket.`,
  });
  const ticketData = ticketMap.get(ticketType);
  if (!ticketData) {
    throw new Error('That ticket type was not found!');
  }
  const messageString = ticketData.message.replace('{{user}}', `<@${userId}>`);
  await thread.send({
    content: messageString,
  });
};

export { createTicket };
