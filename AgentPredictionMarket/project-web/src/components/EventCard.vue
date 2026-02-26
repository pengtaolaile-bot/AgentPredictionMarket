<template>
  <div class="event-card" @click="handleClick">
    <div class="event-header">
      <a-tag :color="getDomainColor(event.domain)" class="domain-tag">
        {{ getDomainName(event.domain) }}
      </a-tag>
      <a-tag :color="getStatusColor(event.status)" class="status-tag">
        {{ getStatusName(event.status) }}
      </a-tag>
    </div>
    <h3 class="event-title">{{ event.title }}</h3>
    <div class="event-probability">
      <span class="probability-label">{{ event.status === 'active' ? '市场当前概率：' : '最终结果：' }}</span>
      <span class="probability-value">{{ event.status === 'active' ? event.market_probability : event.result }}</span>
    </div>
    <div class="event-deadline">
      {{ event.status === 'active' ? '截止时间：' : '结束时间：' }}{{ event.deadline }}
    </div>
    <div class="view-button-wrapper">
      <a-button type="primary" block size="small" class="view-button" @click.stop="handleClick">
        查看AI预测 <icon-arrow-right class="arrow-icon" />
      </a-button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}

// 获取领域标签颜色
const getDomainColor = (domain) => {
  // 处理多个领域的情况，取第一个领域的颜色
  const firstDomain = domain.split(',').map(d => d.trim().toLowerCase())[0]
  const colorMap = {
    crypto: 'purple',
    courts: 'red',
    politics: 'blue',
    economy: 'green',
    sports: 'orange',
    technology: 'geekblue',
    healthcare: 'cyan',
    climate: 'teal',
    entertainment: 'magenta',
    finance: 'yellow',
    markets: 'gold',
    regulation: 'gray',
    elections: 'indigo'
  }
  return colorMap[firstDomain] || 'gray'
}

// 获取领域名称
const getDomainName = (domain) => {
  // 处理多个领域的情况，将每个领域转换为中文名称
  const domains = domain.split(',').map(d => d.trim().toLowerCase())
  const nameMap = {
    crypto: '加密货币',
    courts: '法律',
    politics: '政治',
    economy: '经济',
    sports: '体育',
    technology: '科技',
    healthcare: '医疗',
    climate: '气候',
    entertainment: '娱乐',
    finance: '金融',
    markets: '市场',
    regulation: '监管',
    elections: '选举',
    other: '其他'
  }
  return domains.map(d => nameMap[d] || '其他').join('、')
}

// 获取状态颜色
const getStatusColor = (status) => {
  // 处理状态为数字或字符串的情况
  const statusValue = typeof status === 'string' ? status.toLowerCase() : status
  if (statusValue === 'active' || statusValue === 1) {
    return 'green'
  } else if (statusValue === 'ended' || statusValue === 2) {
    return 'gray'
  }
  return 'gray'
}

// 获取状态名称
const getStatusName = (status) => {
  // 处理状态为数字或字符串的情况
  const statusValue = typeof status === 'string' ? status.toLowerCase() : status
  if (statusValue === 'active' || statusValue === 1) {
    return '进行中'
  } else if (statusValue === 'ended' || statusValue === 2) {
    return '已结束'
  }
  return '未知'
}
</script>

<style scoped>
.event-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.domain-tag,
.status-tag {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 9999px;
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
  line-height: 1.4;
}

.event-probability {
  margin-bottom: 12px;
  color: #6b7280;
  font-size: 14px;
}

.probability-value {
  font-weight: 700;
  color: #1f2937;
  font-size: 16px;
}

.event-deadline {
  margin-bottom: 20px;
  color: #9ca3af;
  font-size: 14px;
}

.view-button-wrapper {
  display: block;
  margin-top: auto;
}

.view-button {
  width: 100%;
  border-radius: 10px;
  height: 40px;
  font-weight: 500;
}

.arrow-icon {
  margin-left: 4px;
  font-size: 12px;
}
</style>