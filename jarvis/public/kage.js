const arr=v=>Array.isArray(v)?v:[];
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const num=v=>Number.isFinite(Number(v))?Number(v):null;
export function normalizeKage(raw){
 const x=obj(raw); const phases=arr(x.phases||x.phase); const subjects=arr(x.subjects||x.academics?.subjects||x.academic?.subjects);
 return {source:'imported-kage', phases, subjects, assessments:arr(x.assessments), assignments:arr(x.assignments), recovery:obj(x.recovery), merit:obj(x.merit||x.meritLedger), awards:arr(x.awards), handbook:obj(x.handbook||x.rules), backlog:arr(x.backlog||x.backlogs), raw:x};
}
function findValues(root,keys){const out=[]; const walk=v=>{if(v===null||v===undefined)return;if(Array.isArray(v)){v.forEach(walk);return}if(typeof v==='object'){for(const [k,val] of Object.entries(v)){if(keys.has(k.toLowerCase()))out.push(val);walk(val)}}};walk(root);return out.flat(Infinity)}
export function analyzeKage(raw){
 const k=normalizeKage(raw), r=k.raw; const text=JSON.stringify(r).toLowerCase();
 const evidence={phaseCount:k.phases.length,subjectCount:k.subjects.length,assessmentCount:k.assessments.length,assignmentCount:k.assignments.length,backlogCount:k.backlog.length,awardCount:k.awards.length};
 const grades=findValues(r,new Set(['score','grade','percentage','percent','mark','marks'])).map(num).filter(v=>v!==null&&v>=0&&v<=100);
 if(grades.length){evidence.average=Math.round(grades.reduce((a,b)=>a+b,0)/grades.length*10)/10;evidence.minimum=Math.min(...grades);evidence.maximum=Math.max(...grades)}
 const flags=[];
 if(/recovery/.test(text))flags.push('recovery-data-present');
 if(k.backlog.length)flags.push('backlog-present');
 if(evidence.minimum!==undefined&&evidence.minimum<80)flags.push('below-academic-floor');
 if(k.assessments.length||k.assignments.length)flags.push('continuous-assessment-data-present');
 return {schemaVersion:1,evidence,flags,interpretation:{rules:'Current imported KAGE rules/state are treated as authoritative; missing fields are not invented.',academicFloor:80}};
}
export function kageContext(raw){const a=analyzeKage(raw);return JSON.stringify({summary:a,structure:normalizeKage(raw)}).slice(0,18000)}
