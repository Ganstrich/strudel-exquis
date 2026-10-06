// examples/visuals - visuels live : widgets intégrés + Hydra
// Les widgets de visualisation s'attachent à un pattern et se dessinent
// au-dessus de l'éditeur.

setcps(0.5);

// .scope() oscilloscope · .spectrum() analyseur de fréquences
$: s("bd*2, ~ hh*2").bank("RolandTR909").scope();

// .pianoroll() rouleau de notes · .punchcard() grille · .spiral() spirale
// .pitchwheel() cercle des hauteurs
$: note("<c3 e3 g3 a3>").s("sawtooth").cutoff(800).room(0.4).slow(2).pianoroll();

// Hydra : visuels génératifs plein écran. hydra-synth est téléchargé depuis
// unpkg au premier appel (connexion internet requise). Décommente pour tester.
// await initHydra();
// osc(10, 0.1, 0.8).rotate(0.1, 0.1).modulate(noise(3)).out(o0);
