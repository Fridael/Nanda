(() => {
  'use strict';
  // Text and translations supplied by the user. Times follow the official
  // video's caption segments, not the shorter studio audio version.
  const cues = [
    [0, 'Instrumental intro', ''],
    [30, "Watch the sunrise along the coast\nAs we're both getting old", 'Saksikan matahari terbit di sepanjang pantai\nSaat kita berdua semakin tua'],
    [39, "I can't describe what I'm feeling\nAnd all I know is we're going home", 'Aku nggak bisa menggambarkan apa yang aku rasakan\nDan yang aku tahu adalah kita pulang'],
    [49, "So please don't let me go, oh\nDon't let me go, oh-oh-oh", 'Jadi tolong jangan biarkan aku pergi, oh\nJangan biarkan aku pergi, oh-oh-oh'],
    [58, "And if it's right\nI don't care how long it takes", 'Dan jika ini benar\nAku nggak peduli berapa lama waktu yang dibutuhkan'],
    [68, "As long as I'm with you\nI've got a smile on my face", 'Asal aku bersamamu\nAku punya senyum di wajahku'],
    [75, "Save your tears, it'll be okay", 'Simpan air matamu, semuanya akan baik-baik saja'],
    [83, "All I know is you're here with me", 'Yang aku tahu hanyalah kamu di sini bersamaku'],
    [94, 'Oh, oh, oh, oh-oh-oh-oh-oh', 'Oh, oh, oh, oh-oh-oh-oh-oh'],
    [106, "Watch the sunrise as we're getting old, oh-oh", 'Saksikan matahari terbit saat kita semakin tua, oh-oh'],
    [117, "I can't describe, whoa-oh", 'Aku nggak bisa menggambarkan, whoa-oh'],
    [122, 'I wish I could live through every memory again', 'Aku berharap bisa menghidupi setiap kenangan lagi'],
    [130, 'Just one more time before we float off in the wind\nAnd all the time we spent', 'Hanya sekali lagi sebelum kita melayang di angin\nDan semua waktu yang kita habiskan'],
    [139, 'Waiting for the light to take us in', 'Menunggu cahaya untuk membawa kita masuk'],
    [145, 'Have been the greatest moments of my life', 'Adalah momen terindah dalam hidupku'],
    [152, "I don't care how long it takes", 'Aku nggak peduli berapa lama waktu yang dibutuhkan'],
    [159, "As long as I'm with you, I've got a smile on my face", 'Asal aku bersamamu, aku punya senyum di wajahku'],
    [166, "Save your tears, it'll be okay, ay, ay, ay, ay, ay-ay-ay-ay", 'Simpan air matamu, semuanya akan baik-baik saja, ay, ay, ay, ay, ay-ay-ay-ay'],
    [179, 'Yeah, if with me', 'Yeah, jika bersamaku'],
    [185, 'Oh, oh, oh, oh-oh-oh-oh-oh', 'Oh, oh, oh, oh-oh-oh-oh-oh'],
    [194, "I can't describe, oh, oh", 'Aku nggak bisa menggambarkan, oh, oh'],
    [198, 'Instrumental outro', '']
  ];
  const byId = id => document.getElementById(id);
  const audio = byId('song-audio');
  const status = byId('song-status');
  const FIRST_VOCAL_TIME = 30;
  const START_TIME = 25;
  let active = -1, pendingStart = false, seekAttempts = 0, seekTimer;
  const timeLabel = s => Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
  function sync() {
    // Align the original cue baseline (first vocal at 30s) to this audio file.
    const now = audio.currentTime + 30 - FIRST_VOCAL_TIME;
    let index = 0;
    for(let i=1;i<cues.length && now>=cues[i][0];i++) index=i;
    if(index!==active){
      active=index;
      byId('lyric-en').textContent=cues[index][1];
      byId('lyric-id').textContent=cues[index][2];
      byId('lyric-card').classList.toggle('instrumental',!cues[index][2]);
    }
    byId('song-time').textContent=timeLabel(audio.currentTime||0);
  }
  function seekToStart(){
    pendingStart=true;seekAttempts=0;applyStart();
  }
  function applyStart(){
    if(!pendingStart || audio.readyState<1 || !Number.isFinite(audio.duration) || audio.duration<=0)return;
    clearTimeout(seekTimer);
    const target=Math.min(START_TIME,Math.max(0,audio.duration-.05));
    if(Math.abs(audio.currentTime-target)<.3){pendingStart=false;sync();return;}
    if(seekAttempts++>=4){pendingStart=false;status.textContent="Unable to seek yet. Please reload and try again.";return;}
    audio.currentTime=target;
    seekTimer=setTimeout(applyStart,350);
    sync();
  }
  async function play(){
    try{if(audio.ended)seekToStart();await audio.play();}
    catch(error){status.textContent=audio.error?'Audio could not load. Please refresh and try again.':'Tap play to start the music.';}
  }
  audio.addEventListener('play',()=>{status.textContent='Playing · English + Indonesian';});
  audio.addEventListener('pause',()=>{status.textContent='Paused';});
  audio.addEventListener('ended',()=>{status.textContent='A little song, just for you. ♡';});
  audio.addEventListener('timeupdate',sync);
  audio.addEventListener('seeked',()=>{sync();if(pendingStart)applyStart();});
  audio.addEventListener('canplay',()=>{if(pendingStart)applyStart();});
  audio.addEventListener('waiting',()=>{status.textContent='Loading audio…';});
  audio.addEventListener('error',()=>{status.textContent='Audio could not load. Please refresh and try again.';});
  function startAtIntro(){seekToStart();play();}
  audio.addEventListener('loadedmetadata',startAtIntro);
  window.addEventListener('pagehide',()=>clearTimeout(seekTimer));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
  sync();
  if(audio.readyState>=1)startAtIntro();
})();
