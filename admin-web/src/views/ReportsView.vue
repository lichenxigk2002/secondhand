<template>
  <div class="panel-stack">
    <div class="section-head">
      <div>
        <div class="section-title">举报处理</div>
        <div class="section-subtitle">集中查看举报原因，并记录处理结果</div>
      </div>
      <button class="ghost-btn" @click="load">刷新</button>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>举报人</th>
            <th>类型</th>
            <th>目标 ID</th>
            <th>原因</th>
            <th>补充说明</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.reporterName || '-' }}</td>
            <td>{{ item.targetType }}</td>
            <td>{{ item.targetId }}</td>
            <td>{{ item.reason }}</td>
            <td>{{ item.content || '-' }}</td>
            <td><span class="tag">{{ statusText(item.status) }}</span></td>
            <td class="action-cell">
              <button class="table-btn" @click="handle(item, 1)">已处理</button>
              <button class="table-btn warning" @click="handle(item, 2)">驳回</button>
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
import { adminApi, type AdminReport } from '../api/http'

const rows = ref<AdminReport[]>([])

const statusText = (value: number) => ['待处理', '已处理', '已驳回'][value] || '未知'

const load = async () => {
  const { data } = await adminApi.reports({ page: 1, pageSize: 20 })
  rows.value = data.list || []
}

const handle = async (item: AdminReport, status: number) => {
  const handleRemark = window.prompt('请输入处理备注', item.handleRemark || '') ?? ''
  await adminApi.handleReport(item.id, status, handleRemark)
  await load()
}

onMounted(load)
</script>
