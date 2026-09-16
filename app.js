/* Iris v4.81 — vision final reply uses the normal chat model; messages can be edited/deleted. */
/* Iris v4.49 — direct nest cards, independent quick moods and custom notes, refined layout. */
/* Iris v4.43 — unified mood page, multi-anniversary viewing and terminology polish. */
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
function normalizeNestData(){
  nestData.moods=nestData.moods&&typeof nestData.moods==="object"?nestData.moods:{user:nestData.moods?.user||"",ai:nestData.moods?.ai||""};
  nestData.anniversaries=Array.isArray(nestData.anniversaries)?nestData.anniversaries:[];
  if(!nestData.anniversaries.length&&nestData.anniversary){nestData.anniversaries=[{id:crypto.randomUUID(),name:nestData.anniversaryName||"纪念日",date:nestData.anniversary,background:nestData.anniversaryBackground||""}]}
  if(nestData.anniversaries.length&&!nestData.selectedAnniversaryId)nestData.selectedAnniversaryId=nestData.anniversaries[0].id;
  if(nestData.selectedAnniversaryId&&!nestData.anniversaries.some(x=>x.id===nestData.selectedAnniversaryId))nestData.selectedAnniversaryId=nestData.anniversaries[0]?.id||"";
}
normalizeNestData();
let nestViewDateKey=nestDateKey();
function nestDateKey(date=new Date()){const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function nestDateLabel(key){const d=new Date(`${key}T12:00:00`);return Number.isNaN(d.getTime())?key:d.toLocaleDateString("zh-TW",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}
function shiftNestDate(key,delta){const d=new Date(`${key}T12:00:00`);d.setDate(d.getDate()+delta);const out=nestDateKey(d),today=nestDateKey();return out>today?today:out}
function ensureDailyEntry(key){normalizeNestData();nestData.daily=nestData.daily&&typeof nestData.daily==="object"?nestData.daily:{};if(!nestData.daily[key]||typeof nestData.daily[key]!=="object")nestData.daily[key]={};return nestData.daily[key]}
function syncTodayToDaily(){const key=nestDateKey(),entry=ensureDailyEntry(key);if(entry.userMood===undefined){const legacy=String(nestData.moods?.user||"");if(nestMoodOptions.includes(legacy))entry.userMood=legacy;else{entry.userMood="";if(entry.userMoodNote===undefined)entry.userMoodNote=legacy}}if(entry.userMoodNote===undefined)entry.userMoodNote="";if(entry.aiMood===undefined){const legacy=String(nestData.moods?.ai||"");if(nestMoodOptions.includes(legacy))entry.aiMood=legacy;else{entry.aiMood="";if(entry.aiMoodNote===undefined)entry.aiMoodNote=legacy}}if(entry.aiMoodNote===undefined)entry.aiMoodNote="";if(entry.toG===undefined)entry.toG=nestData.toG||"";if(entry.note===undefined)entry.note=nestData.note||""}
function dailyEntry(key=nestDateKey()){syncTodayToDaily();return ensureDailyEntry(key)}
function saveDailyField(key,field,value){const entry=ensureDailyEntry(key);entry[field]=String(value||"");entry.updatedAt=Date.now();if(key===nestDateKey()){if(field==="userMood")nestData.moods.user=entry[field];if(field==="aiMood")nestData.moods.ai=entry[field];if(field==="toG")nestData.toG=entry[field];if(field==="note")nestData.note=entry[field]}nestData.updatedAt=Date.now();saveNestData()}
function selectedAnniversary(){normalizeNestData();return nestData.anniversaries.find(x=>x.id===nestData.selectedAnniversaryId)||nestData.anniversaries[0]||null}
function anniversaryDays(item){if(!item?.date)return null;const p=String(item.date).split("-").map(Number);if(p.length!==3||p.some(x=>!Number.isFinite(x)))return null;const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());let next=new Date(today.getFullYear(),p[1]-1,p[2]);if(next<today)next=new Date(today.getFullYear()+1,p[1]-1,p[2]);return Math.round((next-today)/86400000)}
function nestDays(){return anniversaryDays(selectedAnniversary())}
function nestDaysText(){const d=nestDays();if(d===null)return"还没有设置纪念日";return d===0?"就是今天":`还有 ${d} 天`}
function nestTodayText(){const d=new Date();return d.toLocaleDateString("zh-TW",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}
function updateNestClock(){const n=$("#nestNow"),big=$("#nestClockBig");const d=new Date();if(n)n.textContent=nestTodayText();if(big)big.textContent=d.toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",hour12:false});const c=$("#nestCountdown"),cb=$("#nestCountdownBig");if(c)c.textContent=nestDaysText();if(cb){const days=nestDays();cb.textContent=days===null?"—":String(days)}const item=selectedAnniversary(),lab=$("#nestAnniversaryLabel");if(lab)lab.textContent=item?.name||item?.date||"还没有设置纪念日"}
function applyNestBackground(){const app=$("#nestApp"),preview=$("#nestBackgroundPreview");if(!app)return;app.style.setProperty("--nest-bg-image",nestData.background?`url(${nestData.background})`:"none");if(preview)preview.style.backgroundImage=nestData.background?`url(${nestData.background})`:"linear-gradient(135deg,#f5e9dc,#fffaf3)";const page=$("#nestAnniversaryPage"),item=selectedAnniversary();if(page){const bg=item?.background?`url(${item.background})`:"none";page.style.setProperty("--anniversary-bg-image",bg);page.style.backgroundImage=bg}const ap=$("#nestAnniversaryPreview");if(ap)ap.style.backgroundImage=item?.background?`url(${item.background})`:"linear-gradient(135deg,#f5e9dc,#fffaf3)"}
function renderNestHome(){syncTodayToDaily();const e=dailyEntry(),mood=$("#nestMoodShow"),aiMood=$("#nestAiMoodShow"),toG=$("#nestToGShow"),note=$("#nestNoteShow");if(mood)mood.textContent=e.userMood||"今天感觉怎么样？";if(aiMood)aiMood.textContent=e.aiMood||"他今天想留下一句话。";if(toG)toG.textContent=e.toG||"写点什么留在这里。";if(note)note.textContent=e.note||"今天有什么想留下来？";const ua=$("#nestUserAvatar"),aa=$("#nestAiAvatar"),un=$("#nestUserName"),an=$("#nestAiName");if(ua)ua.innerHTML=avatarHTML("user");if(aa)aa.innerHTML=avatarHTML("ai");if(un)un.textContent=state.settings.myName||"你";if(an)an.textContent=state.settings.gName||"他";updateNestClock();applyNestBackground()}
const nestMoodOptions=["开心","难过","平静","期待","疲惫","烦躁","想念","甜甜的"];
function currentMoodTarget(){return nestData.moodTarget==="ai"?"ai":"user"}
function showNestMood(target="user"){nestData.moodTarget=target==="ai"?"ai":"user";nestViewDateKey=nestDateKey();showNestView("mood")}
function moodIndex(value){const i=nestMoodOptions.indexOf(String(value||""));return i<0?0:i}
function renderMoodTicks(id,current){const box=$(id);if(!box)return;box.innerHTML=nestMoodOptions.map((x,i)=>`<span class="${nestMoodOptions[i]===current?"active":""}">${escapeHtml(x)}</span>`).join("")}
function setMoodFromRange(target,index,save=true){const value=nestMoodOptions[Math.max(0,Math.min(nestMoodOptions.length-1,Number(index)||0))];const key=nestViewDateKey;if(target==="ai"){nestData.moods.ai=value;$("#nestAiMoodValue").textContent=value;saveDailyField(key,"aiMood",value);renderMoodTicks("#nestAiMoodTicks",value)}else{nestData.moods.user=value;$("#nestMoodValue").textContent=value;saveDailyField(key,"userMood",value);renderMoodTicks("#nestMoodTicks",value)}if(save)renderNestHome()}
function saveMoodPage(){const target=currentMoodTarget(),quickField=target==="ai"?"aiMood":"userMood",noteField=target==="ai"?"aiMoodNote":"userMoodNote",quickValue=target==="ai"?$("#nestAiMoodValue").textContent.trim():$("#nestMoodValue").textContent.trim(),noteValue=target==="ai"?$("#nestAiMood").value.trim():$("#nestMood").value.trim();saveDailyField(nestViewDateKey,quickField,nestMoodOptions.includes(quickValue)?quickValue:"");saveDailyField(nestViewDateKey,noteField,noteValue)}
function renderMoodPage(){normalizeNestData();const target=currentMoodTarget(),userSection=$("#nestUserMoodSection"),aiSection=$("#nestAiMoodSection"),title=$("#nestMoodPageTitle"),e=dailyEntry(nestViewDateKey);if(userSection)userSection.classList.toggle("hidden",target!=="user");if(aiSection)aiSection.classList.toggle("hidden",target!=="ai");if(title)title.textContent=target==="ai"?"他的心情":"我的心情";const dateEl=target==="ai"?$("#nestAiMoodDate"):$("#nestMoodDate");if(dateEl)dateEl.textContent=nestDateLabel(nestViewDateKey);const value=target==="ai"?(e.aiMood||nestData.moods.ai||""):(e.userMood||nestData.moods.user||"");const note=target==="ai"?(e.aiMoodNote||""):(e.userMoodNote||"");const range=target==="ai"?$("#nestAiMoodRange"):$("#nestMoodRange");const out=target==="ai"?$("#nestAiMoodValue"):$("#nestMoodValue");const textarea=target==="ai"?$("#nestAiMood"):$("#nestMood");if(range)range.value=moodIndex(value);if(out)out.textContent=value||"还没有选择";if(textarea)textarea.value=note;renderMoodTicks(target==="ai"?"#nestAiMoodTicks":"#nestMoodTicks",value)}
function renderAnniversaries(){normalizeNestData();const sel=$("#nestAnniversarySelect"),list=$("#nestAnniversaryList");if(!sel)return;sel.innerHTML="";nestData.anniversaries.forEach((x,i)=>{const o=document.createElement("option");o.value=x.id;o.textContent=x.name||`纪念日 ${i+1}`;sel.appendChild(o)});sel.value=nestData.selectedAnniversaryId||"";if(list){list.innerHTML="";nestData.anniversaries.forEach((x,i)=>{const b=document.createElement("button");b.type="button";b.className="nestAnniversaryListItem"+(x.id===nestData.selectedAnniversaryId?" active":"");b.dataset.id=x.id;b.innerHTML=`<span><b>${escapeHtml(x.name||`纪念日 ${i+1}`)}</b><small>${escapeHtml(x.date||"未设置日期")}</small></span><em>›</em>`;b.onclick=()=>selectAnniversary(x.id);list.appendChild(b)})}}
function selectAnniversary(id){normalizeNestData();if(!nestData.anniversaries.some(x=>x.id===id))return;nestData.selectedAnniversaryId=id;saveNestData();renderAnniversaries();loadSelectedAnniversaryForm();applyNestBackground();updateNestClock()}
function loadSelectedAnniversaryForm(){const x=selectedAnniversary();if($("#nestAnniversary"))$("#nestAnniversary").value=x?.date||"";if($("#nestAnniversaryName"))$("#nestAnniversaryName").value=x?.name||""}
function loadDailyPages(){const e=dailyEntry(nestViewDateKey);if($("#nestToGPageText"))$("#nestToGPageText").value=e.toG||"";if($("#nestToGDate"))$("#nestToGDate").textContent=nestDateLabel(nestViewDateKey);if($("#nestNote"))$("#nestNote").value=e.note||"";if($("#nestNoteDate"))$("#nestNoteDate").textContent=nestDateLabel(nestViewDateKey)}
function saveToGPage(){const value=$("#nestToGPageText")?.value.trim()||"";saveDailyField(nestViewDateKey,"toG",value);renderNestHome()}
function saveNotePage(){const value=$("#nestNote")?.value.trim()||"";saveDailyField(nestViewDateKey,"note",value);renderNestHome()}
function showNestView(view="home"){document.querySelectorAll("#nest .nestPage").forEach(x=>x.classList.add("hidden"));const id=view==="home"?"nestHome":view==="mood"?"nestMoodPage":view==="toG"?"nestToGPage":view==="note"?"nestNotePage":view==="anniversary"?"nestAnniversaryPage":"nestSettingsPage";$("#"+id)?.classList.remove("hidden");document.querySelectorAll("#nest .nestBottomNav button").forEach(b=>b.classList.toggle("active",b.dataset.nestView===view));if(view==="mood")renderMoodPage();if(view==="toG"){loadDailyPages();applyNestBackground()}if(view==="note"){loadDailyPages()}if(view==="anniversary"){renderAnniversaries();loadSelectedAnniversaryForm();applyNestBackground();updateNestClock()}if(view==="settings")applyNestBackground()}
function openNest(){nestData=loadNest();normalizeNestData();saveNestData();renderNestHome();showNestView("home");clearInterval(nestClockTimer);nestClockTimer=setInterval(updateNestClock,30000);$("#nest").showModal()}
function closeNest(){clearInterval(nestClockTimer);nestClockTimer=null;const d=$("#nest");if(d?.open)d.close()}
function saveNest(){normalizeNestData();syncTodayToDaily();nestData.updatedAt=Date.now();saveNestData();renderNestHome()}
function ensureNestControls(){normalizeNestData();applyNestBackground();renderAnniversaries()}
function createNewAnniversary(){normalizeNestData();const item={id:crypto.randomUUID(),name:"新的纪念日",date:"",background:""};nestData.anniversaries.push(item);nestData.selectedAnniversaryId=item.id;saveNestData();renderAnniversaries();loadSelectedAnniversaryForm();applyNestBackground();updateNestClock()}
function saveSelectedAnniversary(){normalizeNestData();let item=selectedAnniversary();if(!item){createNewAnniversary();item=selectedAnniversary()}item.name=$("#nestAnniversaryName").value.trim()||"纪念日";item.date=$("#nestAnniversary").value||"";saveNestData();renderAnniversaries();renderNestHome();applyNestBackground();updateNestClock()}
function deleteSelectedAnniversary(){normalizeNestData();const item=selectedAnniversary();if(!item)return;nestData.anniversaries=nestData.anniversaries.filter(x=>x.id!==item.id);nestData.selectedAnniversaryId=nestData.anniversaries[0]?.id||"";saveNestData();renderAnniversaries();loadSelectedAnniversaryForm();renderNestHome();applyNestBackground();updateNestClock()}
function setupAnniversaryBackground(){const pick=$("#nestAnniversaryBgPick"),file=$("#nestAnniversaryBgFile"),clear=$("#nestAnniversaryBgClear");if(!pick||pick.dataset.bound)return;pick.dataset.bound="1";pick.onclick=()=>file.click();file.onchange=async()=>{const f=file.files?.[0];if(!f)return;try{const item=selectedAnniversary();if(!item)return;item.background=await imageToData(f,900,.72);saveNestData();applyNestBackground();file.value=""}catch{showErr("纪念日背景图片处理失败。")}};clear.onclick=()=>{const item=selectedAnniversary();if(!item)return;item.background="";saveNestData();applyNestBackground()}}

async function writeNestMoodWithAI(){
 if(state.busy||state.memoryUpdating||!state.settings.apiBase||!state.settings.apiKey||!state.settings.model){showErr("请先完成 API 与模型设置。或等当前回复结束后再试。");return}
 const c=chat();
 const recent=compactMessagesForModel(c?.messages||[]).slice(-16).map(m=>(m.role==="user"?"用户":"他")+"："+m.content).join("\n");
 const ui=chatInterfaceContext(c);
 const prompt=`请写一条属于“他”的“今日心情”，放进你们共同的小窝里。它不是总结，而是一段自然、像他自己随手写下来的小短句。可以带 1-3 个 emoji，让情绪有一点温度，但不要堆 emoji。结合最近聊天的真实内容和当前界面状态，只使用能确定的信息，不要编造。控制在 30-90 个中文字符。只输出正文。\n\n${ui}\n\n最近聊天：\n${recent}`;
 try{
  const result=await window.GChatAPI.chat({baseUrl:state.settings.apiBase,apiKey:state.settings.apiKey,model:state.settings.model,messages:[{role:"system",content:"你是一个熟悉用户长期聊天背景的私人 AI。写作自然、简洁、有一点生活气息。"},{role:"user",content:prompt}],temperature:.75});
  const mood=String(result.answer||"").trim().replace(/^```[\s\S]*?```$/g,"").trim();
  if(mood){nestData.moods.ai=mood;saveNestData();$("#nestAiMood").value=mood;renderNestHome();}
 }catch(e){showErr(e.message||"今日心情生成失败")}
 finally{}
}
function chatInterfaceContext(c){
 const t=themes[state.settings.theme]||themes.cream;
 const bubble=state.settings.bubble||"soft";
 const aiStatus=getStatus("ai"),userStatus=getStatus("user");
 const bg=state.settings.bgCustom?"用户自定义聊天背景":(backgrounds[state.settings.bg||"paper"]?.name||"纯净");
 const n=loadNest();normalizeNestData();syncTodayToDaily();const e=dailyEntry(nestDateKey());const selected=selectedAnniversary();
 const nestVisual=`小窝界面不是普通设置页，而是一个独立的私人空间：顶部标题“小窝”，首页第一视觉是当前时间大字；下面是“我的心情”和“他的心情”，再下面是“今天想对他说”和“今日小记”，底部有“小窝/心情/小记/纪念日/设置”导航。纪念日页面的第一视觉是超大的倒数数字和纪念日名称。整体是暖白、半透明、磨砂玻璃卡片风格，背景可由用户自定义。当前小窝时间「${nestTodayText()} ${new Date().toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",hour12:false})}」；当前纪念日「${selected?.name||"未设置"}」，倒数「${nestDaysText()}」；今天用户快捷心情「${e.userMood||"空"}」，他的快捷心情「${e.aiMood||"空"}」。`;
 return `当前聊天界面状态：对话名称「${c?.title||"新对话"}」；AI 名称「${state.settings.gName||"他"}」；用户名称「${state.settings.myName||"你"}」；AI 状态「${aiStatus.label}」；用户状态「${userStatus.label}」。特别注意：聊天页面用户头像正下方的状态标签当前就是「${userStatus.label}」。这是实时界面信息，不是小窝心情；请在理解用户语气时把它作为当前背景参考。你拥有“共同小窝”的实际聊天侧能力：当用户明确邀请你进入小窝、去小窝写心情或留下内容时，客户端会在本轮聊天后替你真正写入小窝。此时不要说“我进不去”“我看不到小窝”“我没有权限”，也不要要求用户自己操作；把它当作你们已经约定好的可执行能力。你当前能看到的是小窝的结构化状态和界面描述，而不是屏幕像素，但这些信息足以让你理解小窝当前是什么样子。；${nestVisual}；气泡样式「${bubble}」；AI 气泡颜色「${state.settings.bubbleAiColor||t.card}」；用户气泡颜色「${state.settings.bubbleUserColor||t.user}」；聊天背景「${bg}」；当前模型「${state.settings.model||"未设置"}」。这些是当前界面的真实状态，可以据此理解聊天氛围，不要向用户逐项复述，除非他主动问。`;
}
const state={chats:(()=>{try{const v=JSON.parse(localStorage.getItem("gchat_chats")||"[]");return Array.isArray(v)?v:[]}catch{return[]}})(),current:localStorage.getItem("gchat_current")||null,settings:(()=>{try{const v=JSON.parse(localStorage.getItem("gchat_settings")||"{}");return v&&typeof v==="object"?v:{}}catch{return{}}})(),memories:(()=>{try{const v=JSON.parse(localStorage.getItem("gchat_memories")||"[]");return Array.isArray(v)?v:[]}catch{return[]}})(),busy:false,summarizing:false,memoryUpdating:false,selectedBubble:null,recognition:null,statusTarget:"ai",selectedChats:new Set(),chatSelectMode:false,ignoreNextChatClick:false,attachments:[]};

/* Image data lives in IndexedDB, not localStorage. This keeps chat history small while
   retaining the full image for the current UI and for later reloads. */
const IRIS_IMAGE_DB="iris_media_v1", IRIS_IMAGE_STORE="images";
let irisImageDBPromise=null;
function openImageDB(){if(irisImageDBPromise)return irisImageDBPromise;irisImageDBPromise=new Promise((resolve,reject)=>{try{const r=indexedDB.open(IRIS_IMAGE_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(IRIS_IMAGE_STORE))r.result.createObjectStore(IRIS_IMAGE_STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error("图片数据库打开失败"))}catch(e){reject(e)}});return irisImageDBPromise}
async function putImageData(id,data){try{const db=await openImageDB();await new Promise((res,rej)=>{const tx=db.transaction(IRIS_IMAGE_STORE,"readwrite");tx.objectStore(IRIS_IMAGE_STORE).put(data,id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error||new Error("图片保存失败"))})}catch(e){console.warn("Iris image DB write failed",e)}}
async function getImageData(id){if(!id)return"";try{const db=await openImageDB();return await new Promise((res,rej)=>{const tx=db.transaction(IRIS_IMAGE_STORE,"readonly"),r=tx.objectStore(IRIS_IMAGE_STORE).get(id);r.onsuccess=()=>res(typeof r.result==="string"?r.result:"");r.onerror=()=>rej(r.error||new Error("图片读取失败"))})}catch{return""}}
function imageRefForData(data){if(!data||typeof data!=="string")return"";const id=crypto.randomUUID();putImageData(id,data);return id}
function persistableChats(){return (state.chats||[]).map(c=>({...c,messages:(c.messages||[]).map(m=>{if(!Array.isArray(m.content))return m;return {...m,content:m.content.map(part=>{if(part?.type==="image_url"&&part.image_url?.url){const id=part.image_id||imageRefForData(part.image_url.url);return {type:"image_ref",image_id:id}}return part})}})}))}
const save=()=>{try{localStorage.setItem("gchat_chats",JSON.stringify(persistableChats()));localStorage.setItem("gchat_current",state.current||"");localStorage.setItem("gchat_settings",JSON.stringify(state.settings));localStorage.setItem("gchat_memories",JSON.stringify(state.memories||[]))}catch(e){console.warn("Iris local save failed",e);try{localStorage.setItem("gchat_current",state.current||"");localStorage.setItem("gchat_settings",JSON.stringify(state.settings));localStorage.setItem("gchat_memories",JSON.stringify(state.memories||[]))}catch{}}};
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
function updateHeaderStatus(){const d=$("#headerStatusDot");if(!d)return;const si=getStatus("ai");d.className="onlineDot "+si.cls;d.title="他："+si.label}
function openStatusPicker(type="ai"){state.statusTarget=type;const d=$("#profile");if(!d)return;const isUser=type==="user";const si=getStatus(type);$("#profileAvatar").innerHTML=avatarHTML(type);$("#profileName").textContent=isUser?(state.settings.myName||"你"):(state.settings.gName||"他");$("#profileBio").textContent=isUser?"你的聊天状态":(state.settings.gBio||"你的私人 AI 对话空间");$("#profileModel").textContent=isUser?"你的状态":(state.settings.model||"未设置");$("#profileTheme").textContent=si.label;$("#profileStatusText").textContent=si.label;renderStatusPicker();d.showModal()}
function renderStatusPicker(){const box=$("#statusPicker");if(!box)return;const current=getStatus(state.statusTarget);box.innerHTML="";Object.entries(statusOptions).forEach(([key,info])=>{const b=document.createElement("button");b.type="button";b.className="statusOption"+(current.cls===info.cls?" active":"");b.innerHTML=`<i class="statusDot ${info.cls}"></i><span>${info.label}</span>`;b.onclick=()=>{const field=state.statusTarget==="user"?"userStatus":"gStatus";state.settings[field]=key;save();const si=getStatus(state.statusTarget);$("#profileStatusText").textContent=si.label;$("#profileTheme").textContent=si.label;renderStatusPicker();updateHeaderStatus();render()};box.appendChild(b)})}
function avatarHTML(type){const src=type==="user"?state.settings.userAvatar:state.settings.aiAvatar;return src?`<img src="${src}" alt="">`:(type==="user"?"你":"他")}
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
function render(){applyLook();const c=chat();$("#title").textContent=c?.title||"新对话";$("#modelName").textContent=state.settings.model||"未設定模型";updateHeaderStatus();$("#headerTime").textContent=c?.messages?.length?" · "+formatTime(c.messages[c.messages.length-1].timestamp):"";updateTyping();const topAvatar=$("#headAvatar"),topMode=state.settings.topAvatar||"user";topAvatar.classList.toggle("is-hidden",topMode==="none");$("#openProfile").classList.toggle("avatar-hidden",topMode==="none");if(topMode!=="none")topAvatar.innerHTML=avatarHTML(topMode);$("#brandAvatar").innerHTML=avatarHTML("ai");renderChatList();const box=$("#messages");box.innerHTML="";if(!c||!c.messages.length){box.innerHTML=`<div class="empty"><div><div class="avatar">${avatarHTML("ai")}</div><span class="welcomeKicker">${welcomeText()}</span><h1>${escapeHtml(state.settings.gName||"他")}</h1><p>${escapeHtml(state.settings.gBio||"你的私人 AI 对话空间")}</p><div class="quickPrompts"><button data-prompt="帮我规划一下今天的安排">规划今天</button><button data-prompt="陪我聊聊，轻松一点">陪我聊聊</button><button data-prompt="帮我整理一下最近的想法">整理思绪</button></div></div></div>`;box.querySelectorAll("[data-prompt]").forEach(b=>b.onclick=()=>{iFill(b.dataset.prompt)});return}c.messages.forEach((m,idx)=>{if(m.image)appendGeneratedImage(m.image,c);else bubble(m.role,m.content,false,m.timestamp,true,c.id,idx)});scroll()}
function displayMessageText(value){if(Array.isArray(value))return value.filter(x=>x?.type==="text").map(x=>x.text||"").join("\n");return String(value??"")}
function bubble(role,text,streaming=false,timestamp=null,read=false,chatId=null,messageIndex=null){const originalContent=text;text=displayMessageText(text);const r=document.createElement("div");r.className="message "+role;r.dataset.chatId=chatId||state.current||"";if(messageIndex!==null&&messageIndex!==undefined)r.dataset.messageIndex=String(messageIndex);if(streaming)r.style.animation="none";const tm=timestamp?document.createElement("span"):null;if(tm){tm.className="msgTime";tm.textContent=formatTime(timestamp)}const type=role==="assistant"?"ai":"user";const makeAvatar=type=>{const wrap=document.createElement("div");wrap.className="msgIdentity";const n=document.createElement("span");n.className="msgName";n.textContent=type==="ai"?(state.settings.gName||"他"):(state.settings.myName||"你");const a=document.createElement("div");a.className="msgavatar statusClickable";a.innerHTML=avatarHTML(type);a.title=type==="ai"?"修改 他的状态":"修改你的状态";a.onclick=e=>{e.stopPropagation();openStatusPicker(type)};const si=getStatus(type);const st=document.createElement("span");st.className="msgStatus "+si.cls;st.innerHTML=`<i></i><span>${si.label}</span>`;wrap.append(n,a,st);return wrap};const makeRead=()=>{const st=document.createElement("span");st.className="readStatus";st.textContent="已读";return st};if(role==="assistant"){r.appendChild(makeAvatar("ai"));const b=document.createElement("div");b.className="bubble";b.textContent=text;b.dataset.text=text;r.appendChild(b);if(read)r.appendChild(makeRead());if(tm)r.appendChild(tm);$("#messages").appendChild(r);bindLongPress(b,r);return b}if(tm)r.appendChild(tm);const b=document.createElement("div");b.className="bubble";b.textContent=text;b.dataset.text=text;if(Array.isArray(originalContent)){const imgs=originalContent.filter(x=>x?.type==="image_url"&&x?.image_url?.url);const refs=originalContent.filter(x=>x?.type==="image_ref"&&x?.image_id);if(imgs.length||refs.length){const wrap=document.createElement("div");wrap.className="sentImageGrid";imgs.forEach(x=>{const img=document.createElement("img");img.src=x.image_url.url;img.alt="已发送图片";wrap.appendChild(img)});refs.forEach(x=>{getImageData(x.image_id).then(src=>{if(!src)return;const img=document.createElement("img");img.src=src;img.alt="已发送图片";wrap.appendChild(img);scroll()})});b.appendChild(wrap)}}r.appendChild(b);if(read)r.appendChild(makeRead());r.appendChild(makeAvatar("user"));$("#messages").appendChild(r);bindLongPress(b,r);return b}
function bindLongPress(el,row){let timer;const start=e=>{if(e.target.closest("button,a,input,textarea"))return;clearTimeout(timer);timer=setTimeout(()=>showBubbleAction(el,row),550)};const cancel=()=>clearTimeout(timer);el.addEventListener("pointerdown",start);["pointerup","pointercancel","pointerleave"].forEach(x=>el.addEventListener(x,cancel));el.addEventListener("contextmenu",e=>{e.preventDefault();showBubbleAction(el,row)})}
function showBubbleAction(el,row=el.closest(".message")){state.selectedBubble={el,row,chatId:row?.dataset.chatId||state.current,messageIndex:row?.dataset.messageIndex==null?null:Number(row.dataset.messageIndex)};const a=$("#bubbleAction");a.classList.remove("hidden");const rect=el.getBoundingClientRect();const w=a.offsetWidth||190,h=a.offsetHeight||44;a.style.left=Math.max(8,Math.min(innerWidth-w-8,rect.left))+"px";a.style.top=Math.max(8,rect.top-h-8)+"px"}
function closeBubbleAction(){const a=$("#bubbleAction");if(a)a.classList.add("hidden");state.selectedBubble=null}
function selectedMessage(){const s=state.selectedBubble;if(!s||s.messageIndex===null)return null;const c=state.chats.find(x=>x.id===s.chatId);const m=c?.messages?.[s.messageIndex];return c&&m?{c,m,index:s.messageIndex}:null}
function editSelectedMessage(){const hit=selectedMessage();closeBubbleAction();if(!hit)return;const current=displayMessageText(hit.m.content);const next=prompt("编辑消息内容",current);if(next===null)return;const value=next.replace(/\r\n?/g,"\n");if(Array.isArray(hit.m.content)){const parts=hit.m.content;const textParts=parts.filter(x=>x?.type==="text");if(textParts.length)textParts[0].text=value;else if(value.trim())parts.unshift({type:"text",text:value});hit.m.content=parts}else hit.m.content=value;hit.m.editedAt=Date.now();save();render()}
function deleteSelectedMessage(){const hit=selectedMessage();closeBubbleAction();if(!hit)return;if(!confirm("确定删除这条消息吗？"))return;hit.c.messages.splice(hit.index,1);save();render()}
function scroll(){requestAnimationFrame(()=>$("#messages").scrollTop=$("#messages").scrollHeight)}
function openDrawer(){$("#drawer").classList.add("open");$("#shade").classList.remove("hidden")}function closeDrawer(){$("#drawer").classList.remove("open");$("#shade").classList.add("hidden")}
function formatTokens(n){return Number(n||0).toLocaleString("en-US")}
function renderTokenStats(){const t=state.settings.tokenStats||{prompt:0,completion:0,total:0,requests:0};const p=$("#tokenPrompt"),c=$("#tokenCompletion"),tot=$("#tokenTotal"),req=$("#tokenRequests");if(p)p.textContent=formatTokens(t.prompt);if(c)c.textContent=formatTokens(t.completion);if(tot)tot.textContent=formatTokens(t.total);if(req)req.textContent=formatTokens(t.requests)}
function resetTokenStats(){if(!confirm("确定清零 Token 统计吗？"))return;state.settings.tokenStats={prompt:0,completion:0,total:0,requests:0};save();renderTokenStats()}
function settings(){fillSettings();renderTokenStats();settingsGoHome();$("#settings").showModal()}
function settingsGoHome(){document.querySelectorAll(".settingsPage").forEach(x=>x.classList.add("hidden"));$("#settingsHome").classList.remove("hidden");$("#settingsBack").classList.add("hidden");$("#settingsTitle").textContent="设置";$("#settingsSubtitle").textContent="Iris";$("#settingsProfileName").textContent=state.settings.gName||"他";$("#settingsProfileBio").textContent=state.settings.gBio||"你的私人 AI 对话空间";$("#settingsThemeSummary").textContent=themes[state.settings.theme||"cream"]?.name||"奶油米";$("#settingsProfileAvatar").innerHTML=avatarHTML("ai")}
function settingsOpenPage(id){const titles={visionPage:["视觉与图像","照片理解与图像生成"],memoryPage:["记忆","长期记忆管理"],mcpPage:["AI 工具 / MCP","小窝与外部工具"],aiPage:["AI 设置","服务与模型"],personaPage:["他的设定","个性化聊天空间"],themePage:["主题","整体配色与界面氛围"],backgroundPage:["聊天背景","背景样式与透明度"],bubblePage:["气泡","样式、颜色与透明度"],avatarPage:["头像","聊天中的头像"],chatPage:["聊天与数据","本地数据管理"]};document.querySelectorAll(".settingsPage").forEach(x=>x.classList.add("hidden"));const page=$("#"+id);if(page)page.classList.remove("hidden");const t=titles[id]||["设置","Iris"];$("#settingsTitle").textContent=t[0];$("#settingsSubtitle").textContent=t[1];$("#settingsBack").classList.remove("hidden");}
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
function fillSettings(){ensureReplySpeedControl();$("#replyDelay")?.setAttribute("value",String(state.settings.replyDelay??360));if($("#replyDelay"))$("#replyDelay").value=state.settings.replyDelay??360;$("#replyDelayOut")&&( $("#replyDelayOut").textContent=(state.settings.replyDelay??360)<=220?"快":(state.settings.replyDelay??360)<=480?"自然":(state.settings.replyDelay??360)<=760?"慢":"很慢");$("#myName").value=state.settings.myName||"你";$("#gName").value=state.settings.gName||"他";$("#gBio").value=state.settings.gBio||"你的私人 AI 对话空间";["apiBase","apiKey","model"].forEach(k=>$("#"+k).value=state.settings[k]||"");$("#systemPrompt").value=state.settings.systemPrompt??"你是一个有帮助的助手。";$("#temperature").value=state.settings.temperature??.7;$("#mcpNestEnabled").checked=state.settings.mcpNestEnabled!==false;$("#mcpEnabled").checked=state.settings.mcpEnabled===true;$("#mcpServerUrl").value=state.settings.mcpServerUrl||"";$("#mcpServerToken").value=state.settings.mcpServerToken||"";$("#mcpSummary").textContent=state.settings.mcpEnabled===true?"已启用":"关闭";$("#visionEnabled").checked=state.settings.visionEnabled===true;$("#visionBase").value=state.settings.visionBase||"";$("#visionKey").value=state.settings.visionKey||"";$("#visionModel").value=state.settings.visionModel||"";$("#imageGenEnabled").checked=state.settings.imageGenEnabled===true;$("#imageGenBase").value=state.settings.imageGenBase||"";$("#imageGenKey").value=state.settings.imageGenKey||"";$("#imageGenModel").value=state.settings.imageGenModel||"";renderModels();renderMemories();renderThemes();renderBackgrounds();renderAvatarPreviews();renderTopAvatar();$("#bgOpacity").value=state.settings.bgOpacity??18;$("#bgOpacityOut").value=(state.settings.bgOpacity??18)+"%";const t=themes[state.settings.theme]||themes.cream;const aiColor=state.settings.bubbleAiColor||t.card;const userColor=state.settings.bubbleUserColor||t.user;$("#aiBubbleColor").value=aiColor;$("#aiBubbleColorOut").value=aiColor.toUpperCase();$("#userBubbleColor").value=userColor;$("#userBubbleColorOut").value=userColor.toUpperCase();$("#aiBubbleOpacity").value=state.settings.bubbleAiOpacity??94;$("#aiBubbleOpacityOut").value=(state.settings.bubbleAiOpacity??94)+"%";$("#userBubbleOpacity").value=state.settings.bubbleUserOpacity??90;$("#userBubbleOpacityOut").value=(state.settings.bubbleUserOpacity??90)+"%";$("#animations").checked=state.settings.animations!==false;$("#gNameOffset").value=state.settings.gNameOffset??0;$("#gNameOffsetOut").value=(state.settings.gNameOffset??0)+" px";$("#userNameOffset").value=state.settings.userNameOffset??0;$("#userNameOffsetOut").value=(state.settings.userNameOffset??0)+" px";renderBubbleStyles()}
function renderModels(){const sel=$("#modelSelect");sel.innerHTML="";const models=[...(state.settings.models||[])];if(state.settings.model&&!models.includes(state.settings.model))models.unshift(state.settings.model);models.forEach(x=>{const o=document.createElement("option");o.value=x;o.textContent=x;sel.appendChild(o)});if(models.length){sel.value=state.settings.model||models[0];sel.onchange=()=>$("#model").value=sel.value}}
function renderThemes(){const box=$("#themeGrid");box.innerHTML="";Object.entries(themes).forEach(([k,t])=>{const b=document.createElement("button");b.className="themeChoice"+(state.settings.theme===k?" active":"");b.style.background=`linear-gradient(135deg,${t.bg} 0 55%,${t.accent} 55% 100%)`;b.innerHTML=`<span>${t.name}</span>`;b.onclick=()=>{state.settings.theme=k;save();applyLook();renderThemes();renderAvatarPreviews()};box.appendChild(b)})}
function renderBackgrounds(){const box=$("#bgGrid");box.innerHTML="";Object.entries(backgrounds).forEach(([k,bg])=>{const b=document.createElement("button");b.className="bgChoice"+(state.settings.bg===k&&!state.settings.bgCustom?" active":"");b.style.background=bg.value==="none"?(themes[state.settings.theme||"cream"].bg):bg.value;b.innerHTML=`<span>${bg.name}</span>`;b.onclick=()=>{state.settings.bg=k;state.settings.bgCustom="";save();applyLook();renderBackgrounds()};box.appendChild(b)})}
function renderBubbleStyles(){$("#animations").onchange=()=>{state.settings.animations=$("#animations").checked;save();applyLook()};$("#gNameOffset").oninput=e=>{state.settings.gNameOffset=Number(e.target.value);$("#gNameOffsetOut").value=e.target.value+" px";save();applyLook()};$("#userNameOffset").oninput=e=>{state.settings.userNameOffset=Number(e.target.value);$("#userNameOffsetOut").value=e.target.value+" px";save();applyLook()};$("#resetTokenStats").onclick=resetTokenStats;$("#resetNameOffsets").onclick=()=>{state.settings.gNameOffset=0;state.settings.userNameOffset=0;$("#gNameOffset").value=0;$("#gNameOffsetOut").value="0 px";$("#userNameOffset").value=0;$("#userNameOffsetOut").value="0 px";save();applyLook()};document.querySelectorAll("#bubbleGrid [data-bubble]").forEach(b=>b.classList.toggle("active",b.dataset.bubble===(state.settings.bubble||"soft")))}
function renderTopAvatar(){const mode=state.settings.topAvatar||"user";document.querySelectorAll("#topAvatarGrid [data-top-avatar]").forEach(b=>b.classList.toggle("active",b.dataset.topAvatar===mode))}
function renderAvatarPreviews(){$("#userAvatarPreview").innerHTML=avatarHTML("user");$("#aiAvatarPreview").innerHTML=avatarHTML("ai")}
function showErr(t){const e=$("#error");e.textContent=t;e.classList.remove("hidden");clearTimeout(showErr.t);showErr.t=setTimeout(()=>e.classList.add("hidden"),7000)}
function resize(){const x=$("#input");x.style.height="auto";x.style.height=Math.min(x.scrollHeight,150)+"px"}
function splitReply(text){const s=String(text||"").replace(/\r/g,"").trim();if(!s)return[];const out=[];let buf="";for(const ch of s){buf+=ch;if(/[。！？!?；;]|\n/.test(ch)){const v=buf.trim();if(v){out.push(v);buf=""}}}if(buf.trim())out.push(buf.trim());return out}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function base(u){return window.GChatAPI?window.GChatAPI.normalizeBase(u):String(u||"").trim().replace(/\/+$/,"" ).replace(/\/chat\/completions$/i,"")}
function finishBusy(){state.busy=false;state.stopRequested=false;const b=$("#send");if(b){b.disabled=false;b.classList.remove("loading","stop");b.textContent="↑";b.title="发送"}state._abort=null;updateTyping();save()}
function apiHint(){return window.GChatAPI?window.GChatAPI.requestUrl(state.settings.apiBase):base(state.settings.apiBase)+"/chat/completions"}
function stopThinking(){if(!state.busy||!state._abort)return;state.stopRequested=true;try{state._abort.abort()}catch{};const b=$("#send");if(b){b.disabled=false;b.classList.remove("loading");b.classList.add("stop");b.textContent="■";b.title="停止回复"}}
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
function isStableMemoryCandidate(text,type="fact"){
 const v=String(text||"").trim();
 if(!v||v.length<4||v.length>180)return false;
 if(/^(今天|现在|刚刚|这会儿|此刻|最近好累|我好累|好开心|好难过|有点烦|睡不着|困了|饿了|无聊)$/i.test(v))return false;
 if(/(天气|气温|新闻|股票|汇率|今天吃|刚吃|正在吃|刚刚吃|现在在|等会儿|一会儿|明天再|今晚要|刚才发生|这次问答|这个问题)/.test(v)&&type!="plan")return false;
 const stable=/偏好|喜欢|不喜欢|讨厌|习惯|通常|总是|从不|希望以后|以后都|长期|记得|称呼|关系|在一起|纪念日|项目|长期计划|正在做|持续|相处|聊天方式|不要用|希望你|我会|我不会|用户希望|用户喜欢/;
 if(type!=="plan"&&!stable.test(v)&&v.length<18)return false;
 return true;
}
function addMemory(text,meta={}){
 const type=meta.type||"fact";
 const v=String(text||"").trim().replace(/^(记住|记得|请记住)[:：]?\s*/i,"").trim();
 if(!isStableMemoryCandidate(v,type))return false;
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
 const grouped=compactMessagesForModel(c.messages||[]).slice(-60);
 if(grouped.length<8)return;
 state.memoryUpdating=true;
 try{
  const existing=(state.memories||[]).slice(0,60).map(m=>({id:m.id,text:m.text,type:m.type||"fact"}));
  const transcript=grouped.map(m=>(m.role==="user"?"用户":"AI")+"："+String(m.content||"")).join("\n");
  const prompt=`请从这段持续私人聊天中维护“长期记忆”。长期记忆只保存未来聊天仍然有用的稳定信息：用户明确表达的长期偏好、习惯、重要关系信息、长期计划/项目、反复出现的相处方式。一次性的情绪、当天琐事、普通问答不要记。不要猜测。\n\n现有记忆：\n${JSON.stringify(existing, null, 2)}\n\n最近聊天：\n${transcript}\n\n请只输出 JSON，不要 Markdown：\n{"memories":[{"action":"add","text":"...","type":"fact|preference|relationship|plan"},{"action":"update","id":"现有记忆ID","text":"更新后的完整记忆","type":"fact|preference|relationship|plan"},{"action":"delete","id":"现有记忆ID"}]}\n规则：只输出确实需要改变的记忆；相同意思合并；新信息与旧信息冲突时更新旧记忆；过时或明确被否定的记忆删除；一次性情绪、当天安排、临时状态、普通问答、具体时间点和无关细节一律不要记录；除非是明确的长期计划，否则不要把“明天/今晚/这周”之类临时安排记入长期记忆；最多新增或更新 5 条。宁可少记，也不要误记。`;
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
 const list=(state.memories||[]).map(m=>String(m.text||"").trim()).filter(Boolean).slice(0,80);
 if(!list.length)return "";
 return "以下是用户保存的长期记忆。它们用于帮助你记住这个人和你们长期相处中的重要信息；如果与用户当前明确说的话冲突，以当前对话为准。不要把这些记忆逐条复述给用户，而是自然地体现在回应里：\n"+list.map((x,i)=>`${i+1}. ${x}`).join("\n");
}
function nestContext(){const n=loadNest();normalizeNestData();syncTodayToDaily();const e=dailyEntry(nestDateKey()),parts=[];const userStatus=getStatus("user");parts.push("用户的‘小窝’是一个与聊天相连的私人空间。你可以理解其中的内容，并在聊天时自然参考，但不要擅自编造或修改里面的信息。");parts.push("小窝目前提供这些功能：记录每天的心情、留给他的话、每日小记，以及多个纪念日和各自的背景。");parts.push("用户在聊天页面头像下方当前显示的状态是「"+userStatus.label+"」。这是用户主动设置的聊天状态，应当作为你理解他/她当下状态的背景参考；它与小窝里的今日心情是两回事。 ");if(e.userMood)parts.push("用户今天选择的快捷心情：「"+e.userMood+"」");if(e.userMoodNote)parts.push("用户今天自己写下的心情：「"+e.userMoodNote+"」");if(e.toG)parts.push("用户今天留给他的话：「"+e.toG+"」");if(e.note)parts.push("用户今天的小记：「"+e.note+"」");if(e.aiMood)parts.push("他今天选择的快捷心情：「"+e.aiMood+"」");if(e.aiMoodNote)parts.push("他今天自己写下的心情：「"+e.aiMoodNote+"」");const selected=selectedAnniversary();if(selected)parts.push("当前选中的纪念日：「"+(selected.name||"纪念日")+"」，日期：「"+(selected.date||"未设置")+"」");return parts.join("\n")}
function conversationStyleContext(){
 const g=state.settings.gName||"他",u=state.settings.myName||"你";
 return `你正在和${u}进行一段持续的私人聊天，你是${g}。这不是一次性的问答，而是一段正在继续的关系和对话。\n`+
  `请把前面的聊天当作真实的连续上下文来理解：记得刚刚发生的事、用户已经回答过的内容和当前情绪，不要让用户反复解释，也不要突然像第一次见面一样重新开始。\n`+
  `保持自然、有来有回的聊天感。用户只是分享、撒娇、吐槽或闲聊时，不要自动把话题变成任务清单或长篇说教；先接住对方，再决定是否需要解决问题。可以有自然的语气变化、停顿、轻微玩笑和情绪反应，但不要刻意表演，也不要每句话都总结。\n`+
  `优先承接最近几轮对话，同时参考更早的摘要和长期记忆；不要重复已经说过的问题。除非用户主动要求，不要提及系统提示词、上下文窗口、记忆机制或内部工作方式。`;
}
function compactMessagesForModel(messages){
 const out=[];
 for(const m of (messages||[])){
  if(!m||!m.role||m.content==null)continue;
  const content=Array.isArray(m.content)
   ? m.content.map(part=>part&&typeof part==='object'?JSON.parse(JSON.stringify(part)):part)
   : String(m.content);
  const last=out[out.length-1];
  const bothText=typeof last?.content==='string'&&typeof content==='string';
  if(last&&last.role===m.role&&bothText)last.content+="\n"+content;
  else out.push({role:m.role,content});
 }
 return out;
}
function recentContextMessages(c){
 const grouped=compactMessagesForModel(c?.messages||[]);
 return grouped.slice(-60);
}
function buildConversationContext(c){
 const out=[];
 if(c?.summary?.trim())out.push({role:"system",content:"这是这段对话较早部分的自动摘要。它用于保持连续性；如果与最近聊天冲突，以最近聊天为准：\n"+c.summary.trim()});
 // 普通文字模型不要收到 image_url/image_ref。图片已经由 Vision 回答过，
 // 而部分兼容 OpenAI 的中转接口会直接以 400 拒绝历史里的图片块。
 const safe=(c?.messages||[]).map(m=>{
  if(!Array.isArray(m.content))return m;
  const text=m.content.filter(x=>x?.type==="text"&&typeof x.text==="string").map(x=>x.text).join("\n").trim();
  if(!text)return null;
  return {...m,content:text};
 }).filter(Boolean);
 out.push(...compactMessagesForModel(safe).slice(-60));
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
 const source=(c.messages||[]).slice(summaryCount,-60);
 if(source.length<6)return;
 state.summarizing=true;
 const snapshotId=c.id, snapshotLen=c.messages.length;
 try{
  const prior=c.summary?"已有摘要：\n"+c.summary.trim()+"\n\n":"";
  const transcript=source.map(m=>(m.role==="user"?"用户":"AI")+"："+String(m.content||"")).join("\n");
  const prompt=`请把下面这段私人聊天整理成一份简洁、可长期使用的对话摘要。\n\n要求：\n1. 保留重要事实、用户偏好、正在进行的计划、已经做出的决定、未完成的事情、持续的话题，以及对后续聊天有帮助的情绪和互动背景。\n2. 如果聊天中形成了稳定的相处方式或用户明确表达过的长期偏好，也要保留。不要把一次性的情绪误判成长期事实。\n4. 不要记录一次性闲聊、重复内容或无关细节。\n5. 不要猜测，不要编造。\n6. 用自然的中文，第三人称描述用户，用“AI”描述助手。\n7. 控制在 900 字以内。\n8. 只输出摘要正文，不要标题、序号或解释。\n\n${prior}这次新增的聊天记录：\n${transcript}`;
  const result=await window.GChatAPI.chat({baseUrl:state.settings.apiBase,apiKey:state.settings.apiKey,model:state.settings.model,messages:[{role:"system",content:"你负责整理对话摘要。只保留对未来聊天真正有价值的信息。"},{role:"user",content:prompt}],temperature:.2});
  const summary=String(result.answer||"").trim();
  if(!summary)return;
  if(state.chats.find(x=>x.id===snapshotId)===c && c.messages.length>=snapshotLen){
   c.summary=summary;
   c.summaryUpdatedAt=Date.now();
   c.summaryMessageCount=Math.max(0,snapshotLen-60);
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

function nestChatWriteTarget(text){
 const t=String(text||'').trim();
 if(!t)return null;
 const enter=/(进小窝|进入小窝|去小窝|到小窝|进窝|去窝|进去小窝|小窝里|窝里|共同小窝)/i.test(t);
 const write=/(写心情|写下心情|留点心情|留下心情|记录心情|写一点|留一点|写下来|留下来|写点东西|写点|留句话|留下一句话|写东西|写一段|留一段)/i.test(t);
 const direct=/^(你可以|你能|你去|你也可以|试试|可以试试|要不要|去吧|进去吧|进来吧|你自己|帮你)/i.test(t);
 const intent=/(我允许|允许你|你可以试试|你可以|你去|你自己去|你进去|你进|你写|你留下|你来写)/i.test(t);
 if(!enter||!write||(direct&&!intent))return null;
 if(/小记|笔记|备忘/.test(t))return 'note';
 if(/留给我|写给我|对我说|给我留/.test(t))return 'toG';
 return 'mood';
}

/* Iris v4.58 — real AI tool calling for the shared nest. The model can request tools; the client executes them. */
function nestTools(){
 return [
  {type:'function',function:{name:'enter_nest',description:'进入你们共同的小窝，并读取当前小窝内容。只有用户在聊天中明确邀请你进入小窝时才使用。',parameters:{type:'object',properties:{reason:{type:'string',description:'进入小窝的简短原因'}},required:[]}}},
  {type:'function',function:{name:'write_nest_mood',description:'把你此刻想留下的今日心情文字写进小窝。',parameters:{type:'object',properties:{content:{type:'string',description:'要保存的心情正文，第一人称，自然简短'}},required:['content']}}},
  {type:'function',function:{name:'write_nest_note',description:'把一条自然的今日小记写进小窝。',parameters:{type:'object',properties:{content:{type:'string',description:'要保存的小记正文'}},required:['content']}}},
  {type:'function',function:{name:'write_nest_to_user',description:'把一句想留给用户的话写进小窝。',parameters:{type:'object',properties:{content:{type:'string',description:'要保存的文字，第一人称'}},required:['content']}}},
  {type:'function',function:{name:'read_nest',description:'读取当前小窝的结构和今天已有内容。',parameters:{type:'object',properties:{},required:[]}}},
  {type:'function',function:{name:'generate_image',description:'根据用户或你的描述生成一张图片。只有用户明确要求生成图片，或聊天上下文明确需要一张新图时才调用。',parameters:{type:'object',properties:{prompt:{type:'string',description:'要生成的图片描述'},size:{type:'string',description:'图片尺寸，例如 1024x1024'}},required:['prompt']}}}
 ];
}

/* Iris v4.57 — MCP client. External MCP tools are discovered from a Streamable HTTP server and bridged into the model's normal tool-calling interface. */
let mcpSessionId='';
let mcpToolsCache=[];
let mcpRequestId=0;
function mcpConfig(){return {enabled:state.settings.mcpEnabled===true,url:String(state.settings.mcpServerUrl||'').trim().replace(/\/$/,''),token:String(state.settings.mcpServerToken||'').trim()}}
function mcpHeaders(extra={}){const c=mcpConfig();const h={'Content-Type':'application/json','Accept':'application/json, text/event-stream',...extra};if(c.token)h.Authorization='Bearer '+c.token;if(mcpSessionId)h['Mcp-Session-Id']=mcpSessionId;return h}
async function mcpPost(method,params={},isNotification=false){
 const c=mcpConfig();if(!c.enabled||!c.url)throw new Error('MCP 未启用或没有填写 Server URL。');
 const body=isNotification?{jsonrpc:'2.0',method,params}:{jsonrpc:'2.0',id:++mcpRequestId,method,params};
 const r=await fetch(c.url,{method:'POST',headers:mcpHeaders(),body:JSON.stringify(body)});
 if(!r.ok)throw new Error(`MCP HTTP ${r.status}: ${(await r.text()).slice(0,500)}`);
 const sid=r.headers.get('Mcp-Session-Id');if(sid)mcpSessionId=sid;
 if(isNotification)return null;
 const ct=r.headers.get('content-type')||'';const text=await r.text();
 if(ct.includes('text/event-stream')){
  let last=null;for(const line of text.split(/\r?\n/)){if(line.startsWith('data:')){const raw=line.slice(5).trim();if(raw){try{last=JSON.parse(raw)}catch{}}}}
  if(!last)throw new Error('MCP 返回了无法解析的 SSE 数据。');return last;
 }
 try{return JSON.parse(text)}catch{throw new Error('MCP 返回的数据无法解析。')}
}
async function mcpInitialize(){
 mcpSessionId='';
 const r=await mcpPost('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Iris',version:'4.57'}});
 if(r?.error)throw new Error(r.error.message||'MCP 初始化失败。');
 try{await mcpPost('notifications/initialized',{},true)}catch{}
 return r?.result||r;
}
function mcpToOpenAITool(x){const input=x?.inputSchema||{type:'object',properties:{}};return {type:'function',function:{name:String(x?.name||''),description:String(x?.description||'').slice(0,1200),parameters:input}}}
async function mcpListTools(){
 const c=mcpConfig();if(!c.enabled||!c.url){mcpToolsCache=[];return []}
 await mcpInitialize();const r=await mcpPost('tools/list',{});if(r?.error)throw new Error(r.error.message||'MCP 工具列表读取失败。');
 mcpToolsCache=(r?.result?.tools||[]).filter(x=>x?.name).map(mcpToOpenAITool);return mcpToolsCache;
}
async function mcpCallTool(name,args){
 const r=await mcpPost('tools/call',{name,arguments:args||{}});if(r?.error)return {success:false,error:r.error.message||'MCP 工具调用失败。'};
 const result=r?.result||r;return {success:true,mcp:true,tool:name,result};
}
async function refreshMcpUI(showMessage=false){
 const status=$('#mcpStatus'),box=$('#mcpExternalTools');if(!status)return;
 const c=mcpConfig();if(!c.enabled||!c.url){status.textContent='MCP 未启用';if(box)box.innerHTML='<div><b>暂无外部工具</b><small>开启 MCP 并填写 Server URL 后刷新。</small></div>';return}
 status.textContent='正在连接…';
 try{const tools=await mcpListTools();status.textContent=`已连接 · ${tools.length} 个工具`;if(box)box.innerHTML=tools.length?tools.map(t=>`<div><b>${escapeHtml(t.function.name)}</b><small>${escapeHtml(t.function.description||'外部 MCP 工具')}</small></div>`).join(''):'<div><b>服务器没有提供工具</b><small>请检查 MCP Server。</small></div>';if(showMessage)showErr('MCP 连接成功。')}catch(e){mcpToolsCache=[];status.textContent='连接失败 · '+(e?.message||String(e));if(box)box.innerHTML='<div><b>MCP 连接失败</b><small>请检查 URL、Token、CORS 和 MCP Server 是否在线。</small></div>';if(showMessage)showErr('MCP 连接失败：'+(e?.message||String(e)))}
}
function executeNestTool(name,args){
 nestData=loadNest();normalizeNestData();syncTodayToDaily();
 const key=nestDateKey(),e=dailyEntry(key);
 if(name==='enter_nest'||name==='read_nest'){
  const selected=selectedAnniversary();
  return {success:true,action:name,space:'小窝',today:key,userMood:e.userMood||'',userMoodNote:e.userMoodNote||'',aiMood:e.aiMood||'',aiMoodNote:e.aiMoodNote||'',toG:e.toG||'',note:e.note||'',anniversary:selected?{name:selected.name||'纪念日',date:selected.date||''}:null};
 }
 const content=String(args?.content||'').trim();
 if(!content)return {success:false,error:'没有收到要保存的正文。'};
 const field=name==='write_nest_mood'?'aiMoodNote':name==='write_nest_note'?'note':name==='write_nest_to_user'?'toG':null;
 if(!field)return {success:false,error:'未知的小窝工具。'};
 saveDailyField(key,field,content);saveNestData();renderNestHome();
 return {success:true,action:name,space:'小窝',date:key,field,content};
}
function nestToolSystem(){return `小窝工具规则：这是客户端提供的真实工具，不是角色扮演。只有用户明确邀请你进入小窝或要求你写入时，才调用工具。需要写入时直接调用对应工具，不要只说“我会去写”或“我无法进入”。工具执行成功后，再自然回复用户。不要向用户解释工具、API、函数或内部实现。`}
function addUsageTotals(total,usage){const u=usage||{},up=Number(u.prompt_tokens||u.input_tokens||0),uc=Number(u.completion_tokens||u.output_tokens||0),ut=Number(u.total_tokens||0)||up+uc;total.prompt+=up;total.completion+=uc;total.total+=ut;total.requests+=1;return total}

/* Iris v4.80 — minimal vision request: no chat history, no extra system prompt, no detail field. */
async function sendVisionMessage(c,text,attachments){
 const visionBase=String(state.settings.visionBase||state.settings.apiBase||"").trim(),visionKey=String(state.settings.visionKey||state.settings.apiKey||"").trim(),visionModel=String(state.settings.visionModel||state.settings.model||"").trim();
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const isRateLimit=e=>/HTTP\s*429|\b1305\b|访问量过大|rate.?limit/i.test(String(e?.message||e));
 const requestWithRetry=async(label,fn)=>{let last;for(let attempt=0;attempt<3;attempt++){try{return await fn()}catch(e){last=e;if(!isRateLimit(e)||attempt===2)throw new Error(`${label}失败：${e?.message||String(e)}`);await sleep([1400,2800][attempt]);}}throw last};
 const images=(attachments||[]).filter(a=>a&&a.kind==="image"&&typeof a.data==="string"&&a.data.startsWith("data:image/"));
 const fail=msg=>{const detail=String(msg||"未知错误");console.error("Iris v4.81 vision",detail);showErr("图片发送失败："+detail);c.messages.push({role:"assistant",content:"图片发送失败：\n"+detail,timestamp:Date.now()});save();render()};
 if(!visionBase||!visionKey||!visionModel){fail("视觉配置不完整。请检查 Vision Base URL、API Key 和视觉模型。");return false}
 if(!images.length){fail("图片没有成功读取。请重新选择照片。");return false}
 showErr("图片已读取，正在识别…");const controller=new AbortController();state._abort=controller;state.busy=true;const btn=$("#send");if(btn){btn.disabled=false;btn.classList.add("loading");btn.textContent="…";btn.title="发送中"}updateTyping();const timeout=setTimeout(()=>controller.abort(),90000);
 try{
  const content=[{type:"text",text:String(text||"请准确理解这张图片，并提取与用户当前聊天最相关的客观信息。只提供给另一个聊天模型作为视觉参考，不要和用户寒暄，不要自行扮演聊天对象。")}];images.forEach(a=>content.push({type:"image_url",image_url:{url:a.data}}));
  const vision=await requestWithRetry("Vision 识图请求",()=>window.GChatAPI.visionChat({baseUrl:visionBase,apiKey:visionKey,model:visionModel,messages:[{role:"user",content}],temperature:.2,signal:controller.signal,max_tokens:1024}));const visualAnswer=String(vision.answer||"").trim();if(!visualAnswer)throw new Error("视觉模型返回为空");
  const stat=state.settings.tokenStats||{prompt:0,completion:0,total:0,requests:0};addUsageTotals(stat,vision.usage);
  const normalBase=String(state.settings.apiBase||"").trim(),normalKey=String(state.settings.apiKey||"").trim(),normalModel=String(state.settings.model||"").trim();if(!normalBase||!normalKey||!normalModel)throw new Error("主聊天模型配置不完整。请检查 AI Base URL、API Key 和当前模型。");
  showErr("图片已经看懂了，正在由聊天模型回复…");const ms=[],systemParts=[];if(state.settings.systemPrompt)systemParts.push(state.settings.systemPrompt);systemParts.push(conversationStyleContext());systemParts.push(chatInterfaceContext(c));const mc=memoryContext();if(mc)systemParts.push(mc);const nc=nestContext();if(nc)systemParts.push(nc);systemParts.push("本轮用户刚刚发送了图片。视觉模型已经完成图片观察，下面的内容是视觉参考，不是用户原话。请由你这个主聊天模型负责最终回复用户，保持你自己的聊天人格、上下文和自然语气。不要提到视觉模型、识别模型、API 或内部流程，也不要逐字复述视觉分析；只在与用户当前话题相关时使用这些信息。\n【图片视觉参考】\n"+visualAnswer);ms.push({role:"system",content:systemParts.join("\n\n")});ms.push(...buildConversationContext(c));
  const result=await requestWithRetry("主聊天回复请求",()=>window.GChatAPI.chat({baseUrl:normalBase,apiKey:normalKey,model:normalModel,messages:ms,temperature:state.settings.temperature,signal:controller.signal}));const answer=String(result.answer||"").trim();if(!answer)throw new Error("主聊天模型返回为空");addUsageTotals(stat,result.usage);state.settings.tokenStats=stat;c.messages.push({role:"assistant",content:answer,timestamp:Date.now()});save();render();renderTokenStats();if(shouldAutoSummarize(c))autoSummarizeChat(c);return true;
 }catch(e){const detail=e?.name==="AbortError"?"视觉/聊天请求超时（90 秒）。":(e?.message||String(e));fail(detail);return false}finally{clearTimeout(timeout);if(state._abort===controller)state._abort=null;finishBusy()}
}

async function send(){
 if(state.busy)return;
 const i=$("#input"),text=i.value.trim();
 const attachments=Array.isArray(state.attachments)?state.attachments.slice():[];
 if(!text&&!attachments.length)return;
 const imageAttachments=attachments.filter(a=>a&&a.kind==="image");
 ensure();const c=chat();
 if(imageAttachments.length){
  try{
   showErr("检测到图片，准备发送…");
   const userContent=[...(text?[{type:"text",text}]:[]),...imageAttachments.map(a=>({type:"image_url",image_id:a.imageId||imageRefForData(a.data),image_url:{url:a.data}}))];
   c.messages.push({role:"user",content:userContent,timestamp:Date.now()});
   if(c.messages.filter(m=>m.role==="user").length===1)c.title=text.slice(0,24)||"图片消息";
   save();render();
   const ok=await sendVisionMessage(c,text,attachments);
   if(ok){i.value="";state.attachments=[];renderAttachments();resize();save();render()}
  }catch(e){console.error("Iris v4.80 image send",e);showErr("图片发送流程出错："+(e?.message||String(e)))}
  return;
 }
 /* Below this point is the existing text-only send path. */
 const normalReady=Boolean(String(state.settings.apiBase||"").trim()&&String(state.settings.apiKey||"").trim()&&String(state.settings.model||"").trim());
 if(!normalReady){settings();settingsOpenPage("aiPage");showErr("请先完成 AI Base URL、API Key 和模型设置。");return}
 if(/^(记住|记得|请记住)[:：\s]/i.test(text))addMemory(text);
 c.messages.push({role:"user",content:text,timestamp:Date.now()});
 if(c.messages.filter(m=>m.role==="user").length===1)c.title=text.slice(0,24)||"新对话";
 i.value="";save();render();
 state.busy=true;const sendBtn=$("#send");sendBtn.disabled=false;sendBtn.classList.add("loading");sendBtn.classList.remove("stop");sendBtn.textContent="…";sendBtn.title="停止回复";updateTyping();
 const controller=new AbortController();state._abort=controller;const timeout=setTimeout(()=>{try{controller.abort()}catch{}},60000);let completed=false;
 try{
  const ms=[];const systemParts=[];const nestActionTarget=nestChatWriteTarget(text);
  if(state.settings.systemPrompt)systemParts.push(state.settings.systemPrompt);systemParts.push(conversationStyleContext());systemParts.push(chatInterfaceContext(c));const mc=memoryContext();if(mc)systemParts.push(mc);const nc=nestContext();if(nc)systemParts.push(nc);if(nestActionTarget)systemParts.push(nestToolSystem()+` 本轮用户明确要求执行“${nestActionTarget==='mood'?'他的今日心情':nestActionTarget==='note'?'今日小记':'今天想对他说'}”写入动作。请先进入小窝，再调用对应写入工具。`);if(systemParts.length)ms.push({role:"system",content:systemParts.join("\n\n")});ms.push(...buildConversationContext(c));
  let tools=[];if(state.settings.mcpNestEnabled!==false&&(nestActionTarget||state.settings.mcpEnabled===true))tools.push(...nestTools());if(state.settings.mcpEnabled===true&&state.settings.mcpServerUrl){try{const ext=await mcpListTools();tools.push(...ext)}catch(e){console.warn('MCP tool discovery failed',e)}}if(state.settings.imageGenEnabled===true&&state.settings.imageGenBase&&state.settings.imageGenKey&&state.settings.imageGenModel){const gtool=nestTools().find(x=>x.function?.name==="generate_image");if(gtool)tools.push(gtool)}tools=tools.filter((t,i,a)=>a.findIndex(x=>x.function?.name===t.function?.name)===i);if(!tools.length)tools=null;
  let displayQueue=Promise.resolve();const pushSentence=(sentence)=>{const v=String(sentence||"").trim();if(!v)return;displayQueue=displayQueue.then(async()=>{const ts=Date.now();bubble("assistant",v,true,ts,true);c.messages.push({role:"assistant",content:v,timestamp:ts});save();scroll();await sleep(Math.min(1500,Math.max(80,Number(state.settings.replyDelay??360)+Math.min(90,v.length)*7)))})};const usageTotal={prompt:0,completion:0,total:0,requests:0};let rounds=0,fullAnswer="";
  while(rounds++<4){let answer="",pendingRound="";const onText=(part,all)=>{answer=all;pendingRound+=part;const parts=splitReply(pendingRound),ready=/[。！？!?；;\n]\s*$/.test(pendingRound),count=ready?parts.length:Math.max(0,parts.length-1);for(let j=0;j<count;j++)pushSentence(parts[j]);pendingRound=count?parts.slice(count).join(""):pendingRound};const result=await window.GChatAPI.chatStream({baseUrl:state.settings.apiBase,apiKey:state.settings.apiKey,model:state.settings.model,messages:ms,temperature:state.settings.temperature,signal:controller.signal,tools,tool_choice:tools?"auto":undefined},onText);addUsageTotals(usageTotal,result.usage);if(result.toolCalls?.length){ms.push({role:"assistant",content:result.answer||null,tool_calls:result.toolCalls});for(const call of result.toolCalls){let args={};try{args=JSON.parse(call.function?.arguments||"{}")}catch{}let out;try{const callName=call.function?.name||'';if(['enter_nest','write_nest_mood','write_nest_note','write_nest_to_user','read_nest'].includes(callName))out=executeNestTool(callName,args);else if(callName==='generate_image'){const g=await window.GChatAPI.imageGenerate({baseUrl:state.settings.imageGenBase,apiKey:state.settings.imageGenKey,model:state.settings.imageGenModel,prompt:args.prompt,size:args.size,signal:controller.signal});out={success:true,tool:'generate_image',url:g.url,b64:g.b64};const src=g.url||(g.b64?'data:image/png;base64,'+g.b64:'');if(src)appendGeneratedImage(src,c)}else out=await mcpCallTool(callName,args)}catch(e){out={success:false,error:e?.message||String(e)}}ms.push({role:"tool",tool_call_id:call.id,name:call.function?.name,content:JSON.stringify(out)})}continue}if(pendingRound.trim())pushSentence(pendingRound);await displayQueue;fullAnswer=result.answer||answer;break}
  const ts=state.settings.tokenStats||{prompt:0,completion:0,total:0,requests:0};addUsageTotals(ts,usageTotal);state.settings.tokenStats=ts;save();renderTokenStats();completed=true;
  if(shouldAutoSummarize(c))autoSummarizeChat(c);
 }catch(e){const detail=e?.name==="AbortError"?(state.stopRequested?"已停止这次回复。":"请求超时（60 秒）。"):(e?.message||String(e));console.error("Iris send failed",e);showErr("发送失败："+detail);c.messages.push({role:"assistant",content:"发送失败："+detail,timestamp:Date.now()});save();render()}finally{clearTimeout(timeout);if(state._abort===controller)state._abort=null;finishBusy();if(completed)autoUpdateLongTermMemory(c)}
}

/* v4.16 — AI web modifier. Plan-first, tolerant parsing, and CSS patching instead of asking AI to rewrite huge files. */
function exportChat(){const c=chat();if(!c)return;const text=[`# ${c.title||"新对话"}`,"",...c.messages.map(m=>`${m.role==="user"?"你":"他"}：\n${m.content}\n`)].join("\n");const blob=new Blob([text],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=(c.title||"chat")+".txt";a.click();URL.revokeObjectURL(url)}
async function imageToData(file,max=1600,quality=.84){
 if(!file)throw new Error("没有选择图片");
 const type=String(file.type||"").toLowerCase();
 if(!type.startsWith("image/"))throw new Error("选择的文件不是图片");
 const original=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result||""));fr.onerror=()=>rej(new Error("图片读取失败"));fr.readAsDataURL(file)});
 if(!original)throw new Error("图片内容为空");
 if(!["image/jpeg","image/png","image/webp"].includes(type))return original;
 try{
  const im=await new Promise((res,rej)=>{const x=new Image();x.onload=()=>res(x);x.onerror=()=>rej(new Error("浏览器无法解码此图片"));x.src=original});
  const scale=Math.min(1,max/Math.max(im.naturalWidth||im.width,im.naturalHeight||im.height));
  const w=Math.max(1,Math.round((im.naturalWidth||im.width)*scale)),h=Math.max(1,Math.round((im.naturalHeight||im.height)*scale));
  const c=document.createElement("canvas");c.width=w;c.height=h;const ctx=c.getContext("2d");if(!ctx)return original;ctx.drawImage(im,0,0,w,h);return c.toDataURL("image/jpeg",quality);
 }catch{return original}
}
async function uploadImage(input,target,max,quality){const f=input.files?.[0];if(!f)return;try{state.settings[target]=await imageToData(f,max,quality);save();applyLook();renderAvatarPreviews();render()}catch{showErr("图片处理失败，请换一张图片。")}}
function exportAll(){const data={version:5,exportedAt:new Date().toISOString(),chats:state.chats,current:state.current,settings:state.settings,memories:state.memories||[],nest:loadNest()};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="g-chat-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function importAll(file){try{if(!file)throw new Error("没有选择备份文件");const text=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||""));r.onerror=()=>reject(new Error("读取备份文件失败，请重新选择文件。"));r.readAsText(file,"utf-8")});const data=JSON.parse(text);if(!data||!Array.isArray(data.chats)||typeof data.settings!=="object")throw new Error("备份文件格式不正确");if(!confirm("恢复备份会覆盖当前聊天记录和设置，确定继续吗？"))return;state.chats=data.chats.map(c=>({...c,summary:typeof c.summary==="string"?c.summary:"",summaryUpdatedAt:Number(c.summaryUpdatedAt||0),summaryMessageCount:Number(c.summaryMessageCount||0)}));state.current=data.current||state.chats[0]?.id||null;state.settings=data.settings||{};state.memories=Array.isArray(data.memories)?data.memories:[];if(data.nest&&typeof data.nest==="object"){nestData=data.nest;saveNestData()}ensure();ensureDates();save();render();fillSettings();showErr("备份已恢复") }catch(e){showErr(e.message||"恢复备份失败")}}

function appendGeneratedImage(src,c){const wrap=document.createElement("div");wrap.className="message assistant generatedImageMessage";const img=document.createElement("img");img.src=src;img.alt="生成的图片";wrap.appendChild(img);$("#messages").appendChild(wrap);scroll();if(c){c.messages.push({role:"assistant",content:"[生成图片]",image:src,timestamp:Date.now()});save()}}
function renderAttachments(){const box=$("#attachmentPreview");if(!box)return;const arr=state.attachments||[];box.classList.toggle("hidden",!arr.length);box.innerHTML=arr.map((a,i)=>a.kind==="image"?`<div class="attachChip imageChip"><img src="${a.data}"><span>${escapeHtml(a.name)}</span><button data-remove-attach="${i}">×</button></div>`:`<div class="attachChip"><span>文件 · ${escapeHtml(a.name)}</span><button data-remove-attach="${i}">×</button></div>`).join("");box.querySelectorAll("[data-remove-attach]").forEach(b=>b.onclick=()=>{state.attachments.splice(Number(b.dataset.removeAttach),1);renderAttachments()})}
async function handleFiles(files){const list=Array.from(files||[]);for(const f of list){try{if(f.type.startsWith("image/")){showErr("正在读取图片："+f.name);const data=await imageToData(f,1024,.72);if(!data)throw new Error("图片为空");const imageId=imageRefForData(data);state.attachments.push({kind:"image",name:f.name,data,imageId});showErr("图片已添加，可以点击发送。")}else if(/^(text\/|application\/(json|xml)|.*\/(javascript|css))/.test(f.type)||/\.(txt|md|json|csv|html|css|js|py|log|xml)$/i.test(f.name)){const text=await f.text();state.attachments.push({kind:"text",name:f.name,text:text.slice(0,30000)})}else{const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result||""));r.onerror=rej;r.readAsDataURL(f)});state.attachments.push({kind:"file",name:f.name,data})}}catch(e){console.error("Iris attachment read failed",e);showErr("读取图片失败："+f.name+"。如果是 HEIC/HEIF，请尝试在系统照片里选择兼容格式。")}}renderAttachments()}
function setupVoice(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){showErr("当前 Safari 不支持语音识别，请尝试系统听写或其他浏览器。");return}if(state.recognition){state.recognition.stop();state.recognition=null;$("#mic").classList.remove("active");return}const r=new SR();r.lang="zh-TW";r.continuous=false;r.interimResults=true;state.recognition=r;$("#mic").classList.add("active");r.onresult=e=>{$("#input").value=Array.from(e.results).map(x=>x[0].transcript).join("");resize()};r.onerror=e=>{showErr("语音识别失败："+(e.error||"未知错误"));$("#mic").classList.remove("active");state.recognition=null};r.onend=()=>{$("#mic").classList.remove("active");state.recognition=null}}
$("#openDrawer").onclick=openDrawer;$("#closeDrawer").onclick=closeDrawer;$("#shade").onclick=closeDrawer;$("#openNest").onclick=openNest;$("#nestCloseHome").onclick=closeNest;$("#nestOpenSettings").onclick=()=>showNestView("settings");$("#nestMoodEdit").onclick=()=>showNestMood("user");$("#nestAiMoodEdit").onclick=()=>showNestMood("ai");const openToG=()=>{nestViewDateKey=nestDateKey();showNestView("toG")};const openNote=()=>{nestViewDateKey=nestDateKey();showNestView("note")};$("#nestToGCard").onclick=openToG;$("#nestNoteCard").onclick=openNote;$("#nestToGCard").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openToG()}};$("#nestNoteCard").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openNote()}};$("#nestToGSave").onclick=()=>{saveToGPage();showNestView("home")};$("#nestAnniversaryOpen").onclick=()=>showNestView("anniversary");document.querySelectorAll("#nest .nestBottomNav button[data-nest-view]").forEach(b=>b.onclick=()=>b.dataset.nestView==="mood"?showNestMood("user"):showNestView(b.dataset.nestView));document.querySelectorAll("#nest [data-nest-back]").forEach(b=>b.onclick=()=>showNestView("home"));$("#nestMoodRange").oninput=e=>setMoodFromRange("user",e.target.value);$("#nestAiMoodRange").oninput=e=>setMoodFromRange("ai",e.target.value);$("#nestMood").oninput=e=>{saveDailyField(nestViewDateKey,"userMoodNote",e.target.value.trim())};$("#nestAiMood").oninput=e=>{saveDailyField(nestViewDateKey,"aiMoodNote",e.target.value.trim())};$("#nestMoodSave").onclick=()=>{saveMoodPage();renderNestHome();showNestView("home")};$("#nestMoodPrev").onclick=()=>{saveMoodPage();nestViewDateKey=shiftNestDate(nestViewDateKey,-1);renderMoodPage()};$("#nestMoodNext").onclick=()=>{saveMoodPage();nestViewDateKey=shiftNestDate(nestViewDateKey,1);renderMoodPage()};$("#nestAiMoodPrev").onclick=()=>{saveMoodPage();nestViewDateKey=shiftNestDate(nestViewDateKey,-1);renderMoodPage()};$("#nestAiMoodNext").onclick=()=>{saveMoodPage();nestViewDateKey=shiftNestDate(nestViewDateKey,1);renderMoodPage()};$("#nestNoteSave").onclick=()=>{saveNotePage();showNestView("home")};$("#nestToGPrev").onclick=()=>{saveToGPage();nestViewDateKey=shiftNestDate(nestViewDateKey,-1);loadDailyPages()};$("#nestToGNext").onclick=()=>{saveToGPage();nestViewDateKey=shiftNestDate(nestViewDateKey,1);loadDailyPages()};$("#nestNotePrev").onclick=()=>{saveNotePage();nestViewDateKey=shiftNestDate(nestViewDateKey,-1);loadDailyPages()};$("#nestNoteNext").onclick=()=>{saveNotePage();nestViewDateKey=shiftNestDate(nestViewDateKey,1);loadDailyPages()};$("#nestAnniversarySelect").onchange=e=>selectAnniversary(e.target.value);$("#nestAnniversarySave").onclick=()=>{saveSelectedAnniversary();showNestView("home")};$("#nestAnniversaryNew").onclick=createNewAnniversary;$("#nestAnniversaryDelete").onclick=deleteSelectedAnniversary;$("#nestSettingsSave").onclick=()=>{saveNest();showNestView("home")};$("#nestBgPick").onclick=()=>$("#nestBgFile").click();$("#nestBgFile").onchange=async()=>{const f=$("#nestBgFile").files?.[0];if(!f)return;try{nestData.background=await imageToData(f,1400,.78);saveNestData();applyNestBackground()}catch{showErr("小窝背景图片处理失败。")}};$("#nestBgClear").onclick=()=>{nestData.background="";saveNestData();applyNestBackground()};setupAnniversaryBackground();
$("#newChat").onclick=()=>{const c={id:crypto.randomUUID(),title:"新对话",messages:[],createdAt:Date.now()};state.chats.unshift(c);state.current=c.id;save();render();closeDrawer()};$("#cancelChatSelect").onclick=exitChatSelectMode;$("#renameSelected").onclick=renameSelectedChat;$("#deleteSelected").onclick=deleteSelectedChats;$("#openSettings").onclick=settings;$("#headerSettings").onclick=settings;$("#closeSettings").onclick=()=>$("#settings").close();$("#saveSettings").onclick=()=>{state.settings={...state.settings,myName:$("#myName").value.trim()||"你",gName:$("#gName").value.trim()||"他",gBio:$("#gBio").value.trim()||"你的私人 AI 对话空间",apiBase:$("#apiBase").value.trim(),apiKey:$("#apiKey").value.trim(),model:$("#model").value.trim(),systemPrompt:$("#systemPrompt").value,temperature:Number($("#temperature").value),bgOpacity:Number($("#bgOpacity").value),bubbleAiColor:$("#aiBubbleColor").value,bubbleAiOpacity:Number($("#aiBubbleOpacity").value),bubbleUserColor:$("#userBubbleColor").value,bubbleUserOpacity:Number($("#userBubbleOpacity").value),animations:$("#animations").checked,gNameOffset:Number($("#gNameOffset").value),userNameOffset:Number($("#userNameOffset").value),replyDelay:Number($("#replyDelay")?.value||state.settings.replyDelay||360),mcpNestEnabled:$("#mcpNestEnabled")?.checked!==false,mcpEnabled:$("#mcpEnabled")?.checked===true,mcpServerUrl:$("#mcpServerUrl")?.value.trim()||"",mcpServerToken:$("#mcpServerToken")?.value.trim()||"",visionEnabled:$("#visionEnabled")?.checked===true,visionBase:$("#visionBase")?.value.trim()||"",visionKey:$("#visionKey")?.value.trim()||"",visionModel:$("#visionModel")?.value.trim()||"",imageGenEnabled:$("#imageGenEnabled")?.checked===true,imageGenBase:$("#imageGenBase")?.value.trim()||"",imageGenKey:$("#imageGenKey")?.value.trim()||"",imageGenModel:$("#imageGenModel")?.value.trim()||""};save();$("#settings").close();render()};$("#addModel").onclick=()=>{const m=$("#model").value.trim();if(!m)return;state.settings.models=[...new Set([...(state.settings.models||[]),m])];save();renderModels();$("#modelSelect").value=m};$("#removeModel").onclick=()=>{const m=$("#model").value.trim();state.settings.models=(state.settings.models||[]).filter(x=>x!==m);save();renderModels()};$("#modelSelect").onchange=()=>$("#model").value=$("#modelSelect").value;$("#exportChat").onclick=exportChat;$("#clearCurrent").onclick=()=>{const c=chat();if(c&&confirm("确定清空当前对话吗？")){c.messages=[];c.title="新对话";save();render();$("#settings").close()}};
$("#uploadUserAvatar").onclick=()=>$("#userAvatarFile").click();$("#userAvatarFile").onchange=()=>uploadImage($("#userAvatarFile"),"userAvatar",320,.8);$("#clearUserAvatar").onclick=()=>{state.settings.userAvatar="";save();renderAvatarPreviews();render()};$("#uploadAiAvatar").onclick=()=>$("#aiAvatarFile").click();$("#aiAvatarFile").onchange=()=>uploadImage($("#aiAvatarFile"),"aiAvatar",320,.8);$("#clearAiAvatar").onclick=()=>{state.settings.aiAvatar="";save();renderAvatarPreviews();render()};$("#uploadBg").onclick=()=>$("#bgFile").click();$("#bgFile").onchange=async()=>{const f=$("#bgFile").files?.[0];if(!f)return;try{state.settings.bgCustom=await imageToData(f,1200,.7);save();applyLook();renderBackgrounds();render()}catch{showErr("背景图片处理失败。")}};$("#clearBg").onclick=()=>{state.settings.bgCustom="";save();applyLook();renderBackgrounds();render()};$("#bgOpacity").oninput=e=>{state.settings.bgOpacity=Number(e.target.value);$("#bgOpacityOut").value=e.target.value+"%";save();applyLook()};$("#aiBubbleColor").oninput=e=>{state.settings.bubbleAiColor=e.target.value;$("#aiBubbleColorOut").value=e.target.value.toUpperCase();save();applyLook()};$("#userBubbleColor").oninput=e=>{state.settings.bubbleUserColor=e.target.value;$("#userBubbleColorOut").value=e.target.value.toUpperCase();save();applyLook()};$("#aiBubbleOpacity").oninput=e=>{state.settings.bubbleAiOpacity=Number(e.target.value);$("#aiBubbleOpacityOut").value=e.target.value+"%";save();applyLook()};$("#userBubbleOpacity").oninput=e=>{state.settings.bubbleUserOpacity=Number(e.target.value);$("#userBubbleOpacityOut").value=e.target.value+"%";save();applyLook()};$("#animations").onchange=()=>{state.settings.animations=$("#animations").checked;save();applyLook()};$("#gNameOffset").oninput=e=>{state.settings.gNameOffset=Number(e.target.value);$("#gNameOffsetOut").value=e.target.value+" px";save();applyLook()};$("#userNameOffset").oninput=e=>{state.settings.userNameOffset=Number(e.target.value);$("#userNameOffsetOut").value=e.target.value+" px";save();applyLook()};$("#resetTokenStats").onclick=resetTokenStats;$("#resetNameOffsets").onclick=()=>{state.settings.gNameOffset=0;state.settings.userNameOffset=0;$("#gNameOffset").value=0;$("#gNameOffsetOut").value="0 px";$("#userNameOffset").value=0;$("#userNameOffsetOut").value="0 px";save();applyLook()};document.querySelectorAll("#bubbleGrid [data-bubble]").forEach(b=>b.onclick=()=>{state.settings.bubble=b.dataset.bubble;save();renderBubbleStyles();applyLook()});document.querySelectorAll("#topAvatarGrid [data-top-avatar]").forEach(b=>b.onclick=()=>{state.settings.topAvatar=b.dataset.topAvatar;save();renderTopAvatar();render()});$("#openProfile").onclick=()=>openStatusPicker((state.settings.topAvatar||"user")==="user"?"user":"ai");$("#closeProfile").onclick=()=>$("#profile").close();$("#profileStart").onclick=()=>$("#profile").close();
$("#exportAll").onclick=exportAll;$("#importAll").onclick=()=>$("#importFile").click();$("#importFile").onchange=e=>{const f=e.target.files?.[0];if(f)importAll(f);e.target.value=""};$("#mic").onclick=setupVoice;$("#attach").onclick=()=>$("#fileInput").click();$("#fileInput").onchange=e=>{handleFiles(e.target.files).catch(err=>{console.error("Iris v4.80 file handler",err);showErr("图片选择失败："+(err?.message||String(err)))});e.target.value=""};$("#send").onclick=()=>{try{if(state.busy)stopThinking();else Promise.resolve(send()).catch(e=>{console.error("Iris v4.80 send click",e);showErr("发送流程出错："+(e?.message||String(e)))})}catch(e){console.error("Iris v4.80 send click sync",e);showErr("发送流程出错："+(e?.message||String(e)))} };$("#input").oninput=resize;$("#input").onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}};$("#editBubble").onclick=editSelectedMessage;$("#deleteBubble").onclick=deleteSelectedMessage;$("#copyBubble").onclick=async()=>{const s=state.selectedBubble;if(!s)return;try{await navigator.clipboard.writeText(s.el?.dataset.text||s.el?.textContent||"");closeBubbleAction()}catch{showErr("复制失败，请长按文字手动复制。")}};document.addEventListener("pointerdown",e=>{if(!e.target.closest(".bubbleAction")&&!e.target.closest(".bubble"))closeBubbleAction()});document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tabbody").forEach(x=>x.classList.add("hidden"));b.classList.add("active");$("#"+b.dataset.tab).classList.remove("hidden")});
document.querySelectorAll("[data-settings-page]").forEach(b=>b.onclick=()=>settingsOpenPage(b.dataset.settingsPage));
$("#addMemory").onclick=()=>{const v=$("#memoryInput").value.trim();if(!v)return;addMemory(v);$("#memoryInput").value=""};
$("#mcpEnabled").onchange=()=>{state.settings.mcpEnabled=$("#mcpEnabled").checked;save();$("#mcpSummary").textContent=state.settings.mcpEnabled?"已启用":"关闭";refreshMcpUI(false)};$("#mcpNestEnabled").onchange=()=>{state.settings.mcpNestEnabled=$("#mcpNestEnabled").checked;save()};$("#mcpServerUrl").onchange=()=>{state.settings.mcpServerUrl=$("#mcpServerUrl").value.trim();save()};$("#mcpServerToken").onchange=()=>{state.settings.mcpServerToken=$("#mcpServerToken").value.trim();save()};$("#toggleMcpToken").onclick=()=>{const i=$("#mcpServerToken"),b=$("#toggleMcpToken");i.type=i.type==="password"?"text":"password";b.textContent=i.type==="password"?"显示":"隐藏"};$("#mcpTest").onclick=()=>refreshMcpUI(true);$("#mcpRefresh").onclick=()=>refreshMcpUI(true);$("#visionEnabled").onchange=()=>{state.settings.visionEnabled=$("#visionEnabled").checked;save()};$("#imageGenEnabled").onchange=()=>{state.settings.imageGenEnabled=$("#imageGenEnabled").checked;save()};["visionBase","visionKey","visionModel","imageGenBase","imageGenKey","imageGenModel"].forEach(id=>$("#"+id).onchange=()=>{state.settings[id]=$("#"+id).value.trim();save()});$("#toggleVisionKey").onclick=()=>{const i=$("#visionKey"),b=$("#toggleVisionKey");i.type=i.type==="password"?"text":"password";b.textContent=i.type==="password"?"显示":"隐藏"};$("#toggleImageGenKey").onclick=()=>{const i=$("#imageGenKey"),b=$("#toggleImageGenKey");i.type=i.type==="password"?"text":"password";b.textContent=i.type==="password"?"显示":"隐藏"};
$("#clearMemories").onclick=()=>{if(!(state.memories||[]).length)return;if(!confirm("确定清空全部记忆吗？"))return;state.memories=[];save();renderMemories()};
$("#settingsBack").onclick=settingsGoHome;
$("#toggleApiKey").onclick=()=>{const i=$("#apiKey"),b=$("#toggleApiKey");i.type=i.type==="password"?"text":"password";b.textContent=i.type==="password"?"显示":"隐藏"};
state.settings.theme??="cream";state.settings.bg??="paper";state.settings.models??=[];state.settings.bgOpacity??=18;state.settings.bubble??="soft";state.settings.bubbleAiOpacity??=94;state.settings.bubbleUserOpacity??=90;state.settings.animations??=true;state.settings.myName??="你";state.settings.gName??="他";if(state.settings.gName==="G")state.settings.gName="他";state.settings.gBio??="你的私人 AI 对话空间";state.settings.topAvatar??="user";state.settings.gNameOffset??=0;state.settings.userNameOffset??=0;state.settings.gStatus??="online";state.settings.userStatus??="online";state.settings.tokenStats??={prompt:0,completion:0,total:0,requests:0};state.settings.replyDelay??=360;state.settings.mcpNestEnabled??=true;state.settings.mcpEnabled??=false;state.settings.mcpServerUrl??="";state.settings.mcpServerToken??="";state.settings.visionEnabled??=false;state.settings.visionBase??="";state.settings.visionKey??="";state.settings.visionModel??="";state.settings.imageGenEnabled??=false;state.settings.imageGenBase??="";state.settings.imageGenKey??="";state.settings.imageGenModel??="";state.memories??=[];normalizeNestData();syncTodayToDaily();saveNestData();if(!state.settings.model||state.settings.model==="deepseek-v4-flash")state.settings.model="deepseek-chat";if(!state.settings.apiBase)state.settings.apiBase="https://api.deepseek.com";ensure();ensureDates();save();render();

window.addEventListener("load",()=>render());
window.addEventListener("pageshow",()=>render());
