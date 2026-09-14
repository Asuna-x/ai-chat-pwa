const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="gchat_settings", CHATS="gchat_chats", CUR="gchat_current";
const defaults={
  myName:"我", myAvatar:"", gName:"G", gBio:"随时都可以来聊聊。", gAvatar:"",
  baseUrl:"https://api.deepseek.com", apiKey:"", model:"deepseek-chat",
  systemPrompt:"你是 G。请自然、温柔、直接地和用户聊天。", temperature:.7,
  theme:"cream", background:"plain", chatBg:"", bgOpacity:18, bubble:"soft", animations:true
};
const themes={
 cream:["#f7f2ea","#fffdf9","#b48762","#eadbcb","#e9d8c8"],
 blue:["#eef4f7","#fbfeff","#66889b","#d9e8ee","#d9e8ee"],
 lavender:["#f2eef7","#fffDff","#8c76a8","#e4d9ef","#e4d9ef"],
 pink:["#f8eef0","#fffdfd","#b56f82","#eed8de","#efd9df"],
 sage:["#eff3ed","#fcfffb","#71886d","#dce7d8","#dce7d8"],
 midnight:["#17181d","#202127","#a58bb8","#30313a","#2d2a35"]
};
const bgs={plain:"none",paper:"linear-gradient(135deg,#f7f0e5,#fffaf3)",mist:"radial-gradient(circle at 20% 20%,#ffffff,#e9eef4 60%,#e5dce8)",lilac:"linear-gradient(135deg,#f3edf8,#eee9f5)",sage:"linear-gradient(135deg,#eef4eb,#f8fbf5)",morning:"linear-gradient(135deg,#fff1df,#f5e6ee)"};
let settings={...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")};
let chats=JSON.parse(localStorage.getItem(CHATS)||"[]");
if(!chats.length) chats=[{id:crypto.randomUUID(),title:"新的聊天",messages:[]}];
let current=localStorage.getItem(CUR)||chats[0].id;
if(!chats.some(c=>c.id===current))current=chats[0].id;

function save(){localStorage.setItem(KEY,JSON.stringify(settings));localStorage.setItem(CHATS,JSON.stringify(chats));localStorage.setItem(CUR,current)}
function cur(){return chats.find(c=>c.id===current)}
function initials(name){return (name||"G").trim().slice(0,1).toUpperCase()}
function avatarData(src,name){return src||`data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" rx="28" fill="${themes[settings.theme][3]}"/><text x="50%" y="56%" text-anchor="middle" font-size="55" fill="${themes[settings.theme][2]}" font-family="Arial">${initials(name)}</text></svg>`)}`
}
function applyTheme(){
 const t=themes[settings.theme]||themes.cream; let r=document.documentElement;
 r.style.setProperty("--bg",t[0]);r.style.setProperty("--panel",t[1]);r.style.setProperty("--accent",t[2]);r.style.setProperty("--accent2",t[3]);r.style.setProperty("--mine",t[4]);r.style.setProperty("--chat-bg",settings.chatBg?`url("${settings.chatBg}")`:bgs[settings.background]||"none");r.style.setProperty("--bg-opacity",settings.bgOpacity/100);
 document.body.classList.toggle("noanim",!settings.animations);
 document.body.classList.remove("glass","minimal","pill");document.body.classList.add(settings.bubble);
 $("#headAvatar").src=avatarData(settings.gAvatar,settings.gName);$("#heroAvatar").src=avatarData(settings.gAvatar,settings.gName);$("#typingAvatar").style.backgroundImage=`url("${avatarData(settings.gAvatar,settings.gName)}")`;$("#typingAvatar").style.backgroundSize="cover";$("#typingAvatar").style.width="24px";$("#typingAvatar").style.height="24px";$("#typingAvatar").style.borderRadius="8px";
 $("#headName").textContent=settings.gName;$("#heroName").textContent=settings.gName;$("#heroBio").textContent=settings.gBio;
 document.querySelector('meta[name="theme-color"]').setAttribute("content",t[0]);
}
function render(){
 applyTheme(); const box=$("#chat"); box.innerHTML="";
 const c=cur();
 if(!c.messages.length){
   const empty=document.createElement("div");
   empty.className="empty";
   empty.innerHTML=`<div class="hero-avatar"><img id="heroAvatar" alt=""></div><h1 id="heroName"></h1><p id="heroBio"></p>`;
   empty.querySelector("#heroAvatar").src=avatarData(settings.gAvatar,settings.gName);
   empty.querySelector("#heroName").textContent=settings.gName;
   empty.querySelector("#heroBio").textContent=settings.gBio;
   box.appendChild(empty);
   renderChats();
   return;
 }
 c.messages.forEach((m,i)=>{
   const row=document.createElement("div");row.className="msg "+(m.role==="user"?"mine":"theirs");
   const im=document.createElement("img");im.className="avatar";im.src=avatarData(m.role==="user"?settings.myAvatar:settings.gAvatar,m.role==="user"?settings.myName:settings.gName);
   const b=document.createElement("div");b.className="bubble";b.textContent=m.content;b.title="长按可复制";
   b.addEventListener("contextmenu",e=>{e.preventDefault();navigator.clipboard?.writeText(m.content)});
   row.append(im,b);box.appendChild(row);
 });
 box.scrollTop=box.scrollHeight;
 renderChats();
}
function renderChats(){
 const list=$("#chatList");list.innerHTML="";
 chats.forEach(c=>{
   const d=document.createElement("div");d.className="chat-item "+(c.id===current?"active":"");
   const left=document.createElement("div");left.style.flex="1";left.innerHTML=`<b>${escapeHtml(c.title)}</b><small>${c.messages.length?escapeHtml(c.messages.at(-1).content.slice(0,28)):"还没有消息"}</small>`;
   const more=document.createElement("button");more.textContent="⋯";more.onclick=e=>{e.stopPropagation();const n=prompt("聊天名称",c.title);if(n){c.title=n;save();renderChats()}};
   d.onclick=()=>{current=c.id;save();closeDrawer();render()};d.append(left,more);list.appendChild(d)
 })
}
function escapeHtml(s){return s.replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))}
function openDrawer(){renderChats();$("#drawer").classList.add("open");$("#backdrop").classList.remove("hidden")}
function closeDrawer(){$("#drawer").classList.remove("open");$("#backdrop").classList.add("hidden")}
function fillSettings(){
 $("#myName").value=settings.myName;$("#gName").value=settings.gName;$("#gBio").value=settings.gBio;$("#baseUrl").value=settings.baseUrl;$("#apiKey").value=settings.apiKey;$("#model").value=settings.model;$("#systemPrompt").value=settings.systemPrompt;$("#temperature").value=settings.temperature;$("#tempOut").value=settings.temperature;$("#chatTitle").value=cur().title;$("#bgOpacity").value=settings.bgOpacity;$("#opacityOut").value=settings.bgOpacity+"%";$("#myAvatarPreview").src=avatarData(settings.myAvatar,settings.myName);
 $$("#bubbleStyle button").forEach(x=>x.classList.toggle("active",x.dataset.v===settings.bubble));
 $("#animations").checked=settings.animations;
 $("#themes").innerHTML=Object.entries(themes).map(([k,v])=>`<button class="theme ${k===settings.theme?"selected":""}" data-theme="${k}"><div class="swatch" style="background:${v[0]};border:5px solid ${v[3]}"></div>${({cream:"奶油",blue:"雾蓝",lavender:"薰衣草",pink:"柔粉",sage:"鼠尾草",midnight:"午夜"})[k]}</button>`).join("");
 $("#backgrounds").innerHTML=Object.entries(bgs).map(([k,v])=>`<button class="bgchoice ${k===settings.background&&!settings.chatBg?"selected":""}" data-bg="${k}"><div class="swatch" style="background:${v==="none"?"var(--bg)":v}"></div>${({plain:"纯净",paper:"纸张",mist:"柔雾",lilac:"淡紫",sage:"浅绿",morning:"晨光"})[k]}</button>`).join("");
 $$(".theme").forEach(x=>x.onclick=()=>{settings.theme=x.dataset.theme;save();fillSettings();applyTheme();render()});
 $$(".bgchoice").forEach(x=>x.onclick=()=>{settings.background=x.dataset.bg;settings.chatBg="";save();fillSettings();applyTheme()});
}
function openSettings(){fillSettings();$("#settingsModal").classList.remove("hidden")}
function closeSettings(){$("#settingsModal").classList.add("hidden")}
async function fileToData(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
async function send(){
 const inp=$("#input"), text=inp.value.trim();if(!text)return;
 const c=cur();c.messages.push({role:"user",content:text});inp.value="";resize();save();render();
 if(!settings.apiKey||!settings.baseUrl||!settings.model){alert("请先在 设置 → AI 中填写 API Base URL、API Key 和模型。");return}
 $("#typing").classList.remove("hidden");
 try{
  const headers={"Content-Type":"application/json","Authorization":"Bearer "+settings.apiKey};
  const body={model:settings.model,messages:[{role:"system",content:settings.systemPrompt},...c.messages],temperature:Number(settings.temperature),stream:false};
  const url=settings.baseUrl.replace(/\/+$/,"")+"/chat/completions";
  const res=await fetch(url,{method:"POST",headers,body:JSON.stringify(body)});
  const data=await res.json();if(!res.ok)throw new Error(data?.error?.message||"API 请求失败");
  c.messages.push({role:"assistant",content:data.choices?.[0]?.message?.content||"没有收到有效回复。"});save();render();
 }catch(e){c.messages.push({role:"assistant",content:"连接失败：\n"+e.message});save();render()}
 finally{$("#typing").classList.add("hidden")}
}
function resize(){const x=$("#input");x.style.height="auto";x.style.height=Math.min(x.scrollHeight,120)+"px"}
$("#sendBtn").onclick=send;$("#input").addEventListener("input",resize);$("#input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
$("#menuBtn").onclick=openDrawer;$("#closeDrawer").onclick=closeDrawer;$("#backdrop").onclick=closeDrawer;
$("#newChat").onclick=()=>{const c={id:crypto.randomUUID(),title:"新的聊天",messages:[]};chats.unshift(c);current=c.id;save();closeDrawer();render()};
$("#settingsBtn").onclick=openSettings;$("#closeSettings").onclick=closeSettings;$("#saveSettings").onclick=()=>{settings.myName=$("#myName").value.trim()||"我";settings.gName=$("#gName").value.trim()||"G";settings.gBio=$("#gBio").value.trim()||"随时都可以来聊聊。";settings.baseUrl=$("#baseUrl").value.trim();settings.apiKey=$("#apiKey").value.trim();settings.model=$("#model").value.trim();settings.systemPrompt=$("#systemPrompt").value;settings.temperature=Number($("#temperature").value);settings.bgOpacity=Number($("#bgOpacity").value);settings.animations=$("#animations").checked;save();closeSettings();render()};
$("#temperature").oninput=e=>$("#tempOut").value=e.target.value;$("#bgOpacity").oninput=e=>$("#opacityOut").value=e.target.value+"%";
$$(".tab").forEach(t=>t.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));$$(".panel").forEach(x=>x.classList.remove("active"));t.classList.add("active");$(`.panel[data-panel="${t.dataset.tab}"]`).classList.add("active")});
$("#bubbleStyle").onclick=e=>{if(e.target.dataset.v){settings.bubble=e.target.dataset.v;fillSettings();applyTheme()}};
$("#myAvatar").onchange=async e=>{if(e.target.files[0]){settings.myAvatar=await fileToData(e.target.files[0]);$("#myAvatarPreview").src=settings.myAvatar;save()}};
$("#gAvatar").onchange=async e=>{if(e.target.files[0]){settings.gAvatar=await fileToData(e.target.files[0]);save();fillSettings();applyTheme();render()}};
$("#chatBg").onchange=async e=>{if(e.target.files[0]){settings.chatBg=await fileToData(e.target.files[0]);save();fillSettings();applyTheme()}};
$("#renameBtn").onclick=()=>{cur().title=$("#chatTitle").value.trim()||"新的聊天";save();renderChats();alert("已保存")};
$("#exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(cur(),null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(cur().title||"chat")+".json";a.click();URL.revokeObjectURL(a.href)};
$("#clearBtn").onclick=()=>{if(confirm("确定清空当前聊天吗？")){cur().messages=[];save();closeSettings();render()}};
$("#deleteBtn").onclick=()=>{if(chats.length<2){alert("至少保留一个聊天。");return}if(confirm("确定删除当前聊天吗？")){chats=chats.filter(c=>c.id!==current);current=chats[0].id;save();closeSettings();render()}};
$("#profileBtn").onclick=()=>{$("#profileAvatar").src=avatarData(settings.gAvatar,settings.gName);$("#profileName").textContent=settings.gName;$("#profileBio").textContent=settings.gBio;$("#profileModel").textContent=settings.model||"未设置";$("#profileTheme").textContent=({cream:"奶油",blue:"雾蓝",lavender:"薰衣草",pink:"柔粉",sage:"鼠尾草",midnight:"午夜"})[settings.theme];$("#profileModal").classList.remove("hidden")};
$("#closeProfile").onclick=()=>$("#profileModal").classList.add("hidden");$("#profileChat").onclick=()=>$("#profileModal").classList.add("hidden");
$("#voiceBtn").onclick=()=>{
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert("当前浏览器不支持语音输入，请用最新版 Safari。");return}
 const r=new SR();r.lang="zh-CN";r.interimResults=false;r.onresult=e=>{$("#input").value+=(($("#input").value?" ":"")+e.results[0][0].transcript);resize()};r.onerror=()=>{};r.start()
};
save();render();
