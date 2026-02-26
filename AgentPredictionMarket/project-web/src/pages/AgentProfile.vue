<template>
  <div class="agent-profile-container">
    <!-- 返回按钮 -->
    <button class="back-button" @click="router.back()">
      <a-icon icon="icon-arrow-left" /> 返回
    </button>

    <!-- 个人主页 -->
    <a-spin :loading="loading" tip="加载中..." :size="32" style="margin-top: 24px; display: block;">
      <div v-if="!loading" class="agent-profile-content">
      <!-- 左侧：基础信息 -->
      <div class="left-section">
        <div class="info-card">
          <div class="info-header">
            <div 
              class="avatar" 
              :style="{
                backgroundColor: `hsl(${parseInt(agent.id) * 60 % 360}, 70%, 50%)`, 
                color: '#fff', 
                width: '96px', 
                height: '96px', 
                fontSize: '40px'
              }"
            >
              {{ agent.name ? agent.name.charAt(0) : '?' }}
            </div>
            <h2 class="agent-name">{{ agent.name || '加载中...' }}</h2>
            <p class="agent-title">{{ agent.title || '' }} | {{ agent.domain || '' }}</p>
          </div>
          
          <div class="performance-section">
            <h3 class="section-title">核心绩效</h3>
            <div class="performance-item">
              <span class="item-label">总预测数</span>
              <div class="item-value">{{ agent.totalPredictions || 0 }}</div>
            </div>
            <div class="performance-item">
              <span class="item-label">正确预测数</span>
              <div class="item-value success">{{ agent.correctPredictions || 0 }}</div>
            </div>
            <div class="performance-item">
              <span class="item-label">命中率</span>
              <div class="item-value success large">{{ agent.hitRate || 0 }}%</div>
            </div>
            <div class="performance-item">
              <span class="item-label">领域排名</span>
              <div class="item-value">
                <span class="rank-badge gold">🥇 1</span>
              </div>
            </div>
          </div>
          
          <div class="recent-performance">
            <h3 class="section-title">最近20次表现</h3>
            <div class="performance-icons">
              <span v-for="(item, index) in recentPerformance" :key="index" 
                    :class="{ 'success': item === true, 'fail': item === false }">
                <i v-if="item === true" class="fa-solid fa-check" style="color: #10B981;"></i>
                <i v-else class="fa-solid fa-times" style="color: #EF4444;"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：历史预测记录 -->
      <div class="right-section">
        <div class="history-card">
          <h2 class="history-title">历史预测记录</h2>
          <div class="table-container">
            <a-table 
              :data="historyData" 
              :bordered="true"
              :row-hoverable="true"
              :scroll="{ y: 520 }"
              style="width: 100%;"
            >
              <template #pagination>
                <a-pagination
                  :total="totalItems"
                  :page-size="pageSize"
                  :current="currentPage"
                  @change="(page) => { currentPage.value = page }"
                  :show-total="true"
                  show-jump
                  show-size-changer
                  :page-size-options="['10', '20', '50', '100']"
                  @page-size-change="(size) => { pageSize.value = size; currentPage.value = 1 }"
                  style="margin-top: 16px; text-align: right;"
                />
              </template>
              <template #columns>
                <a-table-column title="事件" :width="280" data-index="event">
                  <template #cell="{ record }">
                    <div>
                      <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">{{ record.event }}</div>
                      <div style="font-size: 12px; color: #6B7280;">{{ record.statusStr }}</div>
                    </div>
                  </template>
                </a-table-column>
                
                <a-table-column title="预测结果" data-index="predict">
                  <template #cell="{ record }">
                    <span 
                      :style="{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: record.correct ? '#D1FAE5' : record.closed === 0 ? '#999' : '#FEE2E2',
                        color: record.correct ? '#065F46' : record.closed === 0 ? '#fff' : '#991B1B'
                      }"
                    >
                      {{ record.predict }}
                    </span>
                  </template>
                </a-table-column>
                
                <a-table-column title="事件结果" data-index="result">
                  <template #cell="{ record }">
                    <span v-if="record.result"
                      :style="{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: record.correct ? '#D1FAE5' : record.closed === 0 ? '#999' : '#FEE2E2',
                        color: record.correct ? '#065F46' : record.closed === 0 ? '#fff' : '#991B1B'
                      }"
                    >
                      {{ record.result }}
                    </span>
                    <span v-else style="color: #6B7280; font-size: 14px;">待揭晓</span>
                  </template>
                </a-table-column>
                
                <a-table-column title="预测对错" data-index="correct">
                  <template #cell="{ record }">
                    <span v-if="record.correct === true && record.closed === 1" style="color: #10B981; font-size: 20px;">
                      <i class="fa-solid fa-check"></i>
                    </span>
                    <span v-else-if="record.correct === false && record.closed === 1" style="color: #EF4444; font-size: 20px;">
                      <i class="fa-solid fa-times"></i>
                    </span>
                    <span v-else style="color: #6B7280; font-size: 14px;">-</span>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ethereumService } from '../services/ethereum'

const router = useRouter()
const route = useRoute()

// 响应式数据
const agent = ref({})
const recentPerformance = ref([])
const allHistoryData = ref([])
const loading = ref(false)
const error = ref(null)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(20)
const totalItems = computed(() => allHistoryData.value.length)

// 分页后的数据
const historyData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allHistoryData.value.slice(start, end)
})

// 加载AI数字人详情
const loadAgent = async () => {
  const agentId = route.params.id
  if (!agentId) return
  
  try {
    const agentData = await ethereumService.getAgent(agentId)
    agent.value = agentData
    
    // 生成最近表现数据
    recentPerformance.value = agentData.recentPerformance
  } catch (err) {
    console.error('Failed to load agent:', err)
    error.value = '加载AI数字人详情失败，显示默认数据'
  }
}

// 加载历史预测数据
const loadPredictions = async () => {
  const agentId = route.params.id
  if (!agentId) return
  
  try {
    const predictions = await ethereumService.getAgentPredictions(agentId)
    // 转换数据格式
    const history = await Promise.all(
      predictions.map(async prediction => {
        try {
          const event = await ethereumService.getEvent(Number(prediction.eventId))
          return {
            event: event.title,
            predict: `${prediction.predictResult} ${prediction.predictProbability}%`,
            result: prediction.predictResult || null,
            correct: prediction.isCorrect,
            color: prediction.isCorrect ? '#065F46' : event.closed === 0 ? '#991B1B' : '#6B7280',
            closed: event.closed,
            statusStr: event.closed === 0 ? '进行中' : `${event.end_date} 结束`
          }
        } catch (err) {
          console.error(`Failed to load event ${prediction.eventId}:`, err)
          return null
        }
      })
    )
    // 过滤掉null值
    allHistoryData.value = history.filter(item => item !== null)
  } catch (err) {
    console.error('Failed to load predictions:', err)
    error.value = '加载历史预测数据失败，显示默认数据'
    // 加载失败时使用默认数据
    allHistoryData.value = []
  }
}

// 加载所有数据
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    await Promise.all([
      loadAgent(),
      loadPredictions()
    ])
  } catch (err) {
    console.error('Failed to load data:', err)
    error.value = '加载数据失败'
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.agent-profile-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 16px;
}

.back-button {
  display: flex;
  align-items: center;
  color: #6366F1;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 0;
  gap: 8px;
  transition: color 0.2s;
}

.back-button:hover {
  color: #4F46E5;
}

.agent-profile-content {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 32px;
}

/* 左侧信息卡片 */
.left-section {
  width: 350px;
  position: sticky;
  top: 80px;
  height: fit-content;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.info-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 16px;
}

.agent-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  margin-bottom: 4px;
}

.agent-title {
  color: #6B7280;
  margin: 0;
  font-size: 14px;
}

.performance-section {
  border-top: 1px solid #E5E7EB;
  padding-top: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 12px 0;
}

.performance-item {
  margin-bottom: 16px;
}

.item-label {
  display: block;
  color: #6B7280;
  font-size: 14px;
  margin-bottom: 4px;
}

.item-value {
  font-size: 24px;
  font-weight: bold;
}

.item-value.success {
  color: #10B981;
}

.item-value.large {
  font-size: 32px;
}

.rank-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 9999px;
  font-weight: bold;
  font-size: 14px;
}

.rank-badge.gold {
  background: linear-gradient(120deg, #FFD700, #F0C808);
  color: #1F2937;
}

/* 最近表现 */
.recent-performance {
  border-top: 1px solid #E5E7EB;
  padding-top: 16px;
}

.performance-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.performance-icons .success {
  color: #10B981;
  font-size: 18px;
}

.performance-icons .fail {
  color: #EF4444;
  font-size: 18px;
}

/* 右侧历史预测 */
.right-section {
  width: 100%;
}

.history-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.history-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 24px 0;
}

.table-container {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  text-align: left;
  padding: 12px 24px;
  background-color: #F9FAFB;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #E5E7EB;
}

.history-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #E5E7EB;
  vertical-align: top;
}

.history-table tr:hover {
  background-color: #F9FAFB;
}

.event-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.event-status {
  font-size: 12px;
  color: #6B7280;
}

/* 标签样式 */
.predict-tag, .result-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.predict-tag.yes, .result-tag.yes {
  background-color: #D1FAE5;
  color: #065F46;
}

.predict-tag.no, .result-tag.no {
  background-color: #FEE2E2;
  color: #991B1B;
}

.pending {
  color: #6B7280;
  font-size: 14px;
}

/* 图标样式 */
.correct-icon {
  color: #10B981;
  font-size: 20px;
}

.wrong-icon {
  color: #EF4444;
  font-size: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .agent-profile-content {
    grid-template-columns: 1fr;
  }
  
  .left-section {
    position: static;
  }
}

/* Arco 表格样式自定义 */
:deep(.arco-table-header) {
  background-color: #F9FAFB;
}

:deep(.arco-table-th) {
  font-weight: 500;
  color: #6B7280;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 24px;
  vertical-align: middle;
}

:deep(.arco-table-body) {
  background-color: white;
}

:deep(.arco-table-tr:hover) {
  background-color: #F9FAFB;
}

:deep(.arco-table-td) {
  padding: 16px 24px;
  vertical-align: middle;
}
</style>