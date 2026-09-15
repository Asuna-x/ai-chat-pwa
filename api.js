/* G Chat API v4.29: unchanged from v4.25 */
/* G Chat API — intentionally kept identical to the known-working direct fetch style. */
(function(){
  function normalizeBase(value){
    return String(value||"").trim().replace(/\/+$/,"").replace(/\/chat\/completions$/i,"");
  }
  function requestUrl(base){ return normalizeBase(base)+"/chat/completions"; }

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

  window.GChatAPI={chat,normalizeBase,requestUrl};
})();
