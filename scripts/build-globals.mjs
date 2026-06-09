import fs from 'fs';
const lines = fs.readFileSync('nobodito-enhanced-5 (1).html','utf8').split('\n');
const slice=(a,b)=>lines.slice(a-1,b).join('\n');
let css = [
  slice(14,2969), slice(30212,33894), slice(33902,34040), slice(35472,35648)
].join('\n');

// 1) strip all CSS comments
css = css.replace(/\/\*[\s\S]*?\*\//g, '');

// 2) drop orphan banner artifacts left by malformed source comments
css = css.split('\n').filter(line=>{
  const t=line.trim();
  if(t==='') return true;
  if(/[═-╿]/.test(t)) return false;      // box-drawing decorative lines
  if(t==='*/'||t==='/*') return false;             // orphan delimiters
  // orphan ALL-CAPS title line with no CSS punctuation
  if(/^[A-Z0-9][A-Z0-9 &/+,.'—–-]*$/.test(t) && !/[{};:]/.test(t)) return false;
  return true;
}).join('\n');

const overrides = `

:root{
  --fh:var(--font-bebas), 'Bebas Neue', sans-serif;
  --fb:var(--font-rajdhani), 'Rajdhani', sans-serif;
  --fo:var(--font-orbitron), 'Orbitron', sans-serif;
}
body{cursor:auto}
#main{opacity:1 !important}
.page{display:block}

/* ===== PERFORMANCE ===== */
/* GPU-promote continuously-animated hero layers (they animate transform/opacity = composited) */
.h-li,.h-sp-c,.h-sp-r,.orb,.h-lg{will-change:transform}
/* Stop per-frame filter repaint: move the heavy logo drop-shadow off the ANIMATED image
   onto its static wrapper. Same look, no repaint while the image floats. */
.h-li{filter:none !important}
.h-lw{filter:drop-shadow(0 0 28px rgba(57,211,83,.28)) drop-shadow(0 18px 35px rgba(0,0,0,.45))}
/* Isolate hero painting from the rest of the page */
.hero{contain:layout paint}
/* Skip rendering/painting heavy sections while they're off-screen (big scroll win).
   intrinsic-size keeps the scrollbar stable before first paint. */
.feat-events,.ntp-section,.shop-preview,.cta-band,.g3,.qstats,#site-footer{
  content-visibility:auto;contain-intrinsic-size:auto 640px;
}
/* Custom-cursor JS isn't ported — restore a normal cursor everywhere */
*{cursor:auto}
a,button,.btn,.lb,.ab,[onclick],[role="button"],.glass[href],.ev3d-cta,.shop3d-btn{cursor:pointer}

/* Scroll-reveal, robust version.
   The source gated content with .rv{opacity:0} until JS added .sh. That fails
   blank if JS/IntersectionObserver doesn't fire (headless renderers, no-JS,
   background tabs). Make content visible by default and drive the reveal with a
   pure-CSS scroll timeline — no JS, fails safe. */
.rv{opacity:1 !important;transform:none !important}
@media (prefers-reduced-motion: no-preference){
  @supports (animation-timeline: view()){
    .rv{
      animation:rvIn .8s var(--e1) both;
      animation-timeline:view();
      animation-range:entry 0% cover 28%;
    }
    @keyframes rvIn{
      from{opacity:0;transform:translateY(28px) scale(.985)}
      to{opacity:1;transform:none}
    }
  }
}

/* ===== BALANCED PERF (v2) ===== */
/* backdrop-filter:blur is cheap to write, expensive per frame (re-blurs the pixels
   behind it every scroll tick). Keep it ONLY on the fixed navbar + mobile menu at a
   small radius; drop it on scrolling content panels and make them solid enough to read. */
.glass,.rkt,.mcard,.rg-s,.ci{backdrop-filter:none !important;-webkit-backdrop-filter:none !important}
.glass{background:rgba(10,16,8,.9) !important}
#nb.sc::before{backdrop-filter:blur(12px) !important;-webkit-backdrop-filter:blur(12px) !important}
#mm{backdrop-filter:blur(16px) !important;-webkit-backdrop-filter:blur(16px) !important}

/* Hero title glow: collapse 3 stacked drop-shadows into 1. Stacked blurred shadows
   repaint a large area; one is visually ~the same on a dark bg. */
.ht .ac{filter:drop-shadow(0 0 22px rgba(255,184,0,.7)) !important}
.ht .go{filter:drop-shadow(0 0 20px rgba(57,211,83,.55)) !important}

/* Freeze the 3 rotating spotlight rings — 3 perpetual animations, negligible payoff. */
.h-sp-r{animation:none !important}

/* Pause ALL hero animations when the hero scrolls out of view (class set by HeroMotion).
   Fails safe: if JS/IO never runs, animations just keep playing as before. */
.hero.motion-off,.hero.motion-off *{animation-play-state:paused !important}

/* Respect reduced-motion: kill the infinite animations entirely */
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{
    animation-duration:.001ms !important;animation-iteration-count:1 !important;
    transition-duration:.001ms !important;scroll-behavior:auto !important;
  }
}
`;
fs.writeFileSync('novodito-web/src/app/globals.css', css+overrides);
// sanity: report any leftover stray '*/' or lone box chars
const leftover = (css.match(/\*\//g)||[]).length;
console.log('written lines:', (css+overrides).split('\n').length, 'leftover */:', leftover);
