<template>
  <a-config-provider theme="light">
    <div class="app-container">
      <!-- 导航栏 -->
      <a-layout-header style="background: #fff; box-shadow: 0 1px 2px #eee; position: sticky; top: 0; z-index: 100;">
        <div class="header-container">
          <a-space>
            <i class="fa-solid fa-brain" style="font-size: 24px; color: #6366F1;" />
            <p class="logo-text" @click="toHome">AI预测榜</p>
          </a-space>
          <a-space size="large">
            <router-link to="/" class="nav-link">首页</router-link>
            <span class="nav-link" style="cursor: pointer;" @click="navigateToRanking">排行榜</span>
            <router-link to="/about" class="nav-link">关于</router-link>
          </a-space>
          <div class="wallet-section">
            <a-space v-if="!walletAddress" size="small">
              <a-button type="primary" @click="connectWallet" :loading="isConnecting">
                连接钱包
              </a-button>
            </a-space>
            <a-space v-else size="small">
              <span class="wallet-address">{{ formattedWalletAddress }}</span>
              <a-button type="default" @click="disconnectWallet">
                断开
              </a-button>
            </a-space>
          </div>
        </div>
      </a-layout-header>

      <!-- 主内容区 -->
      <a-layout-content class="main-content">
        <div class="content-container">
          <router-view />
        </div>
      </a-layout-content>

      <!-- 页脚 -->
      <a-layout-footer class="app-footer">
        <span style="color: #666;">AI数字人预测排行榜 © 2026 | Hackathon MVP</span>
      </a-layout-footer>
    </div>
  </a-config-provider>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import walletService from './services/wallet.service'

const router = useRouter()
const walletAddress = ref('')
const isConnecting = ref(false)

const toHome = () => {
  router.push('/')
}

// 导航到排行榜页面（需检查钱包连接状态）
const navigateToRanking = () => {
  if (walletService.isWalletConnected()) {
    // 钱包已连接，直接导航到排行榜
    router.push('/ranking')
  } else {
    // 钱包未连接，提示用户连接钱包
    alert('请先连接钱包后再查看排行榜')
  }
}

// 格式化钱包地址
const formattedWalletAddress = computed(() => {
  if (!walletAddress.value) return ''
  return `${walletAddress.value.slice(0, 6)}...${walletAddress.value.slice(-4)}`
})

// 连接钱包
const connectWallet = async () => {
  isConnecting.value = true
  try {
    // 初始化钱包服务
    walletService.init()
    // 连接钱包
    const result = await walletService.connect()
    if (result.success) {
      walletAddress.value = result.account
    } else {
      alert(`连接钱包失败: ${result.error}`)
    }
  } catch (error) {
    console.error('连接钱包失败:', error)
    alert('连接钱包失败，请确保已安装MetaMask并解锁')
  } finally {
    isConnecting.value = false
  }
}

// 断开钱包
const disconnectWallet = async () => {
  try {
    await walletService.disconnect()
    walletAddress.value = ''
  } catch (error) {
    console.error('断开钱包失败:', error)
  }
}

// 处理钱包连接状态变化
const handleWalletConnected = (data) => {
  if (data && data.account) {
    walletAddress.value = data.account
  }
}

// 处理钱包断开连接
const handleWalletDisconnected = () => {
  walletAddress.value = ''
}

// 处理钱包地址变化
const handleAccountsChanged = (account) => {
  if (account) {
    walletAddress.value = account
  } else {
    walletAddress.value = ''
  }
}

// 组件挂载时初始化钱包服务
onMounted(() => {
  // 初始化钱包服务
  walletService.init()
  
  // 添加事件监听器
  walletService.on('connected', handleWalletConnected)
  walletService.on('disconnected', handleWalletDisconnected)
  walletService.on('accountChanged', handleAccountsChanged)
  
  // 检查现有连接
  const account = walletService.getAccount()
  if (account) {
    walletAddress.value = account
  } else {
    // 页面刷新时，如果之前是连接状态，需要重新连接钱包
    // 这里不自动连接，而是让用户手动点击连接按钮
    // 因为自动连接可能会触发MetaMask的弹窗，影响用户体验
  }
})

// 组件卸载时清理事件监听器
onBeforeUnmount(() => {
  // 清理事件监听器
  walletService.off('connected', handleWalletConnected)
  walletService.off('disconnected', handleWalletDisconnected)
  walletService.off('accountChanged', handleAccountsChanged)
})
</script>
<style>
/* 全局样式重置，匹配原始HTML */
:root {
  --primary-6: #6366F1;
  --arcoblue-6: #6366F1;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #f9fafb;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1f2937;
  line-height: 1.5;
}

/* 调整Arco Design默认样式 */
.arco-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.arco-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.arco-btn {
  border: none;
  border-radius: 9999px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.arco-btn-primary {
  border: none;
  background-color: #6366F1;
  border-color: #6366F1;
}

.arco-btn-primary:hover {
  border: none;
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.arco-tag {
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
}

.arco-divider {
  margin: 16px 0;
}

/* 链接样式 */
.arco-link {
  color: #6366F1;
}

.arco-link:hover {
  color: #4f46e5;
}
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 钱包部分样式 */
.wallet-section {
  display: flex;
  align-items: center;
}

.wallet-address {
  font-size: 14px;
  color: #6b7280;
  font-family: monospace;
  margin-right: 8px;
  min-width: 120px;
  text-align: right;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #1F2937;
  text-decoration: none;
  cursor: pointer;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #6366F1;
}

.router-link-active {
  color: #6366F1;
  font-weight: 500;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  padding: 0px 16px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 页脚样式 */
.app-footer {
  text-align: center;
  background: #fff;
  padding: 20px 0;
  border-top: 1px solid #eee;
  margin-top: auto;
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
