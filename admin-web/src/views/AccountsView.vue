<template>
  <div class="panel-stack">
    <div class="section-head">
      <div>
        <div class="section-title">管理员账号</div>
        <div class="section-subtitle">维护后台账号和角色状态</div>
      </div>
      <button class="ghost-btn" @click="load">刷新</button>
    </div>

    <form class="toolbar" @submit.prevent="create">
      <input v-model.trim="form.username" class="toolbar-input" placeholder="账号" />
      <input v-model.trim="form.realName" class="toolbar-input" placeholder="姓名" />
      <input v-model.trim="form.password" class="toolbar-input" type="password" placeholder="密码" />
      <select v-model="form.role" class="toolbar-input small">
        <option value="admin">admin</option>
        <option value="super_admin">super_admin</option>
      </select>
      <button class="primary-btn compact">新增账号</button>
    </form>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>账号</th>
            <th>姓名</th>
            <th>角色</th>
            <th>状态</th>
            <th>最近登录</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.username }}</td>
            <td>{{ item.realName || '-' }}</td>
            <td>{{ item.role }}</td>
            <td><span :class="item.status === 1 ? 'tag success' : 'tag danger'">{{ item.status === 1 ? '启用' : '停用' }}</span></td>
            <td>{{ formatDate(item.lastLoginTime) }}</td>
            <td>{{ formatDate(item.createTime) }}</td>
            <td>
              <button class="table-btn" @click="toggleStatus(item)">
                {{ item.status === 1 ? '停用' : '启用' }}
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
import { onMounted, reactive, ref } from 'vue'
import { adminApi, type AdminAccount } from '../api/http'

const rows = ref<AdminAccount[]>([])
const form = reactive({
  username: '',
  realName: '',
  password: '',
  role: 'admin',
})

const formatDate = (value: string) => (value ? value.slice(0, 16).replace('T', ' ') : '-')

const load = async () => {
  const { data } = await adminApi.accounts()
  rows.value = data.list || []
}

const create = async () => {
  if (!form.username || !form.password) return
  await adminApi.createAccount({
    username: form.username,
    realName: form.realName,
    password: form.password,
    role: form.role,
    status: 1,
  })
  form.username = ''
  form.realName = ''
  form.password = ''
  form.role = 'admin'
  await load()
}

const toggleStatus = async (item: AdminAccount) => {
  const nextStatus = item.status === 1 ? 0 : 1
  await adminApi.updateAccount(item.id, { status: nextStatus })
  await load()
}

onMounted(load)
</script>
