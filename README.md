
# ADAM - Adaptive Digital Academic Mentor

ADAM est un projet d'agent intelligent qui aide les utilisateurs dans leurs révisions académiques. Il permet de téléverser des cours, de générer des QCM automatiquement en fonction des contenus des cours, et d'expliquer les réponses fournies par l'utilisateur. Ce projet est composé de deux parties : le frontend en Angular et le backend en NestJS.

## Structure du projet

Le projet se divise en deux dossiers principaux :

- **Frontend** : L'application Angular qui gère l'interface utilisateur.
- **Backend** : L'application NestJS qui gère la logique côté serveur et l'IA.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

- **Node.js** : La dernière version LTS de Node.js. Vous pouvez la télécharger [ici](https://nodejs.org/en/).
- **Angular CLI** : La version 19.1 de l'Angular CLI. Vous pouvez l'installer avec la commande suivante :

  ```bash
  npm install -g @angular/cli@19.1
  ```

## Installation

### 1. Clonez le dépôt

Clonez ce repository sur votre machine locale :

```bash
git clone <URL-du-repository>
cd Adam
```

### 2. Installation du Backend (NestJS)

Allez dans le dossier `Backend` et installez les dépendances nécessaires avec la commande suivante :

```bash
cd Backend
npm install
cd ..
```

### 3. Installation du Frontend (Angular)

Allez dans le dossier `Frontend` et installez les dépendances nécessaires avec la commande suivante :

```bash
cd Frontend
npm install
cd ..
```

## Lancer le projet

### 1. Lancer le Backend (NestJS)

Dans le dossier `Backend`, vous pouvez démarrer l'application avec la commande suivante :

```bash
cd Backend
nest start --watch
cd ..
```

Le backend devrait maintenant être accessible à l'adresse suivante : `http://localhost:3000`.

### 2. Lancer le Frontend (Angular)

Dans le dossier `Frontend`, vous pouvez démarrer l'application avec la commande suivante :

```bash
cd Frontend
ng serve
cd ..
```

Le frontend devrait maintenant être accessible à l'adresse suivante : `http://localhost:4200`.

### 3. Lancer Docker de ChromaDB

```bash
cd ChromaDB
docker-compose up -d
cd ..
```

## Fonctionnalités

- **Téléversement de cours** : Téléchargez vos cours sous différents formats (PDF, DOCX, etc.).
- **Génération automatique de QCM** : L'IA génère des questions à choix multiples en fonction du contenu des cours.
- **Explication des réponses** : Lorsque vous répondez à un QCM, l'IA peut fournir des explications sur les réponses correctes ou incorrectes.

## Structure des dossiers

Voici la structure des dossiers du projet :

```
adam/
│
├── Backend/              # Contient le code du backend (NestJS)
│   ├── src/              # Code source du backend
│   ├── package.json      # Dépendances et scripts du backend
│   └── ...
│
└── Frontend/             # Contient le code du frontend (Angular)
    ├── src/              # Code source du frontend
    ├── package.json      # Dépendances et scripts du frontend
    └── ...
```

## License

Ce projet est sous licence MIT. Consultez le fichier `LICENSE` pour plus de détails.
