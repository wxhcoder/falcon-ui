<template>
  <div class="demo-col">
    <FlTable :data="rows" style="width: 100%">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="Name" min-width="180" />
      <el-table-column prop="status" label="Status" min-width="120" />
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
  { id: 1001, name: 'Alpha Tech', status: 'Enabled' },
  { id: 1002, name: 'Beta Logistics', status: 'Pending' },
  { id: 1003, name: 'Gamma Retail', status: 'Disabled' }
]
</script>
