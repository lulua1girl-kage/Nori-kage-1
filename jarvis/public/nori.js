import { $, add, mode, VERSION } from './core.js';
import { S, save, remember, context } from './state.js';
import { chat, version } from './api.js';
import { initVoice, speak, stopSpeaking } from './voice.js';
import { parseCommand, validate } from './actions.js';

window.__noriMuted=false;
let voice;

function systemPrompt(){
 return 'You are Nori, a Jarvis-style supervisor for one owner. Be precise, adaptive, calm and operational. Coordinate conversation, memory, KAGE understanding, academic analysis, pattern detection, decision, recovery, achievement and actions. Never invent scores, merit, completions or actions. Current imported KAGE state is authoritative. Human Override is absolute. Current KAGE rules outrank historical rules. Historical rules are structural reference only. Never use physical punishment or unsafe consequences. Prefer correction, targeted practice, recovery blocks, restrictions, verification and proportional escalation/de-escalation. Return normal conversational text unless an action is explicitly requested. Jarvis version: '+VERSION+'. Context: '+context();
}
async function runAction(a){
 const check=validate(a,S);
 if(!check.ok)return check.needsConfirmation?'I prepared '+a.type+'. Confirm before I make that consequential change.':check.reason;
 const N=window.NoriNative;
 if(!N)return 'I understood the action, but this standalone Jarvis has no native action bridge. The action was not falsely reported as completed.';
 const fn={navigate:'openScreen',set_block:'setAppBlock',clear_block:'clearAppBlock',record_progress:'updateKage',merit_change:'updateKage'}[a.type];
 if(!fn||typeof N[fn]!=='function')return 'The requested native capability is not installed.';
 try{return await N[fn](a)||'Done.'}catch(e){return 'The action failed: '+(e.message||e)}
}
async function respond(text){
 text=text.trim();if(!text)return;
 add('user',text);S.messages.push({role:'user',content:text});remember(text);save();mode('thinking');
 const action=parseCommand(text);
 if(action){
   const result=await runAction(action);add('nori',result);S.messages.push({role:'assistant',content:result});save();speak(result,mode);mode('ready');return;
 }
 try{
   const r=await chat([{role:'system',content:systemPrompt()},...S.messages.slice(-18)],'conversation');
   $('route').textContent=(r.provider||'AI').toUpperCase();
   const textOut=r.text||'I did not receive a usable response.';
   add('nori',textOut);S.messages.push({role:'assistant',content:textOut});S.messages=S.messages.slice(-60);save();speak(textOut,mode);
 }catch(e){
   const fallback='I am online locally, but the AI provider is unavailable right now. I will not pretend the request succeeded.';
   add('nori',fallback);S.messages.push({role:'assistant',content:fallback});save();speak(fallback,mode);
 }finally{mode('ready')}
}
async function boot(){
 try{const v=await version();$('route').textContent=(v.jarvisVersion||VERSION).toUpperCase()}catch{$('route').textContent='LOCAL'}
 voice=initVoice({onText:t=>{if(t.startsWith('__VOICE_ERROR__ ')){add('nori','Voice recognition reported '+t.slice(15)+'. Text remains available.')}else respond(t)},onState:mode});
 $('mic').onclick=async()=>{try{if($('state').textContent==='LISTENING')await voice.stop();else await voice.start()}catch(e){add('nori',e.message||'Voice unavailable')}}
 $('orb').onclick=async()=>{try{if($('state').textContent==='LISTENING')await voice.stop();else await voice.start()}catch{}};
 $('send').onclick=()=>{const x=$('input').value;$('input').value='';respond(x)};
 $('input').onkeydown=e=>{if(e.key==='Enter')$('send').click()};
 $('text').onclick=()=>{$('composer').classList.toggle('open');if($('composer').classList.contains('open'))$('input').focus()};
 $('stop').onclick=()=>{stopSpeaking();voice?.stop();mode('ready')};
 $('mute').onclick=()=>{S.muted=!S.muted;window.__noriMuted=S.muted;$('mute').querySelector('small').textContent=S.muted?'MUTED':'MUTE';if(S.muted)stopSpeaking();save()};
 $('new').onclick=()=>{$('chat').innerHTML='';S.messages=[];save()};
 $('menu').onclick=()=>$('panel').classList.add('open');$('close').onclick=()=>$('panel').classList.remove('open');
 $('clear').onclick=()=>{S.memory=[];S.messages=[];save();$('chat').innerHTML=''};
 $('kageFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{S.kage=JSON.parse(await f.text());save();add('nori','KAGE state imported for analysis.')}catch{add('nori','Invalid KAGE JSON; existing state preserved.')}};
 $('export').onclick=()=>{const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='nori-jarvis-state.json';a.click();URL.revokeObjectURL(a.href)};
 for(const m of S.messages.slice(-10))add(m.role==='user'?'user':'nori',m.content);
 save();
}
boot();