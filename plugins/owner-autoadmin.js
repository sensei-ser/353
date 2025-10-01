let handler = async (m, { conn, isAdmin }) => {
if (m.fromMe) throw 'Nggk'
if (isAdmin) return m.reply('Вы уже являетесь администратором группы мой создатель 🫡')
await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote")}
handler.help = ['autoadmin']
handler.tags = ['owner']
handler.command = /^admin.|atad|автоаэдлодмин$/i
handler.owner = true
handler.botAdmin = true
export default handler
