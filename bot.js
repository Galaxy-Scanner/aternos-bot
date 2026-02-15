const mineflayer = require('mineflayer')

function startBot() {

  const bot = mineflayer.createBot({
    host: 'CrayCrim-SMP.aternos.me',
    port: 25565,
    username: 'AFK_Bot',
    auth: 'offline',
    version: '1.20.4',
    checkTimeoutInterval: 60 * 1000
  })

  bot.on('login', () => {
    console.log('✅ Eingeloggt')
  })

  bot.on('spawn', () => {
    console.log('✅ Bot ist gespawnt!')

    // leichte Bewegung gegen AFK
    setInterval(() => {
      bot.look(bot.entity.yaw + 0.5, 0, true)
      bot.setControlState('jump', true)

      setTimeout(() => {
        bot.setControlState('jump', false)
      }, 500)

    }, 25000)
  })

  bot.on('kicked', (reason) => {
    console.log('❌ Kick Grund:', reason)
  })

  bot.on('error', (err) => {
    console.log('⚠️ Fehler:', err.message)
  })

  bot.on('end', () => {
    console.log('🔄 Reconnect...')
    setTimeout(startBot, 7000)
  })
}

startBot()
