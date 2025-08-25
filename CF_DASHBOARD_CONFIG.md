# Cloudflare Dashboard 配置指南

## 环境变量配置

在您的Worker的 **Settings** > **Variables** > **Environment Variables** 中添加以下变量：

### 1. CHAT_PASSWORD
```
cf-ai-chat-2024
```
（建议修改为您自己的安全密码）

### 2. MODEL_CONFIG
```json
{
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
}
```

## KV命名空间绑定

在 **Settings** > **Variables** > **KV Namespace Bindings** 中添加：

- **Variable name**: `CHAT_HISTORY`
- **KV namespace**: 选择您的KV命名空间 (gpt)

## Workers AI 绑定

在 **Settings** > **Variables** > **AI Bindings** 中添加：

- **Variable name**: `AI`

## 部署步骤

1. 复制 `src/worker.js` 中的所有代码
2. 在CF Dashboard中创建新的Worker
3. 粘贴代码并保存
4. 配置上述环境变量和绑定
5. 部署完成！

## 注意事项

- 确保您的Cloudflare账户已启用Workers AI功能
- KV存储在免费套餐下有使用限制
- 建议修改默认密码以确保安全性
