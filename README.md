# Redlyne

Redlyne est un add-in Microsoft Office en HTML/CSS/JavaScript, sans framework, conçu pour être hébergé statiquement sur GitHub Pages.

Le projet fonctionne entièrement côté client :

- pas de backend
- pas de serveur Node.js en production
- la clé OpenAI est stockée dans [config.js](./config.js)

## 1. Préparer le projet

Installez les dépendances puis générez le dossier `docs` :

```powershell
cd c:\Users\PSEB01261\ai-office-addin
npm install
npm run build
```

Le script `build` copie les fichiers nécessaires dans [docs](./docs) pour GitHub Pages :

- [docs/manifest.xml](./docs/manifest.xml)
- [docs/config.js](./docs/config.js)
- [docs/src/taskpane/taskpane.html](./docs/src/taskpane/taskpane.html)
- [docs/src/taskpane/taskpane.css](./docs/src/taskpane/taskpane.css)
- [docs/src/taskpane/taskpane.js](./docs/src/taskpane/taskpane.js)

Les icônes sont également copiées dans `docs/assets/`.

## 2. Remplacer `tonnom` par votre vrai nom GitHub

Avant de publier, remplacez `tonnom` par votre vrai identifiant GitHub dans [manifest.xml](./manifest.xml).

Exemple :

```text
https://tonnom.github.io/redlyne
```

devient :

```text
https://monlogin.github.io/redlyne
```

Après cette modification, relancez :

```powershell
npm run build
```

pour recopier le manifest mis à jour dans `docs/`.

## 3. Pousser le projet sur GitHub

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

## 4. Activer GitHub Pages depuis le dossier `/docs`

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

## 5. Vérifier l'URL publiée

Quand GitHub Pages est actif, ouvrez :

```text
https://monlogin.github.io/redlyne/src/taskpane/taskpane.html
```

Si la page s'affiche correctement, le task pane est bien publié.

## 6. Charger le manifest dans Word Online

1. Ouvrez Word Online.
2. Ouvrez un document.
3. Cliquez sur `Insertion`.
4. Cliquez sur `Compléments`.
5. Cliquez sur `Charger un complément`.
6. Sélectionnez [docs/manifest.xml](./docs/manifest.xml) ou [manifest.xml](./manifest.xml) si vous avez déjà remplacé les URLs.
7. Ouvrez ensuite le complément `Redlyne`.

## 7. Charger le manifest dans Excel Online

1. Ouvrez Excel Online.
2. Ouvrez un classeur.
3. Cliquez sur `Insertion`.
4. Cliquez sur `Compléments`.
5. Cliquez sur `Charger un complément`.
6. Sélectionnez [docs/manifest.xml](./docs/manifest.xml) ou [manifest.xml](./manifest.xml).
7. Ouvrez ensuite le complément `Redlyne`.

## 8. Validation du manifest

Vous pouvez vérifier le manifest avec :

```powershell
npm run validate
```

## Remarques

- Le chargement du complément est entièrement client-side.
- Si vous utilisez de vraies requêtes OpenAI depuis le navigateur, la clé API dans `config.js` sera visible côté client.
- Pour un usage réel en production, une architecture avec backend est préférable. Ici, la configuration suit votre contrainte explicite : aucun backend.
