# Guide de démarrage rapide - VSCode Context Enhancer

Ce guide vous aidera à démarrer rapidement avec l'extension VSCode Context Enhancer.

## Prérequis

- VSCode 1.60.0 ou supérieur
- L'extension Chrome "VSCode Context Enhancer" installée
- Node.js 14.x ou supérieur

## Installation

1. Installez l'extension depuis le VS Code Marketplace
2. Installez l'extension Chrome correspondante
3. Redémarrez VSCode

## Utilisation rapide

1. Ouvrez VSCode
2. Appuyez sur `Cmd+Shift+P` (Mac) ou `Ctrl+Shift+P` (Windows/Linux)
3. Tapez "Démarrer le serveur de contexte"
4. Dans Chrome, naviguez sur la page à déboguer
5. Cliquez sur l'icône de l'extension Chrome
6. Le contexte est automatiquement capturé et envoyé à VSCode

## Structure des fichiers de contexte

Le contexte est stocké dans un dossier `vscode-context` à la racine de votre projet :

- `current-context.md` : Résumé du contexte au format Markdown
- `page.html` : HTML brut de la page
- `console-errors.json` : Erreurs de console
- `screenshot.png` : Capture d'écran (si disponible)

## Configuration

L'extension peut être configurée via les paramètres de VSCode :

- `vscode-context-enhancer.port` : Port du serveur WebSocket (par défaut : 3000)

## Dépannage

### Le serveur ne démarre pas
- Vérifiez que le port 3000 est disponible
- Redémarrez VSCode
- Vérifiez les logs dans la console de débogage

### Pas de contexte reçu
- Vérifiez que l'extension Chrome est installée
- Vérifiez que le serveur est en cours d'exécution
- Vérifiez la console de Chrome pour les erreurs

### Erreurs de capture
- Vérifiez les permissions de l'extension Chrome
- Vérifiez que la page est accessible
- Vérifiez les logs dans la console de débogage

## Ressources

- [Documentation complète](https://github.com/arthurballan/vscode-add-context#readme)
- [Signaler un problème](https://github.com/arthurballan/vscode-add-context/issues)
- [Code source](https://github.com/arthurballan/vscode-add-context) 