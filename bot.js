const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const { pathfinder, Movements } = require('mineflayer-pathfinder')

const bot = mineflayer.createBot({
  host: 'CrayCrim-SMP.aternos.me',
  port: 25565,
  username: 'RandomBoto7',
  version: false
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)

let registered = false

bot.once('spawn', () => {
  console.log('✅ Bot gespawnt')

  const mcData = require('minecraft-data')(bot.version)
  const movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)

  // LoginSecurity
  setTimeout(() => {
    if (!registered) {
      bot.chat('/register 123456 123456')
      registered = true
    } else {
      bot.chat('/login 123456')
    }
  }, 3000)
})

/*
   ==========================
   🧠 PvP KI SYSTEM
   ==========================
*/

function getNearestPlayer() {
  const players = Object.values(bot.players)
    .filter(p => p.entity && p.username !== bot.username)

  if (players.length === 0) return null

  players.sort((a, b) =>
    bot.entity.position.distanceTo(a.entity.position) -
    bot.entity.position.distanceTo(b.entity.position)
  )

  return players[0].entity
}

let target = null

bot.on('entityHurt', (entity) => {
  if (entity === bot.entity) {
    target = getNearestPlayer()
    if (target) {
      console.log('⚔️ Gegner erkannt:', target.username)
      bot.pvp.attack(target)
    }
  }
})

/*
   Strafing Movement + Tracking
*/
bot.on('physicsTick', () => {
  if (!target) return
  if (!target.position) return

  bot.lookAt(target.position.offset(0, 1.6, 0), true)

  const dist = bot.entity.position.distanceTo(target.position)

  // Strafing wie echter Spieler
  if (dist < 3) {
    bot.setControlState('left', true)
    bot.setControlState('right', false)
  } else {
    bot.setControlState('left', false)
    bot.setControlState('right', true)
  }

  // Crit Hits (springen beim Angriff)
  if (bot.entity.onGround && dist < 3.5) {
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 200)
  }
})

bot.on('death', () => {
  target = null
})

bot.on('end', () => {
  console.log('🔌 Disconnect → reconnect in 5s...')
  setTimeout(() => process.exit(0), 5000)
})
