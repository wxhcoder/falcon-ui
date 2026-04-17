import { enableAutoUnmount, mount } from '@vue/test-utils'
import { CaretBottom } from '@element-plus/icons-vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import FlTree, {
  FlTree as FlTreeFromTreePackage,
  type FlTreeKey,
  type FlTreeProps
} from '@falcon-ui/components/tree'
import { FlTree as FlTreeFromComponents } from '@falcon-ui/components'
import FalconUI, { install as installFalconUI } from '@falcon-ui/falcon-ui'

enableAutoUnmount(afterEach)

/**
 * 阶段 1 只验证基础渲染、字段映射、递归骨架、视觉变量来源和最小导出链路。
 * 本文件不覆盖阶段 2 及以后能力。
 */
describe('FlTree 阶段 1 契约', () => {
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

  it('使用默认字段映射渲染树数据', async () => {
    const wrapper = mount(FlTree, {
      props: {
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
          }
        ]
      }
    })

    await nextTick()

    const tree = wrapper.get('[role="tree"]')
    const items = wrapper.findAll('.fl-tree__item')

    expect(tree.classes()).toContain('fl-tree')
    expect(items).toHaveLength(2)
    expect(wrapper.text()).toContain('Root')
    expect(wrapper.text()).toContain('Leaf')
    expect(wrapper.findComponent(CaretBottom).exists()).toBe(true)
    expect(wrapper.find('.fl-tree__switcher-dot').exists()).toBe(true)
    expect(items[0]?.attributes('aria-level')).toBe('1')
    expect(items[1]?.attributes('aria-level')).toBe('2')
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
        }
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
              }
            ]
          }
        ]
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

  it('继承阶段 1 的 Element Plus 视觉变量契约', async () => {
    const treeScss = readProjectFile('packages/theme/src/tree.scss')

    expect(treeScss).toContain("@use 'element-plus/theme-chalk/src/tree.scss';")
    expect(treeScss).toContain('--fl-tree-node-content-height: var(--el-tree-node-content-height);')
    expect(treeScss).toContain('--fl-tree-node-hover-bg-color: var(--el-tree-node-hover-bg-color);')
    expect(treeScss).toContain('--fl-tree-node-text-color: var(--el-tree-text-color);')
    expect(treeScss).toContain('--fl-tree-node-icon-color: var(--el-tree-expand-icon-color);')
    expect(treeScss).toContain('--fl-tree-leaf-dot-color: var(--el-text-color-secondary);')

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

  it('暴露最小可用导出链路', async () => {
    const componentsTreeModule = await import('@falcon-ui/components/tree')
    const componentsModule = await import('@falcon-ui/components')
    const falconUiModule = await import('@falcon-ui/falcon-ui')
    await import('../../../../packages/theme/index.scss')

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
    const globalDts = readProjectFile('packages/falcon-ui/global.d.ts')
    const themeIndex = readProjectFile('packages/theme/index.scss')

    expect(treePackageSource).toContain('"./tree": "./tree/index.ts"')
    expect(globalDts).toContain('FlTree: typeof FlTree')
    expect(themeIndex).toContain("@use './src/tree.scss';")

    type TreeTypeSmoke = [FlTreeKey, FlTreeProps]
    const treeTypeSmoke: TreeTypeSmoke | null = null
    expect(treeTypeSmoke).toBeNull()
  })

  it('浣跨敤 bem 宸ュ叿缁熶竴鐢熸垚鏍戠粍浠跺熀纭€绫诲悕', () => {
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
})
