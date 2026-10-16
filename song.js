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
  const button = byId('song-play');
  const status = byId('song-status');
  const offset = byId('lyrics-start');
  const START_TIME = 25;
  let active = -1, objectUrl;
  const timeLabel = s => Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
  function sync() {
    // Align the original cue baseline (first vocal at 30s) to this audio file.
    const now = audio.currentTime + 30 - Number(offset.value);
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
  function state(){
    button.textContent=audio.paused?'Play our song ♡':'Pause our song';
    button.setAttribute('aria-pressed',String(!audio.paused));
  }
  async function play(){
    try{if(audio.ended)audio.currentTime=Math.min(START_TIME,audio.duration||START_TIME);await audio.play();}
    catch(error){status.textContent=audio.error?'Add song.mp3 to the website folder, or choose your audio file below.':'Tap play to start the music.';}
  }
  button.addEventListener('click',()=>audio.paused?play():audio.pause());
  byId('song-restart').addEventListener('click',()=>{audio.currentTime=Math.min(START_TIME,audio.duration||START_TIME);sync();});
  audio.addEventListener('play',()=>{state();status.textContent='Playing · English + Indonesian';});
  audio.addEventListener('pause',()=>{state();status.textContent='Paused';});
  audio.addEventListener('ended',()=>{state();status.textContent='A little song, just for you. ♡';});
  audio.addEventListener('timeupdate',sync);
  audio.addEventListener('seeked',sync);
  audio.addEventListener('waiting',()=>{status.textContent='Loading audio…';});
  audio.addEventListener('error',()=>{state();status.textContent='Add song.mp3 to the website folder, or choose your audio file below.';});
  function startAtIntro(){audio.currentTime=Math.min(START_TIME,audio.duration||START_TIME);sync();play();}
  audio.addEventListener('loadedmetadata',startAtIntro);
  offset.addEventListener('input',sync);
  byId('audio-file').addEventListener('change',event=>{
    const file=event.target.files[0];if(!file)return;
    audio.pause();
    if(objectUrl)URL.revokeObjectURL(objectUrl);
    objectUrl=URL.createObjectURL(file);audio.src=objectUrl;audio.load();
    status.textContent='Loading your audio…';
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
  sync();state();
  if(audio.readyState>=1)startAtIntro();
})();
