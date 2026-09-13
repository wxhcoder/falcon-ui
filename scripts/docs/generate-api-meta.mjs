import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createChecker } from 'vue-component-meta'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(currentDir, '../..')
const tsconfigPath = path.resolve(rootDir, 'tsconfig.docs.json')
const rootOutputDir = path.resolve(rootDir, 'docs/public/api-meta')
const englishOutputDir = path.resolve(rootDir, 'docs/public/en/api-meta')

const toProjectLineEndings = (content) => content.replace(/\n/g, '\r\n')

const targets = [
  {
    id: 'fl-loading',
    filePath: path.resolve(rootDir, 'packages/components/loading/src/FlLoading.vue')
  },
  {
    id: 'fl-text-shimmer',
    filePath: path.resolve(rootDir, 'packages/components/text-shimmer/src/text-shimmer.vue')
  },
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

const hasChineseText = (value) => /[\u4e00-\u9fff]/u.test(value || '')

const sharedDescriptionOverrides = {
  events: {
    blur: '输入框失去焦点时触发。',
    change: '绑定值确认变化时触发。',
    clear: '点击清空按钮清掉内容时触发。',
    click: '点击组件时触发。',
    close: '关闭时触发。',
    closed: '关闭动画结束后触发。',
    closeAutoFocus: '关闭后焦点回到触发位置时触发。',
    compositionend: '中文等组合输入结束时触发。',
    compositionstart: '中文等组合输入开始时触发。',
    compositionupdate: '中文等组合输入内容更新时触发。',
    focus: '输入框获得焦点时触发。',
    input: '用户正在输入时触发。',
    keydown: '按下键盘按键时触发。',
    mouseenter: '鼠标移入组件时触发。',
    mouseleave: '鼠标移出组件时触发。',
    open: '打开时触发。',
    opened: '打开动画结束后触发。',
    openAutoFocus: '打开后焦点进入组件时触发。',
    'update:modelValue': '请求外部同步双向绑定值。'
  },
  exposes: {
    blur: '让内部输入框失去焦点。',
    clear: '清空内部输入框的内容。',
    clearFilter: '清空表格筛选条件。',
    clearSelection: '清空表格当前选中的行。',
    clearSort: '清空表格排序状态。',
    close: '主动关闭组件。',
    closeDialog: '主动关闭对话框。',
    debugKind: '标记这个暴露值来自按钮组件，方便排查问题。',
    dialogContentRef: '获取对话框内容区域引用。',
    doLayout: '让表格重新计算列宽和布局。',
    focus: '让内部可聚焦元素获得焦点。',
    getSelectionRows: '获取表格当前选中的行数据。',
    handleClearClick: '手动触发选择器的清空动作。',
    handleClose: '按组件内部规则执行关闭对话框。',
    input: '获取内部输入框元素。',
    isComposing: '读取当前是否处在中文等组合输入中。',
    myMethod: '调用组件内置示例方法。',
    myValue: '读取组件内置示例值。',
    open: '主动打开组件。',
    resetPosition: '重置对话框拖拽后的位置。',
    resizeTextarea: '重新计算多行输入框高度。',
    scrollTo: '滚动到指定位置或指定节点。',
    select: '选中内部输入框里的文字。',
    selectedLabel: '读取当前选中项显示出来的文字。',
    setCurrentRow: '设置表格当前高亮行。',
    setScrollLeft: '设置表格横向滚动位置。',
    setScrollTop: '设置表格纵向滚动位置。',
    shouldAddSpace: '返回当前按钮文字是否需要自动加空格。',
    sort: '按指定列触发表格排序。',
    textarea: '获取内部多行输入框元素。',
    textareaStyle: '读取内部多行输入框计算后的样式。',
    toggle: '在打开和关闭之间切换。',
    toggleAllSelection: '切换表格全选状态。',
    toggleFullscreen: '切换对话框全屏状态。',
    toggleMenu: '打开或关闭选择器下拉面板。',
    toggleRowExpansion: '切换指定行的展开状态。',
    toggleRowSelection: '切换指定行的选中状态。',
    visible: '读取组件当前是否显示。'
  },
  props: {
    alignCenter: '是否让对话框在可视区域中间显示。',
    appendTo: '指定弹层要挂载到哪个页面节点。',
    appendToBody: '是否把弹层直接挂到页面主体下。',
    ariaLabel: '设置无障碍名称，方便读屏软件识别。',
    ariaLevel: '设置无障碍标题层级。',
    arrowControl: '是否用箭头按钮切换时间。',
    autocomplete: '设置浏览器自动填充方式。',
    autofocus: '是否在页面加载后自动获得焦点。',
    automaticDropdown: '聚焦后是否自动打开选择面板。',
    autosize: '多行输入时是否自动撑开高度，也可以传入配置。',
    backgroundColor: '设置背景颜色。',
    beforeClose: '关闭前的拦截函数，可用来阻止关闭。',
    bodyClass: '给对话框内容区追加样式类。',
    bodyHeight: '设置对话框内容区高度。',
    cancelDisabled: '是否禁用底部取消按钮。',
    cancelText: '设置底部取消按钮文字。',
    cellClassName: '给日期单元格追加样式类。',
    center: '是否让头部和底部内容居中。',
    clearable: '是否显示清空按钮。',
    clearIcon: '设置清空按钮图标。',
    closeDelay: '设置延迟关闭的时间。',
    closeIcon: '设置关闭按钮图标。',
    closeOnClickModal: '点击遮罩层时是否关闭。',
    closeOnPressEscape: '按下退出键时是否关闭。',
    color: '设置主要颜色。',
    confirmDisabled: '是否禁用底部确认按钮。',
    confirmText: '设置底部确认按钮文字。',
    containerRole: '设置外层容器的无障碍角色。',
    dark: '是否使用深色背景下的按钮样式。',
    dateFormat: '设置日期在面板里的显示格式。',
    defaultTime: '选择日期时默认带上的时间。',
    defaultValue: '面板打开时默认定位到的日期。',
    destroyOnClose: '关闭后是否销毁内部内容。',
    disabled: '是否禁用组件。',
    disabledDate: '禁用哪些日期的判断函数。',
    disabledHours: '禁用哪些小时的判断函数。',
    disabledMinutes: '禁用哪些分钟的判断函数。',
    disabledSeconds: '禁用哪些秒的判断函数。',
    draggable: '是否允许拖拽移动对话框。',
    editable: '是否允许直接在输入框里编辑。',
    emptyValues: '指定哪些值按空值处理。',
    endPlaceholder: '设置范围结束输入框的占位提示。',
    fallbackPlacements: '弹层放不下时可尝试的备用位置。',
    footerClass: '给对话框底部追加样式类。',
    form: '指定输入框所属表单。',
    format: '设置显示出来的格式。',
    formatter: '显示前把值格式化成想看的样子。',
    fullscreen: '是否让对话框全屏显示。',
    headerAriaLevel: '设置头部标题的无障碍层级。',
    headerClass: '给对话框头部追加样式类。',
    height: '设置高度。',
    icon: '设置图标。',
    id: '设置组件或内部输入框的编号。',
    inputmode: '提示移动端使用哪种键盘。',
    inputStyle: '给内部输入框追加行内样式。',
    isError: '是否显示错误状态。',
    isRange: '当前是否是范围选择。',
    isTable: '是否按表格单元格场景显示。',
    lockScroll: '打开后是否锁住页面滚动。',
    margin: '设置四周留白。',
    marginBottom: '设置底部留白。',
    marginLeft: '设置左侧留白。',
    marginRight: '设置右侧留白。',
    marginTop: '设置顶部留白。',
    maxlength: '限制最多可输入多少个字符。',
    minlength: '限制最少需要输入多少个字符。',
    modal: '是否显示遮罩层。',
    modalClass: '给遮罩层追加样式类。',
    modalPenetrable: '遮罩层是否允许鼠标事件穿透。',
    modelModifiers: '接收双向绑定修饰符。',
    modelValue: '设置双向绑定的值。',
    name: '设置表单字段名。',
    openDelay: '设置延迟打开的时间。',
    overflow: '内容超出时是否允许对话框继续拖动。',
    parser: '输入后把显示内容转换成真实值。',
    placeholder: '设置输入为空时的提示文字。',
    placement: '设置弹层出现的位置。',
    popperClass: '给弹层追加样式类。',
    popperOptions: '设置弹层的高级参数。',
    popperStyle: '给弹层追加行内样式。',
    precision: '设置数字保留几位小数。',
    prefixIcon: '设置前缀图标。',
    rangeSeparator: '设置范围起止之间的分隔文字。',
    readonly: '是否只读。',
    resize: '设置多行输入框是否允许拖拽改变大小。',
    rows: '设置多行输入框默认行数。',
    saveOnBlur: '失去焦点时是否保存当前输入。',
    shortcuts: '设置日期选择面板里的快捷选项。',
    showClose: '是否显示关闭按钮。',
    showConfirm: '是否显示确认按钮。',
    showFooter: '是否显示底部操作区。',
    showNow: '是否显示“此刻”快捷按钮。',
    showPassword: '是否显示密码可见切换按钮。',
    showWeekNumber: '是否显示周序号。',
    showWordLimit: '是否显示字数统计。',
    size: '设置组件尺寸。',
    startPlaceholder: '设置范围开始输入框的占位提示。',
    suffixIcon: '设置后缀图标。',
    tabindex: '设置键盘切换焦点的顺序。',
    timeFormat: '设置时间在面板里的显示格式。',
    title: '设置标题文字。',
    top: '设置对话框距离顶部的位置。',
    transition: '设置打开和关闭时使用的动画名。',
    trapFocus: '是否把键盘焦点限制在对话框内部。',
    type: '设置组件类型，具体取值看类型列。',
    unlinkPanels: '范围选择时，左右面板是否各自切换月份。',
    validateEvent: '值变化时是否触发表单校验。',
    value: '设置组件要展示或生成的内容。',
    valueFormat: '设置绑定值输出时的格式。',
    valueOnClear: '设置清空后写回的值。',
    width: '设置宽度。',
    wordLimitPosition: '设置字数统计显示位置。',
    zIndex: '设置弹层层级。'
  },
  slots: {
    append: '自定义输入框后置内容。',
    center: '自定义中心按钮内容。',
    default: '自定义默认内容。',
    footer: '自定义底部内容。',
    header: '自定义头部内容。',
    icon: '自定义图标内容。',
    label: '自定义显示文字内容。',
    loading: '自定义加载中图标。',
    'password-icon': '自定义密码可见切换图标。',
    prefix: '自定义输入框前缀内容。',
    prepend: '自定义输入框前置内容。',
    suffix: '自定义输入框后缀内容。',
    title: '自定义标题内容。'
  }
}

const customDescriptionOverrides = {
  'fl-loading': {
    component: { '': '点阵加载动画，可独立使用或通过 useFlLoading 接入原生 v-loading。' },
    props: {
      active: '是否显示；隐藏时保留占位并停止动画。',
      animation: '选择六种点阵动画或带大陆轮廓的 earth 地球。',
      size: '画布边长（px），每档尺寸有独立的点数与点径。',
      color: '点颜色，支持 CSS 颜色和变量；优先于自动主题颜色。',
      theme: '背景主题，auto 跟随最近主题标记或系统设置。',
      speed: '速度倍率，限制在 0.25–3；暂停请使用 paused。',
      paused: '冻结当前动画时间，恢复后连续播放。',
      text: '显示在动画旁边或下方的状态文字。',
      layout: 'inline 为同行，vertical 为上下排列。'
    },
    slots: { text: '自定义状态文字；使用 span 等行内容。' }
  },
  'fl-text-shimmer': {
    component: { '': '文字扫光组件，在字形内部循环显示从左到右的高亮。' },
    props: {
      as: '根元素标签，可选 span、p 或 div。',
      color: '普通文字颜色；不设置时继承父级文字颜色。',
      disabled: '是否关闭扫光并显示静态文字。',
      duration: '一次完整扫过所用秒数，必须是有限正数。',
      shimmerColor: '扫光高亮颜色；不设置时跟随当前文字颜色。',
      spread: '高亮从中心向两侧淡化的距离系数，必须是有限正数。',
      text: '没有默认插槽时显示的纯文本。'
    },
    slots: { default: '纯文本内容；存在时优先于 text 属性。' }
  },
  'fl-barcode': {
    component: {
      '': '一维码组件，用来把业务编号、商品码等内容生成条码。'
    },
    props: {
      color: '设置条码线条和文字颜色。',
      displayValue: '是否把文字显示在条码下方。',
      font: '设置条码文字使用的字体。',
      fontOptions: '设置条码文字是否加粗或倾斜。',
      fontSize: '设置条码文字大小。',
      format: '设置一维码编码格式。',
      text: '设置条码下方显示的文字，不填就显示编码内容。',
      textAlign: '设置条码文字的水平对齐方式。',
      textMargin: '设置条码和文字之间的距离。',
      textPosition: '设置文字显示在条码上方还是下方。',
      value: '设置要生成条码的内容。',
      width: '设置单条条码线的宽度。'
    }
  },
  'fl-button': {
    component: {
      '': '按钮组件，用来触发页面操作，支持加载、禁用、图标和调试点击。'
    },
    props: {
      autoInsertSpace: '是否自动在两个中文字符之间加空格。',
      bg: '文字按钮是否带背景色。',
      circle: '是否显示成圆形按钮。',
      dashed: '是否显示虚线边框。',
      debugLabel: '调试事件标签，开启调试模式后会一起抛出。',
      debugMode: '是否开启调试点击事件，开启后每次点击都会额外通知外部。',
      link: '是否显示成链接按钮样式。',
      loading: '是否显示加载中状态。',
      loadingIcon: '设置加载中图标。',
      nativeType: '设置原生按钮提交类型。',
      plain: '是否使用朴素按钮样式。',
      round: '是否显示成圆角按钮。',
      tag: '设置按钮渲染成哪个标签。',
      text: '是否显示成文字按钮。',
      type: '设置按钮的视觉类型。'
    },
    events: {
      click: '点击按钮时触发。',
      'debug-click': '开启调试模式后，按钮点击时额外触发。'
    },
    slots: {
      default: '自定义按钮文字或内容。',
      icon: '自定义按钮左侧图标。',
      loading: '自定义加载中图标。'
    }
  },
  'fl-date-picker': {
    component: {
      '': '日期选择组件，用来选择日期、时间或日期范围，并支持错误态和表格内显示。'
    },
    props: {
      type: '设置选择类型，比如日期、日期时间或日期范围。'
    }
  },
  'fl-dialog': {
    component: {
      '': '对话框组件，用来展示弹窗内容，并内置标题、底部按钮、全屏和关闭控制。'
    },
    props: {
      modelValue: '通过双向绑定控制对话框是否显示。'
    },
    events: {
      cancel: '点击内置取消按钮时触发。',
      close: '对话框开始关闭时触发。',
      closed: '对话框关闭动画结束后触发。',
      closeAutoFocus: '对话框关闭后焦点回到触发位置时触发。',
      confirm: '点击内置确认按钮时触发。',
      open: '对话框开始打开时触发。',
      opened: '对话框打开动画结束后触发。',
      openAutoFocus: '对话框打开后焦点进入弹窗时触发。',
      'update:modelValue': '请求外部同步对话框显示状态。'
    },
    slots: {
      default: '自定义对话框主体内容。',
      footer: '自定义对话框底部操作区。',
      header: '自定义对话框头部区域。',
      title: '自定义对话框标题内容。'
    }
  },
  'fl-input': {
    component: {
      '': '文本输入组件，用来输入普通文字，支持清空、图标、错误态、表格内显示和调试事件。'
    },
    props: {
      debugLabel: '调试事件标签，开启调试模式后会一起抛出。',
      debugMode: '是否开启调试输入事件，开启后输入时会额外通知外部。',
      modelValue: '输入框当前绑定的值。',
      type: '设置输入框类型，比如文本、密码或多行文本。'
    },
    events: {
      'custom-input': '输入值变化时触发，会带上当前值和字符长度。',
      'debug-event': '开启调试模式后，在自定义输入事件之后触发。'
    }
  },
  'fl-tree-select': {
    component: {
      '': '树选择器组件，用于从层级数据中选择值，支持错误态和表格内样式。'
    }
  },
  'fl-input-search': {
    component: {
      '': '业务搜索输入框，用来输入关键词、回车检索并把唯一结果回填。'
    },
    props: {
      clearOnBlurUnconfirmed: '失去焦点时，如果输入还没有确认，是否自动清空。',
      fetchApi: '回车检索时调用的查询方法。',
      label: '输入框里显示给用户看的业务名称。',
      mapResult: '把外部查询结果整理成组件需要的值和显示文字。',
      modelValue: '真实绑定值，通常是业务数据的唯一标识。'
    },
    events: {
      clear: '清空值时触发，会说明为什么被清空。',
      openDialog: '需要外部打开选择弹窗时触发。',
      'search-error': '回车检索失败时触发。',
      'selection-commit': '回车检索到唯一结果并完成回填时触发。',
      'update:label': '请求外部同步显示文字。',
      'update:modelValue': '请求外部同步真实绑定值。'
    },
    exposes: {
      blur: '让内部输入框失去焦点。',
      clear: '清空当前真实值和显示文字。',
      focus: '让内部输入框获得焦点。'
    }
  },
  'fl-input-number': {
    component: {
      '': '数字输入组件，用来输入数字并按精度规则处理，同时支持格式化和错误态。'
    },
    props: {
      isFormat: '失去焦点后是否把数字格式化成展示文案。',
      modelValue: '当前绑定的数字值，只会输出数字或空值。',
      precisionMode: '设置小数位超限时是四舍五入、截断还是报错。',
      strictErrorPlaceholder: '严格模式下精度不对时显示的占位提示。',
      type: '设置输入框类型，一般保持为文本输入。'
    },
    events: {
      'custom-input': '输入值变化时触发，会带上原始内容和处理后的数字。',
      'strict-error': '严格模式下，小数位数超出限制时触发。',
      'update:isError': '请求外部同步内部错误状态。'
    }
  },
  'fl-qr-code': {
    component: {
      '': '二维码组件，用来把字符串生成二维码，支持颜色、尺寸和中间图标。'
    },
    props: {
      color: '设置二维码深色块颜色。',
      errorCorrectionLevel: '设置二维码容错等级，等级越高越不怕遮挡但图形越密。',
      iconBackgroundColor: '设置中间图标底板背景色。',
      iconBorderRadius: '设置中间图标底板圆角，单位是像素。',
      iconSize: '设置中间图标尺寸，单位是像素。',
      iconSrc: '设置中间图标地址。',
      padding: '设置二维码内容和外边缘之间的留白，单位是像素。',
      size: '设置二维码整体显示尺寸，单位是像素。',
      type: '设置二维码渲染方式，支持画布和矢量图。',
      value: '设置要写进二维码里的内容。'
    }
  },
  'fl-radial-menu': {
    component: {
      '': '径向菜单组件，用来围绕中心按钮展开一组操作，也支持更多菜单和快捷键。'
    },
    props: {
      centerIcon: '设置中心按钮图标。',
      centerLabel: '设置中心按钮的辅助说明文字。',
      closeOnSelect: '选择菜单项后是否自动关闭菜单。',
      items: '设置菜单项列表。',
      itemType: '设置菜单项按钮的视觉类型。',
      maxRingItems: '最多有多少个菜单项直接显示在圆环上。',
      mode: '设置菜单使用普通布局还是悬浮布局。',
      modelValue: '控制菜单当前是否打开。',
      moreDropdownPlacement: '设置更多菜单弹出位置。',
      moreMode: '设置超出项如何显示成更多入口。',
      moreText: '设置更多入口的文字。',
      shortcut: '设置打开或关闭菜单的快捷键。',
      shortcutEnabled: '是否启用快捷键。',
      teleport: '是否把菜单弹层挂到页面其他位置。',
      trigger: '设置点击或悬停触发菜单。'
    },
    events: {
      'active-change': '当前高亮菜单项变化时触发。',
      close: '菜单关闭时触发。',
      'more-close': '更多菜单关闭时触发。',
      'more-open': '更多菜单打开时触发。',
      open: '菜单打开时触发。',
      select: '选择某个菜单项时触发。',
      'update:modelValue': '请求外部同步菜单打开状态。'
    },
    slots: {
      center: '自定义中心按钮内容。',
      default: '通过子菜单项组件自定义菜单项。'
    },
    exposes: {
      close: '主动关闭菜单。',
      focus: '让中心按钮获得焦点。',
      open: '主动打开菜单。',
      toggle: '在打开和关闭之间切换菜单。'
    }
  },
  'fl-radial-menu-item': {
    component: {
      '': '径向菜单项组件，只放在径向菜单里，用来声明一个具体操作。'
    },
    props: {
      closeOnSelect: '选中这个菜单项后是否关闭整个菜单。',
      divided: '是否在更多菜单里显示分隔线。',
      hidden: '是否隐藏这个菜单项。',
      index: '菜单项的唯一标识。',
      label: '菜单项显示出来的文字。',
      meta: '随菜单项一起携带的业务数据。',
      shortcut: '菜单项显示的快捷键提示。'
    },
    slots: {
      icon: '自定义菜单项图标。',
      label: '自定义菜单项文字。'
    }
  },
  'fl-select': {
    component: {
      '': '选择器组件，用来从下拉选项中选择值，并支持错误态和表格内显示。'
    }
  },
  'fl-tree': {
    component: {
      '': '树组件，用来展示层级数据，并支持展开、选择、勾选、异步加载、拖拽和键盘操作。'
    },
    props: {
      allowDrag: '判断节点能不能被拖拽，返回否定结果就不能拖。',
      allowDrop: '判断节点能不能放到目标位置，返回否定结果就不能放。',
      accordion: '是否启用手风琴展开模式，开启后同一父节点下最多只展开一个同级节点。',
      autoExpandParent: '受控展开时，是否自动展开这些节点的父级。',
      checkable: '是否显示节点复选框。',
      checkedKeys: '受控勾选的节点键值列表，严格模式下也可传完整勾选状态。',
      checkStrictly: '是否启用严格勾选模式，开启后父子节点勾选状态相互独立。',
      classNames: '给树的不同位置追加样式类，支持对象或函数。',
      data: '树形数据源，每个节点都要有唯一键值。',
      defaultCheckedKeys: '非受控模式下，默认勾选哪些节点。',
      defaultExpandAll: '是否在初始化时展开所有可展开节点。',
      defaultExpandedKeys: '非受控模式下，默认展开哪些节点。',
      defaultExpandParent: '初始化默认展开时，是否自动展开默认展开节点的祖先节点。',
      defaultSelectedKeys: '非受控模式下，默认选中哪些节点。',
      disabledCheckboxKeys: '哪些节点的复选框不可点，但复选框仍然显示。',
      disabledKeys: '哪些节点整体禁用，禁用后不能选择或勾选。',
      draggable: '是否开启单树内部节点拖拽排序。',
      expandedKeys: '受控展开的节点键值列表。',
      filterTreeNode: '判断节点是否命中过滤条件，命中后会高亮。',
      hiddenCheckboxKeys: '哪些节点隐藏复选框，但不影响子节点勾选。',
      loadData: '异步加载函数，展开未加载的非叶子节点时调用。',
      loadedKeys: '受控记录哪些节点已经完成异步加载。',
      multiple: '是否允许同时选中多个节点。',
      nodeClassName: '给单个节点外层追加样式类。',
      props: '树节点字段映射配置，用来指定标题、子节点和叶子节点字段。',
      selectable: '是否允许节点进入选中链路。',
      selectedKeys: '受控选中的节点键值列表。',
      showLine: '是否显示树节点连线；对象形式可配置是否显示叶子节点图标。',
      styles: '给树的不同位置追加行内样式，支持对象或函数。',
      switcherIcon: '设置展开按钮的图标样式。',
      switcherLoadingIcon: '异步加载中的展开器图标组件。',
      unselectableKeys: '哪些节点不可选中，但仍可展开、勾选或触发其他操作。'
    },
    events: {
      check: '节点复选框勾选状态变化后触发，会带上最新勾选结果和详情。',
      dblclick: '双击节点内容区时触发。',
      expand: '节点展开状态切换后触发，会带上最新展开结果。',
      load: '节点异步加载完成后触发。',
      'node-click': '点击节点内容区时触发。',
      'node-collapse': '节点被收起时触发。',
      'node-drag-end': '节点拖拽结束时触发。',
      'node-drag-enter': '拖拽进入某个节点投放区域时触发。',
      'node-drag-leave': '拖拽离开某个节点投放区域时触发。',
      'node-drag-over': '拖拽悬停在某个节点投放区域时触发。',
      'node-drag-start': '节点开始拖拽时触发。',
      'node-drop': '节点成功投放时触发。',
      'node-expand': '节点被展开时触发。',
      'right-click': '节点内容区被右键点击时触发，不会触发选择、勾选或展开链路。',
      select: '节点选中状态变化后触发。',
      'update:checkedKeys': '请求外部同步当前勾选的节点。',
      'update:expandedKeys': '请求外部同步当前展开的节点。',
      'update:loadedKeys': '请求外部同步当前已加载完成的节点。',
      'update:selectedKeys': '请求外部同步当前选中的节点。'
    },
    exposes: {
      scrollTo: '滚动定位到当前已经渲染且可见的节点。'
    },
    slots: {
      default: '自定义节点内容区，只替换展开按钮和复选框右侧的内容。'
    }
  },
  'fl-table': {
    component: {
      '': '表格组件，用来展示列表数据，并支持选择增强、单元格变更监听、行拖拽和列拖拽。'
    },
    props: {
      data: '表格数据源。',
      selectionRowClick: '存在选择列时，是否支持点击行联动选中。',
      selectionSingle: '多选模式下是否限制为仅能选中一行。',
      enableCellProxyIntercept: '是否开启单元格数据写入监听。',
      isEdit: '是否开启可编辑单元格模式。',
      crossHighlight: '点击单元格时，是否高亮同一行和同一列。',
      cellProxyMaxDepth: '单元格数据写入监听的最大层级。',
      rowDraggable: '是否开启行拖拽。',
      columnDraggable: '是否开启列拖拽。',
      rowDragHandleColumnIndex: '行拖拽控制柄所在列索引。',
      rowKeyField: '事件回调中用于标识行主键的字段名。'
    },
    events: {
      'selection-row-toggle': '点击行或选择变化导致选中状态切换时触发。',
      'selection-single-conflict': '单选约束与原生多选行为冲突时触发。',
      'cell-change': '检测到单元格字段被改写时触发。',
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

const englishSharedDescriptionOverrides = {
  events: {
    blur: 'Emitted when the input loses focus.',
    change: 'Emitted when the confirmed bound value changes.',
    clear: 'Emitted when the clear button removes the value.',
    click: 'Emitted when the component is clicked.',
    close: 'Emitted when the component closes.',
    closed: 'Emitted after the close transition finishes.',
    closeAutoFocus: 'Emitted when focus returns to the trigger after closing.',
    compositionend: 'Emitted when IME composition ends.',
    compositionstart: 'Emitted when IME composition starts.',
    compositionupdate: 'Emitted when IME composition updates.',
    focus: 'Emitted when the input receives focus.',
    input: 'Emitted while the user is typing.',
    keydown: 'Emitted when a keyboard key is pressed.',
    mouseenter: 'Emitted when the pointer enters the component.',
    mouseleave: 'Emitted when the pointer leaves the component.',
    open: 'Emitted when the component opens.',
    opened: 'Emitted after the open transition finishes.',
    openAutoFocus: 'Emitted when focus enters the component after opening.',
    'update:modelValue': 'Requests external synchronization of the bound value.'
  },
  exposes: {
    blur: 'Blur the inner input.',
    clear: 'Clear the inner input value.',
    clearFilter: 'Clear table filters.',
    clearSelection: 'Clear selected table rows.',
    clearSort: 'Clear table sorting.',
    close: 'Close the component programmatically.',
    closeDialog: 'Close the dialog programmatically.',
    debugKind: 'Marks this exposed value as coming from the button component for debugging.',
    dialogContentRef: 'Returns the dialog content reference.',
    doLayout: 'Recalculate table column widths and layout.',
    focus: 'Focus the inner focusable element.',
    getSelectionRows: 'Return the currently selected table rows.',
    handleClearClick: 'Trigger the select clear action manually.',
    handleClose: 'Close the dialog using the component internal rules.',
    input: 'Return the inner input element.',
    isComposing: 'Read whether the component is currently handling IME composition.',
    myMethod: 'Call the built-in example method.',
    myValue: 'Read the built-in example value.',
    open: 'Open the component programmatically.',
    resetPosition: 'Reset the dialog position after dragging.',
    resizeTextarea: 'Recalculate textarea height.',
    scrollTo: 'Scroll to a position or node.',
    select: 'Select the text inside the inner input.',
    selectedLabel: 'Read the label displayed for the selected option.',
    setCurrentRow: 'Set the current highlighted table row.',
    setScrollLeft: 'Set the horizontal table scroll position.',
    setScrollTop: 'Set the vertical table scroll position.',
    shouldAddSpace: 'Return whether button text should automatically insert spacing.',
    sort: 'Sort the table by the specified column.',
    textarea: 'Return the inner textarea element.',
    textareaStyle: 'Read the computed style for the inner textarea.',
    toggle: 'Toggle between open and closed states.',
    toggleAllSelection: 'Toggle table select-all state.',
    toggleFullscreen: 'Toggle dialog fullscreen state.',
    toggleMenu: 'Open or close the select dropdown panel.',
    toggleRowExpansion: 'Toggle expansion for the specified row.',
    toggleRowSelection: 'Toggle selection for the specified row.',
    visible: 'Read whether the component is currently visible.'
  },
  props: {
    alignCenter: 'Whether to center the dialog in the viewport.',
    appendTo: 'Target page node where the overlay should mount.',
    appendToBody: 'Whether to mount the overlay directly under document body.',
    ariaLabel: 'Accessible name for assistive technologies.',
    ariaLevel: 'Accessible heading level.',
    arrowControl: 'Whether to switch time using arrow buttons.',
    autocomplete: 'Browser autocomplete behavior.',
    autofocus: 'Whether to focus automatically after page load.',
    automaticDropdown: 'Whether to open the option panel on focus.',
    autosize: 'Whether multiline input auto-expands, or an autosize configuration.',
    backgroundColor: 'Background color.',
    beforeClose: 'Interceptor called before closing; return false to prevent closing.',
    bodyClass: 'Additional class for the dialog body.',
    bodyHeight: 'Dialog body height.',
    cancelDisabled: 'Whether the footer cancel button is disabled.',
    cancelText: 'Footer cancel button text.',
    cellClassName: 'Additional class for date cells.',
    center: 'Whether header and footer content are centered.',
    clearable: 'Whether to show the clear button.',
    clearIcon: 'Clear button icon.',
    closeDelay: 'Delay before closing.',
    closeIcon: 'Close button icon.',
    closeOnClickModal: 'Whether clicking the mask closes the overlay.',
    closeOnPressEscape: 'Whether pressing Escape closes the overlay.',
    color: 'Primary color.',
    confirmDisabled: 'Whether the footer confirm button is disabled.',
    confirmText: 'Footer confirm button text.',
    containerRole: 'Accessible role for the wrapper element.',
    dark: 'Whether to use styles for dark backgrounds.',
    dateFormat: 'Date display format inside the panel.',
    defaultTime: 'Default time applied when selecting a date.',
    defaultValue: 'Default date used when the panel opens.',
    destroyOnClose: 'Whether to destroy inner content after closing.',
    disabled: 'Whether the component is disabled.',
    disabledDate: 'Predicate for disabled dates.',
    disabledHours: 'Predicate for disabled hours.',
    disabledMinutes: 'Predicate for disabled minutes.',
    disabledSeconds: 'Predicate for disabled seconds.',
    draggable: 'Whether the dialog can be dragged.',
    editable: 'Whether the input can be edited directly.',
    emptyValues: 'Values treated as empty.',
    endPlaceholder: 'Placeholder for the range end input.',
    fallbackPlacements: 'Fallback placements when the overlay does not fit.',
    footerClass: 'Additional class for the dialog footer.',
    form: 'Associated form name.',
    format: 'Displayed value format.',
    formatter: 'Format the value before display.',
    fullscreen: 'Whether the dialog is fullscreen.',
    headerAriaLevel: 'Accessible heading level for the header.',
    headerClass: 'Additional class for the dialog header.',
    height: 'Height.',
    icon: 'Icon.',
    id: 'ID for the component or inner input.',
    inputmode: 'Hint for which mobile keyboard to use.',
    inputStyle: 'Inline style added to the inner input.',
    isError: 'Whether to show the error state.',
    isRange: 'Whether the current picker is a range picker.',
    isTable: 'Whether to render for a table-cell scenario.',
    lockScroll: 'Whether to lock page scrolling after opening.',
    margin: 'Outer margin.',
    marginBottom: 'Bottom margin.',
    marginLeft: 'Left margin.',
    marginRight: 'Right margin.',
    marginTop: 'Top margin.',
    maxlength: 'Maximum number of characters.',
    minlength: 'Minimum number of characters.',
    modal: 'Whether to show a mask.',
    modalClass: 'Additional class for the mask.',
    modalPenetrable: 'Whether pointer events can pass through the mask.',
    modelModifiers: 'Two-way binding modifiers.',
    modelValue: 'Bound value.',
    name: 'Form field name.',
    openDelay: 'Delay before opening.',
    overflow: 'Whether overflowing content still allows dialog dragging.',
    parser: 'Convert displayed input into the real value.',
    placeholder: 'Placeholder shown when the input is empty.',
    placement: 'Overlay placement.',
    popperClass: 'Additional class for the overlay.',
    popperOptions: 'Advanced overlay options.',
    popperStyle: 'Inline style for the overlay.',
    precision: 'Number of decimal places to keep.',
    prefixIcon: 'Prefix icon.',
    rangeSeparator: 'Separator between range start and end.',
    readonly: 'Whether the input is read-only.',
    resize: 'Whether a textarea can be resized by dragging.',
    rows: 'Default textarea row count.',
    saveOnBlur: 'Whether to save the current input on blur.',
    shortcuts: 'Shortcut options in the date picker panel.',
    showClose: 'Whether to show the close button.',
    showConfirm: 'Whether to show the confirm button.',
    showFooter: 'Whether to show the footer actions.',
    showNow: 'Whether to show the Now shortcut.',
    showPassword: 'Whether to show the password visibility toggle.',
    showWeekNumber: 'Whether to show week numbers.',
    showWordLimit: 'Whether to show the character counter.',
    size: 'Component size.',
    startPlaceholder: 'Placeholder for the range start input.',
    suffixIcon: 'Suffix icon.',
    tabindex: 'Keyboard tab order.',
    timeFormat: 'Time display format inside the panel.',
    title: 'Title text.',
    top: 'Distance from the top of the viewport.',
    transition: 'Transition name used for opening and closing.',
    trapFocus: 'Whether keyboard focus is trapped inside the dialog.',
    type: 'Component type; see the Type column for supported values.',
    unlinkPanels: 'Whether range picker panels switch months independently.',
    validateEvent: 'Whether value changes trigger form validation.',
    value: 'Value displayed or generated by the component.',
    valueFormat: 'Format used for the emitted bound value.',
    valueOnClear: 'Value written back after clearing.',
    width: 'Width.',
    wordLimitPosition: 'Position of the character counter.',
    zIndex: 'Overlay z-index.'
  },
  slots: {
    append: 'Custom input append content.',
    center: 'Custom center button content.',
    default: 'Custom default content.',
    footer: 'Custom footer content.',
    header: 'Custom header content.',
    icon: 'Custom icon content.',
    label: 'Custom label content.',
    loading: 'Custom loading icon.',
    'password-icon': 'Custom password visibility icon.',
    prefix: 'Custom input prefix content.',
    prepend: 'Custom input prepend content.',
    suffix: 'Custom input suffix content.',
    title: 'Custom title content.'
  }
}

const englishCustomDescriptionOverrides = {
  'fl-loading': {
    component: { '': 'Dot animations for standalone use and native v-loading masks.' },
    props: {
      active: 'Show the indicator; inactive indicators retain space and stop drawing.',
      animation: 'Choose one of six dot animations or a land-textured Earth.',
      size: 'Canvas CSS size in pixels, with density tuned for each size.',
      color: 'Dot color; supports CSS variables and overrides automatic theme colors.',
      theme: 'Background theme; auto detects ancestor markers or the system theme.',
      speed: 'Speed multiplier clamped to 0.25–3. Use paused to freeze the animation.',
      paused: 'Freeze animation time and resume continuously.',
      text: 'Visible status text beside or below the animation.',
      layout: 'Inline places text beside the canvas; vertical places it below.'
    },
    slots: { text: 'Custom status text using phrasing content, such as spans.' }
  },
  'fl-text-shimmer': {
    component: { '': 'Animated text highlight that sweeps left to right inside the glyphs.' },
    props: {
      as: 'Root HTML tag: span, p, or div.',
      color: 'Base text color. When omitted, inherits the parent text color.',
      disabled: 'Whether to show readable static text without shimmer animation.',
      duration: 'Seconds for one complete pass; must be a finite positive number.',
      shimmerColor: 'Highlight color. When omitted, follows the current text color.',
      spread: 'Fade-distance multiplier from the highlight center; must be finite and positive.',
      text: 'Plain text displayed when no default slot is provided.'
    },
    slots: { default: 'Plain text content; takes precedence over the text prop.' }
  },
  'fl-barcode': {
    component: {
      '': 'Barcode component that renders business identifiers and product codes.'
    },
    props: {
      color: 'Color for barcode lines and text.',
      displayValue: 'Whether to display text below the barcode.',
      font: 'Font used for barcode text.',
      fontOptions: 'Whether barcode text is bold or italic.',
      fontSize: 'Barcode text size.',
      format: 'Barcode encoding format.',
      text: 'Text displayed below the barcode; defaults to the encoded value.',
      textAlign: 'Horizontal alignment for barcode text.',
      textMargin: 'Spacing between the barcode and text.',
      textPosition: 'Whether text appears above or below the barcode.',
      value: 'Value to encode into a barcode.',
      width: 'Width of a single barcode line.'
    }
  },
  'fl-button': {
    component: {
      '': 'Button component used to trigger page actions, with loading, disabled, icon and debug-click support.'
    },
    props: {
      autoInsertSpace: 'Whether to automatically insert spacing between two Chinese characters.',
      bg: 'Whether text buttons include a background color.',
      circle: 'Whether to render as a circular button.',
      dashed: 'Whether to show a dashed border.',
      debugLabel: 'Debug event label emitted when debug mode is enabled.',
      debugMode: 'Whether to emit an additional debug event on every click.',
      link: 'Whether to render with link-button styling.',
      loading: 'Whether to show loading state.',
      loadingIcon: 'Loading icon.',
      nativeType: 'Native button submit type.',
      plain: 'Whether to use plain button styling.',
      round: 'Whether to render as a rounded button.',
      tag: 'Tag used to render the button.',
      text: 'Whether to render as a text button.',
      type: 'Visual button type.'
    },
    events: {
      click: 'Emitted when the button is clicked.',
      'debug-click': 'Emitted in addition to click when debug mode is enabled.'
    },
    slots: {
      default: 'Custom button text or content.',
      icon: 'Custom icon on the left side of the button.',
      loading: 'Custom loading icon.'
    }
  },
  'fl-date-picker': {
    component: {
      '': 'Date picker component for dates, times and ranges, with error and table-cell states.'
    },
    props: {
      type: 'Picker type, such as date, datetime or date range.'
    }
  },
  'fl-dialog': {
    component: {
      '': 'Dialog component with built-in title, footer buttons, fullscreen and close controls.'
    },
    props: {
      modelValue: 'Controls whether the dialog is visible.'
    },
    events: {
      cancel: 'Emitted when the built-in cancel button is clicked.',
      close: 'Emitted when the dialog starts closing.',
      closed: 'Emitted after the dialog close transition finishes.',
      closeAutoFocus: 'Emitted when focus returns after the dialog closes.',
      confirm: 'Emitted when the built-in confirm button is clicked.',
      open: 'Emitted when the dialog starts opening.',
      opened: 'Emitted after the dialog open transition finishes.',
      openAutoFocus: 'Emitted when focus enters the dialog after opening.',
      'update:modelValue': 'Requests external synchronization of dialog visibility.'
    },
    slots: {
      default: 'Custom dialog body content.',
      footer: 'Custom dialog footer actions.',
      header: 'Custom dialog header area.',
      title: 'Custom dialog title content.'
    }
  },
  'fl-input': {
    component: {
      '': 'Text input component for plain text, with clear, icon, error, table and debug support.'
    },
    props: {
      debugLabel: 'Debug event label emitted when debug mode is enabled.',
      debugMode: 'Whether to emit additional debug events while typing.',
      modelValue: 'Current bound input value.',
      type: 'Input type, such as text, password or textarea.'
    },
    events: {
      'custom-input': 'Emitted when the input value changes, with current value and length.',
      'debug-event': 'Emitted after the custom input event when debug mode is enabled.'
    }
  },
  'fl-input-search': {
    component: {
      '': 'Business search input for keywords, Enter search and single-result backfill.'
    },
    props: {
      clearOnBlurUnconfirmed: 'Whether to clear unconfirmed input on blur.',
      fetchApi: 'Query function called when pressing Enter.',
      label: 'Business label displayed inside the input.',
      mapResult: 'Maps external query results into the value and label required by the component.',
      modelValue: 'Real bound value, usually a unique business identifier.'
    },
    events: {
      clear: 'Emitted when the value is cleared, including the clear reason.',
      openDialog: 'Emitted when external code should open a selection dialog.',
      'search-error': 'Emitted when Enter search fails.',
      'selection-commit': 'Emitted when a single Enter-search result is committed.',
      'update:label': 'Requests external synchronization of the displayed label.',
      'update:modelValue': 'Requests external synchronization of the real bound value.'
    },
    exposes: {
      blur: 'Blur the inner input.',
      clear: 'Clear the current value and display label.',
      focus: 'Focus the inner input.'
    }
  },
  'fl-input-number': {
    component: {
      '': 'Numeric input component with precision handling, formatting and error state support.'
    },
    props: {
      isFormat: 'Whether to format the number after blur.',
      modelValue: 'Current numeric value; emits only numbers or empty values.',
      precisionMode: 'How to handle excess decimal places: round, truncate or error.',
      strictErrorPlaceholder: 'Placeholder shown when strict precision mode fails.',
      type: 'Input type; usually kept as text.'
    },
    events: {
      'custom-input': 'Emitted when the input changes, with raw text and parsed number.',
      'strict-error': 'Emitted when strict mode detects too many decimal places.',
      'update:isError': 'Requests external synchronization of the internal error state.'
    }
  },
  'fl-qr-code': {
    component: {
      '': 'QR code component that renders strings as QR codes with color, size and center icon options.'
    },
    props: {
      color: 'Dark module color for the QR code.',
      errorCorrectionLevel: 'QR error correction level; higher levels tolerate more occlusion.',
      iconBackgroundColor: 'Background color behind the center icon.',
      iconBorderRadius: 'Center icon background corner radius in pixels.',
      iconSize: 'Center icon size in pixels.',
      iconSrc: 'Center icon URL.',
      padding: 'Padding between the QR content and outer edge, in pixels.',
      size: 'Overall QR code display size in pixels.',
      type: 'QR rendering mode: canvas or SVG.',
      value: 'Content encoded into the QR code.'
    }
  },
  'fl-radial-menu': {
    component: {
      '': 'Radial menu component that expands actions around a center button, with overflow and shortcut support.'
    },
    props: {
      centerIcon: 'Center button icon.',
      centerLabel: 'Accessible label for the center button.',
      closeOnSelect: 'Whether selecting an item closes the menu automatically.',
      items: 'Menu item list.',
      itemType: 'Visual type for menu item buttons.',
      maxRingItems: 'Maximum number of items displayed directly on the ring.',
      mode: 'Whether the menu uses inline or floating layout.',
      modelValue: 'Controls whether the menu is open.',
      moreDropdownPlacement: 'Placement of the overflow menu.',
      moreMode: 'How overflow items are exposed through the more entry.',
      moreText: 'Text for the more entry.',
      shortcut: 'Keyboard shortcut used to open or close the menu.',
      shortcutEnabled: 'Whether the keyboard shortcut is enabled.',
      teleport: 'Whether the menu overlay is mounted elsewhere in the page.',
      trigger: 'Whether click or hover opens the menu.'
    },
    events: {
      'active-change': 'Emitted when the active menu item changes.',
      close: 'Emitted when the menu closes.',
      'more-close': 'Emitted when the overflow menu closes.',
      'more-open': 'Emitted when the overflow menu opens.',
      open: 'Emitted when the menu opens.',
      select: 'Emitted when a menu item is selected.',
      'update:modelValue': 'Requests external synchronization of menu open state.'
    },
    slots: {
      center: 'Custom center button content.',
      default: 'Declare custom menu items with child item components.'
    },
    exposes: {
      close: 'Close the menu programmatically.',
      focus: 'Focus the center button.',
      open: 'Open the menu programmatically.',
      toggle: 'Toggle the menu between open and closed.'
    }
  },
  'fl-radial-menu-item': {
    component: {
      '': 'Radial menu item component used inside the radial menu to declare one action.'
    },
    props: {
      closeOnSelect: 'Whether selecting this item closes the whole menu.',
      divided: 'Whether to show a separator in the overflow menu.',
      hidden: 'Whether this menu item is hidden.',
      index: 'Unique menu item identifier.',
      label: 'Displayed menu item label.',
      meta: 'Business data carried with the menu item.',
      shortcut: 'Shortcut hint displayed for the menu item.'
    },
    slots: {
      icon: 'Custom menu item icon.',
      label: 'Custom menu item label.'
    }
  },
  'fl-select': {
    component: {
      '': 'Select component for choosing from dropdown options, with error and table-cell states.'
    }
  },
  'fl-tree': {
    component: {
      '': 'Tree component for hierarchical data with expansion, selection, checking, async loading, drag and keyboard support.'
    },
    props: {
      allowDrag: 'Predicate that decides whether a node can be dragged.',
      allowDrop: 'Predicate that decides whether a node can be dropped at the target position.',
      accordion: 'Whether only one sibling branch can stay expanded under the same parent.',
      autoExpandParent: 'Whether controlled expansion automatically expands parent nodes.',
      checkable: 'Whether to show node checkboxes.',
      checkedKeys: 'Controlled checked node keys; strict mode also accepts a full checked state.',
      checkStrictly: 'Whether parent and child checked states are independent.',
      classNames: 'Extra classes for tree parts, as an object or function.',
      data: 'Tree data source; every node needs a unique key.',
      defaultCheckedKeys: 'Initially checked keys in uncontrolled mode.',
      defaultExpandAll: 'Whether to expand all expandable nodes initially.',
      defaultExpandedKeys: 'Initially expanded keys in uncontrolled mode.',
      defaultExpandParent: 'Whether default expanded nodes also expand their ancestors.',
      defaultSelectedKeys: 'Initially selected keys in uncontrolled mode.',
      disabledCheckboxKeys: 'Keys whose checkboxes are disabled but still visible.',
      disabledKeys: 'Keys whose nodes are fully disabled.',
      draggable: 'Whether to enable internal node drag sorting.',
      expandedKeys: 'Controlled expanded node keys.',
      filterTreeNode: 'Predicate for highlighted filter matches.',
      hiddenCheckboxKeys: 'Keys whose checkboxes are hidden without affecting child checking.',
      loadData: 'Async loader called when expanding an unloaded non-leaf node.',
      loadedKeys: 'Controlled record of loaded node keys.',
      multiple: 'Whether multiple nodes can be selected.',
      nodeClassName: 'Extra class for individual node wrappers.',
      props: 'Field mapping for node title, children and leaf flags.',
      selectable: 'Whether nodes can enter the selection flow.',
      selectedKeys: 'Controlled selected node keys.',
      showLine: 'Whether to show connector lines; object form can control leaf icons.',
      styles: 'Inline styles for tree parts, as an object or function.',
      switcherIcon: 'Icon style for the expand toggle.',
      switcherLoadingIcon: 'Icon component for async loading toggles.',
      unselectableKeys:
        'Keys that cannot be selected but can still expand, check or emit other events.'
    },
    events: {
      check: 'Emitted after node checkbox state changes, with latest checked result and details.',
      dblclick: 'Emitted when the node content area is double-clicked.',
      expand: 'Emitted after node expansion changes, with the latest expanded result.',
      load: 'Emitted after async node loading completes.',
      'node-click': 'Emitted when the node content area is clicked.',
      'node-collapse': 'Emitted when a node collapses.',
      'node-drag-end': 'Emitted when node dragging ends.',
      'node-drag-enter': 'Emitted when dragging enters a node drop area.',
      'node-drag-leave': 'Emitted when dragging leaves a node drop area.',
      'node-drag-over': 'Emitted while dragging over a node drop area.',
      'node-drag-start': 'Emitted when node dragging starts.',
      'node-drop': 'Emitted after a node is dropped successfully.',
      'node-expand': 'Emitted when a node expands.',
      'right-click': 'Emitted when the node content area is right-clicked.',
      select: 'Emitted after node selection state changes.',
      'update:checkedKeys': 'Requests external synchronization of checked nodes.',
      'update:expandedKeys': 'Requests external synchronization of expanded nodes.',
      'update:loadedKeys': 'Requests external synchronization of loaded nodes.',
      'update:selectedKeys': 'Requests external synchronization of selected nodes.'
    },
    exposes: {
      scrollTo: 'Scroll to the currently rendered and visible node.'
    },
    slots: {
      default: 'Custom node content; replaces only the area to the right of toggle and checkbox.'
    }
  },
  'fl-table': {
    component: {
      '': 'Table component for list data with selection enhancements, cell change tracking, row dragging and column dragging.'
    },
    props: {
      data: 'Table data source.',
      selectionRowClick: 'Whether clicking a row toggles selection when a selection column exists.',
      selectionSingle: 'Whether multi-select mode is limited to one selected row.',
      enableCellProxyIntercept: 'Whether cell data write interception is enabled.',
      isEdit: 'Whether editable-cell mode is enabled.',
      crossHighlight: 'Whether clicking a cell highlights the row and column.',
      cellProxyMaxDepth: 'Maximum depth for cell data write tracking.',
      rowDraggable: 'Whether row dragging is enabled.',
      columnDraggable: 'Whether column dragging is enabled.',
      rowDragHandleColumnIndex: 'Column index containing the row drag handle.',
      rowKeyField: 'Field used as the row key in event callbacks.'
    },
    events: {
      'selection-row-toggle': 'Emitted when row click or selection changes toggle selected state.',
      'selection-single-conflict':
        'Emitted when single-select constraints conflict with native multi-select behavior.',
      'cell-change': 'Emitted when a cell field write is detected.',
      'row-drag-start': 'Emitted when row dragging starts.',
      'row-drag-end': 'Emitted when row dragging ends.',
      'row-order-change': 'Emitted when row order changes.',
      'column-drag-start': 'Emitted when column dragging starts.',
      'column-drag-end': 'Emitted when column dragging ends.',
      'column-order-change': 'Emitted when column order changes.'
    },
    slots: {
      default: 'Table column content slot.',
      append: 'Additional table footer content slot.',
      empty: 'Empty-state content slot.'
    }
  }
}

const englishDefaultValueOverrides = {
  "'取消'": "'Cancel'",
  "'确认'": "'Confirm'",
  "'精度不对'": "'Invalid precision'"
}

const localeConfigs = {
  zh: {
    customOverrides: customDescriptionOverrides,
    outputDir: rootOutputDir,
    sharedOverrides: sharedDescriptionOverrides
  },
  en: {
    customOverrides: englishCustomDescriptionOverrides,
    outputDir: englishOutputDir,
    sharedOverrides: englishSharedDescriptionOverrides
  }
}

const resolveDescription = (componentId, section, name, description, locale) => {
  const localeConfig = localeConfigs[locale]
  const customOverride = localeConfig.customOverrides[componentId]?.[section]?.[name]
  if (customOverride) {
    return normalizeText(customOverride)
  }

  const sharedOverride = localeConfig.sharedOverrides[section]?.[name]
  if (sharedOverride) {
    return normalizeText(sharedOverride)
  }

  const normalizedDescription = normalizeText(description)
  if (locale === 'zh' && hasChineseText(normalizedDescription)) {
    return normalizedDescription
  }
  if (locale === 'en' && normalizedDescription && !hasChineseText(normalizedDescription)) {
    return normalizedDescription
  }
  return ''
}

const resolveDefaultValue = (value, locale) => {
  const normalizedValue = value ?? '-'
  if (locale !== 'en') {
    return normalizedValue
  }

  if (englishDefaultValueOverrides[normalizedValue]) {
    return englishDefaultValueOverrides[normalizedValue]
  }

  return hasChineseText(normalizedValue) ? '-' : normalizedValue
}

const toApiMeta = (componentId, meta, locale) => ({
  component: meta.name || componentId,
  description: resolveDescription(componentId, 'component', '', meta.description, locale),
  events: meta.events
    .map((item) => ({
      description: resolveDescription(componentId, 'events', item.name, item.description, locale),
      name: item.name,
      signature: item.signature,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  exposes: meta.exposed
    .map((item) => ({
      description: resolveDescription(componentId, 'exposes', item.name, item.description, locale),
      name: item.name,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  props: meta.props
    .filter((item) => !item.global)
    .map((item) => ({
      default: resolveDefaultValue(item.default, locale),
      description: resolveDescription(componentId, 'props', item.name, item.description, locale),
      name: item.name,
      required: item.required,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  slots: meta.slots
    .map((item) => ({
      description: resolveDescription(componentId, 'slots', item.name, item.description, locale),
      name: item.name,
      type: item.type
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const generate = () => {
  const checker = createChecker(tsconfigPath, {
    forceUseTs: true
  })

  for (const { outputDir } of Object.values(localeConfigs)) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
  }

  for (const target of targets) {
    const meta = checker.getComponentMeta(target.filePath)
    for (const [locale, { outputDir }] of Object.entries(localeConfigs)) {
      const output = toApiMeta(target.id, meta, locale)
      const outputPath = path.resolve(outputDir, `${target.id}.json`)
      fs.writeFileSync(
        outputPath,
        toProjectLineEndings(`${JSON.stringify(output, null, 2)}\n`),
        'utf8'
      )
      process.stdout.write(`[docs:api:${locale}] generated ${path.relative(rootDir, outputPath)}\n`)
    }
  }
}

generate()
