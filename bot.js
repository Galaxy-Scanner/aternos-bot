const mineflayer = require('mineflayer')

const PASSWORD = "DeinPasswort123" // <<< HIER ÄNDERN

function createBot() {

  const bot = mineflayer.createBot({
    host: 'CrayCrim-SMP.aternos.me',
    port: 25565,
    username: 'RandomBot',
    version: '1.21.5',
    auth: 'offline'
  })

  // ===============================
  // LOGIN / REGISTER SYSTEM
  // ===============================
  bot.on('messagestr', (msg) => {
    console.log(msg)

    const message = msg.toLowerCase()

    // erkennt Register Nachricht
    if (message.includes('/register')) {
      console.log("🔐 Registriere...")
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
    }

    // erkennt Login Nachricht
    if (message.includes('/login')) {
      console.log("🔑 Logge ein...")
      bot.chat(`/login ${PASSWORD}`)
    }
  })

  // ===============================
  // SPAWN
  // ===============================
  bot.on('spawn', () => {
    console.log('✅ Bot gespawnt')

    // kleine Wartezeit damit Login durch ist
    setTimeout(() => {
      randomMovement(bot)
    }, 5000)
  })

  // ===============================
  // RANDOM MOVEMENT
  // ===============================
  function randomMovement(bot) {
    setInterval(() => {
      if (!bot.entity) return

      // alles stoppen
      bot.clearControlStates()

      const moves = ['forward', 'back', 'left', 'right']
      const move = moves[Math.floor(Math.random() * moves.length)]
      bot.setControlState(move, true)

      // springen
      if (Math.random() < 0.4) {
        bot.setControlState('jump', true)
        setTimeout(() => bot.setControlState('jump', false), 400)
      }

      // sprint
      if (Math.random() < 0.3) {
        bot.setControlState('sprint', true)
        setTimeout(() => bot.setControlState('sprint', false), 2000)
      }

      // random schauen
      const yaw = Math.random() * Math.PI * 2
      const pitch = (Math.random() - 0.5) * 0.6
      bot.look(yaw, pitch, true)

    }, 3000)
  }

  // ===============================
  // RECONNECT SYSTEM
  // ===============================
  bot.on('end', () => {
    console.log('🔌 Disconnect → reconnect in 5s...')
    setTimeout(createBot, 5000)
  })

  bot.on('kicked', (reason) => {
    console.log('❌ Kick:', reason)
  })

  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message)
  })
}

createBot()


