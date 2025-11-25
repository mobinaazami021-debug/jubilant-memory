/* main.js — کنترل تعاملی صفحات حرکت (نسخه پایدار و سازگار) */

/* helper */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function show(el){ if(!el) return; el.style.display = 'block'; }
function hide(el){ if(!el) return; el.style.display = 'none'; }

/* DOMContentLoaded */
document.addEventListener('DOMContentLoaded', () => {

  /* --- اضافه کردن شخصیت‌ها در stage ها در صورت نیاز --- */
  if($('#distance-stage') && !$('#runner')){
    const r = document.createElement('div'); r.id='runner'; r.className='runner'; $('#distance-stage').appendChild(r);
  }
  if($('#inst-speed-stage') && !$('#inst-runner')){
    const r2 = document.createElement('div'); r2.id='inst-runner'; r2.className='runner'; $('#inst-speed-stage').appendChild(r2);
  }
  if($('#rocket-stage') && !$('#rocket-char')){
    const rc = document.createElement('div'); rc.id='rocket-char'; rc.className='rocket'; $('#rocket-stage').appendChild(rc);
  }
  if($('#sim-stage') && !$('#sim-car')){
    const sc = document.createElement('div'); sc.id='sim-car'; sc.className='car'; $('#sim-stage').appendChild(sc);
  }

  /* ===== Distance page: simple runner animation & check ===== */
  if($('#run-start')){
    let runTimer = null;
    $('#run-start').addEventListener('click', () => {
      clearInterval(runTimer);
      const run = $('#runner'), stage = $('#distance-stage');
      let left = -140;
      run.style.left = left + 'px';
      const sp = Number($('#run-speed').value) || 1.2;
      runTimer = setInterval(()=>{
        left += sp * 3;
        run.style.left = left + 'px';
        if(left > stage.clientWidth + 80){ clearInterval(runTimer); run.style.left='-140px'; }
      }, 24);
      $('#run-stop').addEventListener('click', ()=>{ clearInterval(runTimer); run.style.left='-140px'; });
    });
  }

  if($('#dist-check')){
    $('#dist-check').addEventListener('click', ()=>{
      const sVal = $('#dist-s').value.trim();
      const dVal = $('#dist-d').value.trim();
      const res = $('#dist-result');
      if(sVal === '' || dVal === '') { alert('لطفاً هر دو پاسخ را وارد کنید'); return; }
      // parse numbers
      const sNum = Number(sVal.replace(',','.')), dNum = Number(dVal.replace(',','.'));
      // basic feedback (example from book expected 7 and 3)
      res.innerHTML = `پاسخ ثبت شد — مسافت: ${sNum} m — جابه‌جایی: ${dNum} m`;
      show(res);
    });
  }

  /* ===== Displacement vector draw ===== */
  if($('#vec-draw')){
    $('#vec-draw').addEventListener('click', ()=>{
      const x = Number($('#vec-x').value || 0), y = Number($('#vec-y').value || 0);
      const stage = $('#vec-stage'); stage.innerHTML = '';
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 320 160'); svg.setAttribute('width','100%');
      const cx = 60, cy = 120, scale = 14;
      const ax = document.createElementNS(ns,'line'); ax.setAttribute('x1',10); ax.setAttribute('y1',cy); ax.setAttribute('x2',310); ax.setAttribute('y2',cy); ax.setAttribute('stroke','#eee'); svg.appendChild(ax);
      const ay = document.createElementNS(ns,'line'); ay.setAttribute('x1',cx); ay.setAttribute('y1',10); ay.setAttribute('x2',cx); ay.setAttribute('y2',150); ay.setAttribute('stroke','#eee'); svg.appendChild(ay);
      const x2 = cx + x*scale, y2 = cy - y*scale;
      const vec = document.createElementNS(ns,'line'); vec.setAttribute('x1',cx); vec.setAttribute('y1',cy); vec.setAttribute('x2',x2); vec.setAttribute('y2',y2); vec.setAttribute('stroke','#7c3aed'); vec.setAttribute('stroke-width',3); svg.appendChild(vec);
      const head = document.createElementNS(ns,'polygon'); head.setAttribute('points',`${x2},${y2} ${x2-8},${y2-5} ${x2-8},${y2+5}`); head.setAttribute('fill','#7c3aed'); svg.appendChild(head);
      const txt = document.createElementNS(ns,'text'); txt.setAttribute('x', x2+8); txt.setAttribute('y', y2-8); txt.setAttribute('font-size',12); txt.setAttribute('fill','#111'); txt.textContent = `|r|=${Math.sqrt(x*x + y*y).toFixed(2)} m`; svg.appendChild(txt);
      stage.appendChild(svg);
      show($('#vec-answer'));
    });
  }

  /* ===== avg speed example (simple) ===== */
  if($('#calc-avg-speed')){
    $('#calc-avg-speed').addEventListener('click', ()=>{
      const d = Number($('#avgS').value) || 0;
      const t = Number($('#avgT').value) || 1;
      const res = $('#avg-speed-result');
      res.innerText = `تندی متوسط = ${ (d / t).toFixed(3) } m/s`;
      show(res);
    });
  }

  /* ===== inst speed simple demo (inst-speed page) ===== */
  if($('#inst-start')){
    $('#inst-start').addEventListener('click', ()=>{
      const stage = $('#inst-speed-stage'), run = $('#inst-runner');
      if(!run) return;
      let left = -140; run.style.left='-140px';
      const sp = Number($('#inst-speed-range').value)||1.2;
      const t = setInterval(()=>{ left += sp*3; run.style.left = left+'px'; if(left > stage.clientWidth+80) { clearInterval(t); run.style.left='-140px'; } }, 24);
    });
  }

  /* ===== Acceleration demo (rocket) ===== */
  if($('#acc-start')){
    let rcTimer = null;
    $('#acc-start').addEventListener('click', ()=>{
      clearInterval(rcTimer);
      const rc = $('#rocket-char'); let v=0;
      rc.style.transform = 'translateY(0)';
      rcTimer = setInterval(()=>{
        const a = Number($('#acc-slider').value) || 0.6;
        v += a * 0.05;
        const up = Math.min(220, v * 36);
        rc.style.transform = `translateY(${-up}px)`;
        if(up >= 220) clearInterval(rcTimer);
      }, 50);
      $('#acc-stop').addEventListener('click', ()=>{ clearInterval(rcTimer); rc.style.transform='translateY(0)'; });
    });
  }

  /* ===== games simulator ===== */
  if($('#sim-run')){
    let simAnim = null;
    $('#sim-run').addEventListener('click', ()=>{
      clearInterval(simAnim);
      const car = $('#sim-car'), stage = $('#sim-stage');
      const v0 = Number($('#sim-v0').value) || 0;
      const a = Number($('#sim-a').value) || 0;
      const tTarget = Number($('#sim-t').value) || 2;
      let t = 0;
      car.style.left = '-140px';
      simAnim = setInterval(()=>{
        t += 0.02;
        const s = v0 * t + 0.5 * a * t * t;
        car.style.left = Math.min(stage.clientWidth - 80, s * 6) + 'px';
        if(t >= tTarget) { clearInterval(simAnim); }
      }, 20);
    });
    $('#sim-reset')?.addEventListener('click', ()=>{ $('#sim-car').style.left='-140px'; $('#sim-result').style.display='none'; });
    $('#sim-check')?.addEventListener('click', ()=>{
      const v0 = Number($('#sim-v0').value) || 0;
      const a = Number($('#sim-a').value) || 0;
      const tTarget = Number($('#sim-t').value) || 0;
      const trueV = v0 + a * tTarget;
      const trueS = v0 * tTarget + 0.5 * a * tTarget * tTarget;
      const userV = Number($('#sim-v-ans').value) || 0;
      const userS = Number($('#sim-s-ans').value) || 0;
      const res = $('#sim-result');
      const vOk = Math.abs(userV - trueV) < Math.max(0.05, Math.abs(trueV)*0.03);
      const sOk = Math.abs(userS - trueS) < Math.max(0.1, Math.abs(trueS)*0.03);
      let msg = `<b>مقدار درست:</b> v=${trueV.toFixed(3)} m/s — s=${trueS.toFixed(3)} m<br>`;
      msg += `<b>پاسخ شما:</b> v=${userV} m/s — s=${userS} m<br>`;
      if(vOk && sOk) msg = `<b style="color:green">عالی — هر دو مقدار درست یا نزدیک به درست هستند.</b><br>` + msg;
      else msg = `<b style="color:red">اشتباه — سعی کن دوباره محاسبه کنی.</b><br>` + msg;
      res.style.display='block'; res.innerHTML = msg;
    });
  }

  /* ===== quiz integration (simple loader if quiz-data present globally) ===== */
  if(window.Quiz && typeof window.Quiz.init === 'function'){
    try { window.Quiz.init(); } catch(e){ console.warn('Quiz init error:',e); }
  }

}); // DOMContentLoaded end

/* Export small API for pages if needed */
window.PhysicsLab = {
  drawVector: function(x,y,stageId,answerId){
    const xi = Number(document.getElementById(x).value||0);
    const yi = Number(document.getElementById(y).value||0);
    const stage = document.getElementById(stageId); stage.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 320 160'); svg.setAttribute('width','100%');
    const cx = 60, cy = 120, scale = 14;
    const x2 = cx + xi*scale, y2 = cy - yi*scale;
    const vec = document.createElementNS(ns,'line'); vec.setAttribute('x1',cx); vec.setAttribute('y1',cy); vec.setAttribute('x2',x2); vec.setAttribute('y2',y2); vec.setAttribute('stroke','#7c3aed'); vec.setAttribute('stroke-width',3); svg.appendChild(vec);
    const head = document.createElementNS(ns,'polygon'); head.setAttribute('points',`${x2},${y2} ${x2-8},${y2-5} ${x2-8},${y2+5}`); head.setAttribute('fill','#7c3aed'); svg.appendChild(head);
    const txt = document.createElementNS(ns,'text'); txt.setAttribute('x', x2+8); txt.setAttribute('y', y2-8); txt.setAttribute('font-size',12); txt.setAttribute('fill','#111'); txt.textContent = `|r|=${Math.sqrt(xi*xi + yi*yi).toFixed(2)} m`; svg.appendChild(txt);
    stage.appendChild(svg);
    const ans = document.getElementById(answerId); if(ans) ans.style.display='block';
  }
};
