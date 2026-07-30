# projet-design-pattern

Mini-framework TypeScript réactif, construit **sans dépendance externe** (hormis
Vite pour le bundling), autour des Design Patterns vus en cours. Il est accompagné
d'une application de démonstration CRUD (**TaskFlow**, un gestionnaire de tâches)
qui l'utilise de bout en bout.

## Architecture

```
src/
├── core/         # Cœur du framework
│   ├── builder.ts    # Builder — construction fluide d'éléments DOM
│   ├── factory.ts    # Factory — création rapide d'éléments HTML
│   ├── singleton.ts  # Singleton — AppConfig / AppStore
│   ├── strategy.ts   # Strategy — stockage Volatile / localStorage / IndexedDB
│   ├── observer.ts   # Observer — Observable<T> (réactivité)
│   └── result.ts     # Result / Option — succès / échec typés (Cours 6)
├── components/   # Système de composants (cycle de vie, binding DOM, slots)
├── store/        # Store global réactif (Singleton + Observer + actions)
├── router/       # Routeur client (History API + Observer)
├── forms/        # Formulaires : validation (Strategy) + binding bidirectionnel
├── http/         # Client HTTP (fetch, GET/POST/PUT/DELETE, timeout, Result)
├── demo/         # Application de démonstration (TaskFlow)
├── main.ts       # Point d'entrée Vite
└── style.css
```

## Design Patterns

| Pattern | Rôle | Fichier |
|---------|------|---------|
| Builder | Construire un élément DOM par chaînage | `core/builder.ts` |
| Factory | Instancier rapidement un élément HTML | `core/factory.ts` |
| Singleton | Config / état global en instance unique | `core/singleton.ts`, `store/` |
| Strategy | Backend de stockage & validators interchangeables | `core/strategy.ts`, `forms/validators.ts` |
| Observer | Réactivité (Observable → DOM, store, routeur) | `core/observer.ts` |
| Result / Option | Gestion typée du succès / de l'échec (HTTP) | `core/result.ts` |

## Application de démonstration

**TaskFlow** : un gestionnaire de tâches (CRUD) sur 3 pages reliées par le routeur.

- **Accueil** (`/`) — résumé de l'état
- **Liste** (`/tasks`) — créer (formulaire validé), filtrer, cocher, supprimer
- **Détail** (`/tasks/:id`) — éditer (validation) ou supprimer une tâche

Navigation sans rechargement (Router), état centralisé réactif (Store), CRUD via le
client HTTP sur une **API mock en mémoire** (aucun backend requis).

## Prérequis

- Docker + Docker Compose
- (ou) Node.js pour lancer les tests / le build en local

## Lancer l'application (production, via Nginx)

`docker-compose.yml` build l'application avec Vite puis la sert en statique avec
Nginx (avec fallback SPA pour les URL profondes).

```bash
docker compose up -d --build
```

L'application est disponible sur http://localhost:8080.

Pour arrêter et supprimer les conteneurs :

```bash
docker compose down
```

## Serveur de développement (hot reload)

```bash
docker compose -f compose.dev.yml up -d
docker compose -f compose.dev.yml exec node npm install
docker compose -f compose.dev.yml exec node npm run dev
```

L'application est disponible sur http://localhost:5173.

En local sans Docker : `npm install && npm run dev`.

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
