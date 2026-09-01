const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: 'OtraCosa.aternos.me', // Cambia a la IP de tu servidor si es externo
  port: 25565,       // Cambia el puerto si es necesario
  username: 'DangerBot01', // Nombre de usuario del bot
  // version: '1.21' // Descomenta y ajusta si necesitas forzar una versión específica
});

bot.on('spawn', () => {
  console.log('¡El bot ha aparecido en el juego!');
  bot.chat('¡Hola a todos! Soy un bot creado con Mineflayer.');
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  bot.chat(`Interesante, ${username}: ${message}`);
});

bot.on('error', (err) => console.log(err));
bot.on('kicked', (reason) => console.log(`Expulsado por: ${reason}`));

