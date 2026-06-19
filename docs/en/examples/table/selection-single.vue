<template>
  <div class="demo-col">
    <div class="demo-toolbar">
      <span class="demo-toolbar__label">Selection mode</span>
      <el-switch v-model="selectionSingle" active-text="Single" inactive-text="Multiple" />
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
      <el-table-column prop="name" label="Name" min-width="180" />
      <el-table-column prop="role" label="Role" min-width="140" />
    </FlTable>

    <div class="demo-result">Current mode:{{ selectionSingle ? 'Single' : 'Multiple' }}</div>
    <div class="demo-result">Current selection:{{ selectedText || '(none)' }}</div>
    <div class="demo-result">Conflict reason:{{ conflictText || '(none)' }}</div>
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
  { id: 2001, name: 'Lucy', role: 'Owner' },
  { id: 2002, name: 'Mike', role: 'Edit' },
  { id: 2003, name: 'Nina', role: 'Guest' }
]

const tableRef = ref<TableExpose | null>(null)
const selectionSingle = ref(true)
const selectedRows = ref<TableRow[]>([])
const conflictText = ref('')

const selectedText = computed(() =>
  selectedRows.value.length
    ? selectedRows.value.map((row) => `${row.id} - ${row.name}`).join(',')
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
