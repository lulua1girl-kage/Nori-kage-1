import { $, add, mode, VERSION } from './core.js';
import { S, save } from './state.js';
import { chat, version } from './api.js';
import { initVoice, speak, stopSpeaking } from './voice.js';
import { parseCommand, validate } from './actions.js';
import { createMemory } from './memory.js';
import { classify, askSupervisor } from './supervisor.js';

window.__noriMuted=false;
const memory=createMemory(S);
let voice;

async function runAction(a){
 const check=validate(a,S);
 if(!check.ok)return check.needsConfirmation?'I prepared '+a.type+'. Confirm before I make that consequential change.':check.reason;
 const N=window.NoriNative;
 if(!N)return 'I understood the action, but standalone Jarvis has no native action bridge. I did not falsely report completion.';
 const fn={navigate:'openScreen',set_block:'setAppBlock',clear_block:'clearAppBlock',record_progress:'updateKage',merit_change:'updateKage'}[a.type];
 if(!fn||typeof N[fn]!=='function')return 'That native capability is not installed.';
 try{return await N[fn](a)||'Done.'}catch(e){return 'The action failed: '+(e.message||e)}
}

async function respond(text){
 text=String(text||'').trim();if(!text)return;
 add('user',text);
 S.messages.push({role:'user',content:text});
 memory.explicit(text);
 memory.event('user_turn',{length:text.length});
 S.session.turns=(S.session.turns||0)+1;
 save();
 mode('thinking');

 const action=parseCommand(text);
 if(action){
   const result=await runAction(action);
   memory.event('action_result',{type:action.type,result:String(result).slice(0,500)});
   add('nori',result);S.messages.push({role:'assistant',content:result});save();speak(result,mode);mode('ready');return;
 }

 try{
   const capability=classify(text);
   const r=await askSupervisor({messages:S.messages.slice(-18),context:memory.context(),capability});
   $('route').textContent=(r.provider||'AI').toUpperCase();
   const out=r.text||'I did not receive a usable response.';
   add('nori',out);S.messages.push({role:'assistant',content:out});
   S.messages=S.messages.slice(-60);
   memory.event('assistant_turn',{capability,provider:r.provider||'unknown'});
   save();speak(out,mode);
 }catch(e){
   const out='I am online locally, but the AI provider is unavailable. I will not pretend the request succeeded.';
   add('nori',out);S.messages.push({role:'assistant',content:out});memory.event('provider_error',{message:e.message});save();speak(out,mode);
 }finally{mode('ready')}
}

async function boot(){
 try{const v=await version();$('route').textContent=(v.jarvisVersion||VERSION).toUpperCase()}catch{$('route').textContent='LOCAL'}
 voice=initVoice({
   onText:t=>respond(t),
   onState:mode,
   onError:e=>add('nori','Voice engine: '+(e?.message||e?.error||'recognition error'))
 });
 $('mic').onclick=async()=>{try{if($('state').textContent==='LISTENING')await voice.stop();else await voice.start()}catch(e){add('nori',e.message||'Voice unavailable')}};
 $('orb').onclick=async()=>{try{if($('state').textContent==='LISTENING')await voice.stop();else await voice.start()}catch{}};
 $('send').onclick=()=>{const x=$('input').value;$('input').value='';respond(x)};
 $('input').onkeydown=e=>{if(e.key==='Enter')$('send').click()};
 $('text').onclick=()=>{$('composer').classList.toggle('open');if($('composer').classList.contains('open'))$('input').focus()};
 $('stop').onclick=()=>{stopSpeaking();voice?.stop();mode('ready')};
 $('mute').onclick=()=>{S.muted=!S.muted;window.__noriMuted=S.muted;$('mute').querySelector('small').textContent=S.muted?'MUTED':'MUTE';if(S.muted)stopSpeaking();save()};
 $('new').onclick=()=>{$('chat').innerHTML='';S.messages=[];memory.event('new_conversation');save()};
 $('menu').onclick=()=>$('panel').classList.add('open');
 $('close').onclick=()=>$('panel').classList.remove('open');
 $('clear').onclick=()=>{memory.clear();S.messages=[];save();$('chat').innerHTML=''};
 $('kageFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{S.kage=JSON.parse(await f.text());memory.event('kage_import');save();add('nori','KAGE state imported for analysis.')}catch{add('nori','Invalid KAGE JSON; existing state preserved.')}};
 $('export').onclick=()=>{const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='nori-jarvis-state.json';a.click();URL.revokeObjectURL(a.href)};
 for(const m of S.messages.slice(-10))add(m.role==='user'?'user':'nori',m.content);
 save();
}
boot();
