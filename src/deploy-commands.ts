/*
This file is to deploy / register application commands to discord
It's here so we don't have to make custom http requests, and it gathers data from the ./commands directory
*/

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { clientId, guildId, token } from './config.json';
import fs from 'fs';
import { StoredCommand } from './types';
const buildDir = 'dist'; // The build directory

const commands = [];
const commandFiles = fs
  .readdirSync(`./${buildDir}/commands`)
  .filter((file) => file.endsWith('.js')); // js instead of ts because the file is read after files are built

for (const file of commandFiles) {
  const command = require(`./commands/${file}`) as StoredCommand; // eslint-disable-line @typescript-eslint/no-var-requires
  commands.push(command.data.toJSON());
}
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      });
      console.log(
        `Successfully registered application commands to the guild ${guildId}`,
      );
    } else {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log(
        'Successfully registered application commands to the global scope',
      );
    }
  } catch (error) {
    console.error(error);
  }
})();
