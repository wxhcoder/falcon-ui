<template>
  <section class="page">
    <h2 class="page-title">Components</h2>
    <p class="page-desc">
      Element Plus passthrough wrappers plus code display components: FlButton, FlInput,
      FlDatePicker, FlQrCode, FlBarcode, FlSelect, FlInputSearch, FlInputNumber, FlTable and
      FlDialog.
    </p>
    <article class="card demo-card">
      <h3>FlButton</h3>
      <div class="demo-row">
        <FlButton>Default</FlButton>
        <FlButton type="primary">Primary</FlButton>
        <FlButton type="success" plain>Success Plain</FlButton>
        <FlButton type="warning" round>Warning Round</FlButton>
        <FlButton type="danger" circle>1</FlButton>
      </div>
      <div class="demo-row">
        <FlButton :disabled="true">Disabled</FlButton>
        <FlButton :loading="true" type="primary">Loading</FlButton>
        <FlButton type="primary" @click="buttonClicks += 1">Click +1</FlButton>
      </div>
      <p class="demo-result">Click count: {{ buttonClicks }}</p>
    </article>

    <article class="card demo-card">
      <h3>FlQrCode</h3>
      <div class="demo-row">
        <FlQrCode
          :value="qrCodeValue"
          :size="qrCodeSize"
          :type="qrCodeType"
          :icon-src="qrCodeType === 'svg' ? qrCodeIcon : ''" />
        <div class="demo-column">
          <FlButton @click="qrCodeType = qrCodeType === 'canvas' ? 'svg' : 'canvas'">
            Toggle type: {{ qrCodeType }}
          </FlButton>
          <FlButton @click="qrCodeSize = qrCodeSize === 140 ? 180 : 140">
            Toggle size: {{ qrCodeSize }}
          </FlButton>
        </div>
      </div>
      <p class="demo-result">value: {{ qrCodeValue }}</p>
      <p class="demo-result">type / size: {{ qrCodeType }} / {{ qrCodeSize }}</p>
    </article>

    <article class="card demo-card">
      <h3>FlBarcode</h3>
      <div class="demo-row">
        <FlBarcode
          :value="barcodeValue"
          :format="barcodeFormat"
          :display-value="barcodeDisplayValue"
          :margin="8" />
        <div class="demo-column">
          <FlSelect v-model="barcodeFormat" placeholder="Format" style="width: 160px">
            <ElOption v-for="item in barcodeFormats" :key="item" :label="item" :value="item" />
          </FlSelect>
          <FlButton @click="barcodeDisplayValue = !barcodeDisplayValue">
            Toggle text: {{ barcodeDisplayValue ? 'on' : 'off' }}
          </FlButton>
        </div>
      </div>
      <p class="demo-result">value: {{ barcodeValue }}</p>
      <p class="demo-result">format / text: {{ barcodeFormat }} / {{ barcodeDisplayValue }}</p>
    </article>

    <article class="card demo-card">
      <h3>FlInput</h3>
      <div class="demo-row">
        <FlInput
          v-model="inputValue"
          placeholder="Type something..."
          clearable
          @input="inputEvents += 1"
          @custom-input="handleCustomInput">
          <template #prefix>
            <span>@</span>
          </template>
        </FlInput>
      </div>
      <div class="demo-row">
        <FlInput v-model="iconInputValue" placeholder="Input with icon slot">
          <template #prefix>
            <ElIcon>
              <Search />
            </ElIcon>
          </template>
        </FlInput>
      </div>
      <div class="demo-row">
        <FlInput v-model="disabledValue" placeholder="Disabled input" disabled />
      </div>
      <p class="demo-result">Current value: {{ inputValue || '(empty)' }}</p>
      <p class="demo-result">Icon slot value: {{ iconInputValue || '(empty)' }}</p>
      <p class="demo-result">Input events: {{ inputEvents }}</p>
      <p class="demo-result">Custom input events: {{ customInputEvents }}</p>
      <p class="demo-result">Custom payload: {{ customInputPayload || '(none)' }}</p>
    </article>

    <article class="card demo-card">
      <h3>FlDatePicker</h3>
      <div class="demo-row">
        <FlDatePicker
          v-model="dateValue"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="Pick a date" />
        <FlDatePicker
          v-model="rangeDateValue"
          type="daterange"
          unlink-panels
          value-format="YYYY-MM-DD"
          start-placeholder="Start"
          end-placeholder="End" />
      </div>
      <div class="demo-row">
        <FlDatePicker
          v-model="errorDateValue"
          :is-error="dateError"
          :is-table="dateTable"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="Toggle state below" />
        <FlButton @click="dateError = !dateError">
          Toggle isError: {{ dateError ? 'on' : 'off' }}
        </FlButton>
        <FlButton @click="dateTable = !dateTable">
          Toggle isTable: {{ dateTable ? 'on' : 'off' }}
        </FlButton>
      </div>
      <p class="demo-result">date value: {{ dateValue ?? '(null)' }}</p>
      <p class="demo-result">
        range value: {{ rangeDateValue ? rangeDateValue.join(' ~ ') : '(null)' }}
      </p>
      <p class="demo-result">
        state: error={{ dateError }}, table={{ dateTable }}, errorDate={{
          errorDateValue ?? '(null)'
        }}
      </p>
    </article>

    <article class="card demo-card">
      <h3>FlInputSearch</h3>
      <div class="demo-row">
        <FlInputSearch
          v-model="searchValue"
          v-model:label="searchLabel"
          clearable
          placeholder="Type acme and press Enter"
          :fetch-api="searchByKeyword"
          :map-result="mapSearchResult"
          @open-dialog="handleOpenDialog" />
      </div>
      <p class="demo-result">
        search value / label: {{ searchValue ?? '(null)' }} / {{ searchLabel }}
      </p>
      <p class="demo-result">
        panel placeholder count: {{ panelTriggerCount }}, reason: {{ panelReason || '(none)' }}
      </p>
      <p class="demo-result">
        panel keyword/result size: {{ panelKeyword || '(empty)' }} / {{ panelResultSize }}
      </p>
    </article>

    <article class="card demo-card">
      <h3>FlSelect</h3>
      <div class="demo-row">
        <FlSelect v-model="selectValue" placeholder="Choose a city">
          <ElOption
            v-for="item in selectOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </FlSelect>
      </div>
      <div class="demo-row">
        <FlSelect v-model="selectValue" :is-error="selectError" :is-table="selectTable">
          <ElOption
            v-for="item in selectOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </FlSelect>
        <FlButton @click="selectError = !selectError">
          Toggle isError: {{ selectError ? 'on' : 'off' }}
        </FlButton>
        <FlButton @click="selectTable = !selectTable">
          Toggle isTable: {{ selectTable ? 'on' : 'off' }}
        </FlButton>
      </div>
      <p class="demo-result">Selected value: {{ selectValue || '(empty)' }}</p>
      <p class="demo-result">State: error={{ selectError }}, table={{ selectTable }}</p>
    </article>

    <article class="card demo-card">
      <h3>FlInputNumber</h3>
      <div class="demo-row">
        <FlInputNumber v-model="numberValue" placeholder="Only number value" />
      </div>
      <div class="demo-row">
        <FlInputNumber
          v-model="roundValue"
          :precision="2"
          precision-mode="ROUND"
          placeholder="ROUND: 1.236 => 1.24" />
        <FlInputNumber
          v-model="fixedValue"
          :precision="2"
          precision-mode="FIXED"
          placeholder="FIXED: 1.236 => 1.23" />
        <FlInputNumber
          :is-error="strictIsError"
          :model-value="strictValue"
          :precision="2"
          precision-mode="STRICT"
          strict-error-placeholder="精度不对"
          placeholder="STRICT: precision check"
          @strict-error="strictErrors += 1"
          @update:is-error="strictIsError = $event"
          @update:model-value="strictValue = $event" />
      </div>
      <div class="demo-row">
        <FlInputNumber
          v-model="formattedValue"
          :is-format="true"
          placeholder="Default thousand format" />
        <FlInputNumber
          v-model="customFormattedValue"
          :is-format="true"
          :formatter="currencyFormatter"
          :parser="currencyParser"
          placeholder="Custom formatter" />
      </div>
      <p class="demo-result">numberValue: {{ numberValue ?? '(null)' }}</p>
      <p class="demo-result">
        round/fixed/strict: {{ roundValue }} / {{ fixedValue }} / {{ strictValue }}
      </p>
      <p class="demo-result">
        strict error: {{ strictIsError ? 'on' : 'off' }}, count: {{ strictErrors }}
      </p>
      <p class="demo-result">
        formatted values: {{ formattedValue ?? '(null)' }} / {{ customFormattedValue ?? '(null)' }}
      </p>
    </article>
    <article class="card demo-card">
      <h3>FlTable</h3>
      <div class="demo-row">
        <FlButton @click="tableSelectionSingle = !tableSelectionSingle">
          Toggle selectionSingle: {{ tableSelectionSingle ? 'on' : 'off' }}
        </FlButton>
      </div>
      <FlTable
        :data="tableRows"
        :selection-single="tableSelectionSingle"
        row-key="id"
        style="width: 100%"
        @cell-change="handleTableCellChange"
        @row-order-change="handleTableRowOrderChange"
        @column-order-change="handleTableColumnOrderChange">
        <ElTableColumn type="selection" width="52" />
        <ElTableColumn prop="id" label="ID" width="72" />
        <ElTableColumn prop="name" label="Name" min-width="120" />
        <ElTableColumn prop="score" label="Score" min-width="180">
          <template #default="{ row }">
            <FlInputNumber
              :model-value="row.score"
              :precision="0"
              @update:model-value="row.score = $event ?? 0" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="profile.nickname" label="Nickname" min-width="220">
          <template #default="{ row }">
            <FlInput v-model="row.profile.nickname" />
          </template>
        </ElTableColumn>
      </FlTable>
      <p class="demo-result">cell-change: {{ tableCellChangeLog }}</p>
      <p class="demo-result">row-order-change: {{ tableRowOrder || '(none)' }}</p>
      <p class="demo-result">column-order-change: {{ tableColumnOrder || '(none)' }}</p>
    </article>
    <article class="card demo-card">
      <h3>FlDialog</h3>
      <div class="demo-row">
        <FlButton type="primary" @click="dialogVisible = true">Open Dialog</FlButton>
      </div>
      <p class="demo-result">Confirm count: {{ confirmCount }}</p>
      <p class="demo-result">Cancel count: {{ cancelCount }}</p>
      <FlDialog
        v-model="dialogVisible"
        :body-height="220"
        title="FlDialog playground"
        @cancel="cancelCount += 1"
        @confirm="confirmCount += 1">
        <p>Draggable, centered, and destroy-on-close are enabled by default.</p>
        <p>Header provides fullscreen and close actions.</p>
      </FlDialog>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElIcon, ElOption, ElTableColumn } from 'element-plus'

const buttonClicks = ref(0)
const qrCodeValue = ref('https://falcon-ui.dev')
const qrCodeType = ref<'canvas' | 'svg'>('canvas')
const qrCodeSize = ref(140)
const qrCodeIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='10' fill='%230f172a'/%3E%3Cpath d='M10 16h12M16 10v12' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E"
const barcodeValue = ref('FALCON-2026')
const barcodeFormat = ref<'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPCA' | 'UPCE'>('CODE128')
const barcodeDisplayValue = ref(true)
const inputValue = ref('')
const iconInputValue = ref('')
const disabledValue = ref('disabled text')
const inputEvents = ref(0)
const customInputEvents = ref(0)
const customInputPayload = ref('')
const dateValue = ref<string | null>(null)
const rangeDateValue = ref<[string, string] | null>(null)
const errorDateValue = ref<string | null>('2026-03-05')
const dateError = ref(false)
const dateTable = ref(false)
const searchValue = ref<string | number | null>(null)
const searchLabel = ref('')
const panelTriggerCount = ref(0)
const panelReason = ref('')
const panelKeyword = ref('')
const panelResultSize = ref(0)
const selectValue = ref('')
const selectError = ref(false)
const selectTable = ref(false)
const numberValue = ref<number | null>(null)
const roundValue = ref<number | null>(null)
const fixedValue = ref<number | null>(null)
const strictValue = ref<number | string | null>(null)
const strictIsError = ref(false)
const strictErrors = ref(0)
const formattedValue = ref<number | null>(12345.67)
const customFormattedValue = ref<number | null>(1200)
type TableRow = {
  id: number
  name: string
  score: number
  profile: {
    nickname: string
  }
}

const tableRows = ref<TableRow[]>([
  { id: 1, name: 'Falcon A', score: 88, profile: { nickname: 'A-01' } },
  { id: 2, name: 'Falcon B', score: 92, profile: { nickname: 'B-02' } },
  { id: 3, name: 'Falcon C', score: 77, profile: { nickname: 'C-03' } }
])
const tableSelectionSingle = ref(false)
const tableCellChangeLog = ref('(none)')
const tableRowOrder = ref('')
const tableColumnOrder = ref('')

const dialogVisible = ref(false)
const confirmCount = ref(0)
const cancelCount = ref(0)

const handleCustomInput = (payload: { length: number; value: string }) => {
  customInputEvents.value += 1
  customInputPayload.value = `value="${payload.value}" length=${payload.length}`
}

const currencyFormatter = (value: string) => `USD ${value}`
const currencyParser = (value: string) => value.replace(/^USD\s*/, '')

type SearchItem = {
  id: string
  name: string
}

const searchData: SearchItem[] = [
  { id: 'c-1001', name: 'Acme Corporation' },
  { id: 'c-1002', name: 'Acme Retail' },
  { id: 'c-1003', name: 'Acme Logistics' },
  { id: 'c-2001', name: 'Globex Inc.' }
]

const searchByKeyword = async (keyword: string) => {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return []
  }

  return searchData.filter((item) => item.name.toLowerCase().includes(normalized))
}

const mapSearchResult = (item: unknown) => {
  const record = item as SearchItem
  return {
    value: record?.id ?? null,
    label: record?.name ?? ''
  }
}

const handleOpenDialog = (payload: {
  keyword: string
  reason: 'manual' | 'multi-match'
  results?: unknown[]
}) => {
  panelTriggerCount.value += 1
  panelReason.value = payload.reason
  panelKeyword.value = payload.keyword
  panelResultSize.value = payload.results?.length ?? 0
}

const handleTableCellChange = (payload: {
  rowIndex: number
  columnKey: string
  path: string
  prevValue: unknown
  nextValue: unknown
}) => {
  tableCellChangeLog.value = `[row:${payload.rowIndex}] ${payload.path} (${payload.columnKey}) ${String(payload.prevValue)} -> ${String(payload.nextValue)}`
}

const handleTableRowOrderChange = (payload: { data: TableRow[] }) => {
  tableRowOrder.value = payload.data.map((item) => item.id).join(' -> ')
}

const handleTableColumnOrderChange = (payload: { order: number[] }) => {
  tableColumnOrder.value = payload.order.join(' -> ')
}
const selectOptions = [
  { label: 'Shanghai', value: 'shanghai' },
  { label: 'Beijing', value: 'beijing' },
  { label: 'Shenzhen', value: 'shenzhen' }
]
const barcodeFormats = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPCA', 'UPCE'] as const
</script>

<style scoped>
.demo-card {
  margin-bottom: 12px;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
}

.demo-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-result {
  margin: 6px 0 0;
}
</style>
