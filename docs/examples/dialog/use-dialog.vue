<template>
  <div class="demo-col">
    <div class="demo-actions">
      <FlButton type="primary" @click="openByService">调用 useDialog.open</FlButton>
      <FlButton @click="closeAll('closeAll')">调用 useDialog.closeAll</FlButton>
    </div>

    <div class="demo-result">确认次数：{{ confirmCount }}</div>
    <div class="demo-result">最近拒绝动作：{{ latestRejectedAction || '(none)' }}</div>
    <div class="demo-result">最近确认数据：{{ latestConfirmedRows || '(none)' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DialogCloseReason, DialogRejectPayload } from '@falcon-ui/hooks'
import { useDialog } from '@falcon-ui/hooks'

interface SelectedRow {
  id: string
  name: string
}

const confirmCount = ref(0)
const latestRejectedAction = ref('')
const latestConfirmedRows = ref('')
const selectedRows = ref<SelectedRow[]>([
  { id: '1001', name: 'Acme Co., Ltd.' },
  { id: '1002', name: 'Contoso Trading' }
])

const dialog = useDialog()

/**
 * 关闭前拦截：示例中禁止取消按钮直接关闭，其他动作允许关闭。
 */
const handleBeforeClose = async (action: DialogCloseReason) => action !== 'cancel'

/**
 * 模拟 FlTable 勾选数据读取：在确认时返回当前选中行。
 */
const resolveSelectedRows = () => [...selectedRows.value]

/**
 * 通过调用式 API 打开弹窗，并根据 Promise 结果更新示例统计数据。
 */
const openByService = () => {
  latestRejectedAction.value = ''
  latestConfirmedRows.value = ''

  dialog
    .open<SelectedRow[]>({
      title: 'useDialog 示例',
      message: '点击确认会 resolve，其他关闭动作会 reject。',
      beforeClose: handleBeforeClose,
      payloadResolver: resolveSelectedRows,
      dialogProps: {
        bodyHeight: 180
      }
    })
    .then(({ data }) => {
      confirmCount.value += 1
      latestConfirmedRows.value = data.map((row) => `${row.id}:${row.name}`).join(', ')
    })
    .catch(({ action }: DialogRejectPayload) => {
      latestRejectedAction.value = action
    })
}

/**
 * 关闭当前由 useDialog 创建的弹窗实例。
 */
const closeAll = (reason: DialogCloseReason = 'closeAll') => {
  dialog.closeAll(reason)
}
</script>

<style scoped>
.demo-actions {
  display: flex;
  gap: 10px;
}

.demo-result {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
