# VSCode Extension - VSCode Context Enhancer

## Description
Extension VSCode qui reçoit et affiche le contexte de développement web capturé par l'extension Chrome correspondante.

## Fonctionnalités

### Réception du contexte
- **DOM** : Structure HTML complète
- **Console** : Erreurs et avertissements
- **Ressources** : État des ressources
- **Screenshot** : Capture d'écran

### Stockage du contexte
- Crée un dossier `vscode-context`
- Sauvegarde les fichiers :
  - `current-context.md` : Contexte au format Markdown
  - `screenshot.png` : Capture d'écran
  - `page.html` : HTML brut
  - `console-errors.json` : Erreurs de la console

## Installation

1. Ouvrez VSCode
2. Appuyez sur `Cmd+Shift+P` (Mac) ou `Ctrl+Shift+P` (Windows/Linux)
3. Tapez "Extensions: Install from VSIX"
4. Sélectionnez le fichier `.vsix` de l'extension

## Utilisation

1. Démarrez l'extension avec la commande "Start Context Server"
2. Le serveur WebSocket démarre sur le port 3000
3. Le contexte est automatiquement reçu de l'extension Chrome
4. Les fichiers sont sauvegardés dans le dossier `vscode-context`

## Développement

### Structure des fichiers
```
vscode-extension/
├── src/
│   ├── extension.ts     # Point d'entrée de l'extension
│   └── server.ts        # Serveur WebSocket
├── package.json         # Configuration et dépendances
└── tsconfig.json        # Configuration TypeScript
```

### Compilation
```bash
npm install
npm run compile
```

### Tests
1. Appuyez sur F5 dans VSCode pour lancer en mode développement
2. Vérifiez la réception du contexte
3. Testez la sauvegarde des fichiers

## Licence

MIT - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

[Arthur Ballan](https://github.com/WEBLAZER)

## Support

Si vous rencontrez des problèmes ou avez des suggestions :
1. Ouvrez une issue sur GitHub
2. Contactez l'auteur
3. Consultez la documentation 