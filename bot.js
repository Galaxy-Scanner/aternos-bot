const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin

const config = {
  host: 'CrayCrim-SMP.aternos.me',
  port: 25565,
  username: 'GrimTrainingBot',
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
    bot.pathfinder.setMovements(new Movements(bot, mcData))

    startAI()
  })

  // ================= AI =================

  function startAI() {
    setInterval(() => {

      if (!bot.entity) return

      // 1️⃣ Spieler suchen
      let target = getClosestPlayer()

      // 2️⃣ Wenn kein Spieler → Mob suchen
      if (!target) {
        target = getClosestMob()
      }

      if (!target) return

      fightTarget(target)

    }, 900)
  }

  // ---------- Kampf ----------
  function fightTarget(target) {

    const distance =
      bot.entity.position.distanceTo(target.position)

    // legit anschauen
    bot.lookAt(target.position.offset(0, 1.5, 0), true)

    // folgen
    if (distance > 3) {
      bot.pathfinder.setGoal(
        new goals.GoalFollow(target, 2),
        true
      )
    }

    // schlagen
    if (distance <= 3.2) {
      bot.pvp.attack(target)
    }

    randomMovement()
  }

  // ---------- Spieler ----------
  function getClosestPlayer() {
    let closest = null
    let dist = Infinity

    for (const name in bot.players) {
      if (name === bot.username) continue

      const p = bot.players[name]
      if (!p.entity) continue

      const d = bot.entity.position.distanceTo(p.entity.position)

      if (d < dist) {
        dist = d
        closest = p.entity
      }
    }
    return closest
  }

  // ---------- Mobs ----------
  function getClosestMob() {

    const mobs = bot.entities

    let closest = null
    let dist = Infinity

    for (const id in mobs) {
      const e = mobs[id]

      if (e.type !== 'mob') continue

      const d = bot.entity.position.distanceTo(e.position)

      if (d < dist && d < 15) {
        dist = d
        closest = e
      }
    }
    return closest
  }

  // ---------- Movement ----------
  function randomMovement() {

    bot.setControlState('left', false)
    bot.setControlState('right', false)

    const r = Math.random()

    if (r < 0.3) bot.setControlState('left', true)
    else if (r < 0.6) bot.setControlState('right', true)

    if (Math.random() < 0.25) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 250)
    }
  }

  // ================= reconnect =================

  bot.on('end', reconnect)

  bot.on('kicked', (r) => {
    console.log("❌ Kick:", r)
    reconnect()
  })

  bot.on('error', (err) => {
    if (err.code !== 'ECONNRESET')
      console.log(err)
  })
}

function reconnect() {
  console.log("🔄 Reconnect...")
  setTimeout(startBot, 5000)
}

startBot()
