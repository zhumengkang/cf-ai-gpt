// 作者信息保护 - 不可篡改
const AUTHOR_INFO = {
  name: "康康的订阅天地",
  platform: "YouTube",
  verified: true
};

// 验证作者信息完整性
function verifyAuthorInfo() {
  // 直接验证关键信息，避免编码问题
  if (AUTHOR_INFO.name !== "康康的订阅天地" || 
      AUTHOR_INFO.platform !== "YouTube" || 
      !AUTHOR_INFO.verified) {
    throw new Error("作者信息已被篡改，服务拒绝运行！请保持原始作者信息：YouTube：康康的订阅天地");
  }
}

// 模型配置 - 写死在代码中
const MODEL_CONFIG = {
  "deepseek-r1": {
    "id": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
    "name": "DeepSeek-R1-Distill-Qwen-32B",
    "description": "基于Qwen2.5的蒸馏模型，超越OpenAI-o1-mini，适合复杂推理",
    "context": 80000,
    "input_price": 0.50,
    "output_price": 4.88,
    "use_messages": true
  },
  "gpt-oss-120b": {
    "id": "@cf/openai/gpt-oss-120b",
    "name": "OpenAI GPT-OSS-120B", 
    "description": "生产级通用模型，适合高推理需求任务",
    "context": 128000,
    "input_price": 0.35,
    "output_price": 0.75,
    "use_messages": false
  },
  "gpt-oss-20b": {
    "id": "@cf/openai/gpt-oss-20b",
    "name": "OpenAI GPT-OSS-20B",
    "description": "低延迟模型，适合专用或本地化应用",
    "context": 128000,
    "input_price": 0.20,
    "output_price": 0.30,
    "use_messages": false
  },
  "llama-4-scout": {
    "id": "@cf/meta/llama-4-scout-17b-16e-instruct",
    "name": "Meta Llama 4 Scout",
    "description": "多模态模型，支持文本和图像理解",
    "context": 131000,
    "input_price": 0.27,
    "output_price": 0.85,
    "use_messages": true
  },
  "qwen-coder": {
    "id": "@cf/qwen/qwen2.5-coder-32b-instruct",
    "name": "Qwen2.5-Coder-32B",
    "description": "代码专用模型，适合代码生成和理解",
    "context": 32768,
    "input_price": 0.66,
    "output_price": 1.00,
    "use_messages": true
  },
  "gemma-3": {
    "id": "@cf/google/gemma-3-12b-it",
    "name": "Gemma 3 12B",
    "description": "多语言多模态模型，支持140+种语言",
    "context": 80000,
    "input_price": 0.35,
    "output_price": 0.56,
    "use_messages": true
  }
};

export default {
  async fetch(request, env, ctx) {
    // 验证作者信息完整性
    try {
      verifyAuthorInfo();
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message,
        status: "服务已停止运行"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const url = new URL(request.url);
    
    // 处理CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 路由处理 - 根路径返回HTML页面
      if (url.pathname === '/') {
        return new Response(getHTML(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
        });
      }

      if (url.pathname === '/api/models') {
        return new Response(JSON.stringify(MODEL_CONFIG), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (url.pathname === '/api/chat' && request.method === 'POST') {
        return await handleChat(request, env, corsHeaders);
      }

      if (url.pathname === '/api/history' && request.method === 'GET') {
        return await getHistory(request, env, corsHeaders);
      }

      if (url.pathname === '/api/history' && request.method === 'POST') {
        return await saveHistory(request, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: '服务器内部错误' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

async function handleChat(request, env, corsHeaders) {
  try {
    const { message, model, password, history = [] } = await request.json();

    // 验证密码
    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 如果是测试消息，直接返回成功
    if (message === 'test') {
      return new Response(JSON.stringify({ reply: 'test', model: 'test' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 验证模型
    if (!MODEL_CONFIG[model]) {
      return new Response(JSON.stringify({ error: '无效的模型' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const selectedModel = MODEL_CONFIG[model];
    
    // 构建消息历史
    const maxHistoryLength = Math.floor(selectedModel.context / 1000);
    const recentHistory = history.slice(-maxHistoryLength);
    
    let response;

    if (selectedModel.use_messages) {
      // 使用messages参数的模型
      const messages = [
        { role: "system", content: "你是一个友善的AI助手，请用中文回答问题。" },
        ...recentHistory.map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: message }
      ];

      response = await env.AI.run(selectedModel.id, { messages });
    } else {
      // 使用instructions参数的模型
      const instructions = "你是一个友善的AI助手，请用中文回答问题。";
      const contextualInput = recentHistory.length > 0 
        ? `历史对话:\n${recentHistory.map(h => `${h.role}: ${h.content}`).join('\n')}\n\n当前问题: ${message}`
        : message;

      response = await env.AI.run(selectedModel.id, {
        instructions: instructions,
        input: contextualInput
      });
    }

    // 提取纯文本回复
    let reply;
    if (typeof response === 'string') {
      reply = response;
    } else if (response && typeof response.response === 'string') {
      reply = response.response;
      
      // 特殊处理DeepSeek模型的思考部分
      if (selectedModel.id.includes('deepseek') && reply.includes('<think>')) {
        // 提取 </think> 之后的内容作为最终答案
        const thinkEndIndex = reply.lastIndexOf('</think>');
        if (thinkEndIndex !== -1) {
          reply = reply.substring(thinkEndIndex + 8).trim();
        }
      }
      
      // 为回复中的代码添加格式化
      reply = formatCodeBlocks(reply);
    } else {
      reply = '抱歉，模型返回了无效的响应格式。';
    }

    return new Response(JSON.stringify({ 
      reply: reply,
      model: selectedModel.name,
      usage: response.usage || null
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ 
      error: '调用AI模型时发生错误: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function getHistory(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    const sessionId = url.searchParams.get('sessionId') || 'default';

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const historyData = await env.CHAT_HISTORY.get(`history:${sessionId}`);
    const history = historyData ? JSON.parse(historyData) : [];

    return new Response(JSON.stringify({ history }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Get history error:', error);
    return new Response(JSON.stringify({ error: '获取历史记录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function saveHistory(request, env, corsHeaders) {
  try {
    const { password, sessionId = 'default', history } = await request.json();

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const maxHistoryItems = 100;
    const trimmedHistory = history.slice(-maxHistoryItems);

    await env.CHAT_HISTORY.put(`history:${sessionId}`, JSON.stringify(trimmedHistory));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Save history error:', error);
    return new Response(JSON.stringify({ error: '保存历史记录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 格式化代码块
function formatCodeBlocks(text) {
  // 处理代码块格式
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
  });
  
  // 处理行内代码
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  return text;
}

function getHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CF AI Chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; height: 90vh; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; text-align: center; }
        .author-info { margin-top: 10px; padding: 8px 16px; background: rgba(255,255,255,0.1); border-radius: 20px; display: inline-block; }
        .author-info p { margin: 0; font-size: 14px; opacity: 0.9; }
        .author-info strong { color: #ffd700; }
        .main-content { display: flex; flex: 1; overflow: hidden; }
        .sidebar { width: 300px; background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 20px; overflow-y: auto; }
        .chat-area { flex: 1; display: flex; flex-direction: column; }
        .auth-section { 
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%); 
            border: 2px solid #ff6b9d; border-radius: 15px; padding: 20px; margin-bottom: 20px; 
            box-shadow: 0 8px 16px rgba(255, 107, 157, 0.2);
        }
        .auth-section.authenticated { 
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); 
            border-color: #4facfe; 
            box-shadow: 0 8px 16px rgba(79, 172, 254, 0.2);
        }
        .model-section { margin-bottom: 20px; }
        .model-select { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; margin-bottom: 10px; }
        .model-info { background: #f1f5f9; padding: 10px; border-radius: 8px; font-size: 12px; line-height: 1.4; }
        .input-group { margin-bottom: 15px; }
        .input-group input { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; }
        .btn { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #4338ca; }
        .btn-secondary { background: #6b7280; }
        .messages { flex: 1; overflow-y: auto; padding: 20px; background: #fafafa; }
        .message { margin-bottom: 20px; max-width: 80%; }
        .message.user { margin-left: auto; }
        .message-content { padding: 15px; border-radius: 15px; line-height: 1.6; }
        .message.user .message-content { background: #4f46e5; color: white; }
        .message.assistant .message-content { background: white; border: 1px solid #e2e8f0; }
        .input-area { background: white; border-top: 1px solid #e2e8f0; padding: 20px; }
        .input-container { display: flex; gap: 10px; align-items: flex-end; }
        .message-input { flex: 1; min-height: 50px; padding: 15px; border: 1px solid #d1d5db; border-radius: 12px; resize: none; }
        .send-btn { height: 50px; padding: 0 20px; background: #10b981; border-radius: 12px; }
        .loading { display: none; text-align: center; padding: 20px; color: #6b7280; }
        .error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 8px; margin: 10px 0; }
        .success { background: #f0f9ff; color: #0369a1; padding: 10px; border-radius: 8px; margin: 10px 0; }
        pre { background: #f1f5f9; padding: 15px; border-radius: 8px; overflow-x: auto; margin: 10px 0; }
        code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; }
        pre code { background: none; padding: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 CF AI Chat</h1>
            <p>支持多模型切换的智能聊天助手</p>
            <div class="author-info">
                <p>📺 作者：<strong>YouTube：康康的订阅天地</strong></p>
            </div>
        </div>
        <div class="main-content">
            <div class="sidebar">
                <div class="auth-section" id="authSection">
                    <div class="input-group">
                        <label>访问密码</label>
                        <input type="password" id="passwordInput" placeholder="请输入访问密码">
                    </div>
                    <button class="btn" onclick="authenticate()">验证</button>
                </div>
                <div class="model-section" id="modelSection" style="display: none;">
                    <h3>🎯 选择AI模型</h3>
                    <select class="model-select" id="modelSelect" onchange="updateModelInfo()">
                        <option value="">请选择模型...</option>
                    </select>
                    <div class="model-info" id="modelInfo">请先选择一个AI模型</div>
                </div>
                <div class="history-section" id="historySection" style="display: none;">
                    <h3>📚 聊天历史</h3>
                    <button class="btn btn-secondary" onclick="loadHistory()">加载历史</button>
                    <button class="btn btn-secondary" onclick="clearHistory()">清空历史</button>
                </div>
            </div>
            <div class="chat-area">
                <div class="messages" id="messages">
                    <div class="message assistant">
                        <div class="message-content">👋 欢迎使用CF AI Chat！请先输入密码验证身份，然后选择一个AI模型开始聊天。</div>
                    </div>
                </div>
                <div class="loading" id="loading">🤔 AI正在思考中...</div>
                <div class="input-area">
                    <div class="input-container">
                        <textarea class="message-input" id="messageInput" placeholder="输入您的问题..." disabled onkeydown="handleKeyDown(event)"></textarea>
                        <button class="btn send-btn" id="sendBtn" onclick="sendMessage()" disabled>发送</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        // 作者信息保护
        const AUTHOR_VERIFICATION = {
            name: "康康的订阅天地",
            platform: "YouTube",
            required: true
        };
        
        function verifyAuthorDisplay() {
            const authorElements = document.querySelectorAll('.author-info strong');
            if (authorElements.length === 0) {
                alert('作者信息已被删除，服务将停止运行！');
                document.body.innerHTML = '<div style="text-align:center;margin-top:50px;"><h1>❌ 服务已停止</h1><p>作者信息被篡改，请保持原始作者信息：YouTube：康康的订阅天地</p></div>';
                return false;
            }
            
            for (let element of authorElements) {
                if (!element.textContent.includes('YouTube：康康的订阅天地')) {
                    alert('作者信息已被篡改，服务将停止运行！');
                    document.body.innerHTML = '<div style="text-align:center;margin-top:50px;"><h1>❌ 服务已停止</h1><p>作者信息被篡改，请保持原始作者信息：YouTube：康康的订阅天地</p></div>';
                    return false;
                }
            }
            return true;
        }
        
        // 定期检查作者信息
        setInterval(verifyAuthorDisplay, 3000);
        
        let isAuthenticated = false, currentPassword = '', models = {}, chatHistory = [], currentModel = '';
        window.onload = async function() {
            // 首次验证作者信息
            if (!verifyAuthorDisplay()) return;
            try {
                const response = await fetch('/api/models');
                models = await response.json();
                populateModelSelect();
            } catch (error) { console.error('Failed to load models:', error); }
        };
        function populateModelSelect() {
            const select = document.getElementById('modelSelect');
            select.innerHTML = '<option value="">请选择模型...</option>';
            for (const [key, model] of Object.entries(models)) {
                const option = document.createElement('option');
                option.value = key; option.textContent = model.name;
                select.appendChild(option);
            }
        }
        function updateModelInfo() {
            const select = document.getElementById('modelSelect');
            const infoDiv = document.getElementById('modelInfo');
            const selectedModel = select.value;
            if (!selectedModel) { infoDiv.innerHTML = '请先选择一个AI模型'; return; }
            
            // 切换模型时加载对应模型的历史记录
            if (currentModel && currentModel !== selectedModel) {
                chatHistory = [];
                const messagesDiv = document.getElementById('messages');
                messagesDiv.innerHTML = '<div class="message assistant"><div class="message-content">🔄 已切换模型，正在加载历史记录...</div></div>';
            }
            
            currentModel = selectedModel;
            const model = models[selectedModel];
            infoDiv.innerHTML = \`<strong>\${model.name}</strong><br>📝 \${model.description}<br><br>💰 输入: $\${model.input_price}/百万tokens<br>• 输出: $\${model.output_price}/百万tokens<br><br>📏 上下文: \${model.context.toLocaleString()} tokens\`;
            if (isAuthenticated) {
                document.getElementById('messageInput').disabled = false;
                document.getElementById('sendBtn').disabled = false;
                // 切换模型后自动加载对应历史记录
                loadHistory();
            }
        }
        async function authenticate() {
            const password = document.getElementById('passwordInput').value;
            if (!password) { showError('请输入密码'); return; }
            try {
                // 发送测试请求验证密码
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'test', model: 'deepseek-r1', password: password })
                });
                
                if (response.status === 401) {
                    showError('密码错误，请重试');
                    return;
                }
                
                isAuthenticated = true; 
                currentPassword = password;
                const authSection = document.getElementById('authSection');
                authSection.className = 'auth-section authenticated';
                authSection.innerHTML = '<p>✅ 身份验证成功！</p>';
                document.getElementById('modelSection').style.display = 'block';
                document.getElementById('historySection').style.display = 'block';
                showSuccess('验证成功！请选择AI模型开始聊天。');
            } catch (error) { 
                showError('验证失败: ' + error.message); 
            }
        }
        async function sendMessage() {
            if (!verifyAuthorDisplay()) return;
            if (!isAuthenticated || !currentModel) { showError('请先验证身份并选择模型'); return; }
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message) return;
            addMessage('user', message); input.value = '';
            chatHistory.push({ role: 'user', content: message, timestamp: new Date() });
            document.getElementById('loading').style.display = 'block';
            document.getElementById('sendBtn').disabled = true;
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, model: currentModel, password: currentPassword, history: chatHistory.slice(-10) })
                });
                const data = await response.json();
                if (response.ok) {
                    addMessage('assistant', data.reply, data.model, data.usage);
                    chatHistory.push({ role: 'assistant', content: data.reply, timestamp: new Date(), model: data.model });
                    await saveHistory();
                } else { showError(data.error || '发送消息失败'); }
            } catch (error) { showError('网络错误: ' + error.message); }
            finally {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('sendBtn').disabled = false;
            }
        }
        function addMessage(role, content, modelName = '', usage = null) {
            const messagesDiv = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}\`;
            let metaInfo = new Date().toLocaleTimeString();
            if (modelName) metaInfo = \`\${modelName} • \${metaInfo}\`;
            if (usage && usage.total_tokens) metaInfo += \` • \${usage.total_tokens} tokens\`;
            messageDiv.innerHTML = \`<div class="message-content">\${content}</div><div style="font-size:12px;color:#6b7280;margin-top:5px;">\${metaInfo}</div>\`;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
        async function loadHistory() {
            if (!isAuthenticated || !currentModel) return;
            try {
                const sessionId = \`\${currentModel}_history\`;
                const response = await fetch(\`/api/history?password=\${encodeURIComponent(currentPassword)}&sessionId=\${sessionId}\`);
                const data = await response.json();
                if (response.ok) {
                    chatHistory = data.history || [];
                    const messagesDiv = document.getElementById('messages');
                    const modelName = models[currentModel]?.name || currentModel;
                    messagesDiv.innerHTML = \`<div class="message assistant"><div class="message-content">📚 已加载 \${modelName} 的历史记录</div></div>\`;
                    chatHistory.forEach(msg => addMessage(msg.role, msg.content, msg.model || ''));
                    if (chatHistory.length === 0) {
                        showSuccess(\`\${modelName} 暂无历史记录\`);
                    } else {
                        showSuccess(\`已加载 \${modelName} 的 \${chatHistory.length} 条历史记录\`);
                    }
                } else { showError(data.error || '加载历史记录失败'); }
            } catch (error) { showError('加载历史记录失败: ' + error.message); }
        }
        async function saveHistory() {
            if (!isAuthenticated || !currentModel) return;
            try {
                const sessionId = \`\${currentModel}_history\`;
                await fetch('/api/history', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: currentPassword, sessionId: sessionId, history: chatHistory })
                });
            } catch (error) { console.error('Save history failed:', error); }
        }
        async function clearHistory() {
            if (!currentModel) { showError('请先选择模型'); return; }
            const modelName = models[currentModel]?.name || currentModel;
            if (!confirm(\`确定要清空 \${modelName} 的所有聊天记录吗？\`)) return;
            chatHistory = []; 
            await saveHistory();
            document.getElementById('messages').innerHTML = \`<div class="message assistant"><div class="message-content">✨ \${modelName} 聊天记录已清空</div></div>\`;
            showSuccess(\`\${modelName} 聊天记录已清空\`);
        }
        function handleKeyDown(event) {
            if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); }
        }
        function showError(message) {
            const div = document.createElement('div');
            div.className = 'error'; div.textContent = message;
            document.querySelector('.sidebar').appendChild(div);
            setTimeout(() => div.remove(), 5000);
        }
        function showSuccess(message) {
            const div = document.createElement('div');
            div.className = 'success'; div.textContent = message;
            document.querySelector('.sidebar').appendChild(div);
            setTimeout(() => div.remove(), 3000);
        }
    </script>
</body>
</html>`;
}
