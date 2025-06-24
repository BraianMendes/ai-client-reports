require('dotenv').config();

const axios = require('axios');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { generatePDF } = require('./utils/pdf');

const ANALYZE_API_URL = process.env.ANALYZE_API_URL || 'http://localhost:3001/analyze';

function extractMessageText(msg) {
    if (!msg.message) return null;
    if (msg.message.conversation) return msg.message.conversation;
    if (msg.message.extendedTextMessage?.text) return msg.message.extendedTextMessage.text;
    if (msg.message.imageMessage?.caption) return msg.message.imageMessage.caption;
    if (msg.message.videoMessage?.caption) return msg.message.videoMessage.caption;
    if (msg.message.documentMessage?.caption) return msg.message.documentMessage.caption;
    if (msg.message.audioMessage?.caption) return msg.message.audioMessage.caption;
    if (msg.message.buttonsResponseMessage?.selectedButtonId) return msg.message.buttonsResponseMessage.selectedButtonId;
    if (msg.message.listResponseMessage?.title) return msg.message.listResponseMessage.title;
    return null;
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startBot();
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];

        const userMsgRaw = extractMessageText(msg);
        if (!userMsgRaw) return;
        const userMsg = userMsgRaw.trim();

        try {
            const response = await axios.post(ANALYZE_API_URL, { message: userMsg });
            const reportText = response.data.report;

            await sock.sendMessage(msg.key.remoteJid, {
                text: `${reportText}\n\nSe preferir, o PDF será enviado em seguida.`
            });

            const filename = `report-${Date.now()}.pdf`;
            const filepath = path.join(os.tmpdir(), filename);
            await generatePDF(reportText, filepath);

            await sock.sendMessage(msg.key.remoteJid, {
                document: fs.readFileSync(filepath),
                mimetype: 'application/pdf',
                fileName: filename,
                caption: 'Aqui está seu relatório em PDF!'
            });

            fs.unlinkSync(filepath);

        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Erro ao gerar relatório. Tente novamente.' });
            console.error(error.response?.data || error.message);
        }
    });
}

module.exports = { startBot };
