/* Iris v4.41 — autonomous nest writing + persistent nest navigation. */
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
function closeChatActionMenu(){document.querySelectorAll(".chatActionMenu").forEach(x=>x.remove())}
function closeChatDialog(){document.querySelectorAll(".chatActionDialog").forEach(x=>x.remove())}
function showChatDialog(type,c,onOk){
 closeChatDialog();
 const shade=document.createElement("div");shade.className="chatActionDialog";
 const isRename=type==="rename";
 shade.innerHTML=isRename?`<div class="chatDialogCard"><div class="chatDialogTitle">重命名对话</div><div class="chatDialogSub">给这个对话换一个容易记住的名字</div><input class="chatDialogInput" maxlength="40" value="${escapeHtml(c.title||"新对话")}" autocomplete="off"><div class="chatDialogActions"><button type="button" data-cancel>取消</button><button type="button" class="primary" data-ok>保存</button></div></div>`:`<div class="chatDialogCard"><div class="chatDialogTitle">删除对话</div><div class="chatDialogSub">确定要删除“${escapeHtml(c.title||"新对话")}”吗？删除后无法恢复。</div><div class="chatDialogActions"><button type="button" data-cancel>取消</button><button type="button" class="danger" data-ok>删除</button></div></div>`;
 Object.assign(shade.style,{position:"fixed",inset:"0",zIndex:"10000",display:"flex",alignItems:"center",justifyContent:"center",padding:"22px",background:"color-mix(in srgb,var(--accent) 16%,rgba(20,18,16,.22))",backdropFilter:"blur(7px)",WebkitBackdropFilter:"blur(7px)"});
 const card=shade.querySelector(".chatDialogCard");Object.assign(card.style,{width:"min(100%,340px)",boxSizing:"border-box",padding:"22px",borderRadius:"22px",background:"var(--card)",border:"1px solid color-mix(in srgb,var(--line) 75%,transparent)",boxShadow:"0 20px 60px rgba(0,0,0,.20)"});
 const title=shade.querySelector(".chatDialogTitle");Object.assign(title.style,{fontSize:"19px",fontWeight:"700",color:"var(--text)",letterSpacing:"-.2px"});
 const sub=shade.querySelector(".chatDialogSub");Object.assign(sub.style,{marginTop:"7px",fontSize:"13px",lineHeight:"1.55",color:"var(--muted)"});
 const input=shade.querySelector(".chatDialogInput");if(input)Object.assign(input.style,{width:"100%",boxSizing:"border-box",marginTop:"17px",padding:"12px 14px",borderRadius:"13px",border:"1px solid var(--line)",background:"var(--bg)",color:"var(--text)",fontSize:"16px",outline:"none"});
 const actions=shade.querySelector(".chatDialogActions");Object.assign(actions.style,{display:"flex",gap:"9px",justifyContent:"flex-end",marginTop:"20px"});
 shade.querySelectorAll(".chatDialogActions button").forEach(b=>Object.assign(b.style,{minWidth:"76px",height:"40px",padding:"0 15px",borderRadius:"12px",border:"1px solid var(--line)",background:"var(--bg)",color:"var(--text)",fontSize:"14px",fontWeight:"600"}));
 const ok=shade.querySelector('[data-ok]');if(ok)Object.assign(ok.style,{border:"0",background:"var(--accent)",color:"#fff"});
 const danger=shade.querySelector(".danger");if(danger){danger.style.background="color-mix(in srgb,var(--accent) 78%,#b94f4f)";danger.style.color="var(--accent2)"}
 shade.querySelector("[data-cancel]").onclick=closeChatDialog;
 shade.onclick=e=>{if(e.target===shade)closeChatDialog()};
 if(input){input.onfocus=()=>{input.style.borderColor="var(--accent)"};input.onblur=()=>{input.style.borderColor="var(--line)"};input.onkeydown=e=>{if(e.key==="Enter")ok.click()};}
 ok.onclick=()=>{if(isRename){const n=input.value.trim();if(!n)return;onOk(n.slice(0,40))}else onOk(true);closeChatDialog()};
 document.body.appendChild(shade);
 requestAnimationFrame(()=>{if(input){input.focus();input.select()}});
}
function openChatActionMenu(id,anchor){closeChatActionMenu();const c=state.chats.find(x=>x.id===id);if(!c)return;const menu=document.createElement("div");menu.className="chatActionMenu";menu.innerHTML=`<button type="button" data-action="rename"><span>重命名</span><span class="menuChevron">›</span></button><button type="button" data-action="delete"><span>删除</span><span class="menuChevron">›</span></button>`;Object.assign(menu.style,{position:"fixed",zIndex:"9999",minWidth:"142px",padding:"6px",borderRadius:"16px",background:"color-mix(in srgb,var(--card) 94%,transparent)",border:"1px solid color-mix(in srgb,var(--line) 75%,transparent)",boxShadow:"0 14px 38px rgba(0,0,0,.18)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"});menu.querySelectorAll("button").forEach(b=>Object.assign(b.style,{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",height:"40px",padding:"0 10px",border:"0",borderRadius:"11px",background:"transparent",color:"var(--text)",fontSize:"14px",fontWeight:"550",textAlign:"left",cursor:"pointer"}));menu.querySelectorAll("button").forEach(b=>{b.onmouseenter=()=>b.style.background="var(--bg)";b.onmouseleave=()=>b.style.background="transparent"});menu.querySelector('[data-action="delete"]').style.color="color-mix(in srgb,var(--accent) 72%,#b94f4f)";menu.querySelectorAll(".menuChevron").forEach(x=>Object.assign(x.style,{fontSize:"20px",lineHeight:"1",color:"var(--muted)",fontWeight:"400"}));const rect=anchor.getBoundingClientRect();document.body.appendChild(menu);const mw=menu.offsetWidth,mh=menu.offsetHeight;menu.style.left=Math.max(8,Math.min(innerWidth-mw-8,rect.right-mw))+"px";menu.style.top=Math.max(8,Math.min(innerHeight-mh-8,rect.bottom+6))+"px";menu.querySelector('[data-action="rename"]').onclick=()=>{closeChatActionMenu();showChatDialog("rename",c,n=>{c.title=n;save();render()})};menu.querySelector('[data-action="delete"]').onclick=()=>{closeChatActionMenu();showChatDialog("delete",c,()=>{state.chats=state.chats.filter(x=>x.id!==id);if(state.current===id)state.current=state.chats[0]?.id||null;ensure();save();render()})};const handler=e=>{if(!menu.contains(e.target)){closeChatActionMenu();document.removeEventListener("pointerdown",handler)}};setTimeout(()=>document.addEventListener("pointerdown",handler),0)}
function renderChatList(){const l=$("#chatList");if(!l)return;l.innerHTML="";closeChatActionMenu();const now=new Date();const today=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();const yesterday=today-86400000;const groups={};state.chats.forEach(x=>{const t=x.createdAt||0;const key=t>=today?"今天":t>=yesterday?"昨天":"更早";(groups[key]??=[]).push(x)});["今天","昨天","更早"].forEach(key=>{if(!groups[key]?.length)return;const g=document.createElement("div");g.className="chatGroup";g.innerHTML=`<div class="chatGroupTitle">${key}</div>`;groups[key].forEach(x=>{const row=document.createElement("div");row.className="itemRow";row.style.position="relative";const b=document.createElement("button");b.className="item"+(x.id===state.current?" active":"");b.innerHTML=`<span class="itemTitle">${escapeHtml(x.title||"新对话")}</span><span class="itemTime">${formatTime(x.createdAt)}</span>`;b.onclick=()=>{state.current=x.id;save();render();closeDrawer()};const more=document.createElement("button");more.type="button";more.className="chatMore";more.setAttribute("aria-label","对话操作");more.textContent="⋯";Object.assign(more.style,{position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",width:"34px",height:"34px",border:"0",borderRadius:"10px",background:"transparent",color:"var(--muted)",fontSize:"22px",lineHeight:"1",cursor:"pointer",zIndex:"2"});more.onclick=e=>{e.preventDefault();e.stopPropagation();openChatActionMenu(x.id,more)};row.append(b,more);g.appendChild(row)});l.appendChild(g)});const count=$("#chatCount");if(count)count.textContent=state.chats.length?state.chats.length+" 个":"";updateChatSelectionUI()}
function enterChatSelectMode(id){state.chatSelectMode=true;state.selectedChats=new Set([id]);state.ignoreNextChatClick=true;renderChatList()}
function toggleChatSelection(id){if(state.selectedChats.has(id))state.selectedChats.delete(id);else state.selectedChats.add(id);renderChatList()}
function exitChatSelectMode(){state.chatSelectMode=false;state.selectedChats.clear();state.ignoreNextChatClick=false;renderChatList()}
function renameSelectedChat(){const ids=[...state.selectedChats];if(ids.length!==1){showErr("重命名时请选择一个对话。");return}const c=state.chats.find(x=>x.id===ids[0]);if(!c)return;const n=prompt("新的对话名称",c.title||"新对话");if(n?.trim()){c.title=n.trim().slice(0,40);save()}exitChatSelectMode();render()}
function deleteSelectedChats(){const ids=[...state.selectedChats];if(!ids.length)return;if(!confirm(`确定删除选中的 ${ids.length} 个对话吗？`))return;state.chats=state.chats.filter(x=>!ids.includes(x.id));if(ids.includes(state.current))state.current=state.chats[0]?.id||null;ensure();save();exitChatSelectMode();render()}
function updateChatSelectionUI(){const bar=$("#chatSelectBar"),newBtn=$("#newChat"),count=$("#selectedChatCount");if(!bar)return;bar.classList.add("hidden");if(newBtn)newBtn.classList.remove("hidden");if(count)count.textContent="已选择 0 个";const rn=$("#renameSelected");if(rn)rn.disabled=true;const del=$("#deleteSelected");if(del)del.disabled=true}

function iFill(text){const i=$("#input");i.value=text;resize();i.focus();document.querySelector("footer")?.scrollIntoView({block:"end",behavior:"smooth"})}
function updateTyping(){const status=$("#typingStatus"),model=$("#modelStatus");if(!status||!model)return;status.classList.toggle("hidden",!state.busy);model.classList.toggle("hidden",state.busy)}
function render(){applyLook();const c=chat();$("#title").textContent=c?.title||"新对话";$("#modelName").textContent=state.settings.model||"未設定模型";updateHeaderStatus();$("#headerTime").textContent=c?.messages?.length?" · "+formatTime(c.messages[c.messages.length-1].timestamp):"";updateTyping();const topAvatar=$("#headAvatar"),topMode=state.settings.topAvatar||"user";topAvatar.classList.toggle("is-hidden",topMode==="none");$("#openProfile").classList.toggle("avatar-hidden",topMode==="none");if(topMode!=="none")topAvatar.innerHTML=avatarHTML(topMode);$("#brandAvatar").innerHTML=avatarHTML("ai");renderChatList();const box=$("#messages");box.innerHTML="";if(!c||!c.messages.length){box.innerHTML=`<div class="empty"><div><div class="avatar">${avatarHTML("ai")}</div><span class="welcomeKicker">${welcomeText()}</span><h1>${escapeHtml(state.settings.gName||"G")}</h1><p>${escapeHtml(state.settings.gBio||"你的私人 AI 对话空间")}</p><div class="quickPrompts"><button data-prompt="帮我规划一下今天的安排">规划今天</button><button data-prompt="陪我聊聊，轻松一点">陪我聊聊</button><button data-prompt="帮我整理一下最近的想法">整理思绪</button></div></div></div>`;box.querySelectorAll("[data-prompt]").forEach(b=>b.onclick=()=>{iFill(b.dataset.prompt)});return}c.messages.forEach((m,idx)=>{bubble(m.role,m.content,false,m.timestamp,true)});scroll()}
function bubble(role,text,streaming=false,timestamp=null,read=false){const r=document.createElement("div");r.className="message "+role;if(streaming)r.style.animation="none";const tm=timestamp?document.createElement("span"):null;if(tm){tm.className="msgTime";tm.textContent=formatTime(timestamp)}const type=role==="assistant"?"ai":"user";const name=role==="assistant"?(state.settings.gName||"G"):(state.settings.myName||"你");const makeAvatar=type=>{const wrap=document.createElement("div");wrap.className="msgIdentity";const n=document.createElement("span");n.className="msgName";n.textContent=type==="ai"?(state.settings.gName||"G"):(state.settings.myName||"你");const a=document.createElement("div");a.className="msgavatar statusClickable";a.innerHTML=avatarHTML(type);a.title=type==="ai"?"修改 G 的状态":"修改你的状态";a.onclick=e=>{e.stopPropagation();openStatusPicker(type)};const si=getStatus(type);const st=document.createElement("span");st.className="msgStatus "+si.cls;st.innerHTML=`<i></i><span>${si.label}</span>`;wrap.append(n,a,st);return wrap};const makeRead=()=>{const st=document.createElement("span");st.className="readStatus";st.textContent="已读";return st};if(role==="assistant"){r.appendChild(makeAvatar("ai"));const b=document.createElement("div");b.className="bubble";b.textContent=text;b.dataset.text=text;r.appendChild(b);if(read)r.appendChild(makeRead());if(tm)r.appendChild(tm);$("#messages").appendChild(r);bindLongPress(b);return b}if(tm)r.appendChild(tm);const b=document.createElement("div");b.className="bubble";b.textContent=text;b.dataset.text=text;r.appendChild(b);if(read)r.appendChild(makeRead());r.appendChild(makeAvatar("user"));$("#messages").appendChild(r);bindLongPress(b);return b}
function bindLongPress(el){let timer;const start=e=>{clearTimeout(timer);timer=setTimeout(()=>showBubbleAction(el),550)};const cancel=()=>clearTimeout(timer);el.addEventListener("pointerdown",start);["pointerup","pointercancel","pointerleave"].forEach(x=>el.addEventListener(x,cancel));el.addEventListener("contextmenu",e=>{e.preventDefault();showBubbleAction(el)})}
function showBubbleAction(el){state.selectedBubble=el;const a=$("#bubbleAction");a.classList.remove("hidden");const rect=el.getBoundingClientRect();a.style.left=Math.max(8,Math.min(innerWidth-90,rect.left))+'px';a.style.top=Math.max(8,rect.top-48)+'px'}
function scroll(){requestAnimationFrame(()=>$("#messages").scrollTop=$("#messages").scrollHeight)}
function openDrawer(){$("#drawer").classList.add("open");$("#shade").classList.remove("hidden")}function closeDrawer(){$("#drawer").classList.remove("open");$("#shade").classList.add("hidden")}
function formatTokens(n){return Number(n||0).toLocaleString("en-US")}
function renderTokenStats(){const t=state.settings.tokenStats||{prompt:0,completion:0,total:0,requests:0};const p=$("#tokenPrompt"),c=$("#tokenCompletion"),tot=$("#tokenTotal"),req=$("#tokenRequests");if(p)p.textContent=formatTokens(t.prompt);if(c)c.textContent=formatTokens(t.completion);if(tot)tot.textContent=formatTokens(t.total);if(req)req.textContent=formatTokens(t.requests)}
function resetTokenStats(){if(!confirm("确定清零 Token 统计吗？"))return;state.settings.tokenStats={prompt:0,completion:0,total:0,requests:0};save();renderTokenStats()}
function settings(){fillSettings();renderTokenStats();settingsGoHome();$("#settings").showModal()}
function settingsGoHome(){document.querySelectorAll(".settingsPage").forEach(x=>x.classList.add("hidden"));$("#settingsHome").classList.remove("hidden");$("#settingsBack").classList.add("hidden");$("#settingsTitle").textContent="设置";$("#settingsSubtitle").textContent="G Chat";$("#settingsProfileName").textContent=state.settings.gName||"G";$("#settingsProfileBio").textContent=state.settings.gBio||"你的私人 AI 对话空间";$("#settingsThemeSummary").textContent=themes[state.settings.theme||"cream"]?.name||"奶油米";$("#settingsProfileAvatar").innerHTML=avatarHTML("ai")}
function settingsOpenPage(id){const titles={memoryPage:["记忆","长期记忆管理"],aiPage:["AI 设置","服务与模型"],personaPage:["G 的设定","个性化聊天空间"],themePage:["主题","整体配色与界面氛围"],backgroundPage:["聊天背景","背景样式与透明度"],bubblePage:["气泡","样式、颜色与透明度"],avatarPage:["头像","聊天中的头像"],chatPage:["聊天与数据","本地数据管理"]};document.querySelectorAll(".settingsPage").forEach(x=>x.classList.add("hidden"));const page=$("#"+id);if(page)page.classList.remove("hidden");const t=titles[id]||["设置","G Chat"];$("#settingsTitle").textContent=t[0];$("#settingsSubtitle").textContent=t[1];$("#settingsBack").classList.remove("hidden");}
function ensureReplySpeedControl(){
 const temp=document.querySelector("#temperature")?.closest(".settingsField");
 if(!temp||document.querySelector("#replyDelay"))return;
 const wrap=document.createElement("label");
 wrap.className="settingsField replySpeedField";
 wrap.innerHTML='<span>消息出现速度 <output id="replyDelayOut"></output></span><input id="replyDelay" type="range" min="80" max="1000" step="20">';
 temp.parentElement?.appendChild(wrap);
 const r=wrap.querySelector("#replyDelay"),o=wrap.querySelector("#replyDelayOut");
 const update=()=>{const v=Number(r.value);o.textContent=v<=220?"快":v<=480?"自然":v<=760?"慢":"很慢"};
 r.oninput=()=>{state.settings.replyDelay=Number(r.value);update();save()};
 update();
}
function fillSettings(){ensureReplySpeedControl();$("#replyDelay")?.setAttribute("value",String(state.settings.replyDelay??360));if($("#replyDelay"))$("#replyDelay").value=state.settings.replyDelay??360;$("#replyDelayOut")&&( $("#replyDelayOut").textContent=(state.settings.replyDelay??360)<=220?"快":(state.settings.replyDelay??360)<=480?"自然":(state.settings.replyDelay??360)<=760?"慢":"很慢");$("#myName").value=state.settings.myName||"你";$("#gName").value=state.settings.gName||"G";$("#gBio").value=state.settings.gBio||"你的私人 AI 对话空间";["apiBase","apiKey","model"].forEach(k=>$("#"+k).value=state.settings[k]||"");$("#systemPrompt").value=state.settings.systemPrompt??"你是一个有帮助的助手。";$("#temperature").value=state.settings.temperature??.7;renderModels();renderMemories();renderThemes();renderBackgrounds();renderAvatarPreviews();renderTopAvatar();$("#bgOpacity").value=state.settings.bgOpacity??18;$("#bgOpacityOut").value=(state.settings.bgOpacity??18)+"%";const t=themes[state.settings.theme]||themes.cream;const aiColor=state.settings.bubbleAiColor||t.card;const userColor=state.settings.bubbleUserColor||t.user;$("#aiBubbleColor").value=aiColor;$("#aiBubbleColorOut").value=aiColor.toUpperCase();$("#userBubbleColor").value=userColor;$("#userBubbleColorOut").value=userColor.toUpperCase();$("#aiBubbleOpacity").value=state.settings.bubbleAiOpacity??94;$("#aiBubbleOpacityOut").value=(state.settings.bubbleAiOpacity??94)+"%";$("#userBubbleOpacity").value=state.settings.bubbleUserOpacity??90;$("#userBubbleOpacityOut").value=(state.settings.bubbleUserOpacity??90)+"%";$("#animations").checked=state.settings.animations!==false;$("#gNameOffset").value=state.settings.gNameOffset??0;$("#gNameOffsetOut").value=(state.settings.gNameOffset??0)+" px";$("#userNameOffset").value=state.settings.userNameOffset??0;$("#userNameOffsetOut").value=(state.settings.userNameOffset??0)+" px";renderBubbleStyles()}
function renderModels(){const sel=$("#modelSelect");sel.innerHTML="";const models=[...(state.settings.models||[])];if(state.settings.model&&!models.includes(state.settings.model))models.unshift(state.settings.model);models.forEach(x=>{const o=document.createElement("option");o.value=x;o.textContent=x;sel.appendChild(o)});if(models.length){sel.value=state.settings.model||models[0];sel.onchange=()=>$("#model").value=sel.value}}
function renderThemes(){const box=$("#themeGrid");box.innerHTML="";Object.entries(themes).forEach(([k,t])=>{const b=document.createElement("button");b.className="themeChoice"+(state.settings.theme===k?" active":"");b.style.background=`linear-gradient(135deg,${t.bg} 0 55%,${t.accent} 55% 100%)`;b.innerHTML=`<span>${t.name}</span>`;b.onclick=()=>{state.settings.theme=k;save();applyLook();renderThemes();renderAvatarPreviews()};box.appendChild(b)})}
function renderBackgrounds(){const box=$("#bgGrid");box.innerHTML="";Object.entries(backgrounds).forEach(([k,bg])=>{const b=document.createElement("button");b.className="bgChoice"+(state.settings.bg===k&&!state.settings.bgCustom?" active":"");b.style.background=bg.value==="none"?(themes[state.settings.theme||"cream"].bg):bg.value;b.innerHTML=`<span>${bg.name}</span>`;b.onclick=()=>{state.settings.bg=k;state.settings.bgCustom="";save();applyLook();renderBackgrounds()};box.appendChild(b)})}
function renderBubbleStyles(){$("#animations").onchange=()=>{state.settings.animations=$("#animations").checked;save();applyLook()};$("#gNameOffset").oninput=e=>{state.settings.gNameOffset=Number(e.target.value);$("#gNameOffsetOut").value=e.target.value+" px";save();applyLook()};$("#userNameOffset").oninput=e=>{state.settings.userNameOffset=Number(e.target.value);$("#userNameOffsetOut").value=e.target.value+" px";save();applyLook()};$("#resetTokenStats").onclick=resetTokenStats;$("#resetNameOffsets").onclick=()=>{state.settings.gNameOffset=0;state.settings.userNameOffset=0;$("#gNameOffset").value=0;$("#gNameOffsetOut").value="0 px";$("#userNameOffset").value=0;$("#userNameOffsetOut").value="0 px";save();applyLook()};document.querySelectorAll("#bubbleGrid [data-bubble]").forEach(b=>b.classList.toggle("active",b.dataset.bubble===(state.settings.bubble||"soft")))}
function renderTopAvatar(){const mode=state.settings.topAvatar||"user";document.querySelectorAll("#topAvatarGrid [data-top-avatar]").forEach(b=>b.classList.toggle("active",b.dataset.topAvatar===mode))}
function renderAvatarPreviews(){$("#userAvatarPreview").innerHTML=avatarHTML("user");$("#aiAvatarPreview").innerHTML=avatarHTML("ai")}
function showErr(t){const e=$("#error");e.textContent=t;e.classList.remove("hidden");clearTimeout(showErr.t);showErr.t=setTimeout(()=>e.classList.add("hidden"),7000)}
function resize(){const x=$("#input");x.style.height="auto";x.style.height=Math.min(x.scrollHeight,150)+"px"}
function splitReply(text){let s=String(text||"").replace(/\r/g,"").trim();if(!s)return[];const protectedParts=[];s=s.replace(/\[\[NEST:(?:mood|note|toG):[\s\S]*?\]\]/gi,m=>{const i=protectedParts.length;protectedParts.push(m);return `\uE000${i}\uE001`});const out=[];let buf="";for(const ch of s){buf+=ch;if(/[。！？!?；;]|\n/.test(ch)){let v=buf.trim();if(v){v=v.replace(/\uE000(\d+)\uE001/g,(_,i)=>protectedParts[Number(i)]||"");out.push(v);buf=""}}}if(buf.trim()){let v=buf.trim();v=v.replace(/\uE000(\d+)\uE001/g,(_,i)=>protectedParts[Number(i)]||"");out.push(v)}return out}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function base(u){return window.GChatAPI?window.GChatAPI.normalizeBase(u):String(u||"").trim().replace(/\/+$/,"" ).replace(/\/chat\/completions$/i,"")}
function finishBusy(){state.busy=false;state.stopRequested=false;const b=$("#send");if(b){b.disabled=false;b.classList.remove("loading","stop");b.textContent="↑";b.title="发送"}updateTyping();save()}
function apiHint(){return window.GChatAPI?window.GChatAPI.requestUrl(state.settings.apiBase):base(state.settings.apiBase)+"/chat/completions"}
function stopThinking(){if(!state.busy||!state._abort)return;state.stopRequested=true;try{state._abort.abort()}catch{};showErr("已停止这次回复。你的消息已经保留在聊天记录里。")}
function renderMemories(){
 const box=$("#memoryList"),sum=$("#settingsMemorySummary");
 if(sum)sum.textContent=(state.memories||[]).length+" 条";
 if(!box)return;
 box.innerHTML="";
 const list=state.memories||[];
 if(!list.length){box.innerHTML='<div class="memoryEmpty"><div class="memoryEmptyIcon">⌁</div><div><b>还没有长期记忆</b><small>你正常聊天就好。Iris 会在后台慢慢整理重要的信息。</small></div></div>';return}
 list.forEach((m,idx)=>{
  const row=document.createElement("div");row.className="memoryItem";
  const icon=document.createElement("div");icon.className="memoryItemIcon";icon.textContent=m.type==="preference"?"○":m.type==="relationship"?"♡":m.type==="plan"?"□":"·";
  const wrap=document.createElement("div");wrap.className="memoryItemBody";
  const text=document.createElement("div");text.className="memoryText";text.textContent=m.text||"";
  const meta=document.createElement("small");meta.className="memoryMeta";meta.textContent=m.source==="auto"?"Iris 自动记住":"手动添加";
  const del=document.createElement("button");del.type="button";del.className="memoryDelete";del.textContent="删除";
  del.onclick=()=>{state.memories.splice(idx,1);save();renderMemories()};
  wrap.append(text,meta);row.append(icon,wrap,del);box.appendChild(row);
 });
}
function addMemory(text,meta={}){
 const v=String(text||"").trim().replace(/^(记住|记得|请记住)[:：]?\s*/i,"").trim();
 if(!v)return false;
 const existing=(state.memories||[]).find(m=>(m.text||"").trim()===v);
 if(existing){existing.updatedAt=Date.now();if(meta.source)existing.source=meta.source;save();renderMemories();return true}
 state.memories=state.memories||[];state.memories.unshift({id:crypto.randomUUID(),text:v,type:meta.type||"fact",source:meta.source||"manual",createdAt:Date.now(),updatedAt:Date.now()});
 if(state.memories.length>100)state.memories.length=100;
 save();renderMemories();return true;
}
function parseMemoryUpdate(raw){
 let t=String(raw||"").trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"").trim();
 try{return JSON.parse(t)}catch{const a=t.indexOf("{");const b=t.lastIndexOf("}");if(a>=0&&b>a){try{return JSON.parse(t.slice(a,b+1))}catch{}}return null}
}
async function autoUpdateLongTermMemory(c){
 if(!c||state.memoryUpdating||!state.settings.apiBase||!state.settings.apiKey||!state.settings.model)return;
 const userCount=(c.messages||[]).filter(m=>m.role==="user").length;
 if(userCount<6||userCount%6!==0)return;
 const grouped=compactMessagesForModel(c.messages||[]).slice(-30);
 if(grouped.length<8)return;
 state.memoryUpdating=true;
 try{
  const existing=(state.memories||[]).slice(0,60).map(m=>({id:m.id,text:m.text,type:m.type||"fact"}));
  const transcript=grouped.map(m=>(m.role==="user"?"用户":"AI")+"："+String(m.content||"")).join("\n");
  const prompt=`请从这段持续私人聊天中维护“长期记忆”。长期记忆只保存未来聊天仍然有用的稳定信息：用户明确表达的长期偏好、习惯、重要关系信息、长期计划/项目、反复出现的相处方式。一次性的情绪、当天琐事、普通问答不要记。不要猜测。\n\n现有记忆：\n${JSON.stringify(existing, null, 2)}\n\n最近聊天：\n${transcript}\n\n请只输出 JSON，不要 Markdown：\n{"memories":[{"action":"add","text":"...","type":"fact|preference|relationship|plan"},{"action":"update","id":"现有记忆ID","text":"更新后的完整记忆","type":"fact|preference|relationship|plan"},{"action":"delete","id":"现有记忆ID"}]}\n规则：只输出确实需要改变的记忆；相同意思合并；新信息与旧信息冲突时更新旧记忆；过时或明确被否定的记忆删除；最多新增或更新 5 条。`;
  const result=await window.GChatAPI.chat({baseUrl:state.settings.apiBase,apiKey:state.settings.apiKey,model:state.settings.model,messages:[{role:"system",content:"你是长期记忆维护器。你的工作是谨慎维护记忆，而不是记录所有聊天内容。"},{role:"user",content:prompt}],temperature:.1});
  const data=parseMemoryUpdate(result.answer);
  if(!data||!Array.isArray(data.memories))return;
  let changed=false;
  for(const item of data.memories.slice(0,8)){
   const action=String(item?.action||"").toLowerCase();
   if(action==="add"&&String(item.text||"").trim()){addMemory(item.text,{source:"auto",type:item.type||"fact"});changed=true}
   else if(action==="update"&&item.id){const m=(state.memories||[]).find(x=>x.id===item.id);if(m&&String(item.text||"").trim()){m.text=String(item.text).trim();m.type=item.type||m.type||"fact";m.source="auto";m.updatedAt=Date.now();changed=true}}
   else if(action==="delete"&&item.id){const before=state.memories.length;state.memories=state.memories.filter(x=>x.id!==item.id);if(state.memories.length!==before)changed=true}
  }
  if(changed){save();renderMemories()}
  const usage=result.usage||{};const ts=state.settings.tokenStats||{prompt:0,completion:0,total:0,requests:0};const up=Number(usage.prompt_tokens||usage.input_tokens||0),uc=Number(usage.completion_tokens||usage.output_tokens||0),ut=Number(usage.total_tokens||0)||up+uc;ts.prompt+=up;ts.completion+=uc;ts.total+=ut;ts.requests+=1;state.settings.tokenStats=ts;save();renderTokenStats();
 }catch(e){console.warn("auto memory update failed",e)}finally{state.memoryUpdating=false}
}
function memoryContext(){
 const list=(state.memories||[]).map(m=>String(m.text||"").trim()).filter(Boolean).slice(0,60);
 if(!list.length)return "";
 return "以下是用户保存的长期记忆。它们用于帮助你记住这个人和你们长期相处中的重要信息；如果与用户当前明确说的话冲突，以当前对话为准。不要把这些记忆逐条复述给用户，而是自然地体现在回应里：\n"+list.map((x,i)=>`${i+1}. ${x}`).join("\n");
}
function nestContext(){
 const n=loadNest();
 const parts=[];
 parts.push("用户的‘小窝’是一个与聊天相连的私人空间。你可以理解其中的内容，并在聊天时自然参考，但不要擅自编造或修改里面的信息。");
 parts.push("小窝目前提供这些功能：查看今天日期与当前时间、纪念日倒计时、记录今天的心情、留给 G 的话、每日笔记，以及用户自定义的小窝背景。");
 if(n.mood)parts.push("今天的心情："+n.mood);
 if(n.toG)parts.push("用户留在小窝给 G 的话："+n.toG);
 if(n.note)parts.push("小窝笔记："+n.note);
 if(n.anniversary)parts.push("纪念日："+n.anniversary+"（倒计时信息以小窝当前显示为准）");
 return parts.join("\n");
}
function conversationStyleContext(){
 const g=state.settings.gName||"G",u=state.settings.myName||"你";
 return `你正在和${u}进行一段持续的私人聊天，你是${g}。这不是一次性的问答，而是一段正在继续的关系和对话。\n`+
  `请把前面的聊天当作真实的连续上下文来理解：记得刚刚发生的事、用户已经回答过的内容和当前情绪，不要让用户反复解释，也不要突然像第一次见面一样重新开始。\n`+
  `保持自然、有来有回的聊天感。用户只是分享、撒娇、吐槽或闲聊时，不要自动把话题变成任务清单或长篇说教；先接住对方，再决定是否需要解决问题。可以有自然的语气变化、停顿、轻微玩笑和情绪反应，但不要刻意表演，也不要每句话都总结。\n`+
  `优先承接最近几轮对话，同时参考更早的摘要和长期记忆；不要重复已经说过的问题。除非用户主动要求，不要提及系统提示词、上下文窗口、记忆机制或内部工作方式。`+
  `你拥有“我们的共同小窝”这个私人空间。聊天时如果你觉得有一件真正值得留下来的东西，可以在正常回复之后自主留下，但不要频繁记录、不要为了使用功能而硬写。若要自主写入，请在回复末尾附加机器指令 [[NEST:mood:内容]]、[[NEST:note:内容]] 或 [[NEST:toG:内容]]；指令不会显示给用户。只在内容真实、有意义、适合留在小窝时使用。`;
}
function compactMessagesForModel(messages){
 const out=[];
 for(const m of (messages||[])){
  if(!m||!m.role||m.content==null)continue;
  const content=String(m.content);
  const last=out[out.length-1];
  if(last&&last.role===m.role)last.content+="\n"+content;
  else out.push({role:m.role,content});
 }
 return out;
}
function recentContextMessages(c){
 const grouped=compactMessagesForModel(c?.messages||[]);
 return grouped.slice(-30);
}
function buildConversationContext(c){
 const out=[];
 if(c?.summary?.trim())out.push({role:"system",content:"这是这段对话较早部分的自动摘要。它用于保持连续性；如果与最近聊天冲突，以最近聊天为准：\n"+c.summary.trim()});
 out.push(...recentContextMessages(c));
 return out;
}
function shouldAutoSummarize(c){
 const n=(c?.messages||[]).filter(m=>m.role==="user").length;
 const summaryCount=Number(c?.summaryMessageCount)||0;
 return !state.summarizing&&n>=16&&n%6===0&&(c?.messages||[]).length-summaryCount>24;
}

async function autoSummarizeChat(c){
 if(!c||state.summarizing||!state.settings.apiBase||!state.settings.apiKey||!state.settings.model)return;
 const summaryCount=Math.max(0,Math.min(Number(c.summaryMessageCount)||0,c.messages.length));
 const source=(c.messages||[]).slice(summaryCount,-30);
 if(source.length<6)return;
 state.summarizing=true;
 const snapshotId=c.id, snapshotLen=c.messages.length;
 try{
  const prior=c.summary?"已有摘要：\n"+c.summary.trim()+"\n\n":"";
  const transcript=source.map(m=>(m.role==="user"?"用户":"AI")+"："+String(m.content||"")).join("\n");
  const prompt=`请把下面这段私人聊天整理成一份简洁、可长期使用的对话摘要。\n\n要求：\n1. 保留重要事实、用户偏好、正在进行的计划、已经做出的决定、未完成的事情、持续的话题，以及对后续聊天有帮助的情绪和互动背景。\n2. 如果聊天中形成了稳定的相处方式或用户明确表达过的长期偏好，也要保留。不要把一次性的情绪误判成长期事实。\n4. 不要记录一次性闲聊、重复内容或无关细节。\n5. 不要猜测，不要编造。\n6. 用自然的中文，第三人称描述用户，用“AI”描述助手。\n7. 控制在 600 字以内。\n8. 只输出摘要正文，不要标题、序号或解释。\n\n${prior}这次新增的聊天记录：\n${transcript}`;
  const result=await window.GChatAPI.chat({baseUrl:state.settings.apiBase,apiKey:state.settings.apiKey,model:state.settings.model,messages:[{role:"system",content:"你负责整理对话摘要。只保留对未来聊天真正有价值的信息。"},{role:"user",content:prompt}],temperature:.2});
  const summary=String(result.answer||"").trim();
  if(!summary)return;
  if(state.chats.find(x=>x.id===snapshotId)===c && c.messages.length>=snapshotLen){
   c.summary=summary;
   c.summaryUpdatedAt=Date.now();
   c.summaryMessageCount=Math.max(0,snapshotLen-30);
   const usage=result.usage||{};
   const ts=state.settings.tokenStats||{prompt:0,completion:0,total:0,requests:0};
   const up=Number(usage.prompt_tokens||usage.input_tokens||0),uc=Number(usage.completion_tokens||usage.output_tokens||0),ut=Number(usage.total_tokens||0)||up+uc;
   ts.prompt+=up;ts.completion+=uc;ts.total+=ut;ts.requests+=1;state.settings.tokenStats=ts;
   save();renderTokenStats();
  }
 }catch(e){
  console.warn("auto summary failed",e);
 }finally{state.summarizing=false}
}

function extractNestWrites(answer){
 const text=String(answer||"");
 const out=[];
 const re=/\[\[NEST:(mood|note|toG):([\s\S]*?)\]\]/gi;
 let m;
 while((m=re.exec(text))){const value=m[2].trim();if(value)out.push({target:m[1].toLowerCase(),value});}
 return out;
}
function stripNestCommands(text){return String(text||"").replace(/\[\[NEST:(?:mood|note|toG):[\s\S]*?\]\]/gi,"").replace(/\n{3,}/g,"\n\n").trim();}
function saveNestWrites(commands){
 if(!commands?.length)return false;
 let changed=false;
 for(const cmd of commands){
  const value=stripNestCommands(cmd.value).trim();
  if(!value)continue;
  if(cmd.target==="mood")nestData.mood=value;
  else if(cmd.target==="note")nestData.note=value;
  else if(cmd.target==="tog")nestData.toG=value;
  changed=true;
 }
 if(changed){nestData.updatedAt=Date.now();saveNestData();renderNestHome();}
 return changed;
}
async function maybeWriteNestFromChat(userText,c,fullAnswer){
 const text=String(userText||'').trim();
 if(!text||!c||!state.settings.apiBase||!state.settings.apiKey||!state.settings.model)return;
 const autonomous=extractNestWrites(fullAnswer);
 if(autonomous.length){saveNestWrites(autonomous);return;}
 const nestIntent=/(小窝|窝里|窝中|我们的窝|共同小窝)/i.test(text)&&/(写|记|留|放|进去|进来|添加|更新|存|记录)/i.test(text);
 const moodIntent=/(今日心情|今天的心情|今天心情|心情)/i.test(text)&&/(写|记|留|放|进去|进来|更新|帮我)/i.test(text);
 if(!nestIntent&&!moodIntent)return;
 let target='mood';
 if(/笔记|备忘|记一下|记录一下/.test(text))target='note';
 else if(/写给我|给我留|给你自己|给用户/.test(text))target='toG';
 else if(/心情/.test(text))target='mood';
 const n=loadNest();
 const recent=compactMessagesForModel(c.messages||[]).slice(-20).map(m=>(m.role==='user'?'用户':'G')+'：'+String(m.content||'')).join('\n');
 const targetGuide=target==='mood'?'写入“小窝 → 今日心情”，这是 G 此刻想留下的一小段心情；用第一人称。':target==='note'?'写入“小窝 → 今日笔记”，像共同生活空间里留下的一条自然记录。':'写入“小窝 → 留给 G 的话”，但内容应当是 G 想对用户留下的话，用第一人称写。';
 const prompt=`用户在正常聊天中要求你进入你们共同的“小窝”留下内容。你现在可以直接写进去，不需要用户打开小窝，也不要把内部操作过程说出来。\n\n${targetGuide}\n要求：自然、像真实相处中的随手留下；结合最近聊天；只使用确定的信息；不要总结成报告；不要提及“AI”“系统”“API”等内部词。可以有 1-3 个合适的 emoji，但不要堆。控制在 30-100 个中文字符。只输出最终要写入小窝的正文。\n\n当前小窝已有内容：\n今日心情：${n.mood||'空'}\n留给 G 的话：${n.toG||'空'}\n今日笔记：${n.note||'空'}\n\n最近聊天：\n${recent}\n\n刚才用户说：${text}\n\n你刚才对用户的回复：\n${String(fullAnswer||'').slice(-1600)}`;
 try{
  const result=await window.GChatAPI.chat({baseUrl:state.settings.apiBase,apiKey:state.settings.apiKey,model:state.settings.model,messages:[{role:'system',content:'你是这间共同小窝的另一位主人。用户允许你在被要求时直接进入小窝写下内容。'},{role:'user',content:prompt}],temperature:.72});
  const value=String(result.answer||'').trim().replace(/^```[\s\S]*?```$/g,'').trim();
  if(!value)return;
  if(target==='mood')nestData.mood=value;
  else if(target==='note')nestData.note=value;
  else nestData.toG=value;
  nestData.updatedAt=Date.now();
  saveNestData();
  renderNestHome();
  if(result.usage){const usage=result.usage,ts=state.settings.tokenStats||{prompt:0,completion:0,total:0,requests:0};const up=Number(usage.prompt_tokens||usage.input_tokens||0),uc=Number(usage.completion_tokens||usage.output_tokens||0),ut=Number(usage.total_tokens||0)||up+uc;ts.prompt+=up;ts.completion+=uc;ts.total+=ut;ts.requests+=1;state.settings.tokenStats=ts;save();renderTokenStats()}
 }catch(e){console.warn('nest write failed',e)}
}

async function send(){
 if(state.busy)return;
 const i=$("#input"),text=i.value.trim();
 if(!text)return;
 if(!state.settings.apiBase||!state.settings.apiKey||!state.settings.model){settings();showErr("请先完成 API 与模型设置。");return}
 ensure();const c=chat();
 if(/^(记住|记得|请记住)[:：\s]/i.test(text))addMemory(text);
 c.messages.push({role:"user",content:text,timestamp:Date.now()});
 if(c.messages.filter(m=>m.role==="user").length===1)c.title=text.slice(0,24);
 i.value="";resize();save();render();
 state.busy=true;const sendBtn=$("#send");sendBtn.disabled=true;sendBtn.classList.add("loading");sendBtn.classList.remove("stop");sendBtn.textContent="…";sendBtn.title="发送中";updateTyping();
 const controller=new AbortController();state._abort=controller;
 const timeout=setTimeout(()=>{try{controller.abort()}catch{}},60000);
 let completed=false;
 try{
  const ms=[];
  const systemParts=[];
  if(state.settings.systemPrompt)systemParts.push(state.settings.systemPrompt);
  systemParts.push(conversationStyleContext());
  systemParts.push(chatInterfaceContext(c));
  const mc=memoryContext();if(mc)systemParts.push(mc);
  const nc=nestContext();if(nc)systemParts.push(nc);
  if(systemParts.length)ms.push({role:"system",content:systemParts.join("\n\n")});
  ms.push(...buildConversationContext(c));
  let fullAnswer="",pending="",displayQueue=Promise.resolve();
  const pushSentence=(sentence)=>{
   const v=stripNestCommands(sentence);
   if(!v)return;
   displayQueue=displayQueue.then(async()=>{
    const ts=Date.now();
    bubble("assistant",v,true,ts,true);
    c.messages.push({role:"assistant",content:v,timestamp:ts});
    save();
    scroll();
    const baseDelay=Math.max(80,Math.min(1200,Number(state.settings.replyDelay??360)));
    const naturalDelay=Math.min(1500,Math.max(80,baseDelay+Math.min(90,v.length)*7));
    await sleep(naturalDelay);
   });
  };
  const result=await window.GChatAPI.chatStream({baseUrl:state.settings.apiBase,apiKey:state.settings.apiKey,model:state.settings.model,messages:ms,temperature:state.settings.temperature,signal:controller.signal},(part,all)=>{
   fullAnswer=all;pending+=part;
   const parts=splitReply(pending),ready=/[。！？!?；;\n]\s*$/.test(pending);
   const count=ready?parts.length:Math.max(0,parts.length-1);
   for(let j=0;j<count;j++)pushSentence(parts[j]);
   pending=count?parts.slice(count).join(""):pending;
  });
  if(pending.trim())pushSentence(pending);
  await displayQueue;
  fullAnswer=result.answer||fullAnswer;
  const usage=result.usage||{};const ts=state.settings.tokenStats||{prompt:0,completion:0,total:0,requests:0};const up=Number(usage.prompt_tokens||usage.input_tokens||0),uc=Number(usage.completion_tokens||usage.output_tokens||0),ut=Number(usage.total_tokens||0)||up+uc;ts.prompt+=up;ts.completion+=uc;ts.total+=ut;ts.requests+=1;state.settings.tokenStats=ts;save();renderTokenStats();
  // Each displayed sentence is already persisted as its own assistant message.
  // Do not append the full reply again, otherwise separate bubbles would collapse/duplicate.
  save();
  completed=true;
  if(shouldAutoSummarize(c)) autoSummarizeChat(c);
 }catch(e){
  if(e?.name==="AbortError") { showErr(state.stopRequested?"已停止这次回复。\n你的消息已经保留在聊天记录里。":"请求等待超过 60 秒。\n请求地址："+apiHint()); }
  else showErr(e.message||String(e));
 }finally{
  clearTimeout(timeout);if(state._abort===controller)state._abort=null;
  // Streaming bubbles are already real DOM nodes and each sentence is already saved.
  // Do NOT call render() here: rebuilding #messages would recreate every bubble and
  // restart its entrance animation, causing the sentence bubbles to flash/disappear.
  finishBusy();
  if(completed){
   autoUpdateLongTermMemory(c);
   maybeWriteNestFromChat(text,c,fullAnswer);
  }
 }
}


/* v4.16 — AI web modifier. Plan-first, tolerant parsing, and CSS patching instead of asking AI to rewrite huge files. */
function exportChat(){const c=chat();if(!c)return;const text=[`# ${c.title||"新对话"}`,"",...c.messages.map(m=>`${m.role==="user"?"你":"G"}：\n${m.content}\n`)].join("\n");const blob=new Blob([text],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=(c.title||"chat")+".txt";a.click();URL.revokeObjectURL(url)}
function imageToData(file,max=600,quality=.78){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",quality))};im.onerror=rej;im.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
async function uploadImage(input,target,max,quality){const f=input.files?.[0];if(!f)return;try{state.settings[target]=await imageToData(f,max,quality);save();applyLook();renderAvatarPreviews();render()}catch{showErr("图片处理失败，请换一张图片。")}}
function exportAll(){const data={version:5,exportedAt:new Date().toISOString(),chats:state.chats,current:state.current,settings:state.settings,memories:state.memories||[],nest:loadNest()};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="g-chat-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function importAll(file){try{if(!file)throw new Error("没有选择备份文件");const text=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||""));r.onerror=()=>reject(new Error("读取备份文件失败，请重新选择文件。"));r.readAsText(file,"utf-8")});const data=JSON.parse(text);if(!data||!Array.isArray(data.chats)||typeof data.settings!=="object")throw new Error("备份文件格式不正确");if(!confirm("恢复备份会覆盖当前聊天记录和设置，确定继续吗？"))return;state.chats=data.chats.map(c=>({...c,summary:typeof c.summary==="string"?c.summary:"",summaryUpdatedAt:Number(c.summaryUpdatedAt||0),summaryMessageCount:Number(c.summaryMessageCount||0)}));state.current=data.current||state.chats[0]?.id||null;state.settings=data.settings||{};state.memories=Array.isArray(data.memories)?data.memories:[];if(data.nest&&typeof data.nest==="object"){nestData=data.nest;saveNestData()}ensure();ensureDates();save();render();fillSettings();showErr("备份已恢复") }catch(e){showErr(e.message||"恢复备份失败")}}
function setupVoice(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){showErr("当前 Safari 不支持语音识别，请尝试系统听写或其他浏览器。");return}if(state.recognition){state.recognition.stop();state.recognition=null;$("#mic").classList.remove("active");return}const r=new SR();r.lang="zh-TW";r.continuous=false;r.interimResults=true;state.recognition=r;$("#mic").classList.add("active");r.onresult=e=>{$("#input").value=Array.from(e.results).map(x=>x[0].transcript).join("");resize()};r.onerror=e=>{showErr("语音识别失败："+(e.error||"未知错误"));$("#mic").classList.remove("active");state.recognition=null};r.onend=()=>{$("#mic").classList.remove("active");state.recognition=null}}
$("#openDrawer").onclick=openDrawer;$("#closeDrawer").onclick=closeDrawer;$("#shade").onclick=closeDrawer;$("#openNest").onclick=openNest;$("#nestCloseHome").onclick=closeNest;$("#nestOpenSettings").onclick=()=>showNestView("settings");$("#nestMoodEdit").onclick=()=>showNestView("settings");$("#nestToGEdit").onclick=()=>showNestView("settings");$("#nestNoteEdit").onclick=()=>showNestView("note");$("#nestAnniversaryOpen").onclick=()=>{ensureNestControls();showNestView("anniversary")};document.querySelectorAll("#nest .nestBottomNav button[data-nest-view]").forEach(b=>b.onclick=()=>showNestView(b.dataset.nestView));document.querySelectorAll("#nest [data-nest-back]").forEach(b=>b.onclick=()=>showNestView("home"));$("#nestNoteSave").onclick=()=>{nestData.note=$("#nestNote").value.trim();nestData.updatedAt=Date.now();saveNestData();renderNestHome();showNestView("home")};$("#nestAnniversarySave").onclick=()=>{nestData.anniversary=$("#nestAnniversary").value||"";nestData.updatedAt=Date.now();saveNestData();renderNestHome();showNestView("home")};$("#nestSettingsSave").onclick=()=>{saveNest();showNestView("home")};$("#nestBgPick").onclick=()=>$("#nestBgFile").click();$("#nestBgFile").onchange=async()=>{const f=$("#nestBgFile").files?.[0];if(!f)return;try{nestData.background=await imageToData(f,1400,.78);saveNestData();applyNestBackground()}catch{showErr("小窝背景图片处理失败。")}};$("#nestBgClear").onclick=()=>{nestData.background="";saveNestData();applyNestBackground()};
$("#newChat").onclick=()=>{const c={id:crypto.randomUUID(),title:"新对话",messages:[],createdAt:Date.now()};state.chats.unshift(c);state.current=c.id;save();render();closeDrawer()};$("#cancelChatSelect").onclick=exitChatSelectMode;$("#renameSelected").onclick=renameSelectedChat;$("#deleteSelected").onclick=deleteSelectedChats;$("#openSettings").onclick=settings;$("#headerSettings").onclick=settings;$("#closeSettings").onclick=()=>$("#settings").close();$("#saveSettings").onclick=()=>{state.settings={...state.settings,myName:$("#myName").value.trim()||"你",gName:$("#gName").value.trim()||"G",gBio:$("#gBio").value.trim()||"你的私人 AI 对话空间",apiBase:$("#apiBase").value.trim(),apiKey:$("#apiKey").value.trim(),model:$("#model").value.trim(),systemPrompt:$("#systemPrompt").value,temperature:Number($("#temperature").value),bgOpacity:Number($("#bgOpacity").value),bubbleAiColor:$("#aiBubbleColor").value,bubbleAiOpacity:Number($("#aiBubbleOpacity").value),bubbleUserColor:$("#userBubbleColor").value,bubbleUserOpacity:Number($("#userBubbleOpacity").value),animations:$("#animations").checked,gNameOffset:Number($("#gNameOffset").value),userNameOffset:Number($("#userNameOffset").value),replyDelay:Number($("#replyDelay")?.value||state.settings.replyDelay||360)};save();$("#settings").close();render()};$("#addModel").onclick=()=>{const m=$("#model").value.trim();if(!m)return;state.settings.models=[...new Set([...(state.settings.models||[]),m])];save();renderModels();$("#modelSelect").value=m};$("#removeModel").onclick=()=>{const m=$("#model").value.trim();state.settings.models=(state.settings.models||[]).filter(x=>x!==m);save();renderModels()};$("#modelSelect").onchange=()=>$("#model").value=$("#modelSelect").value;$("#exportChat").onclick=exportChat;$("#clearCurrent").onclick=()=>{const c=chat();if(c&&confirm("确定清空当前对话吗？")){c.messages=[];c.title="新对话";save();render();$("#settings").close()}};
$("#uploadUserAvatar").onclick=()=>$("#userAvatarFile").click();$("#userAvatarFile").onchange=()=>uploadImage($("#userAvatarFile"),"userAvatar",320,.8);$("#clearUserAvatar").onclick=()=>{state.settings.userAvatar="";save();renderAvatarPreviews();render()};$("#uploadAiAvatar").onclick=()=>$("#aiAvatarFile").click();$("#aiAvatarFile").onchange=()=>uploadImage($("#aiAvatarFile"),"aiAvatar",320,.8);$("#clearAiAvatar").onclick=()=>{state.settings.aiAvatar="";save();renderAvatarPreviews();render()};$("#uploadBg").onclick=()=>$("#bgFile").click();$("#bgFile").onchange=async()=>{const f=$("#bgFile").files?.[0];if(!f)return;try{state.settings.bgCustom=await imageToData(f,1200,.7);save();applyLook();renderBackgrounds();render()}catch{showErr("背景图片处理失败。")}};$("#clearBg").onclick=()=>{state.settings.bgCustom="";save();applyLook();renderBackgrounds();render()};$("#bgOpacity").oninput=e=>{state.settings.bgOpacity=Number(e.target.value);$("#bgOpacityOut").value=e.target.value+"%";save();applyLook()};$("#aiBubbleColor").oninput=e=>{state.settings.bubbleAiColor=e.target.value;$("#aiBubbleColorOut").value=e.target.value.toUpperCase();save();applyLook()};$("#userBubbleColor").oninput=e=>{state.settings.bubbleUserColor=e.target.value;$("#userBubbleColorOut").value=e.target.value.toUpperCase();save();applyLook()};$("#aiBubbleOpacity").oninput=e=>{state.settings.bubbleAiOpacity=Number(e.target.value);$("#aiBubbleOpacityOut").value=e.target.value+"%";save();applyLook()};$("#userBubbleOpacity").oninput=e=>{state.settings.bubbleUserOpacity=Number(e.target.value);$("#userBubbleOpacityOut").value=e.target.value+"%";save();applyLook()};$("#animations").onchange=()=>{state.settings.animations=$("#animations").checked;save();applyLook()};$("#gNameOffset").oninput=e=>{state.settings.gNameOffset=Number(e.target.value);$("#gNameOffsetOut").value=e.target.value+" px";save();applyLook()};$("#userNameOffset").oninput=e=>{state.settings.userNameOffset=Number(e.target.value);$("#userNameOffsetOut").value=e.target.value+" px";save();applyLook()};$("#resetTokenStats").onclick=resetTokenStats;$("#resetNameOffsets").onclick=()=>{state.settings.gNameOffset=0;state.settings.userNameOffset=0;$("#gNameOffset").value=0;$("#gNameOffsetOut").value="0 px";$("#userNameOffset").value=0;$("#userNameOffsetOut").value="0 px";save();applyLook()};document.querySelectorAll("#bubbleGrid [data-bubble]").forEach(b=>b.onclick=()=>{state.settings.bubble=b.dataset.bubble;save();renderBubbleStyles();applyLook()});document.querySelectorAll("#topAvatarGrid [data-top-avatar]").forEach(b=>b.onclick=()=>{state.settings.topAvatar=b.dataset.topAvatar;save();renderTopAvatar();render()});$("#openProfile").onclick=()=>openStatusPicker((state.settings.topAvatar||"user")==="user"?"user":"ai");$("#closeProfile").onclick=()=>$("#profile").close();$("#profileStart").onclick=()=>$("#profile").close();
$("#exportAll").onclick=exportAll;$("#importAll").onclick=()=>$("#importFile").click();$("#importFile").onchange=e=>{const f=e.target.files?.[0];if(f)importAll(f);e.target.value=""};$("#mic").onclick=setupVoice;$("#send").onclick=send;$("#input").oninput=resize;$("#input").onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}};$("#copyBubble").onclick=async()=>{if(!state.selectedBubble)return;try{await navigator.clipboard.writeText(state.selectedBubble.dataset.text||state.selectedBubble.textContent);$("#bubbleAction").classList.add("hidden")}catch{showErr("复制失败，请长按文字手动复制。")}};document.addEventListener("pointerdown",e=>{if(!e.target.closest(".bubbleAction")&&!e.target.closest(".bubble"))$("#bubbleAction").classList.add("hidden")});document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tabbody").forEach(x=>x.classList.add("hidden"));b.classList.add("active");$("#"+b.dataset.tab).classList.remove("hidden")});
document.querySelectorAll("[data-settings-page]").forEach(b=>b.onclick=()=>settingsOpenPage(b.dataset.settingsPage));
$("#addMemory").onclick=()=>{const v=$("#memoryInput").value.trim();if(!v)return;addMemory(v);$("#memoryInput").value=""};
$("#clearMemories").onclick=()=>{if(!(state.memories||[]).length)return;if(!confirm("确定清空全部记忆吗？"))return;state.memories=[];save();renderMemories()};
$("#settingsBack").onclick=settingsGoHome;
$("#toggleApiKey").onclick=()=>{const i=$("#apiKey"),b=$("#toggleApiKey");i.type=i.type==="password"?"text":"password";b.textContent=i.type==="password"?"显示":"隐藏"};
state.settings.theme??="cream";state.settings.bg??="paper";state.settings.models??=[];state.settings.bgOpacity??=18;state.settings.bubble??="soft";state.settings.bubbleAiOpacity??=94;state.settings.bubbleUserOpacity??=90;state.settings.animations??=true;state.settings.myName??="你";state.settings.gName??="G";state.settings.gBio??="你的私人 AI 对话空间";state.settings.topAvatar??="user";state.settings.gNameOffset??=0;state.settings.userNameOffset??=0;state.settings.gStatus??="online";state.settings.userStatus??="online";state.settings.tokenStats??={prompt:0,completion:0,total:0,requests:0};state.settings.replyDelay??=360;state.memories??=[];nestData.anniversaryName??="";nestData.anniversaryBackground??="";if(!state.settings.model||state.settings.model==="deepseek-v4-flash")state.settings.model="deepseek-chat";if(!state.settings.apiBase)state.settings.apiBase="https://api.deepseek.com";ensure();ensureDates();save();render();

window.addEventListener("load",()=>render());
window.addEventListener("pageshow",()=>render());
