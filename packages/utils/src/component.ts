type ExposedTarget = {
  exposed?: Record<string, unknown> | null
} | null

export const mergeComponentExpose = (
  vm: ExposedTarget,
  exposed: unknown,
  extras: Record<string, unknown> = {}
) => {
  if (!vm?.exposed || !exposed || (typeof exposed !== 'object' && typeof exposed !== 'function')) {
    return
  }

  Object.assign(vm.exposed, extras, exposed)
}

export const invokeListener = (listener: unknown, ...args: unknown[]) => {
  if (typeof listener === 'function') {
    listener(...args)
    return
  }

  if (!Array.isArray(listener)) {
    return
  }

  for (const item of listener) {
    if (typeof item === 'function') {
      item(...args)
    }
  }
}
