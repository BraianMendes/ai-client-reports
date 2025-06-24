const axios = require('axios');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { generatePDF } = require('./utils/pdf'); // utilitário de geração de PDF

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
        if (!msg.message?.conversation) return;
        const userMsg = msg.message.conversation.trim();

        try {
            // 1. Gera o relatório normalmente via IA
            const response = await axios.post('http://localhost:3001/analyze', { message: userMsg });
            const reportText = response.data.report;

            // 2. Envia a resposta em texto para o usuário
            await sock.sendMessage(msg.key.remoteJid, {
                text: `${reportText}\n\nSe preferir, o PDF será enviado em seguida.`
            });

            // 3. Gera o PDF temporário
            const filename = `report-${Date.now()}.pdf`;
            const filepath = process.platform === 'win32' ? `./${filename}` : `/tmp/${filename}`;
            await generatePDF(reportText, filepath);

            // 4. Envia o PDF como segunda mensagem
            await sock.sendMessage(msg.key.remoteJid, {
                document: fs.readFileSync(filepath),
                mimetype: 'application/pdf',
                fileName: filename,
                caption: 'Aqui está seu relatório em PDF!'
            });

            // 5. Limpa o arquivo temporário (boa prática)
            fs.unlinkSync(filepath);

        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Erro ao gerar relatório. Tente novamente.' });
            console.error(error.response?.data || error.message);
        }
    });
}

module.exports = { startBot };
