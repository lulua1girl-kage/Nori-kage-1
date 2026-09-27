import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(here,'..','config','provider-config.json');
const local = () => JSON.parse(fs.readFileSync(configPath,'utf8'));

let cached = null;
let cachedAt = 0;

export function getProviderConfig(){
  const now = Date.now();
  const base = local();
  const refresh = Number(base.refreshSeconds||300)*1000;
  if(!cached || now-cachedAt>refresh){
    cached = base;
    cachedAt = now;
  }
  return cached;
}

export function publicVersion(){
  const c=getProviderConfig();
  return {
    jarvisVersion:c.jarvisVersion,
    configVersion:c.configVersion,
    providerModels:Object.fromEntries(Object.entries(c.providers).map(([k,v])=>[k,{enabled:v.enabled,model:v.model,capabilities:v.capabilities}]))
  };
}