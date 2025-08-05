import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@adiwajshing/baileys";
import QRCode from "qrcode";

const app = express();
const PORT = process.env.PORT || 3000;

// Rota para gerar QR Code do WhatsApp
app.get("/generate-qr", async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("sessions");

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    let sent = false;

    sock.ev.on("connection.update", async (update) => {
      const { qr, connection } = update;

      if (qr && !sent) {
        sent = true;
        const qrImage = await QRCode.toDataURL(qr);
        return res.json({ qrCode: qrImage });
      }

      if (connection === "open") {
        console.log("✅ WhatsApp conectado com sucesso!");
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (err) {
    console.error("Erro ao gerar QR Code:", err);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
