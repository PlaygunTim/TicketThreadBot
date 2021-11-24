# Thread Ticket Bot

A discord ticket bot that works off threads

## License

This project is licensed under the MIT license

## Installation

Node.js version 16.6 or greater is required  
Clone the repo, copy `config.example.json` to `config.json` and fill in the config with the options specified in configuration.  
Run `npm install` to install dependencies

## Configuration

Fill out `config.json` with the require config:

| Field               | Type   | Value               | Description                                                                                                                | Required | Default |
| :------------------ | :----- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- | :------- | ------- |
| token               | string | Discord Bot Token   | This is the discord bot token.                                                                                             | Yes      | `""`    |
| clientId            | string | Id of the bot       | Used to register application commands                                                                                      | Yes      | `""`    |
| guildId             | string | Id of testing guild | This is the guild that application commands will be registered to. Leave it as `null` to register them on the global scope | Yes      | `""`    |
| modRoleId           | string | Mod role id         | This is the role that the slash commands will be restricted to                                                             | Yes      | `""`    |
| barredRoleId        | string | Id of barred role   | Anyone with the role will not be able to create a ticket                                                                   | Yes      | `""`    |
| barredMessage       | string | String              | The response if someone that has been barred tried to make a ticket                                                        | Yes      | `""`    |
| generatedTicketType | string | Ticket type         | The ticket type to store in the database for tickets created with /ticket create                                           | Yes      | `""`    |
| generatedMessage    | string | string              | Message to send when a generated ticket is created                                                                         | Yes      | `""`    |
| lockTime            | number | seconds             | Number of seconds to wait before locking a ticket                                                                          | Yes      | `""`    |
| buttonsMessage      | string | string              | Message to send with the buttons                                                                                           | Yes      | `""`    |
| ticketChannelId     | string | Id of channel       | Channel to create tickets in                                                                                               | Yes      | `""`    |
| autoArchiveDuration | number | number of minutes   | What to set the auto archive duration of the thread to. Must be set to predefined values by discord (check thread docs)    | Yes      | `""`    |

You'll also need a postgresql instance running and set the uri in `.env` (see `.env.example` for an example)

## Running

Run `npm run build` to build to `dist/index.js` and `npm start` to run.  
`npm run go` will build and run

To deploy the slash commands run `npm run go:deploy`. - This only needs to be done once and after commands are updated

To deploy to a production environment use `docker-compose up`

## Code Style

- Run prettier with `npm run format`
- Run linting with `npm run lint`

If you use vscode I suggest you install the [prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), and add this to your workspace's `settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```
