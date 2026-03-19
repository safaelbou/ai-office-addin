import { OPENAI_API_KEY, OPENAI_MODEL, USE_MOCK } from "../../config.js";

const elements = {
  analyzeWordBtn: document.getElementById("analyzeWordBtn"),
  analyzeExcelBtn: document.getElementById("analyzeExcelBtn"),
  hostBadge: document.getElementById("hostBadge"),
  result: document.getElementById("result"),
  spinner: document.getElementById("spinner"),
  statusText: document.getElementById("statusText")
};

// Prépare l'initialisation Office dès que l'hôte est prêt.
Office.onReady((info) => {
  initializeAddin(info);
});

function initializeAddin(info) {
  const host = info?.host || Office.context.host;

  updateHostUI(host);
  bindEvents();
  setStatus(`Prêt dans ${formatHostName(host)}.`);
  setResult(
    "Sélectionnez l'action correspondant à votre application active pour lancer l'analyse."
  );
}

function bindEvents() {
  elements.analyzeWordBtn.addEventListener("click", handleWordAnalysis);
  elements.analyzeExcelBtn.addEventListener("click", handleExcelAnalysis);
}

function updateHostUI(host) {
  const isWord = host === Office.HostType.Word;
  const isExcel = host === Office.HostType.Excel;

  elements.hostBadge.textContent = `Hôte détecté : ${formatHostName(host)}`;
  elements.analyzeWordBtn.classList.toggle("hidden", !isWord);
  elements.analyzeExcelBtn.classList.toggle("hidden", !isExcel);
}

function formatHostName(host) {
  if (host === Office.HostType.Word) {
    return "Word";
  }

  if (host === Office.HostType.Excel) {
    return "Excel";
  }

  return "Hôte non pris en charge";
}

async function handleWordAnalysis() {
  await runWithUiState(async () => {
    setStatus("Lecture des textes original et révisé dans Word...");

    const payload = await Word.run(async (context) => {
      const body = context.document.body;
      const originalText = body.getReviewedText("OriginalText");
      const revisedText = body.getReviewedText("RevisedText");

      await context.sync();

      return {
        originalText: originalText.value.trim(),
        revisedText: revisedText.value.trim()
      };
    });

    if (!payload.originalText && !payload.revisedText) {
      throw new Error(
        "Le document ne contient pas de texte exploitable pour l'analyse des révisions."
      );
    }

    setStatus("Envoi de l'analyse Word vers OpenAI...");

    const prompt = `
Tu es un assistant de relecture pour Microsoft Word.

Analyse les deux versions suivantes d'un document :

Texte original :
"""${payload.originalText || "(vide)"}"""

Texte révisé :
"""${payload.revisedText || "(vide)"}"""

Réponds en français avec les sections suivantes :
1. Résumé des changements principaux
2. Catégorisation : style, contenu, structure
3. Points importants à relire
`;

    const result = await askOpenAI(prompt, "word");
    setResult(result);
    setStatus("Analyse Word terminée.");
  });
}

async function handleExcelAnalysis() {
  await runWithUiState(async () => {
    setStatus("Lecture de la plage actuellement sélectionnée dans Excel...");

    const payload = await Excel.run(async (context) => {
      const range = context.workbook.getSelectedRange();
      range.load(["address", "values"]);

      await context.sync();

      return {
        address: range.address,
        values: range.values
      };
    });

    if (!payload.values || payload.values.length === 0) {
      throw new Error("La sélection Excel est vide.");
    }

    setStatus("Envoi de l'analyse Excel vers OpenAI...");

    const prompt = `
Tu es un analyste de données pour Microsoft Excel.

Analyse la plage sélectionnée suivante :
Adresse : ${payload.address}
Valeurs :
${JSON.stringify(payload.values, null, 2)}

Réponds en français avec les sections suivantes :
1. Insights clés
2. Anomalies ou valeurs aberrantes
3. Résumé en 3 points
`;

    const result = await askOpenAI(prompt, "excel");
    setResult(result);
    setStatus("Analyse Excel terminée.");
  });
}

async function askOpenAI(prompt, scenario) {
  if (USE_MOCK) {
    return buildMockResponse(scenario);
  }

  if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    throw new Error(
      "La clé API OpenAI n'est pas configurée dans config.js et le mode mock est désactivé."
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
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
    throw new Error(`Erreur OpenAI (${response.status}) : ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("La réponse OpenAI ne contient aucun contenu exploitable.");
  }

  return content;
}

function buildMockResponse(scenario) {
  if (scenario === "word") {
    return `Mode mock activé.

1. Résumé des changements principaux
- Le texte a été clarifié et plusieurs formulations ont été condensées.
- Quelques sections ont été réorganisées pour améliorer la lecture.

2. Catégorisation
- Style : ton plus direct, phrases raccourcies.
- Contenu : ajout de précisions métier et suppression de répétitions.
- Structure : certains paragraphes ont été déplacés.

3. Points importants à relire
- Vérifier que les suppressions n'ont pas retiré une nuance juridique.
- Confirmer que l'ordre des sections reste cohérent avec l'objectif du document.`;
  }

  return `Mode mock activé.

1. Insights clés
- La majorité des valeurs suit une tendance stable.
- Un petit sous-ensemble concentre les écarts les plus élevés.

2. Anomalies ou valeurs aberrantes
- Deux cellules semblent nettement au-dessus de la moyenne.
- Une ligne pourrait contenir une donnée manquante ou mal formatée.

3. Résumé en 3 points
- Les données sont globalement cohérentes.
- Quelques valeurs doivent être vérifiées.
- Une segmentation par catégorie améliorerait l'analyse.`;
}

async function runWithUiState(task) {
  toggleLoading(true);
  clearErrorState();

  try {
    await task();
  } catch (error) {
    const message = error?.message || "Une erreur inattendue est survenue.";
    setError(message);
    setStatus("Erreur pendant l'analyse.");
  } finally {
    toggleLoading(false);
  }
}

function toggleLoading(isLoading) {
  elements.spinner.classList.toggle("hidden", !isLoading);
  elements.spinner.setAttribute("aria-hidden", String(!isLoading));
  elements.analyzeWordBtn.disabled = isLoading;
  elements.analyzeExcelBtn.disabled = isLoading;
}

function setStatus(message) {
  elements.statusText.textContent = message;
}

function setResult(message) {
  elements.result.textContent = message;
  elements.result.classList.remove("error");
}

function setError(message) {
  elements.result.textContent = `Erreur : ${message}`;
  elements.result.classList.add("error");
}

function clearErrorState() {
  elements.result.classList.remove("error");
}

async function safeReadError(response) {
  try {
    const payload = await response.json();
    return payload?.error?.message || JSON.stringify(payload);
  } catch {
    return await response.text();
  }
}
