FROM node:20-alpine
WORKDIR /app

# Installer les dépendances nécessaires pour les modules natifs
RUN apk add --no-cache python3 make g++ pkgconfig pixman-dev cairo-dev pango-dev libjpeg-turbo-dev giflib-dev

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Exposer le port
EXPOSE 3000

# Commande de démarrage pour le développement
CMD ["npm", "run", "start:dev"]