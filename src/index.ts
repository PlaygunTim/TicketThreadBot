// Require the necessary discord.js classes
import {
  Client,
  Intents,
  Collection,
  MessageComponentInteraction,
  CommandInteraction,
} from 'discord.js';
import { token } from './config.json';
import fs from 'fs';
import {
  StoredButton,
  StoredCommand,
  CooldownsType,
  MessageError,
} from './types';
import { Snowflake } from 'discord-api-types/v9';
import { checkCooldown } from './cooldowns';
const buildDir = 'dist'; // The build directory

/* Parse the ./commands directory for commands
Each file should have an export in the format of StoredCommand */

const commands: Collection<string, StoredCommand> = new Collection();
const buttons: Collection<string, StoredButton> = new Collection();
const cooldowns: CooldownsType = {
  commands: new Collection(),
  buttons: new Collection(),
};

const commandFiles = fs
  .readdirSync(`./${buildDir}/commands`)
  .filter((file) => file.endsWith('.js')); // js instead of ts because the file is read after files are built

for (const file of commandFiles) {
  const command = require(`./commands/${file}`) as StoredCommand; // eslint-disable-line @typescript-eslint/no-var-requires
  // With the key as the command name and the value as the exported module
  commands.set(command.data.name, command);
}

const buttonFiles = fs
  .readdirSync(`./${buildDir}/buttons`)
  .filter((file) => file.endsWith('.js')); // js instead of ts because the file is read after files are built

for (const file of buttonFiles) {
  const button = require(`./buttons/${file}`) as StoredButton; // eslint-disable-line @typescript-eslint/no-var-requires
  // With the key as the command name and the value as the exported module
  buttons.set(button.baseArg, button);
}

const client = new Client({
  intents: [Intents.FLAGS.GUILDS], // The guild intent is required to maintain a guild cache
});

client.once('ready', () => {
  console.log('Ready!');
});

const handleInteractionError = async (
  interaction: MessageComponentInteraction | CommandInteraction,
  error: Error | MessageError,
) => {
  let message: string;
  if ('internal' in error) {
    message = error.message;
  } else {
    // If is MessageError then this is used to send an expected error to the user
    console.error(error);
    message = `There was an error while executing this interaction!\nError: ${error.message}`;
  }
  /* If the interaction is in a deferred loading state it will be "deferred" but not "replied" and so update the loading message
    If the interaction is not deferred or replied to then reply to it
    Otherwise the interaction has been replied to so send a followup
  */
  if (interaction.deferred && !interaction.replied) {
    await interaction.editReply({
      content: message,
    });
  } else if (!interaction.replied) {
    await interaction.reply({
      content: message,
      ephemeral: true,
    });
  } else {
    await interaction.followUp({
      content: message,
      ephemeral: true,
    });
  }
};

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const command = commands.get(interaction.commandName);

    if (!command) {
      await interaction.reply({
        content: 'That command could not be found!',
        ephemeral: true,
      });
      return;
    }
    try {
      if (command.cooldown) {
        await checkCooldown(
          interaction.commandName,
          cooldowns.commands,
          command.cooldown,
          interaction.user.id,
        );
      }
      await command.execute(interaction);
    } catch (error) {
      await handleInteractionError(interaction, error as Error);
    }
  } else if (interaction.isButton()) {
    /* 
    Each button's custom_id will be in the format of `${action-type}:${extra-info}
    For example for creating a ticket `create-ticket:${ticket-type}`
    */
    const [action, extraArg] = interaction.customId.split(':');
    const button = buttons.get(action);
    if (!action || !button) {
      await interaction.reply({
        content: 'That button was invalid!',
        ephemeral: true,
      });
      return;
    }

    if (button.guildOnly && !interaction.guildId) {
      await interaction.reply({
        content: 'That button can only be used in a guild!',
        ephemeral: true,
      });
      return;
    }

    try {
      if (button.cooldown) {
        await checkCooldown(
          `${interaction.guildId}-${interaction.message.id}-${interaction.customId}`,
          cooldowns.buttons,
          button.cooldown,
          interaction.user.id,
        );
      }
      await button.execute({ interaction, extraArg });
    } catch (error) {
      await handleInteractionError(interaction, error as Error);
    }
  }
});

// Login to Discord with client's token
client.login(token);
