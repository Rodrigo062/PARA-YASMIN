/* ===== marca-d'água + flores ===== */
const bg = document.getElementById("bg");

// defs: símbolo simples de flor (6 pétalas)
const bgDefs = document.createElementNS("http://www.w3.org/2000/svg","defs");
bgDefs.innerHTML = `
  <g id="flower">
    <circle r="6" fill="black" opacity=".12"/>
    <g opacity=".12">
      <ellipse rx="4" ry="10" transform="rotate(0)"  cx="0" cy="-12" fill="black"/>
      <ellipse rx="4" ry="10" transform="rotate(60)" cx="0" cy="-12" fill="black"/>
      <ellipse rx="4" ry="10" transform="rotate(120)"cx="0" cy="-12" fill="black"/>
      <ellipse rx="4" ry="10" transform="rotate(180)"cx="0" cy="-12" fill="black"/>
      <ellipse rx="4" ry="10" transform="rotate(240)"cx="0" cy="-12" fill="black"/>
      <ellipse rx="4" ry="10" transform="rotate(300)"cx="0" cy="-12" fill="black"/>
    </g>
  </g>
`;
bg.appendChild(bgDefs);

// texto Yasmim (marca d'água)
const water = document.createElementNS("http://www.w3.org/2000/svg","text");
water.setAttribute("x","50%");
water.setAttribute("y","50%");
water.setAttribute("text-anchor","middle");
water.setAttribute("dominant-baseline","middle");
water.setAttribute("fill","black");
water.setAttribute("opacity",".07");
water.setAttribute("style",`
  font-size: 16vw;
  font-weight: 900;
  font-family: "Georgia", "Times New Roman", serif;
  letter-spacing: .04em;
`);
water.textContent = "Yasmim";
bg.appendChild(water);

// coro de flores ao redor do texto
const w = () => bg.clientWidth;
const h = () => bg.clientHeight;
function placeFlowers(){
  // limpa anteriores (exceto defs e texto)
  [...bg.querySelectorAll(".fuse")].forEach(n=>n.remove());

  const cx = w()/2, cy = h()/2;
  const R = Math.min(w(),h())*0.33;
  const ringCounts = [8, 12]; // dois anéis

  ringCounts.forEach((count, ringIdx)=>{
    for(let i=0;i<count;i++){
      const ang = (i/count)*Math.PI*2 + (ringIdx? Math.PI/count : 0);
      const r = R*(0.86 + ringIdx*0.18);
      const x = cx + Math.cos(ang)*r;
      const y = cy + Math.sin(ang)*r;
      const g = document.createElementNS("http://www.w3.org/2000/svg","use");
      g.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","#flower");
      g.setAttribute("transform",`translate(${x},${y}) scale(${ringIdx?1.1:1.35}) rotate(${ang*180/Math.PI})`);
      g.setAttribute("class","fuse");
      bg.appendChild(g);
    }
  });
}
placeFlowers();
addEventListener("resize", placeFlowers);

/* ===== dragão melhorado ===== */
const svg = document.getElementById("dragon");
const N = 80;
const elems = [];
let mouse = { x: innerWidth/2, y: innerHeight/2 };

// gradiente e forma do segmento
const defs = document.createElementNS("http://www.w3.org/2000/svg","defs");
defs.innerHTML = `
  <linearGradient id="dragonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="black" stop-opacity="1"/>
    <stop offset="60%"  stop-color="black" stop-opacity=".6"/>
    <stop offset="100%" stop-color="black" stop-opacity="0"/>
  </linearGradient>
  <path id="seg" d="M-30 -8 Q0 -30 30 -8 Q0 20 -30 -8Z" fill="url(#dragonGrad)" />
`;
svg.appendChild(defs);

// segmentos
for(let i=0;i<N;i++){
  const use = document.createElementNS("http://www.w3.org/2000/svg","use");
  use.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","#seg");
  svg.appendChild(use);
  elems.push({x: mouse.x, y: mouse.y, use});
}

// trilhas (linhas fluidas de fundo)
const trails = [];
for(let i=0;i<12;i++){
  const p = document.createElementNS("http://www.w3.org/2000/svg","path");
  p.setAttribute("stroke","black");
  p.setAttribute("stroke-opacity",".25");
  p.setAttribute("fill","none");
  p.setAttribute("stroke-width","1.2");
  svg.insertBefore(p, svg.firstChild);
  trails.push(p);
}

addEventListener("mousemove", e => { mouse.x=e.clientX; mouse.y=e.clientY; });

let t=0;
(function run(){
  requestAnimationFrame(run);
  t += 0.05;

  // cabeça
  let e = elems[0];
  e.x += (mouse.x - e.x)/6;
  e.y += (mouse.y - e.y)/6;

  // corpo
  for(let i=1;i<N;i++){
    e = elems[i];
    const ep = elems[i-1];
    const a = Math.atan2(e.y-ep.y, e.x-ep.x);
    const wave = Math.sin(t + i/5) * 5;

    e.x += (ep.x - e.x)/1.9 + Math.cos(a + Math.PI/2)*wave*0.2;
    e.y += (ep.y - e.y)/1.9 + Math.sin(a + Math.PI/2)*wave*0.2;

    const s = 1.25 - i/N;
    const opacity = 0.75 * (1 - i/N);

    e.use.setAttribute("transform",
      `translate(${(ep.x+e.x)/2}, ${(ep.y+e.y)/2})
       rotate(${(180/Math.PI)*a})
       scale(${s})`);
    e.use.setAttribute("opacity", opacity);
  }

  // trilhas
  trails.forEach((path, idx) => {
    const points = elems
      .filter((_, i) => i%4===0)
      .map((p, i) => [
        p.x + Math.sin(t + i/2 + idx)*50,
        p.y + Math.cos(t + i/2 + idx)*50
      ]);
    const d = "M" + points.map(p=>p.join(",")).join(" L");
    path.setAttribute("d", d);
  });
})();
