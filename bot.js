const mineflayer = require('mineflayer')

function startBot() {

  const bot = mineflayer.createBot({
    host: 'CrayCrim-SMP.aternos.me',
    username: 'AFK_Bot',
    version: false,
    auth: 'offline'
  })

  bot.on('spawn', () => {
    console.log('✅ Bot ist gespawnt!')

    randomMovement()
    shieldLoop()
  })

  // ---------------------------
  // REALISTISCHE BEWEGUNG
  // ---------------------------
  function randomMovement() {

    setInterval(() => {

      // alte Bewegung stoppen
      bot.clearControlStates()

      const actions = ['forward','back','left','right','jump','idle']
      const action = actions[Math.floor(Math.random()*actions.length)]

      if (action !== 'idle') {
        bot.setControlState(action, true)
      }

      // zufällig schauen (wie echter Spieler)
      const yaw = Math.random() * Math.PI * 2
      const pitch = (Math.random() - 0.5) * 0.6
      bot.look(yaw, pitch, true)

      // Bewegung nach kurzer Zeit stoppen
      setTimeout(() => {
        bot.clearControlStates()
      }, 2000 + Math.random()*2000)

    }, 4000)
  }

  // ---------------------------
  // SCHILD BENUTZEN
  // ---------------------------
  function shieldLoop() {

    setInterval(() => {
      try {
        bot.activateItem() // Schild hoch
        setTimeout(() => bot.deactivateItem(), 1500)
      } catch {}
    }, 3000)
  }

  // reconnect wenn kick
  bot.on('end', () => {
    console.log('🔄 Reconnect...')
    setTimeout(startBot, 5000)
  })

  bot.on('error', err => {
    console.log('⚠️ Fehler:', err.message)
  })
}

startBot()

