export function MiniBarChart({
  data,
  height = 52,
}: {
  data: number[]
  height?: number
}) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((v, idx) => (
        <div
          key={idx}
          className="w-3 rounded-md bg-[rgb(var(--primary-2))]/60"
          style={{ height: `${Math.round((v / max) * height)}px` }}
          title={String(v)}
        />
      ))}
    </div>
  )
}

