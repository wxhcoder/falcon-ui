export interface RadialMenuItemLayoutOptions {
  count: number
  index: number
  radius: number
  startAngle?: number
}

export interface RadialMenuItemLayout {
  angle: number
  x: number
  y: number
}

export interface RadialMenuSectorPathOptions {
  activeIndex: number
  count: number
  innerRadius: number
  outerRadius: number
  startAngle?: number
}

export interface RadialMenuTrackArcPathOptions {
  activeIndex: number
  count: number
  radius: number
  innerRadius?: number
  startAngle?: number
}

export type RadialMenuTipPlacement = 'left' | 'right' | 'top' | 'bottom'

const toRadians = (degree: number) => (degree * Math.PI) / 180

const pointOnCircle = (radius: number, angle: number) => {
  const radians = toRadians(angle)

  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius
  }
}

const getRadialMenuActiveAngles = ({
  activeIndex,
  count,
  startAngle = -90
}: Pick<RadialMenuSectorPathOptions, 'activeIndex' | 'count' | 'startAngle'>) => {
  const safeCount = Math.max(count, 1)
  const sectorAngle = 360 / safeCount
  const gap = Math.min(6, sectorAngle / 4)
  const centerAngle = startAngle + sectorAngle * activeIndex
  const start = centerAngle - sectorAngle / 2 + gap
  const end = centerAngle + sectorAngle / 2 - gap

  return {
    start,
    end,
    largeArcFlag: end - start > 180 ? 1 : 0
  }
}

export const getRadialMenuItemLayout = ({
  count,
  index,
  radius,
  startAngle = -90
}: RadialMenuItemLayoutOptions): RadialMenuItemLayout => {
  const safeCount = Math.max(count, 1)
  const angle = startAngle + (360 / safeCount) * index
  const point = pointOnCircle(radius, angle)

  return {
    angle,
    x: point.x,
    y: point.y
  }
}

export const getRadialMenuSectorPath = ({
  activeIndex,
  count,
  innerRadius,
  outerRadius,
  startAngle = -90
}: RadialMenuSectorPathOptions) => {
  if (outerRadius <= innerRadius) {
    return ''
  }

  const { start, end, largeArcFlag } = getRadialMenuActiveAngles({
    activeIndex,
    count,
    startAngle
  })
  const outerStart = pointOnCircle(outerRadius, start)
  const outerEnd = pointOnCircle(outerRadius, end)
  const innerEnd = pointOnCircle(innerRadius, end)
  const innerStart = pointOnCircle(innerRadius, start)

  return [
    `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
    `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
    'Z'
  ].join(' ')
}

export const getRadialMenuTrackArcPath = ({
  activeIndex,
  count,
  radius,
  innerRadius = 0,
  startAngle = -90
}: RadialMenuTrackArcPathOptions) => {
  if (radius <= innerRadius) {
    return ''
  }

  const { start, end, largeArcFlag } = getRadialMenuActiveAngles({
    activeIndex,
    count,
    startAngle
  })
  const arcStart = pointOnCircle(radius, start)
  const arcEnd = pointOnCircle(radius, end)

  return [
    `M ${arcStart.x.toFixed(3)} ${arcStart.y.toFixed(3)}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcEnd.x.toFixed(3)} ${arcEnd.y.toFixed(3)}`
  ].join(' ')
}

export const getRadialMenuTipPlacement = ({
  x,
  y
}: Pick<RadialMenuItemLayout, 'x' | 'y'>): RadialMenuTipPlacement => {
  if (Math.abs(x) > Math.abs(y)) {
    return x < 0 ? 'left' : 'right'
  }

  return y < 0 ? 'top' : 'bottom'
}
