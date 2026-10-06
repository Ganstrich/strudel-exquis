import { getAnalyser } from './audio-tap.js';

// Addon de visualisation : forme d'onde + spectre du son qui sort de Strudel.
export default {
  id: 'visualizer',
  name: 'Visualizer',
  setup({ host }) {
    const panel = document.createElement('section');
    panel.className = 'addon addon-visualizer';
    panel.innerHTML = `
      <div class="addon-bar">
        <span class="addon-name">Visualizer</span>
        <button type="button" class="addon-toggle" aria-expanded="true">masquer</button>
      </div>
      <canvas class="addon-canvas" height="120"></canvas>
    `;
    host.append(panel);

    const canvas = panel.querySelector('canvas');
    const toggle = panel.querySelector('.addon-toggle');
    const ctx = canvas.getContext('2d');
    let visible = true;
    let frame = null;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const analyser = getAnalyser();
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;

      ctx.clearRect(0, 0, width, height);
      if (!analyser) return;

      const spectrum = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(spectrum);
      const bars = 64;
      const barWidth = width / bars;
      ctx.fillStyle = '#2f3a4d';
      for (let i = 0; i < bars; i += 1) {
        // échelle log : les basses prennent moins de place que dans les bins bruts
        const bin = Math.floor((spectrum.length - 1) * (i / bars) ** 2);
        const level = (spectrum[bin] / 255) * height;
        ctx.fillRect(i * barWidth, height - level, barWidth - 1, level);
      }

      const wave = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(wave);
      ctx.beginPath();
      ctx.strokeStyle = '#e0a458';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < wave.length; i += 1) {
        const x = (i / (wave.length - 1)) * width;
        const y = (1 - wave[i] / 255) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const start = () => {
      resize();
      if (frame === null) draw();
    };

    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    toggle.addEventListener('click', () => {
      visible = !visible;
      canvas.hidden = !visible;
      toggle.textContent = visible ? 'masquer' : 'afficher';
      toggle.setAttribute('aria-expanded', String(visible));
      if (visible) start();
      else stop();
    });

    window.addEventListener('resize', resize);
    start();

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      panel.remove();
    };
  },
};
