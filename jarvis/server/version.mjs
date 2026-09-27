import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(here,'..','config','provider-config.json');
const DEFAULT_UPDATE_URL = 'https://raw.githubusercontent.com/lulua1girl-kage/Nori-kage-1/main/nori-update.json';
let cached = null;
let cachedAt = 0;
let remoteAt = 0;

const local = () => JSON.parse(fs.readFileSync(configPath,'utf8'));

async function refreshRemote(base){
  const now=Date.now();
  const interval=Number(base.refreshSeconds||300)*1000;
  if(now-remoteAt<interval) return;
  remoteAt=now;
  const url=process.env.NORI_UPDATE_URL||DEFAULT_UPDATE_URL;
  try{
    const r=await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(5000)});
    if(!r.ok) return;
    const remote=await r.json();
    if(remote?.configVersion && Number(remote.configVersion)>=Number(base.configVersion||0)){
      for(const [name,entry] of Object.entries(remote.providerModels||{})){
        if(base.providers?.[name] && entry?.model) base.providers[name].model=entry.model;
      }
      if(remote.version) base.remoteVersion=remote.version;
      base.remoteConfigVersion=remote.configVersion;
    }
  }catch{
    // Local configuration remains authoritative when the remote manifest is unavailable.
  }
}

export async function getProviderConfig(){
  const now = Date.now();
  const base = local();
  await refreshRemote(base);
  const refresh = Number(base.refreshSeconds||300)*1000;
  if(!cached || now-cachedAt>refresh){
    cached = base;
    cachedAt = now;
  }
  return cached;
}

export async function publicVersion(){
  const c=await getProviderConfig();
  return {
    jarvisVersion:c.jarvisVersion,
    remoteVersion:c.remoteVersion||null,
    configVersion:c.configVersion,
    remoteConfigVersion:c.remoteConfigVersion||null,
    providerModels:Object.fromEntries(Object.entries(c.providers).map(([k,v])=>[k,{enabled:v.enabled,model:v.model,capabilities:v.capabilities}]))
  };
}