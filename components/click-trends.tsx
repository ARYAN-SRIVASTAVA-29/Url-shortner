"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "hsl(var(--chart-1))",
  },
}

export function ClickTrends() {
  const [data, setData] = useState<Array<{ date: string; clicks: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate mock data for the last 30 days
    const generateMockData = () => {
      const mockData = []
      const today = new Date()

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        // Generate realistic click patterns (higher on weekdays, lower on weekends)
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const baseClicks = isWeekend ? 20 : 50
        const randomVariation = Math.floor(Math.random() * 30)

        mockData.push({
          date: date.toISOString().split("T")[0],
          clicks: baseClicks + randomVariation,
        })
      }

      return mockData
    }

    setTimeout(() => {
      setData(generateMockData())
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif">Click Trends</CardTitle>
          <CardDescription>Daily clicks over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-serif">Click Trends</CardTitle>
        <CardDescription>Daily clicks over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
                axisLine={false}
                tickLine={false}
                className="text-xs text-muted-foreground"
              />
              <YAxis axisLine={false} tickLine={false} className="text-xs text-muted-foreground" />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    }
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorClicks)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
