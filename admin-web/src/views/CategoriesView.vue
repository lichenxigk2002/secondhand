<template>
  <div class="panel-stack">
    <div class="section-head">
      <div>
        <div class="section-title">分类管理</div>
        <div class="section-subtitle">新增和维护商品分类</div>
      </div>
      <button class="ghost-btn" @click="load">刷新</button>
    </div>

    <form class="toolbar" @submit.prevent="createCategory">
      <input v-model.trim="form.name" class="toolbar-input" placeholder="分类名称" />
      <input v-model.number="form.sortOrder" class="toolbar-input small" type="number" placeholder="排序" />
      <button class="primary-btn compact">新增分类</button>
    </form>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>排序</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.sortOrder }}</td>
            <td><span :class="item.status === 1 ? 'tag success' : 'tag danger'">{{ item.status === 1 ? '启用' : '停用' }}</span></td>
            <td>{{ formatDate(item.createTime) }}</td>
            <td>
              <button class="table-btn" @click="toggleStatus(item)">
                {{ item.status === 1 ? '停用' : '启用' }}
              </button>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="6" class="empty-cell">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { adminApi, type AdminCategory } from '../api/http'

const rows = ref<AdminCategory[]>([])
const form = reactive({
  name: '',
  sortOrder: 0,
})

const formatDate = (value: string) => (value ? value.slice(0, 16).replace('T', ' ') : '-')

const load = async () => {
  const { data } = await adminApi.categories()
  rows.value = data.list || []
}

const createCategory = async () => {
  if (!form.name) return
  await adminApi.createCategory({ name: form.name, sortOrder: form.sortOrder, status: 1, parentId: 0 })
  form.name = ''
  form.sortOrder = 0
  await load()
}

const toggleStatus = async (item: AdminCategory) => {
  const nextStatus = item.status === 1 ? 0 : 1
  await adminApi.updateCategory(item.id, { status: nextStatus })
  await load()
}

onMounted(load)
</script>
