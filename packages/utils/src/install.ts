import type { App, Plugin } from 'vue'

export type SFCWithInstall<T> = T & Plugin

export const withInstall = <T extends { name?: string }>(component: T): SFCWithInstall<T> => {
  const installable = component as SFCWithInstall<T>

  installable.install = (app: App) => {
    if (!component.name) {
      return
    }

    app.component(component.name, component as unknown as object)
  }

  return installable
}
