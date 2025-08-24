"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, BarChart3 } from "lucide-react"
import Link from "next/link"

interface TopUrl {
  id: string
  short_code: string
  original_url: string
  short_url: string
  title: string | null
  click_count: number
  created_at: string
}

export function TopUrls() {
  const [urls, setUrls] = useState<TopUrl[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTopUrls = async () => {
      try {
        const response = await fetch("/api/urls")
        if (response.ok) {
          const data = await response.json()
          // Sort by click count and take top 5
          const sortedUrls = (data.urls || []).sort((a: TopUrl, b: TopUrl) => b.click_count - a.click_count).slice(0, 5)
          setUrls(sortedUrls)
        }
      } catch (error) {
        console.error("Failed to fetch top URLs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopUrls()
  }, [])

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif">Top Performing URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (urls.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif">Top Performing URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No URLs with clicks yet. Start sharing your links!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-serif">Top Performing URLs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {urls.map((url, index) => (
            <div key={url.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-primary font-mono text-sm">{url.short_url}</code>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{url.original_url}</p>
                  {url.title && <p className="text-sm font-medium text-foreground">{url.title}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-foreground font-serif">{url.click_count}</div>
                  <div className="text-xs text-muted-foreground">clicks</div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" asChild>
                  <a href={url.short_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/analytics/${url.id}`}>
                    <BarChart3 className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
