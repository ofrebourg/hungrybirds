# Hungry Birds

A 2D physics game where players compete to collect as many food items as possible. Originally built in 2013, now modernised with TypeScript, Vite, and pnpm.

## How to play

Each player controls a circular bird. Collect food and drinks to score points. You can also steal items from opponents. Press **P** to pause and unpause. Reload the page to restart.

## Setup

```sh
pnpm install
pnpm dev
```

Then open `http://localhost:5173`.

## Adding players

Each player is defined in `src/players/PlayerN.ts`. Copy `PlayerTemplate.ts` as a starting point, set the player number, and implement `moveMyPlayer()` — that's the main loop called every tick.

Players are registered in `src/addPlayers.ts`.

## Stack

- [CreateJS](https://createjs.com) — rendering (loaded as a global script, no ESM export)
- [Box2dWeb](https://github.com/hecht-software/box2dweb) — 2D physics
- [ndgmr Collision](https://github.com/nicktindall/ndgmr.Collision) — pixel-perfect collision detection
- Vite, TypeScript, Biome
