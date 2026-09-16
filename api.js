/* Iris v4.85 — vision transport with explicit HTTP/status metadata. */
/* G Chat API — intentionally kept identical to the known-working direct fetch style. */
(function(){
  let visionLock=Promise.resolve();
  function normalizeBase(value){
    return String(value||"").trim().replace(/\/+$/,"").replace(/\/chat\/completions$/i,"");
  }
  function requestUrl(base){ return normalizeBase(base)+"/chat/completions"; }

  async function chatStream(options,onText){
    const url=requestUrl(options.baseUrl);
    const body={model:options.model,messages:options.messages,temperature:Number(options.temperature ?? .7),stream:true,stream_options:{include_usage:true}};
    if(Array.isArray(options.tools)&&options.tools.length)body.tools=options.tools;if(options.tool_choice)body.tool_choice=options.tool_choice;
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+options.apiKey},body:JSON.stringify(body),signal:options.signal});
    if(!r.ok)throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0,600)}`);
    if(!r.body)throw new Error("当前浏览器不支持 API 流式响应。");
    const reader=r.body.getReader(),decoder=new TextDecoder("utf-8");
    let buffer="",answer="",usage=null,toolCalls=[];
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
        if(o.usage)usage=o.usage;
        const delta=o.choices?.[0]?.delta?.content;
        const tc=o.choices?.[0]?.delta?.tool_calls;
        if(Array.isArray(tc))for(const item of tc){const idx=Number(item.index||0);if(!toolCalls[idx])toolCalls[idx]={id:item.id||"",type:"function",function:{name:item.function?.name||"",arguments:""}};if(item.id)toolCalls[idx].id=item.id;if(item.function?.name)toolCalls[idx].function.name=item.function.name;if(typeof item.function?.arguments==="string")toolCalls[idx].function.arguments+=item.function.arguments;}
        if(typeof delta==="string")push(delta);
        else if(Array.isArray(delta))push(delta.map(x=>typeof x==="string"?x:(x?.text||"")).join(""));
      }
    }
    buffer+=decoder.decode();
    if(buffer.trim().startsWith("data:")){const raw=buffer.trim().slice(5).trim();if(raw&&raw!=="[DONE]"){try{const o=JSON.parse(raw);if(o.usage)usage=o.usage;const d=o.choices?.[0]?.delta?.content;if(typeof d==="string")push(d);else if(Array.isArray(d))push(d.map(x=>typeof x==="string"?x:(x?.text||"")).join(""));const tc=o.choices?.[0]?.delta?.tool_calls;if(Array.isArray(tc))for(const item of tc){const idx=Number(item.index||0);if(!toolCalls[idx])toolCalls[idx]={id:item.id||"",type:"function",function:{name:item.function?.name||"",arguments:""}};if(item.id)toolCalls[idx].id=item.id;if(item.function?.name)toolCalls[idx].function.name=item.function.name;if(typeof item.function?.arguments==="string")toolCalls[idx].function.arguments+=item.function.arguments;}}catch{}}}
    const calls=toolCalls.filter(Boolean);
    if(!answer.trim()&&!calls.length)throw new Error("API 没有返回文字内容，请检查模型、API Key 和 Base URL。 ");
    return {answer,url,usage,toolCalls:calls};
  }

  async function visionChat(options){
    const previous=visionLock;let release;visionLock=new Promise(resolve=>{release=resolve});await previous;
    try{
      const url=requestUrl(options.baseUrl);
      const messages=JSON.parse(JSON.stringify(options.messages||[]));
      // 智谱官方文档对 Base64 图片示例使用的是 image_url.url=纯 Base64。
      // Iris 内部保存的是 data:image/...;base64,...，这里仅在发往智谱时转换。
      if(new URL(url).hostname.toLowerCase()==='open.bigmodel.cn'){
        for(const m of messages){
          if(!Array.isArray(m?.content))continue;
          for(const part of m.content){
            const u=part?.image_url?.url;
            if(typeof u==='string' && /^data:image\/[^;]+;base64,/i.test(u))part.image_url.url=u.slice(u.indexOf(',')+1);
          }
        }
      }
      const body={model:options.model,messages,temperature:Number(options.temperature ?? .7),stream:false};
      if(options.max_tokens!=null)body.max_tokens=Number(options.max_tokens);
      const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json","Authorization":"Bearer "+options.apiKey},body:JSON.stringify(body),signal:options.signal});
      const raw=await r.text();
      if(!r.ok){
        let parsed=null;try{parsed=JSON.parse(raw)}catch{}
        const err=new Error(`HTTP ${r.status} · ${url}\n${raw.slice(0,1600)}`);
        err.status=r.status;
        err.code=parsed?.error?.code??parsed?.code??null;
        err.response=parsed;
        throw err;
      }
      let o;try{o=JSON.parse(raw)}catch{throw new Error("视觉接口返回的不是 JSON。请检查 Vision Base URL 是否正确。")}
      let ans=o.choices?.[0]?.message?.content;
      if(Array.isArray(ans))ans=ans.map(x=>typeof x==="string"?x:(x?.text||"")).join("");
      if(typeof ans!=="string"||!ans.trim())throw new Error("视觉模型没有返回文字内容。请确认模型支持图片输入。\n"+JSON.stringify(o).slice(0,700));
      return {answer:ans,url,usage:o.usage||null,data:o};
    }finally{release()}
  }

  // Kept as an alias for compatibility with older app code.
  async function visionChatStream(options,onText){
    const r=await visionChat(options);if(onText)onText(r.answer,r.answer);return {...r,toolCalls:[]};
  }

  async function imageGenerate(options){
    const base=normalizeBase(options.baseUrl);
    const url=base+"/images/generations";
    const body={model:options.model,prompt:String(options.prompt||""),size:options.size||"1024x1024",n:1};
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+options.apiKey},body:JSON.stringify(body),signal:options.signal});
    if(!r.ok)throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0,600)}`);
    const o=await r.json();
    const item=o.data?.[0]||{};
    const src=item.url||item.b64_json||item.image_url||"";
    if(!src)throw new Error("图像生成接口没有返回图片。");
    return {url:item.url||"",b64:item.b64_json||"",src,raw:o};
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

  window.GChatAPI={chat,chatStream,visionChat,visionChatStream,imageGenerate,normalizeBase,requestUrl};
})();
