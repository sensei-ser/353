import { db } from '../lib/postgres.js'

let handler = async (m, { conn }) => {
const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => "https://i.pinimg.com/736x/7e/b4/de/7eb4de89405bcdebb0f24a6670c19855.jpg")

let groupMetadata
try {
groupMetadata = await conn.groupMetadata(m.chat)
} catch {
return m.reply('*⚠️ Error al obtener información del grupo. Intenta nuevamente más tarde.*')
}
const participants = groupMetadata.participants || []
const groupAdmins = participants.filter(p => p.admin)
const usarLid = participants.some(p => p.id?.endsWith?.('@lid'))
const listAdmin = await Promise.all(groupAdmins.map(async (v, i) => {
let numero = null
if (usarLid && v.id.endsWith('@lid')) {
const res = await db.query('SELECT num FROM usuarios WHERE lid = $1', [v.id])
numero = res.rows[0]?.num || null
} else if (/^\d+@s\.whaapp\.net$/.test(v.id)) {
numero = v.id.split('@')[0]
}
return `➥ ${numero ? `@${numero}` : `@Usuarios`}`
}))

const { rows } = await db.query(`SELECT * FROM group_settings WHERE group_id = $1`, [m.chat])
const data = rows[0] || {}
const { welcome, detect, antifake, antilink, modoadmin, primary_bot, modohorny, nsfw_horario, banned } = data
const fallbackOwner = m.chat.includes('-') ? m.chat.split('-')[0] + '@s.whatsapp.net' : null
const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || fallbackOwner || "Desconocido"

let primaryBotMention = ''
if (primary_bot) {
const allBots = [conn, ...global.conns.filter(bot => bot.user && bot.ws?.socket?.readyState !== 3)]
const selectedBot = allBots.find(bot => bot.user.jid === primary_bot)
primaryBotMention = `@${primary_bot.split('@')[0]}`
}

const text = `『 Здравствуйте 』
——————————————
          *_Хозяин🕴️_*
*@Артём* *+79963107770*
_Бот🤖_     *𓋹 Horus 𓋹*

*ВЕРСИЯ ПРОШИВКИ*
           *1.4.0 ㎇* 
——————————————
           *𓆣 МЕНЮ 𓆣*
——————————————
𓆃 *Включить приветствие*
𓆃 *Выключить приветствие*
𓆃 *Включить антиссылка*
𓆃 *Выключить антиссылка*
𓆃 *Включить толькоадмин*
𓆃 *Выключить толькоадмин*
𓆃 *Открыть группу*
𓆃 *Закрыть группу*
𓆃 *Вызов*
𓆃 *Снести*
𓆃 *Стикер*



`.trim()
await conn.sendFile(m.chat, pp, 'pp.jpg', text, m)
}
handler.help = ['infogp']
handler.tags = ['group']
handler.command = ['меню', 'groupinfo', 'infogp']
handler.group = true
handler.register = true

export default handler
