const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function detectPatterns(events=[]){const groups={};for(const e of events){const type=e?.type||'unknown';groups[type]=(groups[type]||0)+1}return Object.entries(groups).filter(([,n])=>n>1).map(([type,count])=>({type,count,recurring:true}));}
export function decide({academic={},patterns=[],signal='user-request'}){
 const below=academic.weakSubjects?.length||0, pending=academic.uncompleted?.length||0, backlog=academic.backlogCount||0;
 let level='normal',reason='No documented deterioration signal.';
 if(below||pending||backlog){level='attention';reason='Documented academic work or weakness needs attention.'}
 if(below>=2||pending>=4||backlog>=3)level='priority';
 if(patterns.some(p=>/provider_error|action_failure/.test(p.type)))reason+=' System reliability issue is recurring.';
 return {schemaVersion:1,signal,level,reason,metrics:{weakSubjects:below,pending,backlog},next:'analyze before escalating'};
}
export function validateDecision(d){return !!d&&['normal','attention','priority'].includes(d.level)&&d.next==='analyze before escalating'}
