import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  ButtonInteraction,
  MessageButton,
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

export { StoredCommand, StoredButton, ButtonOptions };
