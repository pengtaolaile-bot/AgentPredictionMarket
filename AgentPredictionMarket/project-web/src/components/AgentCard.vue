<template>
  <div class="agent-card" @click="handleClick">
    <div class="agent-header">
      <div class="agent-info">
        <div 
          class="avatar" 
          :style="{ backgroundColor: agent.avatarColor, color: '#fff' }"
        >
          {{ agent.avatar }}
        </div>
        <div class="agent-details">
          <h3 class="agent-name">{{ agent.name }}</h3>
          <p class="agent-desc">{{ agent.desc }}</p>
        </div>
      </div>
      <!-- 去掉查看主页按钮，改为显示预测结果 -->
      <div class="prediction-result-header">
        <a-tag :color="agent.predictColor" class="result-value-header">
          {{ agent.predict }}
        </a-tag>
      </div>
    </div>
    <div class="prediction-content">
      <div class="prediction-result">
        <span class="result-label">核心预测结论：</span>
        <span class="core-conclusion">{{ agent.reason || '综合分析' }}</span>
      </div>
      <div class="prediction-reason">
        <span class="reason-label">预测理由：</span>
        <p class="reason-text" v-html="renderMarkdown(agent.coreConclusion)"></p>
      </div>
    </div>
    <div class="agent-footer">
      <div class="accuracy-info">
        命中率：{{ agent.accuracy }} <span class="rank-info">(#{{ agent.rank }})</span>
      </div>
      <div class="domain-info">
        领域：{{ agent.domain }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { marked } from 'marked'

const props = defineProps({
  agent: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// 渲染 markdown 内容
const renderMarkdown = (content) => {
  if (!content) return ''
  return marked(content)
}

const handleClick = () => {
  // 点击卡片时的处理逻辑
  router.push({ name: 'AgentProfile', params: { id: props.agent.id } })
}
</script>

<style scoped>
.agent-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.agent-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.prediction-result-header {
  display: flex;
  align-items: center;
}

.result-value-header {
  font-weight: 500;
}

.core-conclusion {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.prediction-probability {
  margin-top: 8px;
}

.probability-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.probability-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
}

.agent-details {
  display: flex;
  flex-direction: column;
}

.agent-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.agent-desc {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.prediction-content {
  margin-bottom: 16px;
}

.prediction-result {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.result-label {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.result-value {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 9999px;
}

.prediction-reason {
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reason-label {
  font-weight: 500;
  color: #1f2937;
}

.reason-text {
  margin: 0;
  margin-left: 50px;
  color: #6b7280;
  line-height: 1.5;
}

.agent-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.accuracy-info {
  font-weight: 500;
}

.rank-info {
  color: #9ca3af;
}

.user-icon {
  margin-left: 4px;
  font-size: 16px;
}
</style>