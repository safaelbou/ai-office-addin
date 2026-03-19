// Configuration centralisée côté navigateur.
// La clé API ne doit plus être stockée ici.
// Le front appelle désormais un backend proxy.
export const API_BASE_URL = "https://localhost:8787";

// Activez ce mode à true pour tester rapidement sans appeler l'API.
export const USE_MOCK = true;

// Routes du backend proxy.
export const WORD_ANALYSIS_PATH = "/api/analyze-word";
export const EXCEL_ANALYSIS_PATH = "/api/analyze-excel";
