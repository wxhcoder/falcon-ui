import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createChecker } from 'vue-component-meta'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(currentDir, '../..')
const tsconfigPath = path.resolve(rootDir, 'tsconfig.docs.json')
const outputDir = path.resolve(rootDir, 'docs/public/api-meta')

const toProjectLineEndings = (content) => content.replace(/\n/g, '\r\n')

const targets = [
  {
    id: 'fl-button',
    filePath: path.resolve(rootDir, 'packages/components/button/src/button.vue')
  },
  {
    id: 'fl-input',
    filePath: path.resolve(rootDir, 'packages/components/input/src/input.vue')
  },
  {
    id: 'fl-select',
    filePath: path.resolve(rootDir, 'packages/components/select/src/select.vue')
  },
  {
    id: 'fl-input-search',
    filePath: path.resolve(rootDir, 'packages/components/input-search/src/input-search.vue')
  },
  {
    id: 'fl-input-number',
    filePath: path.resolve(rootDir, 'packages/components/input-number/src/input-number.vue')
  },
  {
    id: 'fl-date-picker',
    filePath: path.resolve(rootDir, 'packages/components/date-picker/src/date-picker.vue')
  },
  {
    id: 'fl-qr-code',
    filePath: path.resolve(rootDir, 'packages/components/qr-code/src/qr-code.vue')
  },
  {
    id: 'fl-barcode',
    filePath: path.resolve(rootDir, 'packages/components/barcode/src/barcode.vue')
  },
  {
    id: 'fl-dialog',
    filePath: path.resolve(rootDir, 'packages/components/dialog/src/dialog.vue')
  },
  {
    id: 'fl-tree',
    filePath: path.resolve(rootDir, 'packages/components/tree/src/tree.vue')
  },
  {
    id: 'fl-table',
    filePath: path.resolve(rootDir, 'packages/components/table/src/table.vue')
  }
]

const normalizeText = (value) => (value ? String(value).trim() : '')

const customDescriptionOverrides = {
  'fl-button': {
    events: {
      'debug-click': '开启 debugMode 后，按钮点击时触发。'
    }
  },
  'fl-dialog': {
    events: {
      cancel: '点击内置取消动作时触发。',
      confirm: '点击内置确认动作时触发。',
      'update:modelValue': '对话框显示状态发生变化时触发。'
    }
  },
  'fl-input': {
    events: {
      'custom-input': '输入值变化时触发，携带当前值与字符长度。',
      'debug-event': '开启 debugMode 后在 custom-input 之后触发。'
    }
  },
  'fl-input-search': {
    events: {
      clear: '清空值时触发，携带清空原因。',
      openDialog: '需要外部接管弹窗时触发。',
      'search-error': '回车检索失败时触发。',
      'selection-commit': '回车检索唯一结果并完成回填时触发。',
      'update:label': '显示标签值变化时触发。',
      'update:modelValue': '绑定值变化时触发。'
    }
  },
  'fl-input-number': {
    events: {
      'custom-input': '输入值变化时触发，携带当前原始值与归一化数值。',
      'strict-error': 'STRICT 模式下当输入精度超限时触发。',
      'update:isError': '内部严格模式错误态变化时触发。'
    }
  },
  'fl-table': {
    component: {
      '': '基于 Element Plus ElTable 的二次封装，提供默认样式、多选增强、Proxy 变更劫持与行列拖拽能力。'
    },
    props: {
      data: '表格数据源。',
      selectionRowClick: '存在 selection 列时，是否支持点击行联动选中。',
      selectionSingle: '多选模式下是否限制为仅能选中一行。',
      enableCellProxyIntercept: '是否开启单元格数据写入劫持并触发 cell-change。',
      cellProxyMaxDepth: 'Proxy 劫持的最大深度。',
      rowDraggable: '是否开启行拖拽。',
      columnDraggable: '是否开启列拖拽。',
      rowDragHandleColumnIndex: '行拖拽控制柄所在列索引。',
      rowKeyField: '事件回调中用于标识行主键的字段名。'
    },
    events: {
      'selection-row-toggle': '点击行或选择变化导致选中状态切换时触发。',
      'selection-single-conflict': '单选约束与原生多选行为冲突时触发。',
      'cell-change': '代理数据检测到单元格字段写入时触发。',
      'row-drag-start': '开始拖拽行时触发。',
      'row-drag-end': '结束拖拽行时触发。',
      'row-order-change': '行顺序发生变化时触发。',
      'column-drag-start': '开始拖拽列时触发。',
      'column-drag-end': '结束拖拽列时触发。',
      'column-order-change': '列顺序发生变化时触发。'
    },
    slots: {
      default: '表格列内容插槽。',
      append: '表格底部附加内容插槽。',
      empty: '空状态内容插槽。'
    }
  }
}

const resolveDescription = (componentId, section, name, description) => {
  const normalizedDescription = normalizeText(description)
  if (normalizedDescription) {
    return normalizedDescription
  }

  const sectionOverrides = customDescriptionOverrides[componentId]?.[section]
  if (!sectionOverrides) {
    return ''
  }

  return normalizeText(sectionOverrides[name] ?? '')
}

const toApiMeta = (componentId, meta) => ({
  component: meta.name || componentId,
  description: resolveDescription(componentId, 'component', '', meta.description),
  events: meta.events
    .map((item) => ({
      description: resolveDescription(componentId, 'events', item.name, item.description),
      name: item.name,
      signature: item.signature,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  exposes: meta.exposed
    .map((item) => ({
      description: resolveDescription(componentId, 'exposes', item.name, item.description),
      name: item.name,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  props: meta.props
    .filter((item) => !item.global)
    .map((item) => ({
      default: item.default ?? '-',
      description: resolveDescription(componentId, 'props', item.name, item.description),
      name: item.name,
      required: item.required,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  slots: meta.slots
    .map((item) => ({
      description: resolveDescription(componentId, 'slots', item.name, item.description),
      name: item.name,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const generate = () => {
  const checker = createChecker(tsconfigPath, {
    forceUseTs: true
  })

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  for (const target of targets) {
    const meta = checker.getComponentMeta(target.filePath)
    const output = toApiMeta(target.id, meta)
    const outputPath = path.resolve(outputDir, `${target.id}.json`)
    fs.writeFileSync(
      outputPath,
      toProjectLineEndings(`${JSON.stringify(output, null, 2)}\n`),
      'utf8'
    )
    process.stdout.write(`[docs:api] generated ${path.relative(rootDir, outputPath)}\n`)
  }
}

generate()
