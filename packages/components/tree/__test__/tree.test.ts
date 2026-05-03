import type { VueWrapper } from '@vue/test-utils'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { MinusSquareOutlined, PlusSquareOutlined } from '@falcon-ui/icons'
import { CaretBottom, CaretRight, Folder, FolderOpened } from '@element-plus/icons-vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick, type CSSProperties } from 'vue'
import FlTree, {
  FlTree as FlTreeFromTreePackage,
  type TreeCheckEvent,
  type TreeCheckedKeys,
  type TreeData,
  type TreeEmits,
  type TreeExpandPayload,
  type TreeKey,
  type TreeNode,
  type TreeNodeModel,
  type TreeProps,
  type TreeSemanticDOM,
  type TreeSelectEvent,
  type TreeSwitcherIconMode
} from '@falcon-ui/components/tree'
import { FlTree as FlTreeFromComponents } from '@falcon-ui/components'
import FalconUI, { install as installFalconUI } from '@falcon-ui/falcon-ui'

enableAutoUnmount(afterEach)

/**
 * 阶段 1 到当前事件扩展阶段的测试覆盖基础渲染、导出链路与正式展开状态契约。
 */
describe('FlTree 契约', () => {
  /**
   * 读取项目文件内容，用于验证导出链路和样式接入。
   */
  const readProjectFile = (relativePath: string) =>
    readFileSync(resolve(process.cwd(), relativePath), 'utf8')

  /**
   * 构造一个最小化的应用实例桩，用于验证 withInstall 和插件安装链路。
   */
  const createAppMock = () => {
    const registered: Record<string, unknown> = {}

    const app = {
      _registered: registered,
      component: vi.fn((name: string, component: unknown) => {
        registered[name] = component
        return app
      }),
      use: vi.fn((plugin: unknown) => {
        if (typeof plugin === 'function') {
          plugin(app as never)
        } else if (plugin && typeof plugin === 'object') {
          ;(plugin as { install?: (target: typeof app) => void }).install?.(app as never)
        }

        return app
      })
    }

    return app
  }

  /**
   * 通过标题文本定位树节点条目，便于验证节点级无障碍属性与展开状态。
   */
  const findTreeItemByText = (wrapper: VueWrapper, label: string) => {
    const item = wrapper
      .findAll('.fl-tree__item')
      .find((currentItem) => currentItem.find('.fl-tree__item-title').text() === label)

    if (!item) {
      throw new Error(`Unable to find tree item: ${label}`)
    }

    return item
  }

  /**
   * 读取指定树节点上的内容区。
   */
  const getItemContent = (wrapper: VueWrapper, label: string) =>
    findTreeItemByText(wrapper, label).get('.fl-tree__item-content')

  /**
   * 判断指定树节点是否处于选中态。
   */
  const isItemSelected = (wrapper: VueWrapper, label: string) =>
    getItemContent(wrapper, label).classes().includes('is-selected')

  /**
   * 读取指定树节点上的复选框容器。
   */
  const getItemCheckbox = (wrapper: VueWrapper, label: string) =>
    getItemContent(wrapper, label).get('.fl-tree__item-checkbox')

  /**
   * 判断指定树节点当前是否渲染了复选框。
   */
  const hasItemCheckbox = (wrapper: VueWrapper, label: string) =>
    getItemContent(wrapper, label).find('.fl-tree__item-checkbox').exists()

  /**
   * 判断指定树节点复选框当前是否处于勾选态。
   */
  const isItemChecked = (wrapper: VueWrapper, label: string) =>
    getItemCheckbox(wrapper, label).find('.el-checkbox__input').classes().includes('is-checked')

  /**
   * 判断指定树节点复选框当前是否处于半选态。
   */
  const isItemHalfChecked = (wrapper: VueWrapper, label: string) =>
    getItemCheckbox(wrapper, label)
      .find('.el-checkbox__input')
      .classes()
      .includes('is-indeterminate')

  /**
   * 判断指定树节点复选框当前是否处于禁用态。
   */
  const isItemCheckboxDisabled = (wrapper: VueWrapper, label: string) =>
    getItemCheckbox(wrapper, label).find('.el-checkbox__input').classes().includes('is-disabled')

  /**
   * 读取指定树节点上的 switcher 按钮。
   */
  const getSwitcherButton = (wrapper: VueWrapper, label: string) =>
    findTreeItemByText(wrapper, label).get('.fl-tree__switcher-button')

  /**
   * 提供基础树数据，便于覆盖展开相关测试。
   */
  const createNestedTreeData = () => [
    {
      key: 'root',
      label: 'Root',
      children: [
        {
          key: 'branch',
          label: 'Branch',
          children: [
            {
              key: 'leaf',
              label: 'Leaf'
            }
          ]
        }
      ]
    }
  ]

  /**
   * 提供覆盖祖先轨道、末端连线与最后兄弟节点状态的树数据。
   */
  const createLineTreeData = () => [
    {
      key: 'root-a',
      label: 'Root A',
      children: [
        {
          key: 'branch-a',
          label: 'Branch A',
          children: [
            {
              key: 'leaf-a1',
              label: 'Leaf A1'
            },
            {
              key: 'leaf-a2',
              label: 'Leaf A2'
            }
          ]
        },
        {
          key: 'branch-b',
          label: 'Branch B'
        }
      ]
    },
    {
      key: 'root-b',
      label: 'Root B'
    }
  ]

  /**
   * 提供根节点带叶子节点的最小展开树。
   */
  const createSimpleTreeData = () => [
    {
      key: 'root',
      label: 'Root',
      children: [
        {
          key: 'leaf',
          label: 'Leaf'
        }
      ]
    }
  ]

  /**
   * 提供包含 disabled / selectable=false 边界的树数据。
   */
  const createSelectionBoundaryTreeData = () => [
    {
      key: 'root',
      label: 'Root',
      children: [
        {
          key: 'disabled-node',
          label: 'Disabled Node',
          disabled: true
        },
        {
          key: 'checkbox-disabled-node',
          label: 'Checkbox Disabled Node',
          disableCheckbox: true
        },
        {
          key: 'unselectable-node',
          label: 'Unselectable Node',
          selectable: false
        },
        {
          key: 'legacy-checkable-node',
          label: 'Legacy Checkable False Node',
          checkable: false
        },
        {
          key: 'active-node',
          label: 'Active Node'
        }
      ]
    }
  ]

  /**
   * 提供覆盖父子联动、半选态、禁用边界与 `checkable=false` 透明节点的树数据。
   */
  const createCheckConductTreeData = () => [
    {
      key: 'root',
      label: 'Root',
      children: [
        {
          key: 'branch-a',
          label: 'Branch A',
          children: [
            {
              key: 'leaf-a1',
              label: 'Leaf A1'
            },
            {
              key: 'leaf-a2',
              label: 'Leaf A2'
            }
          ]
        },
        {
          key: 'disabled-branch',
          label: 'Disabled Branch',
          disabled: true,
          children: [
            {
              key: 'disabled-branch-leaf',
              label: 'Disabled Branch Leaf'
            }
          ]
        },
        {
          key: 'checkbox-disabled-node',
          label: 'Checkbox Disabled Node',
          disableCheckbox: true
        },
        {
          key: 'non-checkable-bridge',
          label: 'Non Checkable Bridge',
          checkable: false,
          children: [
            {
              key: 'bridge-leaf-1',
              label: 'Bridge Leaf 1'
            },
            {
              key: 'bridge-leaf-2',
              label: 'Bridge Leaf 2'
            }
          ]
        },
        {
          key: 'active-node',
          label: 'Active Node'
        }
      ]
    }
  ]

  it('在未传展开属性时默认收起树节点', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData()
      }
    })

    await nextTick()

    const tree = wrapper.get('[role="tree"]')
    const items = wrapper.findAll('.fl-tree__item')
    const rootItem = findTreeItemByText(wrapper, 'Root')

    expect(tree.classes()).toContain('fl-tree')
    expect(items).toHaveLength(1)
    expect(wrapper.text()).toContain('Root')
    expect(wrapper.text()).not.toContain('Leaf')
    expect(rootItem.attributes('aria-level')).toBe('1')
    expect(rootItem.attributes('aria-expanded')).toBe('false')
    expect(rootItem.attributes('aria-selected')).toBe('false')
    expect(isItemSelected(wrapper, 'Root')).toBe(false)
    expect(wrapper.findComponent(CaretRight).exists()).toBe(true)
    expect(wrapper.findComponent(CaretBottom).exists()).toBe(false)
  })

  it('通过 `props` 映射 label、children 和 class', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: [
          {
            key: 'root',
            title: 'Mapped Root',
            nodeClass: 'root-kind',
            nodes: [
              {
                key: 'child',
                title: 'Mapped Child',
                nodeClass: 'child-kind'
              }
            ]
          }
        ],
        props: {
          label: 'title',
          children: 'nodes',
          class: 'nodeClass'
        },
        defaultExpandAll: true
      }
    })

    await nextTick()

    const items = wrapper.findAll('.fl-tree__item')

    expect(wrapper.text()).toContain('Mapped Root')
    expect(wrapper.text()).toContain('Mapped Child')
    expect(items).toHaveLength(2)
    expect(items[0]?.classes()).toContain('root-kind')
    expect(items[1]?.classes()).toContain('child-kind')
    expect(items[0]?.classes()).toContain('fl-tree__item')
  })

  it('保持递归 TreeNode 骨架在多层级下可见', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData(),
        defaultExpandAll: true
      }
    })

    await nextTick()

    const items = wrapper.findAll('.fl-tree__item')
    const groups = wrapper.findAll('.fl-tree__children[role="group"]')

    expect(items.map((item) => item.attributes('aria-level'))).toEqual(['1', '2', '3'])
    expect(groups).toHaveLength(2)
    expect(items.every((item) => item.find('.fl-tree__item-content').exists())).toBe(true)
    expect(items.every((item) => item.find('.fl-tree__item-icon').exists())).toBe(true)
    expect(items.every((item) => item.find('.fl-tree__item-title').exists())).toBe(true)
  })

  it('继承 Element Plus 视觉变量契约', async () => {
    const treeScss = readProjectFile('packages/theme/src/tree.scss')

    expect(treeScss).toContain("@use 'element-plus/theme-chalk/src/checkbox.scss';")
    expect(treeScss).toContain("@use 'element-plus/theme-chalk/src/tree.scss';")
    expect(treeScss).toContain(
      '--fl-tree-node-content-height: var(--el-tree-node-content-height, 26px);'
    )
    expect(treeScss).toContain('--fl-tree-node-hover-bg-color: var(')
    expect(treeScss).toContain('--el-tree-node-hover-bg-color,')
    expect(treeScss).toContain('var(--el-fill-color-light)')
    expect(treeScss).toContain(
      '--fl-tree-node-text-color: var(--el-tree-text-color, var(--el-text-color-regular));'
    )
    expect(treeScss).toContain('--fl-tree-node-icon-color: var(')
    expect(treeScss).toContain('--el-tree-expand-icon-color,')
    expect(treeScss).toContain('var(--el-text-color-placeholder)')
    expect(treeScss).toContain('--fl-tree-node-selected-bg-color: var(--el-color-primary-light-9);')
    expect(treeScss).toContain('--fl-tree-node-selected-text-color: var(--el-color-primary);')
    expect(treeScss).toContain('--fl-tree-leaf-dot-color: var(--el-text-color-secondary);')
    expect(treeScss).toContain('--fl-tree-line-color: var(--el-border-color-light, #dcdfe6);')
    expect(treeScss).toContain('@include bem.e(indent-unit)')
    expect(treeScss).toContain('@include bem.e(switcher-leaf-line)')
    expect(treeScss).toContain('@include bem.e(item-checkbox)')
    expect(treeScss).toContain('cursor: pointer;')
    expect(treeScss).toContain('align-items: stretch;')
    expect(treeScss).toContain('align-self: stretch;')
    expect(treeScss).toContain('top: 50%;')
    expect(treeScss).toContain('height: 50%;')
    expect(treeScss).toContain('bottom: auto;')
    expect(treeScss).not.toMatch(/^\s+height: var\(--fl-tree-node-content-height\);/m)
    expect(treeScss).not.toContain('top: calc(var(--fl-tree-node-content-height) / 2);')
    expect(treeScss).not.toContain('height: calc(var(--fl-tree-node-content-height) / 2);')

    const wrapper = mount(FlTree, {
      props: {
        data: [
          {
            key: 'root',
            label: 'Root'
          }
        ]
      }
    })

    await nextTick()

    const item = wrapper.get('.fl-tree__item')
    const content = wrapper.get('.fl-tree__item-content')
    const icon = wrapper.get('.fl-tree__item-icon')
    const title = wrapper.get('.fl-tree__item-title')

    expect(item.attributes('style')).toContain('--fl-tree-level: 1')
    expect(content.classes()).toContain('fl-tree__item-content')
    expect(icon.classes()).toContain('fl-tree__item-icon')
    expect(title.classes()).toContain('fl-tree__item-title')
  })

  it('只把语义化 classNames 与 styles 挂到 root 和 item 外壳', async () => {
    const itemStyle = {
      paddingLeft: '4px',
      '--fl-tree-level': '99'
    } as CSSProperties & Record<string, string>
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        defaultExpandAll: true,
        checkable: true,
        classNames: {
          root: 'semantic-root',
          item: 'semantic-item'
        },
        styles: {
          root: {
            borderColor: 'rgb(1, 2, 3)'
          },
          item: itemStyle
        }
      }
    })

    await nextTick()

    const tree = wrapper.get('[role="tree"]')
    const items = wrapper.findAll('.fl-tree__item')
    const rootStyle = tree.attributes('style') ?? ''
    const firstItemStyle = items[0]?.attributes('style') ?? ''

    expect(tree.classes()).toContain('semantic-root')
    expect(rootStyle).toContain('border-color: rgb(1, 2, 3)')
    expect(items).toHaveLength(2)
    expect(items.every((item) => item.classes().includes('semantic-item'))).toBe(true)
    expect(firstItemStyle).toContain('padding-left: 4px')
    expect(firstItemStyle).toContain('--fl-tree-level: 1')
    expect(firstItemStyle).not.toContain('--fl-tree-level: 99')
  })

  it('支持通过 info.props 生成语义化外壳样式并随 props 更新', async () => {
    const observedCheckableValues: boolean[] = []
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        showLine: false,
        checkable: false,
        classNames: (({ props }: { props: TreeProps }) => {
          observedCheckableValues.push(props.checkable ?? false)

          return {
            root: props.checkable ? 'semantic-checkable-root' : 'semantic-plain-root',
            item: props.showLine ? 'semantic-line-item' : 'semantic-flat-item'
          }
        }) as TreeProps['classNames'],
        styles: (({ props }: { props: TreeProps }) => ({
          root: {
            outlineStyle: props.checkable ? 'dashed' : 'solid'
          },
          item: {
            paddingRight: props.showLine ? '8px' : '2px'
          }
        })) as TreeProps['styles']
      }
    })

    await nextTick()

    expect(wrapper.get('[role="tree"]').classes()).toContain('semantic-plain-root')
    expect(wrapper.get('.fl-tree__item').classes()).toContain('semantic-flat-item')
    expect(wrapper.get('[role="tree"]').attributes('style')).toContain('outline-style: solid')
    expect(wrapper.get('.fl-tree__item').attributes('style')).toContain('padding-right: 2px')

    await wrapper.setProps({
      checkable: true,
      showLine: true
    })
    await nextTick()

    expect(wrapper.get('[role="tree"]').classes()).toContain('semantic-checkable-root')
    expect(wrapper.get('.fl-tree__item').classes()).toContain('semantic-line-item')
    expect(wrapper.get('[role="tree"]').attributes('style')).toContain('outline-style: dashed')
    expect(wrapper.get('.fl-tree__item').attributes('style')).toContain('padding-right: 8px')
    expect(observedCheckableValues).toContain(false)
    expect(observedCheckableValues).toContain(true)
  })

  it('不再把 itemIcon、itemCheckbox、itemTitle 作为公开语义化挂点消费', async () => {
    const semanticDomKeys: TreeSemanticDOM[] = ['root', 'item']
    const treeTypesSource = readProjectFile('packages/components/tree/src/tree-types.ts')
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        checkable: true,
        defaultExpandAll: true,
        classNames: {
          root: 'semantic-root',
          item: 'semantic-item',
          itemIcon: 'semantic-icon',
          itemCheckbox: 'semantic-checkbox',
          itemTitle: 'semantic-title'
        } as unknown as TreeProps['classNames']
      }
    })

    await nextTick()

    expect(semanticDomKeys).toEqual(['root', 'item'])
    expect(treeTypesSource).toContain("export type TreeSemanticDOM = 'root' | 'item'")
    expect(treeTypesSource).not.toContain("'itemIcon'")
    expect(treeTypesSource).not.toContain("'itemCheckbox'")
    expect(treeTypesSource).not.toContain("'itemTitle'")
    expect(wrapper.get('[role="tree"]').classes()).toContain('semantic-root')
    expect(wrapper.get('.fl-tree__item').classes()).toContain('semantic-item')
    expect(wrapper.get('.fl-tree__item-icon').classes()).not.toContain('semantic-icon')
    expect(wrapper.get('.fl-tree__item-checkbox').classes()).not.toContain('semantic-checkbox')
    expect(wrapper.get('.fl-tree__item-title').classes()).not.toContain('semantic-title')
  })

  it('`showLine` 开启后按层级渲染轨道与叶子末端连线', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createLineTreeData(),
        showLine: true,
        defaultExpandAll: true
      }
    })

    await nextTick()

    const tree = wrapper.get('[role="tree"]')
    const branchAItem = findTreeItemByText(wrapper, 'Branch A')
    const leafA1Item = findTreeItemByText(wrapper, 'Leaf A1')
    const leafA2Item = findTreeItemByText(wrapper, 'Leaf A2')

    expect(tree.classes()).toContain('is-show-line')
    expect(branchAItem.get('.fl-tree__indent').findAll('.fl-tree__indent-unit')).toHaveLength(1)
    expect(leafA1Item.get('.fl-tree__indent').findAll('.fl-tree__indent-unit')).toHaveLength(2)
    expect(leafA1Item.find('.fl-tree__switcher-leaf-line').exists()).toBe(true)
    expect(leafA1Item.find('.fl-tree__switcher-dot').exists()).toBe(false)
    expect(leafA1Item.classes()).not.toContain('is-last')
    expect(leafA2Item.classes()).toContain('is-last')
  })

  it('keeps showLine and checkable layout hooks stable without leaking checkbox clicks', async () => {
    const eventOrder: string[] = []
    const wrapper = mount(FlTree, {
      props: {
        data: createLineTreeData(),
        showLine: true,
        checkable: true,
        defaultExpandAll: true,
        onNodeClick: () => eventOrder.push('node-click'),
        'onUpdate:selectedKeys': () => eventOrder.push('update:selectedKeys'),
        onSelect: () => eventOrder.push('select'),
        'onUpdate:expandedKeys': () => eventOrder.push('update:expandedKeys'),
        onNodeExpand: () => eventOrder.push('node-expand'),
        'onUpdate:checkedKeys': () => eventOrder.push('update:checkedKeys'),
        onCheck: () => eventOrder.push('check')
      }
    })

    await nextTick()

    const branchAContent = getItemContent(wrapper, 'Branch A')
    const leafA1Content = getItemContent(wrapper, 'Leaf A1')

    expect(branchAContent.classes()).toContain('is-line-mode')
    expect(branchAContent.find('.fl-tree__switcher-button').exists()).toBe(true)
    expect(branchAContent.find('.fl-tree__item-checkbox').exists()).toBe(true)
    expect(leafA1Content.find('.fl-tree__switcher-leaf-line').exists()).toBe(true)
    expect(leafA1Content.find('.fl-tree__switcher-button').exists()).toBe(false)
    expect(leafA1Content.find('.fl-tree__item-checkbox').exists()).toBe(true)

    await getItemCheckbox(wrapper, 'Leaf A1').trigger('click')
    await nextTick()

    expect(eventOrder).toEqual(['update:checkedKeys', 'check'])
    expect(wrapper.emitted('node-click')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('node-expand')).toBeUndefined()
  })

  it('暴露最小可用导出链路与最新 Tree 类型导出', async () => {
    const componentsTreeModule = await import('@falcon-ui/components/tree')
    const componentsModule = await import('@falcon-ui/components')
    const falconUiModule = await import('@falcon-ui/falcon-ui')
    const app = createAppMock()

    expect(FlTreeFromTreePackage).toBe(FlTree)
    expect(FlTreeFromComponents).toBe(FlTree)
    expect(componentsTreeModule.FlTree).toBe(FlTree)
    expect(componentsModule.FlTree).toBe(FlTree)
    expect(typeof FalconUI).toBe('object')
    expect(typeof installFalconUI).toBe('function')
    expect(typeof falconUiModule.default).toBe('object')
    expect(typeof falconUiModule.install).toBe('function')

    app.use(FlTree)
    app.use(falconUiModule.default)

    expect(app.component).toHaveBeenCalledWith('FlTree', FlTree)
    expect(app._registered.FlTree).toBe(FlTree)

    const treePackageSource = readProjectFile('packages/components/package.json')
    const treeIndexSource = readProjectFile('packages/components/tree/index.ts')
    const componentsIndexSource = readProjectFile('packages/components/index.ts')
    const globalDts = readProjectFile('packages/falcon-ui/global.d.ts')
    const themeIndex = readProjectFile('packages/theme/index.scss')

    expect(treePackageSource).toContain('"./tree": "./tree/index.ts"')
    expect(treeIndexSource).toContain('TreeEmits')
    expect(treeIndexSource).toContain('TreeCheckArgs')
    expect(treeIndexSource).toContain('TreeCheckEvent')
    expect(treeIndexSource).toContain('TreeExpandPayload')
    expect(treeIndexSource).toContain('TreeSelectEvent')
    expect(treeIndexSource).toContain('TreeNodeModel')
    expect(treeIndexSource).toContain('TreeNode')
    expect(treeIndexSource).toContain('TreeSwitcherIconMode')
    expect(treeIndexSource).not.toContain('FlTreeEmits')
    expect(componentsIndexSource).toContain('TreeEmits')
    expect(componentsIndexSource).toContain('TreeCheckArgs')
    expect(componentsIndexSource).toContain('TreeCheckEvent')
    expect(componentsIndexSource).toContain('TreeExpandPayload')
    expect(componentsIndexSource).toContain('TreeSelectEvent')
    expect(componentsIndexSource).toContain('TreeNodeModel')
    expect(componentsIndexSource).toContain('TreeNode')
    expect(componentsIndexSource).toContain('TreeSwitcherIconMode')
    expect(componentsIndexSource).not.toContain('FlTreeEmits')
    expect(globalDts).toContain('FlTree: typeof FlTree')
    expect(themeIndex).toContain("@use './src/tree.scss';")

    type TreeTypeSmoke = [
      TreeKey,
      TreeProps,
      TreeCheckEvent,
      TreeExpandPayload,
      TreeSelectEvent,
      TreeSwitcherIconMode,
      TreeEmits,
      TreeNodeModel
    ]
    const treeTypeSmoke: TreeTypeSmoke | null = null
    expect(treeTypeSmoke).toBeNull()
  })

  it('使用 bem 工具统一生成树组件基础类名', () => {
    const treeSource = readProjectFile('packages/components/tree/src/tree.vue')
    const treeNodeSource = readProjectFile('packages/components/tree/src/tree-node.vue')

    expect(treeSource).toContain("useNamespace('tree')")
    expect(treeSource).toContain('const rootClassName = ns.b()')
    expect(treeNodeSource).toContain("useNamespace('tree')")
    expect(treeNodeSource).toContain("const itemClassName = ns.e('item')")
    expect(treeNodeSource).toContain("const itemContentClassName = ns.e('item-content')")
    expect(treeNodeSource).toContain("const itemIconClassName = ns.e('item-icon')")
    expect(treeNodeSource).toContain("const itemTitleClassName = ns.e('item-title')")
    expect(treeNodeSource).toContain("const childrenClassName = ns.e('children')")
  })

  it('`defaultExpandAll` 只在初始化时展开已有分支', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData(),
        defaultExpandAll: true
      }
    })

    await nextTick()

    expect(wrapper.text()).toContain('Leaf')
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-expanded')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Branch').attributes('aria-expanded')).toBe('true')

    await wrapper.setProps({
      data: [
        {
          key: 'root',
          label: 'Root',
          children: [
            {
              key: 'branch',
              label: 'Branch',
              children: [
                {
                  key: 'leaf',
                  label: 'Leaf'
                }
              ]
            },
            {
              key: 'branch-2',
              label: 'Branch 2',
              children: [
                {
                  key: 'leaf-2',
                  label: 'Leaf 2'
                }
              ]
            }
          ]
        }
      ]
    })
    await nextTick()

    expect(wrapper.text()).toContain('Branch 2')
    expect(wrapper.text()).not.toContain('Leaf 2')
    expect(findTreeItemByText(wrapper, 'Branch 2').attributes('aria-expanded')).toBe('false')
  })

  it('支持通过 `defaultExpandedKeys` 初始化展开状态', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData(),
        defaultExpandedKeys: ['root']
      }
    })

    await nextTick()

    const rootItem = findTreeItemByText(wrapper, 'Root')
    const branchItem = findTreeItemByText(wrapper, 'Branch')

    expect(rootItem.attributes('aria-expanded')).toBe('true')
    expect(branchItem.attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).toContain('Branch')
    expect(wrapper.text()).not.toContain('Leaf')
  })

  it('`defaultExpandParent` 为 true 时会自动展开祖先链路', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData(),
        defaultExpandedKeys: ['leaf']
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-expanded')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Branch').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('Leaf')
    expect(wrapper.findComponent(CaretBottom).exists()).toBe(true)
  })

  it('`defaultExpandParent` 为 false 时不会自动补齐祖先展开', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData(),
        defaultExpandedKeys: ['leaf'],
        defaultExpandParent: false
      }
    })

    await nextTick()

    const rootItem = findTreeItemByText(wrapper, 'Root')

    expect(rootItem.attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('Branch')
    expect(wrapper.text()).not.toContain('Leaf')
    expect(wrapper.findComponent(CaretRight).exists()).toBe(true)
  })

  it('支持通过 `defaultSelectedKeys` 初始化单选状态，并过滤非法与不可选节点', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        defaultSelectedKeys: ['missing-node', 'disabled-node', 'active-node', 'root']
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-selected')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Disabled Node').attributes('aria-selected')).toBeUndefined()
    expect(
      findTreeItemByText(wrapper, 'Unselectable Node').attributes('aria-selected')
    ).toBeUndefined()
    expect(isItemSelected(wrapper, 'Active Node')).toBe(true)
    expect(isItemSelected(wrapper, 'Root')).toBe(false)
  })

  it('支持在 `multiple=true` 下通过 `defaultSelectedKeys` 初始化多选状态，并过滤非法与不可选节点', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        multiple: true,
        defaultSelectedKeys: [
          'missing-node',
          'root',
          'disabled-node',
          'active-node',
          'root',
          'unselectable-node'
        ]
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-selected')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Disabled Node').attributes('aria-selected')).toBeUndefined()
    expect(
      findTreeItemByText(wrapper, 'Unselectable Node').attributes('aria-selected')
    ).toBeUndefined()
    expect(isItemSelected(wrapper, 'Root')).toBe(true)
    expect(isItemSelected(wrapper, 'Active Node')).toBe(true)
    expect(wrapper.emitted('update:selectedKeys')).toBeUndefined()
  })

  it('点击节点内容区时按顺序触发 `node-click`、`update:selectedKeys`、`select`', async () => {
    const eventOrder: string[] = []
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        onNodeClick: () => eventOrder.push('node-click'),
        'onUpdate:selectedKeys': () => eventOrder.push('update:selectedKeys'),
        onSelect: () => eventOrder.push('select')
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Root').trigger('click')
    await nextTick()

    expect(eventOrder).toEqual(['node-click', 'update:selectedKeys', 'select'])
    expect(wrapper.emitted('update:selectedKeys')).toEqual([[['root']]])

    const selectEvents = wrapper.emitted('select')

    expect(selectEvents).toHaveLength(1)
    expect(selectEvents?.[0]?.[0] as TreeKey[]).toEqual(['root'])
    const selectEvent = selectEvents?.[0]?.[1] as TreeSelectEvent

    expect(selectEvent.selected).toBe(true)
    expect(selectEvent.key).toBe('root')
    expect(selectEvent.selectedNodes).toHaveLength(1)
    expect(selectEvent.selectedNodes[0]?.key).toBe('root')
    expect(selectEvent.selectedNodes[0]?.label).toBe('Root')
    expect(selectEvent.selectedNodes[0]?.childNodes[0]?.key).toBe('leaf')
    expect(selectEvent.event).toBeInstanceOf(MouseEvent)
    expect(isItemSelected(wrapper, 'Root')).toBe(true)
  })

  it('`multiple=true` 时点击节点内容区仍保持事件顺序，并返回完整多选结果', async () => {
    const eventOrder: string[] = []
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        multiple: true,
        onNodeClick: () => eventOrder.push('node-click'),
        'onUpdate:selectedKeys': () => eventOrder.push('update:selectedKeys'),
        onSelect: () => eventOrder.push('select')
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Root').trigger('click')
    await getItemContent(wrapper, 'Active Node').trigger('click')
    await nextTick()

    expect(eventOrder).toEqual([
      'node-click',
      'update:selectedKeys',
      'select',
      'node-click',
      'update:selectedKeys',
      'select'
    ])
    expect(wrapper.emitted('update:selectedKeys')).toEqual([[['root']], [['root', 'active-node']]])

    const selectEvents = wrapper.emitted('select')

    expect(selectEvents).toHaveLength(2)
    expect(selectEvents?.[1]?.[0] as TreeKey[]).toEqual(['root', 'active-node'])
    const selectEvent = selectEvents?.[1]?.[1] as TreeSelectEvent

    expect(selectEvent.selected).toBe(true)
    expect(selectEvent.key).toBe('active-node')
    expect(selectEvent.node.key).toBe('active-node')
    expect(selectEvent.selectedNodes.map((node) => node.key)).toEqual(['root', 'active-node'])
    expect(selectEvent.event).toBeInstanceOf(MouseEvent)
  })

  it('单选模式下再次点击已选中节点会取消选中', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData()
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Root').trigger('click')
    await getItemContent(wrapper, 'Root').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:selectedKeys')).toEqual([[['root']], [[]]])
    expect((wrapper.emitted('select')?.[1]?.[1] as TreeSelectEvent).selected).toBe(false)
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBe('false')
    expect(isItemSelected(wrapper, 'Root')).toBe(false)
  })

  it('单选模式下点击另一节点会替换当前选中项', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Root').trigger('click')
    await getItemContent(wrapper, 'Active Node').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:selectedKeys')).toEqual([[['root']], [['active-node']]])
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-selected')).toBe('true')
    expect(isItemSelected(wrapper, 'Root')).toBe(false)
    expect(isItemSelected(wrapper, 'Active Node')).toBe(true)
  })

  it('多选模式下点击未选中节点会追加，点击已选中节点时仅移除当前节点', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        multiple: true
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Root').trigger('click')
    await getItemContent(wrapper, 'Active Node').trigger('click')
    await getItemContent(wrapper, 'Root').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:selectedKeys')).toEqual([
      [['root']],
      [['root', 'active-node']],
      [['active-node']]
    ])
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-selected')).toBe('true')
    expect(isItemSelected(wrapper, 'Root')).toBe(false)
    expect(isItemSelected(wrapper, 'Active Node')).toBe(true)
    expect((wrapper.emitted('select')?.[2]?.[1] as TreeSelectEvent).selected).toBe(false)
  })

  it('受控 `selectedKeys` 仅通过事件请求外部更新并严格跟随 prop', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        selectedKeys: []
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Root').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:selectedKeys')).toEqual([[['root']]])
    expect(isItemSelected(wrapper, 'Root')).toBe(false)
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBe('false')

    await wrapper.setProps({
      selectedKeys: ['root']
    })
    await nextTick()

    expect(isItemSelected(wrapper, 'Root')).toBe(true)
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBe('true')
  })

  it('受控 `selectedKeys` 在多选模式下仅请求外部更新，并等待 prop 回写后更新视图', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        multiple: true,
        selectedKeys: ['root']
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Active Node').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:selectedKeys')).toEqual([[['root', 'active-node']]])
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-selected')).toBe('false')
    expect(isItemSelected(wrapper, 'Active Node')).toBe(false)

    await wrapper.setProps({
      selectedKeys: ['root', 'active-node']
    })
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-selected')).toBe('true')
    expect(isItemSelected(wrapper, 'Root')).toBe(true)
    expect(isItemSelected(wrapper, 'Active Node')).toBe(true)
  })

  it('disabled 与 selectable=false 节点点击内容区只保留 `node-click` 观察能力', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Disabled Node').trigger('click')
    await getItemContent(wrapper, 'Unselectable Node').trigger('click')
    await nextTick()

    expect(wrapper.emitted('node-click')).toHaveLength(2)
    expect(wrapper.emitted('update:selectedKeys')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(isItemSelected(wrapper, 'Disabled Node')).toBe(false)
    expect(isItemSelected(wrapper, 'Unselectable Node')).toBe(false)
  })

  it('多选模式下 disabled 与 selectable=false 节点仍不会触发选中状态变更', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        multiple: true
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Disabled Node').trigger('click')
    await getItemContent(wrapper, 'Unselectable Node').trigger('click')
    await nextTick()

    expect(wrapper.emitted('node-click')).toHaveLength(2)
    expect(wrapper.emitted('update:selectedKeys')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(isItemSelected(wrapper, 'Disabled Node')).toBe(false)
    expect(isItemSelected(wrapper, 'Unselectable Node')).toBe(false)
  })

  it('树级 `selectable` 为 false 时不会输出选中态与选中事件', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        selectable: false,
        multiple: true,
        defaultSelectedKeys: ['root']
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Root').trigger('click')
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBeUndefined()
    expect(wrapper.emitted('update:selectedKeys')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(isItemSelected(wrapper, 'Root')).toBe(false)
  })

  it('`checkable=true` 时渲染复选框并输出 `aria-checked`，关闭时完全不渲染', async () => {
    const uncheckedWrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData()
      }
    })

    await nextTick()

    expect(uncheckedWrapper.find('.fl-tree__item-checkbox').exists()).toBe(false)
    expect(findTreeItemByText(uncheckedWrapper, 'Root').attributes('aria-checked')).toBeUndefined()

    const checkedWrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        checkable: true,
        defaultCheckedKeys: ['root']
      }
    })

    await nextTick()

    expect(checkedWrapper.findAll('.fl-tree__item-checkbox')).toHaveLength(1)
    expect(findTreeItemByText(checkedWrapper, 'Root').attributes('aria-checked')).toBe('true')
    expect(isItemChecked(checkedWrapper, 'Root')).toBe(true)
  })

  it('strict 模式支持对象型 `checkedKeys`，并能驱动 checked / halfChecked 显示', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        checkable: true,
        checkStrictly: true,
        checkedKeys: {
          checked: ['active-node', 'checkbox-disabled-node', 'missing-node'],
          halfChecked: ['root', 'legacy-checkable-node', 'active-node']
        }
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-checked')).toBe('mixed')
    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-checked')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Checkbox Disabled Node').attributes('aria-checked')).toBe(
      'true'
    )
    expect(findTreeItemByText(wrapper, 'Disabled Node').attributes('aria-checked')).toBe('false')
    expect(isItemHalfChecked(wrapper, 'Root')).toBe(true)
    expect(isItemChecked(wrapper, 'Active Node')).toBe(true)
    expect(isItemChecked(wrapper, 'Checkbox Disabled Node')).toBe(true)
    expect(hasItemCheckbox(wrapper, 'Legacy Checkable False Node')).toBe(false)
    expect(
      findTreeItemByText(wrapper, 'Legacy Checkable False Node').attributes('aria-checked')
    ).toBeUndefined()
  })

  it('`checkStrictly=true` 时点击复选框按顺序触发对象型 `update:checkedKeys`、`check` 并返回完整结果', async () => {
    const eventOrder: string[] = []
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        checkable: true,
        checkStrictly: true,
        'onUpdate:checkedKeys': () => eventOrder.push('update:checkedKeys'),
        onCheck: () => eventOrder.push('check')
      }
    })

    await nextTick()
    await getItemCheckbox(wrapper, 'Root').trigger('click')
    await getItemCheckbox(wrapper, 'Active Node').trigger('click')
    await getItemCheckbox(wrapper, 'Root').trigger('click')
    await nextTick()

    expect(eventOrder).toEqual([
      'update:checkedKeys',
      'check',
      'update:checkedKeys',
      'check',
      'update:checkedKeys',
      'check'
    ])
    expect(wrapper.emitted('update:checkedKeys')).toEqual([
      [{ checked: ['root'], halfChecked: [] }],
      [{ checked: ['root', 'active-node'], halfChecked: [] }],
      [{ checked: ['active-node'], halfChecked: [] }]
    ])

    const checkEvents = wrapper.emitted('check')

    expect(checkEvents).toHaveLength(3)
    expect(checkEvents?.[1]?.[0] as TreeCheckedKeys).toEqual({
      checked: ['root', 'active-node'],
      halfChecked: []
    })
    const secondCheckEvent = checkEvents?.[1]?.[1] as TreeCheckEvent
    const thirdCheckEvent = checkEvents?.[2]?.[1] as TreeCheckEvent

    expect(secondCheckEvent.checked).toBe(true)
    expect(secondCheckEvent.key).toBe('active-node')
    expect(secondCheckEvent.node.key).toBe('active-node')
    expect(secondCheckEvent.checkedNodes.map((node) => node.key)).toEqual(['root', 'active-node'])
    expect(secondCheckEvent.halfCheckedKeys).toEqual([])
    expect(secondCheckEvent.event).toBeInstanceOf(MouseEvent)
    expect(thirdCheckEvent.checked).toBe(false)
    expect(thirdCheckEvent.checkedNodes.map((node) => node.key)).toEqual(['active-node'])
    expect(thirdCheckEvent.halfCheckedKeys).toEqual([])
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-checked')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-checked')).toBe('true')
  })

  it('受控 strict 模式只请求对象型外部更新，并等待 prop 回写后更新视图', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        checkable: true,
        checkStrictly: true,
        checkedKeys: {
          checked: ['root'],
          halfChecked: ['active-node']
        }
      }
    })

    await nextTick()
    await getItemCheckbox(wrapper, 'Active Node').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:checkedKeys')).toEqual([
      [{ checked: ['root', 'active-node'], halfChecked: [] }]
    ])
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-checked')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-checked')).toBe('mixed')
    expect(isItemChecked(wrapper, 'Active Node')).toBe(false)
    expect(isItemHalfChecked(wrapper, 'Active Node')).toBe(true)

    await wrapper.setProps({
      checkedKeys: {
        checked: ['root', 'active-node'],
        halfChecked: []
      }
    })
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-checked')).toBe('true')
    expect(isItemChecked(wrapper, 'Active Node')).toBe(true)
  })

  it('默认联动模式会根据 `defaultCheckedKeys` 计算父子勾选与半选态', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createCheckConductTreeData(),
        defaultExpandAll: true,
        checkable: true,
        defaultCheckedKeys: ['branch-a']
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Branch A').attributes('aria-checked')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-checked')).toBe('mixed')
    expect(findTreeItemByText(wrapper, 'Leaf A1').attributes('aria-checked')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Leaf A2').attributes('aria-checked')).toBe('true')
    expect(isItemChecked(wrapper, 'Branch A')).toBe(true)
    expect(isItemHalfChecked(wrapper, 'Root')).toBe(true)
  })

  it('默认联动模式点击叶子节点会计算祖先 checked / halfChecked，并通过 `event.halfCheckedKeys` 返回', async () => {
    const eventOrder: string[] = []
    const wrapper = mount(FlTree, {
      props: {
        data: createCheckConductTreeData(),
        defaultExpandAll: true,
        checkable: true,
        'onUpdate:checkedKeys': () => eventOrder.push('update:checkedKeys'),
        onCheck: () => eventOrder.push('check')
      }
    })

    await nextTick()
    await getItemCheckbox(wrapper, 'Leaf A1').trigger('click')
    await getItemCheckbox(wrapper, 'Leaf A2').trigger('click')
    await nextTick()

    expect(eventOrder).toEqual(['update:checkedKeys', 'check', 'update:checkedKeys', 'check'])
    expect(wrapper.emitted('update:checkedKeys')).toEqual([
      [['leaf-a1']],
      [['branch-a', 'leaf-a1', 'leaf-a2']]
    ])

    const checkEvents = wrapper.emitted('check')

    expect(checkEvents).toHaveLength(2)
    expect(checkEvents?.[0]?.[0] as TreeKey[]).toEqual(['leaf-a1'])
    expect(checkEvents?.[1]?.[0] as TreeKey[]).toEqual(['branch-a', 'leaf-a1', 'leaf-a2'])

    const firstCheckEvent = checkEvents?.[0]?.[1] as TreeCheckEvent
    const secondCheckEvent = checkEvents?.[1]?.[1] as TreeCheckEvent

    expect(firstCheckEvent.checked).toBe(true)
    expect(firstCheckEvent.key).toBe('leaf-a1')
    expect(firstCheckEvent.halfCheckedKeys).toEqual(['root', 'branch-a'])
    expect(secondCheckEvent.checked).toBe(true)
    expect(secondCheckEvent.key).toBe('leaf-a2')
    expect(secondCheckEvent.checkedNodes.map((node) => node.key)).toEqual([
      'branch-a',
      'leaf-a1',
      'leaf-a2'
    ])
    expect(secondCheckEvent.halfCheckedKeys).toEqual(['root'])
    expect(findTreeItemByText(wrapper, 'Branch A').attributes('aria-checked')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-checked')).toBe('mixed')
    expect(isItemHalfChecked(wrapper, 'Root')).toBe(true)
  })

  it('disabled 与 `disableCheckbox` 复选框会禁用，但保留已勾选视觉并阻止交互', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        checkable: true,
        checkStrictly: true,
        checkedKeys: {
          checked: ['disabled-node', 'checkbox-disabled-node'],
          halfChecked: []
        }
      }
    })

    await nextTick()
    await getItemCheckbox(wrapper, 'Disabled Node').trigger('click')
    await getItemCheckbox(wrapper, 'Checkbox Disabled Node').trigger('click')
    await nextTick()

    expect(isItemCheckboxDisabled(wrapper, 'Disabled Node')).toBe(true)
    expect(isItemCheckboxDisabled(wrapper, 'Checkbox Disabled Node')).toBe(true)
    expect(findTreeItemByText(wrapper, 'Disabled Node').attributes('aria-checked')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Checkbox Disabled Node').attributes('aria-checked')).toBe(
      'true'
    )
    expect(wrapper.emitted('update:checkedKeys')).toBeUndefined()
    expect(wrapper.emitted('check')).toBeUndefined()
  })

  it('默认联动模式下 `disabled` / `disableCheckbox` / `checkable=false` 边界符合阶段 9 约束', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createCheckConductTreeData(),
        defaultExpandAll: true,
        checkable: true,
        defaultCheckedKeys: ['root']
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-checked')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Branch A').attributes('aria-checked')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Checkbox Disabled Node').attributes('aria-checked')).toBe(
      'true'
    )
    expect(findTreeItemByText(wrapper, 'Active Node').attributes('aria-checked')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Disabled Branch').attributes('aria-checked')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Disabled Branch Leaf').attributes('aria-checked')).toBe(
      'false'
    )
    expect(findTreeItemByText(wrapper, 'Bridge Leaf 1').attributes('aria-checked')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Bridge Leaf 2').attributes('aria-checked')).toBe('true')
    expect(isItemChecked(wrapper, 'Branch A')).toBe(true)
    expect(isItemCheckboxDisabled(wrapper, 'Checkbox Disabled Node')).toBe(true)
    expect(hasItemCheckbox(wrapper, 'Non Checkable Bridge')).toBe(false)
    expect(findTreeItemByText(wrapper, 'Non Checkable Bridge').attributes('aria-checked')).toBe(
      undefined
    )
  })

  it('disabled 父节点会阻断向上联动，但不影响禁用分支内部的独立勾选', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createCheckConductTreeData(),
        defaultExpandAll: true,
        checkable: true
      }
    })

    await nextTick()
    await getItemCheckbox(wrapper, 'Disabled Branch Leaf').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:checkedKeys')).toEqual([[['disabled-branch-leaf']]])
    expect(findTreeItemByText(wrapper, 'Disabled Branch Leaf').attributes('aria-checked')).toBe(
      'true'
    )
    expect(findTreeItemByText(wrapper, 'Disabled Branch').attributes('aria-checked')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-checked')).toBe('false')
  })

  it('点击复选框不会触发 `node-click`、`select`、`node-expand` 或 `node-collapse`', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        checkable: true
      }
    })

    await nextTick()
    await getItemCheckbox(wrapper, 'Root').trigger('click')
    await nextTick()

    expect(wrapper.emitted('node-click')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('node-expand')).toBeUndefined()
    expect(wrapper.emitted('node-collapse')).toBeUndefined()
    expect(wrapper.emitted('update:checkedKeys')).toEqual([[['root', 'leaf']]])
  })

  it('树级 `selectable=false` 与勾选能力可共存，节点级 `checkable=false` 会隐藏复选框并阻止自身勾选', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        selectable: false,
        checkable: true,
        checkStrictly: true
      }
    })

    await nextTick()
    await getItemCheckbox(wrapper, 'Active Node').trigger('click')
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBeUndefined()
    expect(
      findTreeItemByText(wrapper, 'Legacy Checkable False Node').attributes('aria-selected')
    ).toBeUndefined()
    expect(hasItemCheckbox(wrapper, 'Legacy Checkable False Node')).toBe(false)
    expect(
      findTreeItemByText(wrapper, 'Legacy Checkable False Node').attributes('aria-checked')
    ).toBeUndefined()
    expect(wrapper.emitted('update:selectedKeys')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('update:checkedKeys')).toEqual([
      [{ checked: ['active-node'], halfChecked: [] }]
    ])
  })

  it('点击节点内容区时触发 `node-click`，且 `node` 不包含 expanded', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData()
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Root').trigger('click')
    await nextTick()

    const nodeClickEvents = wrapper.emitted('node-click')

    expect(nodeClickEvents).toHaveLength(1)
    expect(wrapper.emitted('node-expand')).toBeUndefined()
    expect(wrapper.emitted('node-collapse')).toBeUndefined()

    const [dataArg, nodeArg, componentArg, eventArg] = nodeClickEvents?.[0] as [
      { key: string },
      TreeNode,
      Record<string, unknown>,
      MouseEvent
    ]

    expect(dataArg.key).toBe('root')
    expect(nodeArg.key).toBe('root')
    expect(nodeArg.data.key).toBe('root')
    expect(nodeArg.childNodes).toHaveLength(1)
    expect(nodeArg.childNodes[0]?.key).toBe('leaf')
    expect(nodeArg.parent).toBeNull()
    expect('expanded' in nodeArg).toBe(false)
    expect(componentArg).toBeTruthy()
    expect(eventArg).toBeInstanceOf(MouseEvent)
  })

  it('点击收起态 switcher 时只触发展开链路，不再触发 `node-click` 与 `select`', async () => {
    const eventOrder: string[] = []
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        multiple: true,
        'onUpdate:expandedKeys': () => eventOrder.push('update:expandedKeys'),
        onNodeExpand: () => eventOrder.push('node-expand'),
        onExpand: () => eventOrder.push('expand'),
        onSelect: () => eventOrder.push('select')
      }
    })

    await nextTick()
    await getSwitcherButton(wrapper, 'Root').trigger('click')
    await nextTick()

    expect(eventOrder).toEqual(['update:expandedKeys', 'node-expand', 'expand'])
    expect(wrapper.emitted('node-click')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('update:expandedKeys')).toEqual([[['root']]])

    const nodeExpandEvents = wrapper.emitted('node-expand')
    const expandEvents = wrapper.emitted('expand')

    expect(nodeExpandEvents).toHaveLength(1)
    expect(expandEvents).toHaveLength(1)

    const [dataArg, nodeArg, instanceArg] = nodeExpandEvents?.[0] as [
      { key: string },
      TreeNode & { expanded: boolean },
      Record<string, unknown>
    ]

    expect(dataArg.key).toBe('root')
    expect(nodeArg.key).toBe('root')
    expect(nodeArg.expanded).toBe(true)
    expect(nodeArg.parent).toBeNull()
    expect(nodeArg.childNodes).toHaveLength(1)
    expect(nodeArg.childNodes[0]?.key).toBe('leaf')
    expect(instanceArg).toBeTruthy()
    expect(expandEvents?.[0]?.[0] as TreeExpandPayload).toMatchObject({
      expanded: true,
      key: 'root',
      expandedKeys: ['root']
    })
  })

  it('点击展开态 switcher 时触发 `node-collapse`，且不再派发 `node-click`', async () => {
    const eventOrder: string[] = []
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        defaultExpandAll: true,
        'onUpdate:expandedKeys': () => eventOrder.push('update:expandedKeys'),
        onNodeCollapse: () => eventOrder.push('node-collapse'),
        onExpand: () => eventOrder.push('expand')
      }
    })

    await nextTick()
    await getSwitcherButton(wrapper, 'Root').trigger('click')
    await nextTick()

    expect(eventOrder).toEqual(['update:expandedKeys', 'node-collapse', 'expand'])
    expect(wrapper.emitted('node-click')).toBeUndefined()

    const nodeCollapseEvents = wrapper.emitted('node-collapse')

    expect(nodeCollapseEvents).toHaveLength(1)

    const [dataArg, nodeArg] = nodeCollapseEvents?.[0] as [
      { key: string },
      TreeNode & { expanded: boolean }
    ]

    expect(dataArg.key).toBe('root')
    expect(nodeArg.key).toBe('root')
    expect(nodeArg.expanded).toBe(false)
  })

  it('受控 `expandedKeys` 点击 switcher 仍按请求状态触发 `node-expand`，且视图不自行变化', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        expandedKeys: []
      }
    })

    await nextTick()
    await getSwitcherButton(wrapper, 'Root').trigger('click')
    await nextTick()

    const nodeExpandEvents = wrapper.emitted('node-expand')

    expect(nodeExpandEvents).toHaveLength(1)
    expect((nodeExpandEvents?.[0]?.[1] as TreeNode & { expanded: boolean }).expanded).toBe(true)
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('Leaf')
  })

  it('非用户驱动变化不会触发节点点击、选中、展开与收起事件', async () => {
    const mountWithListeners = (props: Record<string, unknown>) =>
      mount(FlTree, {
        props: {
          data: createNestedTreeData(),
          onNodeClick: vi.fn(),
          onSelect: vi.fn(),
          onNodeExpand: vi.fn(),
          onNodeCollapse: vi.fn(),
          ...props
        }
      })

    const wrapperWithExpandAll = mountWithListeners({
      defaultExpandAll: true
    })

    await nextTick()

    expect(wrapperWithExpandAll.emitted('node-click')).toBeUndefined()
    expect(wrapperWithExpandAll.emitted('select')).toBeUndefined()
    expect(wrapperWithExpandAll.emitted('node-expand')).toBeUndefined()
    expect(wrapperWithExpandAll.emitted('node-collapse')).toBeUndefined()

    const wrapperWithDefaultExpandedKeys = mountWithListeners({
      defaultExpandedKeys: ['root']
    })

    await nextTick()

    expect(wrapperWithDefaultExpandedKeys.emitted('node-click')).toBeUndefined()
    expect(wrapperWithDefaultExpandedKeys.emitted('select')).toBeUndefined()
    expect(wrapperWithDefaultExpandedKeys.emitted('node-expand')).toBeUndefined()
    expect(wrapperWithDefaultExpandedKeys.emitted('node-collapse')).toBeUndefined()

    const wrapperWithControlledProps = mountWithListeners({
      expandedKeys: ['root']
    })

    await nextTick()
    await wrapperWithControlledProps.setProps({
      expandedKeys: ['root', 'branch']
    })
    await wrapperWithControlledProps.setProps({
      data: [
        {
          key: 'root',
          label: 'Root',
          children: [
            {
              key: 'branch',
              label: 'Branch',
              children: [
                {
                  key: 'leaf',
                  label: 'Leaf'
                }
              ]
            },
            {
              key: 'branch-2',
              label: 'Branch 2',
              children: [
                {
                  key: 'leaf-2',
                  label: 'Leaf 2'
                }
              ]
            }
          ]
        }
      ]
    })
    await nextTick()

    expect(wrapperWithControlledProps.emitted('node-click')).toBeUndefined()
    expect(wrapperWithControlledProps.emitted('select')).toBeUndefined()
    expect(wrapperWithControlledProps.emitted('node-expand')).toBeUndefined()
    expect(wrapperWithControlledProps.emitted('node-collapse')).toBeUndefined()
  })

  it('受控 `expandedKeys` 仅通过事件请求外部更新并严格跟随 prop', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        expandedKeys: []
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('Leaf')

    await getSwitcherButton(wrapper, 'Root').trigger('click')
    await nextTick()

    const updateExpandedKeysEvents = wrapper.emitted('update:expandedKeys')
    const expandEvents = wrapper.emitted('expand')

    expect(updateExpandedKeysEvents).toEqual([[['root']]])
    expect(expandEvents).toHaveLength(1)
    expect(expandEvents?.[0]?.[0] as TreeExpandPayload).toMatchObject({
      expanded: true,
      key: 'root',
      expandedKeys: ['root']
    })
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('Leaf')

    await wrapper.setProps({
      expandedKeys: ['root']
    })
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('Leaf')
  })

  it('`autoExpandParent` 为 true 时受控子节点 key 会带动祖先展开', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData(),
        expandedKeys: ['leaf'],
        autoExpandParent: true
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-expanded')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Branch').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('Leaf')
  })

  it('`autoExpandParent` 为 false 时仅按受控源 key 渲染展开状态', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData(),
        expandedKeys: ['leaf'],
        autoExpandParent: false
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('Branch')
    expect(wrapper.text()).not.toContain('Leaf')
  })

  it('叶子节点点击整行会进入单选态，且不暴露展开属性', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: [
          ...createSimpleTreeData(),
          {
            key: 'archive',
            label: 'Archive',
            isLeaf: true
          }
        ]
      }
    })

    await nextTick()

    const archiveItem = findTreeItemByText(wrapper, 'Archive')

    expect(archiveItem.attributes('aria-expanded')).toBeUndefined()
    expect(archiveItem.find('.fl-tree__switcher-dot').exists()).toBe(true)
    expect(archiveItem.find('.fl-tree__switcher-button').exists()).toBe(false)

    await getItemContent(wrapper, 'Archive').trigger('click')
    await nextTick()

    expect(wrapper.emitted('node-click')).toHaveLength(1)
    expect(wrapper.emitted('update:selectedKeys')).toEqual([[['archive']]])
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('node-expand')).toBeUndefined()
    expect(wrapper.emitted('node-collapse')).toBeUndefined()
    expect(findTreeItemByText(wrapper, 'Archive').attributes('aria-selected')).toBe('true')
    expect(isItemSelected(wrapper, 'Archive')).toBe(true)
  })

  it('renders label-only content when no default slot is provided', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: [
          {
            key: 'root',
            label: 'Root',
            description: 'Ignored Description'
          }
        ]
      }
    })

    await nextTick()

    expect(wrapper.get('.fl-tree__item-title').text()).toBe('Root')
    expect(wrapper.text()).not.toContain('Ignored Description')
    expect(wrapper.find('.tree-slot-node').exists()).toBe(false)
  })

  it('fully replaces the default content area through the default slot', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: [
          {
            key: 'root',
            title: 'Mapped Root',
            nodes: [
              {
                key: 'leaf',
                title: 'Mapped Leaf'
              }
            ]
          }
        ],
        props: {
          label: 'title',
          children: 'nodes'
        },
        defaultExpandAll: true
      },
      slots: {
        default: ({ node, data }: { node: TreeNode; data: TreeData }) =>
          h(
            'span',
            {
              class: 'tree-slot-node'
            },
            `${node.label}:${String(data.title)}:${String(data.key)}`
          )
      }
    })

    await nextTick()

    const slotNodes = wrapper.findAll('.tree-slot-node')

    expect(slotNodes).toHaveLength(2)
    expect(slotNodes[0]?.text()).toBe('Mapped Root:Mapped Root:root')
    expect(slotNodes[1]?.text()).toBe('Mapped Leaf:Mapped Leaf:leaf')
    expect(wrapper.text()).not.toContain('{{ node.label }}')
  })

  it('keeps click, expand, and checkbox event ordering stable with a default slot', async () => {
    const eventOrder: string[] = []
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        checkable: true,
        classNames: {
          root: 'semantic-event-root',
          item: 'semantic-event-item'
        },
        styles: {
          root: {
            borderColor: 'rgb(7, 8, 9)'
          },
          item: {
            marginTop: '1px'
          }
        },
        onNodeClick: () => eventOrder.push('node-click'),
        'onUpdate:selectedKeys': () => eventOrder.push('update:selectedKeys'),
        onSelect: () => eventOrder.push('select'),
        'onUpdate:expandedKeys': () => eventOrder.push('update:expandedKeys'),
        onNodeExpand: () => eventOrder.push('node-expand'),
        onExpand: () => eventOrder.push('expand'),
        'onUpdate:checkedKeys': () => eventOrder.push('update:checkedKeys'),
        onCheck: () => eventOrder.push('check')
      },
      slots: {
        default: ({ node }: { node: TreeNode }) =>
          h(
            'span',
            {
              class: 'tree-slot-node'
            },
            `slot-${String(node.key)}`
          )
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'slot-root').trigger('click')
    await nextTick()
    await getSwitcherButton(wrapper, 'slot-root').trigger('click')
    await nextTick()
    await getItemCheckbox(wrapper, 'slot-root').trigger('click')
    await nextTick()

    expect(eventOrder).toEqual([
      'node-click',
      'update:selectedKeys',
      'select',
      'update:expandedKeys',
      'node-expand',
      'expand',
      'update:checkedKeys',
      'check'
    ])
    expect(isItemSelected(wrapper, 'slot-root')).toBe(true)
    expect(wrapper.emitted('update:checkedKeys')).toEqual([[['root', 'leaf']]])
  })

  it('supports arrow, plus-minus, and folder switcherIcon modes', async () => {
    const modes: TreeSwitcherIconMode[] = ['arrow', 'plus-minus', 'folder']

    for (const mode of modes) {
      const wrapper = mount(FlTree, {
        props: {
          data: createSimpleTreeData(),
          switcherIcon: mode
        }
      })

      await nextTick()

      if (mode === 'arrow') {
        expect(wrapper.findComponent(CaretRight).exists()).toBe(true)
      }

      if (mode === 'plus-minus') {
        expect(wrapper.findComponent(PlusSquareOutlined).exists()).toBe(true)
      }

      if (mode === 'folder') {
        expect(wrapper.findComponent(Folder).exists()).toBe(true)
      }

      await getSwitcherButton(wrapper, 'Root').trigger('click')
      await nextTick()

      if (mode === 'arrow') {
        expect(wrapper.findComponent(CaretBottom).exists()).toBe(true)
      }

      if (mode === 'plus-minus') {
        expect(wrapper.findComponent(MinusSquareOutlined).exists()).toBe(true)
      }

      if (mode === 'folder') {
        expect(wrapper.findComponent(FolderOpened).exists()).toBe(true)
      }

      expect(findTreeItemByText(wrapper, 'Leaf').find('.fl-tree__switcher-dot').exists()).toBe(true)
    }
  })

  it('keeps line-mode leaf placeholders stable across switcherIcon modes', async () => {
    const modes: TreeSwitcherIconMode[] = ['arrow', 'plus-minus', 'folder']

    for (const mode of modes) {
      const wrapper = mount(FlTree, {
        props: {
          data: createLineTreeData(),
          showLine: true,
          defaultExpandAll: true,
          switcherIcon: mode
        }
      })

      await nextTick()

      const tree = wrapper.get('[role="tree"]')
      const branchAItem = findTreeItemByText(wrapper, 'Branch A')
      const leafA1Item = findTreeItemByText(wrapper, 'Leaf A1')

      expect(tree.classes()).toContain('is-show-line')
      expect(branchAItem.get('.fl-tree__item-content').classes()).toContain('is-line-mode')
      expect(leafA1Item.find('.fl-tree__switcher-leaf-line').exists()).toBe(true)
      expect(leafA1Item.find('.fl-tree__switcher-button').exists()).toBe(false)

      if (mode === 'arrow') {
        expect(wrapper.findComponent(CaretBottom).exists()).toBe(true)
      }

      if (mode === 'plus-minus') {
        expect(wrapper.findComponent(MinusSquareOutlined).exists()).toBe(true)
      }

      if (mode === 'folder') {
        expect(wrapper.findComponent(FolderOpened).exists()).toBe(true)
      }
    }
  })
})
