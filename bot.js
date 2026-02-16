const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'CrayCrim-SMP.aternos.me',
  port: 25565,
  username: 'RandomBot',
  version: '1.21.5',
  auth: 'offline' // wichtig für Aternos cracked
})

bot.on('spawn', () => {
  console.log('✅ Bot gespawnt')
  randomMovement()
})

function randomMovement() {
  setInterval(() => {
    if (!bot.entity) return

    // alles stoppen
    bot.setControlState('forward', false)
    bot.setControlState('back', false)
    bot.setControlState('left', false)
    bot.setControlState('right', false)
    bot.setControlState('jump', false)
    bot.setControlState('sprint', false)

    // zufällige Richtung wählen
    const moves = ['forward', 'back', 'left', 'right']
    const move = moves[Math.floor(Math.random() * moves.length)]
    bot.setControlState(move, true)

    // manchmal springen
    if (Math.random() < 0.4) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 400)
    }

    // manchmal sprinten
    if (Math.random() < 0.3) {
      bot.setControlState('sprint', true)
      setTimeout(() => bot.setControlState('sprint', false), 2000)
    }

    // zufällig schauen
    const yaw = Math.random() * Math.PI * 2
    const pitch = (Math.random() - 0.5) * 0.6
    bot.look(yaw, pitch, true)
  }, 3000)
}

// reconnect bei kick oder disconnect
bot.on('end', () => {
  console.log('🔌 Verbindung verloren, reconnect...')
  setTimeout(() => bot.connect(bot.options), 5000)
})

bot.on('kicked', (reason) => {
  console.log('❌ Kick:', reason, 'reconnect...')
  setTimeout(() => bot.connect(bot.options), 5000)
})

