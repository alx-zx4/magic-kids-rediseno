/* ═══════════════════════════════════════════════════════════
   MAGIC KIDS — interacciones (index.html + servicios.html)
   Cada bloque revisa si su sección existe.
   ═══════════════════════════════════════════════════════════ */

/* [EDITAR] Número de WhatsApp — fuente única para todo el sitio */
var SALON_WHATSAPP = '528113383768';
/* [EDITAR] Link de la página de Facebook (cuando lo tengas). Las publicaciones
   individuales se cambian en el href de cada <a class="fb-post"> del HTML. */
var SALON_FACEBOOK = '';

(function(){
  var $ = function(s,c){ return (c||document).querySelector(s); };
  var $$ = function(s,c){ return [].slice.call((c||document).querySelectorAll(s)); };
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mqMobile = window.matchMedia('(max-width: 820px)');
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function rand(a,b){ return a + Math.random()*(b-a); }

  /* ── Links de WhatsApp / teléfono / Facebook ── */
  $$('.js-wa-link').forEach(function(a){
    var msg = a.getAttribute('data-wa-msg') || 'Hola, quiero cotizar una fiesta infantil';
    a.href = 'https://wa.me/' + SALON_WHATSAPP + '?text=' + encodeURIComponent(msg);
  });
  $$('.js-tel-link').forEach(function(a){ a.href = 'tel:+' + SALON_WHATSAPP; });
  if(SALON_FACEBOOK) $$('a[data-fb-link]').forEach(function(a){ if(a.getAttribute('href')==='#') a.href = SALON_FACEBOOK; });
  $$('a[data-fb-link][href="#"]').forEach(function(a){ a.removeAttribute('target'); a.addEventListener('click', function(e){ e.preventDefault(); }); });
  var y = $('#ftYear'); if(y) y.textContent = new Date().getFullYear();

  /* ── Smooth scroll (Lenis) ── */
  var lenis = null;
  if(typeof Lenis !== 'undefined'){
    lenis = new Lenis({ duration:1.15, easing:function(t){ return Math.min(1, 1.001 - Math.pow(2, -10*t)); } });
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  window.__lenis = lenis;
  /* Lenis mide el alto de la página UNA vez al cargar. Si algo cambia ese
     alto después (el pin de la galería se pone altísimo a propósito para
     poder "scrollear" las fotos, un FAQ se abre, una imagen carga tarde…),
     Lenis se queda con el límite de scroll viejo y el scroll se traba a
     medio camino — eso era el "efecto que no sirve". Un ResizeObserver en
     <body> avisa a Lenis cada vez que el alto real cambia, sin tener que
     acordarse de llamar resize() a mano en cada script. */
  if(lenis){
    if('ResizeObserver' in window){
      var lenisResizeTimer;
      new ResizeObserver(function(){
        clearTimeout(lenisResizeTimer);
        lenisResizeTimer = setTimeout(function(){ lenis.resize(); }, 50);
      }).observe(document.body);
    }
    /* Red de seguridad extra: el ResizeObserver puede perderse un cambio
       de alto tardío (p.ej. cuando la fuente Baloo 2 termina de cargar y
       reacomoda todos los títulos del sitio, varios cientos de px en una
       página larga) sin volver a dispararse. Estos disparos de respaldo
       cubren ese caso sin depender de que algo más avise. */
    window.addEventListener('load', function(){ lenis.resize(); });
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ lenis.resize(); });
    setTimeout(function(){ lenis.resize(); }, 1200);
    setTimeout(function(){ lenis.resize(); }, 3000);
  }
  function goTo(target){
    if(lenis) lenis.scrollTo(target, { offset:-70, duration:1.4 });
    else target.scrollIntoView({ behavior:'smooth' });
  }
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href'); if(id.length < 2) return;
      var t = document.querySelector(id); if(!t) return;
      e.preventDefault(); setMenu(false); goTo(t);
    });
  });

  /* ── TOPBAR original: color al hacer scroll + menú móvil ── */
  var hasHero = !!$('#hero'), nav = $('#main-nav'), burger = $('#navBurger'), panel = $('#navMobile'), waF = $('.wa-float');
  function onScroll(){
    if(nav) nav.classList.toggle('scrolled', !hasHero || window.scrollY > 50);
    if(waF) waF.classList.toggle('show', window.scrollY > window.innerHeight*.6);
  }
  window.addEventListener('scroll', onScroll, { passive:true }); onScroll();
  function setMenu(open){
    if(!burger || !panel) return;
    burger.classList.toggle('open', open); panel.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if(burger) burger.addEventListener('click', function(){ setMenu(!burger.classList.contains('open')); });

  /* ── Apariciones al hacer scroll ── */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold:.12, rootMargin:'0px 0px -5% 0px' });
    $$('.rv').forEach(function(el){ io.observe(el); });
  } else $$('.rv').forEach(function(el){ el.classList.add('in'); });

  /* ── TÍTULOS: revelado VCR letra por letra (original) ── */
  $$('.vcr').forEach(function(el){
    var words = (el.getAttribute('data-vcr') || '').split(' '), ci = 0;
    el.setAttribute('aria-label', el.getAttribute('data-vcr'));
    el.innerHTML = words.map(function(word){
      return '<span class="vcr-word" aria-hidden="true">' + Array.from(word).map(function(ch){
        return '<span class="vcr-char"><span class="vcr-char-inner" style="transition-delay:'+(ci++*0.028).toFixed(3)+'s">'+ch+'</span></span>';
      }).join('') + '</span>';
    }).join('');
  });
  (function(){
    var o = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('revealed'); o.unobserve(e.target); } });
    }, { threshold:.12 });
    $$('.vcr').forEach(function(el){ o.observe(el); });
  })();

  /* ── TÍTULOS: palabra circulada a mano (original) ──
     [EDITAR] La palabra se elige con data-circle="..." en cada título. El
     color del trazo es el mismo del título (blanco o azul marino). */
  (function(){
    var NS = 'http://www.w3.org/2000/svg';
    function norm(s){ return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[.,!?;:'"¿¡]/g,''); }
    function ovalPath(cx,cy,rx,ry){
      var f = function(n){ return Math.round(n*10)/10; };
      var sx=f(cx+rx*.78), sy=f(cy-ry*.95), ex=f(cx+rx*.78), ey=f(cy-ry*.55);
      return ['M',sx,sy,'C',f(cx+rx*1.44),f(cy),f(cx+rx),f(cy+ry*.82),f(cx),f(cy+ry),
        'C',f(cx-rx*.78),f(cy+ry),f(cx-rx),f(cy+ry*.82),f(cx-rx),f(cy),
        'C',f(cx-rx),f(cy-ry*.82),f(cx-rx*.56),f(cy-ry),f(cx),f(cy-ry),
        'C',f(cx+rx*.56),f(cy-ry),ex,ey,ex,ey].join(' ');
    }
    function spawn(titleEl, span, color){
      var tr = titleEl.getBoundingClientRect(), sr = span.getBoundingClientRect();
      if(sr.width < 4 || sr.height < 4) return null;
      var ox = sr.left-tr.left, oy = sr.top-tr.top, w = sr.width, h = sr.height;
      var px = Math.max(8,w*.045), py = Math.max(4,h*.1), W = w+px*2, H = h+py*2;
      var rx = Math.max(W/2-2,(H/2-2)*1.7), ry = Math.max(Math.min(H/2-2, rx/1.7), 5);
      var svg = document.createElementNS(NS,'svg');
      svg.setAttribute('viewBox','0 0 '+W+' '+H); svg.setAttribute('aria-hidden','true'); svg.setAttribute('class','circle-word');
      svg.style.cssText = 'position:absolute;left:'+(ox-px)+'px;top:'+(oy-py)+'px;width:'+W+'px;height:'+H+'px;pointer-events:none;overflow:visible';
      var p = document.createElementNS(NS,'path');
      p.setAttribute('d', ovalPath(W/2,H/2,rx,ry)); p.setAttribute('fill','none'); p.setAttribute('stroke',color);
      p.setAttribute('stroke-width','3'); p.setAttribute('stroke-linecap','round'); p.setAttribute('stroke-linejoin','round');
      svg.appendChild(p); titleEl.insertBefore(svg, titleEl.firstChild);
      var len = p.getTotalLength() || 600;
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.style.transition = 'none';
      return p;
    }
    var items = [];
    $$('.vcr[data-circle]').forEach(function(el){
      var target = norm(el.getAttribute('data-circle'));
      var color = el.classList.contains('light') ? 'rgba(255,255,255,0.85)' : 'rgba(16,24,76,0.8)';
      $$('.vcr-word', el).forEach(function(span){ if(norm(span.textContent) === target) items.push({ el:el, span:span, color:color }); });
    });
    function fire(it){
      if(it.fired || !it.p) return; it.fired = true;
      it.span.classList.add('circle-pop');
      it.span.addEventListener('animationend', function h(){ it.span.classList.remove('circle-pop'); it.span.removeEventListener('animationend', h); });
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        it.p.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.43,0.13,0.23,0.96)'; it.p.style.strokeDashoffset = '0';
      }); });
    }
    function build(){
      items.forEach(function(it){
        if(it.svg) it.svg.remove();
        it.p = spawn(it.el, it.span, it.color); it.svg = it.p && it.p.parentNode;
        if(it.fired && it.p){ it.p.style.strokeDashoffset = '0'; }
      });
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){
      build();
      var o = new IntersectionObserver(function(es){
        es.forEach(function(e){ if(!e.isIntersecting) return; var it = items.find(function(x){ return x.span === e.target; }); if(it){ setTimeout(function(){ fire(it); }, 700); o.unobserve(e.target); } });
      }, { threshold:.4 });
      items.forEach(function(it){ o.observe(it.span); });
      var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(build, 200); });
    });
  })();

  /* ── HERO: parallax de los globos con el cursor (original) ── */
  (function(){
    var h = $('#hero'), fx = h && $('.hero-fx', h); if(!fx || !fine) return;
    h.addEventListener('pointermove', function(e){
      var r = h.getBoundingClientRect();
      fx.style.setProperty('--hx', (((e.clientX-r.left)/r.width-.5)*-1).toFixed(3));
      fx.style.setProperty('--hy', (((e.clientY-r.top)/r.height-.5)*-1).toFixed(3));
    });
    h.addEventListener('pointerleave', function(){ fx.style.setProperty('--hx',0); fx.style.setProperty('--hy',0); });
  })();

  /* ── LISTÓN ONDULADO con los tipos de fiesta (original) ── */
  (function(){
    var wrap = $('#heroBelt'), svg = $('#heroBeltSvg'); if(!wrap || !svg) return;
    var NS = 'http://www.w3.org/2000/svg';
    var TIPOS = ['Fiestas infantiles','Cumpleaños temáticos','Baby shower','Bautizos','Primeras comuniones','Posadas','Graduaciones de kinder','Día del niño'];
    var SEP = ' ✦ ', unit = TIPOS.join(SEP).toUpperCase() + SEP;
    var outline = document.createElementNS(NS,'path'), ribbon = document.createElementNS(NS,'path');
    outline.setAttribute('fill','none'); outline.setAttribute('stroke','#10184C'); outline.setAttribute('stroke-linecap','round');
    ribbon.setAttribute('id','heroBeltPath'); ribbon.setAttribute('fill','none'); ribbon.setAttribute('stroke','#FF5E1E'); ribbon.setAttribute('stroke-linecap','round');
    var measure = document.createElementNS(NS,'text'); measure.setAttribute('x','-9999'); measure.setAttribute('y','-9999');
    var txt = document.createElementNS(NS,'text'); txt.setAttribute('fill','#fff'); txt.setAttribute('dominant-baseline','central');
    [measure,txt].forEach(function(t){ t.style.fontFamily = "'Onest',system-ui,sans-serif"; t.style.fontWeight = '800'; t.style.letterSpacing = '.04em'; });
    var tp = document.createElementNS(NS,'textPath'); tp.setAttribute('href','#heroBeltPath');
    tp.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href','#heroBeltPath');
    txt.appendChild(tp); svg.appendChild(outline); svg.appendChild(ribbon); svg.appendChild(measure); svg.appendChild(txt);
    var unitW = 0, built = false;
    function build(){
      var W = wrap.clientWidth, H = wrap.clientHeight; if(!W||!H) return;
      svg.setAttribute('viewBox','0 0 '+W+' '+H);
      var cy = H/2, rw = Math.max(30, H*.5), amp = Math.max(6, H/2 - rw/2 - 7);
      var fs = Math.max(12, Math.min(18, rw*.42)), step = Math.max(110, W*.14);
      var d = 'M '+(-step)+' '+cy, x = -step, up = true;
      while(x < W+step){ var nx = x+step; d += ' Q '+(x+step/2)+' '+(cy+(up?-amp:amp))+' '+nx+' '+cy; x = nx; up = !up; }
      outline.setAttribute('d',d); outline.setAttribute('stroke-width', rw+8);
      ribbon.setAttribute('d',d); ribbon.setAttribute('stroke-width', rw);
      measure.style.fontSize = fs+'px'; measure.textContent = unit; txt.style.fontSize = fs+'px';
      unitW = measure.getComputedTextLength() || 1;
      tp.textContent = unit.repeat(Math.max(2, Math.ceil((ribbon.getTotalLength()||1)/unitW) + 2)); built = true;
    }
    build(); window.addEventListener('resize', build);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    var off = 0, last = null;
    (function frame(ts){
      requestAnimationFrame(frame);
      if(!built){ last = ts; return; }
      if(last === null) last = ts;
      var dt = (ts-last)/1000; last = ts;
      off -= 34*dt; if(unitW && off < -unitW) off += unitW;
      tp.setAttribute('startOffset', off);
    })(0);
  })();

  /* ── ESFERAS 3D de fondo en #espacios (original) ──
     No cruzan el título: cada elemento con [data-avoid] crea una zona; al
     acercarse, la esfera se desliza suave hacia un lado y, si no tiene por
     dónde rodear (celular), se desvanece mientras pasa detrás del texto. */
  (function(){
    var section = $('#espacios'), canvas = section && $('.ballpit', section);
    if(!section || !canvas) return;
    var ctx = canvas.getContext('2d'); if(!ctx) return;
    var PAL = [['#C9A2FF','#8E3BE8','#3E1080'],['#FFB48A','#FF5E1E','#9A2F00'],['#9DF2A4','#33C13D','#146F1E'],['#A4E4FF','#28B8F4','#0A6595'],['#FFA6D0','#FF3D9A','#8F0F55']];
    var COUNT = window.innerWidth < 700 ? 12 : 22, balls = [], dpr = 1, zones = [], visible = false;
    var avoidEls = $$('[data-avoid]', section);
    var INF = 120, SIDE = .05, OUT = .03, VERT = .011, DAMP = .95;
    function sprite(r, pal){
      var pad = r*.55, S = r*2 + pad*2, px = Math.ceil(S*dpr);
      var c = document.createElement('canvas'); c.width = c.height = px;
      var g = c.getContext('2d'); g.scale(dpr,dpr);
      var cx = S/2, cy = S/2 - pad*.2;
      var sh = g.createRadialGradient(cx, cy+r*1.02, 0, cx, cy+r*1.02, r*.95);
      sh.addColorStop(0,'rgba(16,24,76,.28)'); sh.addColorStop(1,'rgba(16,24,76,0)');
      g.save(); g.translate(0,cy+r*1.02); g.scale(1,.2); g.translate(0,-(cy+r*1.02)); g.fillStyle = sh;
      g.beginPath(); g.arc(cx, cy+r*1.02, r*.95, 0, 7); g.fill(); g.restore();
      var b = g.createRadialGradient(cx-r*.34, cy-r*.4, r*.04, cx, cy, r);
      b.addColorStop(0,pal[0]); b.addColorStop(.5,pal[1]); b.addColorStop(1,pal[2]);
      g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fillStyle = b; g.fill();
      g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
      var rim = g.createRadialGradient(cx+r*.45, cy+r*.55, r*.5, cx+r*.2, cy+r*.2, r*1.05);
      rim.addColorStop(0,'rgba(255,255,255,0)'); rim.addColorStop(.75,'rgba(255,255,255,0)'); rim.addColorStop(1,'rgba(255,255,255,.34)');
      g.fillStyle = rim; g.fillRect(0,0,S,S); g.restore();
      g.save(); g.translate(cx-r*.36, cy-r*.42); g.rotate(-.62); g.scale(1,.58);
      var hl = g.createRadialGradient(0,0,0,0,0,r*.38);
      hl.addColorStop(0,'rgba(255,255,255,.95)'); hl.addColorStop(.55,'rgba(255,255,255,.45)'); hl.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle = hl; g.beginPath(); g.arc(0,0,r*.38,0,7); g.fill(); g.restore();
      g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(cx+r*.42, cy-r*.34, r*.07, 0, 7); g.fill();
      return { c:c, S:S };
    }
    function inZone(x,y,r){ for(var i=0;i<zones.length;i++){ var z = zones[i]; if(x > z.x0-r && x < z.x1+r && y > z.y0-r && y < z.y1+r) return true; } return false; }
    function makeBall(){
      var cw = section.clientWidth || 300, ch = section.clientHeight || 300;
      var z = rand(.45,1), r = rand(20,44)*(.5+.5*z), pal = PAL[Math.floor(Math.random()*PAL.length)];
      var b = { z:z, r:r, sp:sprite(r,pal), x:0, y:0, vx:0, ey:0, fade:1, vy:(Math.random()<.5?-1:1)*rand(.05,.13)*z, angle:rand(0,6.28), ws:rand(.004,.009), a:.5+.5*z };
      for(var t=0;t<20;t++){ b.x = rand(r, Math.max(r+1, cw-r)); b.y = rand(-r, ch+r); if(!inZone(b.x,b.y,r+INF*.5)) break; }
      return b;
    }
    function measure(){
      var s = section.getBoundingClientRect();
      zones = avoidEls.map(function(el){
        var rg = document.createRange(); rg.selectNodeContents(el);
        var r = rg.getBoundingClientRect(); if(!r.width) r = el.getBoundingClientRect();
        var pad = parseFloat(el.getAttribute('data-avoid')) || 20;
        return { x0:r.left-s.left-pad, y0:r.top-s.top-pad, x1:r.right-s.left+pad, y1:r.bottom-s.top+pad };
      });
    }
    function resize(){
      var w = section.clientWidth, h = section.clientHeight; if(!w||!h) return;
      dpr = Math.min(window.devicePixelRatio||1, 2);
      canvas.width = w*dpr; canvas.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); measure();
    }
    function frame(){
      requestAnimationFrame(frame);
      if(!visible || document.hidden) return;
      var cw = section.clientWidth, ch = section.clientHeight; if(!cw||!ch) return;
      ctx.clearRect(0,0,cw,ch);
      for(var i=0;i<balls.length;i++){
        var b = balls[i], fx = 0, fy = 0, cover = 0;
        b.angle += b.ws;
        for(var k=0;k<zones.length;k++){
          var zn = zones[k], nx = clamp(b.x, zn.x0, zn.x1), ny = clamp(b.y, zn.y0, zn.y1);
          var dx = b.x-nx, dy = b.y-ny, d = Math.sqrt(dx*dx+dy*dy), R = b.r + INF;
          if(d >= R) continue;
          var t = 1 - d/R; t = t*t*(3-2*t);
          var roomL = zn.x0 > b.r*2.4, roomR = zn.x1 < cw - b.r*2.4;
          var side = b.x < (zn.x0+zn.x1)/2 ? -1 : 1;
          if(side < 0 && !roomL) side = roomR ? 1 : 0;
          if(side > 0 && !roomR) side = roomL ? -1 : 0;
          if(side !== 0){
            fx += side*t*SIDE;
            if(d > 0){ fx += dx/d*t*OUT; fy += dy/d*t*VERT; }
            else fy += (b.y < (zn.y0+zn.y1)/2 ? -1 : 1)*t*VERT;
          }
          var c = d === 0 ? 1 : (d < b.r ? 1 - d/b.r : 0);
          if(c > cover) cover = c;
        }
        b.vx = (b.vx + fx)*DAMP; b.ey = (b.ey + fy)*DAMP;
        b.x += Math.sin(b.angle)*.3*b.z + b.vx;
        b.y += b.vy + Math.sin(b.angle*.6)*.1 + b.ey;
        if(b.x-b.r < 0){ b.x = b.r; b.vx = Math.abs(b.vx)*.3; } else if(b.x+b.r > cw){ b.x = cw-b.r; b.vx = -Math.abs(b.vx)*.3; }
        if(b.y < -b.r*2) b.y = ch + b.r*2; else if(b.y > ch + b.r*2) b.y = -b.r*2;
        b.fade += ((1 - cover*.88) - b.fade)*.07;
        ctx.globalAlpha = b.a*b.fade;
        ctx.drawImage(b.sp.c, b.x-b.sp.S/2, b.y-b.sp.S/2, b.sp.S, b.sp.S);
      }
      ctx.globalAlpha = 1;
    }
    resize();
    for(var i=0;i<COUNT;i++) balls.push(makeBall());
    balls.sort(function(a,b){ return a.z-b.z; });
    window.addEventListener('resize', resize);
    if('ResizeObserver' in window) new ResizeObserver(resize).observe(section);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    setInterval(function(){ if(visible) measure(); }, 1200);
    new IntersectionObserver(function(es){ es.forEach(function(e){ visible = e.isIntersecting; if(visible) measure(); }); }, { threshold:0 }).observe(section);
    requestAnimationFrame(frame);
  })();

  /* ── ESPACIOS: pestañas ── */
  (function(){
    var tabs = $$('.esp-tab'); if(!tabs.length) return;
    function select(tab){
      tabs.forEach(function(t){
        var on = t === tab, p = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        if(on){ p.hidden = false; p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); }
        else { p.hidden = true; p.classList.remove('enter'); }
      });
    }
    tabs.forEach(function(t,i){
      t.addEventListener('click', function(){ select(t); });
      t.addEventListener('keydown', function(e){
        var n = e.key==='ArrowRight' ? 1 : e.key==='ArrowLeft' ? -1 : 0; if(!n) return;
        var nt = tabs[(i+n+tabs.length)%tabs.length]; nt.focus(); select(nt);
      });
    });
  })();

  /* ── FORMULARIO: arma el mensaje de WhatsApp ── */
  (function(){
    var f = $('#consultaForm'); if(!f) return;
    var fecha = $('#cf-fecha'); if(fecha) fecha.min = new Date().toISOString().slice(0,10);
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var bad = null;
      ['cf-nombre','cf-telefono','cf-tipo','cf-fecha','cf-hora'].forEach(function(id){
        var el = document.getElementById(id), ok = !!el.value.trim();
        el.classList.toggle('err', !ok); if(!ok && !bad) bad = el;
      });
      if(bad){ bad.focus(); return; }
      var v = function(id){ return (document.getElementById(id).value||'').trim(); };
      var fTxt = v('cf-fecha');
      try{ fTxt = new Date(fTxt+'T12:00:00').toLocaleDateString('es-MX',{ weekday:'long', day:'numeric', month:'long', year:'numeric' }); }catch(_){}
      var lines = ['Hola, soy '+v('cf-nombre')+'. Quiero cotizar una fiesta en Magic Kids.',
        '• Tipo: '+v('cf-tipo'), '• Fecha: '+fTxt, '• Hora: '+v('cf-hora')];
      if(v('cf-invitados')) lines.push('• Invitados: '+v('cf-invitados'));
      lines.push('• Teléfono: '+v('cf-telefono'));
      if(v('cf-correo')) lines.push('• Correo: '+v('cf-correo'));
      window.open('https://wa.me/'+SALON_WHATSAPP+'?text='+encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
    $$('input,select', f).forEach(function(el){ ['input','change'].forEach(function(ev){ el.addEventListener(ev, function(){ el.classList.remove('err'); }); }); });
  })();

  /* ── PASILLO DE FOTOS 3D (fondo de "Paquetes de fotos", original) ── */
  (function(){
    var host = $('#photoCorridor'); if(!host) return;
    var narrow = window.innerWidth < 700;
    var P = { perspective:30, cardWidth:18, cardHeight:25, cardRadius:.4, birthHeight:2.6, exitHeight:narrow?80:46, railBirth:-11, railExit:44, fan:3.3, turnBirth:6, turnExit:28, stops:24 };
    var CARDS = 9, SPEED = 18, AXIS = 50, COLORS = ['#7A26CE','#FF5E1E','#33C13D','#FF3D9A','#28B8F4'];
    var GLYPH = '<svg viewBox="0 0 24 24" fill="#fff"><circle cx="17" cy="8" r="2.6"/><path d="M2 20 9 9l4.5 7 2.5-3.5L22 20z"/></svg>';
    function kf(dir, name){
      var out = [];
      for(var s=0; s<=P.stops; s++){
        var u = s/P.stops, scale = (P.birthHeight/P.cardHeight)*Math.pow(P.exitHeight/P.birthHeight, u);
        var z = P.perspective*(1 - 1/scale), rail = P.railExit - (P.railExit-P.railBirth)*Math.pow(1-u, P.fan), turn = P.turnBirth + (P.turnExit-P.turnBirth)*u;
        out.push((u*100).toFixed(2)+'%{transform:translate3d('+(dir*rail).toFixed(2)+'cqw,0,'+z.toFixed(2)+'cqw) rotateY('+(-dir*turn).toFixed(2)+'deg)}');
      }
      return '@keyframes '+name+'{'+out.join('')+'}';
    }
    var st = document.createElement('style'); st.textContent = kf(1,'pcR') + kf(-1,'pcL'); document.head.appendChild(st);
    var persp = document.createElement('div'); persp.className = 'pc-persp';
    persp.style.perspective = P.perspective+'cqw'; persp.style.perspectiveOrigin = '50% '+AXIS+'%';
    var d3 = document.createElement('div'); d3.className = 'pc-3d';
    ['pcR','pcL'].forEach(function(name){
      for(var i=0;i<CARDS;i++){
        var c = document.createElement('div'); c.className = 'pc-card';
        c.style.cssText = 'top:'+AXIS+'%;width:'+P.cardWidth+'cqw;height:'+P.cardHeight+'cqw;margin-left:'+(-P.cardWidth/2)+'cqw;margin-top:'+(-P.cardHeight/2)+'cqw;border-radius:'+P.cardRadius+'cqw;animation:'+name+' '+SPEED+'s linear infinite;animation-delay:'+(-(i*SPEED)/CARDS)+'s';
        c.innerHTML = '<i style="background:'+COLORS[i%COLORS.length]+'"></i>'+GLYPH;
        d3.appendChild(c);
      }
    });
    persp.appendChild(d3); host.appendChild(persp);
  })();

  /* ── GLOBOS: carrusel de fotos (con puntos) ── */
  (function(){
    var root = $('#globosMorph'); if(!root) return;
    var slides = $$('.morph-slide', root), now = $('#globosNow'), dotsWrap = $('#globosDots'), idx = 0, timer = null;
    var dots = slides.map(function(_, i){
      var d = document.createElement('span');
      d.addEventListener('click', function(){ go(i); restart(); });
      if(dotsWrap) dotsWrap.appendChild(d);
      return d;
    });
    function go(n){
      idx = ((n % slides.length) + slides.length) % slides.length;
      slides.forEach(function(s,i){ s.classList.toggle('is-active', i===idx); });
      dots.forEach(function(d,i){ d.classList.toggle('on', i===idx); });
      if(now) now.textContent = (idx<9?'0':'') + (idx+1);
    }
    function restart(){ clearInterval(timer); timer = setInterval(function(){ go(idx+1); }, 4200); }
    var prev = $('.morph-prev'), next = $('.morph-next');
    if(next) next.addEventListener('click', function(){ go(idx+1); restart(); });
    if(prev) prev.addEventListener('click', function(){ go(idx-1); restart(); });
    var sx = 0;
    root.addEventListener('pointerdown', function(e){ sx = e.clientX; });
    root.addEventListener('pointerup', function(e){ var dx = e.clientX-sx; if(Math.abs(dx) > 40){ go(idx + (dx<0?1:-1)); restart(); } });
    go(0);
    new IntersectionObserver(function(es){ if(es[0].isIntersecting) restart(); else clearInterval(timer); }, { threshold:.2 }).observe(root);
  })();

  /* ── NUESTROS SERVICIOS: la imagen sigue al cursor, el resto se difumina ──
     Solo en escritorio real (pointer fino Y ancho de escritorio): en celular
     no aplica. Se revisa con matchMedia (no solo al cargar) para que si
     alguien angosta la ventana del navegador en escritorio para "probar
     celular", el efecto también se apague — no basta con el tipo de puntero. */
  (function(){
    var list = $('#diversion .dv-list'), cursor = $('#dvCursor');
    if(!list || !cursor) return;
    var mq = window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:901px)');
    var img = $('img', cursor);
    var raw = { x:0, y:0 }, pos = { x:0, y:0 }, raf = null, current = null, on = false;
    function setActive(a){
      current = a; list.classList.add('is-hovering');
      $$('a', list).forEach(function(o){ o.classList.toggle('is-active', o===a); });
      var im = $('.dv-th img', a); if(im) img.setAttribute('src', im.getAttribute('src'));
      cursor.classList.add('on');
    }
    function clearActive(){
      current = null; list.classList.remove('is-hovering');
      $$('a.is-active', list).forEach(function(o){ o.classList.remove('is-active'); });
      cursor.classList.remove('on');
    }
    function loop(){
      pos.x += (raw.x-pos.x)*.2; pos.y += (raw.y-pos.y)*.2;
      cursor.style.transform = 'translate3d('+pos.x.toFixed(1)+'px,'+pos.y.toFixed(1)+'px,0)';
      raf = requestAnimationFrame(loop);
    }
    function onEnter(e){
      if(!mq.matches) return;
      raw.x = pos.x = e.clientX; raw.y = pos.y = e.clientY;
      if(!raf) raf = requestAnimationFrame(loop);
    }
    function onMove(e){
      if(!mq.matches) return;
      raw.x = e.clientX; raw.y = e.clientY;
      var a = e.target.closest('a');
      if(a !== current){ if(a) setActive(a); else clearActive(); }
    }
    function onLeave(){
      clearActive();
      if(raf){ cancelAnimationFrame(raf); raf = null; }
    }
    function sync(){
      on = mq.matches;
      list.classList.toggle('dv-hoverable', on);
      if(!on) onLeave();
    }
    list.addEventListener('pointerenter', onEnter);
    list.addEventListener('pointermove', onMove);
    list.addEventListener('pointerleave', onLeave);
    if(mq.addEventListener) mq.addEventListener('change', sync); else mq.addListener(sync);
    sync();
  })();

  /* ── ELOTES: barra de invitados ── */
  (function(){
    var r = $('#eloRange'); if(!r) return;
    var DATA = {30:[10,10,10],40:[20,10,10],50:[25,15,10],60:[30,15,15],70:[35,20,10],80:[40,20,20],90:[45,25,20],100:[50,25,20]};
    var out = $('#eloOut'), cta = $('#eloCta'), ns = [$('#eloN1'),$('#eloN2'),$('#eloN3')];
    function upd(){
      var n = +r.value, d = DATA[n];
      out.textContent = n;
      r.style.setProperty('--p', ((n-30)/70*100)+'%');
      ns.forEach(function(el,i){ el.textContent = d[i]; });
      cta.href = 'https://wa.me/'+SALON_WHATSAPP+'?text='+encodeURIComponent('Hola, me gustaría cotizar paquete de elotes para '+n+' invitados');
    }
    r.addEventListener('input', upd); upd();
    var stage = $('#eloStage');
    if(stage && fine){
      stage.addEventListener('pointermove', function(e){
        var b = stage.getBoundingClientRect();
        stage.style.setProperty('--mx', ((e.clientX-b.left)/b.width - .5).toFixed(3));
        stage.style.setProperty('--my', ((e.clientY-b.top)/b.height - .5).toFixed(3));
      });
      stage.addEventListener('pointerleave', function(){ stage.style.setProperty('--mx',0); stage.style.setProperty('--my',0); });
    }
  })();

  /* ── TOPPINGS/ADEREZOS: pastillas que brotan en cascada (original) ── */
  (function(){
    var tp = $('#tp'); if(!tp) return;
    var pills = $$('.tp-pill', tp);
    pills.forEach(function(p,i){
      p.style.setProperty('--d', (i*.09 + (Math.random()*.08-.04)).toFixed(3)+'s');
    });
    new IntersectionObserver(function(es){
      if(es[0].isIntersecting){ tp.classList.add('in'); }
    }, { threshold:.2 }).observe(tp);
  })();

  /* ── FAQ: acordeón (una abierta a la vez) ── */
  (function(){
    var items = $$('.qa'); if(!items.length) return;
    items.forEach(function(it){
      var q = $('.qa-q', it);
      q.addEventListener('click', function(){
        var open = !it.classList.contains('open');
        items.forEach(function(o){ o.classList.remove('open'); $('.qa-q',o).setAttribute('aria-expanded','false'); });
        if(open){ it.classList.add('open'); q.setAttribute('aria-expanded','true'); }
      });
    });
  })();

  /* ── GALERÍA: el scroll vertical mueve las fotos en horizontal (original) ──
     #glPin crece alto (dist + 100vh) para dar espacio de scroll; mientras
     esa altura pasa por la pantalla, .gl-sticky queda fija y .gl-track se
     traduce en X según cuánto se avanzó. En celular se apaga (scroll
     horizontal normal con snap, ver CSS). */
  (function(){
    var pin = $('#glPin'), track = $('#glTrack'), bar = $('#glBar'); if(!pin || !track) return;
    var dist = 0;
    function layout(){
      if(mqMobile.matches){ pin.style.height = ''; track.style.transform = ''; return; }
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      pin.style.height = (dist + window.innerHeight) + 'px';
      if(window.__lenis) window.__lenis.resize();
      update();
    }
    function update(){
      if(mqMobile.matches) return;
      var r = pin.getBoundingClientRect(), total = pin.offsetHeight - window.innerHeight;
      var p = total > 0 ? clamp(-r.top/total, 0, 1) : 0;
      track.style.transform = 'translate3d('+(-p*dist).toFixed(1)+'px,0,0)';
      if(bar) bar.style.transform = 'scaleX('+p.toFixed(4)+')';
    }
    window.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', layout);
    window.addEventListener('load', layout);
    if(mqMobile.addEventListener) mqMobile.addEventListener('change', layout); else mqMobile.addListener(layout);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    $$('img', track).forEach(function(im){ if(!im.complete) im.addEventListener('load', layout, { once:true }); });
    layout();
  })();

  /* ── SERVICIOS: línea que se dibuja con el scroll (original) ── */
  (function(){
    var list = $('#prSteps'), svg = $('#prPath'); if(!list || !svg) return;
    var steps = $$('.pr-step', list), track = $('.pr-track', svg), line = $('.pr-line', svg);
    function build(){
      var lr = list.getBoundingClientRect(); svg.setAttribute('viewBox','0 0 '+lr.width+' '+lr.height);
      var pts = steps.map(function(s){ var d = $('.pr-dot', s).getBoundingClientRect(); return [d.left - lr.left + d.width/2, d.top - lr.top + d.height/2]; });
      if(!pts.length) return;
      var d = 'M '+pts[0][0]+' '+(pts[0][1]-60);
      d += ' L '+pts[0][0]+' '+pts[0][1];
      for(var i=1;i<pts.length;i++){
        var a = pts[i-1], b = pts[i], my = (a[1]+b[1])/2, sw = mqMobile.matches ? 0 : (i%2 ? 120 : -120);
        d += ' C '+(a[0]+sw)+' '+my+' '+(b[0]-sw)+' '+my+' '+b[0]+' '+b[1];
      }
      track.setAttribute('d', d); line.setAttribute('d', d);
      update();
    }
    function update(){
      var lr = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = clamp((vh*.62 - lr.top)/lr.height, 0, 1);
      line.style.strokeDashoffset = (1-p).toFixed(4);
      steps.forEach(function(s){ var r = $('.pr-dot', s).getBoundingClientRect(); s.classList.toggle('lit', r.top < vh*.66); });
    }
    window.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', build); window.addEventListener('load', build);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    build();
  })();

  /* ── RESEÑAS: carrete (columna central con las reseñas, columnas
     laterales decorativas que giran al revés) + texto que entra letra
     por letra. Geometría leída en vivo de --ts-cell/--ts-gap, nunca
     hardcodeada, así no se desincroniza en ningún ancho de pantalla. */
  (function(){
    var reel = $('#tsReel'); if(!reel) return;
    var colL = $('#tsColL'), colM = $('#tsColM'), colR = $('#tsColR');
    var stage = $('#tsStage'), quoteEl = $('#tsQuote'), authorEl = $('#tsAuthor');
    var prevBtn = $('#tsPrev'), nextBtn = $('#tsNext'), barsWrap = $('#tsBars');
    if(!colL || !colM || !colR || !stage) return;

    var ICONS = {
      balloon:'<svg viewBox="0 0 48 48"><ellipse cx="24" cy="21" rx="16" ry="19" fill="#fff"/><path d="M24 40l-4 6h8z" fill="#fff"/><ellipse cx="18" cy="13" rx="4" ry="6" fill="#ffffff66"/></svg>',
      cake:'<svg viewBox="0 0 48 48"><rect x="8" y="26" width="32" height="16" rx="4" fill="#fff"/><rect x="8" y="18" width="32" height="10" rx="4" fill="#ffffffcc"/><rect x="21" y="6" width="6" height="14" rx="2" fill="#fff"/><path d="M24 2c2.2 2.2 2.2 4.4 0 6.6-2.2-2.2-2.2-4.4 0-6.6z" fill="#fff"/></svg>',
      gift:'<svg viewBox="0 0 48 48"><rect x="8" y="20" width="32" height="22" rx="3" fill="#fff"/><rect x="5" y="13" width="38" height="9" rx="3" fill="#ffffffcc"/><rect x="21" y="13" width="6" height="29" fill="#28B8F4" opacity=".55"/><path d="M24 13c-7-11-18-5-10 1z" fill="#fff"/><path d="M24 13c7-11 18-5 10 1z" fill="#fff"/></svg>',
      confetti:'<svg viewBox="0 0 48 48"><g fill="#fff"><circle cx="12" cy="14" r="3.4"/><rect x="29" y="7" width="7" height="7" rx="1.5" transform="rotate(18 32.5 10.5)"/><circle cx="37" cy="30" r="3"/><path d="M12 30l4 9 4-9z"/><circle cx="23" cy="9" r="2.4"/><path d="M34 22l2.6 5.6 5.6 2.6-5.6 2.6-2.6 5.6-2.6-5.6-5.6-2.6 5.6-2.6z" opacity=".7"/></g></svg>'
    };
    var DATA = [
      { quote:'Salón grande, mesas grandes, área para bebés, muchos juegos, inflables, trampolín, cocina equipada, limpio el lugar con baños limpios también, un segundo piso estilo terraza con mesas de billar muy padres. Nunca faltó nada.', author:'Myriam Chapa', role:'Local Guide en Google', tint:'var(--pink)', svg:ICONS.balloon },
      { quote:'Excelente atención de parte del personal, muy atentos y serviciales. Instalaciones limpias, las hamburguesas muy ricas y el cuidado de los niños muy bueno. ¡Lo recomiendo!', author:'Sandra Manzanares', role:'Reseña en Google', tint:'var(--tang)', img:'fotos/menu/burger.webp' },
      { quote:'Excelente ubicación. Se ve chico el lugar por afuera, pero por dentro está muy grande.', author:'Juan Casas', role:'Local Guide en Google', tint:'var(--lime)', svg:ICONS.confetti },
      { quote:'A gusto. Padre el toro mecánico y el personal muy atento.', author:'Manuel Frausto', role:'Reseña en Google', tint:'var(--grape)', img:'diversion/img/toro-mecanico.jpg' },
      { quote:'Es muy agradable, ni tenía idea del lugar hasta que fui. Muy agradable y muy seguras las instalaciones, nos divertimos mucho.', author:'Mike Peña', role:'Local Guide en Google', tint:'var(--sky)', svg:ICONS.gift },
      { quote:'El trato del personal súper amable, lugar limpio, 100% recomendable.', author:'José Luis Ramírez', role:'Local Guide en Google', tint:'var(--grape)', svg:ICONS.cake }
    ];
    var count = DATA.length, cell = 100, gap = 8, step = 3*(cell+gap);

    /* Mide el tamaño REAL ya pintado (no el texto de la variable CSS):
       --ts-cell usa clamp()/vw, y getComputedStyle().getPropertyValue()
       en una custom property devuelve el texto tal cual se escribió, sin
       resolver — parsear eso con parseFloat() solo agarra el número más
       chico del clamp(), nunca el tamaño que de verdad se dibuja. Medir
       el propio elemento con getBoundingClientRect() da el valor real en
       cualquier ancho de pantalla. */
    function measure(){
      var sample = $('.ts-cell', colM) || $('.ts-tile', colM);
      if(sample){ var h = sample.getBoundingClientRect().height; if(h) cell = h; }
      var g = parseFloat(getComputedStyle(colM).rowGap);
      if(!isNaN(g)) gap = g;
      step = 3*(cell+gap);
    }
    function cellEl(){ var d = document.createElement('div'); d.className = 'ts-cell'; return d; }
    function tileEl(item){
      var d = document.createElement('div'); d.className = 'ts-tile'; d.style.setProperty('--tg', item.tint);
      if(item.img){ var im = document.createElement('img'); im.src = item.img; im.alt = ''; im.loading = 'lazy'; d.appendChild(im); }
      else d.innerHTML = item.svg;
      return d;
    }
    var sideCount = 4 + 2*count;
    function buildSide(col){ col.innerHTML=''; for(var i=0;i<sideCount;i++) col.appendChild(cellEl()); }
    function buildMiddle(){
      colM.innerHTML = '';
      for(var i=0;i<3;i++) colM.appendChild(cellEl());
      DATA.forEach(function(item,i){
        colM.appendChild(tileEl(item));
        if(i < count-1){ colM.appendChild(cellEl()); colM.appendChild(cellEl()); }
      });
      for(var i=0;i<3;i++) colM.appendChild(cellEl());
    }
    buildSide(colL); buildMiddle(); buildSide(colR);

    barsWrap.innerHTML = '';
    var bars = DATA.map(function(_,k){
      var b = document.createElement('span');
      b.addEventListener('click', function(){ go(k); restart(); });
      barsWrap.appendChild(b); return b;
    });

    function place(i, animate){
      measure();
      var centerIdx = (count-1)/2, my = (centerIdx-i)*step, sy = -my;
      var t = animate ? 'transform .8s cubic-bezier(.65,0,.35,1)' : 'none';
      colM.style.transition = colL.style.transition = colR.style.transition = t;
      colM.style.transform = 'translateY('+my+'px)';
      colL.style.transform = colR.style.transform = 'translateY('+sy+'px)';
    }
    /* letra por letra, pero el delay por carácter se achica en reseñas
       largas para que nunca tarde más de ~0.9s en terminar de aparecer */
    function chars(text){
      var totalChars = text.replace(/ /g,'').length;
      var perChar = Math.min(.018, .9/Math.max(totalChars,1)), idx = 0;
      return text.split(' ').map(function(w){
        var out = '<span style="display:inline-block;white-space:nowrap">' + Array.from(w).map(function(ch){
          var html = '<span class="ts-char" style="--cd:'+(idx*perChar).toFixed(3)+'s">'+ch+'</span>'; idx++; return html;
        }).join('') + '</span>';
        idx++; return out;
      }).join(' ');
    }
    function renderText(i){
      var item = DATA[i];
      quoteEl.innerHTML = chars(item.quote);
      authorEl.innerHTML = '<b>'+item.author+'</b>'+item.role;
    }

    var index = 0, locked = false, DUR = 6000, timer = null;
    function go(n){
      if(locked) return;
      var next = ((n % count) + count) % count;
      if(next === index) return;
      locked = true;
      stage.classList.add('is-out');
      place(next, true);
      bars.forEach(function(b,k){ b.classList.remove('run'); b.classList.toggle('done', k<next); });
      setTimeout(function(){
        index = next; renderText(index); stage.classList.remove('is-out');
        bars[index].style.setProperty('--dur', DUR+'ms'); bars[index].classList.add('run');
      }, 260);
      setTimeout(function(){ locked = false; }, 820);
    }
    function restart(){ clearTimeout(timer); timer = setTimeout(function(){ go(index+1); }, DUR); }
    nextBtn.addEventListener('click', function(){ go(index+1); restart(); });
    prevBtn.addEventListener('click', function(){ go(index-1); restart(); });
    reel.addEventListener('keydown', function(e){
      if(e.key==='ArrowRight'){ e.preventDefault(); go(index+1); restart(); }
      if(e.key==='ArrowLeft'){ e.preventDefault(); go(index-1); restart(); }
    });
    /* Importante: solo re-coloca con el resize de VENTANA (--ts-cell/--ts-gap
       dependen únicamente del ancho de pantalla). Un ResizeObserver sobre
       #tsReel se disparaba también cuando el texto cambiaba de alto al
       rotar de reseña (cada quote tiene distinto número de líneas), y esa
       re-colocación con transition:none cortaba a medio camino la animación
       de deslizamiento que go() acababa de arrancar — eso era lo que se
       veía roto. */
    window.addEventListener('resize', function(){ if(!locked) place(index,false); });

    /* Primer render: síncrono, sin esperar fuentes — igual se ve bien con
       la fuente de respaldo, y así nunca hay un hueco en blanco inicial. */
    renderText(index); place(index,false);
    bars[index].style.setProperty('--dur', DUR+'ms'); bars[index].classList.add('run');

    new IntersectionObserver(function(es){ if(es[0].isIntersecting) restart(); else clearTimeout(timer); }, { threshold:.3 }).observe(reel);
  })();

  /* ── GLOBOS de fondo en #ubicacion (canvas 2D, original) ── */
  (function(){
    var section = $('#ubicacion'), canvas = section && $('.ub-canvas', section);
    if(!section || !canvas) return;
    var ctx = canvas.getContext('2d'); if(!ctx) return;
    var PALETTE = ['#7A26CE','#FF5E1E','#33C13D','#FF3D9A','#28B8F4'], balloons = [], visible = false;
    function B(cw,ch,first){ this.init(cw,ch,first); }
    B.prototype.init = function(cw,ch,first){
      this.r = rand(16,26); this.x = rand(this.r, Math.max(this.r+1, cw-this.r));
      this.y = first ? rand(0,ch) : ch + this.r + rand(20,140);
      this.color = PALETTE[Math.floor(Math.random()*PALETTE.length)];
      this.speed = rand(.35,.75); this.ws = rand(.008,.02); this.angle = rand(0, Math.PI*2);
    };
    B.prototype.step = function(cw,ch){ this.y -= this.speed; this.angle += this.ws; this.x += Math.sin(this.angle*.6)*.6; if(this.y < -this.r-140) this.init(cw,ch,false); };
    B.prototype.draw = function(){
      ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(Math.sin(this.angle)*.05);
      var sw = Math.sin(this.angle*1.8)*4;
      ctx.beginPath(); ctx.moveTo(0, this.r+4); ctx.quadraticCurveTo(sw, this.r+45, sw*.5, this.r+85);
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, this.r);
      ctx.bezierCurveTo(-this.r*1.2, this.r*.8, -this.r*1.3, -this.r*1.2, 0, -this.r*1.2);
      ctx.bezierCurveTo(this.r*1.3, -this.r*1.2, this.r*1.2, this.r*.8, 0, this.r);
      ctx.closePath(); ctx.fillStyle = this.color; ctx.globalAlpha = .94; ctx.fill();
      ctx.globalAlpha = .32; ctx.beginPath(); ctx.ellipse(-this.r*.35, -this.r*.5, this.r*.28, this.r*.4, -.4, 0, Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.restore();
    };
    function resize(){
      var dpr = Math.min(window.devicePixelRatio||1, 2), w = section.clientWidth, h = section.clientHeight; if(!w||!h) return;
      canvas.width = w*dpr; canvas.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize(); for(var i=0;i<14;i++) balloons.push(new B(section.clientWidth||300, section.clientHeight||300, true));
    window.addEventListener('resize', resize);
    new IntersectionObserver(function(es){ es.forEach(function(e){ visible = e.isIntersecting; }); }, { threshold:0 }).observe(section);
    (function frame(){
      requestAnimationFrame(frame);
      if(!visible || document.hidden) return;
      var cw = section.clientWidth, ch = section.clientHeight; ctx.clearRect(0,0,cw,ch);
      balloons.forEach(function(b){ b.step(cw,ch); b.draw(); });
    })();
  })();

  /* ── PARTÍCULAS de fondo en #contacto (original) ── */
  (function(){
    var section = $('#contacto'), box = $('#visita-morphic'); if(!section || !box) return;
    var NS = 'http://www.w3.org/2000/svg', parts = [], active = false, spawn = null, raf = null;
    function P(){
      var w = section.offsetWidth || innerWidth, h = section.offsetHeight || innerHeight;
      this.pos = h + 60; this.fric = .7 + Math.random()*.7; this.scale = .5 + Math.random()*1.8;
      this.siner = (w/3)*Math.random(); this.steps = h/2; this.rot = 0; this.dir = Math.random()>.5?1:-1; this.x = Math.random()*w;
      var s = document.createElementNS(NS,'svg'); s.setAttribute('viewBox','0 0 67.4 67.4');
      var c = document.createElementNS(NS,'circle'); c.setAttribute('cx','33.7'); c.setAttribute('cy','33.7'); c.setAttribute('r','33.7'); c.setAttribute('fill','rgba(255,94,30,0.22)');
      s.appendChild(c); s.style.cssText = 'position:absolute;left:0;top:0;width:45px;height:45px'; box.appendChild(s); this.el = s;
    }
    P.prototype.move = function(){
      this.pos -= this.fric; this.rot += this.fric;
      var x = this.x + Math.sin((this.pos*Math.PI)/this.steps)*this.siner;
      this.el.style.transform = 'translate('+x+'px,'+this.pos+'px) scale('+this.scale+') rotate('+(this.rot*this.dir)+'deg)';
      if(this.pos < -60){ this.el.remove(); return false; } return true;
    };
    function loop(){ parts = parts.filter(function(p){ return p.move(); }); if(active) raf = requestAnimationFrame(loop); }
    function start(){ if(active) return; active = true; spawn = setInterval(function(){ if(parts.length < 10) parts.push(new P()); }, 240); raf = requestAnimationFrame(loop); }
    function stop(){ active = false; clearInterval(spawn); cancelAnimationFrame(raf); }
    new IntersectionObserver(function(es){ es[0].isIntersecting ? start() : stop(); }, { threshold:.05 }).observe(section);
  })();

  /* ── SERVICIOS.HTML: índice que sigue la lectura + salto al juego del link ── */
  (function(){
    var links = $$('.sv-index a');
    if(links.length){
      var map = {}; links.forEach(function(a){ map[a.getAttribute('href').slice(1)] = a; });
      var o = new IntersectionObserver(function(es){
        es.forEach(function(e){ if(e.isIntersecting){ links.forEach(function(a){ a.classList.remove('on'); }); var a = map[e.target.id]; if(a) a.classList.add('on'); } });
      }, { rootMargin:'-45% 0px -50% 0px' });
      $$('.sv').forEach(function(s){ o.observe(s); });
    }
    if($('.sv') && location.hash){ var t = document.querySelector(location.hash); if(t) setTimeout(function(){ goTo(t); }, 150); }
  })();
})();

/* ═══════════════════════════════════════════════════════════
   CALENDARIO — "revienta tu fecha" (index.html #calendario)
   Sin backend. El "hoy" sale de la hora de Monterrey (America/Monterrey,
   UTC-6 todo el año), NO del reloj/zona del dispositivo, y se actualiza
   solo (cada 30 s, al volver a la pestaña y al pasar la medianoche).
   Todo el cálculo de fechas es aritmética pura sobre año/mes/día, así que
   no hay desfases de huso horario ni de horario de verano.
   ═══════════════════════════════════════════════════════════ */
(function(){
  var daysEl = document.getElementById('calDays');
  if(!daysEl) return;
  var byId = function(id){ return document.getElementById(id); };

  /* [EDITAR] Zona horaria, último año del calendario, horario de atención
     (en minutos desde medianoche) y turnos de fiesta (los del FAQ). */
  var TZ = 'America/Monterrey';
  var LAST_YEAR = 2035;
  var HOURS = { week:{ open:11*60, close:19*60 }, weekend:{ open:10*60, close:20*60 } };
  var TURNOS = [
    { s:10*60, e:13*60+30, n:'Mañana' },
    { s:14*60, e:17*60+30, n:'Tarde' },
    { s:18*60, e:21*60+30, n:'Noche' }
  ];

  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  var ARROW = '<i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></i>';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function pad(n){ return n < 10 ? '0'+n : ''+n; }
  function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  function fmtT(min){ var h = Math.floor(min/60); return (h%12 || 12) + ':' + pad(min%60) + ' ' + (h >= 12 ? 'pm' : 'am'); }
  function setHTML(el, html){ if(el._h !== html){ el.innerHTML = html; el._h = html; } }

  /* Fecha y hora actuales en Monterrey, sin depender del dispositivo */
  function nowMty(){
    try{
      var o = {};
      new Intl.DateTimeFormat('en-US', { timeZone:TZ, hourCycle:'h23', year:'numeric', month:'numeric', day:'numeric', hour:'numeric', minute:'numeric' })
        .formatToParts(new Date()).forEach(function(p){ o[p.type] = p.value; });
      if(o.year && o.month && o.day) return { y:+o.year, m:+o.month, d:+o.day, min:((+o.hour)%24)*60 + (+o.minute) };
    }catch(e){}
    var t = new Date(Date.now() - 6*3600000);   /* respaldo: UTC-6 fijo */
    return { y:t.getUTCFullYear(), m:t.getUTCMonth()+1, d:t.getUTCDate(), min:t.getUTCHours()*60 + t.getUTCMinutes() };
  }
  function dow(y,m,d){ return new Date(Date.UTC(y, m-1, d)).getUTCDay(); }
  function dim(y,m){ return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function key(y,m,d){ return y*10000 + m*100 + d; }
  function addDays(y,m,d,n){ var t = new Date(Date.UTC(y, m-1, d+n)); return { y:t.getUTCFullYear(), m:t.getUTCMonth()+1, d:t.getUTCDate() }; }
  function isWE(y,m,d){ var w = dow(y,m,d); return w === 0 || w === 6; }
  function hoursOf(y,m,d){ return isWE(y,m,d) ? HOURS.weekend : HOURS.week; }
  function longDate(y,m,d){ return DIAS[dow(y,m,d)] + ' ' + d + ' de ' + MESES[m-1] + ' de ' + y; }
  function shortDate(y,m,d){ return DIAS[dow(y,m,d)] + ' ' + d + ' de ' + MESES[m-1]; }

  var today = nowMty();
  var view = { y:today.y, m:today.m };
  var sel = null, turno = -1, pickY = today.y, lastFocus = null, cells = [], busy = false;

  function tKey(){ return key(today.y, today.m, today.d); }
  /* Un día no se puede elegir si ya pasó, si hoy ya cerramos, o si es posterior al último año */
  function isOff(y,m,d){
    if(y > LAST_YEAR) return true;
    var k = key(y,m,d), tk = tKey();
    if(k < tk) return true;
    if(k === tk) return today.min >= hoursOf(y,m,d).close;
    return false;
  }
  function monthOff(y,m){ return y > LAST_YEAR || key(y,m,1) < key(today.y, today.m, 1); }

  /* ── Cielo de globos ── */
  var monthEl = byId('calMonth'), yearEl = byId('calYear'), prevB = byId('calPrev'), nextB = byId('calNext');
  function render(dir){
    var y = view.y, m = view.m, first = (dow(y,m,1) + 6) % 7, n = dim(y,m), rows = Math.ceil((first+n)/7), html = '', i, tk = tKey();
    for(i = 0; i < rows*7; i++){
      var d = i - first + 1;
      if(d < 1 || d > n){ html += '<span class="cal-d off" aria-hidden="true"></span>'; continue; }
      var k = key(y,m,d), isSel = sel && k === key(sel.y, sel.m, sel.d);
      html += '<button type="button" class="cal-d' + (isWE(y,m,d) ? ' we' : '') + (k === tk ? ' is-today' : '') + (isSel ? ' is-sel' : '')
        + '" style="--i:' + i + '" data-d="' + d + '"' + (isOff(y,m,d) ? ' disabled' : '') + (isSel ? ' aria-pressed="true"' : '')
        + ' aria-label="' + longDate(y,m,d) + (k === tk ? ', hoy' : '') + '"><span class="b"><span class="bb"><span class="sh"></span><em>' + d + '</em>'
        + (k === tk ? '<small>hoy</small>' : '') + '</span></span></button>';
    }
    if(dir !== undefined){ daysEl.classList.remove('pre'); daysEl.classList.add('rise'); }
    else if(!daysEl.classList.contains('pre')) daysEl.classList.remove('rise');
    daysEl.innerHTML = html;
    cells = [].slice.call(daysEl.querySelectorAll('.cal-d[data-d]'));
    monthEl.textContent = cap(MESES[m-1]);
    yearEl.textContent = y;
    if(dir !== undefined && !reduce){ monthEl.classList.remove('swap'); void monthEl.offsetWidth; monthEl.classList.add('swap'); }
    prevB.disabled = m === 1 ? monthOff(y-1, 12) : monthOff(y, m-1);
    nextB.disabled = y >= LAST_YEAR && m >= 12;
  }
  /* Marca la fecha elegida sin reconstruir los globos (no se reinicia su vaivén) */
  function markSel(){
    var sk = sel ? key(sel.y, sel.m, sel.d) : 0;
    cells.forEach(function(c){
      var on = sk && key(view.y, view.m, +c.getAttribute('data-d')) === sk;
      c.classList.remove('popped');
      c.classList.toggle('is-sel', !!on);
      if(on) c.setAttribute('aria-pressed','true'); else c.removeAttribute('aria-pressed');
    });
  }
  function stepMonth(delta){
    var m = view.m + delta, y = view.y;
    if(m < 1){ m = 12; y--; } else if(m > 12){ m = 1; y++; }
    if(monthOff(y,m)) return;
    if(picker.classList.contains('open')) closePicker();
    view = { y:y, m:m }; render(delta);
  }
  prevB.addEventListener('click', function(){ stepMonth(-1); });
  nextB.addEventListener('click', function(){ stepMonth(1); });

  /* Confeti + onda al reventar un globo */
  var CONF = { week:['#C79BFF','#8A35E8','#FFD23F','#28B8F4','#FF3D9A','#fff'], we:['#FFC49A','#FF6A22','#FFD23F','#FF3D9A','#33C13D','#fff'] };
  function popFx(btn){
    var sh = btn.querySelector('.sh'); if(!sh || !sh.animate) return;
    var r = sh.getBoundingClientRect(), box = document.createElement('div'), cols = CONF[btn.classList.contains('we') ? 'we' : 'week'], i;
    box.className = 'cal-fx'; box.style.left = (r.left + r.width/2) + 'px'; box.style.top = (r.top + r.height/2) + 'px';
    var ring = document.createElement('i'); ring.className = 'ring'; box.appendChild(ring);
    ring.animate([{ transform:'scale(.4)', opacity:.9 }, { transform:'scale(2.6)', opacity:0 }], { duration:520, easing:'cubic-bezier(.2,.8,.3,1)', fill:'forwards' });
    for(i = 0; i < 20; i++){
      var p = document.createElement('i'), s = 5 + Math.random()*7, a = Math.random()*Math.PI*2, dist = 50 + Math.random()*110;
      p.style.cssText = 'width:' + s + 'px;height:' + (Math.random() < .5 ? s : s*.45) + 'px;margin:-3px 0 0 -3px;background:' + cols[i % cols.length] + ';border-radius:' + (Math.random() < .4 ? '50%' : '2px');
      box.appendChild(p);
      p.animate([
        { transform:'translate(0,0) rotate(0deg) scale(1)', opacity:1 },
        { transform:'translate(' + (Math.cos(a)*dist).toFixed(1) + 'px,' + (Math.sin(a)*dist + 46).toFixed(1) + 'px) rotate(' + Math.round(Math.random()*720 - 360) + 'deg) scale(.35)', opacity:0 }
      ], { duration:620 + Math.random()*480, easing:'cubic-bezier(.15,.8,.3,1)', fill:'forwards' });
    }
    document.body.appendChild(box);
    setTimeout(function(){ if(box.parentNode) box.remove(); }, 1250);
  }

  daysEl.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.cal-d[data-d]') : null;
    if(!b || b.disabled || busy) return;
    var d = +b.getAttribute('data-d');
    if(reduce || !b.querySelector('.sh').animate){ openDay(view.y, view.m, d, b); return; }
    busy = true; b.classList.add('popped'); popFx(b);
    setTimeout(function(){ busy = false; openDay(view.y, view.m, d, b); }, 230);
  });
  /* Flechas del teclado dentro de la cuadrícula */
  daysEl.addEventListener('keydown', function(e){
    var step = { ArrowLeft:-1, ArrowRight:1, ArrowUp:-7, ArrowDown:7 }[e.key];
    if(!step) return;
    var all = [].slice.call(daysEl.querySelectorAll('.cal-d[data-d]')), idx = all.indexOf(document.activeElement);
    if(idx < 0) return;
    e.preventDefault();
    var dir = step < 0 ? -1 : 1;
    for(var j = idx + step; j >= 0 && j < all.length; j += dir){ if(!all[j].disabled){ all[j].focus(); return; } }
  });

  /* Viento: los globos se apartan del cursor; foco de luz que lo sigue */
  var stage = byId('cal'), px = 0, py = 0, windRaf = 0, R = 120;
  function wind(){
    windRaf = 0;
    var sr = stage.getBoundingClientRect();
    stage.style.setProperty('--mx', (px - sr.left) + 'px'); stage.style.setProperty('--my', (py - sr.top) + 'px');
    cells.forEach(function(c){
      if(c.disabled) return;
      var r = c.getBoundingClientRect(), dx = r.left + r.width/2 - px, dy = r.top + r.height*.4 - py, dist = Math.sqrt(dx*dx + dy*dy) || 1, bb = c.firstChild.firstChild;
      if(dist < R){
        var f = 1 - dist/R, push = f*f*20;
        bb.style.setProperty('--wx', (dx/dist*push).toFixed(1) + 'px');
        bb.style.setProperty('--wy', (dy/dist*push*.7).toFixed(1) + 'px');
        bb.style.setProperty('--wr', (dx/R*14*f).toFixed(1) + 'deg');
      }else{ bb.style.removeProperty('--wx'); bb.style.removeProperty('--wy'); bb.style.removeProperty('--wr'); }
    });
  }
  if(fine && !reduce){
    stage.addEventListener('pointermove', function(e){ px = e.clientX; py = e.clientY; if(!windRaf) windRaf = requestAnimationFrame(wind); });
    stage.addEventListener('pointerleave', function(){
      cells.forEach(function(c){ var bb = c.firstChild.firstChild; bb.style.removeProperty('--wx'); bb.style.removeProperty('--wy'); bb.style.removeProperty('--wr'); });
    });
  }

  /* Los globos suben cuando el escenario entra en pantalla */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      if(es[0].isIntersecting){ io.disconnect(); daysEl.classList.remove('pre'); daysEl.classList.add('rise'); }
    }, { threshold:.2 });
    io.observe(stage);
  } else daysEl.classList.remove('pre');

  /* ── Selector de mes y año ── */
  var picker = byId('calPicker'), titleB = byId('calTitle'), pm = byId('calPM'), yTxt = byId('calYTxt'), yPrev = byId('calYPrev'), yNext = byId('calYNext');
  var calBodyKids = [].slice.call(document.querySelectorAll('#cal .cal-dow, #cal .cal-days, #cal .cal-legend'));
  function renderPicker(){
    yTxt.textContent = pickY;
    yPrev.disabled = pickY <= today.y;
    yNext.disabled = pickY >= LAST_YEAR;
    var html = '';
    for(var mo = 1; mo <= 12; mo++){
      html += '<button type="button" data-m="' + mo + '"' + (monthOff(pickY, mo) ? ' disabled' : '')
        + (pickY === view.y && mo === view.m ? ' class="on"' : (pickY === today.y && mo === today.m ? ' class="cur"' : '')) + '>' + cap(MESES[mo-1]).slice(0,3) + '</button>';
    }
    pm.innerHTML = html;
  }
  function closePicker(){
    picker.classList.remove('open'); picker.setAttribute('aria-hidden','true'); titleB.setAttribute('aria-expanded','false');
    calBodyKids.forEach(function(el){ el.removeAttribute('inert'); });
  }
  function setPicker(open){
    if(open){
      pickY = view.y; renderPicker();
      picker.classList.add('open'); picker.setAttribute('aria-hidden','false'); titleB.setAttribute('aria-expanded','true');
      calBodyKids.forEach(function(el){ el.setAttribute('inert',''); });
    } else closePicker();
  }
  titleB.addEventListener('click', function(){ setPicker(!picker.classList.contains('open')); });
  yPrev.addEventListener('click', function(){ if(pickY > today.y){ pickY--; renderPicker(); } });
  yNext.addEventListener('click', function(){ if(pickY < LAST_YEAR){ pickY++; renderPicker(); } });
  pm.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('button[data-m]') : null;
    if(!b || b.disabled) return;
    var from = key(view.y, view.m, 1), to = key(pickY, +b.getAttribute('data-m'), 1);
    view = { y:pickY, m:+b.getAttribute('data-m') };
    closePicker();
    render(to === from ? 0 : (to > from ? 1 : -1));
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && picker.classList.contains('open')){ closePicker(); titleB.focus(); }
  });

  /* ── Panel de horario (sigue a la fecha elegida; sin fecha = hoy) ── */
  var focusEl = byId('calFocus'), pickEl = byId('calPick');
  function renderFocus(){
    var f = sel || { y:today.y, m:today.m, d:today.d }, h = hoursOf(f.y, f.m, f.d), we = isWE(f.y, f.m, f.d), isT = key(f.y, f.m, f.d) === tKey();
    var label = (isT ? 'Hoy · ' : 'Tu fecha · ') + shortDate(f.y, f.m, f.d);
    var html = '<small class="f-k"><i class="dot' + (we ? ' we' : '') + '"></i>' + label + '</small>'
      + '<strong class="f-h">' + fmtT(h.open) + ' <span>–</span> ' + fmtT(h.close) + '</strong>'
      + '<span class="f-cap">Horario de atención</span>'
      + (sel && turno >= 0 ? '<p class="f-turno">Turno ' + TURNOS[turno].n.toLowerCase() + ': ' + fmtT(TURNOS[turno].s) + ' a ' + fmtT(TURNOS[turno].e) + '</p>' : '')
      + '<ul class="f-rows"><li' + (!we ? ' class="on"' : '') + '><i class="dot"></i><b>Lun a Vie</b><em>' + fmtT(HOURS.week.open) + ' a ' + fmtT(HOURS.week.close) + '</em></li>'
      + '<li' + (we ? ' class="on"' : '') + '><i class="dot we"></i><b>Sáb y Dom</b><em>' + fmtT(HOURS.weekend.open) + ' a ' + fmtT(HOURS.weekend.close) + '</em></li></ul>';
    setHTML(focusEl, html);
  }
  function waHref(){
    var txt = 'Hola, quiero reservar una fiesta infantil en Magic Kids para el ' + longDate(sel.y, sel.m, sel.d)
      + (turno >= 0 ? ', en el turno de ' + fmtT(TURNOS[turno].s) + ' a ' + fmtT(TURNOS[turno].e) : '')
      + '. ¿Tienen disponible esa fecha?';
    return 'https://wa.me/' + SALON_WHATSAPP + '?text=' + encodeURIComponent(txt);
  }
  function renderPick(){
    if(!sel){
      pickEl.classList.add('is-empty');
      setHTML(pickEl, '<small>Tu fecha</small><strong>Revienta un globo</strong><p>Toca el día que quieras para ver su horario y reservarlo por WhatsApp.</p>');
      return;
    }
    pickEl.classList.remove('is-empty');
    setHTML(pickEl, '<small>Tu fecha</small><strong>' + cap(longDate(sel.y, sel.m, sel.d)) + '</strong>'
      + (turno >= 0 ? '<p>Turno ' + TURNOS[turno].n.toLowerCase() + ': ' + fmtT(TURNOS[turno].s) + ' a ' + fmtT(TURNOS[turno].e) + '</p>' : '')
      + '<a class="btn btn-wa" href="' + waHref() + '" target="_blank" rel="noopener">Reservar por WhatsApp' + ARROW + '</a>'
      + '<button type="button" class="cal-change">Cambiar fecha o turno</button>');
  }
  pickEl.addEventListener('click', function(e){
    if(e.target.closest && e.target.closest('.cal-change') && sel) openModal(e.target);
  });

  /* ── Boleto del día ── */
  var modal = byId('calModal'), sheet = byId('calSheet'), slotsEl = byId('calSlots'), waB = byId('calWa'), stubEl = byId('calStub'),
      mPrev = byId('calMPrev'), mNext = byId('calMNext'), closeTimer;
  function modalOpen(){ return modal.classList.contains('open'); }
  function fillModal(animate){
    if(!sel) return;
    var y = sel.y, m = sel.m, d = sel.d, h = hoursOf(y,m,d), isToday = key(y,m,d) === tKey(), i, html = '';
    stubEl.classList.toggle('we', isWE(y,m,d));
    byId('calMMon').textContent = MESES[m-1].slice(0,3);
    byId('calMNum').textContent = d;
    byId('calMDow').textContent = DIAS[dow(y,m,d)];
    byId('calMTitle').textContent = cap(shortDate(y,m,d)) + ' de ' + y;
    byId('calMHours').textContent = 'Horario de atención: ' + fmtT(h.open) + ' a ' + fmtT(h.close);
    byId('calMBadge').hidden = !isToday;
    if(turno >= 0 && isToday && today.min >= TURNOS[turno].s) turno = -1;
    for(i = 0; i < TURNOS.length; i++){
      var t = TURNOS[i], gone = isToday && today.min >= t.s;
      html += '<button type="button" class="cal-slot" data-t="' + i + '" aria-pressed="' + (turno === i ? 'true' : 'false') + '"' + (gone ? ' disabled' : '') + '><span>'
        + fmtT(t.s) + ' a ' + fmtT(t.e) + '</span><em>' + t.n + '</em></button>';
    }
    setHTML(slotsEl, html);
    waB.href = waHref();
    var p = addDays(y,m,d,-1), n = addDays(y,m,d,1);
    mPrev.disabled = isOff(p.y, p.m, p.d);
    mNext.disabled = isOff(n.y, n.m, n.d);
    if(animate && !reduce){
      [].slice.call(sheet.querySelectorAll('.cal-tbody > *, .cal-stub .st-date')).forEach(function(el){
        el.classList.remove('cal-m-swap'); void el.offsetWidth; el.classList.add('cal-m-swap');
      });
    }
  }
  function choose(y,m,d, animate){
    sel = { y:y, m:m, d:d };
    if(view.y !== y || view.m !== m){ view = { y:y, m:m }; render(0); } else markSel();
    renderPick(); renderFocus(); fillModal(animate);
  }
  function openDay(y,m,d,trigger){
    var same = sel && key(sel.y, sel.m, sel.d) === key(y,m,d);
    if(!same) turno = -1;
    choose(y,m,d,false);
    openModal(trigger);
  }
  function openModal(trigger){
    clearTimeout(closeTimer);
    lastFocus = trigger || document.activeElement;
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    if(sbw > 0) document.body.style.paddingRight = sbw + 'px';
    document.documentElement.classList.add('cal-lock');
    if(window.__lenis && window.__lenis.stop) window.__lenis.stop();
    modal.hidden = false; void modal.offsetWidth;
    modal.classList.add('open');
    setTimeout(function(){ sheet.focus({ preventScroll:true }); }, reduce ? 0 : 80);
  }
  function closeModal(){
    if(!modalOpen()) return;
    modal.classList.remove('open');
    closeTimer = setTimeout(function(){
      modal.hidden = true;
      document.documentElement.classList.remove('cal-lock');
      document.body.style.paddingRight = '';
      if(window.__lenis && window.__lenis.start) window.__lenis.start();
    }, reduce ? 0 : 560);
    var back = daysEl.querySelector('.cal-d.is-sel') || (lastFocus && document.contains(lastFocus) ? lastFocus : null);
    if(back) back.focus({ preventScroll:true });
  }
  modal.addEventListener('click', function(e){
    if(e.target.closest && e.target.closest('[data-cal-close]')) closeModal();
  });
  slotsEl.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.cal-slot') : null;
    if(!b || b.disabled) return;
    var i = +b.getAttribute('data-t');
    turno = (turno === i) ? -1 : i;
    fillModal(false); renderPick(); renderFocus();
  });
  mPrev.addEventListener('click', function(){ if(sel && !mPrev.disabled){ var p = addDays(sel.y, sel.m, sel.d, -1); choose(p.y, p.m, p.d, true); } });
  mNext.addEventListener('click', function(){ if(sel && !mNext.disabled){ var n = addDays(sel.y, sel.m, sel.d, 1); choose(n.y, n.m, n.d, true); } });
  document.addEventListener('keydown', function(e){
    if(!modalOpen()) return;
    if(e.key === 'Escape'){ e.preventDefault(); closeModal(); return; }
    if(e.key === 'ArrowLeft' && !mPrev.disabled){ e.preventDefault(); mPrev.click(); return; }
    if(e.key === 'ArrowRight' && !mNext.disabled){ e.preventDefault(); mNext.click(); return; }
    if(e.key === 'Tab'){
      var f = [].slice.call(sheet.querySelectorAll('button:not([disabled]), a[href]')).filter(function(el){ return !el.hidden; });
      if(!f.length) return;
      var first = f[0], last = f[f.length-1], a = document.activeElement;
      if(e.shiftKey && (a === first || a === sheet)){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && a === last){ e.preventDefault(); first.focus(); }
      else if(!sheet.contains(a)){ e.preventDefault(); first.focus(); }
    }
  });

  /* ── Reloj: mantiene "hoy" al día aunque la página quede abierta ── */
  function tick(){
    var n = nowMty(), dayChanged = key(n.y,n.m,n.d) !== tKey(), wasOff = isOff(today.y, today.m, today.d);
    today = n;
    if(sel && isOff(sel.y, sel.m, sel.d)){ sel = null; turno = -1; closeModal(); }
    if(key(view.y, view.m, 1) < key(today.y, today.m, 1)) view = { y:today.y, m:today.m };
    if(dayChanged || wasOff !== isOff(today.y, today.m, today.d)){
      if(!picker.classList.contains('open')) render();
    }
    renderFocus(); renderPick();
    if(modalOpen()) fillModal(false);
  }
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) tick(); });
  window.addEventListener('pageshow', tick);
  window.addEventListener('focus', tick);

  render(); renderFocus(); renderPick();
})();
