// hello_world - smoke test: if you hear a kick and a hat, the setup works.
setcps(0.5);

$: s("bd*2, ~ hh").bank("RolandTR909").gain(0.9);

$: note("<c3 e3 g3 a3>").s("sawtooth").cutoff(800).room(0.4).slow(2);
