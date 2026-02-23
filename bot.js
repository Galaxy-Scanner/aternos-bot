const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

const PASSWORD = "DeinPasswort123"

function createBot() {

const bot = mineflayer.createBot({
  host: 'CrayCrim-SMP.aternos.me',
  port: 25565,
  username: 'RandomBoto7',
  version: '1.21.5',
  auth: 'offline'
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)

let defaultMove
let target = null
let lastAttack = 0
let knockbackPause = false

/* ================= LOGIN ================= */

bot.on('messagestr', (msg) => {
  const m = msg.toLowerCase()

  if (m.includes('/register'))
    bot.chat(`/register ${PASSWORD} ${PASSWORD}`)

  if (m.includes('/login'))
    bot.chat(`/login ${PASSWORD}`)
})

/* ================= SPAWN ================= */

bot.once('spawn', () => {
  console.log("✅ Bot gespawnt")

  defaultMove = new Movements(bot)
  bot.pathfinder.setMovements(defaultMove)

  setInterval(randomLook, 2500)
})

/* ================= HUMAN LOOK ================= */

function randomLook() {
  if (!bot.entity) return

  const yaw = bot.entity.yaw + (Math.random()-0.5)*0.4
  const pitch = (Math.random()-0.5)*0.2

  bot.look(yaw, pitch, true)
}

/* ================= TARGET FIND ================= */

function getNearestTarget() {

  const players = Object.values(bot.players)
    .filter(p => p.entity && p.username !== bot.username)

  const mobs = Object.values(bot.entities)
    .filter(e => e.type === 'mob')

  const all = [
    ...players.map(p=>p.entity),
    ...mobs
  ]

  if (!all.length) return null

  all.sort((a,b)=>
    bot.entity.position.distanceTo(a.position) -
    bot.entity.position.distanceTo(b.position)
  )

  return all[0]
}

/* ================= DAMAGE REACTION ================= */

bot.on('entityHurt', (entity)=>{
  if(entity === bot.entity){
    knockbackPause = true
    setTimeout(()=>knockbackPause=false,400)

    target = getNearestTarget()
  }
})

/* ================= COOLDOWN ================= */

function getCooldown(){
  const item = bot.heldItem
  if(!item) return 350

  if(item.name.includes("axe")) return 1000
  if(item.name.includes("sword")) return 600

  return 350
}

function canAttack(){
  return Date.now() - lastAttack > getCooldown()
}

/* ================= HUMAN AIM CHECK ================= */

function isLookingAt(target){

  const dir = target.position.minus(bot.entity.position).normalize()
  const view = bot.entity.yaw

  const dx = Math.sin(view)
  const dz = Math.cos(view)

  const dot = dx*dir.x + dz*dir.z

  return dot > 0.80 // muss wirklich hinschauen
}

/* ================= MAIN PVP AI ================= */

bot.on('physicsTick', async () => {

  if(!bot.entity) return

  // keepalive movement
  bot.look(bot.entity.yaw + 0.001, bot.entity.pitch, true)

  if(!target || !target.position){
    target = getNearestTarget()
    return
  }

  const dist = bot.entity.position.distanceTo(target.position)

  // langsam schauen (kein Hacker Snap)
  bot.lookAt(target.position.offset(0,1.5,0), false)

  if(knockbackPause) return

  /* movement */
  if(dist > 3){
    bot.setControlState('forward', true)
  } else {
    bot.setControlState('forward', false)
  }

  // strafing
  bot.setControlState('left', Math.random()<0.5)
  bot.setControlState('right', Math.random()>=0.5)

  // W-Tap
  if(Math.random()<0.07){
    bot.setControlState('forward', false)
    setTimeout(()=>bot.setControlState('forward', true),120)
  }

  /* attack only if looking */
  if(dist < 3.2 && canAttack() && isLookingAt(target)){

    // crit attempt
    if(bot.entity.onGround){
      bot.setControlState('jump', true)
      setTimeout(()=>bot.setControlState('jump',false),120)
    }

    bot.attack(target)
    lastAttack = Date.now()
  }

})

/* ================= RECONNECT ================= */

bot.on('end', ()=>{
  console.log("🔌 reconnect in 5s")
  setTimeout(createBot,5000)
})

bot.on('error', err=>{
  console.log("⚠️", err.message)
})

}

createBot()
