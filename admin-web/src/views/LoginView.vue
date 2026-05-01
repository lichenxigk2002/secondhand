<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="login-copy">
        <div class="page-eyebrow">Linwuji Admin</div>
        <h1>邻物集后台管理系统</h1>
        <p>用于商品审核、举报处理、用户管理和基础运营数据查看。</p>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <label class="field">
          <span>账号</span>
          <input v-model.trim="form.username" placeholder="请输入管理员账号" />
        </label>
        <label class="field">
          <span>密码</span>
          <input v-model.trim="form.password" type="password" placeholder="请输入密码" />
        </label>
        <button class="primary-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录后台' }}
        </button>
        <p class="hint">
          默认对接 <code>/api/admin/*</code>，如后端尚未实现这些接口，页面会显示加载失败。
        </p>
        <p v-if="error" class="error-text">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '../api/http'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const form = reactive({
  username: 'admin',
  password: 'admin123456',
})

const submit = async () => {
  if (!form.username || !form.password) {
    error.value = '请输入账号和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { data } = await adminApi.login(form)
    localStorage.setItem('admin_token', data.token)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
