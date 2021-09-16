import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  MessageActionRow,
  MessageButtonStyle,
  MessageButtonStyleResolvable,
} from 'discord.js';
import { generateButtonData } from '../buttons/createTicketButton';
import { ticketTypes } from '../config.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-ticket-options')
    .setDescription('send the buttons'),
  async execute(interaction: CommandInteraction) {
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
    await interaction.reply({
      content: 'Click for buttons',
      components: [row],
    });
  },
};
