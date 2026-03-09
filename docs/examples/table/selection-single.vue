<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <span class="demo-toolbar__label">选择模式</span>
      <el-switch v-model="selectionSingle" active-text="单选" inactive-text="多选" />
    </div>

    <FlTable
      ref="tableRef"
      :data="rows"
      :selection-single="selectionSingle"
      style="width: 100%"
      @selection-row-toggle="handleSelectionToggle"
      @selection-single-conflict="handleSelectionConflict">
      <el-table-column type="selection" width="60" />
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="姓名" min-width="180" />
      <el-table-column prop="role" label="角色" min-width="140" />
    </FlTable>

    <div class="demo-result">当前模式：{{ selectionSingle ? '单选' : '多选' }}</div>
    <div class="demo-result">当前选中：{{ selectedText || '（无）' }}</div>
    <div class="demo-result">冲突原因：{{ conflictText || '（无）' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface TableRow {
  id: number
  name: string
  role: string
}

interface SelectionRowTogglePayload {
  row: TableRow
  selected: boolean
  selectionAfter: TableRow[]
}

interface TableExpose {
  clearSelection?: () => void
}

const rows: TableRow[] = [
  { id: 2001, name: '路西', role: '负责人' },
  { id: 2002, name: '迈克', role: '编辑' },
  { id: 2003, name: '妮娜', role: '访客' }
]

const tableRef = ref<TableExpose | null>(null)
const selectionSingle = ref(true)
const selectedRows = ref<TableRow[]>([])
const conflictText = ref('')

const selectedText = computed(() =>
  selectedRows.value.length
    ? selectedRows.value.map((row) => `${row.id} - ${row.name}`).join('，')
    : ''
)

watch(selectionSingle, () => {
  tableRef.value?.clearSelection?.()
  selectedRows.value = []
  conflictText.value = ''
})

const handleSelectionToggle = (payload: SelectionRowTogglePayload) => {
  selectedRows.value = payload.selectionAfter
}

const handleSelectionConflict = (payload: { reason: string }) => {
  conflictText.value = payload.reason
}
</script>

<style scoped>
.demo-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.demo-toolbar__label {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
