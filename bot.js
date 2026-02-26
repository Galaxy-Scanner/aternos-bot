const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')

const PASSWORD = "DeinPasswort123"

function createBot() {

  const bot = mineflayer.createBot({
    host: 'CrayCrim-SMP.aternos.me',
    port: 25565,
    username: 'RandomBot',
    version: '1.21.5',
    auth: 'offline'
  })

  bot.loadPlugin(pathfinder)

  let target = null
  let lastAttack = 0
  let hurtTime = 0

  // ================= LOGIN =================
  bot.on('messagestr', (msg) => {
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

    // Anti timeout (SEHR wichtig)
    setInterval(() => {
      if (!bot.entity) return
      bot.look(
        bot.entity.yaw + (Math.random() - 0.5) * 0.02,
        bot.entity.pitch,
        true
      )
    }, 4000)
  })

  // ================= TARGET FINDER =================
  function getTarget() {

    const players = Object.values(bot.players)
      .filter(p => p.entity && p.username !== bot.username)
      .map(p => p.entity)

    const mobs = Object.values(bot.entities)
      .filter(e => e.type === 'mob')

    const all = [...players, ...mobs]
    if (all.length === 0) return null

    return all.sort((a,b)=>
      bot.entity.position.distanceTo(a.position) -
      bot.entity.position.distanceTo(b.position)
    )[0]
  }

  // ================= DAMAGE (ECHTES KB) =================
  bot.on('entityHurt', (e) => {
    if (e === bot.entity) {
      hurtTime = Date.now()
      target = getTarget()
    }
  })

  // ================= WEAPON COOLDOWN =================
  function getCooldown() {
    const item = bot.heldItem
    if (!item) return 500

    if (item.name.includes("axe")) return 1100
    if (item.name.includes("sword")) return 600

    return 500
  }

  function canHit() {
    return Date.now() - lastAttack > getCooldown()
  }

  // ================= LOOK CHECK =================
  function lookingAt(entity) {
    const dir = entity.position.minus(bot.entity.position).normalize()

    const yaw = bot.entity.yaw
    const viewX = Math.sin(yaw)
    const viewZ = Math.cos(yaw)

    const dot = viewX * dir.x + viewZ * dir.z
    return dot > 0.82 // muss wirklich schauen
  }

  // ================= MAIN PVP LOOP =================
  bot.on('physicsTick', () => {

    if (!bot.entity) return

    if (!target || !target.position)
      target = getTarget()

    if (!target) return

    const dist = bot.entity.position.distanceTo(target.position)

    // echtes Tracking (kein Snap)
    bot.lookAt(target.position.offset(0,1.5,0), false)

    // Knockback Pause (kein AntiKB)
    if (Date.now() - hurtTime < 450) {
      bot.clearControlStates()
      return
    }

    // Movement
    bot.setControlState('forward', dist > 2.7)

    // Strafing (menschlich)
    bot.setControlState('left', Math.random() < 0.5)
    bot.setControlState('right', !bot.controlState.left)

    // W-Tap
    if (Math.random() < 0.05) {
      bot.setControlState('forward', false)
      setTimeout(()=>bot.setControlState('forward', true),120)
    }

    // Crit Jump manchmal
    if (Math.random() < 0.08 && dist < 3)
      bot.setControlState('jump', true)
    else
      bot.setControlState('jump', false)

    // Angriff
    if (dist < 3 && lookingAt(target) && canHit()) {
      bot.attack(target)
      lastAttack = Date.now()
    }
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
