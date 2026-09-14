const $ = (s) => document.querySelector(s);

const state = {
  chats: JSON.parse(localStorage.getItem("ai_chats") || "[]"),
  currentId: localStorage.getItem("ai_current") || null,
  settings: JSON.parse(localStorage.getItem("ai_settings") || "{}"),
  streaming: false
};

function save() {
  localStorage.setItem("ai_chats", JSON.stringify(state.chats));
  localStorage.setItem("ai_current", state.currentId || "");
  localStorage.setItem("ai_settings", JSON.stringify(state.settings));
}

function currentChat() {
  return state.chats.find(c => c.id === state.currentId);
}

function makeChat() {
  const chat = { id: crypto.randomUUID(), title:"新對話", messages:[] };
  state.chats.unshift(chat);
  state.currentId = chat.id;
  save(); render();
}

function ensureChat() {
  if (!currentChat()) makeChat();
}

function render() {
  const chat = currentChat();
  $("#chatTitle").textContent = chat?.title || "新對話";
  $("#modelLabel").textContent = state.settings.model || "尚未設定模型";

  const list = $("#chatList");
  list.innerHTML = "";
  state.chats.forEach(c => {
    const b = document.createElement("button");
    b.className = "chat-item" + (c.id === state.currentId ? " active":"");
    b.textContent = c.title || "新對話";
    b.onclick = () => { state.currentId=c.id; save(); render(); closeSidebar(); };
    list.appendChild(b);
  });

  const box = $("#messages");
  box.innerHTML = "";
  if (!chat || chat.messages.length === 0) {
    box.innerHTML = `<div class="empty"><div><h1>開始聊天</h1><p>先到設定填入 API Base URL、Key 和模型。</p></div></div>`;
    return;
  }
  chat.messages.forEach(m => addBubble(m.role, m.content));
  requestAnimationFrame(() => box.scrollTop = box.scrollHeight);
}

function addBubble(role, content) {
  const row = document.createElement("div");
  row.className = "message-row " + role;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;
  row.appendChild(bubble);
  $("#messages").appendChild(row);
  return bubble;
}

function showError(msg) {
  const e=$("#errorBar"); e.textContent=msg; e.classList.remove("hidden");
  clearTimeout(showError.t); showError.t=setTimeout(()=>e.classList.add("hidden"),7000);
}

function openSidebar(){ $("#sidebar").classList.add("open"); $("#overlay").classList.remove("hidden"); }
function closeSidebar(){ $("#sidebar").classList.remove("open"); $("#overlay").classList.add("hidden"); }

function openSettings() {
  $("#apiBase").value = state.settings.apiBase || "";
  $("#apiKey").value = state.settings.apiKey || "";
  $("#model").value = state.settings.model || "";
  $("#systemPrompt").value = state.settings.systemPrompt || "你是一個有幫助的助手。";
  $("#temperature").value = state.settings.temperature ?? 0.7;
  $("#settings").showModal();
}

function normalizeBase(url) {
  return url.trim().replace(/\/+$/,"").replace(/\/chat\/completions$/,"");
}

async function sendMessage() {
  if (state.streaming) return;
  const input=$("#input"), text=input.value.trim();
  if (!text) return;
  if (!state.settings.apiBase || !state.settings.apiKey || !state.settings.model) {
    openSettings(); showError("請先完成 API 設定。"); return;
  }
  ensureChat();
  const chat=currentChat();
  chat.messages.push({role:"user",content:text});
  if (chat.messages.filter(m=>m.role==="user").length === 1)
    chat.title = text.slice(0, 24);
  input.value=""; resizeInput(); render();

  const assistantBubble=addBubble("assistant","");
  state.streaming=true; $("#sendBtn").disabled=true;
  try {
    const msgs=[];
    if (state.settings.systemPrompt) msgs.push({role:"system",content:state.settings.systemPrompt});
    msgs.push(...chat.messages);
    const res=await fetch(normalizeBase(state.settings.apiBase)+"/chat/completions",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+state.settings.apiKey},
      body:JSON.stringify({
        model:state.settings.model,
        messages:msgs,
        temperature:Number(state.settings.temperature ?? 0.7),
        stream:true
      })
    });
    if(!res.ok){
      const t=await res.text();
      throw new Error(`HTTP ${res.status}: ${t.slice(0,500)}`);
    }
    if(!res.body) throw new Error("此 API 沒有回傳串流內容。");
    const reader=res.body.getReader(), decoder=new TextDecoder();
    let buffer="", answer="";
    while(true){
      const {value,done}=await reader.read();
      if(done) break;
      buffer += decoder.decode(value,{stream:true});
      const lines=buffer.split("\n"); buffer=lines.pop()||"";
      for(const raw of lines){
        const line=raw.trim();
        if(!line.startsWith("data:")) continue;
        const payload=line.slice(5).trim();
        if(payload==="[DONE]") continue;
        try{
          const obj=JSON.parse(payload);
          const delta=obj.choices?.[0]?.delta?.content;
          if(delta){ answer+=delta; assistantBubble.textContent=answer; $("#messages").scrollTop=$("#messages").scrollHeight; }
        }catch{}
      }
    }
    if(!answer) throw new Error("API 沒有回傳文字內容，請檢查模型或中轉站設定。");
    chat.messages.push({role:"assistant",content:answer});
    save();
  }catch(err){
    assistantBubble.textContent="";
    if(chat.messages.at(-1)?.role==="assistant") chat.messages.pop();
    showError(err.message || String(err));
  }finally{
    state.streaming=false; $("#sendBtn").disabled=false; save();
  }
}

function resizeInput(){ const x=$("#input"); x.style.height="auto"; x.style.height=Math.min(x.scrollHeight,150)+"px"; }

$("#menuBtn").onclick=openSidebar;
$("#closeSidebar").onclick=closeSidebar;
$("#overlay").onclick=closeSidebar;
$("#newChat").onclick=()=>{makeChat();closeSidebar()};
$("#settingsBtn").onclick=openSettings;
$("#settingsTop").onclick=openSettings;
$("#closeSettings").onclick=()=>$("#settings").close();
$("#saveSettings").onclick=()=>{
  state.settings={
    apiBase:$("#apiBase").value.trim(),
    apiKey:$("#apiKey").value.trim(),
    model:$("#model").value.trim(),
    systemPrompt:$("#systemPrompt").value,
    temperature:Number($("#temperature").value)
  };
  save(); $("#settings").close(); render();
};
$("#sendBtn").onclick=sendMessage;
$("#input").addEventListener("input",resizeInput);
$("#input").addEventListener("keydown",e=>{
  if(e.key==="Enter" && !e.shiftKey){e.preventDefault();sendMessage();}
});

if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(console.error);
ensureChat();
render();