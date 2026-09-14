/* G Chat API layer — network code only. UI never changes this layer. */
(function(){
  function normalizeBase(value){
    return String(value||'').trim().replace(/\/+$/,'').replace(/\/chat\/completions$/i,'');
  }
  function requestUrl(base){ return normalizeBase(base) + '/chat/completions'; }

  async function chat(options){
    const url=requestUrl(options.baseUrl);
    // Only send the two fields accepted by the chat message schema.
    const messages=(options.messages||[]).map(m=>({role:m.role,content:String(m.content??'')}));
    const body={
      model:String(options.model||''),
      messages,
      temperature:Number(options.temperature ?? .7),
      stream:false
    };
    const response=await fetch(url,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+String(options.apiKey||'')
      },
      body:JSON.stringify(body),
      signal:options.signal
    });
    if(!response.ok){
      const detail=(await response.text()).slice(0,1200);
      throw new Error('HTTP '+response.status+(detail?': '+detail:''));
    }
    const data=await response.json();
    let answer=data?.choices?.[0]?.message?.content;
    if(Array.isArray(answer)) answer=answer.map(x=>typeof x==='string'?x:(x?.text||'')).join('');
    if(typeof answer!=='string'||!answer.trim()) throw new Error('API 没有返回文字内容。');
    return {answer,data,url};
  }
  window.GChatAPI={chat,normalizeBase,requestUrl};
})();
