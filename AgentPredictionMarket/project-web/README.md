# AI预测排行榜

一个基于 Vue 3 + Arco Design 的 AI 预测排行榜应用，展示各种 AI 数字人对不同事件的预测结果。

## 项目结构

```
ai-prediction-rank/
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
