import { db } from '../lib/postgres.js';

let handler = async(m, { conn, text, participants, metadata, args, command }) => {

if (command == 'внимание' || command == 'invocar' || command == 'todos' || command == 'invocacion') {
let usarLid = participants.some(p => p.id?.endsWith?.('@lid'))
let pesan = args.join` `
let oi = `*Сообщения:* ${pesan}`
let teks = `*⺀ ВНИМАНИЕ ГРУППА 🗣️⺀*\n\n❏ ${oi} \n\n❏ *Участники:*\n`
let menciones = []
let desconocidos = []
let contador = 1

for (let mem of participants) {
let numero = null

if (usarLid && mem.id.endsWith('@lid')) {
const res = await db.query('SELECT num FROM usuarios WHERE lid = $1', [mem.id])
numero = res.rows[0]?.num || null
} else if (/^\d+@s\.whatsapp\.net$/.test(mem.id)) {
numero = mem.id.split('@')[0]
}

if (numero) {
teks += `➥ @${numero}\n`
menciones.push(mem.id)
} else {
desconocidos.push({ id: mem.id, fake: `@Usuarios` })
}}

for (let i = 0; i < desconocidos.length; i++) {
teks += `➥ ${desconocidos[i].fake}\n`
}

await conn.sendMessage(m.chat, { text: teks, mentions: menciones })
}

if (command == 'contador') {
let usarLid = participants.some(p => p.id?.endsWith?.('@lid'))
const result = await db.query(`SELECT user_id, message_count
      FROM messages
      WHERE group_id = $1`, [m.chat])
let memberData = participants.map(mem => {
const userId = mem.id;
const userData = result.rows.find(row => row.user_id === userId) || { message_count: 0 };
return { id: userId, messages: userData.message_count };
})
memberData.sort((a, b) => b.messages - a.messages)
let activeCount = memberData.filter(mem => mem.messages > 0).length
let inactiveCount = memberData.filter(mem => mem.messages === 0).length
let teks = `*📊 Actividad del grupo 📊*\n\n`
teks += `□ Grupo: ${metadata.subject || 'Sin nombre'}\n`
teks += `□ Total de miembros: ${participants.length}\n`
teks += `□ Miembros activos: ${activeCount}\n`
teks += `□ Miembros inactivos: ${inactiveCount}\n\n`
teks += `*□ Lista de miembros:*\n`
let contador = 1
for (let mem of memberData) {
let numero = null
if (usarLid && mem.id.endsWith('@lid')) {
const res = await db.query('SELECT num FROM usuarios WHERE lid = $1', [mem.id])
numero = res.rows[0]?.num || null
} else if (/^\d+@s\.whatsapp\.net$/.test(mem.id)) {
numero = mem.id.split('@')[0]
}
teks += `➥ @${numero || `Usuarios`} - Mensajes: ${mem.messages}\n`
}

await conn.sendMessage(m.chat, { text: teks, mentions: memberData.filter(mem => /^\d+@s\.whatsapp\.net$/.test(mem.id) || mem.id.endsWith('@lid')).map(mem => mem.id) }, { quoted: m });
}}
handler.help = ['tagall <mensaje>', 'invocar <mensaje>', 'contador']
handler.tags = ['group']
handler.command = /^(внимание|invocar|invocacion|todos|invocación|contador)$/i
handler.admin = true
handler.group = true
//handler.botAdmin = true
export default handler
