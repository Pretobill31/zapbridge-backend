import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@adiwajshing/baileys";
import QRCode from "qrcode";

const app = express();
const PORT = process.env.PORT || 3000;

// Rota inicial (não fica em branco)
app.get("/", (req, res) => {
  res.send("<h1>ZapBridge Backend está rodando 🚀</h1><p>Acesse <a href='/generate-qr'>/generate-qr</a> para gerar um QR Code.</p>");
});

// Rota para gerar QR Code
app.get("/generate-qr", async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("sessions");

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    sock.ev.on("connection.update", async (update) => {
      const { qr } = update;
      if (qr) {
        const qrImage = await QRCode.toDataURL(qr);
        return res.send(`<h1>Escaneie o QR Code:</h1><img src="${qrImage}" />`);
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar QR Code", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});    setTimeout(() => {
      if (!qrSent) res.status(500).json({ error: "Timeout ao gerar QR Code" });
    }, 15000);

  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
