# Change Log

All notable changes to the "vscode-context-enhancer" extension will be documented in this file.

## [1.0.3] - 2024-03-19

### Changed
- Nettoyage de la structure du projet
- Suppression des fichiers de développement inutiles
- Optimisation du package VSIX avec .vscodeignore

## [1.0.2] - 2024-03-19

### Added
- Support des erreurs de chargement de ressources
- Capture des erreurs de promesses non gérées
- Capture des erreurs de style CSS

## [1.0.1] - 2024-03-19

### Changed
- Renommage du dossier de contexte de `.vscode-context` à `vscode-context`
- Amélioration de la capture des erreurs console

## [1.0.0] - 2024-03-19

### Added
- Capture du DOM
- Capture des erreurs console
- Capture des ressources
- Capture d'écran
- Communication WebSocket entre Chrome et VSCode
- Stockage du contexte dans un dossier dédié

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Features
- JavaScript error capture (reference, syntax, execution)
- Resource error capture (404, network errors)
- Unhandled promise error capture
- CSS style error capture
- Context saving in Markdown format
- Screenshot saving
- Raw HTML saving
- Console errors saving in JSON format

### Planned Future Improvements
- HTML validation
- Performance metrics
- Accessibility checking
- Security issue detection
- Browser compatibility support
- Enhanced user interface
- AI integration
- Context version management
- Customization options
- Performance optimization 