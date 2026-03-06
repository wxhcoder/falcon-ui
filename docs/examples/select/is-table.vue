<template>
  <div class="vp-raw">
    <ElTable :data="tableData" border style="width: 100%">
      <ElTableColumn label="编号" prop="id" width="90" />
      <ElTableColumn label="商品" prop="name" />
      <ElTableColumn label="状态" width="220">
        <template #default="{ row }">
          <FlSelect v-model="row.status" is-table placeholder="请选择状态">
            <ElOption
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </FlSelect>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type RowData = {
  id: string
  name: string
  status: string
}

const tableData = ref<RowData[]>([
  { id: 'SKU-001', name: '机械键盘', status: 'normal' },
  { id: 'SKU-002', name: '无线鼠标', status: 'paused' },
  { id: 'SKU-003', name: '显示器', status: 'offline' }
])

const statusOptions = [
  { label: '上架', value: 'normal' },
  { label: '暂停', value: 'paused' },
  { label: '下架', value: 'offline' }
]
</script>
