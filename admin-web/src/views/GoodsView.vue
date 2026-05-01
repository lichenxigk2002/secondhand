<template>
  <div class="panel-stack">
    <div class="section-head">
      <div>
        <div class="section-title">商品管理</div>
        <div class="section-subtitle">处理审核状态、上下架和内容巡检</div>
      </div>
      <button class="ghost-btn" @click="load">刷新</button>
    </div>

    <div class="toolbar">
      <input v-model.trim="keyword" class="toolbar-input" placeholder="搜索商品标题" />
      <button class="primary-btn compact" @click="load">查询</button>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>卖家</th>
            <th>分类</th>
            <th>价格</th>
            <th>审核</th>
            <th>状态</th>
            <th>浏览量</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.sellerName || '-' }}</td>
            <td>{{ item.category || '-' }}</td>
            <td>{{ item.price }}</td>
            <td><span class="tag">{{ auditText(item.auditStatus) }}</span></td>
            <td><span class="tag">{{ statusText(item.status) }}</span></td>
            <td>{{ item.viewCount }}</td>
            <td class="action-cell">
              <button class="table-btn" @click="audit(item.id, 1)">通过</button>
              <button class="table-btn warning" @click="audit(item.id, 2)">驳回</button>
              <button class="table-btn danger" @click="setStatus(item.id, 0)">下架</button>
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
import { adminApi, type AdminGoods } from '../api/http'

const rows = ref<AdminGoods[]>([])
const keyword = ref('')

const auditText = (value: number) => ['待审核', '通过', '驳回'][value] || '未知'
const statusText = (value: number) => ['下架', '上架', '已售'][value] || '未知'

const load = async () => {
  const { data } = await adminApi.goods({ keyword: keyword.value, page: 1, pageSize: 20 })
  rows.value = data.list || []
}

const audit = async (id: number, auditStatus: number) => {
  await adminApi.auditGoods(id, auditStatus)
  await load()
}

const setStatus = async (id: number, status: number) => {
  await adminApi.updateGoodsStatus(id, status)
  await load()
}

onMounted(load)
</script>
