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

| Field    | Type   | Value               | Description                                                                                                                | Required | Default |
| :------- | :----- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- | :------- | ------- |
| token    | string | Discord Bot Token   | This is the discord bot token.                                                                                             | Yes      | `""`    |
| clientId | string | Id of the bot       | Used to register application commands                                                                                      | Yes      | `""`    |
| guildId  | string | Id of testing guild | This is the guild that application commands will be registered to. Leave it as `null` to register them on the global scope | No       | `null`  |

## Running

Run `npm run build` to build to `dist/index.js` and `npm start` to run.  
`npm run go` will build and run

To deploy the slash commands run `npm run go:deploy`. - This only needs to be done once and after commands are updated

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
