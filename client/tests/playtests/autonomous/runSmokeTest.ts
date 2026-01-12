
import { SmokeTestBot } from './SmokeTestBot';

describe('Smoke Test Bot', () => {
  let bot: SmokeTestBot;

  beforeAll(async () => {
    bot = new SmokeTestBot();
    await bot.init();
  });

  it('should register and enter game', async () => {
    await bot.run();
  }, 60000); // 1 minute timeout
});
