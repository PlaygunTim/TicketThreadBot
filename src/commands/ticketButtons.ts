import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageActionRow } from 'discord.js';
import { generateButtonData } from '../buttons/createTicket';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-ticket-options')
    .setDescription('send the buttons'),
  async execute(interaction: CommandInteraction) {
    const row = new MessageActionRow().addComponents(
      generateButtonData('General'),
    );
    await interaction.reply({
      content: 'Click for buttons',
      components: [row],
    });
  },
};
