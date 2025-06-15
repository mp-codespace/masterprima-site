// src\app\auth-mp-secure-2024\dashboard\components\StatusChart.tsx

'use client'

import React from 'react'

interface ChartDataItem {
  name: string
  value: number
  fill: string
}

interface StatusChartProps {
  data: ChartDataItem[]
}

export default function StatusChart({ data }: StatusChartProps) {
  if (!data || data.length === 0 || data.every((item) => item.value === 0)) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <div className="w-36 h-36 mx-auto rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-gray-400">0</span>
        </div>
        <p className="text-sm text-gray-500">No articles available.</p>
      </div>
    )
  }

  const total = data.reduce((sum, entry) => sum + entry.value, 0)
  const centerRadius = 0.6
  let cumulativePercentage = 0

  const getCoordinatesForPercent = (percent: number, radius = 1) => {
    const x = Math.cos(2 * Math.PI * percent) * radius
    const y = Math.sin(2 * Math.PI * percent) * radius
    return [x, y]
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      {/* Header di luar box */}
      <p className="text-sm text-gray-500 mb-4">
        Get a snapshot of your article status.
      </p>

      {/* Donut Chart */}
      <div className="flex justify-center mb-4">
        <div className="relative w-48 h-48"> {/* <- lebih besar */}
          <svg viewBox="-1.2 -1.2 2.4 2.4" className="transform -rotate-90 w-full h-full">
            {data.map((entry, index) => {
              if (entry.value === 0) return null

              const percentage = entry.value / total
              const [startX, startY] = getCoordinatesForPercent(cumulativePercentage)
              cumulativePercentage += percentage
              const [endX, endY] = getCoordinatesForPercent(cumulativePercentage)
              const largeArcFlag = percentage > 0.5 ? 1 : 0

              const pathData = [
                `M ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L ${endX * centerRadius} ${endY * centerRadius}`,
                `A ${centerRadius} ${centerRadius} 0 ${largeArcFlag} 0 ${startX * centerRadius} ${startY * centerRadius}`,
                'Z'
              ].join(' ')

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={entry.fill}
                  className="hover:opacity-80 transition-opacity"
                />
              )
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold text-gray-900">{total}</span>
            <p className="text-sm text-gray-500">Total items</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 flex-wrap">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center text-sm gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.fill }}
            ></span>
            <span className="text-gray-700">
              {entry.name}{' '}
              <span className="font-semibold text-gray-900">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
