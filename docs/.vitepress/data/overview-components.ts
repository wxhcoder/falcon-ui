export type OverviewGroupKey = 'interaction' | 'form' | 'feedback'

export interface OverviewGroup {
  key: OverviewGroupKey
  title: string
}

export interface OverviewItem {
  name: string
  title: string
  group: OverviewGroupKey
  link: string
  description: string
  icon: string
  version?: string
}

export const overviewComponentGroups: readonly OverviewGroup[] = [
  { key: 'interaction', title: '基础交互' },
  { key: 'form', title: '表单输入' },
  { key: 'feedback', title: '反馈浮层' }
]

export const overviewComponents: readonly OverviewItem[] = [
  {
    name: 'FlButton',
    title: 'Button',
    group: 'interaction',
    link: '/components/button',
    description: '基础按钮组件，支持常见类型和禁用状态。',
    icon: '/overview/fl-button.svg'
  },
  {
    name: 'FlInput',
    title: 'Input',
    group: 'form',
    link: '/components/input',
    description: '文本输入组件，支持图标、清空和表格内编辑。',
    icon: '/overview/fl-input.svg'
  },
  {
    name: 'FlInputSearch',
    title: 'Input Search',
    group: 'form',
    link: '/components/input-search',
    description: '业务搜索输入组件，支持回车检索与弹窗占位事件。',
    icon: '/overview/fl-input-search.svg'
  },
  {
    name: 'FlSelect',
    title: 'Select',
    group: 'form',
    link: '/components/select',
    description: '选择器组件，支持错误态、表格态与默认可清空。',
    icon: '/overview/fl-select.svg'
  },
  {
    name: 'FlDatePicker',
    title: 'Date Picker',
    group: 'form',
    link: '/components/date-picker',
    description: '日期选择器组件，支持错误态清空与表格单元格场景。',
    icon: '/overview/fl-date-picker.svg'
  },
  {
    name: 'FlInputNumber',
    title: 'Input Number',
    group: 'form',
    link: '/components/input-number',
    description: '数字输入组件，减少单元格切换造成的误触增减。',
    icon: '/overview/fl-input-number.svg'
  },
  {
    name: 'FlDialog',
    title: 'Dialog',
    group: 'feedback',
    link: '/components/dialog',
    description: '对话框组件，支持基础弹层与自定义头部。',
    icon: '/overview/fl-dialog.svg'
  }
]
