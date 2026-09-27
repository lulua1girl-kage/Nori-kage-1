const list=v=>Array.isArray(v)?v:[];
const score=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const subjectName=x=>String(x?.name||x?.subject||x?.title||'').trim();
export function analyzeAcademics(kage={}){
 const subjects=list(kage.subjects||kage.academics?.subjects); const assignments=list(kage.assignments); const exams=list(kage.assessments||kage.exams); const backlog=list(kage.backlog||kage.backlogs);
 const weak=[], pending=[];
 for(const s of subjects){const n=subjectName(s);const vals=[s.score,s.grade,s.percentage,s.average].map(score).filter(x=>x!==null&&x>=0&&x<=100);if(n&&vals.length&&Math.min(...vals)<80)weak.push({subject:n,lowest:Math.min(...vals),reason:'documented score below 80'});}
 for(const a of [...assignments,...exams]){const done=a.completed===true||a.done===true||String(a.status||'').toLowerCase()==='completed';if(!done)pending.push({title:String(a.title||a.name||a.subject||'Untitled'),due:a.due||a.deadline||null,type:assignments.includes(a)?'assignment':'assessment'});}
 return {schemaVersion:1,academicFloor:80,weakSubjects:weak,uncompleted:pending,backlogCount:backlog.length,counts:{subjects:subjects.length,assignments:assignments.length,assessments:exams.length}};
}
export function academicPrompt(a){return `Academic Brain report: ${JSON.stringify(a)}. Identify evidence-based priorities, distinguish knowledge gaps from unfinished work and time/deadline pressure, and never invent grades or completion.`}
