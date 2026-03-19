// Backend proxy minimal pour le POC.
// Il protège la clé GPT SNCF en la gardant côté serveur.

require("dotenv").config();

const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");

const app = express();

const PORT = Number(process.env.PORT || 8787);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://safaelbou.github.io";
const SGPT_API_KEY = process.env.SGPT_API_KEY;
const SGPT_BASE_URL = "https://gpt.sncf.fr/api/gateway";
const SGPT_MODEL = "mistral-medium-2508";
const HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH;
const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH;

app.use(
  cors({
    origin: FRONTEND_ORIGIN
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/analyze-word", async (req, res) => {
  const { originalText = "", revisedText = "" } = req.body || {};

  if (!originalText && !revisedText) {
    return res.status(400).json({
      error: "Les textes original et révisé sont manquants."
    });
  }

  const prompt = `
Tu es un assistant de relecture pour Microsoft Word.

Analyse les deux versions suivantes d'un document :

Texte original :
"""${originalText || "(vide)"}"""

Texte révisé :
"""${revisedText || "(vide)"}"""

Réponds en français avec les sections suivantes :
1. Résumé des changements principaux
2. Catégorisation : style, contenu, structure
3. Points importants à relire
`;

  try {
    const result = await callSgpt(prompt);
    return res.json({ result });
  } catch (error) {
    return handleServerError(res, error);
  }
});

app.post("/api/analyze-excel", async (req, res) => {
  const { address = "", values = [] } = req.body || {};

  if (!Array.isArray(values) || values.length === 0) {
    return res.status(400).json({
      error: "Les valeurs Excel sont manquantes ou invalides."
    });
  }

  const prompt = `
Tu es un analyste de données pour Microsoft Excel.

Analyse la plage sélectionnée suivante :
Adresse : ${address || "(inconnue)"}
Valeurs :
${JSON.stringify(values, null, 2)}

Réponds en français avec les sections suivantes :
1. Insights clés
2. Anomalies ou valeurs aberrantes
3. Résumé en 3 points
`;

  try {
    const result = await callSgpt(prompt);
    return res.json({ result });
  } catch (error) {
    return handleServerError(res, error);
  }
});

app.post("/api/summarize-word-selection", async (req, res) => {
  const { selectedText = "" } = req.body || {};

  if (!selectedText.trim()) {
    return res.status(400).json({
      error: "Le texte sélectionné est manquant."
    });
  }

  const prompt = `
Tu es un assistant de synthèse pour Microsoft Word.

Résume en français le texte sélectionné ci-dessous.
Le résumé doit être :
1. Clair
2. Concis
3. Structuré en 3 à 5 points

Texte sélectionné :
"""${selectedText}"""
`;

  try {
    const result = await callSgpt(prompt);
    return res.json({ result });
  } catch (error) {
    return handleServerError(res, error);
  }
});

startServer();

async function callSgpt(prompt) {
  if (!SGPT_API_KEY) {
    throw new Error("La variable d'environnement SGPT_API_KEY est absente.");
  }

  const response = await fetch(`${SGPT_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SGPT_API_KEY}`
    },
    body: JSON.stringify({
      model: SGPT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Tu rédiges des analyses claires, structurées et professionnelles en français."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await safeReadError(response);
    throw new Error(`Erreur GPT SNCF (${response.status}) : ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("La réponse GPT SNCF ne contient aucun contenu exploitable.");
  }

  return content;
}

async function safeReadError(response) {
  try {
    const payload = await response.json();
    return payload?.error?.message || JSON.stringify(payload);
  } catch {
    return await response.text();
  }
}

function handleServerError(res, error) {
  return res.status(500).json({
    error: error?.message || "Erreur serveur inattendue."
  });
}

function startServer() {
  if (!HTTPS_CERT_PATH || !HTTPS_KEY_PATH) {
    throw new Error(
      "HTTPS_CERT_PATH et HTTPS_KEY_PATH doivent être définis pour démarrer le backend HTTPS."
    );
  }

  const httpsOptions = {
    cert: fs.readFileSync(HTTPS_CERT_PATH),
    key: fs.readFileSync(HTTPS_KEY_PATH)
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Backend proxy démarré sur https://localhost:${PORT}`);
  });
}
