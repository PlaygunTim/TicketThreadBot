# Thread Ticket Bot

A discord ticket bot that works off threads

## License

This project is licensed under the MIT license

## Installation

Node.js version 16.6 or greater is required  
Clone the repo, copy `config.example.json` to `config.json` and fill in the `token` with the token of the bot.  
Run `npm run build` to build to `dist/index.js` and `npm start` to run.  
`npm run go` will build and run

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
