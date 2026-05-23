import type { VueWrapper } from '@vue/test-utils'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { MinusSquareOutlined, PlusSquareOutlined } from '@falcon-ui/icons'
import { CaretBottom, CaretRight, Folder, FolderOpened, Loading } from '@element-plus/icons-vue'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, type CSSProperties } from 'vue'
import FlTree, {
  FlTree as FlTreeFromTreePackage,
  type TreeCheckEvent,
  type TreeCheckedKeys,
  type TreeClassNames,
  type TreeClassValue,
  type TreeData,
  type TreeFilterTreeNode,
  type TreeAllowDrag,
  type TreeAllowDrop,
  type TreeAllowDropType,
  type TreeEmits,
  type TreeExpandEvent,
  type TreeExpandedNode,
  type TreeExpose,
  type TreeKey,
  type TreeInteractionEvent,
  type TreeLoadEvent,
  type TreeNode,
  type TreeNodeDblclickArgs,
  type TreeNodeDragEndArgs,
  type TreeNodeDragStartArgs,
  type TreeNodeDragTargetArgs,
  type TreeNodeDropArgs,
  type TreeNodeDropType,
  type TreeNodeRightClickArgs,
  type TreeNodeClassName,
  type TreeNodeClassNameInfo,
  type TreeNodeModel,
  type TreeProps,
  type TreeScrollAlign,
  type TreeScrollToOptions,
  type TreeSemanticDOM,
  type TreeSelectEvent,
  type TreeShowLine,
  type TreeShowLineOptions,
  type TreeStyles,
  type TreeSwitcherLoadingIcon,
  type TreeSwitcherIconMode
} from '@falcon-ui/components/tree'
import { FlTree as FlTreeFromComponents } from '@falcon-ui/components'
import FalconUI, { install as installFalconUI } from '@falcon-ui/falcon-ui'
import { normalizeTreeNode } from '../src/tree'

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
   * 为 jsdom 中的节点内容区补充稳定尺寸，便于验证拖拽落点分区。
   */
  const setItemContentRect = (
    wrapper: VueWrapper,
    label: string,
    rect: { top?: number; height?: number } = {}
  ) => {
    const content = getItemContent(wrapper, label)
    const top = rect.top ?? 0
    const height = rect.height ?? 100

    Object.defineProperty(content.element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        top,
        bottom: top + height,
        left: 0,
        right: 240,
        width: 240,
        height,
        x: 0,
        y: top,
        toJSON: () => ({})
      })
    })

    return content
  }

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
   * 读取当前 `aria-activedescendant` 指向的活动节点。
   */
  const getActiveTreeItem = (wrapper: VueWrapper) => {
    const activeId = wrapper.get('[role="tree"]').attributes('aria-activedescendant')
    const activeItem = wrapper
      .findAll('.fl-tree__item')
      .find((item) => item.attributes('id') === activeId)

    if (!activeItem) {
      throw new Error(`Unable to find active tree item: ${activeId}`)
    }

    return activeItem
  }

  /**
   * 读取当前键盘活动节点的标题文本。
   */
  const getActiveTreeItemLabel = (wrapper: VueWrapper) =>
    getActiveTreeItem(wrapper).get('.fl-tree__item-title').text()

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
   * 提供覆盖根层级与子层级同级展开互斥的树数据。
   */
  const createAccordionTreeData = () => [
    {
      key: 'root-a',
      label: 'Root A',
      children: [
        {
          key: 'branch-a1',
          label: 'Branch A1',
          children: [
            {
              key: 'leaf-a1',
              label: 'Leaf A1'
            }
          ]
        },
        {
          key: 'branch-a2',
          label: 'Branch A2',
          children: [
            {
              key: 'leaf-a2',
              label: 'Leaf A2'
            }
          ]
        }
      ]
    },
    {
      key: 'root-b',
      label: 'Root B',
      children: [
        {
          key: 'branch-b1',
          label: 'Branch B1',
          children: [
            {
              key: 'leaf-b1',
              label: 'Leaf B1'
            }
          ]
        }
      ]
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
   * 提供一个无子节点但可通过 loadData 加载的异步树节点。
   */
  const createAsyncTreeData = () => [
    {
      key: 'async-root',
      label: 'Async Root'
    },
    {
      key: 'forced-leaf',
      label: 'Forced Leaf',
      isLeaf: true
    }
  ]

  /**
   * 构造可手动 resolve / reject 的 Promise，便于验证 loading 中间态。
   */
  const createDeferred = <T = unknown>() => {
    let resolve!: (value: T | PromiseLike<T>) => void
    let reject!: (reason?: unknown) => void
    const promise = new Promise<T>((promiseResolve, promiseReject) => {
      resolve = promiseResolve
      reject = promiseReject
    })

    return {
      promise,
      reject,
      resolve
    }
  }

  /**
   * 提供包含选择与 checkbox 边界节点的纯业务树数据。
   */
  const createSelectionBoundaryTreeData = () => [
    {
      key: 'root',
      label: 'Root',
      children: [
        {
          key: 'disabled-node',
          label: 'Disabled Node'
        },
        {
          key: 'checkbox-disabled-node',
          label: 'Checkbox Disabled Node'
        },
        {
          key: 'unselectable-node',
          label: 'Unselectable Node'
        },
        {
          key: 'hidden-checkbox-node',
          label: 'Hidden Checkbox Node'
        },
        {
          key: 'active-node',
          label: 'Active Node'
        }
      ]
    }
  ]

  /**
   * 提供覆盖父子联动、半选态、禁用边界与隐藏 checkbox 透明节点的树数据。
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
          children: [
            {
              key: 'disabled-branch-leaf',
              label: 'Disabled Branch Leaf'
            }
          ]
        },
        {
          key: 'checkbox-disabled-node',
          label: 'Checkbox Disabled Node'
        },
        {
          key: 'hidden-checkbox-bridge',
          label: 'Hidden Checkbox Bridge',
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

  it('通过 `props` 只映射 label、children 和 isLeaf，不再消费节点 class 字段', async () => {
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
                nodeClass: 'child-kind',
                leafFlag: true
              }
            ]
          }
        ],
        props: {
          label: 'title',
          children: 'nodes',
          isLeaf: 'leafFlag',
          class: 'nodeClass'
        } as unknown as TreeProps['props'],
        defaultExpandAll: true
      }
    })

    await nextTick()

    const items = wrapper.findAll('.fl-tree__item')

    expect(wrapper.text()).toContain('Mapped Root')
    expect(wrapper.text()).toContain('Mapped Child')
    expect(items).toHaveLength(2)
    expect(items[0]?.classes()).not.toContain('root-kind')
    expect(items[1]?.classes()).not.toContain('child-kind')
    expect(items[0]?.classes()).toContain('fl-tree__item')
    expect(findTreeItemByText(wrapper, 'Mapped Child').attributes('aria-expanded')).toBeUndefined()
  })

  it('标准化节点不再保留来自业务数据的 className 字段', () => {
    const nodeWithoutClass = normalizeTreeNode({ key: 'without-class', label: 'Without Class' }, 1)
    const nodeWithClass = normalizeTreeNode(
      {
        key: 'with-class',
        label: 'With Class',
        class: 'is-highlighted',
        className: 'is-legacy-highlighted'
      },
      1,
      {
        class: 'className'
      } as unknown as TreeProps['props']
    )

    expect(nodeWithoutClass).not.toHaveProperty('className')
    expect(nodeWithClass).not.toHaveProperty('className')
  })

  it('通过 nodeClassName 在视图层为节点外壳注入 class', async () => {
    interface StyledTreeData extends TreeData {
      kind?: 'workspace' | 'file'
      status?: 'normal' | 'new'
      children?: StyledTreeData[]
    }

    const data: StyledTreeData[] = [
      {
        key: 'workspace',
        label: 'Workspace',
        kind: 'workspace',
        children: [
          {
            key: 'readme',
            label: 'README',
            kind: 'file',
            status: 'new'
          }
        ]
      }
    ]
    const nodeClassName: TreeNodeClassName = ({ node, data }): TreeClassValue | undefined => {
      if (node.key === 'workspace') {
        return 'docs-tree-node--workspace'
      }

      if (data.status === 'new') {
        return ['docs-tree-node--file', { 'docs-tree-node--new': true }]
      }

      return undefined
    }
    const wrapper = mount(FlTree, {
      props: {
        data,
        nodeClassName,
        defaultExpandAll: true
      }
    })

    await nextTick()

    const workspaceItem = findTreeItemByText(wrapper, 'Workspace')
    const readmeItem = findTreeItemByText(wrapper, 'README')

    expect(workspaceItem.classes()).toContain('docs-tree-node--workspace')
    expect(readmeItem.classes()).toContain('docs-tree-node--file')
    expect(readmeItem.classes()).toContain('docs-tree-node--new')
  })

  it('nodeClassName 接收事件节点快照与原始节点数据', async () => {
    const rootData: TreeData = {
      key: 'root',
      label: 'Root'
    }
    const observed: TreeNodeClassNameInfo[] = []
    const nodeClassName: TreeNodeClassName = (info) => {
      observed.push(info)

      return undefined
    }

    mount(FlTree, {
      props: {
        data: [rootData],
        nodeClassName
      }
    })

    await nextTick()

    expect(observed).toHaveLength(1)
    expect(observed[0]?.data).toBe(observed[0]?.node.data)
    expect(observed[0]?.data).toMatchObject(rootData)
    expect(observed[0]?.node.key).toBe('root')
    expect(observed[0]?.node.label).toBe('Root')
    expect(observed[0]?.node).not.toHaveProperty('expanded')
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
    expect(
      groups.every((group) =>
        group.element.firstElementChild?.classList.contains('fl-tree__children-inner')
      )
    ).toBe(true)
    expect(items.every((item) => item.find('.fl-tree__item-content').exists())).toBe(true)
    expect(items.every((item) => item.find('.fl-tree__item-icon').exists())).toBe(true)
    expect(items.every((item) => item.find('.fl-tree__item-title').exists())).toBe(true)
  })

  it('继承 Element Plus 视觉变量契约', async () => {
    const treeScss = readProjectFile('packages/theme/src/tree.scss')
    const treeNodeSource = readProjectFile('packages/components/tree/src/tree-node.vue')

    expect(treeScss).toContain("@use 'element-plus/theme-chalk/src/checkbox.scss';")
    expect(treeScss).toContain("@use 'element-plus/theme-chalk/src/tree.scss';")
    expect(treeScss).not.toContain('collapse-transition.scss')
    expect(treeNodeSource).not.toContain('ElCollapseTransition')
    expect(treeNodeSource).toContain('<Transition name="fl-tree-collapse">')
    expect(treeNodeSource).toContain('childrenInnerClassName')
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
    expect(treeScss).toContain('--fl-tree-node-disabled-text-color: var(--el-disabled-text-color);')
    expect(treeScss).toContain('--fl-tree-leaf-dot-color: var(--el-text-color-secondary);')
    expect(treeScss).toContain('--fl-tree-line-color: var(--el-border-color-light, #dcdfe6);')
    expect(treeScss).toContain("&.is-disabled #{bem.selector('tree', 'item-icon')},")
    expect(treeScss).toContain("&.is-disabled #{bem.selector('tree', 'item-title')} {")
    expect(treeScss).toContain('color: var(--fl-tree-node-disabled-text-color);')
    expect(treeScss).toContain('@include bem.e(indent-unit)')
    expect(treeScss).toContain('@include bem.e(switcher-leaf-line)')
    expect(treeScss).toContain('@include bem.e(item-checkbox)')
    expect(treeScss).toContain('@include bem.e(children-inner)')
    expect(treeScss).toContain('--fl-tree-collapse-duration: var(')
    expect(treeScss).toContain('.fl-tree-collapse-enter-active')
    expect(treeScss).toContain('grid-template-rows: 0fr;')
    expect(treeScss).toContain('grid-template-rows: 1fr;')
    expect(treeScss).toContain('@media (prefers-reduced-motion: reduce)')
    expect(treeScss).toContain('&.is-loading')
    expect(treeScss).toContain('animation: rotating 2s linear infinite;')
    expect(treeScss).toContain('@keyframes rotating')
    expect(treeScss).toContain('cursor: pointer;')
    expect(treeScss).toContain('user-select: none;')
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

  it('marks filterTreeNode hits without expanding or changing tree state', async () => {
    const filterTreeNode = vi.fn<TreeFilterTreeNode>((node) => node.label === 'Leaf')
    const wrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData(),
        defaultExpandAll: true,
        filterTreeNode
      }
    })

    await nextTick()

    expect(filterTreeNode).toHaveBeenCalled()
    expect(getItemContent(wrapper, 'Root').classes()).not.toContain('is-filtered')
    expect(getItemContent(wrapper, 'Leaf').classes()).toContain('is-filtered')

    await wrapper.setProps({
      filterTreeNode: ((node: TreeNode) => node.label === 'Branch') satisfies TreeFilterTreeNode
    })
    await nextTick()

    expect(getItemContent(wrapper, 'Branch').classes()).toContain('is-filtered')
    expect(getItemContent(wrapper, 'Leaf').classes()).not.toContain('is-filtered')

    const collapsedWrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData(),
        filterTreeNode: ((node: TreeNode) => node.label === 'Leaf') satisfies TreeFilterTreeNode
      }
    })

    await nextTick()

    expect(collapsedWrapper.text()).not.toContain('Leaf')
    expect(collapsedWrapper.emitted('update:expandedKeys')).toBeUndefined()
    expect(collapsedWrapper.emitted('expand')).toBeUndefined()
  })

  it('supports object showLine and keeps leaf line structure when leaf icons are hidden', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createLineTreeData(),
        showLine: { showLeafIcon: false },
        defaultExpandAll: true
      }
    })

    await nextTick()

    const leafA1Item = findTreeItemByText(wrapper, 'Leaf A1')

    expect(wrapper.get('[role="tree"]').classes()).toContain('is-show-line')
    expect(leafA1Item.find('.fl-tree__switcher-leaf-line').exists()).toBe(true)
    expect(leafA1Item.find('.fl-tree__switcher-leaf-icon').exists()).toBe(false)
    expect(leafA1Item.find('.fl-tree__switcher-dot').exists()).toBe(false)

    await wrapper.setProps({
      showLine: { showLeafIcon: true }
    })
    await nextTick()

    expect(
      findTreeItemByText(wrapper, 'Leaf A1').find('.fl-tree__switcher-leaf-line').exists()
    ).toBe(true)
    expect(
      findTreeItemByText(wrapper, 'Leaf A1').find('.fl-tree__switcher-leaf-icon').exists()
    ).toBe(true)

    await wrapper.setProps({
      showLine: false
    })
    await nextTick()

    expect(wrapper.get('[role="tree"]').classes()).not.toContain('is-show-line')
    expect(
      findTreeItemByText(wrapper, 'Leaf A1').find('.fl-tree__switcher-leaf-line').exists()
    ).toBe(false)
    expect(findTreeItemByText(wrapper, 'Leaf A1').find('.fl-tree__switcher-dot').exists()).toBe(
      true
    )
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
    const treeSource = readProjectFile('packages/components/tree/src/tree.ts')
    const treeTypesSource = readProjectFile('packages/components/tree/src/tree-types.ts')
    const componentsIndexSource = readProjectFile('packages/components/index.ts')
    const globalDts = readProjectFile('packages/falcon-ui/global.d.ts')
    const themeIndex = readProjectFile('packages/theme/index.scss')

    expect(treePackageSource).toContain('"./tree": "./tree/index.ts"')
    expect(treeSource).not.toMatch(/PropType<[^>]*undefined/)
    expect(treeSource).not.toContain('default: undefined')
    expect(treeSource).not.toContain('TreeExpandPayload')
    expect(treeTypesSource).not.toContain('className?: TreeClassValue')
    expect(treeTypesSource).not.toContain('className: TreeClassValue | undefined')
    expect(treeTypesSource).toContain('export interface TreeNodeClassNameInfo')
    expect(treeTypesSource).toContain('export type TreeNodeClassName')
    expect(treeTypesSource).not.toContain('Props = unknown')
    expect(treeTypesSource).not.toContain('TreeSemanticInfo')
    expect(treeTypesSource).not.toContain('TreeSemanticResolver')
    expect(treeTypesSource).not.toContain('TreeClassNames<')
    expect(treeTypesSource).not.toContain('TreeStyles<')
    expect(treeIndexSource).toContain('TreeEmits')
    expect(treeIndexSource).toContain('TreeCheckArgs')
    expect(treeIndexSource).toContain('TreeCheckEvent')
    expect(treeIndexSource).toContain('TreeExpandEvent')
    expect(treeIndexSource).toContain('TreeExpandedNode')
    expect(treeIndexSource).not.toContain('TreeExpandPayload')
    expect(treeIndexSource).toContain('TreeExpose')
    expect(treeIndexSource).toContain('TreeInteractionEvent')
    expect(treeIndexSource).toContain('TreeLoadArgs')
    expect(treeIndexSource).toContain('TreeLoadData')
    expect(treeIndexSource).toContain('TreeLoadEvent')
    expect(treeIndexSource).toContain('TreeAllowDrag')
    expect(treeIndexSource).toContain('TreeAllowDropType')
    expect(treeIndexSource).toContain('TreeNodeDragStartArgs')
    expect(treeIndexSource).toContain('TreeNodeDragTargetArgs')
    expect(treeIndexSource).toContain('TreeNodeDragEndArgs')
    expect(treeIndexSource).toContain('TreeNodeDropArgs')
    expect(treeIndexSource).toContain('TreeNodeDropType')
    expect(treeIndexSource).toContain('TreeAllowDrop')
    expect(treeIndexSource).toContain('TreeSelectEvent')
    expect(treeIndexSource).toContain('TreeNodeDblclickArgs')
    expect(treeIndexSource).toContain('TreeNodeRightClickArgs')
    expect(treeIndexSource).toContain('TreeFilterTreeNode')
    expect(treeIndexSource).toContain('TreeShowLine')
    expect(treeIndexSource).toContain('TreeShowLineOptions')
    expect(treeIndexSource).toContain('TreeNodeModel')
    expect(treeIndexSource).toContain('TreeNodeClassName')
    expect(treeIndexSource).toContain('TreeNodeClassNameInfo')
    expect(treeIndexSource).toContain('TreeNode')
    expect(treeIndexSource).toContain('TreeScrollAlign')
    expect(treeIndexSource).toContain('TreeScrollToOptions')
    expect(treeIndexSource).toContain('TreeSwitcherLoadingIcon')
    expect(treeIndexSource).toContain('TreeSwitcherIconMode')
    expect(treeIndexSource).not.toContain('FlTreeEmits')
    expect(componentsIndexSource).toContain('TreeEmits')
    expect(componentsIndexSource).toContain('TreeCheckArgs')
    expect(componentsIndexSource).toContain('TreeCheckEvent')
    expect(componentsIndexSource).toContain('TreeExpandEvent')
    expect(componentsIndexSource).toContain('TreeExpandedNode')
    expect(componentsIndexSource).not.toContain('TreeExpandPayload')
    expect(componentsIndexSource).toContain('TreeExpose')
    expect(componentsIndexSource).toContain('TreeInteractionEvent')
    expect(componentsIndexSource).toContain('TreeLoadArgs')
    expect(componentsIndexSource).toContain('TreeLoadData')
    expect(componentsIndexSource).toContain('TreeLoadEvent')
    expect(componentsIndexSource).toContain('TreeAllowDrag')
    expect(componentsIndexSource).toContain('TreeAllowDropType')
    expect(componentsIndexSource).toContain('TreeNodeDragStartArgs')
    expect(componentsIndexSource).toContain('TreeNodeDragTargetArgs')
    expect(componentsIndexSource).toContain('TreeNodeDragEndArgs')
    expect(componentsIndexSource).toContain('TreeNodeDropArgs')
    expect(componentsIndexSource).toContain('TreeNodeDropType')
    expect(componentsIndexSource).toContain('TreeAllowDrop')
    expect(componentsIndexSource).toContain('TreeSelectEvent')
    expect(componentsIndexSource).toContain('TreeNodeDblclickArgs')
    expect(componentsIndexSource).toContain('TreeNodeRightClickArgs')
    expect(componentsIndexSource).toContain('TreeFilterTreeNode')
    expect(componentsIndexSource).toContain('TreeShowLine')
    expect(componentsIndexSource).toContain('TreeShowLineOptions')
    expect(componentsIndexSource).toContain('TreeNodeModel')
    expect(componentsIndexSource).toContain('TreeNodeClassName')
    expect(componentsIndexSource).toContain('TreeNodeClassNameInfo')
    expect(componentsIndexSource).toContain('TreeNode')
    expect(componentsIndexSource).toContain('TreeScrollAlign')
    expect(componentsIndexSource).toContain('TreeScrollToOptions')
    expect(componentsIndexSource).toContain('TreeSwitcherLoadingIcon')
    expect(componentsIndexSource).toContain('TreeSwitcherIconMode')
    expect(componentsIndexSource).not.toContain('FlTreeEmits')
    expect(globalDts).toContain('FlTree: typeof FlTree')
    expect(themeIndex).toContain("@use './src/tree.scss';")

    type TreeTypeSmoke = [
      TreeKey,
      TreeProps,
      TreeCheckEvent,
      TreeExpandEvent,
      TreeInteractionEvent,
      TreeLoadEvent,
      TreeAllowDrag,
      TreeAllowDrop,
      TreeAllowDropType,
      TreeNodeDropType,
      TreeSelectEvent,
      TreeNodeDblclickArgs,
      TreeNodeRightClickArgs,
      TreeFilterTreeNode,
      TreeShowLine,
      TreeShowLineOptions,
      TreeScrollAlign,
      TreeScrollToOptions,
      TreeExpose,
      TreeSwitcherLoadingIcon,
      TreeSwitcherIconMode,
      TreeEmits,
      TreeExpandedNode,
      TreeNodeModel,
      TreeNodeClassName,
      TreeNodeClassNameInfo
    ]
    const inferredNodeClassName: TreeProps['nodeClassName'] = ({ node, data }) =>
      node.key === data.key ? 'type-check-node' : undefined
    const inferredClassNames: TreeProps['classNames'] = ({ props }) => ({
      root: props.checkable ? 'type-check-checkable-root' : 'type-check-root',
      item: props.showLine ? 'type-check-line-item' : 'type-check-item'
    })
    const inferredStyles: TreeProps['styles'] = ({ props }) => ({
      root: {
        outlineStyle: props.selectable === false ? 'dashed' : 'solid'
      }
    })
    const treeClassNames: TreeClassNames = ({ props }) => ({
      root: props.multiple ? 'type-check-multiple-root' : 'type-check-single-root'
    })
    const treeStyles: TreeStyles = ({ props }) => ({
      item: {
        outlineStyle: props.disabledKeys ? 'dotted' : 'solid'
      }
    })
    const treeTypeSmoke: TreeTypeSmoke | null = null
    expect(typeof inferredNodeClassName).toBe('function')
    expect(typeof inferredClassNames).toBe('function')
    expect(typeof inferredStyles).toBe('function')
    expect(typeof treeClassNames).toBe('function')
    expect(typeof treeStyles).toBe('function')
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

  it('accordion constrains defaultExpandAll to one expanded node per sibling group', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createAccordionTreeData(),
        defaultExpandAll: true,
        accordion: true
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root A').attributes('aria-expanded')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Root B').attributes('aria-expanded')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Branch B1').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).not.toContain('Branch A1')
    expect(wrapper.text()).toContain('Leaf B1')
  })

  it('accordion constrains defaultExpandParent inherited ancestors', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createAccordionTreeData(),
        defaultExpandedKeys: ['leaf-a1', 'leaf-a2'],
        accordion: true
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root A').attributes('aria-expanded')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Branch A1').attributes('aria-expanded')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Branch A2').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).not.toContain('Leaf A1')
    expect(wrapper.text()).toContain('Leaf A2')
  })

  it('accordion constrains uncontrolled switcher expansion by parentKey siblings', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createAccordionTreeData(),
        accordion: true
      }
    })

    await nextTick()
    await getSwitcherButton(wrapper, 'Root A').trigger('click')
    await nextTick()
    await getSwitcherButton(wrapper, 'Branch A1').trigger('click')
    await nextTick()
    await getSwitcherButton(wrapper, 'Branch A2').trigger('click')
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Branch A1').attributes('aria-expanded')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Branch A2').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).not.toContain('Leaf A1')
    expect(wrapper.text()).toContain('Leaf A2')

    await getSwitcherButton(wrapper, 'Root B').trigger('click')
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root A').attributes('aria-expanded')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Root B').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).not.toContain('Branch A2')
    expect(wrapper.text()).toContain('Branch B1')
  })

  it('accordion constrains controlled update requests without mutating the rendered prop state', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createAccordionTreeData(),
        expandedKeys: ['root-a'],
        accordion: true
      }
    })

    await nextTick()
    await getSwitcherButton(wrapper, 'Root B').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:expandedKeys')).toEqual([[['root-b']]])
    expect(wrapper.emitted('expand')?.[0]?.[0] as TreeExpandEvent).toMatchObject({
      expanded: true,
      key: 'root-b',
      expandedKeys: ['root-b']
    })
    expect(findTreeItemByText(wrapper, 'Root A').attributes('aria-expanded')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Root B').attributes('aria-expanded')).toBe('false')
  })

  it('accordion keeps autoExpandParent ancestor expansion within one root sibling', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createAccordionTreeData(),
        expandedKeys: ['leaf-a1', 'leaf-b1'],
        autoExpandParent: true,
        accordion: true
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root A').attributes('aria-expanded')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Root B').attributes('aria-expanded')).toBe('true')
    expect(findTreeItemByText(wrapper, 'Branch B1').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).not.toContain('Branch A1')
    expect(wrapper.text()).toContain('Leaf B1')
  })

  it('支持通过 `defaultSelectedKeys` 初始化单选状态，并过滤非法与不可选节点', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        disabledKeys: ['disabled-node'],
        unselectableKeys: ['unselectable-node'],
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
        disabledKeys: ['disabled-node'],
        unselectableKeys: ['unselectable-node'],
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

  it('TreeData 中的旧交互字段不会再驱动组件行为', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: [
          {
            key: 'legacy-state-node',
            label: 'Legacy State Node',
            disabled: true,
            selectable: false,
            disableCheckbox: true,
            checkable: false
          }
        ],
        checkable: true,
        defaultSelectedKeys: ['legacy-state-node'],
        defaultCheckedKeys: ['legacy-state-node']
      }
    })

    await nextTick()

    const legacyItem = findTreeItemByText(wrapper, 'Legacy State Node')

    expect(legacyItem.attributes('aria-disabled')).toBeUndefined()
    expect(legacyItem.attributes('aria-selected')).toBe('true')
    expect(legacyItem.attributes('aria-checked')).toBe('true')
    expect(isItemSelected(wrapper, 'Legacy State Node')).toBe(true)
    expect(hasItemCheckbox(wrapper, 'Legacy State Node')).toBe(true)
    expect(isItemCheckboxDisabled(wrapper, 'Legacy State Node')).toBe(false)
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

  it('disabledKeys 与 unselectableKeys 节点点击内容区只保留 `node-click` 观察能力', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        disabledKeys: ['disabled-node'],
        unselectableKeys: ['unselectable-node']
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

  it('多选模式下 disabledKeys 与 unselectableKeys 节点仍不会触发选中状态变更', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        multiple: true,
        disabledKeys: ['disabled-node'],
        unselectableKeys: ['unselectable-node']
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
        disabledKeys: ['disabled-node'],
        disabledCheckboxKeys: ['checkbox-disabled-node'],
        hiddenCheckboxKeys: ['hidden-checkbox-node'],
        checkedKeys: {
          checked: ['active-node', 'checkbox-disabled-node', 'missing-node'],
          halfChecked: ['root', 'hidden-checkbox-node', 'active-node']
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
    expect(hasItemCheckbox(wrapper, 'Hidden Checkbox Node')).toBe(false)
    expect(
      findTreeItemByText(wrapper, 'Hidden Checkbox Node').attributes('aria-checked')
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

  it('disabledKeys 与 disabledCheckboxKeys 会禁用复选框，但保留已勾选视觉并阻止交互', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        checkable: true,
        checkStrictly: true,
        disabledKeys: ['disabled-node'],
        disabledCheckboxKeys: ['checkbox-disabled-node'],
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

  it('默认联动模式下 key-based 禁用、禁用 checkbox 与隐藏 checkbox 边界符合阶段 9 约束', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createCheckConductTreeData(),
        defaultExpandAll: true,
        checkable: true,
        disabledKeys: ['disabled-branch'],
        disabledCheckboxKeys: ['checkbox-disabled-node'],
        hiddenCheckboxKeys: ['hidden-checkbox-bridge'],
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
    expect(hasItemCheckbox(wrapper, 'Hidden Checkbox Bridge')).toBe(false)
    expect(findTreeItemByText(wrapper, 'Hidden Checkbox Bridge').attributes('aria-checked')).toBe(
      undefined
    )
  })

  it('disabled 父节点会阻断向上联动，但不影响禁用分支内部的独立勾选', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createCheckConductTreeData(),
        defaultExpandAll: true,
        checkable: true,
        disabledKeys: ['disabled-branch']
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

  it('树级 `selectable=false` 与勾选能力可共存，hiddenCheckboxKeys 会隐藏复选框并阻止自身勾选', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        selectable: false,
        checkable: true,
        checkStrictly: true,
        hiddenCheckboxKeys: ['hidden-checkbox-node']
      }
    })

    await nextTick()
    await getItemCheckbox(wrapper, 'Active Node').trigger('click')
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-selected')).toBeUndefined()
    expect(
      findTreeItemByText(wrapper, 'Hidden Checkbox Node').attributes('aria-selected')
    ).toBeUndefined()
    expect(hasItemCheckbox(wrapper, 'Hidden Checkbox Node')).toBe(false)
    expect(
      findTreeItemByText(wrapper, 'Hidden Checkbox Node').attributes('aria-checked')
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

  it('right-click emits an isolated node event and updates the active descendant', async () => {
    const eventOrder: string[] = []
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        defaultExpandAll: true,
        onRightClick: () => eventOrder.push('right-click'),
        onNodeClick: () => eventOrder.push('node-click'),
        'onUpdate:selectedKeys': () => eventOrder.push('update:selectedKeys'),
        onSelect: () => eventOrder.push('select'),
        'onUpdate:expandedKeys': () => eventOrder.push('update:expandedKeys')
      }
    })

    await nextTick()
    await getItemContent(wrapper, 'Leaf').trigger('contextmenu')
    await nextTick()

    const rightClickEvents = wrapper.emitted('right-click')
    const [dataArg, nodeArg, componentArg, eventArg] =
      rightClickEvents?.[0] as TreeNodeRightClickArgs

    expect(eventOrder).toEqual(['right-click'])
    expect(rightClickEvents).toHaveLength(1)
    expect(dataArg.key).toBe('leaf')
    expect(nodeArg.key).toBe('leaf')
    expect(componentArg).toBeTruthy()
    expect(eventArg).toBeInstanceOf(MouseEvent)
    expect(getActiveTreeItemLabel(wrapper)).toBe('Leaf')
    expect(wrapper.emitted('node-click')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('update:selectedKeys')).toBeUndefined()
    expect(wrapper.emitted('update:expandedKeys')).toBeUndefined()
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
    expect(expandEvents?.[0]?.[0] as TreeExpandEvent).toMatchObject({
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
    expect(expandEvents?.[0]?.[0] as TreeExpandEvent).toMatchObject({
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

  it('用户展开无 children 的异步节点时触发 loadData，并在成功后同步 loadedKeys', async () => {
    const deferred = createDeferred<TreeData[]>()
    const eventOrder: string[] = []
    const loadData = vi.fn((_node: TreeNode) => deferred.promise)
    const wrapper = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        loadData,
        'onUpdate:expandedKeys': () => eventOrder.push('update:expandedKeys'),
        onNodeExpand: () => eventOrder.push('node-expand'),
        onExpand: () => eventOrder.push('expand'),
        'onUpdate:loadedKeys': () => eventOrder.push('update:loadedKeys'),
        onLoad: () => eventOrder.push('load')
      }
    })

    await nextTick()

    expect(findTreeItemByText(wrapper, 'Async Root').attributes('aria-expanded')).toBe('false')
    expect(findTreeItemByText(wrapper, 'Forced Leaf').attributes('aria-expanded')).toBeUndefined()
    expect(
      findTreeItemByText(wrapper, 'Async Root').find('.fl-tree__switcher-button').exists()
    ).toBe(true)
    expect(
      findTreeItemByText(wrapper, 'Forced Leaf').find('.fl-tree__switcher-button').exists()
    ).toBe(false)

    await getSwitcherButton(wrapper, 'Async Root').trigger('click')
    await nextTick()

    expect(loadData).toHaveBeenCalledTimes(1)
    expect(loadData.mock.calls[0]?.[0]).toMatchObject({
      key: 'async-root',
      label: 'Async Root',
      childNodes: []
    })
    expect(wrapper.findComponent(Loading).exists()).toBe(true)
    expect(eventOrder).toEqual(['update:expandedKeys', 'node-expand', 'expand'])

    await getSwitcherButton(wrapper, 'Async Root').trigger('click')
    await nextTick()

    expect(loadData).toHaveBeenCalledTimes(1)

    deferred.resolve([
      {
        key: 'async-child',
        label: 'Async Child'
      }
    ])
    await flushPromises()
    await nextTick()

    expect(eventOrder).toEqual([
      'update:expandedKeys',
      'node-expand',
      'expand',
      'update:loadedKeys',
      'load'
    ])
    expect(wrapper.emitted('update:loadedKeys')).toEqual([[['async-root']]])

    const loadEvents = wrapper.emitted('load')
    const [loadedKeys, loadEvent] = loadEvents?.[0] as [TreeKey[], TreeLoadEvent]

    expect(loadedKeys).toEqual(['async-root'])
    expect(loadEvent).toMatchObject({
      key: 'async-root',
      loadedKeys: ['async-root'],
      node: {
        key: 'async-root'
      }
    })
    expect(wrapper.findComponent(Loading).exists()).toBe(false)
  })

  it('加载中默认使用 Element Plus Loading，并支持 switcherLoadingIcon 覆盖', async () => {
    const treePropSource = readProjectFile('packages/components/tree/src/tree.ts')
    const defaultDeferred = createDeferred()
    const customDeferred = createDeferred()
    const CustomLoadingIcon: TreeSwitcherLoadingIcon = defineComponent({
      name: 'CustomTreeLoadingIcon',
      setup: () => () => h('span', { class: 'custom-tree-loading-icon' })
    })

    expect(treePropSource).toContain("import { Loading } from '@element-plus/icons-vue'")
    expect(treePropSource).toContain('default: Loading')

    const defaultWrapper = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        loadData: () => defaultDeferred.promise
      }
    })

    await nextTick()
    await getSwitcherButton(defaultWrapper, 'Async Root').trigger('click')
    await nextTick()

    expect(defaultWrapper.findComponent(Loading).exists()).toBe(true)
    expect(defaultWrapper.find('.custom-tree-loading-icon').exists()).toBe(false)

    const customWrapper = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        loadData: () => customDeferred.promise,
        switcherLoadingIcon: CustomLoadingIcon
      }
    })

    await nextTick()
    await getSwitcherButton(customWrapper, 'Async Root').trigger('click')
    await nextTick()

    expect(customWrapper.find('.custom-tree-loading-icon').exists()).toBe(true)
    expect(customWrapper.findComponent(Loading).exists()).toBe(false)
  })

  it('初始展开与受控 expandedKeys 外部变更不会自动触发 loadData', async () => {
    const loadData = vi.fn(() => Promise.resolve())
    const wrapperWithDefaultExpandAll = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        defaultExpandAll: true,
        loadData
      }
    })

    await nextTick()

    expect(wrapperWithDefaultExpandAll.emitted('update:expandedKeys')).toBeUndefined()
    expect(loadData).not.toHaveBeenCalled()

    const wrapperWithDefaultExpandedKeys = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        defaultExpandedKeys: ['async-root'],
        loadData
      }
    })

    await nextTick()

    expect(
      findTreeItemByText(wrapperWithDefaultExpandedKeys, 'Async Root').attributes('aria-expanded')
    ).toBe('true')
    expect(loadData).not.toHaveBeenCalled()

    const wrapperWithControlledExpandedKeys = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        expandedKeys: [],
        loadData
      }
    })

    await nextTick()
    await wrapperWithControlledExpandedKeys.setProps({
      expandedKeys: ['async-root']
    })
    await nextTick()

    expect(
      findTreeItemByText(wrapperWithControlledExpandedKeys, 'Async Root').attributes(
        'aria-expanded'
      )
    ).toBe('true')
    expect(loadData).not.toHaveBeenCalled()
  })

  it('受控 loadedKeys 只请求外部更新，外部回写后不再重复加载', async () => {
    const loadData = vi.fn(() => Promise.resolve())
    const wrapper = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        loadedKeys: [],
        loadData
      }
    })

    await nextTick()
    await getSwitcherButton(wrapper, 'Async Root').trigger('click')
    await flushPromises()
    await nextTick()

    expect(loadData).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('update:loadedKeys')).toEqual([[['async-root']]])
    expect(wrapper.emitted('load')).toHaveLength(1)
    expect(
      findTreeItemByText(wrapper, 'Async Root').find('.fl-tree__switcher-button').exists()
    ).toBe(true)

    await wrapper.setProps({
      loadedKeys: ['async-root']
    })
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Async Root').attributes('aria-expanded')).toBeUndefined()
    expect(
      findTreeItemByText(wrapper, 'Async Root').find('.fl-tree__switcher-button').exists()
    ).toBe(false)
  })

  it('loadData 失败时清理 loading 且不写入 loadedKeys，后续可重试', async () => {
    const firstDeferred = createDeferred()
    const secondDeferred = createDeferred()
    const loadData = vi.fn(() =>
      loadData.mock.calls.length === 1 ? firstDeferred.promise : secondDeferred.promise
    )
    const wrapper = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        loadData
      }
    })

    await nextTick()
    await getSwitcherButton(wrapper, 'Async Root').trigger('click')
    await nextTick()

    expect(wrapper.findComponent(Loading).exists()).toBe(true)

    firstDeferred.reject(new Error('load failed'))
    await flushPromises()
    await nextTick()

    expect(wrapper.findComponent(Loading).exists()).toBe(false)
    expect(wrapper.emitted('update:loadedKeys')).toBeUndefined()
    expect(wrapper.emitted('load')).toBeUndefined()

    await getSwitcherButton(wrapper, 'Async Root').trigger('click')
    await nextTick()
    await getSwitcherButton(wrapper, 'Async Root').trigger('click')
    await nextTick()

    expect(loadData).toHaveBeenCalledTimes(2)

    secondDeferred.resolve(undefined)
    await flushPromises()
    await nextTick()

    expect(wrapper.emitted('update:loadedKeys')).toEqual([[['async-root']]])
    expect(wrapper.emitted('load')).toHaveLength(1)
  })

  it('外部更新 data 后异步子节点进入既有交互、插槽、连线与语义化结构', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        showLine: true,
        checkable: true,
        draggable: true,
        loadData: () => Promise.resolve(),
        classNames: {
          root: 'async-semantic-root',
          item: 'async-semantic-item'
        }
      },
      slots: {
        default: ({ node }: { node: TreeNode }) =>
          h(
            'span',
            {
              class: 'async-slot-node'
            },
            `async-${String(node.key)}`
          )
      }
    })

    await nextTick()
    await getSwitcherButton(wrapper, 'async-async-root').trigger('click')
    await flushPromises()
    await wrapper.setProps({
      data: [
        {
          key: 'async-root',
          label: 'Async Root',
          children: [
            {
              key: 'async-child',
              label: 'Async Child',
              isLeaf: true
            }
          ]
        }
      ]
    })
    await nextTick()

    expect(wrapper.get('[role="tree"]').classes()).toContain('async-semantic-root')
    expect(findTreeItemByText(wrapper, 'async-async-child').classes()).toContain(
      'async-semantic-item'
    )
    expect(
      findTreeItemByText(wrapper, 'async-async-child').find('.fl-tree__switcher-leaf-line').exists()
    ).toBe(true)
    expect(getItemContent(wrapper, 'async-async-child').attributes('draggable')).toBe('true')

    await getItemContent(wrapper, 'async-async-child').trigger('dragstart')
    await nextTick()

    expect(wrapper.emitted('node-drag-start')).toHaveLength(1)

    await getItemContent(wrapper, 'async-async-child').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:selectedKeys')).toEqual([[['async-child']]])
    expect(hasItemCheckbox(wrapper, 'async-async-child')).toBe(true)
    expect(findTreeItemByText(wrapper, 'async-async-child').attributes('aria-checked')).toBe(
      'false'
    )
  })

  it('draggable 关闭时不设置原生拖拽属性且不触发拖拽事件', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        defaultExpandAll: true
      }
    })

    await nextTick()

    expect(getItemContent(wrapper, 'Root').attributes('draggable')).toBeUndefined()

    await getItemContent(wrapper, 'Root').trigger('dragstart')
    await nextTick()

    expect(wrapper.emitted('node-drag-start')).toBeUndefined()
  })

  it('draggable=true 设置原生拖拽属性，allowDrag=false 阻止拖拽开始', async () => {
    const allowDrag: TreeAllowDrag = vi.fn((node) => node.key !== 'leaf')
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        defaultExpandAll: true,
        draggable: true,
        allowDrag
      }
    })

    await nextTick()

    expect(getItemContent(wrapper, 'Root').attributes('draggable')).toBe('true')
    expect(getItemContent(wrapper, 'Leaf').attributes('draggable')).toBe('true')

    await getItemContent(wrapper, 'Leaf').trigger('dragstart')
    await nextTick()

    expect(allowDrag).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('node-drag-start')).toBeUndefined()

    await getItemContent(wrapper, 'Root').trigger('dragstart')
    await nextTick()

    expect(wrapper.emitted('node-drag-start')).toHaveLength(1)
  })

  it('按 Element Plus 顺序触发拖拽事件并先内部重排 data', async () => {
    const eventOrder: string[] = []
    const data: TreeData[] = [
      {
        key: 'root',
        label: 'Root',
        children: [
          {
            key: 'leaf',
            label: 'Leaf'
          }
        ]
      },
      {
        key: 'sibling',
        label: 'Sibling'
      }
    ]
    const wrapper = mount(FlTree, {
      props: {
        data,
        defaultExpandAll: true,
        draggable: true,
        onNodeDragStart: () => eventOrder.push('node-drag-start'),
        onNodeDragEnter: () => eventOrder.push('node-drag-enter'),
        onNodeDragOver: () => eventOrder.push('node-drag-over'),
        onNodeDragEnd: () => eventOrder.push('node-drag-end'),
        onNodeDrop: () => eventOrder.push('node-drop')
      }
    })

    await nextTick()

    const rootContent = setItemContentRect(wrapper, 'Root')
    const siblingContent = setItemContentRect(wrapper, 'Sibling')

    await siblingContent.trigger('dragstart')
    await rootContent.trigger('dragover', { clientY: 50 })
    await rootContent.trigger('drop', { clientY: 50 })
    await siblingContent.trigger('dragend')
    await nextTick()

    const dragStartArgs = wrapper.emitted('node-drag-start')?.[0] as
      | TreeNodeDragStartArgs
      | undefined
    const dragOverArgs = wrapper.emitted('node-drag-over')?.[0] as
      | TreeNodeDragTargetArgs
      | undefined
    const dragEndArgs = wrapper.emitted('node-drag-end')?.[0] as TreeNodeDragEndArgs | undefined
    const dropArgs = wrapper.emitted('node-drop')?.[0] as TreeNodeDropArgs | undefined

    expect(eventOrder).toEqual([
      'node-drag-start',
      'node-drag-enter',
      'node-drag-over',
      'node-drag-end',
      'node-drop'
    ])
    expect(dragStartArgs?.[0].key).toBe('sibling')
    expect(dragStartArgs?.[1].type).toBe('dragstart')
    expect(dragOverArgs?.[0].key).toBe('sibling')
    expect(dragOverArgs?.[1].key).toBe('root')
    expect(dragEndArgs?.[0].key).toBe('sibling')
    expect(dragEndArgs?.[1]?.key).toBe('root')
    expect(dragEndArgs?.[2]).toBe('inner')
    expect(dropArgs?.[0].key).toBe('sibling')
    expect(dropArgs?.[1].key).toBe('root')
    expect(dropArgs?.[2]).toBe('inner')
    expect(data.map((node) => node.key)).toEqual(['root'])
    expect((data[0].children ?? []).map((node) => node.key)).toEqual(['leaf', 'sibling'])
    expect(findTreeItemByText(wrapper, 'Sibling').exists()).toBe(true)
  })

  it('根据目标节点内的鼠标位置生成 before / inner / after 落点并原地重排', async () => {
    const cases: Array<{
      clientY: number
      className: string
      dropType: Exclude<TreeNodeDropType, 'none'>
      data: TreeData[]
      rootOrder: TreeKey[]
      rootChildren: TreeKey[]
    }> = [
      {
        clientY: 10,
        className: 'is-drop-before',
        dropType: 'before',
        data: [
          {
            key: 'root',
            label: 'Root',
            children: [
              {
                key: 'leaf',
                label: 'Leaf'
              }
            ]
          },
          {
            key: 'sibling',
            label: 'Sibling'
          }
        ],
        rootOrder: ['sibling', 'root'],
        rootChildren: ['leaf']
      },
      {
        clientY: 50,
        className: 'is-drop-inside',
        dropType: 'inner',
        data: [
          {
            key: 'root',
            label: 'Root',
            children: [
              {
                key: 'leaf',
                label: 'Leaf'
              }
            ]
          },
          {
            key: 'sibling',
            label: 'Sibling'
          }
        ],
        rootOrder: ['root'],
        rootChildren: ['leaf', 'sibling']
      },
      {
        clientY: 90,
        className: 'is-drop-after',
        dropType: 'after',
        data: [
          {
            key: 'sibling',
            label: 'Sibling'
          },
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
        ],
        rootOrder: ['root', 'sibling'],
        rootChildren: ['leaf']
      }
    ]

    for (const item of cases) {
      const data = item.data
      const wrapper = mount(FlTree, {
        props: {
          data,
          defaultExpandAll: true,
          draggable: true
        }
      })

      await nextTick()

      const rootContent = setItemContentRect(wrapper, 'Root')
      const siblingContent = setItemContentRect(wrapper, 'Sibling')

      await siblingContent.trigger('dragstart')
      await rootContent.trigger('dragover', { clientY: item.clientY })
      await nextTick()

      expect(rootContent.classes()).toContain(item.className)

      await rootContent.trigger('drop', { clientY: item.clientY })
      await siblingContent.trigger('dragend')
      await nextTick()

      const dropArgs = wrapper.emitted('node-drop')?.[0]

      expect(dropArgs?.[2]).toBe(item.dropType)
      expect(data.map((node) => node.key)).toEqual(item.rootOrder)
      expect(
        ((data.find((node) => node.key === 'root')?.children ?? []) as TreeData[]).map(
          (node) => node.key
        )
      ).toEqual(item.rootChildren)
    }
  })

  it('allowDrop=false、自身投放、后代投放和相邻 no-op 都不会触发 node-drop', async () => {
    const allowDrop = vi.fn<TreeAllowDrop>((_draggingNode, _dropNode, type) => type !== 'inner')
    const allowDropWrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        defaultExpandAll: true,
        draggable: true,
        allowDrop
      }
    })

    await nextTick()

    const allowDropRootContent = setItemContentRect(allowDropWrapper, 'Root')
    const allowDropLeafContent = setItemContentRect(allowDropWrapper, 'Leaf')

    await allowDropLeafContent.trigger('dragstart')
    await allowDropRootContent.trigger('dragover', { clientY: 50 })
    await nextTick()

    expect(allowDrop).toHaveBeenCalledTimes(3)
    expect(allowDrop.mock.calls.map((call) => call[2])).toEqual(['prev', 'inner', 'next'])
    expect(allowDrop.mock.calls[0]?.[0].key).toBe('leaf')
    expect(allowDrop.mock.calls[0]?.[1].key).toBe('root')
    expect(allowDropRootContent.classes()).toContain('is-drop-forbidden')

    await allowDropRootContent.trigger('drop', { clientY: 50 })
    await allowDropLeafContent.trigger('dragend')
    await nextTick()

    expect(allowDropWrapper.emitted('node-drop')).toBeUndefined()

    const boundaryData = createSimpleTreeData()
    const boundaryWrapper = mount(FlTree, {
      props: {
        data: boundaryData,
        defaultExpandAll: true,
        draggable: true
      }
    })

    await nextTick()

    const rootContent = setItemContentRect(boundaryWrapper, 'Root')
    const leafContent = setItemContentRect(boundaryWrapper, 'Leaf')

    await rootContent.trigger('dragstart')
    await leafContent.trigger('dragover', { clientY: 50 })
    await leafContent.trigger('drop', { clientY: 50 })
    await rootContent.trigger('dragend')
    await nextTick()

    expect(boundaryWrapper.emitted('node-drop')).toBeUndefined()
    expect(boundaryData.map((node) => node.key)).toEqual(['root'])
    expect((boundaryData[0].children ?? []).map((node) => node.key)).toEqual(['leaf'])

    const noOpData: TreeData[] = [
      {
        key: 'one',
        label: 'One'
      },
      {
        key: 'two',
        label: 'Two'
      }
    ]
    const noOpWrapper = mount(FlTree, {
      props: {
        data: noOpData,
        draggable: true,
        allowDrop: (_draggingNode, _dropNode, type) => type === 'next'
      }
    })

    await nextTick()

    const oneContent = setItemContentRect(noOpWrapper, 'One')
    const twoContent = setItemContentRect(noOpWrapper, 'Two')

    await twoContent.trigger('dragstart')
    await oneContent.trigger('dragover', { clientY: 90 })
    await oneContent.trigger('drop', { clientY: 90 })
    await twoContent.trigger('dragend')
    await nextTick()

    expect(noOpWrapper.emitted('node-drop')).toBeUndefined()
    expect(noOpData.map((node) => node.key)).toEqual(['one', 'two'])
  })

  it('拖拽链路不会误触发点击、选择、勾选或展开事件', async () => {
    const eventOrder: string[] = []
    const data: TreeData[] = [
      {
        key: 'root',
        label: 'Root',
        children: [
          {
            key: 'leaf',
            label: 'Leaf'
          }
        ]
      },
      {
        key: 'sibling',
        label: 'Sibling'
      }
    ]
    const wrapper = mount(FlTree, {
      props: {
        data,
        defaultExpandAll: true,
        checkable: true,
        draggable: true,
        onNodeDragStart: () => eventOrder.push('node-drag-start'),
        onNodeDragOver: () => eventOrder.push('node-drag-over'),
        onNodeDrop: () => eventOrder.push('node-drop'),
        onNodeDragEnd: () => eventOrder.push('node-drag-end'),
        onNodeClick: () => eventOrder.push('node-click'),
        onSelect: () => eventOrder.push('select'),
        onCheck: () => eventOrder.push('check'),
        onNodeExpand: () => eventOrder.push('node-expand')
      }
    })

    await nextTick()

    const rootContent = setItemContentRect(wrapper, 'Root')
    const siblingContent = setItemContentRect(wrapper, 'Sibling')

    await siblingContent.trigger('dragstart')
    await rootContent.trigger('dragover', { clientY: 50 })
    await rootContent.trigger('drop', { clientY: 50 })
    await siblingContent.trigger('dragend')
    await nextTick()

    expect(eventOrder).toEqual(['node-drag-start', 'node-drag-over', 'node-drag-end', 'node-drop'])
    expect(wrapper.emitted('node-click')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('check')).toBeUndefined()
    expect(wrapper.emitted('node-expand')).toBeUndefined()
  })

  it('根容器可聚焦，并通过 aria-activedescendant 指向内部活动节点', async () => {
    const selectedWrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        disabledKeys: ['disabled-node'],
        defaultSelectedKeys: ['active-node']
      }
    })

    await nextTick()

    const tree = selectedWrapper.get('[role="tree"]')
    const activeItem = findTreeItemByText(selectedWrapper, 'Active Node')
    const disabledItem = findTreeItemByText(selectedWrapper, 'Disabled Node')

    expect(tree.attributes('tabindex')).toBe('0')
    expect(tree.attributes('aria-activedescendant')).toBe(activeItem.attributes('id'))
    expect(getItemContent(selectedWrapper, 'Active Node').classes()).toContain('is-focused')
    expect(disabledItem.attributes('aria-disabled')).toBe('true')

    const customTabIndexWrapper = mount(FlTree, {
      attrs: {
        tabindex: '-1'
      },
      props: {
        data: createSimpleTreeData()
      }
    })

    await nextTick()

    expect(customTabIndexWrapper.get('[role="tree"]').attributes('tabindex')).toBe('-1')

    const mixedKeyWrapper = mount(FlTree, {
      props: {
        data: [
          {
            key: 1,
            label: 'Number key'
          },
          {
            key: '1',
            label: 'String key'
          }
        ]
      }
    })

    await nextTick()

    expect(findTreeItemByText(mixedKeyWrapper, 'Number key').attributes('id')).not.toBe(
      findTreeItemByText(mixedKeyWrapper, 'String key').attributes('id')
    )
  })

  it('方向键只在展开态下的可见节点间移动焦点', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData(),
        defaultExpandedKeys: ['root']
      }
    })

    await nextTick()

    const tree = wrapper.get('[role="tree"]')

    expect(getActiveTreeItemLabel(wrapper)).toBe('Root')

    await tree.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(getActiveTreeItemLabel(wrapper)).toBe('Branch')
    expect(wrapper.text()).not.toContain('Leaf')

    await tree.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(getActiveTreeItemLabel(wrapper)).toBe('Branch')

    await tree.trigger('keydown', { key: 'ArrowUp' })
    await nextTick()

    expect(getActiveTreeItemLabel(wrapper)).toBe('Root')
  })

  it('左右键可展开、收起并在父子节点之间移动焦点', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createNestedTreeData()
      }
    })

    await nextTick()

    const tree = wrapper.get('[role="tree"]')

    await tree.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-expanded')).toBe('true')
    expect(getActiveTreeItemLabel(wrapper)).toBe('Root')

    await tree.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(getActiveTreeItemLabel(wrapper)).toBe('Branch')

    await tree.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Branch').attributes('aria-expanded')).toBe('true')
    expect(getActiveTreeItemLabel(wrapper)).toBe('Branch')

    await tree.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(getActiveTreeItemLabel(wrapper)).toBe('Leaf')

    await tree.trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()

    expect(getActiveTreeItemLabel(wrapper)).toBe('Branch')

    await tree.trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()

    expect(findTreeItemByText(wrapper, 'Branch').attributes('aria-expanded')).toBe('false')
    expect(getActiveTreeItemLabel(wrapper)).toBe('Branch')

    await tree.trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()

    expect(getActiveTreeItemLabel(wrapper)).toBe('Root')
  })

  it('Enter 复用节点内容点击语义，并保持禁用节点边界', async () => {
    const selectedEventOrder: string[] = []
    const selectedWrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        defaultSelectedKeys: ['active-node'],
        disabledKeys: ['disabled-node'],
        onNodeClick: () => selectedEventOrder.push('node-click'),
        'onUpdate:selectedKeys': () => selectedEventOrder.push('update:selectedKeys'),
        onSelect: () => selectedEventOrder.push('select')
      }
    })

    await nextTick()

    await selectedWrapper.get('[role="tree"]').trigger('keydown', { key: 'Enter' })
    await nextTick()

    const nodeClickArgs = selectedWrapper.emitted('node-click')?.[0]
    const selectEvent = selectedWrapper.emitted('select')?.[0]?.[1] as TreeSelectEvent

    expect(selectedEventOrder).toEqual(['node-click', 'update:selectedKeys', 'select'])
    expect(nodeClickArgs?.[2]).toBeNull()
    expect(nodeClickArgs?.[3]).toBeInstanceOf(KeyboardEvent)
    expect(selectEvent.event).toBeInstanceOf(KeyboardEvent)
    expect(selectEvent.selected).toBe(false)

    const disabledEventOrder: string[] = []
    const disabledWrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        disabledKeys: ['disabled-node'],
        onNodeClick: () => disabledEventOrder.push('node-click'),
        'onUpdate:selectedKeys': () => disabledEventOrder.push('update:selectedKeys'),
        onSelect: () => disabledEventOrder.push('select')
      }
    })

    await nextTick()

    const disabledTree = disabledWrapper.get('[role="tree"]')

    await disabledTree.trigger('keydown', { key: 'ArrowDown' })
    await disabledTree.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(getActiveTreeItemLabel(disabledWrapper)).toBe('Disabled Node')
    expect(disabledEventOrder).toEqual(['node-click'])
    expect(disabledWrapper.emitted('select')).toBeUndefined()
    expect(disabledWrapper.emitted('update:selectedKeys')).toBeUndefined()
  })

  it('Space 在 checkable 树中切换勾选，非 checkable 树中切换选择', async () => {
    const checkableEventOrder: string[] = []
    const checkableWrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        defaultSelectedKeys: ['active-node'],
        checkable: true,
        disabledKeys: ['disabled-node'],
        onNodeClick: () => checkableEventOrder.push('node-click'),
        onSelect: () => checkableEventOrder.push('select'),
        'onUpdate:checkedKeys': () => checkableEventOrder.push('update:checkedKeys'),
        onCheck: () => checkableEventOrder.push('check')
      }
    })

    await nextTick()

    await checkableWrapper.get('[role="tree"]').trigger('keydown', { key: ' ' })
    await nextTick()

    const checkEvent = checkableWrapper.emitted('check')?.[0]?.[1] as TreeCheckEvent

    expect(checkableEventOrder).toEqual(['update:checkedKeys', 'check'])
    expect(checkEvent.event).toBeInstanceOf(KeyboardEvent)
    expect(checkEvent.checked).toBe(true)
    expect(findTreeItemByText(checkableWrapper, 'Active Node').attributes('aria-checked')).toBe(
      'true'
    )
    expect(checkableWrapper.emitted('select')).toBeUndefined()
    expect(checkableWrapper.emitted('node-click')).toBeUndefined()

    const disabledWrapper = mount(FlTree, {
      props: {
        data: createSelectionBoundaryTreeData(),
        defaultExpandAll: true,
        checkable: true,
        disabledKeys: ['disabled-node']
      }
    })

    await nextTick()

    const disabledTree = disabledWrapper.get('[role="tree"]')

    await disabledTree.trigger('keydown', { key: 'ArrowDown' })
    await disabledTree.trigger('keydown', { key: ' ' })
    await nextTick()

    expect(getActiveTreeItemLabel(disabledWrapper)).toBe('Disabled Node')
    expect(disabledWrapper.emitted('check')).toBeUndefined()
    expect(disabledWrapper.emitted('select')).toBeUndefined()
    expect(disabledWrapper.emitted('node-click')).toBeUndefined()

    const selectableWrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData()
      }
    })

    await nextTick()

    await selectableWrapper.get('[role="tree"]').trigger('keydown', { key: ' ' })
    await nextTick()

    expect(selectableWrapper.emitted('node-click')).toHaveLength(1)
    expect(selectableWrapper.emitted('select')).toHaveLength(1)
    expect(findTreeItemByText(selectableWrapper, 'Root').attributes('aria-selected')).toBe('true')
  })

  it('键盘展开异步节点时触发 loadData 且焦点保持在当前节点', async () => {
    const deferred = createDeferred()
    const loadData = vi.fn(() => deferred.promise)
    const wrapper = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        loadData
      }
    })

    await nextTick()

    const tree = wrapper.get('[role="tree"]')

    expect(getActiveTreeItemLabel(wrapper)).toBe('Async Root')

    await tree.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(loadData).toHaveBeenCalledTimes(1)
    expect(findTreeItemByText(wrapper, 'Async Root').attributes('aria-expanded')).toBe('true')
    expect(getActiveTreeItemLabel(wrapper)).toBe('Async Root')
    expect(getItemContent(wrapper, 'Async Root').classes()).toContain('is-focused')
  })

  it('default 插槽、showLine、拖拽与语义化样式不会破坏键盘焦点态', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createLineTreeData(),
        defaultExpandAll: true,
        showLine: true,
        checkable: true,
        draggable: true,
        classNames: {
          root: 'keyboard-semantic-root',
          item: 'keyboard-semantic-item'
        },
        styles: {
          item: {
            minHeight: '28px'
          }
        }
      },
      slots: {
        default: ({ node }: { node: TreeNode }) => h('span', `custom-${node.label}`)
      }
    })

    await nextTick()

    const tree = wrapper.get('[role="tree"]')
    const rootAContent = getItemContent(wrapper, 'custom-Root A')

    expect(tree.classes()).toContain('keyboard-semantic-root')
    expect(findTreeItemByText(wrapper, 'custom-Root A').classes()).toContain(
      'keyboard-semantic-item'
    )
    expect(rootAContent.classes()).toContain('is-focused')
    expect(rootAContent.classes()).toContain('is-line-mode')
    expect(rootAContent.classes()).toContain('is-draggable')
    expect(getSwitcherButton(wrapper, 'custom-Root A').attributes('tabindex')).toBe('-1')

    await tree.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(getActiveTreeItemLabel(wrapper)).toBe('custom-Branch A')
    expect(getItemContent(wrapper, 'custom-Branch A').classes()).toContain('is-focused')
  })

  it('节点内容区双击会派发 dblclick，并复用展开和异步加载链路', async () => {
    const eventOrder: string[] = []
    const deferred = createDeferred()
    const loadData = vi.fn(() => deferred.promise)
    const wrapper = mount(FlTree, {
      props: {
        data: createAsyncTreeData(),
        loadData,
        onDblclick: () => eventOrder.push('dblclick'),
        'onUpdate:expandedKeys': () => eventOrder.push('update:expandedKeys'),
        onNodeExpand: () => eventOrder.push('node-expand'),
        onExpand: () => eventOrder.push('expand')
      }
    })

    await nextTick()

    await getItemContent(wrapper, 'Async Root').trigger('dblclick')
    await nextTick()

    const dblclickArgs = wrapper.emitted('dblclick')?.[0] as TreeNodeDblclickArgs | undefined

    expect(eventOrder).toEqual(['dblclick', 'update:expandedKeys', 'node-expand', 'expand'])
    expect(dblclickArgs?.[1].key).toBe('async-root')
    expect(dblclickArgs?.[2]).not.toBeNull()
    expect(dblclickArgs?.[3]).toBeInstanceOf(MouseEvent)
    expect(loadData).toHaveBeenCalledTimes(1)
    expect(findTreeItemByText(wrapper, 'Async Root').attributes('aria-expanded')).toBe('true')
    expect(getActiveTreeItemLabel(wrapper)).toBe('Async Root')

    await getItemContent(wrapper, 'Async Root').trigger('dblclick')
    await nextTick()

    expect(wrapper.emitted('dblclick')).toHaveLength(2)
    expect(loadData).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('node-collapse')).toBeUndefined()
  })

  it('双击叶子节点、switcher 或 checkbox 不会误触发展开链路', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData(),
        defaultExpandAll: true,
        checkable: true
      }
    })

    await nextTick()

    await getItemContent(wrapper, 'Leaf').trigger('dblclick')
    await getSwitcherButton(wrapper, 'Root').trigger('dblclick')
    await getItemCheckbox(wrapper, 'Leaf').trigger('dblclick')
    await nextTick()

    expect(wrapper.emitted('dblclick')).toHaveLength(1)
    expect((wrapper.emitted('dblclick')?.[0] as TreeNodeDblclickArgs | undefined)?.[1].key).toBe(
      'leaf'
    )
    expect(wrapper.emitted('node-expand')).toBeUndefined()
    expect(wrapper.emitted('node-collapse')).toBeUndefined()
    expect(wrapper.emitted('check')).toBeUndefined()
  })

  it('双击只触发一次单击选择结果，不会把选中态切换两次', async () => {
    const wrapper = mount(FlTree, {
      props: {
        data: createSimpleTreeData()
      }
    })

    await nextTick()

    const rootContent = getItemContent(wrapper, 'Root')

    rootContent.element.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        detail: 1
      })
    )
    rootContent.element.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        detail: 2
      })
    )
    await rootContent.trigger('dblclick')
    await nextTick()

    expect(wrapper.emitted('node-click')).toHaveLength(1)
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('dblclick')).toHaveLength(1)
    expect(isItemSelected(wrapper, 'Root')).toBe(true)
    expect(findTreeItemByText(wrapper, 'Root').attributes('aria-expanded')).toBe('true')
  })

  it('scrollTo 根据最近可滚动祖先执行 top、bottom、auto 与 offset 定位', async () => {
    const scrollHost = document.createElement('div')
    scrollHost.style.overflowY = 'auto'
    document.body.appendChild(scrollHost)

    Object.defineProperty(scrollHost, 'clientHeight', {
      configurable: true,
      value: 100
    })
    Object.defineProperty(scrollHost, 'scrollHeight', {
      configurable: true,
      value: 500
    })
    Object.defineProperty(scrollHost, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        top: 10,
        bottom: 110,
        left: 0,
        right: 300,
        width: 300,
        height: 100,
        x: 0,
        y: 10,
        toJSON: () => ({})
      })
    })

    const wrapper = mount(FlTree, {
      attachTo: scrollHost,
      props: {
        data: createSimpleTreeData(),
        defaultExpandAll: true
      }
    })

    await nextTick()

    const treeExpose = wrapper.vm as unknown as TreeExpose
    const leafContent = setItemContentRect(wrapper, 'Leaf', {
      top: 210,
      height: 20
    })

    expect(typeof treeExpose.scrollTo).toBe('function')

    treeExpose.scrollTo({
      key: 'leaf',
      align: 'top',
      offset: 10
    })

    expect(scrollHost.scrollTop).toBe(190)

    scrollHost.scrollTop = 0
    treeExpose.scrollTo({
      key: 'leaf',
      align: 'bottom',
      offset: 5
    })

    expect(scrollHost.scrollTop).toBe(125)

    scrollHost.scrollTop = 33
    Object.defineProperty(leafContent.element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        top: 30,
        bottom: 50,
        left: 0,
        right: 240,
        width: 240,
        height: 20,
        x: 0,
        y: 30,
        toJSON: () => ({})
      })
    })

    treeExpose.scrollTo({
      key: 'leaf'
    })

    expect(scrollHost.scrollTop).toBe(33)

    scrollHost.remove()
  })

  it('scrollTo 在没有局部滚动祖先时回退页面滚动容器', async () => {
    const wrapper = mount(FlTree, {
      attachTo: document.body,
      props: {
        data: createSimpleTreeData(),
        defaultExpandAll: true
      }
    })

    await nextTick()

    const pageScroller = document.scrollingElement ?? document.documentElement

    pageScroller.scrollTop = 0
    setItemContentRect(wrapper, 'Leaf', {
      top: 900,
      height: 20
    })
    ;(wrapper.vm as unknown as TreeExpose).scrollTo({
      key: 'leaf',
      align: 'top'
    })

    expect(pageScroller.scrollTop).toBe(900)
  })

  it('scrollTo 对非法 key、折叠子树和已移除节点保持 no-op', async () => {
    const scrollHost = document.createElement('div')
    scrollHost.style.overflowY = 'auto'
    document.body.appendChild(scrollHost)

    Object.defineProperty(scrollHost, 'clientHeight', {
      configurable: true,
      value: 100
    })
    Object.defineProperty(scrollHost, 'scrollHeight', {
      configurable: true,
      value: 500
    })
    Object.defineProperty(scrollHost, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        top: 0,
        bottom: 100,
        left: 0,
        right: 300,
        width: 300,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({})
      })
    })

    const wrapper = mount(FlTree, {
      attachTo: scrollHost,
      props: {
        data: createSimpleTreeData()
      }
    })

    await nextTick()

    const treeExpose = wrapper.vm as unknown as TreeExpose

    scrollHost.scrollTop = 42
    treeExpose.scrollTo({
      key: 'missing'
    })
    treeExpose.scrollTo({
      key: 'leaf'
    })

    expect(scrollHost.scrollTop).toBe(42)

    await getSwitcherButton(wrapper, 'Root').trigger('click')
    await nextTick()

    setItemContentRect(wrapper, 'Leaf', {
      top: 180,
      height: 20
    })
    scrollHost.scrollTop = 0
    treeExpose.scrollTo({
      key: 'leaf',
      align: 'top'
    })

    expect(scrollHost.scrollTop).toBe(180)

    await wrapper.setProps({
      data: [
        {
          key: 'root',
          label: 'Root'
        }
      ]
    })
    await nextTick()

    scrollHost.scrollTop = 50
    treeExpose.scrollTo({
      key: 'leaf',
      align: 'top'
    })

    expect(scrollHost.scrollTop).toBe(50)

    scrollHost.remove()
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
