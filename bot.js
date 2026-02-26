const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')

const PASSWORD = "DeinPasswort123"

function createBot() {

  const bot = mineflayer.createBot({
    host: 'CrayCrim-SMP.aternos.me',
    port: 25565,
    username: 'RandomBot',
    version: false, // WICHTIG → auto detect = weniger kicks
    auth: 'offline'
  })

  bot.loadPlugin(pathfinder)

  let target = null
  let lastAttack = 0
  let hurtPause = 0

  // ================= LOGIN =================
  bot.on('messagestr', msg => {
    const m = msg.toLowerCase()

    if (m.includes('/register'))
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)

    if (m.includes('/login'))
      bot.chat(`/login ${PASSWORD}`)
  })

  // ================= SPAWN =================
  bot.once('spawn', () => {
    console.log("✅ Bot gespawnt")

    const movements = new Movements(bot)
    bot.pathfinder.setMovements(movements)

    startKeepAlive()
    startPvP()
  })

  // ================= KEEP ALIVE FIX =================
  function startKeepAlive() {

    setInterval(() => {
      if (!bot.entity) return

      // mini head movement (ANTI TIMEOUT)
      bot.look(
        bot.entity.yaw + (Math.random()-0.5)*0.01,
        bot.entity.pitch,
        true
      )

      // mini movement packet
      bot.setControlState('forward', true)
      setTimeout(()=>bot.setControlState('forward', false),120)

    }, 2500)
  }

  // ================= TARGET FIND =================
  function getTarget() {

    let entities = Object.values(bot.entities)
      .filter(e =>
        e !== bot.entity &&
        (e.type === 'player' || e.type === 'mob')
      )

    if (!entities.length) return null

    return entities.sort((a,b)=>
      bot.entity.position.distanceTo(a.position) -
      bot.entity.position.distanceTo(b.position)
    )[0]
  }

  // ================= COOLDOWN =================
  function cooldown() {
    const item = bot.heldItem
    if (!item) return 600
    if (item.name.includes("axe")) return 1100
    if (item.name.includes("sword")) return 600
    return 600
  }

  // ================= PVP LOOP =================
  function startPvP() {

    setInterval(() => {

      if (!bot.entity) return

      if (!target || !target.position)
        target = getTarget()

      if (!target) return

      const dist = bot.entity.position.distanceTo(target.position)

      // smooth aim (KEIN aura snap)
      bot.lookAt(target.position.offset(0,1.5,0), false)

      // echtes Knockback erlauben
      if (Date.now() - hurtPause < 400) {
        bot.clearControlStates()
        return
      }

      // movement
      bot.setControlState('forward', dist > 2.5)

      // strafing
      bot.setControlState('left', Math.random() < 0.5)
      bot.setControlState('right', !bot.controlState.left)

      // W-tap
      if (Math.random() < 0.07) {
        bot.setControlState('forward', false)
        setTimeout(()=>bot.setControlState('forward', true),120)
      }

      // crit jump
      if (Math.random() < 0.1 && dist < 3)
        bot.setControlState('jump', true)
      else
        bot.setControlState('jump', false)

      // ATTACK
      if (dist < 3 && Date.now()-lastAttack > cooldown()) {
        bot.attack(target)
        lastAttack = Date.now()
      }

    }, 120)
  }

  // knockback detect
  bot.on('entityHurt', e=>{
    if(e === bot.entity)
      hurtPause = Date.now()
  })

  // ================= RECONNECT =================
  bot.on('end', () => {
    console.log("🔌 Reconnect in 5s...")
    setTimeout(createBot, 5000)
  })

  bot.on('error', err =>
    console.log("⚠️", err.message)
  )
}

createBot()
