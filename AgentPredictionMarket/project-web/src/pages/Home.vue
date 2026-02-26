<template>
  <div>
    <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 24px;">AI数字人预测事件</h1>
    
    <!-- 筛选栏 -->
    <!-- <a-space wrap style="margin-bottom: 24px;"> -->
      <div style="margin-bottom: 16px;">  
        <span style="color: #666;">领域：</span>
        <a-button
          style="margin-right: 8px;"
          v-for="item in domainList" 
          :key="item.key"
          :type="activeDomain === item.key ? 'primary' : 'default'"
          :disabled="loading"
          @click="activeDomain = item.key"
        >
          {{ item.name }}
        </a-button>
      </div>
      <div style="margin-bottom: 16px;">
        <span style="color: #666;">状态：</span>
        <a-button
          style="margin-right: 8px;"
          :type="activeStatus === 'all' ? 'primary' : 'default'"
          :disabled="loading"
          @click="activeStatus = 'all'"
        >
          全部
        </a-button>
        <a-button 
          style="margin-right: 8px;"
          :type="activeStatus === 'active' ? 'primary' : 'default'"
          :disabled="loading"
          @click="activeStatus = 'active'"
        >
          进行中
        </a-button>
        <a-button 
          style="margin-right: 8px;"
          :type="activeStatus === 'ended' ? 'primary' : 'default'"
          :disabled="loading"
          @click="activeStatus = 'ended'"
        >
          已结束
        </a-button>
      </div>
    <!-- </a-space> -->

    <!-- 事件列表 -->
    <a-spin :loading="loading" tip="加载中..." :size="32" style="margin-top: 24px; display: block;">
      <div v-if="!loading">
        <a-grid :cols="3" :col-gap="24" :row-gap="24">
          <EventCard 
            v-for="event in eventList" 
            :key="event.id"
            :event="event"
            @click="toEventDetail(event.id)"
          />
        </a-grid>
      </div>
    </a-spin>
    
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
          <p style="margin-bottom: 24px; font-size: 16px;">为了访问事件详情，您需要支付0.1MON的费用。</p>
          <p style="margin-bottom: 32px; font-size: 14px; color: #666;">支付成功后，您将能够查看该事件的完整详情和AI数字人分析。</p>
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
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import EventCard from '../components/EventCard.vue'
import { ethereumService } from '../services/ethereum'

const router = useRouter()
// 领域筛选
const domainList = [
  { key: 'all', name: '全部' },
  { key: 'crypto', name: '加密货币' },
  { key: 'courts', name: '法律' },
  { key: 'politics', name: '政治' },
  { key: 'economy', name: '经济' },
  { key: 'sports', name: '体育' },
  { key: 'technology', name: '科技' },
  { key: 'healthcare', name: '医疗' },
  { key: 'climate', name: '气候' },
  { key: 'entertainment', name: '娱乐' },
  { key: 'finance', name: '金融' },
  { key: 'markets', name: '市场' },
  { key: 'regulation', name: '监管' },
  { key: 'elections', name: '选举' },
  { key: 'other', name: '其他' },
]
const activeDomain = ref('all')
// 状态筛选
const activeStatus = ref('all')

// 事件列表数据
const eventList = ref([])
const loading = ref(false)
const error = ref(null)

// 支付弹窗控制
const payModalVisible = ref(false)
const payModalLoading = ref(false)
const payModalError = ref('')
const payModalErrorDetail = ref('')
const targetEventId = ref(null)

// 加载事件数据
const loadEvents = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 准备参数：领域为空字符串表示全部领域，状态码2表示全部状态
    const domain = activeDomain.value === 'all' ? '' : activeDomain.value
    const status = activeStatus.value === 'all' ? 0 : (activeStatus.value === 'active' ? 1 : 2)
    
    // 直接获取事件列表
    const events = await ethereumService.getEvents(domain, status)
    // 转换事件数据格式以匹配EventCard组件的期望
    eventList.value = events.map(event => ({
      id: event.id,
      title: event.title,
      domain: event.main_category || 'Crypto', // 默认领域
      status: event.active === 1 ? 'active' : 'ended',
      marketProb: '50%', // 从子市场获取概率
      result: event.market_probability, // 根据closed字段判断结果
      deadline: event.end_date || event.close_date || 'N/A', // 优先使用close_date， fallback到end_date
      market_probability: event.market_probability || 'N/A' // 从子市场获取概率
    }))
  } catch (err) {
    console.error('Failed to load events:', err)
    error.value = '加载事件失败，请稍后重试'
    // 加载失败时使用默认数据
    eventList.value = []
  } finally {
    loading.value = false
  }
}

// 跳转到事件详情
const toEventDetail = (id) => {
  // 打开支付弹窗，设置目标事件ID
  targetEventId.value = id
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
      // 支付成功，跳转到详情页并关闭弹窗
      payModalVisible.value = false
      router.push({ name: 'EventDetail', params: { id: targetEventId.value } })
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
  targetEventId.value = null
}

// 监听筛选条件变化，重新加载数据
watch([activeDomain, activeStatus], () => {
  loadEvents()
})

// 组件挂载时加载数据
onMounted(() => {
  loadEvents()
})
</script>

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