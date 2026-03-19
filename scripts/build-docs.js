// Script de build statique pour GitHub Pages.
// Il copie les fichiers nécessaires dans le dossier docs/.

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const docsDir = path.join(rootDir, "docs");

const filesToCopy = [
  "manifest.xml",
  "config.js",
  "taskpane.html",
  "taskpane.css",
  "taskpane.js",
  "src/taskpane/taskpane.html",
  "src/taskpane/taskpane.css",
  "src/taskpane/taskpane.js",
  "assets/icon-16.png",
  "assets/icon-32.png",
  "assets/icon-80.png"
];

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(relativePath) {
  const sourcePath = path.join(rootDir, relativePath);
  const destinationPath = path.join(docsDir, relativePath);

  ensureDirectory(path.dirname(destinationPath));
  fs.copyFileSync(sourcePath, destinationPath);
  console.log(`Copié : ${relativePath}`);
}

function main() {
  // On repart d'un dossier docs propre pour éviter les fichiers obsolètes.
  fs.rmSync(docsDir, { recursive: true, force: true });
  ensureDirectory(docsDir);

  filesToCopy.forEach(copyFile);

  console.log("Build GitHub Pages terminé.");
  console.log(`Dossier généré : ${docsDir}`);
}

main();
