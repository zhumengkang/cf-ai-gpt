# 🚀 快速开始指南

## 5分钟快速部署CF AI Chat

### 📋 准备工作

1. **GitHub账户** - 用于托管代码和前端页面
2. **Cloudflare账户** - 用于Workers AI和KV存储
3. **KV命名空间** - 您已创建好的KV存储

### 🔧 部署步骤

#### 1. Fork 项目
点击页面右上角的 "Fork" 按钮

#### 2. 修改配置
编辑 `wrangler.toml` 文件：
```toml
[kv_namespaces]
binding = "CHAT_HISTORY"
id = "$3d9dc952826b434398ed08d8021cc9b0"  # 你的KV命名空间ID
preview_id = "$3d9dc952826b434398ed08d8021cc9b0"

[vars]
CHAT_PASSWORD = "your-password-here"  # 修改为你的密码
```

#### 3. 配置GitHub Secrets
在仓库 Settings > Secrets and variables > Actions 中添加：
- `CLOUDFLARE_API_TOKEN`: 获取方式见下方
- `CLOUDFLARE_ACCOUNT_ID`: 在CF Dashboard右侧栏可找到

#### 4. 推送代码
```bash
git add .
git commit -m "Deploy CF AI Chat"
git push
```

#### 5. 访问应用
- 前端：`https://yourusername.github.io/cf-gpt-oss`
- API：Worker部署完成后的域名

### 🔑 获取Cloudflare API Token

1. 访问 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 "Create Token"
3. 使用 "Edit Cloudflare Workers" 模板
4. 或自定义权限：
   - Account: `Cloudflare Workers:Edit`
   - Zone Resources: `Include All zones`

### 📝 配置检查清单

- [ ] Fork了项目到自己的GitHub
- [ ] 修改了`wrangler.toml`中的KV ID和密码
- [ ] 添加了GitHub Secrets (API Token和Account ID)
- [ ] 推送了代码
- [ ] 等待GitHub Actions完成部署
- [ ] 测试前端页面和API连接

### 🎯 支持的模型

| 模型简称 | 全名 | 适用场景 | 价格 |
|---------|------|----------|------|
| `deepseek-r1` | DeepSeek-R1-Distill-Qwen-32B | 复杂推理 | $0.50/$4.88 |
| `gpt-oss-120b` | OpenAI GPT-OSS-120B | 高性能通用 | $0.35/$0.75 |
| `gpt-oss-20b` | OpenAI GPT-OSS-20B | 低延迟 | $0.20/$0.30 |
| `llama-4-scout` | Meta Llama 4 Scout | 多模态 | $0.27/$0.85 |
| `qwen-coder` | Qwen2.5-Coder-32B | 代码专用 | $0.66/$1.00 |
| `gemma-3` | Gemma 3 12B | 多语言 | $0.35/$0.56 |

*价格单位：美元/百万tokens (输入/输出)*

### ❓ 常见问题

**Q: GitHub Actions部署失败？**  
A: 检查Secrets是否正确设置，KV命名空间ID是否存在

**Q: 前端连不上API？**  
A: 确认Worker已成功部署，在前端输入正确的Worker域名

**Q: 密码验证失败？**  
A: 检查`wrangler.toml`中的密码设置是否正确

**Q: KV存储错误？**  
A: 确认KV命名空间已创建且ID正确配置

### 🆘 需要帮助？

如有问题请查看详细文档：
- `README.md` - 完整部署指南
- `CF_DASHBOARD_CONFIG.md` - Dashboard配置说明

### 🎉 部署成功！

完成以上步骤后，你就拥有了一个功能完整的AI聊天应用：
- ✅ 多模型支持
- ✅ 密码保护
- ✅ 历史记录
- ✅ 费用透明
- ✅ 响应式设计
- ✅ 纯文本回复
