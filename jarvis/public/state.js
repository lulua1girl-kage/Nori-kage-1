import {VERSION} from './core.js';
const KEY='nori_jarvis_state';
const blank={version:VERSION,messages:[],memory:[],kage:null,muted:false,permissions:{autoLowRisk:true,autoConsequential:false}};
export const S=(()=>{try{return {...blank,...JSON.parse(localStorage.getItem(KEY)||'null')}}catch{return {...blank}}})();
export const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
export function remember(text){if(/remember|my goal|my exam|my schedule|i prefer|i like|call me/i.test(text)){S.memory.push({text,at:Date.now()});S.memory=S.memory.slice(-100)}}
export function context(){return JSON.stringify({memory:S.memory.slice(-25),kage:S.kage}).slice(0,24000)}
