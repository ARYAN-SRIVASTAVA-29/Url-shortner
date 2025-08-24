"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, BarChart3, Trash2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface UrlItem {
  id: string
  short_code: string
  original_url: string
  short_url: string
  title: string | null
  created_at: string
  click_count: number
  is_active: boolean
}

export function UrlList() {
  const [urls, setUrls] = useState<UrlItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    try {
      const response = await fetch("/api/urls")
      if (response.ok) {
        const data = await response.json()
        setUrls(data.urls || [])
      }
    } catch (error) {
      console.error("Failed to fetch URLs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const deleteUrl = async (id: string) => {
    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setUrls(urls.filter((url) => url.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete URL:", error)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif">Your URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
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
          <CardTitle className="font-serif">Your URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No URLs created yet. Start by shortening your first URL above!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-serif">Your URLs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {urls.map((url) => (
            <div key={url.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-primary font-mono text-sm">{url.short_url}</code>
                    <Badge variant={url.is_active ? "default" : "secondary"} className="text-xs">
                      {url.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{url.original_url}</p>
                  {url.title && <p className="text-sm font-medium text-foreground">{url.title}</p>}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyToClipboard(url.short_url)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={url.short_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/analytics/${url.id}`}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteUrl(url.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{url.click_count} clicks</span>
                <span>Created {new Date(url.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
