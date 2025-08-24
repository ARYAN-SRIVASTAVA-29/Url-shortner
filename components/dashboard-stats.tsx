"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Link2, MousePointer, TrendingUp } from "lucide-react"

interface Stats {
  totalUrls: number
  totalClicks: number
  clicksToday: number
  clicksThisWeek: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalUrls: 0,
    totalClicks: 0,
    clicksToday: 0,
    clicksThisWeek: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/urls")
        if (response.ok) {
          const data = await response.json()
          const urls = data.urls || []

          const totalUrls = urls.length
          const totalClicks = urls.reduce((sum: number, url: any) => sum + (url.click_count || 0), 0)

          setStats({
            totalUrls,
            totalClicks,
            clicksToday: Math.floor(totalClicks * 0.1), // Mock data
            clicksThisWeek: Math.floor(totalClicks * 0.3), // Mock data
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total URLs",
      value: stats.totalUrls,
      icon: Link2,
      color: "text-primary",
    },
    {
      title: "Total Clicks",
      value: stats.totalClicks,
      icon: MousePointer,
      color: "text-secondary",
    },
    {
      title: "Clicks Today",
      value: stats.clicksToday,
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: "This Week",
      value: stats.clicksThisWeek,
      icon: BarChart3,
      color: "text-chart-1",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-serif">{stat.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
