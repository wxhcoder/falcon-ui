<template>
  <div class="demo-col">
    <div class="demo-actions">
      <FlButton type="primary" @click="openByService">Call useDialog.open</FlButton>
      <FlButton @click="closeAll('closeAll')">Call useDialog.closeAll</FlButton>
    </div>

    <div class="demo-result">Confirm count:{{ confirmCount }}</div>
    <div class="demo-result">Latest rejected action:{{ latestRejectedAction || '(none)' }}</div>
    <div class="demo-result">Latest confirmed data:{{ latestConfirmedRows || '(none)' }}</div>
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
 * Before-close guard: this example prevents the cancel button from closing directly and allows other actions.
 */
const handleBeforeClose = async (action: DialogCloseReason) => action !== 'cancel'

/**
 * Mock FlTable selected-row reading: return current selected rows on confirm.
 */
const resolveSelectedRows = () => [...selectedRows.value]

/**
 * Text API Open dialog,Text Promise resultTextExamplesText.
 */
const openByService = () => {
  latestRejectedAction.value = ''
  latestConfirmedRows.value = ''

  dialog
    .open<SelectedRow[]>({
      title: 'useDialog example',
      message: 'Clicking confirm resolves; other close actions reject.',
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
 * Close the current dialog instance created by useDialog.
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
