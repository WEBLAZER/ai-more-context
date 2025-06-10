# Politique de Confidentialité - AI More Context

Dernière mise à jour : 2024

## Introduction

AI More Context est une extension Chrome conçue pour améliorer l'expérience de développement en capturant et partageant le contexte de développement web avec VSCode. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données.

## Données Collectées

### Types de Données
L'extension collecte uniquement les données suivantes :
- Contenu HTML de la page active
- Erreurs de console JavaScript
- Ressources chargées (scripts, styles, images)
- Capture d'écran de la page

### Portée de la Collecte
- Les données sont collectées uniquement sur les pages web que vous visitez
- La collecte est limitée au contenu visible dans l'onglet actif
- Aucune donnée personnelle n'est collectée

## Utilisation des Données

### Objectif
Les données collectées sont utilisées uniquement pour :
- Faciliter le débogage de votre code
- Améliorer l'assistance au développement
- Fournir un contexte enrichi à VSCode

### Stockage
- Les données sont stockées temporairement dans le stockage local de votre navigateur
- Les données sont automatiquement supprimées lorsque :
  - L'extension est désinstallée
  - Le navigateur est fermé
  - Vous effacez les données de navigation

## Partage des Données

### Communication Locale
- Les données sont envoyées uniquement à votre serveur VSCode local (http://localhost:3000)
- Aucune donnée n'est envoyée à des serveurs externes
- Aucune donnée n'est partagée avec des tiers

## Autorisations Requises

### activeTab
Nécessaire pour accéder au contenu de la page active et capturer le contexte de développement.

### scripting
Utilisé pour injecter le code de capture dans les pages web.

### storage
Permet de stocker temporairement les erreurs et le contexte avant l'envoi à VSCode.

### tabs
Nécessaire pour détecter les changements d'onglets et gérer la capture du contexte.

### Accès aux Hôtes
- `http://localhost:3000/*` : Pour communiquer avec le serveur VSCode local
- `<all_urls>` : Pour capturer le contexte sur les pages web visitées

## Sécurité

### Protection des Données
- Toutes les communications sont locales
- Aucune donnée n'est stockée sur des serveurs distants
- Les données sont automatiquement nettoyées

### Contrôle des Données
Vous pouvez à tout moment :
- Désactiver l'extension
- Effacer les données stockées
- Désinstaller l'extension

## Modifications de la Politique

Nous nous réservons le droit de modifier cette politique de confidentialité. Les modifications seront publiées sur cette page avec la date de dernière mise à jour.

## Contact

Pour toute question concernant cette politique de confidentialité, veuillez :
- Ouvrir une issue sur [GitHub](https://github.com/WEBLAZER/ai-more-context/issues)
- Consulter la [documentation](https://github.com/WEBLAZER/ai-more-context#readme)

## Conformité

Cette extension est conforme au Règlement du programme Chrome Web Store pour les développeurs et respecte les meilleures pratiques en matière de confidentialité. 