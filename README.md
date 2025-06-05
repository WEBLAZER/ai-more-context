# VSCode Context Enhancer

[![License](https://img.shields.io/github/license/WEBLAZER/vscode-context-enhancer.svg)](https://github.com/WEBLAZER/vscode-context-enhancer/blob/main/LICENSE)

Une extension Chrome et VSCode qui capture le contexte de développement web pour améliorer l'expérience de débogage.

## Fonctionnalités

### Capture de contexte
- **DOM** : Structure HTML complète de la page
- **Console** : Erreurs et avertissements JavaScript
- **Ressources** : État du chargement des ressources (images, scripts, styles)
- **Screenshot** : Capture d'écran de la page

### Types d'erreurs capturées
- Erreurs JavaScript (référence, syntaxe, exécution)
- Erreurs de chargement de ressources (404, erreurs réseau)
- Erreurs de promesses non gérées
- Erreurs de style CSS

### Stockage du contexte
- Crée un dossier `vscode-context`
- Sauvegarde les fichiers :
  - `current-context.md` : Contexte au format Markdown
  - `screenshot.png` : Capture d'écran
  - `page.html` : HTML brut
  - `console-errors.json` : Erreurs de la console

## Installation

### Extension Chrome
1. Ouvrez Chrome et accédez à `chrome://extensions/`
2. Activez le "Mode développeur"
3. Cliquez sur "Charger l'extension non empaquetée"
4. Sélectionnez le dossier `chrome-extension`

### Extension VSCode
1. Ouvrez VSCode
2. Appuyez sur `Cmd+Shift+P` (Mac) ou `Ctrl+Shift+P` (Windows/Linux)
3. Tapez "Extensions: Install from VSIX"
4. Sélectionnez le fichier `.vsix` de l'extension

## Utilisation

1. Démarrez l'extension avec la commande "Start Context Server"
2. Le serveur WebSocket démarre sur le port 3000
3. Naviguez sur la page web à déboguer
4. Cliquez sur l'icône de l'extension Chrome
5. Le contexte est automatiquement capturé et envoyé à VSCode
6. Les fichiers sont sauvegardés dans le dossier `vscode-context`

## Structure du projet

```
vscode-add-context/
├── chrome-extension/     # Extension Chrome
├── vscode-extension/     # Extension VSCode
│   ├── src/
│   │   ├── extension.ts  # Point d'entrée de l'extension
│   │   └── server.ts     # Serveur WebSocket
│   ├── package.json      # Configuration et dépendances
│   └── tsconfig.json     # Configuration TypeScript
├── test/                 # Tests et exemples
└── vscode-context/       # Dossier de stockage du contexte
```

## Développement

### Prérequis
- Node.js
- Chrome
- VSCode

### Installation des dépendances
```bash
# Extension Chrome
cd chrome-extension
npm install

# Extension VSCode
cd vscode-extension
npm install
```

### Compilation
```bash
# Extension Chrome
cd chrome-extension
npm run build

# Extension VSCode
cd vscode-extension
npm run compile
```

### Tests
1. Appuyez sur F5 dans VSCode pour lancer en mode développement
2. Vérifiez la réception du contexte
3. Testez la sauvegarde des fichiers

## Améliorations futures

1. **Interface utilisateur**
   - Panneau dédié au contexte
   - Navigation dans les fichiers
   - Filtrage des erreurs

2. **Intégration IA**
   - Analyse automatique des erreurs
   - Suggestions de correction
   - Documentation contextuelle

3. **Gestion des versions**
   - Historique du contexte
   - Comparaison des versions
   - Restauration du contexte

4. **Personnalisation**
   - Configuration des types d'erreurs
   - Filtres personnalisés
   - Thèmes d'affichage

5. **Performance**
   - Compression des données
   - Mise en cache
   - Optimisation du stockage

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

MIT - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

[Arthur Ballan](https://github.com/WEBLAZER)

## Support

Si vous rencontrez des problèmes ou avez des suggestions :
1. Ouvrez une issue sur GitHub
2. Contactez l'auteur
3. Consultez la documentation
