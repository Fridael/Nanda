(() => {
  'use strict';
  const canvas = document.getElementById('heart');
  const ctx = canvas.getContext('2d');
  const message = document.getElementById('message');
  const speed = document.getElementById('speed');
  const play = document.getElementById('play');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motionQuery.matches;
  let text = 'LOVE YOU', color = '#ff83b8', flow = 1, mode = 'ribbon';
  let width = 0, height = 0, size = 0, centerX = 0, centerY = 0;
  let clock = 0, previous = 0, frame = 0;
  let rings = [], stars = [], bursts = [], glitter = [];
  let sprites = [];
  const palette = {pink:'#ff83b8',lilac:'#c7a6ff',peach:'#ffc79e'};

  function makeSprites(fontSize) {
    sprites = [];
    for (let i = 0; i < 3; i++) {
      const tile = document.createElement('canvas');
      const c = tile.getContext('2d');
      c.font = `${i === 2 ? 600 : 400} ${fontSize}px Arial, sans-serif`;
      const tw = Math.ceil(c.measureText(text).width);
      tile.width = Math.ceil((tw + 12) * 2);
      tile.height = Math.ceil((fontSize + 14) * 2);
      c.scale(2,2);
      c.font = `${i === 2 ? 600 : 400} ${fontSize}px Arial, sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = i === 2 ? '#ffe8f4' : color;
      c.fillText(text, tile.width / 4, tile.height / 4);
      sprites.push({image:tile,width:tile.width/2,height:tile.height/2,textWidth:tw});
    }
  }

  function heartPoint(t, scale) {
    return {x:centerX + size * scale * Math.pow(Math.sin(t),3),
      y:centerY - size * scale * (13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/16};
  }

  function rebuild() {
    width = canvas.clientWidth; height = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    centerX = width/2;
    size = Math.min(width * (width < 650 ? .39 : .31), (height-140)*.53, 330);
    centerY = 64 + (height-150)*.43;
    const recipient = document.getElementById('recipient');
    // Place the name in the upper opening, matching the marked reference.
    recipient.style.left = `${centerX}px`;
    recipient.style.top = `${centerY - size * .05 + 12}px`;
    const fontSize = width < 650 ? 6.8 : Math.max(8,Math.min(10,size/27));
    makeSprites(fontSize);
    rings = [];
    const count = mode === 'ribbon' ? 9 : (width < 650 ? 15 : 18);
    for(let r=0;r<count;r++) {
      const scale = mode === 'ribbon' ? .76 + r/(count-1)*.24 : .14 + r/(count-1)*.86;
      const points = [], distances = [0];
      let length = 0;
      for(let j=0;j<=900;j++) {
        const p = heartPoint(j/900*Math.PI*2, scale);
        points.push(p);
        if(j) {length += Math.hypot(p.x-points[j-1].x,p.y-points[j-1].y);distances.push(length);}
      }
      rings.push({points,distances,length,scale,phase:(r*.381966)%1,
        direction:r%3===0?-1:1, count:Math.max(5,Math.floor(length/(sprites[0].textWidth+10)))});
    }
    stars = Array.from({length:width<650?28:65},(_,i)=>({
      x:((Math.sin(i*127.1)*43758.5453)%1+1)%1*width,
      y:((Math.sin(i*311.7)*12258.5453)%1+1)%1*(height-70),
      r:i%6===0?1:.5,phase:i*1.79}));
    const seed=n=>((Math.sin(n*91.717)*43758.5453)%1+1)%1;
    glitter=Array.from({length:width<650?18:30},(_,i)=>({
      x:seed(i+4),y:seed(i+71),speed:.018+seed(i+29)*.019,
      font:8+seed(i+93)*7,phase:i*2.39,alpha:.40+seed(i+27)*.28
    }));
    render();
  }

  function position(ring, progress) {
    const target = (((progress%1)+1)%1)*ring.length;
    let lo=0,hi=ring.distances.length-1;
    while(lo<hi) {const mid=(lo+hi)>>1;if(ring.distances[mid]<target)lo=mid+1;else hi=mid;}
    const index=Math.max(1,lo), a=ring.points[index-1],b=ring.points[index];
    const fraction=(target-ring.distances[index-1])/(ring.distances[index]-ring.distances[index-1]||1);
    return {x:a.x+(b.x-a.x)*fraction,y:a.y+(b.y-a.y)*fraction};
  }

  function render() {
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle=color;
    for(const star of stars) {
      ctx.globalAlpha=.08+.11*(.5+.5*Math.sin(clock*.32+star.phase));
      ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fill();
    }
    ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
    for(const flake of glitter) {
      const travel=(flake.y+clock*flake.speed)%1;
      const x=flake.x*width+Math.sin(clock*.45+flake.phase)*9;
      const y=travel*(height+30)-15;
      ctx.globalAlpha=flake.alpha*Math.sin(Math.PI*travel);
      ctx.font=`${flake.font}px Arial, sans-serif`;
      ctx.fillText('♡',x,y);
    }
    ctx.restore();
    for(let r=0;r<rings.length;r++) {
      const ring=rings[r];
      // Only text advances along fixed paths: no heartbeat, scaling, or shape morph.
      const offset=ring.phase+clock*(13+r*.22)*ring.direction/ring.length;
      for(let k=0;k<ring.count;k++) {
        const p=position(ring,k/ring.count+offset);
        const shine=Math.sin(k*2.7+r*.91+clock*.55);
        const bright=shine>.985;
        const tile=sprites[bright?2:0];
        ctx.globalAlpha=(.57+ring.scale*.35)*(bright?1:.93+.07*shine);
        if(mode === 'ribbon') {
          const next=position(ring,k/ring.count+offset+.001);
          let angle=Math.atan2(next.y-p.y,next.x-p.x);
          if(angle>Math.PI/2)angle-=Math.PI;
          if(angle<-Math.PI/2)angle+=Math.PI;
          ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);
          ctx.drawImage(tile.image,-tile.width/2,-tile.height/2,tile.width,tile.height);
          ctx.restore();
        } else ctx.drawImage(tile.image,p.x-tile.width/2,p.y-tile.height/2,tile.width,tile.height);
      }
    }
    for(const b of bursts) {
      const age=clock-b.born;
      if(age<0||age>2.5)continue;
      const tile=sprites[0];ctx.globalAlpha=Math.max(0,1-age/2.5)*.8;
      const x=b.x+b.vx*age,y=b.y+b.vy*age+10*age*age;
      ctx.drawImage(tile.image,x-tile.width/2,y-tile.height/2,tile.width,tile.height);
    }
    ctx.globalAlpha=1;
  }

  function tick(now) {
    const delta=previous?Math.min((now-previous)/1000,.05):0;
    previous=now;
    if(!paused&&!document.hidden) {clock+=delta*flow;bursts=bursts.filter(b=>clock-b.born<2.5);render();}
    frame=requestAnimationFrame(tick);
  }
  function updateButton() {
    play.setAttribute('aria-label',paused?'Play animation':'Pause animation');
    play.setAttribute('aria-pressed',String(paused));
    document.getElementById('play-text').textContent=paused?'Play':'Pause';
    document.getElementById('play-icon').innerHTML=paused?'<path d="M6 3.5 16 10 6 16.5Z"/>':'<rect x="5" y="4" width="3" height="12" rx="1"/><rect x="12" y="4" width="3" height="12" rx="1"/>';
  }
  function toggle() {paused=!paused;updateButton();document.getElementById('announcement').textContent=paused?'Animation paused.':'Animation playing.';}
  play.addEventListener('click',toggle);
  message.addEventListener('input',()=>{text=message.value.trim()||'LOVE YOU';rebuild();});
  document.getElementById('mode').addEventListener('change',event=>{mode=event.target.value;rebuild();});
  speed.addEventListener('input',()=>{flow=Number(speed.value);document.getElementById('speed-label').value=`${flow.toLocaleString('id-ID')}×`;});
  document.querySelectorAll('.swatch').forEach(button=>button.addEventListener('click',()=>{
    color=palette[button.dataset.color];document.documentElement.style.setProperty('--accent',color);
    document.querySelectorAll('.swatch').forEach(b=>{const selected=b===button;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
    rebuild();
  }));
  canvas.addEventListener('pointerdown',event=>{
    if(paused)return;
    const rect=canvas.getBoundingClientRect();
    for(let i=0;i<14;i++){const angle=i/14*Math.PI*2;bursts.push({x:event.clientX-rect.left,y:event.clientY-rect.top,vx:Math.cos(angle)*(22+(i%3)*13),vy:Math.sin(angle)*42-10,born:clock});}
    bursts=bursts.slice(-84);
  });
  window.addEventListener('keydown',event=>{if(event.code==='Space'&&!/INPUT|BUTTON|TEXTAREA|SELECT/.test(document.activeElement.tagName)){event.preventDefault();toggle();}});
  document.addEventListener('visibilitychange',()=>{previous=0;});
  motionQuery.addEventListener('change',event=>{paused=event.matches;updateButton();render();});
  new ResizeObserver(rebuild).observe(canvas);
  updateButton();rebuild();frame=requestAnimationFrame(tick);
  window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
  window.addEventListener('pageshow',event=>{if(event.persisted){previous=0;frame=requestAnimationFrame(tick);}});
})();
