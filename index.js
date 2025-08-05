import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@adiwajshing/baileys";
import QRCode from "qrcode";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/generate-qr", async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./sessions");

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    sock.ev.on("connection.update", async (update) => {
      const { qr } = update;
      if (qr) {
        const qrImage = await QRCode.toDataURL(qr);
        res.json({ qrCode: qrImage });
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (err) {
    console.error("Erro ao gerar QR Code:", err);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
