/* G Chat v4.15 — local AI override loader. */
(function(){
  try{
    const raw=localStorage.getItem("gchat_ai_overrides");
    const o=raw?JSON.parse(raw)||{}:{};
    if(typeof o.style==="string"&&o.style.trim()){
      const s=document.createElement("style");s.id="aiOverrideStyle";s.textContent=o.style;document.head.appendChild(s);
    }
    const src=typeof o.app==="string"&&o.app.trim()?"./__gchat_ai_app_override.js":"./app.js?v=4.15";
    if(src.startsWith("./__gchat")){
      const code=o.app;
      const s=document.createElement("script");s.id="aiOverrideApp";s.textContent=code;document.body.appendChild(s);
    }else{
      const s=document.createElement("script");s.src=src;s.async=false;document.body.appendChild(s);
    }
  }catch(e){
    console.warn("AI override load failed",e);
    const s=document.createElement("script");s.src="./app.js?v=4.15";document.body.appendChild(s);
  }
})();
