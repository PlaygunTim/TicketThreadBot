import {
  MessageButton,
  MessageButtonStyleResolvable,
  TextChannel,
} from 'discord.js';
import { createTicket } from '../tickets';
import { ButtonOptions } from '../types';
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
  extraArg,
}: ButtonOptions): Promise<void> => {
  await interaction.deferReply({ ephemeral: true });
  const channel = interaction.channel;
  if (!channel) {
    throw new Error('`interaction.channel` should be defined');
  }
  if (!(channel instanceof TextChannel)) {
    throw new Error('Tickets cannot be created in news channels!');
  }

  await createTicket({
    channel,
    userId: interaction.user.id,
    ticketType: extraArg,
  });
  await interaction.editReply({
    content: 'Ticket has been created! You may dismiss this message',
  });
};

const baseArg = 'create-ticket';
const guildOnly = true;
export { generateButtonData, baseArg, guildOnly, execute };
