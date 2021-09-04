// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js'
import { token } from './config.json'

// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
})

// When the client is ready
client.once('ready', () => {
  console.log('Ready!')
})
// Prefix bc of course dummy
const prefix = '!'
// Ping Message with comeback and Latency
client.on('message', function (message) {
  if (message.author.bot) return
  if (!message.content.startsWith(prefix)) return

  const commandBody = message.content.slice(prefix.length)
  console.log(commandBody)
  const args = commandBody.split(' ')
  const commandName = args.shift()
  if (!commandName) {
    return
  }
  const command = commandName.toLowerCase()

  if (command === 'ping') {
    const timeTaken = Date.now() - message.createdTimestamp
    message.reply(`Pong! This message had a latency of ${timeTaken}ms.`)
  }
})

// Login to Discord with client's token
client.login(token)
