const mineflayer = require('mineflayer')

function createBot() {

const bot = mineflayer.createBot({
  host: 'CrayCrim-SMP.aternos.me',
  port: 25565,
  username: 'CrayCrim-SMP-Training-Bot',
  version: '1.21.5'
})

/* =============================
   RECONNECT SYSTEM
============================= */

bot.on('end', () => {
  console.log('🔄 Reconnect in 5 Sekunden...')
  setTimeout(createBot, 5000)
})

bot.on('error', err => {
  if (err.code === 'ECONNRESET') {
    console.log('🔌 Verbindung kurz verloren (normal)')
    return
  }
  console.log('⚠️ Fehler:', err.message)
})

/* =============================
   SPAWN
============================= */

bot.once('spawn', () => {
  console.log('✅ Bot ist gespawnt!')

  // kurz warten → wirkt menschlich
  setTimeout(() => {
    randomMovement()
    watchPlayers()
    shieldAI()
  }, 8000)
})

/* =============================
   RANDOM MOVEMENT
============================= */

function randomMovement() {
  setInterval(() => {

    const actions = ['forward','back','left','right','jump','none']
    const action = actions[Math.floor(Math.random()*actions.length)]

    bot.clearControlStates()

    if(action !== 'none'){
      bot.setControlState(action,true)

      setTimeout(() => {
        bot.setControlState(action,false)
      }, 1500 + Math.random()*2000)
    }

  }, 4000)
}

/* =============================
   LOOK AT PLAYERS + WALK TO THEM
============================= */

function watchPlayers() {
  setInterval(() => {

    const player = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username)
    if(!player) return

    bot.lookAt(player.position.offset(0,1.6,0), true)

    const distance = bot.entity.position.distanceTo(player.position)

    // langsam hingehen
    if(distance > 3 && distance < 10){
      bot.setControlState('forward', true)

      setTimeout(()=>{
        bot.setControlState('forward', false)
      }, 1200)
    }

  }, 1500)
}

/* =============================
   AUTO SHIELD WHEN HIT
============================= */

function shieldAI() {

  bot.on('entityHurt', (entity) => {
    if(entity !== bot.entity) return

    console.log('🛡️ Angegriffen → Blocken!')

    bot.activateItem(true)

    setTimeout(()=>{
      bot.deactivateItem()
    }, 2000)
  })
}

/* =============================
   AUTO RESPAWN
============================= */

bot.on('death', () => {
  console.log('💀 Bot gestorben → Respawn...')
  setTimeout(() => bot.respawn(), 2000)
})

}

createBot()
