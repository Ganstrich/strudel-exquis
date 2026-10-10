// ============================================================
//  "NÉON SOUS LES FOUGÈRES"
//  Cyberpunk techno forestier — gnomes & farfadets
//  Colle ça dans https://strudel.cc puis Ctrl+Entrée
//  130 BPM · ré mineur · ~ 72 cycles (≈ 2 min 10)
// ============================================================

setcps(130/60/4)

// ---------- RYTHME (la machine) ----------
const kick  = s("bd*4").bank("RolandTR909").gain(1.1).duckorbit(2)
const hats  = s("[~ hh]*4").bank("RolandTR909").gain(.55).hpf(6000)
const hats16 = s("hh*16").bank("RolandTR909").gain(.3).degradeBy(.35).hpf(7000).pan(rand)
const clap  = s("~ cp ~ cp").bank("RolandTR909").gain(.7).room(.3)
const rims  = s("rim*8").bank("RolandTR909").gain(.35).degradeBy(.5)
const glitch = s("glitch*4").degradeBy(.6).gain(.5).crush(6).pan(rand)

// ---------- BASSE (le néon) ----------
const bass = note("<d1 d1 bb0 c1>")
  .struct("x*8")
  .s("sawtooth")
  .lpf(sine.range(250, 1400).slow(8))
  .lpq(10)
  .distort(.3)
  .gain(.55)
  .orbit(2)

// acid cyberpunk : plus nerveux
const acid = note("d2 d2 [d3 d2] d2 f2 d2 [a2 d2] c3")
  .s("sawtooth")
  .lpf(sine.range(400, 3000).fast(2))
  .lpq(14)
  .distort(.5)
  .gain(.4)
  .orbit(2)

// ---------- HARMONIE (la canopée) ----------
const pad = note("<[d3,f3,a3] [bb2,d3,f3] [f3,a3,c4] [c3,e3,g3]>")
  .s("supersaw")
  .lpf(1100)
  .attack(.6).release(1.5)
  .room(.8).gain(.35)

// ---------- LES FARFADETS (étincelles) ----------
const farfadets = n("0 2 4 7 9 7 4 2")
  .scale("d6:minor:pentatonic")
  .s("gm_music_box")
  .degradeBy(.4)
  .delay(.5).delaytime(.1875).delayfeedback(.5)
  .pan(rand).room(.6).gain(.5)

const farfadetsFous = n("<0 2 4 6>*16")
  .scale("d6:minor:pentatonic")
  .s("gm_celesta")
  .degradeBy(.6)
  .pan(rand).room(.5).gain(.4)

// ---------- LES GNOMES (grognements de basson) ----------
const gnomes = n("0 ~ 2 ~ 3 ~ 1 ~ 0 ~ 4 ~ 3 ~ 2 ~")
  .scale("d3:minor")
  .s("gm_bassoon")
  .room(.5).gain(.6)

// mélodie principale : la flûte de la clairière
const flute = n("<[0 ~ 2 4] [~ 4 5 4] [7 ~ 5 4] [2 ~ 0 ~]>")
  .scale("d5:minor")
  .s("gm_pan_flute")
  .delay(.35).delaytime(.375).delayfeedback(.4)
  .room(.7).gain(.7)

// ---------- AMBIANCE FORESTIÈRE ----------
const foret = stack(
  s("wind").slow(4).gain(.3).room(.9),
  s("birds3").slow(2).degradeBy(.4).gain(.25).room(.8).pan(rand),
  s("insect").slow(4).gain(.15).pan(rand)
)

// ---------- FX DE TRANSITION ----------
const riser = s("white").lpf(sine.range(200, 9000).slow(8)).gain(.25).room(.5)
const impact = s("bd:3").bank("RolandTR909").gain(1.2).room(.9).slow(8)

// ============================================================
//  STRUCTURE
// ============================================================

const intro = stack(foret, pad, farfadets.gain(.3))                         // 8 cycles : l'orée du bois

const montee = stack(foret.gain(.6), pad, kick.gain(.8), hats, farfadets,   // 8 cycles : les gnomes arrivent
                     gnomes, rims)

const build = stack(pad, kick, hats, hats16, clap, riser, acid.gain(.25),   // 4 cycles : le portail s'ouvre
                    farfadetsFous)

const drop1 = stack(kick, hats, hats16, clap, bass, flute,                  // 16 cycles : rave dans la clairière
                    farfadets, gnomes.gain(.4), pad.gain(.5), glitch, impact)

const pause = stack(foret, pad.room(1), farfadets.slow(2),                  // 8 cycles : les farfadets seuls
                    flute.gain(.5), gnomes.gain(.5))

const drop2 = stack(kick, hats, hats16, clap, acid, bass.gain(.4),          // 16 cycles : cyber-forêt déchaînée
                    flute.fast(1), farfadetsFous, farfadets,
                    gnomes.gain(.5), glitch, rims, impact)

const outro = stack(foret, pad, farfadets.gain(.4), kick.gain(.5),          // 4 cycles : retour au silence
                    gnomes.gain(.3))

arrange(
  [8,  intro],
  [8,  montee],
  [4,  build],
  [16, drop1],
  [8,  pause],
  [16, drop2],
  [4,  outro]
)

// ------------------------------------------------------------
//  Astuces :
//  - Si un sample manque (insect, birds3, glitch), remplace-le
//    par un autre ou retire la ligne.
//  - Pour tester une section seule, remplace arrange(...) par
//    par ex. drop1 tout seul.
//  - Plus sombre : baisse les .lpf des pads ; plus féérique :
//    monte l'octave de `farfadets` (d6 -> d7).
// ------------------------------------------------------------