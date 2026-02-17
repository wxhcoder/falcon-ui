import { onMounted, ref, watch } from 'vue'

const STORAGE_KEY = 'falcon-play-theme'
const DEFAULT_PRIMARY = '#409eff'
const DEFAULT_RADIUS = 4

type ThemeSnapshot = {
  borderRadius: number
  primaryColor: string
}

type Rgb = {
  b: number
  g: number
  r: number
}

const normalizeHex = (hex: string): string | null => {
  const raw = hex.trim().toLowerCase()
  const value = raw.startsWith('#') ? raw.slice(1) : raw
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(value)) return null
  if (value.length === 3) {
    return `#${value
      .split('')
      .map((ch) => `${ch}${ch}`)
      .join('')}`
  }
  return `#${value}`
}

const toRgb = (hex: string): Rgb | null => {
  const normalized = normalizeHex(hex)
  if (!normalized) return null
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16)
  }
}

const toHex = ({ b, g, r }: Rgb): string =>
  `#${[r, g, b]
    .map((value) =>
      Math.max(0, Math.min(255, Math.round(value)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`

const mixColor = (from: Rgb, to: Rgb, weight: number): string =>
  toHex({
    r: from.r + (to.r - from.r) * weight,
    g: from.g + (to.g - from.g) * weight,
    b: from.b + (to.b - from.b) * weight
  })

const setCssVar = (name: string, value: string) => {
  document.documentElement.style.setProperty(name, value)
}

const readStorage = (): ThemeSnapshot | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ThemeSnapshot>
    if (
      typeof parsed.primaryColor !== 'string' ||
      typeof parsed.borderRadius !== 'number' ||
      Number.isNaN(parsed.borderRadius)
    ) {
      return null
    }
    return {
      primaryColor: parsed.primaryColor,
      borderRadius: parsed.borderRadius
    }
  } catch {
    return null
  }
}

const writeStorage = (snapshot: ThemeSnapshot) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

const applyTheme = (primaryColor: string, borderRadius: number) => {
  const primary = toRgb(primaryColor)
  if (!primary) return

  const white = { r: 255, g: 255, b: 255 }
  const black = { r: 0, g: 0, b: 0 }

  setCssVar('--el-color-primary', toHex(primary))
  setCssVar('--el-color-primary-rgb', `${primary.r}, ${primary.g}, ${primary.b}`)
  for (let index = 1; index <= 9; index += 1) {
    setCssVar(`--el-color-primary-light-${index}`, mixColor(primary, white, index * 0.1))
  }
  setCssVar('--el-color-primary-dark-2', mixColor(primary, black, 0.2))

  const radius = Math.max(2, Math.round(borderRadius))
  setCssVar('--el-border-radius-base', `${radius}px`)
  setCssVar('--el-border-radius-small', `${Math.max(2, radius - 2)}px`)
  setCssVar('--el-border-radius-round', `${Math.max(4, radius * 5)}px`)

  // Keep Falcon extension tokens aligned for the wrapper demos.
  setCssVar('--fl-radius-md', `${radius}px`)
  setCssVar('--fl-radius-sm', `${Math.max(2, radius - 2)}px`)

  // Sync play shell accent with current primary color.
  setCssVar('--play-accent', toHex(primary))
}

export const useElementTheme = () => {
  const primaryColor = ref(DEFAULT_PRIMARY)
  const borderRadius = ref(DEFAULT_RADIUS)
  const isReady = ref(false)

  const resetTheme = () => {
    primaryColor.value = DEFAULT_PRIMARY
    borderRadius.value = DEFAULT_RADIUS
  }

  onMounted(() => {
    const snapshot = readStorage()
    if (snapshot) {
      primaryColor.value = snapshot.primaryColor
      borderRadius.value = snapshot.borderRadius
    }
    isReady.value = true
    applyTheme(primaryColor.value, borderRadius.value)
  })

  watch([primaryColor, borderRadius], ([nextPrimary, nextRadius]) => {
    if (!isReady.value) return
    applyTheme(nextPrimary, nextRadius)
    writeStorage({
      primaryColor: nextPrimary,
      borderRadius: nextRadius
    })
  })

  return {
    borderRadius,
    primaryColor,
    resetTheme
  }
}
