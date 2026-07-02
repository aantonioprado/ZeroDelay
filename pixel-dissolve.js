// ZeroDelay — decorative pixel-dissolve scatter for the popup.
//
// Draws scattered solid square "pixels" onto the .app-scatter <canvas>: an
// ordered Bayer 4x4 dither over an edge-distance gradient, so blocks are dense
// at the top and bottom extremities and thin out organically toward the middle
// (the "degraded → sharp" motif — like a signal materialising). Computed once
// (and on resize / theme change), never per frame.
//
// Purely visual: it touches no storage, messaging, or engine state, and loads no
// remote resources or images (MV3-safe). The block colour comes from the CSS
// token --scatter so it follows the light/dark theme.

// 4x4 ordered dither matrix, normalised to 0..1.
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16);

const BLOCK = 10;      // px per scatter block
const BAND_ROWS = 9;   // how many blocks in from each edge the scatter reaches

function draw(canvas) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--scatter').trim() || '#5f5f5f';

    const cols = Math.ceil(w / BLOCK);
    const rows = Math.ceil(h / BLOCK);

    for (let by = 0; by < rows; by++) {
        // Distance (in blocks) from the nearest top/bottom edge → solidity g:
        // g = 1 hugging an edge, falling to 0 by BAND_ROWS in.
        const edge = Math.min(by, rows - 1 - by);
        const g = 1 - edge / BAND_ROWS;
        if (g <= 0) continue;

        for (let bx = 0; bx < cols; bx++) {
            // Keep the block only where its solidity beats this cell's threshold.
            if (g <= BAYER4[(by % 4) * 4 + (bx % 4)]) continue;
            ctx.fillRect(bx * BLOCK, by * BLOCK, BLOCK, BLOCK);
        }
    }
}

function init() {
    const canvas = document.querySelector('.app-scatter');
    if (!canvas || !canvas.getContext) return;

    const render = () => draw(canvas);
    render();

    // Redraw when the popup resizes (content grows) or the colour scheme flips.
    if (window.ResizeObserver) {
        new ResizeObserver(render).observe(canvas);
    } else {
        window.addEventListener('resize', render);
    }
    try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
    } catch { /* older engines without MediaQueryList events: ignore */ }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
