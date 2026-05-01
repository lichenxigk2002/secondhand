<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-badge">LW</div>
        <div>
          <div class="brand-title">邻物集</div>
          <div class="brand-subtitle">后台管理系统</div>
        </div>
      </div>

      <nav class="nav">
        <RouterLink v-for="item in menus" :key="item.to" class="nav-link" :to="item.to">
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <div class="page-eyebrow">Admin Console</div>
          <div class="page-title">运营与内容管理</div>
        </div>
        <div class="topbar-actions">
          <div class="profile-chip">{{ profileText }}</div>
          <button class="ghost-btn" @click="logout">退出登录</button>
        </div>
      </header>

      <section class="content">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { adminApi, type AdminProfile } from '../api/http'

const router = useRouter()
const profile = ref<AdminProfile | null>(null)

const menus = [
  { label: '工作台', to: '/dashboard' },
  { label: '用户管理', to: '/users' },
  { label: '商品管理', to: '/goods' },
  { label: '举报处理', to: '/reports' },
  { label: '分类管理', to: '/categories' },
  { label: '订单管理', to: '/orders' },
  { label: '评价管理', to: '/evaluations' },
  { label: '管理员', to: '/accounts' },
  { label: '操作日志', to: '/logs' },
]

const profileText = computed(() => {
  if (!profile.value) return '未登录'
  return `${profile.value.realName || profile.value.username} · ${profile.value.role}`
})

const logout = () => {
  adminApi.logout().catch(() => {})
  localStorage.removeItem('admin_token')
  router.push('/login')
}

onMounted(async () => {
  try {
    const { data } = await adminApi.profile()
    profile.value = data
  } catch {
    logout()
  }
})
</script>
