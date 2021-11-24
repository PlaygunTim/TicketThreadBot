import { SlashCommandBuilder } from '@discordjs/builders';
import {
  APIApplicationCommandPermission,
  ButtonStyle,
  Snowflake,
} from 'discord-api-types/v9';
import {
  CommandInteraction,
  ButtonInteraction,
  MessageButton,
  MessageButtonStyle,
  Collection,
} from 'discord.js';

type InteractionCooldown = Collection<Snowflake, number>;
type CooldownCollection = Collection<string, InteractionCooldown>;
type CooldownsType = {
  buttons: CooldownCollection;
  commands: CooldownCollection;
};

class MessageError extends Error {
  internal = true;
}

interface StoredCommand {
  data: any; // Got confused with options
  cooldown?: number;
  guildOnly: boolean;
  permissions?: APIApplicationCommandPermission[];
  execute: (interaction: CommandInteraction) => Promise<unknown>;
}

interface StoredButton {
  generateButtonData: (ticketType: string) => MessageButton;
  baseArg: string;
  guildOnly: boolean;
  cooldown?: number;
  execute: ({}: ButtonOptions) => Promise<unknown>;
}
interface ButtonOptions {
  interaction: ButtonInteraction;
  ticketType: string;
}

interface TicketConfig {
  name: string;
  message: string;
  style: MessageButtonStyle;
}

export {
  StoredCommand,
  StoredButton,
  ButtonOptions,
  TicketConfig,
  CooldownsType,
  CooldownCollection,
  MessageError,
};
