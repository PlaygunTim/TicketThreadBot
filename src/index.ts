// Require the necessary discord.js classes
import { Client, Intents, Collection } from 'discord.js';
import { token } from './config.json';
import fs from 'fs';
import { StoredCommand } from './types';
const buildDir = 'dist'; // The build directory

/* Parse the ./commands directory for commands
Each file should have an export in the format of StoredCommand */

const commands: Collection<string, StoredCommand> = new Collection();

const commandFiles = fs
  .readdirSync(`./${buildDir}/commands`)
  .filter((file) => file.endsWith('.js')); // js instead of ts because the file is read after files are built

for (const file of commandFiles) {
  const command = require(`./commands/${file}`) as StoredCommand;
  // With the key as the command name and the value as the exported module
  commands.set(command.data.name, command);
}

const client = new Client({
  intents: [Intents.FLAGS.GUILDS], // The guild intent is required to maintain a guild cache
});

client.once('ready', () => {
  console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: 'That command could not be found!',
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error: any) {
    console.error(error);
    await interaction.reply({
      content: `There was an error while executing this command!\nError: ${error.message}`,
      ephemeral: true,
    });
  }
});

// Login to Discord with client's token
client.login(token);
