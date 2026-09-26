const crypto = require("crypto");

const bucket = new Map();
function config(){
  return {
    url: String(process.env.SUPABASE_URL || "").replace(/\/$/, ""),
    key: String(process.env.SUPABASE_SERVICE_ROLE_KEY || ""),
    origins: String(process.env.NORI_ALLOWED_ORIGINS || "").split(",").map(s=>s.trim()).filter(Boolean)
  };
}
function origin(req){ return String(req.headers.origin || ""); }
function cors(req,res){
  const c=config(), o=origin(req);
  if (o && c.origins.includes(o)) res.setHeader("Access-Control-Allow-Origin", o);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type, Authorization");
}
async function user(req){
  const c=config(), a=String(req.headers.authorization || "");
  if(!a.startsWith("Bearer ") || !c.url || !c.key) return null;
  try{
    const r=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.key,Authorization:a}});
    if(!r.ok) return null;
    const u=await r.json(); return u && u.id ? u : null;
  }catch(_){ return null; }
}
async function requireUser(req,res){
  const u=await user(req);
  if(!u){ res.status(401).json({error:"Authentication required"}); return null; }
  return u;
}
function memoryHit(k,limit,windowMs){
  const now=Date.now(); const old=bucket.get(k)||[];
  const recent=old.filter(t=>now-t<windowMs);
  if(recent.length>=limit) return false;
  recent.push(now); bucket.set(k,recent); return true;
}
async function persistentHit(k,limit,windowMs){
  const c=config();
  if(!c.url || !c.key) return true;
  try{
    const r=await fetch(c.url+"/rest/v1/rpc/nori_rate_limit_hit",{method:"POST",headers:{apikey:c.key,Authorization:"Bearer "+c.key,"Content-Type":"application/json"},body:JSON.stringify({p_key:k,p_limit:limit,p_window_seconds:Math.ceil(windowMs/1000)})});
    if(!r.ok) return true;
    const allowed=await r.json(); return allowed !== false;
  }catch(_){ return true; }
}
async function rateLimit(req,key="default",limit=60,windowMs=60000){
  const ip=String(req.headers["x-forwarded-for"]||req.socket?.remoteAddress||"unknown").split(",")[0].trim();
  const k=key+":"+ip;
  if(!memoryHit(k,limit,windowMs)) return false;
  return persistentHit(k,limit,windowMs);
}
function bodyLimit(req,maxBytes=1500000){
  const n=Number(req.headers["content-length"]||0); return !n || n<=maxBytes;
}
function parsedBodyLimit(body,maxBytes=1500000){
  try{return JSON.stringify(body==null?null:body).length<=maxBytes;}catch(_){return false;}
}
async function userRateLimit(req,userId,key="default",limit=30,windowMs=60000){
  const id=String(userId||"anonymous");
  return rateLimit({headers:{"x-forwarded-for":"user:"+id}},key+":user",limit,windowMs);
}
function safeError(e){return String(e?.message||e||"error").slice(0,240);}
module.exports={config,cors,user,requireUser,rateLimit,userRateLimit,bodyLimit,parsedBodyLimit,safeError};