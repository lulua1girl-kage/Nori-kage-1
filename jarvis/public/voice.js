let recognition=null;
let listening=false;
let restartTimer=null;
let manualStop=false;
export function initVoice({onText,onState,onError}){
 const N=window.NoriNative;
 if(N?.startListening&&N?.stopListening)return{start:async()=>{manualStop=false;onState('listening');try{await N.startListening({continuous:true})}catch(e){onState('ready');onError?.(e);throw e}},stop:async()=>{manualStop=true;clearTimeout(restartTimer);try{await N.stopListening()}catch{}onState('ready')},mode:'native'};
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR)return{start:async()=>{throw Error('Speech recognition is unavailable in this browser')},stop:async()=>{},mode:'unavailable'};
 recognition=new SR();recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;recognition.lang=navigator.language||'en-US';
 const restart=()=>{clearTimeout(restartTimer);if(manualStop)return;restartTimer=setTimeout(()=>{try{recognition.start()}catch{}},250)};
 recognition.onstart=()=>{listening=true;onState('listening')};
 recognition.onresult=e=>{let t='';for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)t+=e.results[i][0].transcript+' ';if(t.trim())onText(t.trim())};
 recognition.onerror=e=>{if(e.error==='aborted')return;onError?.(e);if(['not-allowed','service-not-allowed'].includes(e.error)){listening=false;onState('ready');return}restart()};
 recognition.onend=()=>{listening=false;if(!manualStop)restart();else onState('ready')};
 return{start:async()=>{manualStop=false;if(!listening)try{recognition.start()}catch{}},stop:async()=>{manualStop=true;clearTimeout(restartTimer);try{recognition.stop()}catch{}listening=false;onState('ready')},mode:'browser'};
}
export function speak(text,onState){if(window.__noriMuted)return;const N=window.NoriNative;if(N?.speak){onState('speaking');Promise.resolve(N.speak(text)).catch(()=>{}).finally(()=>onState('ready'));return}if(!speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.98;u.pitch=.96;u.onstart=()=>onState('speaking');u.onend=()=>onState('ready');u.onerror=()=>onState('ready');speechSynthesis.speak(u)}
export function stopSpeaking(){try{window.NoriNative?.stopSpeaking?.()}catch{};try{speechSynthesis?.cancel()}catch{}}
