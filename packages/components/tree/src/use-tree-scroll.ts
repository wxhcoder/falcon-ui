import type { ComputedRef } from 'vue'
import type { TreeIndex, TreeKey, TreeScrollToOptions } from './tree'

interface UseTreeScrollStateOptions {
  treeIndex: ComputedRef<TreeIndex>
}

const scrollableOverflowPattern = /(auto|scroll|overlay)/

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const isPageScrollContainer = (element: HTMLElement) =>
  element === document.scrollingElement ||
  element === document.documentElement ||
  element === document.body

const getPageViewportRect = () => {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight

  return {
    top: 0,
    bottom: viewportHeight
  }
}

const getContainerRect = (container: HTMLElement) => {
  if (isPageScrollContainer(container)) {
    return getPageViewportRect()
  }

  const rect = container.getBoundingClientRect()

  return {
    top: rect.top,
    bottom: rect.bottom
  }
}

const isScrollableElement = (element: HTMLElement) => {
  const style = window.getComputedStyle(element)
  const overflowY = style.overflowY || style.overflow

  return scrollableOverflowPattern.test(overflowY) && element.scrollHeight > element.clientHeight
}

const getPageScrollContainer = () =>
  (document.scrollingElement as HTMLElement | null) ?? document.documentElement

const findScrollContainer = (element: HTMLElement) => {
  let currentElement = element.parentElement

  while (currentElement) {
    if (isScrollableElement(currentElement)) {
      return currentElement
    }

    currentElement = currentElement.parentElement
  }

  return getPageScrollContainer()
}

const resolveAlignedScrollTop = ({
  align,
  container,
  offset,
  target
}: {
  align: NonNullable<TreeScrollToOptions['align']>
  container: HTMLElement
  offset: number
  target: HTMLElement
}) => {
  const containerRect = getContainerRect(container)
  const targetRect = target.getBoundingClientRect()

  if (align === 'top') {
    return container.scrollTop + targetRect.top - containerRect.top - offset
  }

  if (align === 'bottom') {
    return container.scrollTop + targetRect.bottom - containerRect.bottom + offset
  }

  if (targetRect.top < containerRect.top + offset) {
    return container.scrollTop + targetRect.top - containerRect.top - offset
  }

  if (targetRect.bottom > containerRect.bottom - offset) {
    return container.scrollTop + targetRect.bottom - containerRect.bottom + offset
  }

  return container.scrollTop
}

/**
 * FlTree 阶段 17 的滚动定位状态层：
 * 1. 只注册当前已经渲染的节点内容区元素
 * 2. 自动寻找最近可滚动祖先，找不到时回退页面滚动容器
 * 3. 不改变展开状态，也不要求 Tree 根节点成为固定高度滚动容器
 */
export const useTreeScrollState = ({ treeIndex }: UseTreeScrollStateOptions) => {
  const nodeElementMap = new Map<TreeKey, HTMLElement>()

  const registerNodeElement = (nodeKey: TreeKey, element: HTMLElement | null) => {
    if (!element) {
      nodeElementMap.delete(nodeKey)
      return
    }

    nodeElementMap.set(nodeKey, element)
  }

  const unregisterNodeElement = (nodeKey: TreeKey, element: HTMLElement | null) => {
    if (!element || nodeElementMap.get(nodeKey) === element) {
      nodeElementMap.delete(nodeKey)
    }
  }

  const scrollTo = ({ key, align = 'auto', offset = 0 }: TreeScrollToOptions) => {
    if (!isBrowser() || !treeIndex.value.keyNodeMap.has(key)) {
      return
    }

    const targetElement = nodeElementMap.get(key)

    if (!targetElement) {
      return
    }

    const scrollContainer = findScrollContainer(targetElement)
    const nextScrollTop = resolveAlignedScrollTop({
      align,
      container: scrollContainer,
      offset,
      target: targetElement
    })

    scrollContainer.scrollTop = nextScrollTop
  }

  return {
    registerNodeElement,
    scrollTo,
    unregisterNodeElement
  }
}
