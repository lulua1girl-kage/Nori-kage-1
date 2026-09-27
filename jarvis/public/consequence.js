const SAFE_ACADEMIC_ACTIONS = new Set(['targeted_practice','finish_overdue_work','reschedule_task','error_analysis','study_block','reflection','verification']);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function generateAcademicConsequence({reason='',severity='moderate',weakSubjects=[],pending=0,backlog=0}={}){
 const s=['low','moderate','high'].includes(severity)?severity:'moderate';
 const subject=weakSubjects?.[0]?.subject||'the documented weak area';
 const actions=[];
 if(pending>0) actions.push({type:'finish_overdue_work',label:'Complete the most time-sensitive unfinished academic task',evidence:'submitted work or teacher-confirmed completion'});
 if(weakSubjects?.length) actions.push({type:'targeted_practice',label:'Do a focused practice set for '+subject,evidence:'completed questions plus error review'});
 if(backlog>0) actions.push({type:'error_analysis',label:'Resolve one backlog item and record why it accumulated',evidence:'updated backlog record'});
 if(!actions.length) actions.push({type:'reflection',label:'Write a short factual review of what happened and define the next academic action',evidence:'saved reflection'});
 const count=s==='high'?Math.min(3,actions.length):s==='low'?1:Math.min(2,actions.length);
 return {schemaVersion:1,kind:'academic-consequence',severity:s,reason:String(reason||'documented commitment issue'),actions:actions.slice(0,count),duration:'proportionate',physical:false,humiliating:false,deprivation:false,verification:'Verify the evidence before marking the consequence resolved.',humanOverride:true};
}
export function validateAcademicConsequence(c){return !!c&&c.physical===false&&c.humiliating===false&&c.deprivation===false&&Array.isArray(c.actions)&&c.actions.every(a=>SAFE_ACADEMIC_ACTIONS.has(a.type));}
