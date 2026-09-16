/* Iris v4.74 — G Chat API; text streaming + non-stream vision for compatibility. */
/* G Chat API — intentionally kept identical to the known-working direct fetch style. */
(function(){
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

  async function visionChatStream(options,onText){
    const url=requestUrl(options.baseUrl);
    const body={model:options.model,messages:options.messages,temperature:Number(options.temperature ?? .7),stream:false};
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json","Authorization":"Bearer "+options.apiKey},body:JSON.stringify(body),signal:options.signal});
    if(!r.ok){const detail=(await r.text()).slice(0,1200);throw new Error(`Vision HTTP ${r.status} · ${url}\n${detail}`)}
    let o;try{o=await r.json()}catch{throw new Error("视觉接口返回的不是 JSON。请检查 Vision Base URL 是否为 OpenAI-compatible 的 /v1 地址。")}
    let ans=o.choices?.[0]?.message?.content;
    if(Array.isArray(ans))ans=ans.map(x=>typeof x==="string"?x:(x?.text||"")).join("");
    if(typeof ans!=="string"||!ans.trim())throw new Error("视觉模型没有返回文字内容。请确认视觉模型支持图片输入，并检查模型名称。");
    if(onText)onText(ans,ans);
    return {answer:ans,url,usage:o.usage||null,toolCalls:[]};
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

  window.GChatAPI={chat,chatStream,visionChatStream,imageGenerate,normalizeBase,requestUrl};
})();
