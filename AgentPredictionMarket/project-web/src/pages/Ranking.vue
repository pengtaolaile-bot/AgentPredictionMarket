<template>
  <div class="ranking-page">
    <h1 class="page-title">AI数字人排行榜</h1>
    
    <!-- 筛选栏 -->
    <!-- <div class="filter-section">
      <span class="filter-label">领域：</span>
      <div class="filter-buttons">
        <a-button 
          v-for="item in domainList"
          :key="item.key"
          :type="activeDomain === item.key ? 'primary' : 'default'"
          :shape="'round'"
          :disabled="loading"
          @click="activeDomain = item.key"
          size="small"
        >
          {{ item.name }}
        </a-button>
      </div>
      
      <a-button 
        :shape="'round'"
        :disabled="loading"
        @click="sortRanking"
        size="small"
      >
      按命中率排序
      </a-button>
    </div> -->

    <!-- 排行榜内容 -->
    <a-spin :loading="loading" tip="加载中..." :size="32" style="margin-top: 24px; display: block;">
      <div v-if="!loading" class="ranking-domain">

        <!-- 有数据时显示表格 -->
        <div v-if="tableData.length > 0" class="ranking-card">
          <div class="table-wrapper">
            <table class="ranking-table">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>AI数字人</th>
                  <th>命中率</th>
                  <th>总预测数</th>
                  <th>最近表现</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in tableData" :key="record.id" class="table-row">
                  <!-- 排名列 -->
                  <td>
                    <span :class="getRankClass(record.rank)" class="rank-badge">
                      {{ getRankIcon(record.rank) }} {{ record.rank }}
                    </span>
                  </td>
                  
                  <!-- 数字人列 -->
                  <td>
                    <div class="agent-info">
                      <div 
                        class="avatar" 
                        :style="{ backgroundColor: record.avatarColor, color: '#fff' }"
                      >
                        {{ record.avatar }}
                      </div>
                      <div class="agent-details">
                        <div class="agent-name">{{ record.name }}</div>
                        <div class="agent-desc">{{ record.desc }}</div>
                      </div>
                    </div>
                  </td>
                  
                  <!-- 命中率列 -->
                  <td>
                    <span class="accuracy-value">{{ record.accuracy }} %</span>
                  </td>
                  
                  <!-- 总预测数列 -->
                  <td>
                    <span class="total-predictions">{{ record.total }}</span>
                  </td>
                  
                  <!-- 最近表现列 -->
                  <td>
                    <div class="recent-performance-container">
                      <span v-for="(item, index) in record.recent" :key="index" class="recent-performance-item">
                        <i v-if="item === true" class="fa-solid fa-check" style="color: #10B981;"></i>
                        <i v-else-if="item === false" class="fa-solid fa-times" style="color: #EF4444;"></i>
                      </span>
                    </div>
                  </td>
                  
                  <!-- 操作列 -->
                  <td>
                    <button class="view-profile-btn" @click="toAgentProfile(record.id)" :aria-label="`查看${record.name}的主页`">
                      查看主页
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ethereumService } from '../services/ethereum'

const router = useRouter()

// 响应式数据
const tableData = ref([])
const loading = ref(false)
const error = ref(null)

// 加载AI数字人数据
const loadAgents = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 获取AI数字人列表
    const agents = await ethereumService.getAgentsByDomain()
    
    // 按命中率排序
    const sortedAgents = [...agents].sort((a, b) => {
      return parseInt(b.hitRate) - parseInt(a.hitRate)
    })
    
    // 转换数据格式
    tableData.value = sortedAgents.map((agent, index) => {
      // 生成头像颜色
      const avatarColor = `hsl(${index * 60 % 360}, 70%, 50%)`
      
      // 生成最近表现数据
      const recentPerformance = agent.recentPerformance
      
      return {
        id: agent.id,
        rank: index + 1,
        name: agent.name,
        avatar: agent.name.charAt(0),
        avatarColor: avatarColor,
        desc: `${agent.title} | ${agent.domain}`,
        accuracy: agent.hitRate,
        total: parseInt(agent.totalPredictions),
        recent: recentPerformance
      }
    })
  } catch (err) {
    console.error('Failed to load agents:', err)
    error.value = '加载AI数字人数据失败，请稍后重试'
    // 加载失败时使用默认数据
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 获取排名标签类名
const getRankClass = (rank) => {
  const classMap = {
    1: 'rank-1',
    2: 'rank-2',
    3: 'rank-3'
  }
  return classMap[rank] || 'rank-default'
}

// 获取排名图标
const getRankIcon = (rank) => {
  const iconMap = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  }
  return iconMap[rank] || ''
}

// 排序功能
const sortRanking = () => {
  // 按命中率降序排序
  tableData.value.sort((a, b) => {
    return parseInt(b.accuracy) - parseInt(a.accuracy)
  })
  
  // 更新排名
  tableData.value.forEach((item, index) => {
    item.rank = index + 1
  })
}

// 跳转到数字人主页
const toAgentProfile = (id) => {
  router.push({ name: 'AgentProfile', params: { id } })
}

// // 监听筛选条件变化，重新加载数据
// watch(activeDomain, () => {
//   loadAgents()
// })

// 组件挂载时加载数据
onMounted(() => {
  loadAgents()
})
</script>

<style scoped>
.ranking-page {
  background-color: #f9fafb;
  /* min-height: 100vh; */
  padding: 0px 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}

.filter-label {
  color: #6b7280;
  font-size: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.ranking-domain {
  margin-bottom: 2rem;
}

.ranking-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 加载状态容器 */
.loading-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 4rem;
  text-align: center;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 错误状态容器 */
.error-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  text-align: center;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 表格包装器 */
.table-wrapper {
  overflow-x: auto;
}

.placeholder-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 3rem;
  text-align: center;
}

/* 原生表格样式 */
.ranking-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.ranking-table thead {
  background-color: #f9fafb;
}

.ranking-table th {
  text-align: left;
  padding: 12px 24px;
  font-weight: 500;
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e5e7eb;
}

.ranking-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #f9fafb;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.agent-details {
  display: flex;
  flex-direction: column;
}

.agent-name {
  font-weight: 500;
  color: #1f2937;
}

.agent-desc {
  font-size: 12px;
  color: #6b7280;
  width: 500px;
}

.rank-badge {
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: bold;
  color: #1f2937;
}

.rank-1 {
  background: linear-gradient(120deg, #FFD700, #F0C808);
}

.rank-2 {
  background: linear-gradient(120deg, #C0C0C0, #D3D3D3);
}

.rank-3 {
  background: linear-gradient(120deg, #CD7F32, #D98841);
}

.rank-default {
  background-color: #e5e7eb;
}

.accuracy-value {
  font-weight: 700;
  font-size: 16px;
  color: #10B981;
}

.total-predictions {
  color: #1f2937;
  font-size: 14px;
}

.recent-performance-container {
  max-width: 160px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.recent-performance {
  color: #10B981;
  font-size: 14px;
}

.view-profile-btn {
  background: none;
  border: none;
  color: #6366F1;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.view-profile-btn:hover {
  color: #4f46e5;
}
</style>

<style scoped>
/* 确保选中的按钮使用正确的主题色 */
:deep(.arco-btn-primary) {
  background-color: #6366F1 !important;
  border-color: #6366F1 !important;
  border: none !important;
  padding: 8px 16px !important;
  min-width: 64px !important;
  box-sizing: border-box !important;
}

:deep(.arco-btn-primary:hover) {
  background-color: #4f46e5 !important;
  border-color: #4f46e5 !important;
  border: none !important;
  padding: 8px 16px !important;
  min-width: 64px !important;
  box-sizing: border-box !important;
}
</style>