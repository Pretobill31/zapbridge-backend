import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@adiwajshing/baileys";
import QRCode from "qrcode";
import Pino from "pino";

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa o socket do WhatsApp
let sock;
let qrCodeData = null;

const initWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("sessions");

  sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection } = update;

    if (qr) {
      qrCodeData = await QRCode.toDataURL(qr);
      console.log("Novo QR Code gerado!");
    }

    if (connection === "open") {
      console.log("✅ WhatsApp conectado com sucesso!");
    }

    if (connection === "close") {
      console.log("⚠️ Conexão perdida. Tentando reconectar...");
      initWhatsApp();
    }
  });

  sock.ev.on("creds.update", saveCreds);
};

// Rota para gerar QR
app.get("/generate-qr", async (req, res) => {
  try {
    if (!qrCodeData) {
      return res.json({ message: "Aguardando geração do QR Code..." });
    }
    res.json({ qrCode: qrCodeData });
  } catch (err) {
    console.error("Erro ao gerar QR Code:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Inicializa WhatsApp assim que o servidor subir
initWhatsApp();

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
