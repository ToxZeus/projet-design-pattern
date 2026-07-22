# projet-design-pattern

Mini-framework TypeScript réactif construit sans dépendance externe (hormis
Vite pour le bundling), autour des Design Patterns Factory, Builder,
Singleton, Strategy et Observer (`src/core/`).

## Requirements

- Docker
- Docker Compose

## Run the app (production, via Nginx)

`docker-compose.yml` build l'application avec Vite puis la sert en statique
avec Nginx.

```bash
docker compose up -d --build
```

L'application est disponible sur http://localhost:8080.

Pour arrêter et supprimer les conteneurs :

```bash
docker compose down
```

## Development server (hot reload)

`compose.dev.yml` démarre un conteneur Node nu pour travailler avec le
serveur de dev Vite (hot module reload).

```bash
docker compose -f compose.dev.yml up -d
docker compose -f compose.dev.yml exec node npm install
docker compose -f compose.dev.yml exec node npm run dev
```

L'application est disponible sur http://localhost:5173.

Pour arrêter et supprimer les conteneurs :

```bash
docker compose -f compose.dev.yml down
```

## Tests

```bash
npm install
npm run test
```

## Build

```bash
npm install
npm run build
```
