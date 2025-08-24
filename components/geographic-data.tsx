"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "hsl(var(--chart-2))",
  },
}

interface CountryData {
  country: string
  clicks: number
  percentage: number
}

export function GeographicData() {
  const [data, setData] = useState<CountryData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate mock geographic data
    const generateMockData = (): CountryData[] => {
      const countries = [
        { country: "United States", clicks: 450 },
        { country: "United Kingdom", clicks: 320 },
        { country: "Germany", clicks: 280 },
        { country: "Canada", clicks: 240 },
        { country: "France", clicks: 200 },
        { country: "Australia", clicks: 180 },
        { country: "Japan", clicks: 160 },
        { country: "Netherlands", clicks: 140 },
      ]

      const totalClicks = countries.reduce((sum, country) => sum + country.clicks, 0)

      return countries.map((country) => ({
        ...country,
        percentage: Math.round((country.clicks / totalClicks) * 100),
      }))
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
          <CardTitle className="font-serif">Geographic Distribution</CardTitle>
          <CardDescription>Clicks by country</CardDescription>
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
        <CardTitle className="font-serif">Geographic Distribution</CardTitle>
        <CardDescription>Clicks by country</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <XAxis type="number" axisLine={false} tickLine={false} className="text-xs text-muted-foreground" />
              <YAxis
                dataKey="country"
                type="category"
                axisLine={false}
                tickLine={false}
                className="text-xs text-muted-foreground"
                width={80}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      `${value} clicks`,
                      data.find((d) => d.clicks === value)?.percentage + "%",
                    ]}
                  />
                }
              />
              <Bar dataKey="clicks" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
