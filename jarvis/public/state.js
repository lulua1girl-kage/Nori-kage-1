import {VERSION} from './core.js';
const KEY='nori_jarvis_state';
const blank={version:VERSION,messages:[],memory:[],events:[],kage:null,muted:false,permissions:{autoLowRisk:true,autoConsequential:false},session:{startedAt:Date.now(),turns:0}};
export const S=(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');return {...blank,...saved,session:{...blank.session,...(saved?.session||{})},permissions:{...blank.permissions,...(saved?.permissions||{})}}}catch{return structuredClone(blank)}})();
export const save=()=>{S.version=VERSION;localStorage.setItem(KEY,JSON.stringify(S))};
export function context(){return JSON.stringify({memory:S.memory?.slice(0,25)||[],events:S.events?.slice(-20)||[],kage:S.kage}).slice(0,26000)}
