const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

function createBot() {

  const bot = mineflayer.createBot({
    host: "CrayCrim-SMP.aternos.me",
    port: 25565,
    username: "RandomBot",
    version: false
  })

  // ✅ WICHTIG: Reihenfolge!
  bot.loadPlugin(pathfinder)
  bot.loadPlugin(pvp)

  bot.once('spawn', () => {
    console.log("✅ Bot gespawnt")

    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)

    bot.pathfinder.setMovements(defaultMove)
  })

  // ===== LOGIN (falls Crack Server) =====
  bot.on('messagestr', (msg) => {
    if (msg.includes("/login")) {
      bot.chat("/login deinpasswort")
    }
    if (msg.includes("/register")) {
      bot.chat("/register deinpasswort deinpasswort")
    }
  })

  // ===== AUTO PVP WENN GEHITTET =====
  bot.on('entityHurt', (entity) => {
    if (entity === bot.entity) {
      const player = bot.nearestEntity(e => e.type === 'player')
      if (player) {
        console.log("⚔️ Werde angegriffen!")
        bot.pvp.attack(player)
      }
    }
  })

  // ===== RECONNECT =====
  bot.on('end', () => {
    console.log("🔌 Disconnect → reconnect in 5s")
    setTimeout(createBot, 5000)
  })

  bot.on('error', console.log)
}

createBot()
