// Strudel crée son AudioContext tout seul (au premier clic) et ne l'expose pas.
// Pour qu'un addon puisse analyser le son qui sort, on intercepte la création
// du contexte, puis on branche un AnalyserNode en parallèle sur tout ce qui va
// vers la sortie. L'analyser est relié à un gain 0 : il ne change pas le son.

let analyser = null;
const internalNodes = new WeakSet();
let installed = false;

export function getAnalyser() {
  return analyser;
}

function tapContext(context) {
  if (analyser) return;
  analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.75;
  const mute = context.createGain();
  mute.gain.value = 0;
  internalNodes.add(analyser);
  internalNodes.add(mute);
  analyser.connect(mute);
  mute.connect(context.destination);
}

export function installAudioTap() {
  if (installed || typeof window === 'undefined' || !window.AudioContext) return;
  installed = true;

  const NativeAudioContext = window.AudioContext;
  window.AudioContext = new Proxy(NativeAudioContext, {
    construct(target, args) {
      const context = Reflect.construct(target, args);
      tapContext(context);
      return context;
    },
  });

  const nativeConnect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function connect(target, ...rest) {
    const result = nativeConnect.call(this, target, ...rest);
    if (analyser && !internalNodes.has(this) && target === analyser.context.destination) {
      nativeConnect.call(this, analyser);
    }
    return result;
  };
}
