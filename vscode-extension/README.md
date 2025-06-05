# VSCode Context Enhancer

## Description
Extension VSCode qui reçoit et affiche le contexte de développement web capturé par l'extension Chrome correspondante. Cette extension améliore considérablement votre expérience de débogage en centralisant toutes les informations de contexte dans VSCode.

## Fonctionnalités

### Capture de contexte en temps réel
- **DOM** : Structure HTML complète et analyse
- **Console** : Erreurs et avertissements JavaScript
- **Ressources** : État des ressources et problèmes de chargement
- **Screenshot** : Capture d'écran de la page

### Gestion automatique des fichiers
Crée et maintient un dossier `vscode-context` avec :
- `current-context.md` : Contexte détaillé au format Markdown
- `screenshot.png` : Capture d'écran de la page
- `page.html` : Code HTML brut pour analyse
- `console-errors.json` : Erreurs et avertissements de la console

## Installation

1. Ouvrez VSCode
2. Appuyez sur `Cmd+Shift+P` (Mac) ou `Ctrl+Shift+P` (Windows/Linux)
3. Tapez "Extensions: Install from VSIX"
4. Sélectionnez le fichier `.vsix` de l'extension

## Utilisation

1. Démarrez l'extension avec la commande "Start Context Server"
2. Le serveur WebSocket démarre automatiquement sur le port 3000
3. Le contexte est reçu en temps réel de l'extension Chrome
4. Les fichiers sont automatiquement sauvegardés dans le dossier `vscode-context`

## Support

Si vous rencontrez des problèmes ou avez des suggestions :
- Ouvrez une issue sur [GitHub](https://github.com/WEBLAZER/vscode-context-enhancer/issues)
- Consultez la [documentation](https://github.com/WEBLAZER/vscode-context-enhancer#readme)

## Auteur
Arthur Ballan

## Licence
MIT - Voir le fichier [LICENSE](https://github.com/WEBLAZER/vscode-context-enhancer/blob/main/LICENSE) pour plus de détails. 