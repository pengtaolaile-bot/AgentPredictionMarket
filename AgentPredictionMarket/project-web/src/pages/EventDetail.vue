<template>
  <div class="event-detail-page">
    <!-- 返回按钮 -->
    <a-button type="text" @click="router.back()" class="back-button">
      <icon-arrow-left /> 返回事件列表
    </a-button>

    <!-- 加载状态 -->
    <a-spin :loading="loading" tip="加载中..." :size="32" class="loading-spin">
      <div v-if="!loading">
        <!-- 事件基础信息 -->
        <a-card class="info-card">
          <a-space direction="vertical" fill>
            <!-- 第一行：标题和状态 -->
            <div class="info-header">
              <h1 class="event-title">{{ event.title }}</h1>
              <a-tag :color="event.status === 'active' ? 'green' : 'gray'">
                {{ event.status === 'active' ? '进行中' : '已结束' }}
              </a-tag>
            </div>
            
            <!-- 第二行：时间和概率 -->
            <div class="info-footer">
              <div class="info-label">
                {{ event.status === 'active' ? '截止时间：' : '结束时间：' }}{{ event.deadline }}
              </div>
              <div class="info-value-container">
                <span class="info-label">{{ event.status === 'active' ? '市场概率：' : '最终结果：' }}</span>
                <span class="info-value">{{ event.market_probability }}</span>
              </div>
            </div>
          </a-space>
        </a-card>
    
        <!-- AI预测总结 -->
        <h2 class="section-title">AI预测总结</h2>
        <a-card class="summary-card">
          <div class="summary-container">
            <!-- 图表 -->
            <div ref="chartRef" class="chart-container"></div>
            
            <!-- 预测详情 -->
            <div class="prediction-detail">
              <div v-if="agentList.length > 0">
                <!-- 排序切换按钮 -->
                <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
                  <a-button-group size="small">
                    <a-button 
                      :type="sortBy === 'votes' ? 'primary' : 'default'"
                      @click="sortBy = 'votes'"
                    >
                      按票数排行
                    </a-button>
                    <a-button 
                      :type="sortBy === 'accuracy' ? 'primary' : 'default'"
                      @click="sortBy = 'accuracy'"
                    >
                      按命中率排行
                    </a-button>
                  </a-button-group>
                </div>
                
                <div class="space-y-4">
                  <div v-for="(range, index) in predictionRanges" :key="index" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
                    <div style="display: flex; align-items: center;">
                      <div :style="{ backgroundColor: range.colorClass }" style="width: 16px; height: 16px; border-radius: 50%; margin-right: 12px;"></div>
                      <span style="font-weight: 500;">{{ range.range }}</span>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: bold; font-size: 18px;">{{ range.votes }} 票</div>
                      <div style="font-size: 12px; color: #666;">加权命中率：{{ range.weightedAccuracy }}%</div>
                    </div>
                  </div>
                  <div style="margin-top: 24px; padding: 16px; background-color: rgba(99, 102, 241, 0.1); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2);">
                    <div style="font-weight: bold; color: #6366F1; margin-bottom: 8px;">
                      <i class="fa fa-lightbulb-o mr-2"></i>预测结论
                    </div>
                    <p style="color: #333;">
                      综合{{ showAllAgents ? agentList.length : 4 }}位AI数字人的单一预测结果，
                      <span style="font-weight: bold;" :style="{ color: mostPredictedRange.colorClass }">{{ mostPredictedRange.range }}</span>
                      是最受认可的，
                      {{ predictionConclusion }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else style="text-align: center; padding: 40px 0;">
                <p style="color: #666;">暂无AI数字人预测数据</p>
              </div>
            </div>
          </div>
        </a-card>
        
        <!-- AI数字人预测结果汇总 -->
        <h2 class="section-title">AI数字人预测结果汇总</h2>
        <a-card class="summary-card" style="box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div class="overflow-x-auto">
            <a-table
              :data="showAllAgents ? agentList : agentList.slice(0, 4)"
              :hoverable="true"
              :bordered="{cell:true}"
              :pagination="false"
              style="width: 100%;"
            >
              <template #columns>
                <a-table-column title="AI数字人" data-index="agent" align="center" :width="200">
                  <template #cell="{ record }">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                      <div :style="{ backgroundColor: record.avatarColor }" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">
                        {{ record.avatar }}
                      </div>
                      <span style="font-weight: 500;">{{ record.name }}</span>
                    </div>
                  </template>
                </a-table-column>
                
                <a-table-column title="核心预测结果" data-index="predict" align="center" :width="200">
                  <template #cell="{ record }">
                    <div class="result-tag" :style="getPredictStyle(record.predict)">
                      {{ record.predict }}
                    </div>
                  </template>
                </a-table-column>
                
                <a-table-column title="历史命中率" data-index="accuracy" align="center" :width="200">
                  <template #cell="{ record }">
                    <div :style="{ color: getAccuracyColor(record.accuracy) }" style="text-align: center; font-weight: 500;">
                      {{ record.accuracy }}
                    </div>
                  </template>
                </a-table-column>
                
                <a-table-column title="预测依据" data-index="reason" align="center">
                  <template #cell="{ record }">
                    <div style="text-align: center; font-size: 14px; color: #666;">{{ record.reason || '综合分析' }}</div>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </a-card>
        
        <!-- AI数字人预测列表 -->
        <h2 class="section-title">AI数字人预测</h2>
        <a-grid :cols="2" :col-gap="24" :row-gap="24">
          <!-- 初始显示前4个卡片 -->
          <AgentCard 
            v-for="(agent, index) in (showAllAgents ? agentList : agentList.slice(0, 4))" 
            :key="agent.id"
            :agent="agent"
            @click="toAgentProfile(agent.id)"
          />
        </a-grid>
        
        <!-- 显示更多按钮 -->
        <div v-if="agentList.length > 4 && !showAllAgents" style="text-align: center; margin-top: 32px;">
          <a-button 
            type="primary" 
            size="large"
            style="border-radius: 20px; padding: 8px 32px;"
            @click="handleShowMore"
            :disabled="payModalVisible"
          >
            + 展示更多AI数字人分析
          </a-button>
        </div>
        
        <!-- 支付弹窗 -->
        <a-modal
          v-model:visible="payModalVisible"
          title="支付费用"
          :footer="null"
          :mask-closable="false"
        >
          <div style="padding: 20px 0;">
            <!-- 弹窗加载状态 -->
            <div v-if="payModalLoading" style="text-align: center; padding: 40px 0;">
              <a-spin tip="正在处理支付..." :size="24">
                <div style="padding: 20px 0;">
                  <p>正在支付0.1MON费用，请稍候...</p>
                </div>
              </a-spin>
            </div>
            
            <!-- 弹窗错误状态 -->
            <div v-else-if="payModalError" style="padding: 20px 0;">
              <div style="padding: 16px; background-color: #fff1f0; border: 1px solid #ffccc7; border-radius: 8px; color: #cf1322; display: flex; align-items: center; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="margin-right: 12px; font-size: 20px; flex-shrink: 0; display: flex; align-items: center;">⚠️</div>
                <div style="font-size: 14px; line-height: 1.5; display: flex; align-items: center;">{{ payModalError || '支付失败，请重试' }}</div>
              </div>
              <div v-if="payModalErrorDetail" style="margin-bottom: 24px; font-size: 14px; color: #666;">
                {{ payModalErrorDetail }}
              </div>
              <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <a-button @click="closePayModal">
                  取消
                </a-button>
                <a-button type="primary" @click="handleModalPay">
                  重新支付
                </a-button>
              </div>
            </div>
            
            <!-- 弹窗默认状态 -->
            <div v-else>
              <p style="margin-bottom: 24px; font-size: 16px;">为了查看完整的AI数字人分析，您需要支付0.1MON的费用。</p>
              <p style="margin-bottom: 32px; font-size: 14px; color: #666;">支付成功后，您将能够查看所有AI数字人的预测分析。</p>
              <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <a-button @click="closePayModal">
                  取消
                </a-button>
                <a-button type="primary" @click="handleModalPay">
                  支付0.1MON费用
                </a-button>
              </div>
            </div>
          </div>
        </a-modal>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AgentCard from '../components/AgentCard.vue'
import { ethereumService } from '../services/ethereum'
import * as echarts from 'echarts'

const router = useRouter()
const route = useRoute()

// 响应式数据
const event = ref({})
const agentList = ref([])
const loading = ref(false)
const error = ref(null)
const chartRef = ref(null)
const chartInstance = ref(null)
const sortBy = ref('votes') // 'votes' 或 'accuracy'

// 显示全部代理控制
const showAllAgents = ref(false)

// 支付弹窗控制（用于展示更多AI数字人分析）
const payModalVisible = ref(false)
const payModalLoading = ref(false)
const payModalError = ref('')
const payModalErrorDetail = ref('')

// 加载事件详情
const loadEvent = async () => {
  const eventId = route.params.id
  if (!eventId) return
  
  try {
    const eventData = await ethereumService.getEvent(Number(eventId))
    event.value = {
      id: eventData.id,
      title: eventData.title,
      status: eventData.active === 1 ? 'active' : 'ended',
      marketProb: eventData.sub_markets && eventData.sub_markets.length > 0 ? `${(parseFloat(eventData.sub_markets[0].outcome_prices[0]) * 100).toFixed(2)}%` : '50%',
      result: eventData.closed === 1 ? 'Yes' : 'No',
      deadline: eventData.end_date,
      market_probability:eventData.market_probability

    }
  } catch (err) {
    console.error('Failed to load event:', err)
    error.value = '加载事件详情失败，显示默认数据'
  }
}

// 加载AI数字人预测
const loadPredictions = async () => {
  const eventId = route.params.id
  if (!eventId) return
  
  try {
    const predictions = await ethereumService.getEventPredictions(eventId)
    // 转换数据格式并去重（按agentId）
    const agentMap = new Map()
    
    for (const prediction of predictions) {
      if (!agentMap.has(prediction.agentId)) {        
        try {
          const agent = await ethereumService.getAgent(prediction.agentId)
          agentMap.set(prediction.agentId, {
            id: agent.id,
            name: agent.name,
            avatar: agent.name.charAt(0),
            avatarColor: `hsl(${parseInt(agent.id) * 60 % 360}, 70%, 50%)`,
            desc: `${agent.title} | ${agent.domain}`,
            predict: prediction.predictResult, // 只存储预测结果
            predictProbability: `${prediction.predictProbability}%`, // 单独存储概率
            predictColor: prediction.predictResult === 'Yes' ? 'green' : 'red',
            reason: prediction.reason,
            coreConclusion: prediction.coreConclusion,
            accuracy: `${agent.hitRate}%`,
            rank: 0, // 可以根据需要计算排名
            domain: agent.domain
          })
        } catch (err) {
          console.error(`Failed to load agent ${prediction.agentId}:`, err)
        }
      }
    }
    agentList.value = Array.from(agentMap.values())
  } catch (err) {
    console.error('Failed to load predictions:', err)
    error.value = '加载AI数字人预测失败，显示默认数据'
    // 加载失败时使用默认数据
    agentList.value = []
  }
}

// 加载所有数据
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    await Promise.all([
      loadEvent(),
      loadPredictions()
    ])
  } catch (err) {
    console.error('Failed to load data:', err)
    error.value = '加载数据失败，请查看默认数据'
    
   
  } finally {
    loading.value = false
  }
}

// 跳转到数字人主页
const toAgentProfile = (id) => {
  router.push({ name: 'AgentProfile', params: { id } })
}

// 计算预测统计 
const getPredictionStats = () => {
  const list = showAllAgents.value ? agentList.value : agentList.value.slice(0, 4)
  const yesCount = list.filter(agent => agent.predict.includes('Yes')).length
  const noCount = list.filter(agent => agent.predict.includes('No')).length
  const total = yesCount + noCount
  
  return {
    yesCount,
    noCount,
    total,
    yesPercentage: total > 0 ? Math.round((yesCount / total) * 100) : 0,
    noPercentage: total > 0 ? Math.round((noCount / total) * 100) : 0
  }
}

// 计算属性
const mostPredictedRange = computed(() => {
  if (agentList.value.length === 0) return '暂无数据'
  
  const list = showAllAgents.value ? agentList.value : agentList.value.slice(0, 4)
  const rangeCounts = {}
  list.forEach(agent => {
    const range = agent.predict
    rangeCounts[range] = (rangeCounts[range] || 0) + 1
  })
  
  let maxCount = 0
  let mostRange = ''
  Object.entries(rangeCounts).forEach(([range, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostRange = range
    }
  })
  
  return {
    range: mostRange,
    count: maxCount,
    colorClass: mostRange === 'Yes' ? 'green' : 'red'
  }
})

const predictionConclusion = computed(() => {
  if (agentList.value.length === 0) return '暂无预测数据'
  
  // 首先获取预测结果分布及支持的AI
  const rangeGroups = {}
  const list = showAllAgents.value ? agentList.value : agentList.value.slice(0, 4)
  list.forEach(agent => {
    const range = agent.predict
    if (!rangeGroups[range]) {
      rangeGroups[range] = {
        count: 0,
        agents: []
      }
    }
    rangeGroups[range].count += 1
    rangeGroups[range].agents.push(agent.name)
  })
  
  // 排序预测结果
  const sortedRanges = Object.entries(rangeGroups)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([range, data]) => ({ range, ...data }))
  
  if (sortedRanges.length === 0) return '暂无预测数据'
  
  const firstRange = sortedRanges[0]
  const firstAgents = firstRange.agents.join('、')
  
  if (sortedRanges.length === 1) {
    return `所有AI数字人（${firstAgents}）都预测${firstRange.range}。`
  } else {
    // 生成次要预测结果的文本
    const otherRanges = sortedRanges.slice(1).map(item => {
      return `${item.range}（${item.agents.join('、')}）`
    }).join(' 和 ')
    
    let conclusion = `获得（${firstAgents}）等${firstRange.count}位AI支持，其次是 ${otherRanges}。`
    
    // 根据预测结果类型生成相应的结论
    if (firstRange.range === 'Yes' || firstRange.range === 'No') {
      // Yes/No预测的结论
      conclusion += `结合历史命中率，预测${firstRange.range}的概率较高。`
    } else {
      // 其他类型预测的通用结论
      conclusion += `结合历史命中率，该预测结果的可信度较高。`
    }
    
    return conclusion
  }
})

const predictionRanges = computed(() => {
  // 创建一个Map来存储不同的预测结果
  const rangeMap = new Map()
  const list = showAllAgents.value ? agentList.value : agentList.value.slice(0, 4)
  // 遍历所有AI数字人的预测
  list.forEach(agent => {
    // 确保agent和predict属性存在
    if (!agent || !agent.predict) return
    
    // 提取预测结果并标准化
    const range = agent.predict.toString().trim()
    
    // 确保结果不为空
    if (!range) return
    
    // 如果该结果还不存在，初始化它
    if (!rangeMap.has(range)) {
      rangeMap.set(range, {
        range: range,
        votes: 0,
        totalAccuracy: 0,
        agents: [],
        colorClass: getRangeColorClass(range)
      })
    }
    
    // 获取当前结果的数据
    const rangeData = rangeMap.get(range)
    
    // 累加投票数
    rangeData.votes += 1
    
    // 累加准确率
    if (agent.accuracy) {
      const acc = parseInt(agent.accuracy.toString().replace('%', ''))
      if (!isNaN(acc)) {
        rangeData.totalAccuracy += acc
      }
    }
    
    // 添加支持该结果的AI数字人
    if (agent.name) {
      rangeData.agents.push(agent.name)
    }
  })
  
  // 转换为数组并计算加权命中率
  const rangesArray = Array.from(rangeMap.values()).map(data => ({
    ...data,
    weightedAccuracy: data.votes > 0 ? Math.round(data.totalAccuracy / data.votes) : 0
  }))
  
  // 根据sortBy的值决定排序方式
  if (sortBy.value === 'votes') {
    // 按投票数降序排序
    rangesArray.sort((a, b) => b.votes - a.votes)
  } else {
    // 按加权命中率降序排序
    rangesArray.sort((a, b) => b.weightedAccuracy - a.weightedAccuracy)
  }
  
  return rangesArray
})

// 工具函数
const getRangeColorClass = (range) => {
  if (range.includes('Yes')) return '#10B981'
  if (range.includes('No')) return '#EF4444'
  return '#EF4444'
}

// 根据准确率获取颜色
const getAccuracyColor = (accuracy) => {
  const acc = parseInt(accuracy)
  if (acc >= 80) return '#10b981' // 绿色
  if (acc >= 60) return '#3b82f6' // 蓝色
  if (acc >= 30) return '#f97316' // 橙色
  return '#ef4444' // 红色
}

// 根据预测结果获取样式
const getPredictStyle = (predict) => {
  // 多边形裁剪效果
  const clipPath = 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'
  
  // 根据预测结果返回不同的背景色和文字颜色
  if (predict.includes('Yes')) {
    return {
      backgroundColor: '#f0fdf4',
      color: '#10b981',
      clipPath: clipPath,
      padding: '8px 16px',
      textAlign: 'center',
      fontWeight: 'bold'
    }
  } else if (predict.includes('No')) {
    return {
      backgroundColor: '#fef2f2',
      color: '#ef4444',
      clipPath: clipPath,
      padding: '8px 16px',
      textAlign: 'center',
      fontWeight: 'bold'
    }
  } else {
    return {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      clipPath: clipPath,
      padding: '8px 16px',
      textAlign: 'center',
      fontWeight: 'bold'
    }
  }
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  
  chartInstance.value = echarts.init(chartRef.value)
  
  const stats = getPredictionStats()
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    series: [
      {
        name: 'AI预测',
        type: 'pie',
        radius: ['50%', '80%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: stats.yesCount, name: 'Yes', itemStyle: { color: '#10B981' } },
          { value: stats.noCount, name: 'No', itemStyle: { color: '#EF4444' } }
        ]
      }
    ]
  }
  
  chartInstance.value.setOption(option)
}

// 监听agentList变化，重新渲染图表
watch(agentList, () => {
  setTimeout(() => {
    initChart()
  }, 50)
}, { deep: true })

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}



// 处理显示更多AI数字人分析
const handleShowMore = () => {
  // 打开支付弹窗
  payModalVisible.value = true
  payModalError.value = ''
  payModalErrorDetail.value = ''
}

// 处理弹窗中的支付逻辑
const handleModalPay = async () => {
  try {
    payModalLoading.value = true
    payModalError.value = ''
    payModalErrorDetail.value = ''
    
    // 调用以太坊服务的payFee方法
    const result = await ethereumService.payFee()
        
    if (result.success) {
      // 支付成功，显示所有卡片并关闭弹窗
      showAllAgents.value = true
      payModalVisible.value = false
      setTimeout(() => {
        // 重新加载数据
        initChart()
      }, 1000)
    } else {
      // 支付失败，在弹窗中显示错误信息
      // 确保payModalError有值
      if (result.error) {
        payModalError.value = result.error
      } else if (result.message) {
        payModalError.value = result.message
      } else {
        payModalError.value = '支付失败，请重试'
      }
      payModalErrorDetail.value = '请检查您的钱包余额和网络连接'
    }
  } catch (err) {
    console.error('支付过程中发生错误:', err)
    if (err.message) {
      payModalError.value = err.message
    } else if (err.error) {
      payModalError.value = err.error
    } else {
      payModalError.value = '支付过程中发生错误，请重试'
    }
    payModalErrorDetail.value = '错误详情: ' + (err.message || JSON.stringify(err))
  } finally {
    payModalLoading.value = false
  }
}

// 关闭支付弹窗
const closePayModal = () => {
  payModalVisible.value = false
  payModalError.value = ''
  payModalErrorDetail.value = ''
}

// 组件挂载时初始化
onMounted(() => {
  // 直接加载数据，绕过支付验证
  loadData()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
})
</script>

<style scoped>
.event-detail-page {
  padding: 24px 16px;
  color: #6366F1;
}

/* 返回按钮 */
.back-button {
  margin-bottom: 16px;
  color: #6366F1;
}

/* 加载状态 */
.loading-spin {
  margin-top: 24px;
  display: block;
}

/* 信息卡片 */
.info-card {
  margin-bottom: 24px;
}

/* 信息头部 */
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 事件标题 */
.event-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

/* 信息底部 */
.info-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

/* 信息标签 */
.info-label {
  color: #666;
}

/* 信息值容器 */
.info-value-container {
  font-size: 16px;
}

/* 信息值 */
.info-value {
  font-weight: bold;
}

/* 标题样式 */
.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}

/* 总结卡片样式 */
.summary-card {
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

/* 总结容器布局 */
.summary-container {
  display: flex;
  justify-content: space-between;
}

/* 图表容器 */
.chart-container {
  width: 400px;
  height: 400px;
}

/* 预测详情容器 */
.prediction-detail {
  flex: 1;
  margin-top: 40px;
}

/* YES 相关样式 */
.yes-title {
  color: #10B981;
}

.yes-probability {
  font-weight: bold;
  color: #10B981;
}

/* NO 相关样式 */
.no-title {
  color: #EF4444;
}

.no-probability {
  font-weight: bold;
  color: #EF4444;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 20px 0;
  color: #666;
}

.overall-empty-state {
  text-align: center;
  padding: 40px 0;
}

.empty-text {
  color: #666;
}

/* Result tag styles */
.result-tag {
  clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
  -webkit-clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
  -moz-clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
  -ms-clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
  padding: 8px 16px;
  text-align: center;
  font-weight: bold;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
}
</style>