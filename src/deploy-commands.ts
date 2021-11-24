/*
This file is to deploy / register application commands to discord
It's here so we don't have to make custom http requests, and it gathers data from the ./commands directory
*/

import { REST } from '@discordjs/rest';
import {
  APIApplicationCommandPermission,
  RESTPutAPIApplicationGuildCommandsResult,
  Routes,
} from 'discord-api-types/v9';
import { clientId, guildId, token } from './config.json';
import fs from 'fs';
import { StoredCommand } from './types';
import { Snowflake } from 'discord.js';
const buildDir = 'dist'; // The build directory

const commandData = [];
const permissionCommands: Record<string, APIApplicationCommandPermission[]> =
  {};
const commandFiles = fs
  .readdirSync(`./${buildDir}/commands`)
  .filter((file) => file.endsWith('.js')); // js instead of ts because the file is read after files are built

for (const file of commandFiles) {
  const command = require(`./commands/${file}`) as StoredCommand; // eslint-disable-line @typescript-eslint/no-var-requires

  const commandJSONData = command.data.toJSON();
  commandData.push(commandJSONData);
  if (command.permissions) {
    permissionCommands[commandJSONData.name] = command.permissions;
  }
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  let commandResponse;
  try {
    commandResponse = (await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      {
        body: commandData,
      },
    )) as RESTPutAPIApplicationGuildCommandsResult;
    console.log(
      `Successfully registered application commands to the guild ${guildId}`,
    );
  } catch (error) {
    console.error(error);
  }
  const idMap: Record<string, Snowflake> = {};
  commandResponse?.forEach((command) => {
    idMap[command.name] = command.id;
  });
  Object.entries(permissionCommands).forEach(
    async ([commandName, permissions]) => {
      try {
        const id = idMap[commandName];

        await rest.put(
          Routes.applicationCommandPermissions(clientId, guildId, id),
          {
            body: { permissions },
          },
        );
      } catch (error) {
        console.error(error);
      }
      console.log(
        `Successfully registered permissions for the command ${commandName} on guild ${guildId}`,
      );
    },
  );
})();
