import { TextChannel } from 'discord.js';
import { Snowflake } from 'discord-api-types';
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
  await thread.send({
    content: `<@${userId}> created a ticket!`,
  });
};

export { createTicket };
