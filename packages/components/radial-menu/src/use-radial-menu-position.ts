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

const toRadians = (degree: number) => (degree * Math.PI) / 180

const pointOnCircle = (radius: number, angle: number) => {
  const radians = toRadians(angle)

  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius
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
  const safeCount = Math.max(count, 1)
  const sectorAngle = 360 / safeCount
  const gap = Math.min(6, sectorAngle / 4)
  const centerAngle = startAngle + sectorAngle * activeIndex
  const start = centerAngle - sectorAngle / 2 + gap
  const end = centerAngle + sectorAngle / 2 - gap
  const outerStart = pointOnCircle(outerRadius, start)
  const outerEnd = pointOnCircle(outerRadius, end)
  const innerEnd = pointOnCircle(innerRadius, end)
  const innerStart = pointOnCircle(innerRadius, start)
  const largeArcFlag = end - start > 180 ? 1 : 0

  return [
    `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
    `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
    'Z'
  ].join(' ')
}
