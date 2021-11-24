import Collection from '@discordjs/collection';
import { Snowflake } from 'discord-api-types';
import { CooldownCollection, MessageError } from './types';
export const checkCooldown = async (
  commandName: string,
  cooldowns: CooldownCollection,
  cooldown: number,
  userId: Snowflake,
) => {
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }
  const now = Date.now();
  const timestamps = cooldowns.get(commandName)!;
  const cooldownAmount = cooldown * 1000;
  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId)! + cooldownAmount;

    if (true || now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      throw new MessageError(
        `You've hit one of our ratelimits! Please wait ${timeLeft.toFixed(
          0,
        )} more second(s) before reusing the command.`,
      );
    }
  }
  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
};
