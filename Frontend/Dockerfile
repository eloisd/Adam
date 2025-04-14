FROM node:20-alpine

WORKDIR /app

# Installation d'Angular CLI globalement
RUN npm install -g @angular/cli

# Exposer le port pour le serveur de développement
EXPOSE 4200

# Commande par défaut pour démarrer le serveur de développement
CMD ["sh", "-c", "npm install && ng serve --host 0.0.0.0 --port 4200 --disable-host-check"]