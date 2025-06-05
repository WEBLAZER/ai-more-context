# Extension Chrome - VSCode Context Enhancer

## Description
Extension Chrome qui capture le contexte de développement web et l'envoie à VSCode pour améliorer l'expérience de débogage.

## Fonctionnalités

### Capture de contexte
- **DOM** : Structure HTML complète
- **Console** : Erreurs et avertissements
- **Ressources** : État des ressources
- **Screenshot** : Capture d'écran

### Types d'erreurs capturées
1. **Erreurs JavaScript**
   - Erreurs de référence (`undefinedVariable`)
   - Erreurs de syntaxe
   - Erreurs d'exécution

2. **Erreurs de ressources**
   - Images manquantes (404)
   - Fichiers CSS manquants
   - Scripts JavaScript manquants
   - Erreurs réseau

3. **Erreurs de promesses**
   - Promesses non gérées
   - Erreurs asynchrones

4. **Erreurs de style**
   - Fichiers CSS invalides
   - Règles CSS mal formées

## Installation

1. Ouvrez Chrome et accédez à `chrome://extensions/`
2. Activez le "Mode développeur"
3. Cliquez sur "Charger l'extension non empaquetée"
4. Sélectionnez le dossier `chrome-extension`

## Développement

### Structure des fichiers
```
chrome-extension/
├── manifest.json     # Configuration de l'extension
├── content.js        # Script de capture du contexte
├── background.js     # Script de fond
├── popup.html        # Interface utilisateur
└── popup.js         # Logique de l'interface
```

### Compilation
```bash
npm install
npm run build
```

### Tests
1. Ouvrez `test.html` dans Chrome
2. Vérifiez la capture des erreurs dans la console
3. Testez l'envoi du contexte à VSCode

## Améliorations futures

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