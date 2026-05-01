<template>
  <div class="panel-stack">
    <div class="section-head">
      <div>
        <div class="section-title">评价管理</div>
        <div class="section-subtitle">处理异常评价，清理恶意内容</div>
      </div>
      <button class="ghost-btn" @click="load">刷新</button>
    </div>

    <div class="toolbar">
      <input v-model.trim="keyword" class="toolbar-input" placeholder="搜索评价内容" />
      <button class="primary-btn compact" @click="load">查询</button>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>订单</th>
            <th>评价人</th>
            <th>被评价人</th>
            <th>角色</th>
            <th>星级</th>
            <th>内容</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.orderId }}</td>
            <td>{{ item.fromUserName || '-' }}</td>
            <td>{{ item.toUserName || '-' }}</td>
            <td>{{ item.role }}</td>
            <td>{{ item.star }}</td>
            <td>{{ item.comment || '-' }}</td>
            <td>{{ formatDate(item.createTime) }}</td>
            <td>
              <button class="table-btn danger" @click="remove(item.id)">删除</button>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="9" class="empty-cell">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { adminApi, type AdminEvaluation } from '../api/http'

const rows = ref<AdminEvaluation[]>([])
const keyword = ref('')

const formatDate = (value: string) => (value ? value.slice(0, 16).replace('T', ' ') : '-')

const load = async () => {
  const { data } = await adminApi.evaluations({ page: 1, pageSize: 20, keyword: keyword.value })
  rows.value = data.list || []
}

const remove = async (id: number) => {
  if (!window.confirm('确认删除这条评价吗？')) return
  await adminApi.deleteEvaluation(id)
  await load()
}

onMounted(load)
</script>
