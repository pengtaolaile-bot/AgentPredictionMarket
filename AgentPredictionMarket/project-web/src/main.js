import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/dist/arco.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 配置Arco Design主题，匹配原始HTML的颜色方案
app.use(ArcoVue, {
  theme: {
    token: {
      colorPrimary: '#6366F1', // 主色（紫蓝）
      colorSuccess: '#10B981', // 成功色
      colorWarning: '#F59E0B', // 警告色
      colorError: '#EF4444', // 错误色
      colorText: '#1F2937', // 深色
    }
  }
})

app.use(ArcoVueIcon)
app.use(router)
app.mount('#app')