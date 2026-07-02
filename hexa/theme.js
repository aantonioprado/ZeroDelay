// ZeroDelay — MODO HEXA
// Author: João Gustavo França <joao@solitus.com.br> (https://github.com/joaogfc)
//
// A green/yellow World Cup theme that reskins the YouTube page while a live
// Brazil match is on screen. Imported by content.js (isolated world) via
// chrome.runtime.getURL — so it is pure DOM with NO chrome.* APIs.
//
// The whole theme lives in ONE <style> whose rules are scoped under a single
// root class `html.zd-hexa`. Applying/removing the theme is therefore just
// `document.documentElement.classList.toggle('zd-hexa', on)` — atomic, instant,
// fully reversible, and it survives YouTube's SPA re-renders (YouTube never
// tears down <html>). The style node is inserted once (dormant) at install().
//
// It NEVER recolors the video itself — only the page chrome (masthead, page
// background, buttons, chat, and the player's control-bar accents). The
// decorative nodes (the masthead badge, the GOL! button, the activation toast)
// are created in JS with textContent only (no innerHTML → TrustedTypes-safe,
// same reason the donation banners avoid it) and removed on deactivate.

const STYLE_ID = '_modo_hexa';
const ROOT_CLASS = 'zd-hexa';
// Optional "full theme" sub-toggle: the broad green repaint of the whole page.
// OFF by default — the base theme stays narrow (player + masthead accent + the
// branded nodes) to avoid noise and impersonating YouTube.
const FULL_CLASS = 'zd-hexa-full';
// Overshoot spring, same feel as the extension's popup (--spring).
const SPRING = 'cubic-bezier(.2,.9,.25,1.18)';

// Brazil flag palette. Yellow is used for FILLS/graphics only (never body text
// — #FFDF00 on light is unreadable); accent text uses the softer canary #FFE44D.
const CSS = `
/* ===== CORE (always on with .zd-hexa): a NARROW accent, not a repaint ==========
   It dresses the user's page (player + a masthead accent + the branded nodes); it
   does not recolor YouTube's chrome. Less noise, and no "is this the real
   YouTube?" ambiguity — the badge keeps it attributed to ZeroDelay. */
/* Player: the live DVR bar + scrubber go gold, buffered segment blue, live dot gold */
/* Progress bar: a slow tricolor gradient that shimmers along, so it reads as the
   selecao's colors flowing, not a flat yellow "ad" bar. */
html.${ROOT_CLASS} .ytp-play-progress{
  background:linear-gradient(90deg,#009C3B,#FFDF00,#2f6be0,#FFDF00,#009C3B)!important;
  background-size:200% 100%!important;animation:zd-hexa-bar 4s linear infinite;
}
html.${ROOT_CLASS} .ytp-scrubber-button{background:#FFDF00!important;box-shadow:0 0 0 2px rgba(0,39,118,.5)!important;}
html.${ROOT_CLASS} .ytp-load-progress{background:rgba(0,39,118,.9)!important;}
@keyframes zd-hexa-bar{to{background-position:-200% 0;}}
html.${ROOT_CLASS} .ytp-live-badge::before{background:#FFDF00!important;}
html.${ROOT_CLASS} .ytp-live-badge{color:#FFF6D5!important;}
/* Masthead accent: a green underline + the CBF tricolor rule. The native masthead
   background is kept, so its text/icons stay readable in light AND dark. */
html.${ROOT_CLASS} #masthead-container,html.${ROOT_CLASS} ytd-masthead{
  border-bottom:2px solid #009C3B!important;
}
/* Bunting garland (varal de bandeirinhas) hanging from the masthead — the flags
   are pennants cycling green/yellow/blue, swaying gently; it drops in on boot. */
.zd-hexa-bunting{
  position:fixed;left:0;right:0;top:56px;height:18px;z-index:1800;
  display:flex;justify-content:space-around;align-items:flex-start;
  pointer-events:none;animation:zd-hexa-drop .5s ${SPRING} both;
}
.zd-hexa-bunting::before{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:#0b3b22;}
.zd-hexa-bunting i{
  width:15px;height:15px;background:var(--c);transform-origin:top center;
  clip-path:polygon(0 0,100% 0,50% 100%);
  animation:zd-hexa-sway 2.8s ease-in-out infinite;
}
@keyframes zd-hexa-drop{from{transform:translateY(-18px);opacity:0;}to{transform:translateY(0);opacity:1;}}
@keyframes zd-hexa-sway{0%,100%{transform:rotate(-4deg);}50%{transform:rotate(4deg);}}

/* ===== FULL THEME (opt-in sub-toggle .zd-hexa-full, OFF by default) =============
   The broad green repaint of the whole page (backgrounds, buttons, chips, chat).
   Behind a flag so it never applies by default — it is the loudest, most
   "YouTube-looking" part, so it stays a deliberate choice. */
html.${ROOT_CLASS}.${FULL_CLASS}{
  --yt-spec-base-background:#04140A!important;
  --yt-spec-raised-background:#0A2414!important;
  --yt-spec-menu-background:#0A2414!important;
  --yt-spec-general-background-a:#0A2414!important;
  --yt-spec-general-background-b:#071B0F!important;
  --yt-spec-general-background-c:#02100A!important;
  --yt-spec-additive-background:#0F3018!important;
  --yt-spec-brand-background-primary:#02391C!important;
  --yt-spec-brand-background-solid:#02391C!important;
  --yt-spec-text-primary:#FFF6D5!important;
  --yt-spec-text-secondary:#CFE3C9!important;
  --yt-spec-call-to-action:#FFE44D!important;
  --yt-spec-themed-blue:#FFE44D!important;
  --yt-spec-static-brand-red:#009C3B!important;
  --yt-spec-brand-button-background:#009C3B!important;
  --yt-spec-icon-active-other:#FFDF00!important;
  --yt-spec-badge-chip-background:#0F3018!important;
  --yt-spec-10-percent-layer:#1A4028!important;
  --yt-brand-youtube-red:#009C3B!important;
}
html.${ROOT_CLASS}.${FULL_CLASS},html.${ROOT_CLASS}.${FULL_CLASS} body,html.${ROOT_CLASS}.${FULL_CLASS} ytd-app{
  background:#04140A!important;transition:background-color .3s ease;
}
html.${ROOT_CLASS}.${FULL_CLASS} #masthead-container,html.${ROOT_CLASS}.${FULL_CLASS} ytd-masthead{
  background:#02391C!important;transition:background-color .3s ease;
}
html.${ROOT_CLASS}.${FULL_CLASS} .yt-spec-button-shape-next--filled,
html.${ROOT_CLASS}.${FULL_CLASS} #subscribe-button button,
html.${ROOT_CLASS}.${FULL_CLASS} #subscribe-button tp-yt-paper-button{background:#009C3B!important;color:#FFF6D5!important;}
html.${ROOT_CLASS}.${FULL_CLASS} yt-chip-cloud-chip-renderer[selected],
html.${ROOT_CLASS}.${FULL_CLASS} yt-chip-cloud-chip-renderer[aria-selected="true"]{background:#009C3B!important;color:#04140A!important;}
html.${ROOT_CLASS}.${FULL_CLASS} yt-live-chat-text-message-renderer #author-name,
html.${ROOT_CLASS}.${FULL_CLASS} yt-live-chat-author-chip #author-name{color:#FFE44D!important;}

/* ===== Decorative nodes (injected by this module while active) ===== */
.zd-hexa-badge{
  display:inline-flex;align-items:center;height:26px;padding-right:11px;gap:7px;
  border-radius:8px;overflow:hidden;background:linear-gradient(#0A311D,#04220F);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 2px 8px rgba(0,0,0,.4);
  color:#FFF6D5;font:800 10.5px/1 Roboto,"Segoe UI",system-ui,sans-serif;
  letter-spacing:.7px;white-space:nowrap;vertical-align:middle;
  animation:zd-hexa-pop .34s ${SPRING} both;
}
.zd-hexa-badge .zd-hexa-cap{align-self:stretch;width:7px;flex:none;background:linear-gradient(#009C3B 0 33%,#FFDF00 33% 66%,#002776 66% 100%);}
.zd-hexa-badge .zd-hexa-badge-label{padding-left:2px;}
.zd-hexa-badge .zd-hexa-stars{display:inline-flex;gap:1px;font-size:11px;letter-spacing:1px;}
.zd-hexa-badge .zd-hexa-star-on{color:#FFDF00;}
.zd-hexa-badge .zd-hexa-star-6{color:#5b8cff;}
.zd-hexa-badge--masthead{margin:0 10px;align-self:center;}
/* Bottom-right, clear of the title/cards (top) and above the control bar
   (bottom). Stays inside #movie_player so it shows in fullscreen too. */
.zd-hexa-gol{
  position:absolute;right:18px;bottom:74px;z-index:60;cursor:pointer;
  border:2px solid #009C3B;border-radius:999px;padding:10px 20px;
  background:linear-gradient(#FFE44D,#FFC400);
  color:#04140A;font:900 16px/1 Roboto,system-ui,sans-serif;letter-spacing:.5px;
  box-shadow:0 4px 14px rgba(0,0,0,.5),0 0 0 3px rgba(255,223,0,.22);
  transition:transform .18s ${SPRING},box-shadow .2s ease;
  animation:zd-hexa-pop .34s ${SPRING} both,zd-hexa-golpulse 1.8s ease-in-out .5s infinite;
}
.zd-hexa-gol:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 6px 18px rgba(0,0,0,.55),0 0 0 4px rgba(255,223,0,.35);}
.zd-hexa-gol:active{transform:translateY(0) scale(.96);}
.zd-hexa-gol:focus-visible{outline:3px solid #FFF6D5;outline-offset:2px;}
@keyframes zd-hexa-golpulse{0%,100%{box-shadow:0 4px 14px rgba(0,0,0,.5),0 0 0 3px rgba(255,223,0,.22);}50%{box-shadow:0 4px 18px rgba(0,0,0,.5),0 0 0 8px rgba(255,223,0,.04);}}
.zd-hexa-toast{
  position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(8px);
  z-index:2147483646;display:flex;align-items:center;gap:8px;padding:11px 17px;
  border-radius:999px;background:#02391C;border:1px solid #FFDF00;color:#FFF6D5;
  font:700 13px/1 Roboto,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.5);
  opacity:0;transition:opacity .3s ease,transform .38s ${SPRING};
}
.zd-hexa-toast.zd-hexa-in{opacity:1;transform:translateX(-50%) translateY(0);}
.zd-hexa-confetti{position:fixed;inset:0;z-index:2147483645;pointer-events:none;overflow:hidden;animation:zd-hexa-resolve .4s ease both;}
.zd-hexa-confetti i{position:absolute;top:-24px;width:8px;height:14px;border-radius:2px;animation:zd-hexa-fall linear forwards;}
/* Some pieces are tricolor pennants; others are little Brazil flags. */
.zd-hexa-confetti i.zd-hexa-flag{width:13px;height:9px;border-radius:1px;}
.zd-hexa-confetti i.zd-hexa-bandeira{width:15px;height:11px;border-radius:1px;background:#009C3B;overflow:hidden;}
.zd-hexa-confetti i.zd-hexa-bandeira::before{content:'';position:absolute;left:50%;top:50%;width:8px;height:8px;transform:translate(-50%,-50%) rotate(45deg);background:#FFDF00;}
.zd-hexa-confetti i.zd-hexa-bandeira::after{content:'';position:absolute;left:50%;top:50%;width:3.6px;height:3.6px;transform:translate(-50%,-50%);border-radius:50%;background:#002776;}
@keyframes zd-hexa-fall{to{transform:translateY(110vh) rotate(600deg);opacity:.85;}}
/* The burst materializes from a degraded blur to sharp before it falls. */
@keyframes zd-hexa-resolve{from{filter:blur(7px);opacity:0;}to{filter:blur(0);opacity:1;}}
/* Nodes resolve from a degraded (blurred) state to sharp — the product's
   degraded -> nitido signature, wearing the jersey. */
@keyframes zd-hexa-pop{from{opacity:0;transform:scale(.9);filter:blur(4px);}to{opacity:1;filter:blur(0);}}

/* Activation "boot": a full-screen tricolor that resolves from blurred + scanline
   (degraded) to sharp, then clears — the page putting on the shirt in the same
   pixel -> nitido gesture the extension uses on the stream. One-shot; removed by JS. */
.zd-hexa-boot{
  position:fixed;inset:0;z-index:2147483644;pointer-events:none;
  background:linear-gradient(180deg,#009C3B 0 34%,#FFDF00 34% 67%,#002776 67% 100%);
  animation:zd-hexa-boot .8s ease forwards;
}
.zd-hexa-boot::after{
  content:'';position:absolute;inset:0;mix-blend-mode:multiply;
  background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 2px,transparent 2px 5px);
}
@keyframes zd-hexa-boot{
  0%{opacity:0;filter:blur(11px) saturate(1.6);transform:scale(1.06);}
  22%{opacity:.92;}
  55%{filter:blur(0) saturate(1);transform:scale(1);}
  100%{opacity:0;filter:blur(0);transform:scale(1);}
}

/* Opt-in invite: shown (theme still OFF) when a live Brazil game is detected.
   Clearly ZeroDelay's (carries the badge), never posing as YouTube. */
.zd-hexa-invite{
  position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(10px);
  z-index:2147483646;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  max-width:min(92vw,460px);padding:12px 14px;border-radius:14px;
  background:#02391C;border:1px solid #FFDF00;color:#FFF6D5;
  font:600 13px/1.35 Roboto,"Segoe UI",system-ui,sans-serif;
  box-shadow:0 10px 30px rgba(0,0,0,.55);
  opacity:0;transition:opacity .3s ease,transform .38s ${SPRING};
}
.zd-hexa-invite.zd-hexa-in{opacity:1;transform:translateX(-50%) translateY(0);}
.zd-hexa-invite-msg{flex:1 1 170px;min-width:0;}
.zd-hexa-invite-cta{
  flex:none;border:0;border-radius:999px;padding:8px 16px;cursor:pointer;
  background:linear-gradient(#FFDF00,#F5C400);color:#04140A;
  font:800 13px/1 Roboto,system-ui,sans-serif;letter-spacing:.3px;
}
.zd-hexa-invite-no{
  flex:none;border:0;background:transparent;color:#CFE3C9;cursor:pointer;
  padding:8px 6px;font:600 12px/1 Roboto,system-ui,sans-serif;
  text-decoration:underline;text-underline-offset:2px;
}
.zd-hexa-invite-cta:focus-visible,.zd-hexa-invite-no:focus-visible{
  outline:2px solid #FFF6D5;outline-offset:2px;
}

/* ===== Accessibility: honor reduced motion & forced colors ===== */
@media (prefers-reduced-motion: reduce){
  html.${ROOT_CLASS}.${FULL_CLASS},html.${ROOT_CLASS}.${FULL_CLASS} body,html.${ROOT_CLASS}.${FULL_CLASS} ytd-app,
  html.${ROOT_CLASS}.${FULL_CLASS} #masthead-container,html.${ROOT_CLASS}.${FULL_CLASS} ytd-masthead{transition:none!important;}
  .zd-hexa-badge,.zd-hexa-gol,.zd-hexa-toast{animation:none!important;}
  .zd-hexa-bunting,.zd-hexa-bunting i{animation:none!important;}
  html.${ROOT_CLASS} .ytp-play-progress{animation:none!important;}
  .zd-hexa-toast{transition:none!important;}
  .zd-hexa-invite{transition:none!important;opacity:1!important;transform:translateX(-50%)!important;}
  .zd-hexa-gol,.zd-hexa-confetti,.zd-hexa-boot{display:none!important;} /* no confetti/boot -> hide trigger */
}
@media (forced-colors: active){
  .zd-hexa-bunting,.zd-hexa-confetti,.zd-hexa-boot{display:none!important;}
}
`;

const reduceMotion = () =>
    typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let installed = false;
let active = false;
let keepAlive = null;              // re-attaches decorative nodes after re-renders
let inviteTimer = null;            // auto-dismiss timer for the opt-in invite
const nodes = { badgeMast: null, bunting: null, gol: null, invite: null };

/** Insert the dormant <style> once. Cheap; does nothing on repeat calls. */
export function install() {
    if (installed) return;
    installed = true;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
}

/**
 * Turn the theme on/off by toggling the single root class + managing nodes.
 * @param {boolean} on
 * @param {string} [activatedLabel] - Localized "activated" toast text (page world has no chrome.i18n).
 */
export function setActive(on, activatedLabel) {
    on = !!on;
    if (on === active) return;
    active = on;
    document.documentElement.classList.toggle(ROOT_CLASS, on);
    if (on) {
        hideInvite();
        playBoot();
        ensureNodes();
        keepAlive = setInterval(ensureNodes, 1000);
        showToast(activatedLabel);
    } else {
        clearInterval(keepAlive);
        keepAlive = null;
        document.documentElement.classList.remove(FULL_CLASS);
        removeNodes();
    }
}

/**
 * Toggle the optional "full theme" (broad page repaint). No-op unless the base
 * theme is on. Off by default; a popup sub-toggle drives it.
 * @param {boolean} on
 */
export function setFull(on) {
    document.documentElement.classList.toggle(FULL_CLASS, !!on);
}

/**
 * Show the opt-in invite (theme stays OFF until the user accepts). Content.js
 * passes localized strings and the callbacks; this module owns only the DOM.
 * @param {{message:string, cta:string, dismiss:string, onAccept:Function, onDismiss:Function}} opts
 */
export function showInvite({ message, cta, dismiss, onAccept, onDismiss } = {}) {
    if (active) return;               // already on — nothing to offer
    hideInvite();
    const card = make('div', 'zd-hexa-invite');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', message || 'Modo Hexa');
    const yes = make('button', 'zd-hexa-invite-cta', cta || 'Ativar');
    yes.type = 'button';
    const no = make('button', 'zd-hexa-invite-no', dismiss || 'Agora não');
    no.type = 'button';
    yes.addEventListener('click', () => { hideInvite(); if (onAccept) onAccept(); });
    no.addEventListener('click', () => { hideInvite(); if (onDismiss) onDismiss(); });
    card.append(buildBadge(), make('span', 'zd-hexa-invite-msg', message), yes, no);
    document.body.appendChild(card);
    requestAnimationFrame(() => card.classList.add('zd-hexa-in'));
    nodes.invite = card;
    clearTimeout(inviteTimer);
    inviteTimer = setTimeout(hideInvite, 15000);   // an offer, not a nag
}

/** Dismiss the invite (no-op if none is showing). */
export function hideInvite() {
    clearTimeout(inviteTimer);
    inviteTimer = null;
    const card = nodes.invite;
    if (!card) return;
    nodes.invite = null;
    card.classList.remove('zd-hexa-in');
    setTimeout(() => card.remove(), 300);
}

// --- DOM helpers (textContent only — no innerHTML) --------------------------
function make(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
}

function buildBadge() {
    const b = make('span', 'zd-hexa-badge');
    b.append(make('span', 'zd-hexa-cap'));                          // tricolor left cap
    b.append(make('span', 'zd-hexa-badge-label', 'RUMO AO HEXA'));
    const stars = make('span', 'zd-hexa-stars');
    stars.append(make('span', 'zd-hexa-star-on', '★★★★★'));         // 5 titles, gold
    stars.append(make('span', 'zd-hexa-star-6', '★'));             // the aspirational 6th, in blue
    b.append(stars);
    return b;
}

// Re-inserts any decorative node YouTube's re-render may have detached. Called
// on activate and once per second while active; each check is a cheap
// isConnected test, re-adding only when needed.
function ensureNodes() {
    ensureMastheadBadge();
    ensureBunting();
    ensureGolButton();
}

function buildBunting() {
    const b = make('div', 'zd-hexa-bunting');
    const colors = ['#009C3B', '#FFDF00', '#002776'];
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('i');
        p.style.setProperty('--c', colors[i % 3]);
        p.style.animationDelay = ((i % 6) * 0.12) + 's';   // a travelling wave along the string
        b.appendChild(p);
    }
    return b;
}

function ensureBunting() {
    if (nodes.bunting && nodes.bunting.isConnected) return;
    if (!document.getElementById('masthead-container')) return; // wait for the masthead
    nodes.bunting = buildBunting();
    document.body.appendChild(nodes.bunting);                    // fixed; on body so nothing clips it
}

function ensureMastheadBadge() {
    if (nodes.badgeMast && nodes.badgeMast.isConnected) return;
    const host = document.querySelector('ytd-masthead #end');
    if (!host) return;
    nodes.badgeMast = buildBadge();
    nodes.badgeMast.classList.add('zd-hexa-badge--masthead');
    host.insertBefore(nodes.badgeMast, host.firstChild);
}

function ensureGolButton() {
    if (nodes.gol && nodes.gol.isConnected) return;
    const player = document.getElementById('movie_player');
    if (!player) return;
    const btn = make('button', 'zd-hexa-gol', '⚽ GOL!');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Comemorar gol do Brasil');
    btn.addEventListener('click', fireConfetti);
    nodes.gol = btn;
    player.appendChild(btn);
}

function removeNodes() {
    for (const k of Object.keys(nodes)) {
        if (nodes[k]) { nodes[k].remove(); nodes[k] = null; }
    }
    clearTimeout(inviteTimer);
    inviteTimer = null;
    document.querySelectorAll('.zd-hexa-confetti,.zd-hexa-toast,.zd-hexa-invite').forEach(n => n.remove());
}

// Goal celebration — explicit, user-triggered via the GOL! button. Skipped
// entirely under reduced-motion (and the button is CSS-hidden there too).
function fireConfetti() {
    if (reduceMotion()) return;
    const layer = make('div', 'zd-hexa-confetti');
    const colors = ['#009C3B', '#FFDF00', '#002776'];   // flag colors, no ivory
    const TRICOLOR = 'linear-gradient(#009C3B 0 33%,#FFDF00 33% 66%,#002776 66% 100%)';
    for (let i = 0; i < 46; i++) {
        const p = document.createElement('i');
        p.style.left = Math.random() * 100 + 'vw';
        const r = i % 5;
        if (r === 0) {                                  // little Brazil flag
            p.className = 'zd-hexa-bandeira';
        } else if (r === 1) {                           // tricolor pennant
            p.className = 'zd-hexa-flag';
            p.style.background = TRICOLOR;
        } else {                                        // flat confetti
            p.style.background = colors[i % colors.length];
        }
        p.style.animationDuration = (1.4 + Math.random() * 1.0) + 's';
        p.style.animationDelay = (Math.random() * 0.25) + 's';
        layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 2800);
}

// One-shot "boot" flash on activation: a tricolor that resolves blur -> sharp,
// then clears (the page putting on the jersey). Skipped under reduced motion.
function playBoot() {
    if (reduceMotion()) return;
    const b = make('div', 'zd-hexa-boot');
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 850);
}

function showToast(text) {
    const t = make('div', 'zd-hexa-toast', '🇧🇷 ' + (text || 'Modo Hexa ativado'));
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('zd-hexa-in'));
    setTimeout(() => {
        t.classList.remove('zd-hexa-in');
        setTimeout(() => t.remove(), 350);
    }, 3000);
}
