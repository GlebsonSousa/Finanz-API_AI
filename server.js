const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");
require("dotenv").config();  // Carrega variáveis de ambiente do .env

const app = express();
const PORT = process.env.PORT || 3000;

const fs = require("fs");
const prompt = fs.readFileSync("finanzai-prompt.txt", "utf-8");

app.use(cors());
app.use(express.json());

// Configura a chave da API usando variável de ambiente
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", async (req, res) => {
    return res.status(200).send('API RODANDO')
})

app.post("/ia-finanzapp", async (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem) {
    return res.status(400).json({ error: "Mensagem é obrigatória." });
  }

  if(typeof mensagem !== "string") {
    mensagem = JSON.stringify(mensagem)
  }


  try {
    const response = await openai.chat.completions.create({
      model: process.env.MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: prompt 
        },
        {
          role: "user",
          content: mensagem,
        },
      ],
    });

    const output = response.choices[0].message.content;
    const json = JSON.parse(output);

    // Interpreta /n como quebra de linha
    if (json.mensagem) {
      json.mensagem = json.mensagem.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    }



    res.json(json);

  } catch (err) {
    console.error("Erro ao chamar IA:", err.message);
    res.status(500).json({ error: "Erro ao processar a mensagem da IA." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API da FinanzAI rodando em http://localhost:${PORT}`);
});
