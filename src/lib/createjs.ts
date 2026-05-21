// createjs (v1.0.1) is loaded as a global script in index.html.
// This module simply re-exports the global so other modules can import it
// rather than accessing window.createjs directly.
export const createjs = (window as any).createjs as any;
