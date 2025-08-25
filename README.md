# CF AI Chat - 多模型聊天助手

这是一个基于Cloudflare Workers部署的AI聊天应用，支持多种AI模型切换、密码保护、历史记录保存等功能。

## 功能特点

- 🔐 **密码保护**: 在配置文件中设置访问密码，确保安全性
- 🤖 **多模型支持**: 支持6种不同的AI模型切换
- 📚 **历史记录**: 自动保存和查看聊天历史
- 💰 **费用透明**: 显示每个模型的收费标准和上下文限制
- 📱 **响应式设计**: 支持桌面和移动设备
- ⚡ **纯文本回复**: 直接返回AI回复内容，无JSON包装

## 支持的AI模型

| 模型 | 上下文窗口 | 输入价格 | 输出价格 | 适用场景 |
|------|------------|----------|----------|----------|
| **DeepSeek-R1-Distill-Qwen-32B** | 80,000 tokens | $0.50/M | $4.88/M | 复杂推理、数学计算 |
| **OpenAI GPT-OSS-120B** | 128,000 tokens | $0.35/M | $0.75/M | 高推理需求的通用任务 |
| **OpenAI GPT-OSS-20B** | 128,000 tokens | $0.20/M | $0.30/M | 低延迟、专用应用 |
| **Meta Llama 4 Scout** | 131,000 tokens | $0.27/M | $0.85/M | 多模态、图像理解 |
| **Qwen2.5-Coder-32B** | 32,768 tokens | $0.66/M | $1.00/M | 代码生成和理解 |
| **Gemma 3 12B** | 80,000 tokens | $0.35/M | $0.56/M | 多语言、文本生成 |

## 部署步骤

### 方式一：GitHub + Cloudflare Workers 自动部署（推荐）

#### 1. Fork 本项目

点击右上角的 "Fork" 按钮将项目复制到你的GitHub账户

#### 2. 配置 GitHub Secrets

在你的GitHub仓库中，进入 **Settings** > **Secrets and variables** > **Actions**，添加以下secrets：

- `CLOUDFLARE_API_TOKEN`: 你的Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: 你的Cloudflare账户ID

#### 3. 修改配置

编辑 `wrangler.toml` 文件：
- 将KV命名空间ID替换为你的真实ID
- 修改密码和其他配置

#### 4. 推送代码

```bash
git add .
git commit -m "Deploy CF AI Chat"
git push
```

GitHub Actions 会自动：
- 部署Worker到Cloudflare
- 部署前端页面到GitHub Pages

#### 5. 访问应用

- 前端页面：`https://yourusername.github.io/cf-gpt-oss`
- API端点：你的Worker域名

### 方式二：手动部署

#### 1. 部署Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 点击 **Create application** > **Create Worker**
4. 将 `src/worker.js` 中的代码复制到编辑器中
5. 点击 **Save and Deploy**

#### 2. 配置Worker

在Worker设置中配置：

**KV Namespace Bindings:**
- Variable name: `CHAT_HISTORY`
- KV namespace: 选择你的KV命名空间

**Environment Variables:**
- `CHAT_PASSWORD`: 你的访问密码
- `MODEL_CONFIG`: 模型配置JSON（见CF_DASHBOARD_CONFIG.md）

**AI Bindings:**
- Variable name: `AI`

#### 3. 部署前端

将 `index.html` 文件上传到任何静态网站托管服务：
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

### 配置说明

详细的配置参数请参考 `CF_DASHBOARD_CONFIG.md` 文件

## 📚 文档导航

### 🚀 快速开始
- [QUICK_START.md](./QUICK_START.md) - 5分钟快速部署指南
- [部署指南.md](./部署指南.md) - 详细部署步骤和配置说明

### ⚙️ 配置说明
- [变量配置详解.md](./变量配置详解.md) - 所有变量的详细配置说明
- [CF_DASHBOARD_CONFIG.md](./CF_DASHBOARD_CONFIG.md) - Dashboard手动配置方法

### 🛠️ 技术支持
- [故障排除指南.md](./故障排除指南.md) - 常见问题和解决方案
- [项目说明.md](./项目说明.md) - 项目技术架构和功能详解

## 使用说明

1. **访问应用**: 部署成功后，访问GitHub Pages地址
2. **配置API**: 输入Worker域名地址
3. **身份验证**: 输入在配置文件中设置的密码
4. **选择模型**: 从下拉菜单中选择合适的AI模型
5. **开始聊天**: 输入问题并发送，AI会返回纯文本回复
6. **查看历史**: 点击"加载历史记录"查看之前的对话

## API接口说明

### POST /api/chat
发送聊天消息

```json
{
  "message": "你好",
  "model": "deepseek-r1",
  "password": "your_password",
  "history": []
}
```

### GET /api/models
获取支持的模型列表

### GET /api/history
获取聊天历史记录

### POST /api/history
保存聊天历史记录

## 模型参数说明

根据官方文档，不同模型使用不同的参数格式：

- **使用 `messages` 参数的模型**:
  - DeepSeek-R1-Distill-Qwen-32B
  - Meta Llama 4 Scout
  - Qwen2.5-Coder-32B
  - Gemma 3 12B

- **使用 `instructions` 参数的模型**:
  - OpenAI GPT-OSS-120B
  - OpenAI GPT-OSS-20B

## 注意事项

1. **成本控制**: 不同模型收费不同，请根据需求选择合适的模型
2. **上下文限制**: 每个模型都有上下文窗口限制，超出后会自动截断
3. **访问安全**: 请妥善保管访问密码，不要在代码中硬编码
4. **KV存储**: 历史记录保存在Cloudflare KV中，免费套餐有一定限制

## 故障排除

- **部署失败**: 检查KV命名空间ID是否正确配置
- **密码错误**: 确认 `wrangler.toml` 中的密码设置
- **模型调用失败**: 检查Cloudflare Workers AI是否已启用
- **历史记录丢失**: 检查KV绑定是否正确

## 更新日志

- **v1.0.0**: 初始版本，支持6种AI模型和基础聊天功能
