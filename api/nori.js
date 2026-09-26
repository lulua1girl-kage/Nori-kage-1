/* NORI STABLE API GATEWAY V1 */
const brain=require('./brain.js');
const CONTRACT='nori-api-v1';
module.exports=async function(req,res){res.setHeader('X-Nori-API-Contract',CONTRACT);res.setHeader('X-Nori-Brain-Version',String(brain.NORI_BRAIN_VERSION||'unknown'));if(req.method==='GET')return res.status(200).json({ok:true,apiContract:CONTRACT,brainVersion:brain.NORI_BRAIN_VERSION||'unknown',capabilities:['chat','canonical_state','provider_status','image_generate','research','document_rag','workflow_plan','self_improve_plan','self_improve_apply'],legacyCompatible:true});return brain(req,res);};
module.exports.NORI_API_CONTRACT=CONTRACT;