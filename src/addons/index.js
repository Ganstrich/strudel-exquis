import visualizer from './visualizer.js';

// Liste des addons chargés. Ajoute le tien ici (voir README → « Ajouter un addon »).
export const addons = [visualizer];

// Chaque addon reçoit le même contexte et peut renvoyer une fonction de nettoyage.
export function setupAddons(context) {
  const cleanups = [];
  for (const addon of addons) {
    try {
      const cleanup = addon.setup(context);
      if (typeof cleanup === 'function') cleanups.push(cleanup);
    } catch (err) {
      console.error(`[addon:${addon.id}] setup failed`, err);
    }
  }
  return () => cleanups.forEach((cleanup) => cleanup());
}
