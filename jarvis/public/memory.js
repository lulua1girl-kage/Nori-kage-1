const MAX_FACTS=120,MAX_EVENTS=200;
export function createMemory(S){
 S.memory ||= [];S.events ||= [];
 return{
  rememberFact(text,source='user'){const clean=String(text).trim();if(!clean)return;const key=clean.toLowerCase();const e=S.memory.find(x=>x.key===key);if(e){e.at=Date.now();e.count=(e.count||1)+1;return}S.memory.unshift({key,text:clean,source,at:Date.now(),count:1});S.memory=S.memory.slice(0,MAX_FACTS)},
  event(type,data={}){S.events.push({type,data,at:Date.now()});S.events=S.events.slice(-MAX_EVENTS)},
  explicit(text){for(const p of [/remember(?: that)?\s+(.+)/i,/my goal is\s+(.+)/i,/my schedule is\s+(.+)/i,/i prefer\s+(.+)/i,/i like\s+(.+)/i,/call me\s+(.+)/i]){const m=String(text).trim().match(p);if(m){this.rememberFact(m[1],'explicit');return true}}return false},
  recentFacts(n=20){return S.memory.slice(0,n).map(x=>x.text)},
  recentEvents(n=20){return S.events.slice(-n)},
  context(){return JSON.stringify({facts:this.recentFacts(25),events:this.recentEvents(20),kage:S.kage||null}).slice(0,26000)},
  clear(){S.memory=[];S.events=[]}
 };
}
