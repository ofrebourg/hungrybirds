import { addPlayers } from "./addPlayers";
import { init } from "./game/Main";

// Expose addPlayers for Main.ts to call after physics is ready
(window as any).__addPlayers = addPlayers;

window.addEventListener("load", init);
