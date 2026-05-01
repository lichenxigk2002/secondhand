<template>
  <div class="panel-stack">
    <div class="section-head">
      <div>
        <div class="section-title">用户管理</div>
        <div class="section-subtitle">查看用户资料并执行封禁或解封</div>
      </div>
      <button class="ghost-btn" @click="load">刷新</button>
    </div>

    <div class="toolbar">
      <input v-model.trim="keyword" class="toolbar-input" placeholder="搜索昵称 / 手机 / 校内区域" />
      <button class="primary-btn compact" @click="load">查询</button>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>昵称</th>
            <th>手机</th>
            <th>校内区域</th>
            <th>信用分</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.nickName || '-' }}</td>
            <td>{{ item.phone || '-' }}</td>
            <td>{{ item.campus || '-' }}</td>
            <td>{{ item.creditScore }}</td>
            <td><span :class="item.status === 1 ? 'tag success' : 'tag danger'">{{ item.status === 1 ? '正常' : '禁用' }}</span></td>
            <td>{{ formatDate(item.createTime) }}</td>
            <td>
              <button class="table-btn" @click="toggleStatus(item)">
                {{ item.status === 1 ? '封禁' : '解封' }}
              </button>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="8" class="empty-cell">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { adminApi, type AdminUser } from '../api/http'

const rows = ref<AdminUser[]>([])
const keyword = ref('')

const formatDate = (value: string) => (value ? value.slice(0, 16).replace('T', ' ') : '-')

const load = async () => {
  const { data } = await adminApi.users({ keyword: keyword.value, page: 1, pageSize: 20 })
  rows.value = data.list || []
}

const toggleStatus = async (item: AdminUser) => {
  const nextStatus = item.status === 1 ? 0 : 1
  await adminApi.updateUserStatus(item.id, nextStatus)
  await load()
}

onMounted(load)
</script>
