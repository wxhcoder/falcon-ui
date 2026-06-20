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
    id: 'fl-tree-select',
    filePath: path.resolve(rootDir, 'packages/components/tree-select/src/tree-select.vue')
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
  },
  {
    id: 'fl-radial-menu',
    filePath: path.resolve(rootDir, 'packages/components/radial-menu/src/radial-menu.vue')
  },
  {
    id: 'fl-radial-menu-item',
    filePath: path.resolve(rootDir, 'packages/components/radial-menu/src/radial-menu-item.vue')
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
  'fl-tree-select': {
    component: {
      '': '树选择器组件，用于从层级数据中选择值，支持错误态和表格内样式。'
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
  'fl-tree': {
    component: {
      '': '自研树组件，用于展示层级数据并承载展开、选择、勾选、异步加载、拖拽、键盘导航和滚动定位等交互。'
    },
    props: {
      allowDrag: '节点拖拽源拦截函数，返回 false 时当前节点不可被拖拽。',
      allowDrop: '节点投放位置拦截函数，返回 false 时当前拖拽节点不可投放到该位置。',
      accordion: '是否启用手风琴展开模式，开启后同一父节点下最多只展开一个同级节点。',
      autoExpandParent: '受控展开时，是否根据 expandedKeys 自动补齐祖先节点展开。',
      checkable: '是否显示节点复选框。',
      checkedKeys: '受控勾选键集合；严格模式下也可传入 checked 与 halfChecked 对象。',
      checkStrictly: '是否启用严格勾选模式，开启后父子节点勾选状态相互独立。',
      classNames: '按语义化 DOM 挂点注入 class，支持对象或函数形式。',
      data: '树形数据源，每个节点必须提供唯一 key。',
      defaultCheckedKeys: '非受控模式下初始化勾选的节点 key 集合。',
      defaultExpandAll: '是否在初始化时展开所有可展开节点。',
      defaultExpandedKeys: '非受控模式下初始化展开的节点 key 集合。',
      defaultExpandParent: '初始化默认展开时，是否自动展开默认展开节点的祖先节点。',
      defaultSelectedKeys: '非受控模式下初始化选中的节点 key 集合。',
      disabledCheckboxKeys: '禁用复选框交互的节点 key 集合，不会隐藏复选框。',
      disabledKeys: '整体禁用的节点 key 集合，禁用后节点不可选择且复选框不可交互。',
      draggable: '是否开启单树内部节点拖拽排序。',
      expandedKeys: '受控展开的节点 key 集合。',
      filterTreeNode: '节点过滤命中函数，返回 true 时节点进入过滤高亮态。',
      hiddenCheckboxKeys: '隐藏复选框的节点 key 集合，不阻断子孙节点勾选。',
      loadData: '异步加载函数，展开未加载的非叶子节点时调用。',
      loadedKeys: '受控记录已完成异步加载的节点 key 集合。',
      multiple: '是否允许同时选中多个节点。',
      nodeClassName: '节点外壳 class 回调，接收 { node, data } 并返回 Vue class 绑定值。',
      props: '树节点字段映射配置，用于指定 label、children 和 isLeaf 字段名。',
      selectable: '是否允许节点进入选中链路。',
      selectedKeys: '受控选中的节点 key 集合。',
      showLine: '是否显示树节点连线；对象形式可配置是否显示叶子节点图标。',
      styles: '按语义化 DOM 挂点注入内联样式，支持对象或函数形式。',
      switcherIcon: '展开器图标模式，支持 arrow、plus-minus 和 folder。',
      switcherLoadingIcon: '异步加载中的展开器图标组件。',
      unselectableKeys: '不可选中的节点 key 集合，节点仍可展开、勾选或触发其他交互。'
    },
    events: {
      check: '节点复选框勾选状态变化后触发，回传最新勾选结果和事件详情。',
      dblclick: '节点内容区被双击时触发，回传节点数据、节点对象、组件实例和鼠标事件。',
      expand: '节点展开状态切换后触发，回传当前节点展开结果和最新展开键集合。',
      load: '节点异步加载完成后触发，回传最新已加载键集合和加载事件详情。',
      'node-click': '节点内容区被点击时触发，回传节点数据、节点对象、组件实例和交互事件。',
      'node-collapse': '节点被收起时触发，回传节点数据、带展开状态的节点对象和组件实例。',
      'node-drag-end': '节点拖拽结束时触发，回传拖拽源、目标节点、投放类型和拖拽事件。',
      'node-drag-enter': '拖拽进入节点落点区域时触发，回传拖拽源、目标节点和拖拽事件。',
      'node-drag-leave': '拖拽离开节点落点区域时触发，回传拖拽源、目标节点和拖拽事件。',
      'node-drag-over': '拖拽悬停在节点落点区域时触发，回传拖拽源、目标节点和拖拽事件。',
      'node-drag-start': '节点开始拖拽时触发，回传拖拽源节点和拖拽事件。',
      'node-drop': '节点成功投放时触发，回传拖拽源、目标节点、投放类型和拖拽事件。',
      'node-expand': '节点被展开时触发，回传节点数据、带展开状态的节点对象和组件实例。',
      'right-click': '节点内容区被右键点击时触发，不会触发选择、勾选或展开链路。',
      select: '节点选中状态变化后触发，回传最新选中 key 集合和事件详情。',
      'update:checkedKeys': '请求外部同步当前勾选键集合。',
      'update:expandedKeys': '请求外部同步当前展开键集合。',
      'update:loadedKeys': '请求外部同步当前已完成异步加载的节点 key 集合。',
      'update:selectedKeys': '请求外部同步当前选中键集合。'
    },
    exposes: {
      scrollTo: '滚动定位到当前已渲染且可见的节点；非法 key、折叠子树或未渲染节点不会产生效果。'
    },
    slots: {
      default: '自定义节点内容区插槽，参数为 { node, data }；仅接管 switcher / checkbox 右侧内容。'
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
