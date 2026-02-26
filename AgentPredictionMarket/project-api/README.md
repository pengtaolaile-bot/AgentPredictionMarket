# AI预测市场项目

这是一个基于Python的AI预测市场项目，用于从Polymarket获取市场事件数据，使用AI生成预测，并将结果存储到区块链智能合约中。

## 项目结构

```
pythonServicMarket/
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