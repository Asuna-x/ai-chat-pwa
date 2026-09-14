/* G Chat API layer — intentionally isolated from UI code. */
(function(){
  function normalizeBase(value){
    return String(value||"").trim().replace(/\/+$/,"" ).replace(/\/chat\/completions$/i,"");
  }
  function requestUrl(base){ return normalizeBase(base)+"/chat/completions"; }

  async function chat(options){
    const base=normalizeBase(options.baseUrl);
    const url=requestUrl(base);
    const body={
      model: options.model,
      messages: options.messages,
      temperature: Number(options.temperature ?? .7),
      stream:false
    };
    let response;
    try{
      response=await fetch(url,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer "+String(options.apiKey||"")
        },
        body:JSON.stringify(body),
        signal:options.signal
      });
    }catch(error){
      if(error?.name==="AbortError") throw error;
      const e=new Error("无法连接 API："+(error?.message||"网络请求失败"));
      e.code="NETWORK";
      e.url=url;
      throw e;
    }

    if(!response.ok){
      let detail="";
      try{ detail=(await response.text()).slice(0,1000); }catch{}
      const e=new Error(`HTTP ${response.status}${detail?": "+detail:""}`);
      e.code="HTTP";
      e.status=response.status;
      e.url=url;
      throw e;
    }

    let data;
    try{ data=await response.json(); }
    catch{
      const e=new Error("API 返回的内容不是有效 JSON。");
      e.code="BAD_JSON"; e.url=url; throw e;
    }

    let answer=data?.choices?.[0]?.message?.content;
    if(Array.isArray(answer)) answer=answer.map(x=>typeof x==="string"?x:(x?.text||"")).join("");
    if(typeof answer!=="string"||!answer.trim()){
      const e=new Error("API 没有返回文字内容。请检查模型、API Key 和 Base URL。");
      e.code="EMPTY"; e.url=url; e.data=data; throw e;
    }
    return {answer,data,url};
  }

  window.GChatAPI={chat,normalizeBase,requestUrl};
})();
