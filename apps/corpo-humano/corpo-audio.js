/* Canal único de voz. Cada pedido invalida o anterior e cancela seu carregamento.
   Nenhum áudio do Sistema Solar é reutilizado como narração do DNA. */
(function(){'use strict';
class Narrator {
 constructor(notify){this.notify=notify;this.player=new Audio();this.player.preload='auto';this.player.playsInline=true;this.music=new Audio('audio/fundo.mp3');this.music.loop=true;this.music.volume=.2;this.voiceVolume=1;this.musicVolume=.2;this.musicOn=false;this.synthetic=true;this.token=0;this.abort=null;this.url=null;this.busy=false;this.last={text:'',key:null};this.cache=new Map();}
 status(state,text,key){this.busy=['loading','playing','speech'].includes(state);this.duck();this.notify({state,text,key});}
 duck(){this.music.volume=this.musicOn?this.musicVolume*(this.busy?.12:1):0;}
 stop(notify=true){++this.token;if(this.abort)this.abort.abort();this.abort=null;this.player.onended=null;this.player.onerror=null;this.player.pause();try{this.player.currentTime=0;}catch(_){}this.player.removeAttribute('src');this.player.load();if(this.url){URL.revokeObjectURL(this.url);this.url=null;}if(window.speechSynthesis)window.speechSynthesis.cancel();this.busy=false;this.duck();if(notify)this.notify({state:'stopped',text:this.last.text,key:this.last.key});}
 async say(text,key){this.stop(false);const token=this.token;this.last={text,key};this.status('loading',text,key);if(!this.voiceVolume){this.status('text',text,key);return;}
  if(!key){this.fallback(text,token);return;}
  const request=new AbortController();this.abort=request;let timer;
  try {let blob=this.cache.get(key);if(!blob){timer=setTimeout(()=>request.abort(),4000);const r=await fetch('audio/'+encodeURIComponent(key)+'.mp3',{signal:request.signal});if(!r.ok)throw new Error('MP3 indisponível');blob=await r.blob();clearTimeout(timer);if(token!==this.token)return;this.cache.set(key,blob);}
   if(token!==this.token)return;this.url=URL.createObjectURL(blob);this.player.src=this.url;this.player.volume=this.voiceVolume;
   this.player.onended=()=>{if(token===this.token)this.status('ended',text,key);};
   this.player.onerror=()=>{if(token===this.token){this.cache.delete(key);this.fallback(text,token);}};
   await this.player.play();if(token===this.token)this.status('playing',text,key);
  }catch(e){clearTimeout(timer);if(token!==this.token)return;this.fallback(text,token);}
 }
 fallback(text,token){if(token!==this.token)return;this.player.pause();this.player.onended=this.player.onerror=null;if(!this.synthetic||!window.speechSynthesis){this.status('text',text,this.last.key);return;}
  window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';u.rate=.94;u.volume=this.voiceVolume;const voices=window.speechSynthesis.getVoices(),pt=voices.find(v=>/^pt[-_]BR$/i.test(v.lang));if(pt)u.voice=pt;
  u.onstart=()=>{if(token===this.token)this.status('speech',text,this.last.key);};
  u.onend=u.onerror=()=>{if(token===this.token)this.status('ended',text,this.last.key);};
  this.status('speech',text,this.last.key);window.speechSynthesis.speak(u);
 }
 repeat(){return this.say(this.last.text,this.last.key);}
 setVoice(v){this.voiceVolume=Math.max(0,Math.min(1,v));this.player.volume=this.voiceVolume;if(!v)this.stop();}
 async setMusic(on,volume){this.musicOn=on;if(volume!==undefined)this.musicVolume=volume;this.duck();if(!on){this.music.pause();return;}try{await this.music.play();}catch(_){this.musicOn=false;this.music.pause();}}
 dispose(){this.stop();this.music.pause();this.cache.clear();}
}
window.DNANarrator=Narrator;window.CorpoNarrator=Narrator;
})();
