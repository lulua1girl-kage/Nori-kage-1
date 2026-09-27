let recognition=null;
let listening=false;
let speakCancel=()=>{};
export function initVoice({onText,onState}){
  const Native=window.NoriNative;
  if(Native?.startListening){
    return {start:async()=>{onState('listening');try{await Native.startListening()}catch(e){onState('ready');throw e}},stop:async()=>{try{await Native.stopListening()}catch{}onState('ready')}};
  }
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return {start:async()=>{throw Error('Speech recognition is unavailable on this browser')},stop:async()=>{}};
  recognition=new SR();recognition.continuous=true;recognition.interimResults=true;recognition.lang=navigator.language||'en-US';
  recognition.onstart=()=>{listening=true;onState('listening')};
  recognition.onresult=e=>{let finalText='';for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)finalText+=e.results[i][0].transcript+' ';if(finalText.trim())onText(finalText.trim())};
  recognition.onerror=e=>{listening=false;onState('ready');onText('__VOICE_ERROR__ '+e.error)};
  recognition.onend=()=>{listening=false;if(document.getElementById('state')?.textContent==='LISTENING')onState('ready')};
  return {start:async()=>{if(!listening)recognition.start()},stop:async()=>{try{recognition.stop()}catch{}}};
}
export function speak(text,onState){if(window.__noriMuted)return;const N=window.NoriNative;if(N?.speak){Promise.resolve(N.speak(text)).catch(()=>{});return}if(!speechSynthesis) return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.98;u.pitch=.96;u.onstart=()=>onState('speaking');u.onend=()=>onState('ready');speakCancel=()=>speechSynthesis.cancel();speechSynthesis.speak(u)}
export function stopSpeaking(){try{window.NoriNative?.stopSpeaking?.()}catch{};try{speechSynthesis?.cancel()}catch{};speakCancel()}
