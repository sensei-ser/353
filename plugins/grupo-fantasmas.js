import { db } from '../lib/postgres.js';

let handler = async (m, { conn, text, participants, args, command, metadata }) => {
try {
const result = await db.query(`SELECT user_id, message_count
      FROM messages
      WHERE group_id = $1`, [m.chat]);
let memberData = participants.map(mem => {
const userId = mem.id;
const userData = result.rows.find(row => row.user_id === userId) || { message_count: 0 };
return { id: userId,
messages: userData.message_count,
isAdmin: mem.admin === 'admin' || mem.admin === 'superadmin'
}});

let sum = text ? parseInt(text) : memberData.length;
if (isNaN(sum) || sum <= 0) sum = memberData.length;
let sider = memberData.slice(0, sum).filter(mem => mem.messages === 0 && !mem.isAdmin);
let total = sider.length;

switch (command.toLowerCase()) {
case 'молчуны':
if (total === 0) return m.reply(`⚠️ Эта группа активна, в ней нет молчунов! :D`);
let teks = `⚠️ ОБЗОР НЕАКТИВНЫХ ⚠️\n\n`;
teks += `Группа: ${metadata.subject || 'Sin nombre'}\n`;
teks += `*Члены группы:* ${memberData.length}\n`;
teks += `*Неактивные участники:* ${total}\n\n`;
teks += `[ 👻 СПИСОК МОЛЧУНОВ 👻 ]\n`;
teks += sider.map(v => `  👉🏻 @${v.id.split('@')[0]}`).join('\n');
teks += `\n\n*Примечание:* Это может быть не на 100% правильным. Бот начинает подсчет сообщений с момента активации в этой группе.`;
await conn.sendMessage(m.chat, { text: teks, contextInfo: { mentionedJid: sider.map(v => v.id)}}, { quoted: m });
break;

case 'удалитьмолчунов':
if (total === 0) return m.reply(`⚠️ Эта группа активна, в ней нет молчунов! :D`);
let kickTeks = `⚠️ УДАЛЕНИЕ НЕАКТИВНЫХ ⚠️\n\n`;
kickTeks += `Группа: ${metadata.subject || 'Sin nombre'}\n`;
kickTeks += `*Члены группы:* ${memberData.length}\n`;
kickTeks += `*Неактивные участники:* ${total}\n\n`;
kickTeks += `[ 👻 МОЛЧУНЫ, КОТОРЫХ НУЖНО УДАЛИТЬ 👻 ]\n`;
kickTeks += sider.map(v => `@${v.id.split('@')[0]}`).join('\n');
kickTeks += `\n\n*Бот удалит упомянутый список, начиная с 20 секунд, с интервалом в 10 секунд между каждым удалением.*`;
await conn.sendMessage(m.chat, { text: kickTeks, contextInfo: { mentionedJid: sider.map(v => v.id) }}, { quoted: m });

let chatSettings = (await db.query("SELECT * FROM group_settings WHERE group_id = $1", [m.chat])).rows[0] || {};
let originalWelcome = chatSettings.welcome || true;
await db.query(`UPDATE group_settings
          SET welcome = false
          WHERE group_id = $1`, [m.chat]);
await delay(20000); 
try {
for (let user of sider) {
if (user.id !== conn.user.jid) { 
await conn.groupParticipantsUpdate(m.chat, [user.id], 'remove');
await delay(10000); 
}}} finally {
await db.query(`UPDATE group_settings
            SET welcome = $1
            WHERE group_id = $2`, [originalWelcome, m.chat]);
}
await m.reply(`✅ Eliminación de fantasmas completada.`);
break;
}
} catch (err) {
console.error(err);
m.reply("❌ Error ejecutando el comando. Por favor, intenta de nuevo.");
}}; 
handler.help = ['fantasmas', 'kickfantasmas'];
handler.tags = ['group'];
handler.command = /^(молчуны|удалитьмолчунов)$/i;
handler.group = true;
handler.botAdmin = true;
handler.admin = true; 


export default handler;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));