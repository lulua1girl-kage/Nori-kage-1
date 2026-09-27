let recognition=null;
let listening=false;
let restartTimer=null;
let manualStop=false;
let lastSpeechAt=0;

function nativeVoice(){
  const N=window.NoriNative;
  return N?.startListening && N?.stopListening ? N : null;
}

export function initVoice({onText,onState,onError}){
  const Native=nativeVoice();
  if(Native){
    return {
      start:async()=>{
        manualStop=false;onState('listening');
        try{
          await Native.startListening({continuous:true,interimResults:true});
        }catch(e){onState('ready');onError?.(e);throw e}
      },
      stop:async()=>{
        manualStop=true;clearTimeout(restartTimer);
        try{await Native.stopListening()}catch{}
        onState('ready');
      },
      mode:'native'
    };
  }

  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return {
    start:async()=>{throw Error('Speech recognition is unavailable in this browser')},
    stop:async()=>{},mode:'unavailable'
  };

  recognition=new SR();
  recognition.continuous=true;
  recognition.interimResults=true;
  recognition.maxAlternatives=1;
  recognition.lang=navigator.language||'en-US';

  const restart=()=>{
    clearTimeout(restartTimer);
    if(manualStop||!listening)return;
    restartTimer=setTimeout(()=>{try{recognition.start()}catch{}},250);
  };

  recognition.onstart=()=>{listening=true;onState('listening')};
  recognition.onspeechstart=()=>{lastSpeechAt=Date.now()};
  recognition.onresult=e=>{
    let finalText='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(e.results[i].isFinal)finalText+=e.results[i][0].transcript+' ';
    }
    if(finalText.trim()){lastSpeechAt=Date.now();onText(finalText.trim())}
  };
  recognition.onerror=e=>{
    if(e.error==='aborted')return;
    onError?.(e);
    if(['not-allowed','service-not-allowed'].includes(e.error)){
      listening=false;onState('ready');return;
    }
    restart();
  };
  recognition.onend=()=>{
    listening=false;
    if(!manualStop)restart();else onState('ready');
  };

  return {
    start:async()=>{
      manualStop=false;
      if(!listening)try{recognition.start()}catch{}
    },
    stop:async()=>{
      manualStop=true;clearTimeout(restartTimer);
      try{recognition.stop()}catch{}
      listening=false;onState('ready');
    },
    mode:'browser'
  };
}

export function speak(text,onState){
  if(window.__noriMuted)return;
  const N=window.NoriNative;
  if(N?.speak){
    onState('speaking');
    Promise.resolve(N.speak(text)).catch(()=>{}).finally(()=>onState('ready'));
    return;
  }
  if(!window.speechSynthesis)return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=.98;u.pitch=.96;
  u.onstart=()=>onState('speaking');
  u.onend=()=>onState('ready');
  u.onerror=()=>onState('ready');
  speechSynthesis.speak(u);
}

export function stopSpeaking(){
  try{window.NoriNative?.stopSpeaking?.()}catch{}
  try{speechSynthesis?.cancel()}catch{}
}
