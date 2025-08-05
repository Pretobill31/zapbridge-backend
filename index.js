import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@adiwajshing/baileys";
import QRCode from "qrcode";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Nova rota para confirmar que o backend está ativo
app.get("/", (req, res) => {
  res.send("<h2>🚀 Servidor ZapBridge está rodando! Use /generate-qr para gerar seu QR Code.</h2>");
});

// Rota de gerar QR Code
app.get("/generate-qr", async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("sessions");

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    let qrSent = false;

    sock.ev.on("connection.update", async (update) => {
      const { qr } = update;
      if (qr && !qrSent) {
        qrSent = true;
        const qrImage = await QRCode.toDataURL(qr);
        return res.json({ qrCode: qrImage });
      }
    });

    sock.ev.on("creds.update", saveCreds);

    // Caso não gere QR em tempo hábil
    setTimeout(() => {
      if (!qrSent) res.status(500).json({ error: "Timeout ao gerar QR Code" });
    }, 15000);

  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
