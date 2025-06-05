# VSCode Context Enhancer

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

1. Démarrez l'extension VSCode
2. Naviguez sur la page web à déboguer
3. Cliquez sur l'icône de l'extension Chrome
4. Le contexte est automatiquement capturé et envoyé à VSCode

## Structure du projet

```
vscode-add-context/
├── chrome-extension/     # Extension Chrome
├── vscode-extension/     # Extension VSCode
├── test/                 # Tests et exemples
└── vscode-context/       # Dossier de stockage du contexte
```

## Évolution du projet

### Version 1.0
- Capture basique du DOM et des erreurs console
- Communication WebSocket entre Chrome et VSCode
- Stockage du contexte dans un dossier dédié

### Améliorations futures
1. **Validation HTML**
   - Détection des balises mal fermées
   - Validation des attributs
   - Structure HTML

2. **Performance**
   - Métriques de chargement
   - Analyse des ressources
   - First Contentful Paint

3. **Accessibilité**
   - Vérification des attributs alt
   - Contraste des couleurs
   - Structure de navigation

4. **Sécurité**
   - Mixed Content
   - CSP violations
   - Erreurs CORS

5. **Compatibilité**
   - Support navigateur
   - Polyfills
   - API dépréciées

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

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

MIT 