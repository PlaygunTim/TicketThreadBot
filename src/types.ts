import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonStyle } from 'discord-api-types';
import {
  CommandInteraction,
  ButtonInteraction,
  MessageButton,
  MessageButtonStyle,
} from 'discord.js';

interface StoredCommand {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<unknown>;
}

interface StoredButton {
  generateButtonData: (ticketType: string) => MessageButton;
  baseArg: string;
  guildOnly: boolean;
  execute: ({}: ButtonOptions) => Promise<unknown>;
}
interface ButtonOptions {
  interaction: ButtonInteraction;
  extraArg: string;
}

interface TicketConfig {
  name: string;
  message: string;
  style: MessageButtonStyle;
}

export { StoredCommand, StoredButton, ButtonOptions, TicketConfig };
