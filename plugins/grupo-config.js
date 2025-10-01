let handler = async (m, { conn, args, usedPrefix, command, isOwner, text}) => {
let groupId = m.isGroup ? m.chat : null;
if (!m.isGroup && !isOwner) return m.reply('⚠️ Solo el owner puede usar este comando en privado.');
let identifier, action, target;

if (!m.isGroup && !m.isAdmin && isOwner) {
if (args.length < 2) return m.reply('⚠️ Formato incorrecto. Usa: !grupo [id/enlace] [ID/URL] - [acción] [+número si aplica]')

if (args[0].startsWith('id')) {
identifier = args[1];
action = args[2]?.replace('-', '').trim().toLowerCase();
target = args[3]?.replace('+', '') + '@s.whatsapp.net';
groupId = identifier;
} else if (args[0].match(/chat\.whatsapp\.com/)) {
identifier = args[0];
if (args[1] === '-') {
action = args[2]?.trim().toLowerCase();
target = args[3]?.replace('+', '') + '@s.whatsapp.net';
} else {
action = args[1]?.replace('-', '').trim().toLowerCase();
target = args[2]?.replace('+', '') + '@s.whatsapp.net';
}
const inviteCode = identifier.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1];
if (!inviteCode) return m.reply( '⚠️ Enlace inválido. Usa un enlace de WhatsApp válido.')
try {
const inviteInfo = await conn.groupGetInviteInfo(inviteCode);
groupId = inviteInfo.id;
} catch (e) {
return m.reply( '⚠️ No se pudo obtener información del grupo. Verifica el enlace o que el bot tenga acceso.')
}} else if (args[0] === 'enlace') {
identifier = args[1];
if (args[2] === '-') {
action = args[3]?.trim().toLowerCase();
target = args[4]?.replace('+', '') + '@s.whatsapp.net';
} else {
action = args[2]?.replace('-', '').trim().toLowerCase();
target = args[3]?.replace('+', '') + '@s.whatsapp.net';
}
if (!identifier.match(/chat\.whatsapp\.com/)) {
return m.reply('⚠️ Debes proporcionar un enlace válido.')
}
const inviteCode = identifier.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1];
if (!inviteCode) return m.reply('⚠️ Неверная ссылка. Используйте действительную ссылку WhatsApp.')
try {
const inviteInfo = await conn.groupGetInviteInfo(inviteCode);
groupId = inviteInfo.id;
} catch (e) {
return m.reply( '⚠️ Никакой информации от группы получить не удалось. Проверьте ссылку или убедитесь, что у бота есть доступ.')
}} else {
return m.reply( '⚠️ Использует "ID" или " link" в качестве первого аргумента или передает его непосредственно действительной ссылке.')
}} else if (m.isGroup) {
action = args[0]?.toLowerCase();
target = args[1]?.replace(/@/, '') + '@s.whatsapp.net';
}

if (!groupId) return m.reply('⚠️ Вы должны быть в группе или указать идентификатор/ссылку в частном порядке.');
if (!action) return m.reply( '⚠️ Вы должны указать действие (открыть, закрыть, дарадмин и т. Д.).')

switch (action) {
case 'abrir': case 'открыть': case 'abierto':
await conn.groupSettingUpdate(groupId, 'not_announcement');
m.reply(`🟢 ¡ОТКРЫТАЯ ГРУППА! Каждый может написать сейчас.`);
break;

case 'cerrar': case 'закрыть': case 'cerrado':
await conn.groupSettingUpdate(groupId, 'announcement');
m.reply(`⚠️ ¡ЗАКРЫТАЯ ГРУППА! Писать могут только администраторы.`);
break;

case 'addadmin': case 'promote': case 'daradmin':
if (!target) return m.reply('⚠️ Especifica un número (ejemplo: - daradmin +51987654321) o menciona en grupo.')
await conn.groupParticipantsUpdate(groupId, [target], 'promote');
m.reply(`✅ @${target.split('@')[0]} ahora es admin.`);
break;

case 'removeadmin': case 'demote': case 'quitaradmin':
if (!target) return m.reply('⚠️ Especifica un número (ejemplo: - quitaradmin +51987654321) o menciona en grupo.')
await conn.groupParticipantsUpdate(groupId, [target], 'demote');
m.reply(`✅ @${target.split('@')[0]} ya no es admin.`);
break;

case 'kick': case 'eliminar':
if (!target) return m.reply('⚠️ Especifica un número (ejemplo: - eliminar +51987654321) o menciona en grupo.')
await conn.groupParticipantsUpdate(groupId, [target], 'remove');
m.reply(`🗑️ @${target.split('@')[0]} ha sido eliminado del grupo.`);
break;

case 'aprobar':
if (!target) return m.reply('⚠️ Especifica un número (ejemplo: - aprobar +51987654321).')
await conn.groupRequestParticipantsUpdate(groupId, [target], 'approve');
m.reply(`✅ @${target.split('@')[0]} ha sido aprobado en el grupo.`);
break;
default:
return m.reply(`*⚠️ COMANDO INVÁLIDO*\n\n*En grupo:*\n${usedPrefix + command} abrir\n${usedPrefix + command} cerrar\n${usedPrefix + command} daradmin @usuario\n${usedPrefix + command} quitaradmin @usuario\n${usedPrefix + command} eliminar @usuario\n\n*En privado (owner):*\n${usedPrefix + command} id [ID] - abrir\n${usedPrefix + command} enlace [URL] - cerrar\n${usedPrefix + command} [URL] - cerrar\n${usedPrefix + command} id [ID] - daradmin +número`)
}
};
handler.help = ['group open/close', 'grupo abrir/cerrar', 'grupo aprobar +number'];
handler.tags = ['group'];
handler.command = /^(группу|grupo)$/i;
export default handler;