export const VERSION='11.5.0';
export const $=id=>document.getElementById(id);
export const esc=x=>String(x).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c));
export function mode(x){$('state').textContent=x.toUpperCase();$('orb').className=x}
export function add(role,text){const e=document.createElement('div');e.className='msg';e.innerHTML='<b>'+ (role==='user'?'YOU':'NORI')+'</b>'+esc(text);$('chat').append(e);$('chat').scrollTop=$('chat').scrollHeight}
