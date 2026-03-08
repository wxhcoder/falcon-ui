<template>
  <div class="demo-col">
    <FlTable
      :data="rows"
      selection-single
      style="width: 100%"
      @selection-row-toggle="handleSelectionToggle"
      @selection-single-conflict="handleSelectionConflict">
      <el-table-column type="selection" width="60" />
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="姓名" min-width="180" />
      <el-table-column prop="role" label="角色" min-width="140" />
    </FlTable>

    <div class="demo-result">当前选中：{{ selectedText || '（无）' }}</div>
    <div class="demo-result">冲突原因：{{ conflictText || '（无）' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface TableRow {
  id: number
  name: string
  role: string
}

const rows: TableRow[] = [
  { id: 2001, name: '路西', role: '负责人' },
  { id: 2002, name: '迈克', role: '编辑' },
  { id: 2003, name: '妮娜', role: '访客' }
]

const selectedRow = ref<TableRow | null>(null)
const conflictText = ref('')

const selectedText = computed(() =>
  selectedRow.value ? `${selectedRow.value.id} - ${selectedRow.value.name}` : ''
)

const handleSelectionToggle = (payload: { row: TableRow; selected: boolean }) => {
  selectedRow.value = payload.selected ? payload.row : null
}

const handleSelectionConflict = (payload: { reason: string }) => {
  conflictText.value = payload.reason
}
</script>

<style scoped>
.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
