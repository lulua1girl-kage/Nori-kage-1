import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getProviderConfig,publicVersion} from './version.mjs';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.join(__dirname,'..','public');
const port=Number(process.env.PORT||8787);

const split=v=>String(v||'').split(',').map(s=>s.trim()).filter(Boolean);
const keys={
  openai:split(process.env.OPENAI_API_KEYS),
  gemini:split(process.env.GEMINI_API_KEYS),
  anthropic:split(process.env.ANTHROPIC_API_KEYS)
};
const health=new Map();
const state=id=>health.get(id)||{fails:0,cooldown:0,latency:0};
const bad=id=>{const h=state(id);h.fails=Math.min(h.fails+1,8);h.cooldown=Date.now()+Math.min(4000*2**(h.fails-1),180000);health.set(id,h)};
const good=(id,latency)=>health.set(id,{fails:0,cooldown:0,latency});

async function candidates(capability){
  const cfg=(await getProviderConfig()).providers;
  return Object.entries(cfg).flatMap(([p,c])=>{
    if(c.enabled===false || (capability && !c.capabilities?.includes(capability))) return [];
    return (keys[p]||[]).map((k,i)=>({id:p+':'+i,p,k,c}));
  }).sort((a,b)=>{
    const A=state(a.id),B=state(b.id);
    return Number(A.cooldown>Date.now())-Number(B.cooldown>Date.now())||A.fails-B.fails||(A.latency||999999)-(B.latency||999999);
  });
}

async function body(req){
  let s=''; for await(const c of req)s+=c;
  return s?JSON.parse(s):{};
}

async function call(c,messages){
  const model=c.c.model;
  if(c.p==='openai'){
    const r=await fetch(c.c.endpoint,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+c.k},
      body:JSON.stringify({model,temperature:.35,max_tokens:1200,messages})});
    const j=await r.json(); if(!r.ok) throw Error(j?.error?.message||'OpenAI '+r.status);
    return j.choices?.[0]?.message?.content||'';
  }
  if(c.p==='gemini'){
    const r=await fetch(c.c.endpoint.replace('{model}',encodeURIComponent(model))+'?key='+encodeURIComponent(c.k),{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({contents:[{role:'user',parts:[{text:messages.map(x=>x.role.toUpperCase()+': '+x.content).join('\\n\\n')}]}],generationConfig:{temperature:.35,maxOutputTokens:1200}})});
    const j=await r.json(); if(!r.ok) throw Error(j?.error?.message||'Gemini '+r.status);
    return j.candidates?.[0]?.content?.parts?.map(x=>x.text||'').join('')||'';
  }
  const mm=messages.filter(x=>x.role!=='system');
  const sys=messages.find(x=>x.role==='system')?.content||'';
  const r=await fetch(c.c.endpoint,{method:'POST',headers:{'content-type':'application/json','x-api-key':c.k,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({model,max_tokens:1200,system:sys,messages:mm})});
  const j=await r.json(); if(!r.ok) throw Error(j?.error?.message||'Anthropic '+r.status);
  return j.content?.map(x=>x.text||'').join('')||'';
}

const server=http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://localhost');
  res.setHeader('access-control-allow-origin','*');
  res.setHeader('access-control-allow-headers','content-type');
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}

  if(u.pathname==='/api/health'){
    res.setHeader('content-type','application/json');
    return res.end(JSON.stringify({ok:true,...await publicVersion()}));
  }

  if(u.pathname==='/api/version'){
    res.setHeader('content-type','application/json');
    return res.end(JSON.stringify(await publicVersion()));
  }

  if(u.pathname==='/api/chat'&&req.method==='POST'){
    try{
      const b=await body(req);
      const capability=b.capability||'conversation';
      let last;
      for(const c of await candidates(capability)){
        if(state(c.id).cooldown>Date.now()) continue;
        const t=Date.now();
        try{
          const out=await call(c,b.messages||[]);
          if(out){good(c.id,Date.now()-t);res.setHeader('content-type','application/json');return res.end(JSON.stringify({text:out,provider:c.id,model:c.c.model,jarvisVersion:(await getProviderConfig()).jarvisVersion}))}
          bad(c.id);
        }catch(e){last=e;bad(c.id)}
      }
      res.writeHead(503,{'content-type':'application/json'});
      return res.end(JSON.stringify({error:last?.message||'No provider configured'}));
    }catch(e){
      res.writeHead(400,{'content-type':'application/json'});
      return res.end(JSON.stringify({error:e.message}));
    }
  }

  let f=path.normalize(path.join(root,u.pathname==='/'?'/index.html':u.pathname));
  if(!f.startsWith(root)){res.writeHead(403);return res.end()}
  fs.readFile(f,(e,d)=>{
    if(e){res.writeHead(404);return res.end('Not found')}
    res.setHeader('content-type',{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[path.extname(f)]||'application/octet-stream');
    res.end(d);
  });
});
server.listen(port,'127.0.0.1',()=>console.log('Nori Jarvis http://127.0.0.1:'+port));