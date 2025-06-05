# Guide de Contribution

Merci de votre intérêt pour contribuer à VSCode Context Enhancer ! Ce document vous guidera à travers le processus de contribution.

## Table des matières
- [Workflow de développement](#workflow-de-développement)
- [Conventions de code](#conventions-de-code)
- [Gestion des versions](#gestion-des-versions)
- [Processus de publication](#processus-de-publication)
- [Tests](#tests)
- [Documentation](#documentation)

## Workflow de développement

### 1. Configuration initiale
```bash
# Cloner le repository
git clone https://github.com/WEBLAZER/vscode-context-enhancer.git
cd vscode-context-enhancer

# Installer les dépendances
npm install
```

### 2. Créer une branche
```bash
# Créer une nouvelle branche pour votre fonctionnalité
git checkout -b feature/nom-de-votre-fonctionnalite

# Pour une correction de bug
git checkout -b fix/nom-du-bug
```

### 3. Développement
- Faites vos modifications
- Suivez les conventions de code
- Testez vos changements
- Compilez l'extension : `npm run compile`

### 4. Commits
```bash
# Voir les fichiers modifiés
git status

# Ajouter les fichiers
git add .

# Créer un commit
git commit -m "Description claire de vos modifications"
```

### 5. Pull Request
1. Poussez votre branche : `git push origin feature/nom-de-votre-fonctionnalite`
2. Créez une Pull Request sur GitHub
3. Décrivez vos modifications
4. Attendez la review

## Conventions de code

### TypeScript
- Utilisez le style de code TypeScript standard
- Documentez les fonctions et classes
- Évitez les `any`
- Utilisez les types stricts

### Messages de commit
Format : `type(scope): description`

Types :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

Exemple :
```
feat(capture): add screenshot capture functionality
fix(websocket): handle connection errors
docs(readme): update installation instructions
```

## Gestion des versions

Nous suivons le [Semantic Versioning](https://semver.org/) :

- `MAJOR.MINOR.PATCH`
  - MAJOR : Changements incompatibles
  - MINOR : Nouvelles fonctionnalités compatibles
  - PATCH : Corrections de bugs compatibles

### Mise à jour de la version
1. Mettre à jour `package.json`
2. Mettre à jour `CHANGELOG.md`
3. Créer un tag Git

## Processus de publication

1. Mettre à jour la version dans `package.json`
2. Mettre à jour le `CHANGELOG.md`
3. Compiler : `npm run compile`
4. Publier : `vsce publish -p VOTRE_TOKEN`

## Tests

### Tests unitaires
```bash
# Lancer les tests
npm test

# Lancer les tests en mode watch
npm run test:watch
```

### Tests manuels
1. Compiler : `npm run compile`
2. Lancer en mode debug (F5 dans VSCode)
3. Tester les fonctionnalités

## Documentation

### Mise à jour de la documentation
- README.md : Documentation principale
- CHANGELOG.md : Historique des versions
- CONTRIBUTING.md : Guide de contribution
- Code : Commentaires et JSDoc

### Format de documentation
```typescript
/**
 * Description de la fonction
 * @param {Type} paramName - Description du paramètre
 * @returns {Type} Description du retour
 */
```

## Questions et Support

Si vous avez des questions :
1. Consultez la documentation
2. Ouvrez une issue sur GitHub
3. Contactez les mainteneurs

## Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence MIT que le projet. 