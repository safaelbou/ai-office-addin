# Redlyne

Ce POC combine :

- un frontend statique publié sur GitHub Pages
- un backend proxy Node.js local qui protège la clé GPT SNCF

La clé GPT SNCF n'est plus stockée dans [config.js](./config.js).

## 1. Installer les dépendances

Installez les dépendances :

```powershell
cd c:\Users\PSEB01261\ai-office-addin
npm install
```

## 2. Configurer le backend local

Créez un fichier `.env` à partir de [\.env.example](./.env.example).

Exemple :

```text
SGPT_API_KEY=votre_cle_gpt_sncf
PORT=8787
FRONTEND_ORIGIN=https://safaelbou.github.io
```

## 3. Démarrer le backend proxy

Dans PowerShell :

```powershell
npm run start:api
```

Le backend écoute par défaut sur :

```text
https://localhost:8787
```

Vous pouvez tester sa disponibilité via :

```text
https://localhost:8787/health
```

## 4. Générer les fichiers statiques

Quand le frontend change, regénérez le dossier `docs` :

```powershell
npm run build
```

Le script `build` copie les fichiers nécessaires dans [docs](./docs).

- [docs/manifest.xml](./docs/manifest.xml)
- [docs/config.js](./docs/config.js)
- [docs/src/taskpane/taskpane.html](./docs/src/taskpane/taskpane.html)
- [docs/src/taskpane/taskpane.css](./docs/src/taskpane/taskpane.css)
- [docs/src/taskpane/taskpane.js](./docs/src/taskpane/taskpane.js)

Les icônes sont également copiées dans `docs/assets/`.

## 5. Pousser le projet sur GitHub

Si le dépôt n'existe pas encore :

```powershell
git init
git add .
git commit -m "Initial Redlyne GitHub Pages setup"
git branch -M main
git remote add origin https://github.com/monlogin/redlyne.git
git push -u origin main
```

Si le dépôt existe déjà :

```powershell
git add .
git commit -m "Prepare Redlyne for GitHub Pages"
git push
```

## 6. Activer GitHub Pages

Dans GitHub :

1. Ouvrez le dépôt `redlyne`.
2. Allez dans `Settings`.
3. Ouvrez la section `Pages`.
4. Dans `Build and deployment`, choisissez `Deploy from a branch`.
5. Sélectionnez la branche `main`.
6. Sélectionnez le dossier `/docs`.
7. Enregistrez.

GitHub publiera alors le site sur une URL de type :

```text
https://monlogin.github.io/redlyne
```

## 7. Vérifier l'URL publiée

Quand GitHub Pages est actif, ouvrez :

```text
https://safaelbou.github.io/redlyne/taskpane.html
```

Si la page s'affiche correctement, le task pane est bien publié.

## 8. Charger le manifest dans Word Online

1. Ouvrez Word Online.
2. Ouvrez un document.
3. Cliquez sur `Insertion`.
4. Cliquez sur `Compléments`.
5. Cliquez sur `Charger un complément`.
6. Sélectionnez [manifest-word.xml](./manifest-word.xml).
7. Ouvrez ensuite le complément.

## 9. Charger le manifest dans Excel Online

1. Ouvrez Excel Online.
2. Ouvrez un classeur.
3. Cliquez sur `Insertion`.
4. Cliquez sur `Compléments`.
5. Cliquez sur `Charger un complément`.
6. Sélectionnez [manifest-excel.xml](./manifest-excel.xml).
7. Ouvrez ensuite le complément.

## 10. Validation des manifests

Vous pouvez vérifier les manifests avec :

```powershell
npx office-addin-manifest validate manifest-word.xml
npx office-addin-manifest validate manifest-excel.xml
```

## Remarques

- Le frontend est public sur GitHub Pages.
- La clé GPT SNCF reste côté serveur local.
- Pour que l'analyse fonctionne, le backend local doit être lancé pendant vos tests.
- Comme le frontend est chargé en HTTPS depuis GitHub Pages, le backend local doit lui aussi être exposé en HTTPS.
