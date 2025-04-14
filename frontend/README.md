# Frontend Recrutement API

Ce projet est une application frontend React qui consomme l'API Laravel de recrutement. Il fournit une interface utilisateur complète pour la gestion des offres d'emploi et des candidatures.

## Fonctionnalités

- **Authentification complète**
  - Connexion et inscription
  - Récupération de mot de passe
  - Gestion de sessions avec JWT

- **Tableau de bord**
  - Vue personnalisée selon le rôle (candidat ou recruteur)
  - Statistiques et résumés

- **Gestion des offres d'emploi**
  - Liste des offres avec filtrage et pagination
  - Création et modification d'offres (recruteurs)
  - Visualisation détaillée des offres

- **Gestion des candidatures**
  - Candidature aux offres d'emploi (candidats)
  - Suivi des candidatures envoyées (candidats)
  - Gestion des candidatures reçues (recruteurs)
  - Changement de statut des candidatures (recruteurs)

- **Interface responsive et design moderne**
  - Utilisation de Material UI pour une expérience utilisateur optimale
  - Conception adaptée aux mobiles et ordinateurs

## Installation

1. Assurez-vous d'avoir Node.js installé (version 14 ou supérieure)

2. Installez les dépendances du projet :
   ```bash
   cd frontend
   npm install
   ```

## Configuration

Le projet est configuré pour communiquer avec l'API Laravel en développement grâce à un proxy Vite. Aucune configuration supplémentaire n'est nécessaire si l'API Laravel s'exécute sur `http://localhost:8000`.

Si votre API s'exécute sur un autre port ou hôte, modifiez le fichier `vite.config.js`.

## Démarrage du serveur de développement

Pour lancer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible à l'adresse : [http://localhost:5173](http://localhost:5173)

## Structure du projet

```
frontend/
├── public/            # Ressources statiques
├── src/
│   ├── assets/        # Images et ressources
│   ├── components/    # Composants réutilisables
│   │   └── layouts/   # Layouts de l'application
│   ├── contexts/      # Contextes React, incluant AuthContext
│   ├── pages/         # Composants de pages
│   │   ├── auth/      # Pages d'authentification
│   │   ├── job-offers/# Pages de gestion des offres
│   │   └── applications/ # Pages de gestion des candidatures
│   ├── services/      # Services API et utilitaires
│   ├── App.jsx        # Composant principal et routage
│   └── main.jsx       # Point d'entrée
└── ...
```

## Utilisation

### Connexion et inscription

- Accédez à `/login` pour vous connecter
- Accédez à `/register` pour créer un nouveau compte
- Choisissez le rôle lors de l'inscription (candidat ou recruteur)

### Rôle candidat

- Parcourez les offres d'emploi disponibles
- Postulez avec une lettre de motivation
- Suivez vos candidatures et leur statut

### Rôle recruteur

- Créez et gérez des offres d'emploi
- Consultez les candidatures reçues
- Mettez à jour le statut des candidatures

## Technologies utilisées

- [React](https://react.dev/) - Bibliothèque UI
- [Vite](https://vitejs.dev/) - Outil de build
- [React Router](https://reactrouter.com/) - Gestion du routage
- [Material UI](https://mui.com/) - Composants d'interface utilisateur
- [Axios](https://axios-http.com/) - Client HTTP pour les appels API
- [React Hook Form](https://react-hook-form.com/) - Gestion des formulaires
- [Yup](https://github.com/jquense/yup) - Validation des schémas

## Développement

Cette application a été conçue pour être facilement extensible. Voici quelques éléments clés du code :

1. **Service API** (`src/services/api.js`) - Point central pour toutes les communications avec l'API backend

2. **AuthContext** (`src/contexts/AuthContext.jsx`) - Gestion globale de l'état d'authentification

3. **Composants de formulaire** - Utilisation de React Hook Form avec validation Yup

4. **Routage protégé** - Les routes protégées vérifient l'authentification et le rôle de l'utilisateur