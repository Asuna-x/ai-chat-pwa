/* G Chat API — intentionally kept identical to the known-working direct fetch style. */
(function(){
  function normalizeBase(value){
    return String(value||"").trim().replace(/\/+$/,"").replace(/\/chat\/completions$/i,"");
  }
  function requestUrl(base){ return normalizeBase(base)+"/chat/completions"; }

  async function chatStream(options,onText){
    const url=requestUrl(options.baseUrl);
    const body={model:options.model,messages:options.messages,temperature:Number(options.temperature ?? .7),stream:true};
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+options.apiKey},body:JSON.stringify(body),signal:options.signal});
    if(!r.ok)throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0,600)}`);
    if(!r.body)throw new Error("当前浏览器不支持 API 流式响应。");
    const reader=r.body.getReader(),decoder=new TextDecoder("utf-8");
    let buffer="",answer="";
    const push=part=>{if(typeof part!=="string"||!part)return;answer+=part;if(onText)onText(part,answer)};
    while(true){
      const {value,done}=await reader.read();
      if(done)break;
      buffer+=decoder.decode(value,{stream:true});
      const lines=buffer.split(/\r?\n/);
      buffer=lines.pop()||"";
      for(const line of lines){
        const t=line.trim();
        if(!t||t.startsWith(":")||!t.startsWith("data:"))continue;
        const raw=t.slice(5).trim();
        if(raw==="[DONE]")continue;
        let o;try{o=JSON.parse(raw)}catch{continue}
        const delta=o.choices?.[0]?.delta?.content;
        if(typeof delta==="string")push(delta);
        else if(Array.isArray(delta))push(delta.map(x=>typeof x==="string"?x:(x?.text||"")).join(""));
      }
    }
    buffer+=decoder.decode();
    if(buffer.trim().startsWith("data:")){const raw=buffer.trim().slice(5).trim();if(raw&&raw!=="[DONE]"){try{const o=JSON.parse(raw);const d=o.choices?.[0]?.delta?.content;if(typeof d==="string")push(d)}catch{}}}
    if(!answer.trim())throw new Error("API 没有返回文字内容，请检查模型、API Key 和 Base URL。 ");
    return {answer,url};
  }

  async function chat(options){
    const url=requestUrl(options.baseUrl);
    const body={
      model:options.model,
      messages:options.messages,
      temperature:Number(options.temperature ?? .7),
      stream:false
    };
    const r=await fetch(url,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer "+options.apiKey
      },
      body:JSON.stringify(body),
      signal:options.signal
    });
    if(!r.ok)throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0,600)}`);
    const o=await r.json();
    let ans=o.choices?.[0]?.message?.content;
    if(Array.isArray(ans))ans=ans.map(x=>typeof x==="string"?x:(x?.text||"")).join("");
    if(typeof ans!=="string"||!ans.trim())throw new Error("API 没有返回文字内容，请检查模型、API Key 和 Base URL。");
    return {answer:ans,data:o,url};
  }

  window.GChatAPI={chat,chatStream,normalizeBase,requestUrl};
})();
