"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Link2, MousePointer, TrendingUp, Globe, Users } from "lucide-react"

interface OverallStats {
  totalUrls: number
  totalClicks: number
  clicksToday: number
  clicksThisWeek: number
  uniqueVisitors: number
  avgClicksPerUrl: number
}

export function OverallAnalytics() {
  const [stats, setStats] = useState<OverallStats>({
    totalUrls: 0,
    totalClicks: 0,
    clicksToday: 0,
    clicksThisWeek: 0,
    uniqueVisitors: 0,
    avgClicksPerUrl: 0,
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
          const avgClicksPerUrl = totalUrls > 0 ? Math.round(totalClicks / totalUrls) : 0

          setStats({
            totalUrls,
            totalClicks,
            clicksToday: Math.floor(totalClicks * 0.08), // Mock data for demo
            clicksThisWeek: Math.floor(totalClicks * 0.35),
            uniqueVisitors: Math.floor(totalClicks * 0.7), // Assuming 70% unique visitors
            avgClicksPerUrl,
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
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Total Clicks",
      value: stats.totalClicks,
      icon: MousePointer,
      color: "text-chart-1",
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Unique Visitors",
      value: stats.uniqueVisitors,
      icon: Users,
      color: "text-chart-2",
      change: "+18%",
      changeType: "positive" as const,
    },
    {
      title: "Clicks Today",
      value: stats.clicksToday,
      icon: TrendingUp,
      color: "text-chart-3",
      change: "+5%",
      changeType: "positive" as const,
    },
    {
      title: "This Week",
      value: stats.clicksThisWeek,
      icon: BarChart3,
      color: "text-chart-4",
      change: "+15%",
      changeType: "positive" as const,
    },
    {
      title: "Avg Clicks/URL",
      value: stats.avgClicksPerUrl,
      icon: Globe,
      color: "text-chart-5",
      change: "+8%",
      changeType: "positive" as const,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-serif mb-1">{stat.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stat.changeType === "positive" ? "text-chart-1" : "text-destructive"}>
                {stat.change}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
