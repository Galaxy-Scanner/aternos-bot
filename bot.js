const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin

const config = {
  host: 'CrayCrim-SMP.aternos.me',
  port: 25565,
  username: 'CrayCrim-AFK-BOT',
  version: '1.21.5',
  auth: 'offline'
}

let bot

function startBot() {

  bot = mineflayer.createBot(config)

  bot.loadPlugin(pathfinder)
  bot.loadPlugin(pvp)

  bot.once('spawn', () => {
    console.log("✅ Bot gespawnt")

    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)

    startBrain()
  })

  // ==========================
  // PvP KI
  // ==========================
  function startBrain() {

    setInterval(() => {

      if (!bot.entity) return

      // nächsten Spieler suchen
      const player = getClosestPlayer()

      if (!player) return

      const target = player.entity

      // legit anschauen (SEHR wichtig für Grim)
      bot.lookAt(target.position.offset(0, 1.5, 0), true)

      const distance = bot.entity.position.distanceTo(target.position)

      // hinterherlaufen
      if (distance > 3) {
        bot.pathfinder.setGoal(
          new goals.GoalFollow(target, 2),
          true
        )
      }

      // angreifen wenn nah
      if (distance <= 3.2) {
        bot.pvp.attack(target)
      }

      // strafing movement (spieler-like)
      randomStrafe()

    }, 800)
  }

  function getClosestPlayer() {
    let closest = null
    let minDist = Infinity

    for (const name in bot.players) {
      if (name === bot.username) continue

      const player = bot.players[name]
      if (!player.entity) continue

      const dist = bot.entity.position.distanceTo(player.entity.position)

      if (dist < minDist) {
        minDist = dist
        closest = player
      }
    }
    return closest
  }

  // seitlich bewegen wie echter PvP Spieler
  function randomStrafe() {
    const r = Math.random()

    bot.setControlState('left', false)
    bot.setControlState('right', false)

    if (r < 0.3) bot.setControlState('left', true)
    else if (r < 0.6) bot.setControlState('right', true)

    if (Math.random() < 0.25) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 250)
    }
  }

  // ==========================
  // Reconnect System
  // ==========================
  bot.on('end', reconnect)

  bot.on('kicked', (r) => {
    console.log("❌ Kick:", r)
    reconnect()
  })

  bot.on('error', (err) => {
    if (err.code !== 'ECONNRESET')
      console.log("⚠️", err)
  })
}

function reconnect() {
  console.log("🔄 Reconnect in 5 Sekunden...")
  setTimeout(startBot, 5000)
}

startBot()
