require('dotenv').config();

const axios = require('axios');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { generatePDF } = require('./utils/pdf');
const conversationContext = require('./utils/conversationContext');

const ANALYZE_API_URL = process.env.ANALYZE_API_URL || 'http://localhost:3001/analyze';

function extractMessageText(msg) {
    if (!msg.message) return { content: null, type: 'empty' };
    
    const hasMedia = !!(
        msg.message.imageMessage || 
        msg.message.videoMessage || 
        msg.message.audioMessage || 
        msg.message.documentMessage ||
        msg.message.stickerMessage
    );

    let content = null;
    let mediaType = 'unknown';

    if (msg.message.conversation) {
        content = msg.message.conversation;
    } else if (msg.message.extendedTextMessage?.text) {
        content = msg.message.extendedTextMessage.text;
    } else if (msg.message.imageMessage) {
        content = msg.message.imageMessage.caption || null;
        mediaType = 'image';
    } else if (msg.message.videoMessage) {
        content = msg.message.videoMessage.caption || null;
        mediaType = 'video';
    } else if (msg.message.documentMessage) {
        content = msg.message.documentMessage.caption || null;
        mediaType = 'document';
    } else if (msg.message.audioMessage) {
        content = msg.message.audioMessage.caption || null;
        mediaType = 'audio';
    } else if (msg.message.buttonsResponseMessage?.selectedButtonId) {
        content = msg.message.buttonsResponseMessage.selectedButtonId;
    } else if (msg.message.listResponseMessage?.title) {
        content = msg.message.listResponseMessage.title;
    }

    return {
        content,
        hasMedia,
        mediaType,
        type: hasMedia ? 'media' : (content ? 'text' : 'empty')
    };
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

        const extractedMessage = extractMessageText(msg);
        if (!extractedMessage) return;

        const userId = msg.key.remoteJid;
        
        if (!conversationContext.isUserAllowed(userId)) {
            await sock.sendMessage(userId, { 
                text: "🚫 Acesso não autorizado. Este bot é restrito a usuários específicos." 
            });
            return;
        }

        const rateLimitCheck = conversationContext.checkRateLimit(userId);
        if (!rateLimitCheck.allowed) {
            await sock.sendMessage(userId, { 
                text: `⏱️ Muitas mensagens! Aguarde ${rateLimitCheck.timeUntilReset} segundos antes de enviar outra mensagem.` 
            });
            return;
        }

        try {
            if (extractedMessage.hasMedia && !extractedMessage.content) {
                const mediaResponse = conversationContext.getMediaResponse(extractedMessage.mediaType);
                await sock.sendMessage(userId, { text: mediaResponse });
                return;
            }

            if (!extractedMessage.content || extractedMessage.content.trim().length === 0) {
                await sock.sendMessage(userId, { 
                    text: "🤔 Não consegui entender sua mensagem. Por favor, envie uma pergunta ou solicite uma análise empresarial em texto." 
                });
                return;
            }

            const userMsg = extractedMessage.content.trim();
            
            const lengthValidation = conversationContext.validateMessageLength(userMsg);
            if (!lengthValidation.valid) {
                await sock.sendMessage(userId, { 
                    text: `📏 ${lengthValidation.reason}. Sua mensagem tem ${userMsg.length} caracteres.` 
                });
                return;
            }

            const messageType = conversationContext.detectMessageType(userMsg, extractedMessage.hasMedia);
            
            if (messageType === 'empty') {
                await sock.sendMessage(userId, { 
                    text: "📝 Por favor, envie uma mensagem com conteúdo para que eu possa ajudá-lo com análises empresariais ou consultoria." 
                });
                return;
            }

            const response = await axios.post(ANALYZE_API_URL, { 
                message: userMsg,
                userId: userId 
            });
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
            let errorMessage = 'Erro ao gerar relatório. Tente novamente.';
            
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                errorMessage = '🔌 Problema de conexão com nossos serviços. Tente novamente em alguns momentos.';
            } else if (error.response?.status === 429) {
                errorMessage = '⏱️ Muitas solicitações. Aguarde alguns segundos antes de tentar novamente.';
            } else if (error.response?.status >= 500) {
                errorMessage = '⚙️ Nossos serviços estão temporariamente indisponíveis. Tente novamente em breve.';
            }
            
            await sock.sendMessage(msg.key.remoteJid, { text: errorMessage });
            console.error('Erro no processamento:', error.response?.data || error.message);
        }
    });
}

module.exports = { startBot };
