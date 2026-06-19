export type OverviewGroupKey = 'interaction' | 'form' | 'feedback'

export interface OverviewGroup {
  key: OverviewGroupKey
  title: string
  titleEn: string
}

export interface OverviewItem {
  name: string
  title: string
  group: OverviewGroupKey
  link: string
  description: string
  descriptionEn: string
  icon: string
  titleEn: string
  version?: string
}

export const overviewComponentGroups: readonly OverviewGroup[] = [
  { key: 'interaction', title: '基础交互', titleEn: 'Interaction' },
  { key: 'form', title: '表单输入', titleEn: 'Form Inputs' },
  { key: 'feedback', title: '反馈浮层', titleEn: 'Feedback' }
]

export const overviewComponents: readonly OverviewItem[] = [
  {
    name: 'FlButton',
    title: 'Button',
    titleEn: 'Button',
    group: 'interaction',
    link: '/components/button',
    description: '基础按钮组件，支持常见类型和禁用状态。',
    descriptionEn: 'Basic button component with common types and disabled state support.',
    icon: '/overview/fl-button.svg'
  },
  {
    name: 'FlQrCode',
    title: 'QR Code',
    titleEn: 'QR Code',
    group: 'interaction',
    link: '/components/qr-code',
    description: '二维码展示组件，支持 canvas 和 SVG 两种渲染模式。',
    descriptionEn: 'QR code display component with canvas and SVG rendering modes.',
    icon: '/overview/fl-qr-code.svg'
  },
  {
    name: 'FlBarcode',
    title: 'Barcode',
    titleEn: 'Barcode',
    group: 'interaction',
    link: '/components/barcode',
    description: '一维码展示组件，支持常见业务格式和文本显示控制。',
    descriptionEn: 'Barcode display component with common formats and text controls.',
    icon: '/overview/fl-barcode.svg'
  },
  {
    name: 'FlTable',
    title: 'Table',
    titleEn: 'Table',
    group: 'interaction',
    link: '/components/table',
    description:
      'Table wrapper with sortable rows/columns, selection enhancement and cell change intercept.',
    descriptionEn:
      'Table wrapper with row/column dragging, selection enhancement and cell change tracking.',
    icon: '/overview/fl-table.svg'
  },
  {
    name: 'FlTree',
    title: 'Tree',
    titleEn: 'Tree',
    group: 'interaction',
    link: '/components/tree',
    description: 'Hierarchical data component with selection, checking, async loading and drag.',
    descriptionEn: 'Tree component with selection, checking, async loading and drag support.',
    icon: '/overview/fl-tree.svg'
  },
  {
    name: 'FlRadialMenu',
    title: 'Radial Menu',
    titleEn: 'Radial Menu',
    group: 'interaction',
    link: '/components/radial-menu',
    description: '径向菜单组件，支持环形操作、更多项和快捷打开。',
    descriptionEn: 'Radial action menu with ring items, overflow actions and shortcut opening.',
    icon: '/overview/fl-radial-menu.svg'
  },
  {
    name: 'FlInput',
    title: 'Input',
    titleEn: 'Input',
    group: 'form',
    link: '/components/input',
    description: '文本输入组件，支持图标、清空和表格内编辑。',
    descriptionEn: 'Text input component with icons, clear action and table-cell editing.',
    icon: '/overview/fl-input.svg'
  },
  {
    name: 'FlInputSearch',
    title: 'Input Search',
    titleEn: 'Input Search',
    group: 'form',
    link: '/components/input-search',
    description: '业务搜索输入组件，支持回车检索与弹窗占位事件。',
    descriptionEn: 'Business search input with Enter search and dialog placeholder events.',
    icon: '/overview/fl-input-search.svg'
  },
  {
    name: 'FlSelect',
    title: 'Select',
    titleEn: 'Select',
    group: 'form',
    link: '/components/select',
    description: '选择器组件，支持错误态、表格态与默认可清空。',
    descriptionEn: 'Select component with error state, table mode and clearable defaults.',
    icon: '/overview/fl-select.svg'
  },
  {
    name: 'FlDatePicker',
    title: 'Date Picker',
    titleEn: 'Date Picker',
    group: 'form',
    link: '/components/date-picker',
    description: '日期选择器组件，支持错误态清空与表格单元格场景。',
    descriptionEn: 'Date picker with error-state clearing and table-cell usage support.',
    icon: '/overview/fl-date-picker.svg'
  },
  {
    name: 'FlInputNumber',
    title: 'Input Number',
    titleEn: 'Input Number',
    group: 'form',
    link: '/components/input-number',
    description: '数字输入组件，减少单元格切换造成的误触增减。',
    descriptionEn: 'Numeric input that avoids accidental stepping during table-cell navigation.',
    icon: '/overview/fl-input-number.svg'
  },
  {
    name: 'FlDialog',
    title: 'Dialog',
    titleEn: 'Dialog',
    group: 'feedback',
    link: '/components/dialog',
    description: '对话框组件，支持基础弹层与自定义头部。',
    descriptionEn: 'Dialog component with base modal behavior and custom header support.',
    icon: '/overview/fl-dialog.svg'
  }
]
