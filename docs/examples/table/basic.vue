<template>
  <div class="demo-col">
    <FlTable :data="rows" style="width: 100%">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="名称" min-width="180" />
      <el-table-column prop="status" label="状态" min-width="120" />
    </FlTable>
  </div>
</template>

<script setup lang="ts">
interface TableRow {
  id: number
  name: string
  status: string
}

const rows: TableRow[] = [
  { id: 1001, name: '阿尔法科技', status: '启用' },
  { id: 1002, name: '贝塔物流', status: '待审核' },
  { id: 1003, name: '伽马零售', status: '停用' }
]
</script>
