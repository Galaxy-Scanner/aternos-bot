const mineflayer = require('mineflayer')

const config = {
  host: 'CrayCrim-SMP.aternos.me', // Server-IP
  port: 25565,
  username: 'FüßeLutscher100.0',
  version: '1.21.5',
  auth: 'offline' // wichtig für Aternos cracked
}

let bot

function startBot() {
  bot = mineflayer.createBot(config)

  // =============================
  // JOIN
  // =============================
  bot.on('spawn', () => {
    console.log('✅ Bot ist gespawnt!')
    startRandomMovement()
  })

  bot.on('login', () => {
    console.log('✅ Eingeloggt')
  })

  // =============================
  // RANDOM MOVEMENT
  // =============================
  function startRandomMovement() {
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

    }, 3000) // alle 3 Sekunden neue Bewegung
  }

  // =============================
  // FEHLER / RECONNECT
  // =============================
  bot.on('end', () => {
    console.log('🔌 Verbindung verloren')
    reconnect()
  })

  bot.on('kicked', (reason) => {
    console.log('❌ Kick:', reason)
    reconnect()
  })

  bot.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
      console.log('🔌 Verbindung kurz verloren (normal)')
    } else {
      console.log('⚠️ Fehler:', err.message)
    }
  })
}

function reconnect() {
  console.log('🔄 Reconnect in 5 Sekunden...')
  setTimeout(startBot, 5000)
}

// Bot starten
startBot()
