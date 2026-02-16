const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin

const config = {
  host: 'CrayCrim-SMP.aternos.me',
  port: 25565,
  username: 'DrDiddynut',
  version: '1.21.5',
  auth: 'offline'
}

let bot

function startBot() {

  bot = mineflayer.createBot(config)

  // PvP Plugin laden
  bot.loadPlugin(pvp)

  // =============================
  // JOIN
  // =============================
  bot.once('spawn', () => {
    console.log('✅ Bot gespawnt!')
    startRandomMovement()
    startCombatAI()
  })

  bot.on('login', () => {
    console.log('✅ Eingeloggt')
  })

  // =============================
  // RANDOM MOVEMENT (idle)
  // =============================
  function startRandomMovement() {
    setInterval(() => {

      if (bot.pvp.target) return // kämpft gerade

      const moves = ['forward','back','left','right']
      const move = moves[Math.floor(Math.random() * moves.length)]

      bot.clearControlStates()
      bot.setControlState(move, true)

      const yaw = Math.random() * Math.PI * 2
      const pitch = (Math.random() - 0.5) * 0.6
      bot.look(yaw, pitch, true)

    }, 3000)
  }

  // =============================
  // PVP + MOB KI
  // =============================
  function startCombatAI() {

    setInterval(() => {

      if (!bot.entity) return
      if (bot.pvp.target) return

      // nächster Spieler
      const player = bot.nearestEntity(e =>
        e.type === 'player' &&
        e.username !== bot.username
      )

      // nächster Mob
      const mob = bot.nearestEntity(e =>
        e.type === 'mob'
      )

      const target = player || mob

      if (target) {
        console.log("⚔️ Angriff auf:", target.username || target.name)
        bot.pvp.attack(target)
      }

    }, 1500)
  }

  // =============================
  // PvP Movement (Strafen)
  // =============================
  setInterval(() => {

    if (!bot.entity) return
    if (!bot.pvp.target) return

    const moves = ['left','right','forward']
    const move = moves[Math.floor(Math.random() * moves.length)]

    bot.clearControlStates()
    bot.setControlState(move, true)

    if (Math.random() < 0.4) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 300)
    }

  }, 800)

  // =============================
  // RECONNECT
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
    console.log('⚠️ Fehler:', err.message)
  })
}

function reconnect() {
  console.log('🔄 Reconnect in 5 Sekunden...')
  setTimeout(startBot, 5000)
}

startBot()

