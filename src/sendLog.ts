import { EmbedBuilder } from '@discordjs/builders';
import { Client, MessageEmbed, Snowflake } from 'discord.js';
import { logChannelId } from './config.json';

const sendLog = async ({
  title,
  message,
  userId,
  client,
  ticketId,
  targetUserId,
  guildId,
  messageId,
  color,
}: {
  title: string;
  message?: string;
  userId?: Snowflake;
  client: Client;
  ticketId: Snowflake;
  targetUserId?: Snowflake;
  guildId?: Snowflake;
  messageId?: Snowflake;
  color: [number, number, number];
}): Promise<void> => {
  const logChannel = client.channels.cache.get(logChannelId);
  if (!logChannel || !logChannel.isText()) return;
  const embed = new EmbedBuilder()
    .setTitle(title)
    .addFields({ value: `<#${ticketId}>`, name: 'Ticket', inline: true })
    .setTimestamp(Date.now())
    .setColor(color);
  if (guildId && messageId) {
    embed.setURL(
      `https://discord.com/channels/${guildId}/${ticketId}/${messageId}`,
    );
  }
  if (message) {
    embed.setDescription(message);
  }
  if (userId) {
    embed.addFields({
      value: `<@${userId}>`,
      name: 'Action By',
      inline: true,
    });
  }
  if (targetUserId) {
    embed.addFields({
      value: `<@${targetUserId}>`,
      name: 'Target User',
      inline: true,
    });
  }

  await logChannel.send({
    embeds: [embed.toJSON() as unknown as MessageEmbed],
  });
};
export { sendLog };
