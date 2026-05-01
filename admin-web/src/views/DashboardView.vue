<template>
  <div class="panel-stack">
    <div class="section-head">
      <div>
        <div class="section-title">工作台总览</div>
        <div class="section-subtitle">快速查看平台用户、商品、举报和订单状态</div>
      </div>
      <button class="ghost-btn" @click="load">刷新</button>
    </div>

    <div class="stats-grid">
      <div v-for="card in cards" :key="card.label" class="stat-card">
        <div class="stat-label">{{ card.label }}</div>
        <div class="stat-value">{{ card.value }}</div>
      </div>
    </div>

    <div class="table-card trend-card">
      <div class="card-head">
        <div>
          <div class="section-title minor">近 7 日趋势</div>
          <div class="section-subtitle">用户、商品、订单和举报的日增量</div>
        </div>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>日期</th>
            <th>新增用户</th>
            <th>新增商品</th>
            <th>新增订单</th>
            <th>新增举报</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in trend" :key="item.date">
            <td>{{ item.date }}</td>
            <td>{{ item.users }}</td>
            <td>{{ item.goods }}</td>
            <td>{{ item.orders }}</td>
            <td>{{ item.reports }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminApi, type DashboardOverview, type DashboardTrendPoint } from '../api/http'

const overview = ref<DashboardOverview>({
  userCount: 0,
  goodsCount: 0,
  pendingGoodsCount: 0,
  reportPendingCount: 0,
  orderCount: 0,
  completedOrderCount: 0,
})
const trend = ref<DashboardTrendPoint[]>([])

const cards = computed(() => [
  { label: '用户总数', value: overview.value.userCount },
  { label: '商品总数', value: overview.value.goodsCount },
  { label: '待审核商品', value: overview.value.pendingGoodsCount },
  { label: '待处理举报', value: overview.value.reportPendingCount },
  { label: '订单总数', value: overview.value.orderCount },
  { label: '已完成订单', value: overview.value.completedOrderCount },
])

const load = async () => {
  const [{ data: overviewData }, { data: trendData }] = await Promise.all([
    adminApi.dashboard(),
    adminApi.dashboardTrend(7),
  ])
  overview.value = overviewData
  trend.value = trendData.list || []
}

onMounted(load)
</script>
