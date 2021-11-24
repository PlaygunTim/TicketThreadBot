import {
  GuildMemberRoleManager,
  MessageButton,
  MessageButtonStyleResolvable,
  TextChannel,
} from 'discord.js';
import { createTicket } from '../tickets';
import { ButtonOptions, MessageError } from '../types';
import { barredRoleId, barredMessage, ticketChannelId } from '../config.json';

type generateButtonDataOptions = {
  ticketType: string;
  style: MessageButtonStyleResolvable;
};
const generateButtonData = ({
  ticketType,
  style,
}: generateButtonDataOptions): MessageButton => {
  if (ticketType.includes(':'))
    throw new Error('Ticket type cannot contain the character ":"!');
  const button = new MessageButton()
    .setCustomId(`create-ticket:${ticketType}`)
    .setLabel(`Open ${ticketType}`)
    .setStyle(style);
  return button;
};

const execute = async ({
  interaction,
  ticketType,
}: ButtonOptions): Promise<void> => {
  await interaction.deferReply({ ephemeral: true });

  if (!interaction.guild || !interaction.member)
    throw new MessageError('This command must be used in a guild');

  const channel = interaction.guild.channels.cache.get(ticketChannelId);

  if (!channel) {
    throw new Error('Could not find the ticket channel!');
  }
  if (!(channel instanceof TextChannel)) {
    throw new Error('Tickets cannot be created in news channels!');
  }

  let hasBarredRole = false;
  if (interaction.member.roles instanceof GuildMemberRoleManager) {
    hasBarredRole = interaction.member.roles.cache.get(barredRoleId)
      ? true
      : false;
  } else {
    hasBarredRole = interaction.member.roles.includes(barredRoleId);
  }
  if (hasBarredRole) {
    throw new MessageError(barredMessage);
  }

  await createTicket({
    channel,
    userId: interaction.user.id,
    ticketType: ticketType,
    userDisplayName: interaction.user.username,
  });
  await interaction.editReply({
    content: 'Ticket has been created! You may dismiss this message',
  });
};

const baseArg = 'create-ticket';
const guildOnly = true;
const cooldown = 60;
export { generateButtonData, baseArg, guildOnly, cooldown, execute };
