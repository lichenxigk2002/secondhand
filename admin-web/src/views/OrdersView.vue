<template>
  <div class="panel-stack">
    <div class="section-head">
      <div>
        <div class="section-title">订单管理</div>
        <div class="section-subtitle">查看交易状态和买卖双方信息</div>
      </div>
      <button class="ghost-btn" @click="load">刷新</button>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>商品</th>
            <th>买家</th>
            <th>卖家</th>
            <th>金额</th>
            <th>状态</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.orderNo }}</td>
            <td>{{ item.goodsTitle || '-' }}</td>
            <td>{{ item.buyerName || '-' }}</td>
            <td>{{ item.sellerName || '-' }}</td>
            <td>{{ item.amount }}</td>
            <td><span class="tag">{{ statusText(item.status) }}</span></td>
            <td>{{ formatDate(item.createTime) }}</td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="7" class="empty-cell">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { adminApi, type AdminOrder } from '../api/http'

const rows = ref<AdminOrder[]>([])

const statusText = (value: number) => ['待确认', '进行中', '已完成', '已取消'][value] || '未知'
const formatDate = (value: string) => (value ? value.slice(0, 16).replace('T', ' ') : '-')

const load = async () => {
  const { data } = await adminApi.orders({ page: 1, pageSize: 20 })
  rows.value = data.list || []
}

onMounted(load)
</script>
