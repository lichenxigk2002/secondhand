<template>
  <div class="panel-stack">
    <div class="section-head">
      <div>
        <div class="section-title">操作日志</div>
        <div class="section-subtitle">查看管理员关键操作，便于演示和追踪</div>
      </div>
      <button class="ghost-btn" @click="load">刷新</button>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>管理员</th>
            <th>动作</th>
            <th>目标类型</th>
            <th>目标 ID</th>
            <th>详情</th>
            <th>IP</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.adminName || '-' }}</td>
            <td>{{ item.action }}</td>
            <td>{{ item.targetType || '-' }}</td>
            <td>{{ item.targetId || '-' }}</td>
            <td>{{ item.detail || '-' }}</td>
            <td>{{ item.ip || '-' }}</td>
            <td>{{ formatDate(item.createTime) }}</td>
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
import { adminApi, type AdminLog } from '../api/http'

const rows = ref<AdminLog[]>([])

const formatDate = (value: string) => (value ? value.slice(0, 16).replace('T', ' ') : '-')

const load = async () => {
  const { data } = await adminApi.logs({ page: 1, pageSize: 20 })
  rows.value = data.list || []
}

onMounted(load)
</script>
