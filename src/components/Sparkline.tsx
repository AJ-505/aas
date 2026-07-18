export function Sparkline({
  data,
  width = 84,
  height = 30,
  strokeWidth = 2,
  className,
}: {
  data: number[]
  width?: number
  height?: number
  strokeWidth?: number
  className?: string
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = strokeWidth
  const stepX = (width - pad * 2) / Math.max(1, data.length - 1)
  const points = data.map((v, i) => {
    const x = pad + i * stepX
    const y = pad + (1 - (v - min) / range) * (height - pad * 2)
    return [x, y] as const
  })
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`
  const last = points[points.length - 1] ?? [pad, pad]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <polygon points={area} className="fill-accent/10" stroke="none" />
      <polyline
        points={line}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-accent"
      />
      <circle cx={last[0]} cy={last[1]} r={strokeWidth + 0.6} className="fill-accent" />
    </svg>
  )
}
