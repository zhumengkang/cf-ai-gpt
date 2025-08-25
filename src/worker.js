export default {
  async fetch(request, env, ctx) {
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

    // 解析模型配置
    const modelConfig = JSON.parse(env.MODEL_CONFIG);

    try {
      // 路由处理
      // 对于根路径，返回简单的API状态页面
      if (url.pathname === '/') {
        return new Response(JSON.stringify({
          status: 'CF AI Chat API Ready',
          version: '1.0.0',
          endpoints: ['/api/models', '/api/chat', '/api/history'],
          models: Object.keys(modelConfig)
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (url.pathname === '/api/models') {
        return new Response(JSON.stringify(modelConfig), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (url.pathname === '/api/chat' && request.method === 'POST') {
        return await handleChat(request, env, modelConfig, corsHeaders);
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

async function handleChat(request, env, modelConfig, corsHeaders) {
  try {
    const { message, model, password, history = [] } = await request.json();

    // 验证密码
    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 验证模型
    if (!modelConfig[model]) {
      return new Response(JSON.stringify({ error: '无效的模型' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const selectedModel = modelConfig[model];
    
    // 构建消息历史（限制长度以避免超出上下文窗口）
    const maxHistoryLength = Math.floor(selectedModel.context / 1000); // 粗略估算
    const recentHistory = history.slice(-maxHistoryLength);
    
    let response;

    if (selectedModel.use_messages) {
      // 使用messages参数的模型（DeepSeek, Llama, Qwen, Gemma）
      const messages = [
        { role: "system", content: "你是一个友善的AI助手，请用中文回答问题。" },
        ...recentHistory.map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: message }
      ];

      response = await env.AI.run(selectedModel.id, { messages });
    } else {
      // 使用instructions参数的模型（OpenAI GPT-OSS系列）
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
    } else if (response && typeof response === 'object') {
      // 处理其他可能的响应格式
      reply = JSON.stringify(response);
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

    // 限制历史记录数量，避免存储过大
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


