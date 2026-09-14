# AI Chat PWA

一個可以直接放在手機上使用的 OpenAI-compatible AI 聊天 PWA。

## 功能

- 手機端 PWA，可加入主畫面
- 多個聊天
- 串流輸出
- OpenAI-compatible `/chat/completions`
- System Prompt
- Model / Temperature 設定
- 對話與設定儲存在瀏覽器本機
- 不需要自己的後端

## 使用

需要透過 `localhost` 或 HTTPS 執行，直接雙擊 `index.html` 不會正常啟用 PWA / Service Worker。

### 方法一：Python

```bash
cd ai-chat-pwa
python3 -m http.server 8080
```

然後瀏覽器開：

`http://localhost:8080`

### 方法二：Node

```bash
npx serve .
```

## API 設定

例如中轉站提供 OpenAI-compatible API：

- API Base URL：`https://你的中轉站/v1`
- API Key：你的 token
- 模型：中轉站提供的 model ID

程式會呼叫：

`API Base URL + /chat/completions`

如果你的中轉站 URL 已經包含 `/chat/completions`，程式也會自動去掉尾端再補上一次。

## 注意

這個版本把 API Key 放在瀏覽器 LocalStorage，適合「自己用」的情境。

如果之後要給其他人使用，不建議把 API Key 放在前端，應該增加自己的後端代理。
