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

// 模型特定参数配置
function getModelOptimalParams(modelKey, modelId) {
  const baseParams = {
    temperature: 0.7,
    stream: false
  };
  
  // 根据不同模型设置最优参数
  switch (modelKey) {
    case 'deepseek-r1':
      return {
        ...baseParams,
        max_tokens: 8192,        // DeepSeek支持大输出
        temperature: 0.8,        // 思维链推理需要更高创造性，范围0-5
        top_p: 0.9,              // 范围0.001-1
        top_k: 50,               // 范围1-50
        repetition_penalty: 1.1, // 范围0-2
        frequency_penalty: 0.1,  // 范围-2到2
        presence_penalty: 0.1    // 范围-2到2
      };
      
    case 'gpt-oss-120b':
      return {
        ...baseParams,
        max_tokens: 4096,        // 生产级模型，平衡质量和速度
        temperature: 0.7,
        // GPT模型不支持top_p和presence_penalty，只支持reasoning参数
        reasoning: {
          effort: "medium",
          summary: "auto"
        }
      };
      
    case 'gpt-oss-20b':
      return {
        ...baseParams,
        max_tokens: 2048,        // 低延迟模型，快速响应
        temperature: 0.6,
        // GPT模型不支持top_p，只支持reasoning参数
        reasoning: {
          effort: "low",         // 低延迟模型使用低effort
          summary: "concise"
        }
      };
      
    case 'llama-4-scout':
      return {
        ...baseParams,
        max_tokens: 4096,        // 多模态模型，支持长输出
        temperature: 0.75,
        top_p: 0.95,
        repetition_penalty: 1.1,  // 使用正确的参数名
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      };
      
    case 'qwen-coder':
      return {
        ...baseParams,
        max_tokens: 8192,        // 代码模型需要长输出
        temperature: 0.3,        // 代码生成需要低随机性
        top_p: 0.8,              // 范围0-2，Qwen支持
        top_k: 30,
        repetition_penalty: 1.1,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      };
      
    case 'gemma-3':
      return {
        ...baseParams,
        max_tokens: 4096,        // 多语言模型
        temperature: 0.8,
        top_p: 0.9,              // 范围0-2，Gemma支持
        top_k: 40,
        repetition_penalty: 1.0,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      };
      
    default:
      return {
        ...baseParams,
        max_tokens: 2048
      };
  }
}

// 模型配置 - 写死在代码中
const MODEL_CONFIG = {
  "deepseek-r1": {
    "id": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
    "name": "DeepSeek-R1-Distill-Qwen-32B",
    "description": "思维链推理模型，支持复杂逻辑推理和数学计算",
    "context": 80000,
    "max_output": 8192,
    "input_price": 0.50,
    "output_price": 4.88,
    "use_messages": true,
    "features": ["思维链推理", "数学计算", "代码生成"]
  },
  "gpt-oss-120b": {
    "id": "@cf/openai/gpt-oss-120b",
    "name": "OpenAI GPT-OSS-120B",
    "description": "生产级通用模型，高质量文本生成和推理",
    "context": 128000,
    "max_output": 4096,
    "input_price": 0.35,
    "output_price": 0.75,
    "use_messages": false,
    "use_input": true,
    "features": ["通用对话", "文本分析", "创意写作"]
  },
  "gpt-oss-20b": {
    "id": "@cf/openai/gpt-oss-20b",
    "name": "OpenAI GPT-OSS-20B",
    "description": "低延迟快速响应模型，适合实时对话",
    "context": 128000,
    "max_output": 2048,
    "input_price": 0.20,
    "output_price": 0.30,
    "use_messages": false,
    "use_input": true,
    "features": ["快速响应", "实时对话", "简单任务"]
  },
  "llama-4-scout": {
    "id": "@cf/meta/llama-4-scout-17b-16e-instruct",
    "name": "Meta Llama 4 Scout",
    "description": "多模态模型，支持文本和图像理解分析",
    "context": 131000,
    "max_output": 4096,
    "input_price": 0.27,
    "output_price": 0.85,
    "use_messages": true,
    "features": ["多模态", "图像理解", "长文档分析"]
  },
  "qwen-coder": {
    "id": "@cf/qwen/qwen2.5-coder-32b-instruct",
    "name": "Qwen2.5-Coder-32B",
    "description": "代码专家模型，擅长编程和技术问题",
    "context": 32768,
    "max_output": 8192,
    "input_price": 0.66,
    "output_price": 1.00,
    "use_messages": true,
    "features": ["代码生成", "调试分析", "技术文档"]
  },
  "gemma-3": {
    "id": "@cf/google/gemma-3-12b-it",
    "name": "Gemma 3 12B",
    "description": "多语言模型，支持140+种语言和文化理解",
    "context": 80000,
    "max_output": 4096,
    "input_price": 0.35,
    "output_price": 0.56,
    "use_prompt": true,
    "features": ["多语言", "文化理解", "翻译"]
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
    
    console.log('处理聊天请求:', { 
      modelKey: model, 
      modelName: selectedModel.name,
      useInput: selectedModel.use_input,
      usePrompt: selectedModel.use_prompt,
      useMessages: selectedModel.use_messages 
    });
    
    // 构建消息历史
    const maxHistoryLength = Math.floor(selectedModel.context / 1000);
    const recentHistory = history.slice(-maxHistoryLength);
    
    let response;

    try {
      // 设置超时处理
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      if (selectedModel.use_input) {
        // GPT模型使用input参数
        const inputText = recentHistory.length > 0 
          ? `你是一个智能AI助手，请务必用中文回答所有问题。无论用户使用什么语言提问，你都必须用中文回复。\n\n历史对话:\n${recentHistory.map(h => `${h.role}: ${h.content}`).join('\n')}\n\n当前问题: ${message}\n\n请用中文回答:`
          : `你是一个智能AI助手，请务必用中文回答所有问题。无论用户使用什么语言提问，你都必须用中文回复。\n\n问题: ${message}\n\n请用中文回答:`;
        
        const optimalParams = getModelOptimalParams(model, selectedModel.id);
        const inputParams = {
          input: inputText,
          ...optimalParams
        };
        
        console.log(`${selectedModel.name} 最优参数 (input):`, JSON.stringify(optimalParams, null, 2));
        console.log(`${selectedModel.name} 完整请求参数:`, JSON.stringify(inputParams, null, 2));
        
        response = await env.AI.run(selectedModel.id, inputParams);
        console.log(`${selectedModel.name} 原始响应类型:`, typeof response);
        console.log(`${selectedModel.name} 原始响应结构:`, Object.keys(response || {}));
      } else if (selectedModel.use_prompt) {
        // Gemma等模型使用prompt参数
        const promptText = recentHistory.length > 0 
          ? `你是一个智能AI助手，请务必用中文回答所有问题。无论用户使用什么语言提问，你都必须用中文回复。\n\n历史对话:\n${recentHistory.map(h => `${h.role}: ${h.content}`).join('\n')}\n\n当前问题: ${message}\n\n请用中文回答:`
          : `你是一个智能AI助手，请务必用中文回答所有问题。无论用户使用什么语言提问，你都必须用中文回复。\n\n问题: ${message}\n\n请用中文回答:`;
        
        const optimalParams = getModelOptimalParams(model, selectedModel.id);
        const promptParams = {
          prompt: promptText,
          ...optimalParams
        };
        
        console.log(`${selectedModel.name} 最优参数 (prompt):`, JSON.stringify(optimalParams, null, 2));
        
        response = await env.AI.run(selectedModel.id, promptParams);
      } else if (selectedModel.use_messages) {
        // 使用messages参数的模型
        const messages = [
          { role: "system", content: "你是一个智能AI助手，请务必用中文回答所有问题。无论用户使用什么语言提问，你都必须用中文回复。请确保你的回答完全使用中文，包括专业术语和代码注释。" },
          ...recentHistory.map(h => ({ role: h.role, content: h.content })),
          { role: "user", content: `${message}\n\n请用中文回答:` }
        ];

        console.log('调用模型参数 (messages):', JSON.stringify({ 
          model: selectedModel.id, 
          messages: messages.slice(-3) // 只显示最近3条消息避免日志过长
        }, null, 2));
        
        const optimalParams = getModelOptimalParams(model, selectedModel.id);
        const messagesParams = {
          messages,
          ...optimalParams
        };
        
        console.log(`${selectedModel.name} 最优参数:`, JSON.stringify(optimalParams, null, 2));
        
        response = await env.AI.run(selectedModel.id, messagesParams);
      } else {
        // 未知模型类型
        throw new Error(`未知的模型类型: ${selectedModel.name}。请检查模型配置。`);
      }
      
      // 清除超时定时器
      clearTimeout(timeoutId);
      
    } catch (error) {
      console.error('AI模型调用失败:', error);
      if (error.name === 'AbortError') {
        throw new Error(`${selectedModel.name} 调用超时（30秒），请稍后重试`);
      }
      throw new Error(`${selectedModel.name} 调用失败: ${error.message}`);
    }

    // 记录原始响应用于调试
    console.log('AI模型原始响应:', JSON.stringify(response, null, 2));
    
    // 提取纯文本回复
    let reply;
    if (typeof response === 'string') {
      reply = response;
    } else if (response && typeof response === 'object') {
      // 特殊处理GPT模型的响应格式
      if (selectedModel.use_input) {
        console.log('GPT模型响应详细分析:', {
          responseType: typeof response,
          isObject: typeof response === 'object',
          keys: response ? Object.keys(response) : [],
          values: response ? Object.values(response).map(v => ({ type: typeof v, length: typeof v === 'string' ? v.length : 'N/A', preview: typeof v === 'string' ? v.substring(0, 100) + '...' : v })) : []
        });
        
        // 根据API文档，GPT模型返回的是一个对象，可能包含多种字段
        // 尝试按优先级提取内容
        if (typeof response === 'string') {
          reply = response;
        } else if (response && typeof response === 'object') {
          // 检查常见的响应字段
          const possibleFields = ['result', 'response', 'content', 'text', 'output', 'answer', 'completion', 'message', 'data'];
          
          for (const field of possibleFields) {
            if (response[field] && typeof response[field] === 'string' && response[field].length > 0) {
              console.log(`GPT模型在字段 "${field}" 中找到内容:`, response[field].substring(0, 200));
              reply = response[field];
              break;
            }
          }
          
          // 检查OpenAI标准格式 - choices数组
          if (!reply && response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
            console.log('检测到OpenAI choices格式');
            const choice = response.choices[0];
            if (choice.message && choice.message.content) {
              console.log('在choices[0].message.content中找到内容');
              reply = choice.message.content;
            } else if (choice.text) {
              console.log('在choices[0].text中找到内容');
              reply = choice.text;
            }
          }
          
          // 如果没有找到标准字段，检查是否有嵌套对象
          if (!reply) {
            for (const [key, value] of Object.entries(response)) {
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                console.log(`检查嵌套对象 "${key}":`, Object.keys(value));
                for (const nestedField of possibleFields) {
                  if (value[nestedField] && typeof value[nestedField] === 'string' && value[nestedField].length > 0) {
                    console.log(`在嵌套对象 "${key}.${nestedField}" 中找到内容`);
                    reply = value[nestedField];
                    break;
                  }
                }
                if (reply) break;
              }
            }
          }
        }
      } else if (typeof response.response === 'string') {
        reply = response.response;
      } else if (typeof response.text === 'string') {
        reply = response.text;
      } else if (typeof response.output === 'string') {
        reply = response.output;
      } else if (response.choices && response.choices.length > 0) {
        // OpenAI格式的响应
        if (response.choices[0].message && response.choices[0].message.content) {
          reply = response.choices[0].message.content;
        } else if (response.choices[0].text) {
          reply = response.choices[0].text;
        }
      } else if (response.content) {
        reply = response.content;
      } else if (response.message) {
        reply = response.message;
      } else {
        console.error('未知的响应格式:', response);
        // 检查是否包含模型ID或其他无效内容
        const allValues = Object.values(response);
        const possibleContent = allValues.find(val => 
          typeof val === 'string' && 
          val.length > 10 && 
          val.length < 10000 && 
          !val.startsWith('resp_') &&
          !val.startsWith('@cf/') &&  // 过滤模型ID
          !val.includes('openai') &&  // 过滤包含模型信息的字符串
          !val.includes('gpt-oss')
        );
        
        if (possibleContent) {
          reply = possibleContent;
        } else {
          // 如果找不到有效内容，检查是否是异步响应或模型ID
          const respIds = allValues.filter(val => 
            typeof val === 'string' && val.startsWith('resp_')
          );
          const modelIds = allValues.filter(val => 
            typeof val === 'string' && val.startsWith('@cf/')
          );
          
          if (respIds.length > 0) {
            console.log(`检测到异步响应ID: ${respIds[0]}`);
            if (selectedModel.use_input) {
              reply = `抱歉，GPT模型返回了异步响应ID (${respIds[0]})。这通常表示请求正在处理中，但当前版本不支持异步轮询。建议：1) 简化您的问题 2) 稍后重试 3) 尝试其他模型。`;
            } else {
              reply = `抱歉，AI模型返回了异步响应ID (${respIds[0]})，但当前不支持异步处理。请稍后重试或联系管理员。`;
            }
          } else if (modelIds.length > 0) {
            reply = `抱歉，AI模型只返回了模型ID (${modelIds[0]}) 而没有生成实际内容。这可能是因为输入过短或模型配置问题。请尝试提供更详细的问题或稍后重试。`;
          } else {
            reply = `抱歉，AI模型返回了意外的格式。响应类型: ${typeof response}，可用字段: ${Object.keys(response).join(', ')}。原始内容: ${JSON.stringify(response).substring(0, 500)}...`;
          }
        }
      }
      
      // 特殊处理DeepSeek模型的思考部分
      if (selectedModel.id.includes('deepseek') && reply && reply.includes('<think>')) {
        console.log('DeepSeek原始回复长度:', reply.length);
        console.log('DeepSeek原始回复片段:', reply.substring(0, 200) + '...');
        
        // 提取 </think> 之后的内容作为最终答案
        const thinkEndIndex = reply.lastIndexOf('</think>');
        if (thinkEndIndex !== -1) {
          const cleanReply = reply.substring(thinkEndIndex + 8).trim();
          console.log('DeepSeek清理后回复:', cleanReply);
          reply = cleanReply;
        } else {
          // 如果没有找到</think>，可能思考部分被截断，保留原内容
          console.log('DeepSeek未找到</think>标签，保留原内容');
        }
      }
      
      // 为回复中的Markdown内容添加格式化
      reply = formatMarkdown(reply);
    } else {
      console.error('完全意外的响应:', response);
      reply = `抱歉，AI模型返回了完全意外的格式。响应类型: ${typeof response}`;
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

// 格式化Markdown内容
function formatMarkdown(text) {
  // 转义HTML特殊字符
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
  }
  
  // 处理多行代码块
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const escapedCode = escapeHtml(code.trim());
    return `<div class="code-block">
      <div class="code-header">
        <span class="language">${lang || 'text'}</span>
        <button class="copy-btn" onclick="copyCode(this)">复制</button>
      </div>
      <pre><code class="language-${lang || 'text'}">${escapedCode}</code></pre>
    </div>`;
  });
  
  // 处理行内代码
  text = text.replace(/`([^`]+)`/g, (match, code) => {
    return `<code class="inline-code">${escapeHtml(code)}</code>`;
  });
  
  // 处理标题
  text = text.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');
  
  // 处理粗体
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong class="md-bold">$1</strong>');
  
  // 处理斜体
  text = text.replace(/\*(.*?)\*/g, '<em class="md-italic">$1</em>');
  text = text.replace(/_(.*?)_/g, '<em class="md-italic">$1</em>');
  
  // 处理无序列表
  text = text.replace(/^\* (.*$)/gim, '<li class="md-li">$1</li>');
  text = text.replace(/^- (.*$)/gim, '<li class="md-li">$1</li>');
  
  // 处理有序列表
  text = text.replace(/^\d+\. (.*$)/gim, '<li class="md-li-ordered">$1</li>');
  
  // 包装连续的列表项
  text = text.replace(/(<li class="md-li">.*<\/li>)/s, '<ul class="md-ul">$1</ul>');
  text = text.replace(/(<li class="md-li-ordered">.*<\/li>)/s, '<ol class="md-ol">$1</ol>');
  
  // 处理引用
  text = text.replace(/^> (.*$)/gim, '<blockquote class="md-blockquote">$1</blockquote>');
  
  // 处理链接
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="md-link">$1</a>');
  
  // 处理换行
  text = text.replace(/\n/g, '<br>');
  
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
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100vh; overflow: hidden; }
        .container { width: 100vw; height: 100vh; background: white; display: flex; flex-direction: column; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; text-align: center; }
        .author-info { margin-top: 10px; padding: 8px 16px; background: rgba(255,255,255,0.1); border-radius: 20px; display: inline-block; cursor: pointer; transition: all 0.3s ease; }
        .author-info:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
        .author-info p { margin: 0; font-size: 14px; opacity: 0.9; }
        .author-info strong { color: #ffd700; }
        .main-content { display: flex; flex: 1; overflow: hidden; }
        .sidebar { width: 300px; min-width: 300px; background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 20px; overflow-y: auto; display: block !important; visibility: visible !important; flex-shrink: 0; }
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
        .code-block { margin: 15px 0; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
        .code-header { background: #f8fafc; padding: 8px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
        .language { font-size: 12px; color: #64748b; font-weight: 500; }
        .copy-btn { background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; }
        .copy-btn:hover { background: #2563eb; }
        .copy-btn:active { background: #1d4ed8; }
        pre { background: #f8fafc; padding: 15px; margin: 0; overflow-x: auto; line-height: 1.5; }
        code { font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 13px; }
        .inline-code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 13px; }
        .code-block code { background: none; padding: 0; color: #1f2937; }
        
        /* Markdown 样式 */
        .md-h1 { font-size: 24px; font-weight: bold; color: #1f2937; margin: 20px 0 10px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        .md-h2 { font-size: 20px; font-weight: bold; color: #374151; margin: 18px 0 8px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
        .md-h3 { font-size: 16px; font-weight: bold; color: #4b5563; margin: 15px 0 6px 0; }
        .md-bold { font-weight: bold; color: #1f2937; }
        .md-italic { font-style: italic; color: #4b5563; }
        .md-ul { margin: 10px 0; padding-left: 20px; }
        .md-ol { margin: 10px 0; padding-left: 20px; }
        .md-li { margin: 5px 0; list-style-type: disc; }
        .md-li-ordered { margin: 5px 0; list-style-type: decimal; }
        .md-blockquote { background: #f3f4f6; border-left: 4px solid #6b7280; padding: 10px 15px; margin: 10px 0; font-style: italic; color: #4b5563; }
        .md-link { color: #3b82f6; text-decoration: underline; }
        .md-link:hover { color: #1d4ed8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 CF AI Chat</h1>
            <p>支持多模型切换的智能聊天助手</p>
            <div class="author-info" onclick="window.open('https://www.youtube.com/@%E5%BA%B7%E5%BA%B7%E7%9A%84V2Ray%E4%B8%8EClash', '_blank')">
                <p>📺 作者：<strong>YouTube：康康的订阅天地</strong></p>
            </div>
        </div>
        <div class="main-content">
            <div class="sidebar">
                <div class="auth-section" id="authSection">
                    <div class="input-group">
                        <label>访问密码</label>
                        <input type="password" id="passwordInput" placeholder="请输入访问密码" onkeydown="handlePasswordKeyDown(event)">
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
                        <div class="message-content">👋 欢迎使用CF AI Chat！请先输入密码验证身份，然后选择一个AI模型开始聊天。<br><br>🇨🇳 所有AI模型都已配置为使用中文回复，无论您使用什么语言提问，AI都会用中文回答您的问题。</div>
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
            try {
                const authorElements = document.querySelectorAll('.author-info strong');
                if (authorElements.length === 0) {
                    console.warn('作者信息元素未找到，可能页面还未完全加载');
                    return true; // 页面加载期间暂时允许通过
                }
                
                for (let element of authorElements) {
                    if (!element.textContent.includes('YouTube：康康的订阅天地')) {
                        alert('作者信息已被篡改，服务将停止运行！');
                        document.body.innerHTML = '<div style="text-align:center;margin-top:50px;"><h1>❌ 服务已停止</h1><p>作者信息被篡改，请保持原始作者信息：YouTube：康康的订阅天地</p></div>';
                        return false;
                    }
                }
                return true;
            } catch (error) {
                console.error('验证作者信息时发生错误:', error);
                return true; // 发生错误时暂时允许通过，避免破坏页面功能
            }
        }
        
        // 定期检查作者信息
        setInterval(verifyAuthorDisplay, 3000);
        
        // 全局错误处理
        window.onerror = function(message, source, lineno, colno, error) {
            console.error('JavaScript错误:', { message, source, lineno, colno, error });
            return false; // 不阻止默认错误处理
        };
        
        // 保护侧边栏显示
        function protectSidebar() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.display = 'block';
                sidebar.style.visibility = 'visible';
            }
        }
        setInterval(protectSidebar, 1000);
        
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
            try {
                const select = document.getElementById('modelSelect');
                const infoDiv = document.getElementById('modelInfo');
                const selectedModel = select.value;
                if (!selectedModel) { infoDiv.innerHTML = '请先选择一个AI模型'; return; }
                
                // 切换模型时加载对应模型的历史记录
                if (currentModel && currentModel !== selectedModel) {
                    chatHistory = [];
                    const messagesDiv = document.getElementById('messages');
                    messagesDiv.innerHTML = '<div class="message assistant"><div class="message-content">🔄 已切换模型，正在加载历史记录...<br><br>🇨🇳 新模型已配置为中文回复模式。</div></div>';
                }
                
                currentModel = selectedModel;
                const model = models[selectedModel];
                if (!model) {
                    infoDiv.innerHTML = '模型信息加载失败';
                    return;
                }
                const features = model.features ? model.features.join(' • ') : '';
                infoDiv.innerHTML = \`
                    <strong>\${model.name}</strong><br>
                    📝 \${model.description}<br><br>
                    🎯 <strong>特色功能:</strong><br>
                    \${features}<br><br>
                    💰 <strong>价格:</strong><br>
                    • 输入: $\${model.input_price}/百万tokens<br>
                    • 输出: $\${model.output_price}/百万tokens<br><br>
                    📏 <strong>限制:</strong><br>
                    • 上下文: \${model.context.toLocaleString()} tokens<br>
                    • 最大输出: \${model.max_output.toLocaleString()} tokens
                \`;
                if (isAuthenticated) {
                    document.getElementById('messageInput').disabled = false;
                    document.getElementById('sendBtn').disabled = false;
                    // 切换模型后自动加载对应历史记录
                    loadHistory();
                }
            } catch (error) {
                console.error('更新模型信息时发生错误:', error);
                const infoDiv = document.getElementById('modelInfo');
                if (infoDiv) {
                    infoDiv.innerHTML = '更新模型信息时发生错误';
                }
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
            try {
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
            } catch (error) {
                console.error('发送消息时发生意外错误:', error);
                showError('发送消息时发生意外错误: ' + error.message);
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
        function handlePasswordKeyDown(event) {
            if (event.key === 'Enter') { event.preventDefault(); authenticate(); }
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
        
        // 复制代码功能
        function copyCode(button) {
            const codeBlock = button.closest('.code-block');
            const code = codeBlock.querySelector('pre code');
            const text = code.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                const originalText = button.textContent;
                button.textContent = '已复制!';
                button.style.background = '#10b981';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '#3b82f6';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                // 降级方案：选中文本
                const range = document.createRange();
                range.selectNode(code);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
            });
        }
    </script>
</body>
</html>`;
}
