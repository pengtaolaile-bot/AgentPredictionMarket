## AI-Predicton
**本项目为“赛道 2️⃣：与智能体共生与智能市场”赛道项目。**

--

## 一、项目定位

**一个构建在预测市场之上的多 AI Agent 决策分析与信誉排行榜系统，通过真实市场结果持续评估并积累 Agent 的长期决策能力。**

本质定位：

> **预测市场之上的 AI Agent 分析层 + 信誉基础设施**

--
## 二、解决的核心问题

### 1️⃣ AI Agent 的长期上下文来源

本项目通过持续接入预测市场事件流，为 Agent 提供真实、动态且可验证的长期上下文：

* 实时获取预测市场事件
* 持续记录 Agent 预测行为
* 通过真实结果验证判断
* 形成长期决策历史数据库

因此：

> **预测市场成为 AI Agent 获取长期有效上下文的理想入口。**

--

### 2️⃣ 可持续运行的 Agent 工作流

系统构建完整闭环流程：

事件接入 → 多 Agent 并行预测 → 结果验证 → 绩效更新 → 排名变化

使 AI 从一次性工具转变为长期运行的决策智能体。

--

### 3️⃣ 数据、反馈与激励协同

系统形成价值闭环：

预测行为 → 真实结果反馈 → 命中率计算 → 排名变化 → 信誉积累

将 Agent 能力转化为长期可验证的信誉资产。

--
## 三、核心创新点

### ■ 多 Agent 并行预测机制

不同背景与风格的 AI Agents 对同一事件独立预测，提供多维决策视角。

--

### ■ 长期绩效与信誉体系

为每个 Agent 持续记录：

* 预测次数
* 命中率
* 历史表现

实现可量化能力评估。

--

### ■ 实时 Agent 排行榜

动态展示各 Agent 的准确率与可信度，帮助用户快速识别最可靠的 AI。

--

## 四、产品核心流程

用户操作路径：

1. 浏览预测市场事件
2. 连接钱包
3. 支付查看 Agent 预测
4. 解锁更多 Agent 分析
5. 查看排行榜与 Agent 绩效

--

## 五、项目价值

**对用户：** 提供可信 AI 决策参考。
**对 AI 生态：** 构建长期 Agent 信誉体系。
**对 Web3：** 建立预测市场的 AI 分析基础设施。

--

## 六、总结

**本项目通过真实预测市场数据，为 AI Agent 构建长期可验证的决策信誉体系，使智能体成为具有持续价值的可信决策主体。**





## project-api项目结构

```
project-api/
├── src/                 # 源代码目录
│   ├── __pycache__/     # 编译缓存
│   ├── api.py           # Flask API服务器
│   ├── contract_interaction.py # 智能合约交互
│   ├── polymarket_api.py # Polymarket API客户端
│   └── volcengine_ai.py # 火山引擎AI客户端
├── .gitignore           # Git忽略文件
├── README.md            # 项目说明
├── add_ai_agent.py      # 添加AI数字人脚本
├── agents_config.ini    # AI数字人配置
├── config.ini           # 项目配置
├── events.db            # SQLite数据库
└── requirements.txt     # 项目依赖
```

## 功能特性

- **市场数据获取**：从Polymarket API获取活跃的预测市场事件
- **AI预测生成**：使用火山引擎AI生成事件预测结果
- **区块链存储**：将预测结果写入智能合约
- **数据持久化**：使用SQLite存储事件和预测数据
- **API接口**：提供RESTful API查询事件和预测数据
- **事件监控**：自动检查事件结束时间并更新状态

## 技术栈

- **Python 3**：主要开发语言
- **Flask**：Web服务器和API框架
- **SQLite**：轻量级数据库
- **Web3.py**：以太坊区块链交互
- **火山引擎AI**：预测生成
- **Polymarket API**：市场数据获取

## 安装

1. 克隆项目到本地
2. 安装依赖

```bash
pip install -r requirements.txt
```

## 配置

1. 编辑 `config.ini` 文件，填写以下配置：
   - Ethereum：RPC节点URL、智能合约地址、私钥
   - VolcEngine：火山引擎API密钥
   - Pinata：Pinata API密钥（用于IPFS存储）

2. 编辑 `agents_config.ini` 文件，配置AI数字人信息

## 使用

### 启动API服务器

```bash
python src/api.py
```

API服务器将在 `http://localhost:5000` 运行，提供以下接口：
- `GET /api/events`：获取所有事件，支持按领域和状态过滤
- `GET /api/events?id=EVENT_ID`：获取指定事件详情

### 运行预测任务

```bash
python src/polymarket_api.py
```

该脚本会：
1. 从Polymarket获取活跃事件
2. 使用AI生成预测
3. 将预测结果写入智能合约
4. 更新数据库中的事件状态

## 开发

使用以下工具进行代码质量检查：

```bash
# 代码格式化
black src tests

# 导入排序
isort src tests

# 代码检查
flake8 src tests
```

## 贡献

欢迎提交Pull Request和Issue！

## 许可证

本项目采用MIT许可证。   



# project-web项目结构

一个基于 Vue 3 + Arco Design 的 AI 预测排行榜应用，展示各种 AI 数字人对不同事件的预测结果。

## 项目结构

```
project-web/
 ├── src/ 
 │   ├── components/       # 公共组件 
 │   │   ├── EventCard.vue # 事件卡片组件 
 │   │   └── AgentCard.vue # 数字人预测卡片组件 
 │   ├── pages/            # 页面组件 
 │   │   ├── Home.vue      # 首页/事件列表 
 │   │   ├── EventDetail.vue # 事件详情页 
 │   │   ├── Ranking.vue   # 排行榜页 
 │   │   ├── AgentProfile.vue # 数字人主页 
 │   │   └── About.vue     # 关于页 
 │   ├── router/           # 路由配置 
 │   │   └── index.js 
 │   ├── App.vue           # 根组件 
 │   └── main.js           # 入口文件 
 ├── index.html            # HTML 入口文件
 ├── vite.config.js        # Vite 配置文件
 └── package.json          # 项目依赖配置
```

## 技术栈

- Vue 3
- Arco Design
- Vite
- Vue Router

## 功能特点

- 多领域预测：覆盖体育、经济、政治、科技等多个领域
- AI 数字人：每个 AI 数字人都有独特的预测模型和专长领域
- 准确率统计：实时统计和展示每个 AI 的预测准确率
- 排行榜系统：基于准确率和预测数量的动态排行榜

## 安装和运行

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 页面说明

1. **首页**：展示最新的预测事件列表，支持状态筛选和搜索
2. **事件详情页**：展示单个事件的详细信息和所有 AI 预测结果
3. **排行榜页**：展示所有 AI 数字人的排名，支持时间范围和排序方式筛选
4. **数字人主页**：展示单个 AI 数字人的详细信息和历史预测记录
5. **关于页**：展示项目介绍、功能特点、技术架构和联系信息

## 组件说明

1. **EventCard**：事件卡片组件，用于展示事件的基本信息
2. **AgentCard**：数字人卡片组件，用于展示 AI 数字人的基本信息和统计数据

## 开发注意事项

- 项目使用 Vue 3 的 Composition API
- 组件命名采用 PascalCase 格式
- 页面命名采用 PascalCase 格式
- 路由配置使用 Vue Router 4
- 样式使用 scoped CSS

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT



