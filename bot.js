const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin

const PASSWORD = "DeinPasswort123"

function createBot() {

  const bot = mineflayer.createBot({
    host: 'CrayCrim-SMP.aternos.me',
    port: 25565,
    username: 'RandomBot',
    version: '1.21.5',
    auth: 'offline'
  })

  bot.loadPlugin(pvp)

  // =====================
  // LOGIN / REGISTER
  // =====================
  bot.on('messagestr', (msg) => {
    const m = msg.toLowerCase()

    if (m.includes('/register')) {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
    }

    if (m.includes('/login')) {
      bot.chat(`/login ${PASSWORD}`)
    }
  })

  // =====================
  // SPAWN
  // =====================
  bot.on('spawn', () => {
    console.log("✅ Bot gespawnt")

    setTimeout(() => {
      startAI(bot)
    }, 5000)
  })

  // =====================
  // PVP + MOVEMENT AI
  // =====================
  function startAI(bot) {

    setInterval(() => {

      if (!bot.entity) return

      // Ziel suchen (Spieler oder Mob)
      const target = bot.nearestEntity(entity =>
        entity.type === 'player' && entity.username !== bot.username ||
        entity.type === 'mob'
      )

      if (!target) {
        bot.clearControlStates()
        randomLook(bot)
        return
      }

      // Gegner anschauen (Tracking)
      bot.lookAt(target.position.offset(0, 1.5, 0), true)

      const distance = bot.entity.position.distanceTo(target.position)

      // Strafing Bewegung
      bot.setControlState('forward', distance > 2)

      if (Math.random() < 0.5) {
        bot.setControlState('left', true)
        bot.setControlState('right', false)
      } else {
        bot.setControlState('right', true)
        bot.setControlState('left', false)
      }

      // Sprint
      bot.setControlState('sprint', true)

      // Crit Hit (springen beim Angriff)
      if (distance < 3) {
        bot.setControlState('jump', true)
        setTimeout(() => bot.setControlState('jump', false), 250)
        bot.pvp.attack(target)
      }

    }, 700)
  }

  function randomLook(bot) {
    const yaw = Math.random() * Math.PI * 2
    const pitch = (Math.random() - 0.5) * 0.6
    bot.look(yaw, pitch, true)
  }

  // =====================
  // RECONNECT SYSTEM
  // =====================
  bot.on('end', () => {
    console.log("🔌 Disconnect → reconnect in 5s")
    setTimeout(createBot, 5000)
  })

  bot.on('error', err => {
    console.log("⚠️", err.message)
  })
}

createBot()


