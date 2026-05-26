<template>
  <section class="page">
    <h2 class="page-title">Components</h2>
    <p class="page-desc">
      Element Plus passthrough wrappers plus code display components: FlButton, FlInput,
      FlDatePicker, FlQrCode, FlBarcode, FlSelect, FlInputSearch, FlInputNumber, FlTable, FlDialog
      and shared icon exports.
    </p>
    <article class="card demo-card">
      <h3>Icons</h3>
      <div class="demo-row">
        <div class="icon-demo-grid">
          <div class="icon-demo-card">
            <span class="icon-demo-label">Direct component</span>
            <PlusSquareOutlined
              class="icon-demo-plain"
              :style="{
                width: `${iconPreviewSize}px`,
                height: `${iconPreviewSize}px`,
                color: iconPreviewColor
              }" />
          </div>
          <div class="icon-demo-card">
            <span class="icon-demo-label">Wrapped with ElIcon</span>
            <ElIcon :size="iconPreviewSize" :color="iconPreviewColor">
              <MinusSquareOutlined />
            </ElIcon>
          </div>
          <div class="icon-demo-card">
            <span class="icon-demo-label">HolderOutlined</span>
            <ElIcon :size="iconPreviewSize" :color="iconPreviewColor">
              <HolderOutlined />
            </ElIcon>
          </div>
        </div>
        <div class="demo-column">
          <FlButton @click="iconPreviewSize = iconPreviewSize === 22 ? 30 : 22">
            Toggle size: {{ iconPreviewSize }}
          </FlButton>
          <FlButton
            @click="iconPreviewColor = iconPreviewColor === '#409eff' ? '#67c23a' : '#409eff'">
            Toggle color: {{ iconPreviewColor }}
          </FlButton>
        </div>
      </div>
      <div class="demo-row">
        <ElIcon :size="iconPreviewSize" :color="iconPreviewColor">
          <PlusSquareOutlined />
        </ElIcon>
        <ElIcon :size="iconPreviewSize" :color="iconPreviewColor">
          <MinusSquareOutlined />
        </ElIcon>
        <ElIcon :size="iconPreviewSize" :color="iconPreviewColor">
          <HolderOutlined />
        </ElIcon>
      </div>
      <p class="demo-result">size / color: {{ iconPreviewSize }} / {{ iconPreviewColor }}</p>
      <p class="demo-result">
        These icons are imported from `falcon-ui`, so internal components can reuse the same assets
        without global registration.
      </p>
    </article>
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
      <h3>FlTree</h3>
      <div class="demo-row">
        <FlSelect v-model="treeDefaultExpandMode" placeholder="默认展开方式" style="width: 220px">
          <ElOption
            v-for="item in treeDefaultExpandOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </FlSelect>
        <FlSelect v-model="treeSwitcherIcon" placeholder="展开图标" style="width: 180px">
          <ElOption
            v-for="item in treeSwitcherIconOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </FlSelect>
        <FlButton @click="applyTreeDefaultExpandMode">应用默认展开</FlButton>
        <FlButton @click="expandAllTreeNodes">全部展开</FlButton>
        <FlButton @click="collapseAllTreeNodes">全部折叠</FlButton>
        <FlButton @click="restoreTreeDefaultExpandMode">恢复默认模式</FlButton>
        <FlButton @click="treeUseCustomContent = !treeUseCustomContent">
          切换 default 插槽: {{ treeUseCustomContent ? 'on' : 'off' }}
        </FlButton>
        <FlButton @click="treeUseSemanticStyles = !treeUseSemanticStyles">
          Toggle semantic styles: {{ treeUseSemanticStyles ? 'on' : 'off' }}
        </FlButton>
        <FlButton @click="toggleTreeMultiple">
          切换 multiple: {{ treeMultiple ? 'on' : 'off' }}
        </FlButton>
        <FlButton
          @click="
            enableControlledTreeSelection(['delivery-quality-unit-test', 'workspace-layout-grid'])
          ">
          受控选中 Unit Test + Grid
        </FlButton>
        <FlButton
          @click="
            enableControlledTreeSelection([
              'design-system-components-tree',
              'delivery-quality-playground'
            ])
          ">
          受控选中 Tree + Playground
        </FlButton>
        <FlButton @click="clearControlledTreeSelection">受控清空</FlButton>
        <FlButton @click="restoreDefaultTreeSelection">恢复默认选中</FlButton>
        <FlButton @click="applyConductCheckScenario">Check conduct</FlButton>
        <FlButton @click="applyStrictCheckScenario">Check strict object</FlButton>
        <FlButton @click="applyCheckBoundaryScenario">Check boundary</FlButton>
        <FlButton
          @click="
            enableControlledTreeCheck(
              treeCheckStrictly
                ? {
                    checked: ['design-system-components-tree', 'delivery-quality-playground'],
                    halfChecked: ['design-system-components', 'delivery-quality']
                  }
                : ['design-system-components-tree', 'delivery-quality-playground']
            )
          ">
          Controlled check example
        </FlButton>
        <FlButton @click="clearControlledTreeCheck">Controlled check clear</FlButton>
        <FlButton @click="restoreDefaultTreeCheck">Restore default checked</FlButton>
        <FlButton @click="treeShowLine = !treeShowLine">
          Toggle showLine: {{ treeShowLine ? 'on' : 'off' }}
        </FlButton>
        <FlButton @click="treeSelectable = !treeSelectable">
          切换 selectable: {{ treeSelectable ? 'on' : 'off' }}
        </FlButton>
        <FlButton @click="treeDragEnabled = !treeDragEnabled">
          Toggle draggable: {{ treeDragEnabled ? 'on' : 'off' }}
        </FlButton>
        <FlButton @click="treeUseAllowDropGuard = !treeUseAllowDropGuard">
          Toggle allowDrop guard: {{ treeUseAllowDropGuard ? 'on' : 'off' }}
        </FlButton>
        <FlButton @click="resetAsyncTreeData">Reset async tree</FlButton>
        <FlButton @click="toggleAsyncTreeControlledLoaded">
          LoadedKeys controlled: {{ asyncTreeUseControlledLoaded ? 'on' : 'off' }}
        </FlButton>
        <FlButton @click="scrollTreeTo('workspace', 'top')">Scroll Workspace</FlButton>
        <FlButton @click="scrollTreeTo('delivery-quality-playground', 'top')">
          Scroll Playground
        </FlButton>
        <FlButton @click="scrollTreeTo('missing-scroll-key', 'auto')">Scroll no-op</FlButton>
        <FlButton @click="scrollAsyncTreeTo('async-api', 'top')">Scroll async API</FlButton>
        <FlButton @click="resetTreeEventRecords">清空事件日志</FlButton>
      </div>
      <div class="demo-row tree-demo-row">
        <FlTree
          ref="treeRef"
          :key="treeDemoVersion"
          class="tree-demo"
          :data="treeData"
          :show-line="treeShowLine"
          :selectable="treeSelectable"
          :multiple="treeMultiple"
          :checkable="treeCheckable"
          :check-strictly="treeCheckStrictly"
          :switcher-icon="treeSwitcherIcon"
          :props="treeNodeProps"
          :default-expand-all="treeDefaultExpandAll"
          :default-expanded-keys="treeDefaultExpandedKeys"
          :default-expand-parent="treeDefaultExpandParent"
          :default-selected-keys="treeDefaultSelectedKeys"
          :default-checked-keys="treeDefaultCheckedKeys"
          :disabled-keys="treeDisabledKeys"
          :unselectable-keys="treeUnselectableKeys"
          :disabled-checkbox-keys="treeDisabledCheckboxKeys"
          :hidden-checkbox-keys="treeHiddenCheckboxKeys"
          :expanded-keys="treeUseControlledExpand ? treeControlledExpandedKeys : undefined"
          :selected-keys="treeUseControlledSelect ? treeControlledSelectedKeys : undefined"
          :checked-keys="treeUseControlledCheck ? treeControlledCheckedKeys : undefined"
          :class-names="treeSemanticClassNames"
          :styles="treeSemanticStyles"
          :draggable="treeDragEnabled"
          :allow-drag="treeAllowDrag"
          :allow-drop="treeAllowDrop"
          @update:expanded-keys="handleTreeExpandedKeysChange"
          @update:selected-keys="handleTreeSelectedKeysChange"
          @update:checked-keys="handleTreeCheckedKeysChange"
          @node-click="handleTreeNodeClick"
          @dblclick="handleTreeDblclick"
          @select="handleTreeSelect"
          @check="handleTreeCheck"
          @node-expand="handleTreeNodeExpand"
          @node-collapse="handleTreeNodeCollapse"
          @node-drag-start="handleTreeDragStart"
          @node-drag-enter="handleTreeDragEnter"
          @node-drag-over="handleTreeDragOver"
          @node-drag-leave="handleTreeDragLeave"
          @node-drag-end="handleTreeDragEnd"
          @node-drop="handleTreeDrop">
          <template v-if="treeUseCustomContent" #default="{ node, data }">
            <span class="tree-slot-content">
              <span class="tree-slot-primary">{{ node.label }}</span>
              <span class="tree-slot-meta">{{ String(data.key) }}</span>
            </span>
          </template>
        </FlTree>
      </div>
      <div class="demo-row tree-demo-row">
        <FlTree
          ref="asyncTreeRef"
          class="tree-demo async-tree-demo"
          :data="asyncTreeData"
          :props="treeNodeProps"
          :show-line="treeShowLine"
          :switcher-icon="treeSwitcherIcon"
          :switcher-loading-icon="Eleme"
          :load-data="loadAsyncTreeNode"
          :loaded-keys="asyncTreeUseControlledLoaded ? asyncTreeControlledLoadedKeys : undefined"
          @update:loaded-keys="handleAsyncTreeLoadedKeysChange"
          @dblclick="handleTreeDblclick"
          @load="handleTreeLoad" />
      </div>
      <p class="demo-result">Root nodes: {{ treeData.length }}</p>
      <p class="demo-result">Mapped label field: `name`, children field: `nodes`.</p>
      <p class="demo-result">
        连线模式: {{ treeShowLine ? 'on' : 'off' }}，switcher={{ treeSwitcherIcon }}。
      </p>
      <p class="demo-result">
        节点内容: {{ treeUseCustomContent ? '自定义 default 插槽' : '内建 label-only' }}。
      </p>
      <p class="demo-result">
        默认展开模式: {{ currentTreeDefaultExpandLabel }}，当前模式:
        {{ treeUseControlledExpand ? '受控展开' : '默认展开' }}
      </p>
      <p class="demo-result">
        选中模式: {{ treeUseControlledSelect ? '受控选中' : '默认选中' }}，multiple={{
          treeMultiple
        }}，selectable={{ treeSelectable }}
      </p>
      <p class="demo-result">
        当前源展开 keys:
        {{ currentTreeExpandedKeys.length ? currentTreeExpandedKeys.join(', ') : '(empty)' }}
      </p>
      <p class="demo-result">
        当前可见选中 keys:
        {{ currentTreeSelectedKeys.length ? currentTreeSelectedKeys.join(', ') : '(empty)' }}
      </p>
      <p class="demo-result">普通树多选使用普通点击增删；双击只负责 expandable 节点展开切换。</p>
      <p class="demo-result">
        Check mode:
        {{ treeCheckable ? (treeUseControlledCheck ? 'controlled' : 'default') : 'off' }}, strict={{
          treeCheckStrictly
        }}, valueShape={{ treeCheckStrictly ? 'object' : 'array' }}
      </p>
      <p class="demo-result">
        Current checked keys:
        {{ currentTreeCheckedKeys.length ? currentTreeCheckedKeys.join(', ') : '(empty)' }}
      </p>
      <p class="demo-result">
        Current half-checked keys:
        {{ currentTreeHalfCheckedKeys.length ? currentTreeHalfCheckedKeys.join(', ') : '(empty)' }}
      </p>
      <p class="demo-result">
        Stage 11 note: 内建内容仅渲染 label，default 插槽只替换 switcher / checkbox 右侧区域。
      </p>
      <p class="demo-result">
        Stage 12 semantic styles: {{ treeUseSemanticStyles ? 'root/item enabled' : 'off' }}.
      </p>
      <p class="demo-result">
        Stage 13 async loaded keys:
        {{ currentAsyncTreeLoadedKeys.length ? currentAsyncTreeLoadedKeys.join(', ') : '(empty)' }}.
      </p>
      <p class="demo-result">
        Stage 14 drag: draggable={{ treeDragEnabled }}, allowDrop guard={{ treeUseAllowDropGuard }},
        tree internally reorders data on node-drop.
      </p>
      <p class="demo-result">
        Stage 15 keyboard/a11y: focus stays on the tree root, with active node state shown by the
        focus ring and ARIA relationship.
      </p>
      <p class="demo-result">
        Stage 16 dblclick: node content double-click emits `dblclick` and toggles expandable nodes.
      </p>
      <p class="demo-result">
        Stage 17 scrollTo: buttons call exposed scrollTo without requiring a fixed tree height.
      </p>
      <p class="demo-result">
        Stage 7-9 note: default mode now conducts parent / child checks, strict mode uses `{
        checked, halfChecked }`, and key-based disabled / hidden checkbox boundaries are active.
      </p>
      <p class="demo-result">
        Event counts: click={{ treeNodeClickCount }}, dblclick={{ treeDblclickCount }}, select={{
          treeSelectCount
        }}, check={{ treeCheckCount }}, expand={{ treeNodeExpandCount }}, collapse={{
          treeNodeCollapseCount
        }}, load={{ treeLoadCount }}, node-drag-start={{ treeDragStartCount }}, node-drag-over={{
          treeDragOverCount
        }}, node-drop={{ treeDropCount }}
      </p>
      <p class="demo-result">Last node-click: {{ treeLastNodeClick }}</p>
      <p class="demo-result">Last dblclick: {{ treeLastDblclick }}</p>
      <p class="demo-result">Last select: {{ treeLastSelect }}</p>
      <p class="demo-result">Last check: {{ treeLastCheck }}</p>
      <p class="demo-result">Last node-expand: {{ treeLastNodeExpand }}</p>
      <p class="demo-result">Last node-collapse: {{ treeLastNodeCollapse }}</p>
      <p class="demo-result">Last load: {{ treeLastLoad }}</p>
      <p class="demo-result">Last drag: {{ treeLastDrag }}</p>
      <p class="demo-result">Last scrollTo: {{ treeLastScrollTo }}</p>
      <ul class="tree-event-list">
        <li v-for="item in treeEventRecords" :key="item.id" class="tree-event-item">
          {{ item.message }}
        </li>
      </ul>
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
import { computed, reactive, ref } from 'vue'
import { Eleme, Search } from '@element-plus/icons-vue'
import { ElIcon, ElOption, ElTableColumn } from 'element-plus'
import { HolderOutlined, MinusSquareOutlined, PlusSquareOutlined } from 'falcon-ui'
import type {
  RowOrderChangeEvent,
  TreeAllowDrag,
  TreeAllowDrop,
  TreeClassNames,
  TreeData,
  TreeCheckEvent,
  TreeCheckedKeys,
  TreeExpandedNode,
  TreeExpose,
  TreeKey,
  TreeInteractionEvent,
  TreeLoadEvent,
  TreeNode,
  TreeNodeDropType,
  TreeNodeInstance,
  TreeNodeProps,
  TreeScrollAlign,
  TreeSelectEvent,
  TreeStyles,
  TreeSwitcherIconMode
} from 'falcon-ui'

const iconPreviewSize = ref(22)
const iconPreviewColor = ref('#409eff')
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

const handleTableRowOrderChange = (payload: RowOrderChangeEvent) => {
  tableRowOrder.value = payload.data.map((item) => String(item.id)).join(' -> ')
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

type TreeDefaultExpandMode = 'collapsed' | 'roots' | 'focus-path' | 'all'

interface TreeDefaultExpandOption {
  label: string
  value: TreeDefaultExpandMode
}

interface TreeSwitcherIconOption {
  label: string
  value: TreeSwitcherIconMode
}

interface TreeDefaultExpandConfig {
  defaultExpandAll: boolean
  defaultExpandedKeys: TreeKey[] | undefined
  defaultExpandParent: boolean
  sourceExpandedKeys: TreeKey[]
}

type TreeEventName =
  | 'node-click'
  | 'dblclick'
  | 'select'
  | 'check'
  | 'node-expand'
  | 'node-collapse'
  | 'load'
  | 'node-drag-start'
  | 'node-drag-enter'
  | 'node-drag-over'
  | 'node-drag-leave'
  | 'node-drag-end'
  | 'node-drop'

interface TreeEventRecord {
  id: number
  message: string
}

// 树组件示例继续使用自定义字段名，直接验证 props 映射链路。
const treeNodeProps: TreeNodeProps = {
  label: 'name',
  children: 'nodes',
  isLeaf: 'leaf'
}

const treeData = reactive<TreeData[]>([
  {
    key: 'workspace',
    name: 'Workspace',
    nodes: [
      {
        key: 'workspace-forms',
        name: 'Forms',
        leaf: true
      },
      {
        key: 'workspace-layout',
        name: 'Layout',
        nodes: [
          {
            key: 'workspace-layout-grid',
            name: 'Grid',
            leaf: true
          },
          {
            key: 'workspace-layout-splitter',
            name: 'Splitter',
            leaf: true
          },
          {
            key: 'workspace-layout-responsive',
            name: 'Responsive',
            nodes: [
              {
                key: 'workspace-layout-responsive-desktop',
                name: 'Desktop',
                nodes: [
                  {
                    key: 'workspace-layout-responsive-desktop-12',
                    name: '12 Columns',
                    leaf: true
                  },
                  {
                    key: 'workspace-layout-responsive-desktop-sidebar',
                    name: 'Sidebar Layout',
                    leaf: true
                  }
                ]
              },
              {
                key: 'workspace-layout-responsive-mobile',
                name: 'Mobile',
                nodes: [
                  {
                    key: 'workspace-layout-responsive-mobile-safe-area',
                    name: 'Safe Area',
                    leaf: true
                  },
                  {
                    key: 'workspace-layout-responsive-mobile-bottom-sheet',
                    name: 'Bottom Sheet',
                    leaf: true
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        key: 'workspace-feedback',
        name: 'Feedback',
        nodes: [
          {
            key: 'workspace-feedback-dialog',
            name: 'Dialog',
            leaf: true
          },
          {
            key: 'workspace-feedback-notification',
            name: 'Notification',
            leaf: true
          },
          {
            key: 'workspace-feedback-toast',
            name: 'Toast',
            nodes: [
              {
                key: 'workspace-feedback-toast-success',
                name: 'Success',
                leaf: true
              },
              {
                key: 'workspace-feedback-toast-warning',
                name: 'Warning',
                leaf: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    key: 'design-system',
    name: 'Design System',
    nodes: [
      {
        key: 'design-system-tokens',
        name: 'Tokens',
        nodes: [
          {
            key: 'design-system-tokens-color',
            name: 'Color',
            leaf: true
          },
          {
            key: 'design-system-tokens-typography',
            name: 'Typography',
            leaf: true
          },
          {
            key: 'design-system-tokens-motion',
            name: 'Motion',
            nodes: [
              {
                key: 'design-system-tokens-motion-duration',
                name: 'Duration',
                leaf: true
              },
              {
                key: 'design-system-tokens-motion-easing',
                name: 'Easing',
                leaf: true
              }
            ]
          }
        ]
      },
      {
        key: 'design-system-components',
        name: 'Components',
        nodes: [
          {
            key: 'design-system-components-button',
            name: 'Button',
            leaf: true
          },
          {
            key: 'design-system-components-table',
            name: 'Table',
            leaf: true
          },
          {
            key: 'design-system-components-tree',
            name: 'Tree',
            leaf: true
          },
          {
            key: 'design-system-components-navigation',
            name: 'Navigation',
            nodes: [
              {
                key: 'design-system-components-navigation-tabs',
                name: 'Tabs',
                leaf: true
              },
              {
                key: 'design-system-components-navigation-menu',
                name: 'Menu',
                nodes: [
                  {
                    key: 'design-system-components-navigation-menu-horizontal',
                    name: 'Horizontal',
                    leaf: true
                  },
                  {
                    key: 'design-system-components-navigation-menu-vertical',
                    name: 'Vertical',
                    leaf: true
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    key: 'delivery',
    name: 'Delivery',
    nodes: [
      {
        key: 'delivery-roadmap',
        name: 'Roadmap',
        nodes: [
          {
            key: 'delivery-roadmap-stage-1',
            name: 'Stage 1',
            leaf: true
          },
          {
            key: 'delivery-roadmap-stage-2',
            name: 'Stage 2',
            leaf: true
          },
          {
            key: 'delivery-roadmap-stage-3',
            name: 'Stage 3',
            leaf: true
          }
        ]
      },
      {
        key: 'delivery-quality',
        name: 'Quality',
        nodes: [
          {
            key: 'delivery-quality-unit-test',
            name: 'Unit Test',
            leaf: true
          },
          {
            key: 'delivery-quality-playground',
            name: 'Playground',
            leaf: true
          },
          {
            key: 'delivery-quality-checkbox-disabled',
            name: 'Checkbox Disabled',
            leaf: true
          },
          {
            key: 'delivery-quality-hidden-checkbox',
            name: 'Hidden Checkbox',
            leaf: true
          },
          {
            key: 'delivery-quality-coverage',
            name: 'Coverage',
            nodes: [
              {
                key: 'delivery-quality-coverage-unit',
                name: 'Unit',
                nodes: [
                  {
                    key: 'delivery-quality-coverage-unit-components',
                    name: 'Components',
                    leaf: true
                  },
                  {
                    key: 'delivery-quality-coverage-unit-hooks',
                    name: 'Hooks',
                    leaf: true
                  }
                ]
              },
              {
                key: 'delivery-quality-coverage-e2e',
                name: 'E2E',
                nodes: [
                  {
                    key: 'delivery-quality-coverage-e2e-chromium',
                    name: 'Chromium',
                    leaf: true
                  },
                  {
                    key: 'delivery-quality-coverage-e2e-webkit',
                    name: 'WebKit',
                    leaf: true
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    key: 'archive',
    name: 'Archive',
    leaf: true
  }
])

const createAsyncTreeData = (): TreeData[] => [
  {
    key: 'async-api',
    name: 'Async API'
  },
  {
    key: 'async-guides',
    name: 'Async Guides'
  },
  {
    key: 'async-static-leaf',
    name: 'Static Leaf',
    leaf: true
  }
]

const createAsyncTreeChildren = (node: TreeNode): TreeData[] => [
  {
    key: `${String(node.key)}-overview`,
    name: `${node.label} Overview`,
    leaf: true
  },
  {
    key: `${String(node.key)}-details`,
    name: `${node.label} Details`,
    leaf: true
  }
]

const replaceTreeNodeChildren = (
  nodes: TreeData[],
  targetKey: TreeKey,
  children: TreeData[]
): TreeData[] =>
  nodes.map((node) => {
    const currentChildren = readTreeChildren(node)

    if (node.key === targetKey) {
      return {
        ...node,
        nodes: children
      }
    }

    if (currentChildren.length === 0) {
      return node
    }

    return {
      ...node,
      nodes: replaceTreeNodeChildren(currentChildren, targetKey, children)
    }
  })

const treeDefaultExpandOptions: TreeDefaultExpandOption[] = [
  { label: '默认收起', value: 'collapsed' },
  { label: '默认展开一级分组', value: 'roots' },
  { label: '默认展开关键路径', value: 'focus-path' },
  { label: '默认全部展开', value: 'all' }
]
const treeSwitcherIconOptions: TreeSwitcherIconOption[] = [
  { label: '箭头', value: 'arrow' },
  { label: '加减号', value: 'plus-minus' },
  { label: '文件夹', value: 'folder' }
]
const treeDefaultExpandMode = ref<TreeDefaultExpandMode>('all')
const treeDemoVersion = ref(0)
const treeDefaultExpandAll = ref(false)
const treeDefaultExpandedKeys = ref<TreeKey[] | undefined>(undefined)
const treeDefaultExpandParent = ref(true)
const treeUseControlledExpand = ref(false)
const treeControlledExpandedKeys = ref<TreeKey[]>([])
const treeObservedExpandedKeys = ref<TreeKey[]>([])
const treeSelectable = ref(true)
const treeMultiple = ref(true)
const treeCheckable = ref(false)
const treeCheckStrictly = ref(false)
const treeShowLine = ref(true)
const treeSwitcherIcon = ref<TreeSwitcherIconMode>('arrow')
const treeUseCustomContent = ref(false)
const treeUseSemanticStyles = ref(false)
const treeDragEnabled = ref(true)
const treeUseAllowDropGuard = ref(false)
const treeDefaultSelectedKeys = ref<TreeKey[] | undefined>([
  'design-system-components-tree',
  'delivery-quality-unit-test'
])
const treeDefaultCheckedKeys = ref<TreeKey[] | undefined>(undefined)
const treeDisabledKeys: TreeKey[] = ['archive']
const treeUnselectableKeys: TreeKey[] = ['delivery-quality']
const treeDisabledCheckboxKeys: TreeKey[] = ['delivery-quality-checkbox-disabled']
const treeHiddenCheckboxKeys: TreeKey[] = ['delivery-quality-hidden-checkbox']
const treeUseControlledSelect = ref(false)
const treeControlledSelectedKeys = ref<TreeKey[]>([])
const treeObservedSelectedKeys = ref<TreeKey[]>(treeDefaultSelectedKeys.value ?? [])
const treeUseControlledCheck = ref(false)
const treeControlledCheckedKeys = ref<TreeCheckedKeys>([])
const treeObservedCheckedKeys = ref<TreeCheckedKeys>(treeDefaultCheckedKeys.value ?? [])
const treeObservedHalfCheckedKeys = ref<TreeKey[]>([])
const asyncTreeData = ref<TreeData[]>(createAsyncTreeData())
const asyncTreeUseControlledLoaded = ref(false)
const asyncTreeControlledLoadedKeys = ref<TreeKey[]>([])
const asyncTreeObservedLoadedKeys = ref<TreeKey[]>([])
const treeRef = ref<TreeExpose | null>(null)
const asyncTreeRef = ref<TreeExpose | null>(null)
const treeNodeClickCount = ref(0)
const treeDblclickCount = ref(0)
const treeSelectCount = ref(0)
const treeCheckCount = ref(0)
const treeNodeExpandCount = ref(0)
const treeNodeCollapseCount = ref(0)
const treeLoadCount = ref(0)
const treeDragStartCount = ref(0)
const treeDragEnterCount = ref(0)
const treeDragOverCount = ref(0)
const treeDragLeaveCount = ref(0)
const treeDragEndCount = ref(0)
const treeDropCount = ref(0)
const treeLastNodeClick = ref('(none)')
const treeLastDblclick = ref('(none)')
const treeLastSelect = ref('(none)')
const treeLastCheck = ref('(none)')
const treeLastNodeExpand = ref('(none)')
const treeLastNodeCollapse = ref('(none)')
const treeLastLoad = ref('(none)')
const treeLastDrag = ref('(none)')
const treeLastScrollTo = ref('(none)')
const treeEventSequence = ref(0)
const treeEventRecords = ref<TreeEventRecord[]>([])

const treeAllowDrag: TreeAllowDrag = (node) => node.key !== 'archive'

const treeAllowDrop = computed<TreeAllowDrop | undefined>(() =>
  treeUseAllowDropGuard.value
    ? (_draggingNode, dropNode, type) => dropNode.key !== 'archive' && type !== 'inner'
    : undefined
)

/**
 * 读取当前树示例的子节点字段，避免示例中的遍历逻辑写死字段名。
 */
const readTreeChildren = (node: TreeData): TreeData[] => {
  const childrenFieldName = treeNodeProps.children ?? 'children'
  const childrenValue = node[childrenFieldName]

  return Array.isArray(childrenValue) ? (childrenValue as TreeData[]) : []
}

/**
 * 按当前字段映射读取树节点标题，确保事件展示的是原始数据对象里的值。
 */
const readTreeLabel = (node: TreeData): string => {
  const labelFieldName = treeNodeProps.label ?? 'label'
  const labelValue = node[labelFieldName]

  return labelValue == null ? '(empty)' : String(labelValue)
}

/**
 * 读取树节点是否处于可选状态，保持 playground 展示与组件运行时一致。
 */
const isTreeNodeSelectable = (node: TreeData) =>
  !treeDisabledKeys.includes(node.key) && !treeUnselectableKeys.includes(node.key)

/**
 * 构建当前示例数据的 key -> node 索引，供选中结果展示与控制按钮复用。
 */
const createTreeNodeLookup = (nodes: TreeData[]): Map<TreeKey, TreeData> => {
  const keyNodeMap = new Map<TreeKey, TreeData>()

  const visit = (currentNodes: TreeData[]) => {
    for (const node of currentNodes) {
      keyNodeMap.set(node.key, node)

      const children = readTreeChildren(node)

      if (children.length > 0) {
        visit(children)
      }
    }
  }

  visit(nodes)

  return keyNodeMap
}

/**
 * 按当前 selectable / multiple 约束归一化树示例中的选中结果。
 */
const normalizeTreeSelectedKeys = (selectedKeys: TreeKey[]): TreeKey[] => {
  if (!treeSelectable.value) {
    return []
  }

  const keyNodeMap = createTreeNodeLookup(treeData)
  const normalizedKeys: TreeKey[] = []
  const visitedKeys = new Set<TreeKey>()

  for (const key of selectedKeys) {
    if (visitedKeys.has(key)) {
      continue
    }

    const node = keyNodeMap.get(key)

    if (!node || !isTreeNodeSelectable(node)) {
      continue
    }

    visitedKeys.add(key)
    normalizedKeys.push(key)

    if (!treeMultiple.value) {
      break
    }
  }

  return normalizedKeys
}

/**
 * 判断当前勾选值是否为 `{ checked, halfChecked }` 形态。
 */
const isTreeCheckedKeysObject = (
  checkedKeys: TreeCheckedKeys
): checkedKeys is Extract<TreeCheckedKeys, { checked: TreeKey[]; halfChecked: TreeKey[] }> =>
  !Array.isArray(checkedKeys)

/**
 * 归一化树示例中的单组勾选 key：
 * 1. 去重
 * 2. 过滤非法或已不存在的 key
 * 3. 过滤 hiddenCheckboxKeys
 * 4. 保留 disabledKeys / disabledCheckboxKeys 的已勾选显示
 */
const normalizeTreeCheckedKeyList = (checkedKeys: TreeKey[]): TreeKey[] => {
  const keyNodeMap = createTreeNodeLookup(treeData)
  const normalizedKeys: TreeKey[] = []
  const visitedKeys = new Set<TreeKey>()

  for (const key of checkedKeys) {
    const node = keyNodeMap.get(key)

    if (visitedKeys.has(key) || !node || treeHiddenCheckboxKeys.includes(key)) {
      continue
    }

    visitedKeys.add(key)
    normalizedKeys.push(key)
  }

  return normalizedKeys
}

/**
 * 统一归一化 playground 里的勾选值形态。
 */
const normalizeTreeCheckedValue = (checkedKeys: TreeCheckedKeys): TreeCheckedKeys => {
  if (!isTreeCheckedKeysObject(checkedKeys)) {
    return normalizeTreeCheckedKeyList(checkedKeys)
  }

  const normalizedCheckedKeys = normalizeTreeCheckedKeyList(checkedKeys.checked)
  const normalizedCheckedKeySet = new Set<TreeKey>(normalizedCheckedKeys)

  return {
    checked: normalizedCheckedKeys,
    halfChecked: normalizeTreeCheckedKeyList(checkedKeys.halfChecked).filter(
      (key) => !normalizedCheckedKeySet.has(key)
    )
  }
}

/**
 * 读取勾选值里的 checked 集合。
 */
const readTreeCheckedKeys = (checkedKeys: TreeCheckedKeys): TreeKey[] =>
  isTreeCheckedKeysObject(checkedKeys)
    ? normalizeTreeCheckedKeyList(checkedKeys.checked)
    : normalizeTreeCheckedKeyList(checkedKeys)

/**
 * 读取勾选值里的 half-checked 集合。
 */
const readTreeHalfCheckedKeys = (checkedKeys: TreeCheckedKeys): TreeKey[] =>
  isTreeCheckedKeysObject(checkedKeys)
    ? (
        normalizeTreeCheckedValue(checkedKeys) as Extract<
          TreeCheckedKeys,
          { checked: TreeKey[]; halfChecked: TreeKey[] }
        >
      ).halfChecked
    : []

/**
 * 根据当前模式创建一个空的勾选值。
 */
const createEmptyTreeCheckedValue = (): TreeCheckedKeys =>
  treeCheckStrictly.value
    ? {
        checked: [],
        halfChecked: []
      }
    : []

/**
 * 格式化事件返回的树节点对象，便于在 play 中直接观察关键字段。
 */
const formatTreeNodeSummary = (node: TreeNode) => {
  const parentKey = node.parent ? String(node.parent.key) : 'root'

  return `key=${String(node.key)}, label=${node.label}, level=${node.level}, leaf=${node.isLeaf}, parent=${parentKey}, children=${node.childNodes.length}`
}

/**
 * 统一格式化拖拽目标事件，展示拖拽源、目标节点和落点判定。
 */
const formatTreeDragTargetSummary = (
  draggingNode: TreeNode,
  dropNode: TreeNode,
  event: DragEvent
) => `drag=${String(draggingNode.key)}, target=${String(dropNode.key)}, native=${event.type}`

const formatTreeDropSummary = (
  draggingNode: TreeNode,
  dropNode: TreeNode,
  dropType: TreeNodeDropType,
  event: DragEvent
) =>
  `${formatTreeDragTargetSummary(draggingNode, dropNode, event)}, dropType=${dropType}, reordered=yes`

/**
 * 记录最近一次树事件，控制日志条数，避免示例页信息过载。
 */
const appendTreeEventRecord = (eventName: TreeEventName, message: string) => {
  treeEventSequence.value += 1
  treeEventRecords.value = [
    {
      id: treeEventSequence.value,
      message: `${eventName}: ${message}`
    },
    ...treeEventRecords.value
  ].slice(0, 6)
}

/**
 * 收集当前示例里所有可展开节点的 key，供“全部展开”与默认全展开复用。
 */
const collectTreeExpandableKeys = (nodes: TreeData[]): TreeKey[] => {
  const expandedKeys: TreeKey[] = []

  for (const node of nodes) {
    const children = readTreeChildren(node)

    if (children.length === 0) {
      continue
    }

    expandedKeys.push(node.key)
    expandedKeys.push(...collectTreeExpandableKeys(children))
  }

  return expandedKeys
}

/**
 * 按默认展开方式生成树示例的初始化配置。
 */
const createTreeDefaultExpandConfig = (mode: TreeDefaultExpandMode): TreeDefaultExpandConfig => {
  if (mode === 'all') {
    const expandedKeys = collectTreeExpandableKeys(treeData)

    return {
      defaultExpandAll: true,
      defaultExpandedKeys: undefined,
      defaultExpandParent: true,
      sourceExpandedKeys: expandedKeys
    }
  }

  if (mode === 'roots') {
    const expandedKeys: TreeKey[] = ['workspace', 'design-system']

    return {
      defaultExpandAll: false,
      defaultExpandedKeys: expandedKeys,
      defaultExpandParent: false,
      sourceExpandedKeys: expandedKeys
    }
  }

  if (mode === 'focus-path') {
    const expandedKeys: TreeKey[] = ['design-system-components-table']

    return {
      defaultExpandAll: false,
      defaultExpandedKeys: expandedKeys,
      defaultExpandParent: true,
      sourceExpandedKeys: expandedKeys
    }
  }

  return {
    defaultExpandAll: false,
    defaultExpandedKeys: undefined,
    defaultExpandParent: true,
    sourceExpandedKeys: []
  }
}

/**
 * 将当前选择的默认展开方式重新应用到树示例中。
 */
const applyTreeDefaultExpandMode = () => {
  const nextConfig = createTreeDefaultExpandConfig(treeDefaultExpandMode.value)

  treeUseControlledExpand.value = false
  treeDefaultExpandAll.value = nextConfig.defaultExpandAll
  treeDefaultExpandedKeys.value = nextConfig.defaultExpandedKeys
  treeDefaultExpandParent.value = nextConfig.defaultExpandParent
  treeControlledExpandedKeys.value = nextConfig.sourceExpandedKeys
  treeObservedExpandedKeys.value = nextConfig.sourceExpandedKeys
  treeDemoVersion.value += 1
}

/**
 * 将树示例切换到受控模式并展开全部分支。
 */
const expandAllTreeNodes = () => {
  const expandedKeys = collectTreeExpandableKeys(treeData)

  treeUseControlledExpand.value = true
  treeControlledExpandedKeys.value = expandedKeys
  treeObservedExpandedKeys.value = expandedKeys
}

/**
 * 将树示例切换到受控模式并收起全部分支。
 */
const collapseAllTreeNodes = () => {
  treeUseControlledExpand.value = true
  treeControlledExpandedKeys.value = []
  treeObservedExpandedKeys.value = []
}

/**
 * 恢复到当前默认展开方式对应的非受控示例状态。
 */
const restoreTreeDefaultExpandMode = () => {
  applyTreeDefaultExpandMode()
}

/**
 * 重置异步树数据与 loadedKeys，便于重复观察阶段 13 的加载链路。
 */
const resetAsyncTreeData = () => {
  asyncTreeData.value = createAsyncTreeData()
  asyncTreeControlledLoadedKeys.value = []
  asyncTreeObservedLoadedKeys.value = []
}

/**
 * 切换异步树 loadedKeys 受控模式，并保持当前可见 loadedKeys。
 */
const toggleAsyncTreeControlledLoaded = () => {
  asyncTreeUseControlledLoaded.value = !asyncTreeUseControlledLoaded.value

  if (asyncTreeUseControlledLoaded.value) {
    asyncTreeControlledLoadedKeys.value = asyncTreeObservedLoadedKeys.value
  }
}

/**
 * 调用普通树公开的 scrollTo，验证滚动控制不依赖固定树高度。
 */
const scrollTreeTo = (key: TreeKey, align: TreeScrollAlign) => {
  treeRef.value?.scrollTo({
    key,
    align
  })
  treeLastScrollTo.value = `tree key=${String(key)}, align=${align}`
}

/**
 * 调用异步树公开的 scrollTo，验证异步示例也使用同一 expose。
 */
const scrollAsyncTreeTo = (key: TreeKey, align: TreeScrollAlign) => {
  asyncTreeRef.value?.scrollTo({
    key,
    align
  })
  treeLastScrollTo.value = `async key=${String(key)}, align=${align}`
}

/**
 * 模拟业务侧异步请求，并由父组件负责把子节点写回 data。
 */
const loadAsyncTreeNode = async (node: TreeNode): Promise<unknown> => {
  await new Promise((resolve) => window.setTimeout(resolve, 1060))

  const children = createAsyncTreeChildren(node)

  asyncTreeData.value = replaceTreeNodeChildren(asyncTreeData.value, node.key, children)

  return children
}

/**
 * 将树示例切换到受控选中模式，并写入指定选中键。
 */
const enableControlledTreeSelection = (selectedKeys: TreeKey[]) => {
  const nextSelectedKeys = normalizeTreeSelectedKeys(selectedKeys)

  treeUseControlledSelect.value = true
  treeControlledSelectedKeys.value = nextSelectedKeys
  treeObservedSelectedKeys.value = nextSelectedKeys
}

/**
 * 在受控选中模式下清空当前选中项。
 */
const clearControlledTreeSelection = () => {
  enableControlledTreeSelection([])
}

/**
 * 恢复到默认选中示例，并通过 remount 重新触发 `defaultSelectedKeys`。
 */
const restoreDefaultTreeSelection = () => {
  treeUseControlledSelect.value = false
  treeObservedSelectedKeys.value = normalizeTreeSelectedKeys(treeDefaultSelectedKeys.value ?? [])
  treeDemoVersion.value += 1
}

/**
 * 将树示例切换到受控勾选模式，并写入指定勾选键。
 */
const enableControlledTreeCheck = (checkedKeys: TreeCheckedKeys) => {
  const nextCheckedKeys = normalizeTreeCheckedValue(checkedKeys)

  treeCheckable.value = true
  treeUseControlledCheck.value = true
  treeControlledCheckedKeys.value = nextCheckedKeys
  treeObservedCheckedKeys.value = nextCheckedKeys
  treeObservedHalfCheckedKeys.value = readTreeHalfCheckedKeys(nextCheckedKeys)
}

/**
 * 在受控勾选模式下清空当前勾选项。
 */
const clearControlledTreeCheck = () => {
  enableControlledTreeCheck(createEmptyTreeCheckedValue())
}

/**
 * 恢复到默认勾选示例，并通过 remount 重新触发 `defaultCheckedKeys`。
 */
const restoreDefaultTreeCheck = () => {
  treeUseControlledCheck.value = false
  treeControlledCheckedKeys.value = createEmptyTreeCheckedValue()
  treeObservedCheckedKeys.value = normalizeTreeCheckedValue(treeDefaultCheckedKeys.value ?? [])
  treeObservedHalfCheckedKeys.value = treeCheckStrictly.value
    ? readTreeHalfCheckedKeys(treeObservedCheckedKeys.value)
    : []
  treeDemoVersion.value += 1
}

/**
 * 应用阶段 7 的默认联动勾选示例。
 */
const applyConductCheckScenario = () => {
  treeCheckable.value = true
  treeCheckStrictly.value = false
  treeUseControlledCheck.value = false
  treeDefaultCheckedKeys.value = ['design-system-components-tree']
  treeControlledCheckedKeys.value = createEmptyTreeCheckedValue()
  treeObservedCheckedKeys.value = normalizeTreeCheckedValue(treeDefaultCheckedKeys.value ?? [])
  treeObservedHalfCheckedKeys.value = ['design-system', 'design-system-components']
  treeDemoVersion.value += 1
}

/**
 * 应用阶段 8 的 strict 对象态示例。
 */
const applyStrictCheckScenario = () => {
  treeCheckable.value = true
  treeCheckStrictly.value = true
  treeUseControlledCheck.value = true
  treeDefaultCheckedKeys.value = undefined
  treeControlledCheckedKeys.value = normalizeTreeCheckedValue({
    checked: ['design-system-components-tree', 'delivery-quality-playground'],
    halfChecked: ['design-system-components', 'delivery-quality']
  })
  treeObservedCheckedKeys.value = treeControlledCheckedKeys.value
  treeObservedHalfCheckedKeys.value = readTreeHalfCheckedKeys(treeControlledCheckedKeys.value)
  treeDemoVersion.value += 1
}

/**
 * 应用阶段 9 的禁用 / 隐藏复选框边界示例。
 */
const applyCheckBoundaryScenario = () => {
  treeCheckable.value = true
  treeCheckStrictly.value = false
  treeUseControlledCheck.value = false
  treeDefaultCheckedKeys.value = ['archive', 'delivery-quality', 'delivery-quality-hidden-checkbox']
  treeControlledCheckedKeys.value = createEmptyTreeCheckedValue()
  treeObservedCheckedKeys.value = normalizeTreeCheckedValue(treeDefaultCheckedKeys.value ?? [])
  treeObservedHalfCheckedKeys.value = ['delivery']
  treeDemoVersion.value += 1
}

/**
 * 切换普通树单选 / 多选模式，并同步规整 playground 侧的观察结果。
 */
const toggleTreeMultiple = () => {
  treeMultiple.value = !treeMultiple.value
  treeControlledSelectedKeys.value = normalizeTreeSelectedKeys(treeControlledSelectedKeys.value)
  treeObservedSelectedKeys.value = normalizeTreeSelectedKeys(treeObservedSelectedKeys.value)
}

/**
 * 同步树示例抛出的源展开键，并在受控模式下回写到示例状态。
 */
const handleTreeExpandedKeysChange = (expandedKeys: TreeKey[]) => {
  treeObservedExpandedKeys.value = expandedKeys

  if (treeUseControlledExpand.value) {
    treeControlledExpandedKeys.value = expandedKeys
  }
}

/**
 * 同步树示例抛出的源选中键，并在受控模式下回写到示例状态。
 */
const handleTreeSelectedKeysChange = (selectedKeys: TreeKey[]) => {
  const nextSelectedKeys = normalizeTreeSelectedKeys(selectedKeys)

  treeObservedSelectedKeys.value = nextSelectedKeys

  if (treeUseControlledSelect.value) {
    treeControlledSelectedKeys.value = nextSelectedKeys
  }
}

/**
 * 同步树示例抛出的源勾选键，并在受控模式下回写到示例状态。
 */
const handleTreeCheckedKeysChange = (checkedKeys: TreeCheckedKeys) => {
  const nextCheckedKeys = normalizeTreeCheckedValue(checkedKeys)

  treeObservedCheckedKeys.value = nextCheckedKeys

  if (treeUseControlledCheck.value) {
    treeControlledCheckedKeys.value = nextCheckedKeys
  }
}

/**
 * 同步异步树 loadedKeys，并在受控模式下回写到示例状态。
 */
const handleAsyncTreeLoadedKeysChange = (loadedKeys: TreeKey[]) => {
  asyncTreeObservedLoadedKeys.value = loadedKeys

  if (asyncTreeUseControlledLoaded.value) {
    asyncTreeControlledLoadedKeys.value = loadedKeys
  }
}

/**
 * 返回当前默认展开方式的中文标签，便于在示例说明中展示。
 */
/**
 * 清空树事件记录与计数，便于重复验证事件行为。
 */
const resetTreeEventRecords = () => {
  treeNodeClickCount.value = 0
  treeDblclickCount.value = 0
  treeSelectCount.value = 0
  treeCheckCount.value = 0
  treeNodeExpandCount.value = 0
  treeNodeCollapseCount.value = 0
  treeLoadCount.value = 0
  treeDragStartCount.value = 0
  treeDragEnterCount.value = 0
  treeDragOverCount.value = 0
  treeDragLeaveCount.value = 0
  treeDragEndCount.value = 0
  treeDropCount.value = 0
  treeLastNodeClick.value = '(none)'
  treeLastDblclick.value = '(none)'
  treeLastSelect.value = '(none)'
  treeLastCheck.value = '(none)'
  treeLastNodeExpand.value = '(none)'
  treeLastNodeCollapse.value = '(none)'
  treeLastLoad.value = '(none)'
  treeLastDrag.value = '(none)'
  treeLastScrollTo.value = '(none)'
  treeEventSequence.value = 0
  treeEventRecords.value = []
}

/**
 * 演示 `node-click` 事件，展示原始数据、节点对象、组件实例和原生事件的关键信息。
 */
const handleTreeNodeClick = (
  data: TreeData,
  node: TreeNode,
  component: TreeNodeInstance,
  event: TreeInteractionEvent
) => {
  const summary = `${formatTreeNodeSummary(node)}, rawLabel=${readTreeLabel(data)}, event=${event.type}, component=${component ? 'ready' : 'null'}`

  treeNodeClickCount.value += 1
  treeLastNodeClick.value = summary
  appendTreeEventRecord('node-click', summary)
}

/**
 * 演示 `dblclick` 事件，展示双击节点与原生事件。
 */
const handleTreeDblclick = (
  data: TreeData,
  node: TreeNode,
  component: TreeNodeInstance,
  event: MouseEvent
) => {
  const summary = `${formatTreeNodeSummary(node)}, rawLabel=${readTreeLabel(data)}, event=${event.type}, component=${component ? 'ready' : 'null'}`

  treeDblclickCount.value += 1
  treeLastDblclick.value = summary
  appendTreeEventRecord('dblclick', summary)
}

/**
 * 演示 `select` 事件，展示最新选中结果与事件对象。
 */
const handleTreeSelect = (selectedKeys: TreeKey[], event: TreeSelectEvent) => {
  const selectedKeysSummary = selectedKeys.length ? selectedKeys.join(', ') : '(empty)'
  const selectedNodeSummary = event.selectedNodes.length
    ? event.selectedNodes.map((node) => String(node.key)).join(', ')
    : '(empty)'
  const summary = `selected=${event.selected}, key=${String(event.key)}, selectedKeys=${selectedKeysSummary}, selectedNodes=${selectedNodeSummary}, event=${event.event.type}, node=${formatTreeNodeSummary(event.node)}`

  treeSelectCount.value += 1
  treeLastSelect.value = summary
  appendTreeEventRecord('select', summary)
}

/**
 * 演示 `check` 事件，展示最新勾选结果与事件对象。
 */
const handleTreeCheck = (checkedKeys: TreeCheckedKeys, event: TreeCheckEvent) => {
  const normalizedCheckedKeys = readTreeCheckedKeys(checkedKeys)
  const halfCheckedKeys = isTreeCheckedKeysObject(checkedKeys)
    ? readTreeHalfCheckedKeys(checkedKeys)
    : event.halfCheckedKeys
  const checkedKeysSummary = normalizedCheckedKeys.length
    ? normalizedCheckedKeys.join(', ')
    : '(empty)'
  const halfCheckedKeysSummary = halfCheckedKeys.length ? halfCheckedKeys.join(', ') : '(empty)'
  const checkedNodeSummary = event.checkedNodes.length
    ? event.checkedNodes.map((node) => String(node.key)).join(', ')
    : '(empty)'
  const summary = `checked=${event.checked}, key=${String(event.key)}, checkedKeys=${checkedKeysSummary}, halfCheckedKeys=${halfCheckedKeysSummary}, checkedNodes=${checkedNodeSummary}, event=${event.event.type}, node=${formatTreeNodeSummary(event.node)}`

  treeObservedHalfCheckedKeys.value = event.halfCheckedKeys
  treeCheckCount.value += 1
  treeLastCheck.value = summary
  appendTreeEventRecord('check', summary)
}

/**
 * 演示 `node-expand` 事件，重点展示切换后的展开状态与节点层级信息。
 */
const handleTreeNodeExpand = (
  data: TreeData,
  node: TreeExpandedNode,
  instance: TreeNodeInstance
) => {
  const summary = `${formatTreeNodeSummary(node)}, rawLabel=${readTreeLabel(data)}, expanded=${node.expanded}, instance=${instance ? 'ready' : 'null'}`

  treeNodeExpandCount.value += 1
  treeLastNodeExpand.value = summary
  appendTreeEventRecord('node-expand', summary)
}

/**
 * 演示 `node-collapse` 事件，重点展示切换后的展开状态与节点层级信息。
 */
const handleTreeNodeCollapse = (
  data: TreeData,
  node: TreeExpandedNode,
  instance: TreeNodeInstance
) => {
  const summary = `${formatTreeNodeSummary(node)}, rawLabel=${readTreeLabel(data)}, expanded=${node.expanded}, instance=${instance ? 'ready' : 'null'}`

  treeNodeCollapseCount.value += 1
  treeLastNodeCollapse.value = summary
  appendTreeEventRecord('node-collapse', summary)
}

/**
 * 演示 `load` 事件，展示异步加载完成后的 loadedKeys 与节点信息。
 */
const handleTreeLoad = (loadedKeys: TreeKey[], event: TreeLoadEvent) => {
  const loadedKeysSummary = loadedKeys.length ? loadedKeys.join(', ') : '(empty)'
  const summary = `key=${String(event.key)}, loadedKeys=${loadedKeysSummary}, node=${formatTreeNodeSummary(event.node)}`

  treeLoadCount.value += 1
  treeLastLoad.value = summary
  appendTreeEventRecord('load', summary)
}

/**
 * 演示拖拽开始事件，展示当前拖拽源节点。
 */
const handleTreeDragStart = (node: TreeNode, event: DragEvent) => {
  const summary = `node=${formatTreeNodeSummary(node)}, native=${event.type}`

  treeDragStartCount.value += 1
  treeLastDrag.value = summary
  appendTreeEventRecord('node-drag-start', summary)
}

/**
 * 演示 node-drag-enter，展示当前拖拽源与目标节点。
 */
const handleTreeDragEnter = (draggingNode: TreeNode, dropNode: TreeNode, event: DragEvent) => {
  const summary = formatTreeDragTargetSummary(draggingNode, dropNode, event)

  treeDragEnterCount.value += 1
  treeLastDrag.value = summary
  appendTreeEventRecord('node-drag-enter', summary)
}

/**
 * 演示 node-drag-over，展示当前拖拽源与目标节点。
 */
const handleTreeDragOver = (draggingNode: TreeNode, dropNode: TreeNode, event: DragEvent) => {
  const summary = formatTreeDragTargetSummary(draggingNode, dropNode, event)

  treeDragOverCount.value += 1
  treeLastDrag.value = summary
  appendTreeEventRecord('node-drag-over', summary)
}

/**
 * 演示 node-drag-leave，展示离开前的目标节点。
 */
const handleTreeDragLeave = (draggingNode: TreeNode, dropNode: TreeNode, event: DragEvent) => {
  const summary = formatTreeDragTargetSummary(draggingNode, dropNode, event)

  treeDragLeaveCount.value += 1
  treeLastDrag.value = summary
  appendTreeEventRecord('node-drag-leave', summary)
}

/**
 * 演示拖拽结束事件，展示最终拖拽源节点。
 */
const handleTreeDragEnd = (
  draggingNode: TreeNode,
  dropNode: TreeNode | null,
  dropType: TreeNodeDropType,
  event: DragEvent
) => {
  const summary = dropNode
    ? formatTreeDropSummary(draggingNode, dropNode, dropType, event)
    : `node=${formatTreeNodeSummary(draggingNode)}, dropType=${dropType}, native=${event.type}`

  treeDragEndCount.value += 1
  treeLastDrag.value = summary
  appendTreeEventRecord('node-drag-end', summary)
}

/**
 * 演示 node-drop 事件，组件已经在事件触发前完成内部重排。
 */
const handleTreeDrop = (
  draggingNode: TreeNode,
  dropNode: TreeNode,
  dropType: Exclude<TreeNodeDropType, 'none'>,
  event: DragEvent
) => {
  const summary = formatTreeDropSummary(draggingNode, dropNode, dropType, event)

  treeDropCount.value += 1
  treeLastDrag.value = summary
  appendTreeEventRecord('node-drop', summary)
}

const currentTreeDefaultExpandLabel = computed(
  () =>
    treeDefaultExpandOptions.find((item) => item.value === treeDefaultExpandMode.value)?.label ??
    '默认收起'
)

/**
 * 返回当前树示例对外可见的源展开键集合。
 */
const currentTreeExpandedKeys = computed(() =>
  treeUseControlledExpand.value ? treeControlledExpandedKeys.value : treeObservedExpandedKeys.value
)

/**
 * 返回当前树示例可见的选中结果；关闭 selectable 时视图层选中态为空。
 */
const currentTreeSelectedKeys = computed(() =>
  treeSelectable.value
    ? treeUseControlledSelect.value
      ? normalizeTreeSelectedKeys(treeControlledSelectedKeys.value)
      : normalizeTreeSelectedKeys(treeObservedSelectedKeys.value)
    : []
)

/**
 * 返回当前树示例可见的勾选结果；关闭 checkable 时视图层勾选态为空。
 */
const currentTreeCheckedKeys = computed(() =>
  treeCheckable.value
    ? treeUseControlledCheck.value
      ? readTreeCheckedKeys(normalizeTreeCheckedValue(treeControlledCheckedKeys.value))
      : readTreeCheckedKeys(normalizeTreeCheckedValue(treeObservedCheckedKeys.value))
    : []
)

/**
 * 返回当前树示例可见的 half-checked 结果。
 */
const currentTreeHalfCheckedKeys = computed(() =>
  treeCheckable.value
    ? treeCheckStrictly.value
      ? treeUseControlledCheck.value
        ? readTreeHalfCheckedKeys(normalizeTreeCheckedValue(treeControlledCheckedKeys.value))
        : readTreeHalfCheckedKeys(normalizeTreeCheckedValue(treeObservedCheckedKeys.value))
      : treeObservedHalfCheckedKeys.value
    : []
)

/**
 * 返回异步树示例当前可见的 loadedKeys。
 */
const currentAsyncTreeLoadedKeys = computed(() =>
  asyncTreeUseControlledLoaded.value
    ? asyncTreeControlledLoadedKeys.value
    : asyncTreeObservedLoadedKeys.value
)

/**
 * 演示阶段 12 的 root / item 外壳语义化样式，不触碰节点内部内容区结构。
 */
const createTreeSemanticClassNames: TreeClassNames = ({ props }) => ({
  root: {
    'tree-semantic-root': true,
    'is-line': Boolean(props.showLine)
  },
  item: {
    'tree-semantic-item': true,
    'is-checkable': Boolean(props.checkable)
  }
})

const treeSemanticClassNames = computed<TreeClassNames | undefined>(() =>
  treeUseSemanticStyles.value ? createTreeSemanticClassNames : undefined
)

/**
 * 通过函数形式展示 `info.props` 可读取当前 Tree props。
 */
const createTreeSemanticStyles: TreeStyles = ({ props }) => ({
  root: {
    borderColor: props.showLine ? '#79bbff' : '#95d475'
  },
  item: {
    backgroundColor: props.checkable ? 'rgba(64, 158, 255, 0.08)' : 'rgba(103, 194, 58, 0.08)'
  }
})

const treeSemanticStyles = computed<TreeStyles | undefined>(() =>
  treeUseSemanticStyles.value ? createTreeSemanticStyles : undefined
)

applyTreeDefaultExpandMode()
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

.tree-demo-row {
  width: 100%;
}

.tree-demo {
  min-width: 280px;
}

:deep(.tree-semantic-root) {
  border: 1px solid #79bbff;
  border-radius: 8px;
  padding: 8px;
}

:deep(.tree-semantic-root.is-line) {
  box-shadow: inset 3px 0 0 #409eff;
}

:deep(.tree-semantic-item) {
  border: 1px solid transparent;
  border-radius: 6px;
  margin: 2px 0;
}

:deep(.tree-semantic-item.is-checkable) {
  border-color: rgba(64, 158, 255, 0.22);
}

.tree-slot-content {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.tree-slot-primary {
  min-width: 0;
}

.tree-slot-meta {
  flex: none;
  color: #909399;
  font-size: 12px;
}

.tree-event-list {
  margin: 8px 0 0;
  padding-left: 18px;
}

.tree-event-item {
  margin-top: 4px;
  word-break: break-all;
}

.icon-demo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.icon-demo-card {
  display: flex;
  min-width: 160px;
  align-items: center;
  gap: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  padding: 12px 14px;
}

.icon-demo-label {
  color: #606266;
  font-size: 13px;
}

.icon-demo-plain {
  flex: none;
}
</style>
