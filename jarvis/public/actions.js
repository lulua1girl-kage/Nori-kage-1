const consequential=new Set(['set_block','clear_block','merit_change','record_progress','schedule']);
export function parseCommand(text){
  const p=text.toLowerCase();
  const m=p.match(/^(open|go to|show)\\s+(home|study|assessment|recovery|handbook|settings)/);
  if(m)return{type:'navigate',screen:m[2],risk:'low'};
  if(/unblock|unlock app/.test(p))return{type:'clear_block',risk:'consequential'};
  if(/block|lock app/.test(p))return{type:'set_block',reason:'Nori command',risk:'consequential'};
  if(/merit points|add merit|remove merit/.test(p))return{type:'merit_change',text, risk:'consequential'};
  if(/record|mark.*done|completed/.test(p))return{type:'record_progress',text,risk:'consequential'};
  return null;
}
export function validate(action,state){if(!action)return{ok:false,reason:'No action'};if(consequential.has(action.type)&&!state.permissions.autoConsequential)return{ok:false,needsConfirmation:true,reason:'Confirmation required'};return{ok:true}}
