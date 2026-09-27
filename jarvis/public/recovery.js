export const SAFE_RECOVERY={physicalConsequences:false,academicCorrection:true,proportionate:true,humanOverride:true};
export function planRecovery({decision,academic}){
 const d=decision||{}; if(d.level==='normal')return {status:'none',reason:'No recovery intervention indicated.',steps:[]};
 const steps=[];
 if((academic?.uncompleted?.length||0)>0)steps.push('Choose the most time-sensitive unfinished academic task and complete or reschedule it honestly.');
 if((academic?.weakSubjects?.length||0)>0)steps.push('Do targeted practice on the documented weak subject before adding more work.');
 if((academic?.backlogCount||0)>0)steps.push('Work the backlog in priority order and verify completion.');
 return {status:d.level==='priority'?'structured':'targeted',steps,verification:'Require evidence of completion before closing recovery.',deescalation:'When the documented issue is corrected, restore normal status.',safety:SAFE_RECOVERY};
}
