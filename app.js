/* Iris v4.40 — AI can write into the shared nest from normal chat; nest typography/layout and anniversary background fixed. */
const $=s=>document.querySelector(s);const escapeHtml=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const themes={cream:{name:"奶油米",bg:"#f6f2ec",card:"#fffdf9",ink:"#282522",muted:"#9a948c",line:"#e8e0d6",soft:"#eee8df",user:"#ded5c8",accent:"#2d2925",accent2:"#fff"},blue:{name:"雾蓝",bg:"#eef3f6",card:"#fbfdff",ink:"#263039",muted:"#8c98a1",line:"#dce5ea",soft:"#e5edf1",user:"#d8e5eb",accent:"#355565",accent2:"#fff"},lavender:{name:"雾紫",bg:"#f2eff6",card:"#fcfaff",ink:"#302b36",muted:"#9b93a5",line:"#e3ddea",soft:"#ebe5f0",user:"#e3d9e9",accent:"#554563",accent2:"#fff"},pink:{name:"柔粉",bg:"#f8eff1",card:"#fffafb",ink:"#35292c",muted:"#a18f94",line:"#eadcdf",soft:"#f0e4e7",user:"#ecd8dd",accent:"#65434d",accent2:"#fff"},green:{name:"鼠尾草",bg:"#eff3ee",card:"#fbfdfb",ink:"#29302b",muted:"#909b92",line:"#dce4dd",soft:"#e4ebe5",user:"#d9e4db",accent:"#3e5645",accent2:"#fff"},night:{name:"深夜",bg:"#17191b",card:"#222528",ink:"#f0efeb",muted:"#9ca2a6",line:"#34393d",soft:"#2d3337",user:"#344049",accent:"#f0efeb",accent2:"#17191b"}};
themes.warm={name:"暖白",bg:"#f7f1e8",card:"#fffaf3",ink:"#332b25",muted:"#a09589",line:"#e8ddd0",soft:"#eee3d5",user:"#e6d6c2",accent:"#624c39",accent2:"#fffaf3"};
themes.rain={name:"雨夜",bg:"#1b2025",card:"#242b31",ink:"#edf1f2",muted:"#9ba8b0",line:"#354049",soft:"#2b343b",user:"#354752",accent:"#d9e6eb",accent2:"#1b2025"};
themes.cafe={name:"咖啡馆",bg:"#eee7dd",card:"#fbf7f0",ink:"#3b3028",muted:"#9d8e80",line:"#ddd0c0",soft:"#e7dccd",user:"#dcc7ad",accent:"#684a35",accent2:"#fffaf3"};
themes.mono={name:"黑白",bg:"#f2f2f0",card:"#ffffff",ink:"#202020",muted:"#929292",line:"#dededb",soft:"#e8e8e5",user:"#d9d9d6",accent:"#202020",accent2:"#ffffff"};
const backgrounds={plain:{name:"纯净",value:"none"},paper:{name:"纸张",value:"radial-gradient(circle at 50% -10%,#fffdf9 0,#f6f2ec 45%)"},mist:{name:"柔雾",value:"radial-gradient(circle at 20% 15%,rgba(255,255,255,.85),transparent 35%),radial-gradient(circle at 85% 75%,rgba(220,230,235,.55),transparent 38%)"},lav:{name:"淡紫",value:"radial-gradient(circle at 15% 20%,rgba(225,214,236,.65),transparent 40%),radial-gradient(circle at 80% 75%,rgba(242,231,239,.8),transparent 40%)"},sage:{name:"浅绿",value:"radial-gradient(circle at 20% 20%,rgba(215,230,218,.7),transparent 40%),radial-gradient(circle at 80% 70%,rgba(235,240,226,.8),transparent 42%)"},sun:{name:"晨光",value:"radial-gradient(circle at 70% 15%,rgba(255,231,187,.6),transparent 38%),radial-gradient(circle at 20% 75%,rgba(248,222,210,.55),transparent 40%)"}};
const nestStorageKey="iris_nest";
function loadNest(){try{const v=JSON.parse(localStorage.getItem(nestStorageKey)||"{}");return v&&typeof v==="object"?v:{}}catch{return{}}}
let nestData=loadNest();
let nestClockTimer=null;
function saveNestData(){localStorage.setItem(nestStorageKey,JSON.stringify(nestData))}
function nestDateParts(){const raw=nestData.anniversary;if(!raw)return null;const p=raw.split("-").map(Number);return p.length===3&&p.every(Number.isFinite)?p:null}
function nestDays(){const p=nestDateParts();if(!p)return null;const now=new Date();const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());let next=new Date(today.getFullYear(),p[1]-1,p[2]);if(next<today)next=new Date(today.getFullYear()+1,p[1]-1,p[2]);return Math.round((next-today)/86400000)}
function nestDaysText(){const d=nestDays();if(d===null)return"还没有设置纪念日";return d===0?"就是今天":`还有 ${d} 天`}
function nestTodayText(){const d=new Date();return d.toLocaleDateString("zh-TW",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}
function updateNestClock(){const n=$("#nestNow"),big=$("#nestClockBig");const d=new Date();if(n)n.textContent=nestTodayText();if(big)big.textContent=d.toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",hour12:false});const c=$("#nestCountdown"),cb=$("#nestCountdownBig");if(c)c.textContent=nestDaysText();if(cb){const days=nestDays();cb.textContent=days===null?"—":String(days)}const lab=$("#nestAnniversaryLabel");if(lab)lab.textContent=nestData.anniversaryName||nestData.anniversary||"还没有设置纪念日";const bigLab=$("#nestAnniversaryBigLabel");if(bigLab)bigLab.textContent=nestData.anniversaryName||"我们的纪念日"}
function applyNestBackground(){const app=$("#nestApp");const preview=$("#nestBackgroundPreview");if(!app)return;app.style.setProperty("--nest-bg-image",nestData.background?`url(${nestData.background})`:"none");if(preview)preview.style.backgroundImage=nestData.background?`url(${nestData.background})`:"linear-gradient(135deg,#f5e9dc,#fffaf3)";const page=$("#nestAnniversaryPage");if(page)page.style.setProperty("--anniversary-bg-image",nestData.anniversaryBackground?`url(${nestData.anniversaryBackground})`:"none");const ap=$("#nestAnniversaryPreview");if(ap)ap.style.backgroundImage=nestData.anniversaryBackground?`url(${nestData.anniversaryBackground})`:"linear-gradient(135deg,#f5e9dc,#fffaf3)"}
function renderNestHome(){const mood=$("#nestMoodShow"),toG=$("#nestToGShow"),note=$("#nestNoteShow");if(mood)mood.textContent=nestData.mood||"今天感觉怎么样？";if(toG)toG.textContent=nestData.toG||"写点什么留在这里。";if(note)note.textContent=nestData.note||"今天有什么想留下来？";updateNestClock();applyNestBackground()}
function showNestView(view="home"){document.querySelectorAll("#nest .nestPage").forEach(x=>x.classList.add("hidden"));const id=view==="home"?"nestHome":view==="note"?"nestNotePage":view==="anniversary"?"nestAnniversaryPage":"nestSettingsPage";$("#"+id)?.classList.remove("hidden");document.querySelectorAll("#nest .nestBottomNav button").forEach(b=>b.classList.toggle("active",b.dataset.nestView===view));if(view==="note"){$("#nestNote").value=nestData.note||"";$("#nestNoteDate").textContent=nestTodayText()}if(view==="anniversary"){ensureNestControls();$("#nestAnniversary").value=nestData.anniversary||"";$("#nestAnniversaryName").value=nestData.anniversaryName||"";applyNestBackground();updateNestClock()}if(view==="settings"){ensureNestControls();$("#nestMood").value=nestData.mood||"";$("#nestToG").value=nestData.toG||"";applyNestBackground()}}
function openNest(){nestData=loadNest();ensureNestControls();renderNestHome();showNestView("home");clearInterval(nestClockTimer);nestClockTimer=setInterval(updateNestClock,30000);$("#nest").showModal()}
function closeNest(){clearInterval(nestClockTimer);nestClockTimer=null;const d=$("#nest");if(d?.open)d.close()}
function saveNest(){ensureNestControls();nestData.mood=$("#nestMood").value.trim();nestData.toG=$("#nestToG").value.trim();nestData.note=$("#nestNote").value.trim();nestData.anniversary=$("#nestAnniversary").value||"";nestData.anniversaryName=$("#nestAnniversaryName")?.value.trim()||"";nestData.updatedAt=Date.now();saveNestData();renderNestHome()}

function ensureNestControls(){
 const annPage=$("#nestAnniversaryPage"),annInput=$("#nestAnniversary");
 if(annPage&&annInput&&!$("#nestAnniversaryName")){
  const field=annInput.closest(".nestField")||annInput.parentElement;
  if(field){
   const nameField=document.createElement("label");nameField.className="nestField nestAnniversaryNameField";nameField.innerHTML='<span>纪念日名称</span><input id="nestAnniversaryName" maxlength="40" placeholder="例如：在一起纪念日">';field.parentElement?.insertBefore(nameField,field);
  }
 }
 if(annPage&&annInput&&!$("#nestAnniversaryBgPick")){
  const box=document.createElement("div");box.className="nestAnniversaryBgBox";box.innerHTML='<div class="nestSettingTitle">纪念日背景</div><div class="nestBackgroundRow"><div id="nestAnniversaryPreview" class="nestBackgroundPreview"></div><div><b>专属背景</b><small>只用于纪念日页面，不影响小窝主背景。</small></div><button id="nestAnniversaryBgPick" type="button">选择</button></div><input id="nestAnniversaryBgFile" type="file" accept="image/*" hidden><button id="nestAnniversaryBgClear" class="nestClearBg" type="button">恢复默认背景</button>';
  annPage.querySelector(".nestSubBody")?.appendChild(box);
  $("#nestAnniversaryBgPick").onclick=()=>$("#nestAnniversaryBgFile").click();
  $("#nestAnniversaryBgFile").onchange=async()=>{const f=$("#nestAnniversaryBgFile").files?.[0];if(!f)return;try{nestData.anniversaryBackground=await imageToData(f,1400,.78);saveNestData();applyNestBackground()}catch{showErr("纪念日背景图片处理失败。")}};
  $("#nestAnniversaryBgClear").onclick=()=>{nestData.anniversaryBackground="";saveNestData();applyNestBackground()};
 }
 const settingsPage=$("#nestSettingsPage"),mood=$("#nestMood");
 if(settingsPage&&mood&&!$("#nestAiMoodWrite")){
  const field=mood.closest(".nestField")||mood.parentElement;
  if(field){
   const b=document.createElement("button");b.id="nestAiMoodWrite";b.type="button";b.className="nestAiMoodBtn";b.textContent="让 G 写今天的心情";b.onclick=writeNestMoodWithAI;field.appendChild(b);
  }
 }
 applyNestBackground();
}
async function writeNestMoodWithAI(){
 if(state.busy||state.memoryUpdating||!state.settings.apiBase||!state.settings.apiKey||!state.settings.model){showErr("请先完成 API 与模型设置。或等当前回复结束后再试。");return}
 const c=chat();
 const recent=compactMessagesForModel(c?.messages||[]).slice(-16).map(m=>(m.role==="user"?"用户":"G")+"："+m.content).join("\n");
 const ui=chatInterfaceContext(c);
 const prompt=`请替用户写一条“今日心情”，放进他的小窝里。它不是总结，而是一段自然、像本人随手写下来的小短句。可以带 1-3 个 emoji，让情绪有一点温度，但不要堆 emoji。结合最近聊天的真实内容和当前界面状态，只使用能确定的信息，不要编造。控制在 30-90 个中文字符。只输出正文。\n\n${ui}\n\n最近聊天：\n${recent}`;
 const btn=$("#nestAiMoodWrite");if(btn){btn.disabled=true;btn.textContent="G 正在写…"}
 try{
  const result=await window.GChatAPI.chat({baseUrl:state.settings.apiBase,apiKey:state.settings.apiKey,model:state.settings.model,messages:[{role:"system",content:"你是一个熟悉用户长期聊天背景的私人 AI。写作自然、简洁、有一点生活气息。"},{role:"user",content:prompt}],temperature:.75});
  const mood=String(result.answer||"").trim().replace(/^```[\s\S]*?```$/g,"").trim();
  if(mood){nestData.mood=mood;saveNestData();$("#nestMood").value=mood;renderNestHome();}
 }catch(e){showErr(e.message||"今日心情生成失败")}
 finally{if(btn){btn.disabled=false;btn.textContent="让 G 写今天的心情"}}
}
function chatInterfaceContext(c){
 const t=themes[state.settings.theme]||themes.cream;
 const bubble=state.settings.bubble||"soft";
 const aiStatus=getStatus("ai"),userStatus=getStatus("user");
 const bg=state.settings.bgCustom?"用户自定义聊天背景":(backgrounds[state.settings.bg||"paper"]?.name||"纯净");
 return `当前聊天界面状态：对话名称「${c?.title||"新对话"}」；AI 名称「${state.settings.gName||"G"}」；用户名称「${state.settings.myName||"你"}」；AI 状态「${aiStatus.label}」；用户状态「${userStatus.label}」；气泡样式「${bubble}」；AI 气泡颜色「${state.settings.bubbleAiColor||t.card}」；用户气泡颜色「${state.settings.bubbleUserColor||t.user}」；聊天背景「${bg}」；当前模型「${state.settings.model||"未设置"}」。这些是当前界面的真实状态，可以据此理解聊天氛围和界面，不要向用户逐项复述，除非他主动问。`;
}
const state={chats:(()=>{try{const v=JSON.parse(localStorage.getItem("gchat_chats")||"[]");return Array.isArray(v)?v:[]}catch{return[]}})(),current:localStorage.getItem("gchat_current")||null,settings:(()=>{try{const v=JSON.parse(localStorage.getItem("gchat_settings")||"{}");return v&&typeof v==="object"?v:{}}catch{return{}}})(),memories:(()=>{try{const v=JSON.parse(localStorage.getItem("gchat_memories")||"[]");return Array.isArray(v)?v:[]}catch{return[]}})(),busy:false,summarizing:false,memoryUpdating:false,selectedBubble:null,recognition:null,statusTarget:"ai",selectedChats:new Set(),chatSelectMode:false,ignoreNextChatClick:false};
const save=()=>{localStorage.setItem("gchat_chats",JSON.stringify(state.chats));localStorage.setItem("gchat_current",state.current||"");localStorage.setItem("gchat_settings",JSON.stringify(state.settings));localStorage.setItem("gchat_memories",JSON.stringify(state.memories||[]))};
const chat=()=>state.chats.find(x=>x.id===state.current);
function ensure(){if(!chat()){const c={id:crypto.randomUUID(),title:"新对话",messages:[],summary:"",summaryUpdatedAt:0,summaryMessageCount:0,createdAt:Date.now()};state.chats.unshift(c);state.current=c.id;save()}}
function hexToRgba(hex,opacity){let h=String(hex||"").trim().replace("#","");if(h.length===3)h=h.split("").map(x=>x+x).join("");const n=parseInt(h,16);if(!Number.isFinite(n))return `rgba(255,255,255,${opacity/100})`;return `rgba(${n>>16&255},${n>>8&255},${n&255},${Math.max(0,Math.min(100,Number(opacity)||0))/100})`}
function applyLook(){const t=themes[state.settings.theme]||themes.cream;const r=document.documentElement;Object.entries(t).forEach(([k,v])=>{if(k!=="name")r.style.setProperty("--"+({bg:"bg",card:"card",ink:"ink",muted:"muted",line:"line",soft:"soft",user:"user",accent:"accent",accent2:"accent2"}[k]||k),v)});r.style.setProperty("--bg-image-opacity",String((state.settings.bgOpacity??18)/100));r.style.setProperty("--bg-image",state.settings.bgCustom?`url(${state.settings.bgCustom})`:(backgrounds[state.settings.bg||"paper"]?.value||backgrounds.paper.value));const aiColor=state.settings.bubbleAiColor||t.card;const userColor=state.settings.bubbleUserColor||t.user;r.style.setProperty("--ai-bubble-bg",hexToRgba(aiColor,state.settings.bubbleAiOpacity??94));r.style.setProperty("--user-bubble-bg",hexToRgba(userColor,state.settings.bubbleUserOpacity??90));r.style.setProperty("--g-name-offset",String(state.settings.gNameOffset??0)+"px");r.style.setProperty("--user-name-offset",String(state.settings.userNameOffset??0)+"px");document.querySelector('meta[name="theme-color"]').setAttribute("content",t.bg);document.body.classList.remove("bubble-soft","bubble-glass","bubble-minimal","bubble-pill");document.body.classList.add("bubble-"+(state.settings.bubble||"soft"));document.body.classList.toggle("no-motion",state.settings.animations===false)}
const statusOptions={
 online:{label:"在线",cls:"online"},
 busy:{label:"忙碌",cls:"busy"},
 away:{label:"离开",cls:"away"},
 invisible:{label:"隐身",cls:"invisible"}
};
function getStatus(type){const key=type==="user"?"userStatus":"gStatus";return statusOptions[state.settings[key]]||statusOptions.online}
function updateHeaderStatus(){const d=$("#headerStatusDot");if(!d)return;const si=getStatus("ai");d.className="onlineDot "+si.cls;d.title="G："+si.label}
function openStatusPicker(type="ai"){state.statusTarget=type;const d=$("#profile");if(!d)return;const isUser=type==="user";const si=getStatus(type);$("#profileAvatar").innerHTML=avatarHTML(type);$("#profileName").textContent=isUser?(state.settings.myName||"你"):(state.settings.gName||"G");$("#profileBio").textContent=isUser?"你的聊天状态":(state.settings.gBio||"你的私人 AI 对话空间");$("#profileModel").textContent=isUser?"你的状态":(state.settings.model||"未设置");$("#profileTheme").textContent=si.label;$("#profileStatusText").textContent=si.label;renderStatusPicker();d.showModal()}
function renderStatusPicker(){const box=$("#statusPicker");if(!box)return;const current=getStatus(state.statusTarget);box.innerHTML="";Object.entries(statusOptions).forEach(([key,info])=>{const b=document.createElement("button");b.type="button";b.className="statusOption"+(current.cls===info.cls?" active":"");b.innerHTML=`<i class="statusDot ${info.cls}"></i><span>${info.label}</span>`;b.onclick=()=>{const field=state.statusTarget==="user"?"userStatus":"gStatus";state.settings[field]=key;save();const si=getStatus(state.statusTarget);$("#profileStatusText").textContent=si.label;$("#profileTheme").textContent=si.label;renderStatusPicker();updateHeaderStatus();render()};box.appendChild(b)})}
function avatarHTML(type){const src=type==="user"?state.settings.userAvatar:state.settings.aiAvatar;return src?`<img src="${src}" alt="">`:(type==="user"?"你":"G")}
function formatTime(ts){if(!ts)return"";const d=new Date(ts);if(Number.isNaN(d.getTime()))return"";const now=new Date();const same=d.toDateString()===now.toDateString();return same?d.toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",hour12:false}):d.toLocaleDateString("zh-TW",{month:"numeric",day:"numeric"})+" "+d.toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",hour12:false})}
function ensureDates(){let changed=false;const now=Date.now();state.chats.forEach((c,ci)=>{if(!c.createdAt){c.createdAt=now-(ci*3600000);changed=true}c.messages?.forEach((m,mi)=>{if(!m.timestamp){m.timestamp=c.createdAt+(mi*60000);changed=true}})});if(changed)save()}
function welcomeText(){const h=new Date().getHours();if(h<6)return"夜深了，慢慢聊。";if(h<11)return"早安，今天也陪你。";if(h<14)return"午间好，坐下来聊会儿。";if(h<18)return"下午好，今天过得怎么样？";if(h<23)return"晚上好，回来啦。";return"晚安，想说什么都可以。"}
