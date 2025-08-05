import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Servidor rodando no Render 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
