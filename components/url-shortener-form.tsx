"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, ExternalLink, Loader2 } from "lucide-react"

interface ShortenedUrl {
  id: string
  short_code: string
  original_url: string
  short_url: string
  created_at: string
}

export function UrlShortenerForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_url: url.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL")
      }

      setShortenedUrl(data)
      setUrl("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!shortenedUrl) return

    try {
      await navigator.clipboard.writeText(shortenedUrl.short_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* URL Input Form */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="url"
                placeholder="Enter your long URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 h-12 text-base"
                required
              />
              <Button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="h-12 px-8 bg-primary text-primary-foreground hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Shortening...
                  </>
                ) : (
                  "Shorten URL"
                )}
              </Button>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {/* Result Display */}
      {shortenedUrl && (
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Your shortened URL:</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="text-muted-foreground hover:text-foreground bg-transparent"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-muted-foreground hover:text-foreground bg-transparent"
                  >
                    <a href={shortenedUrl.short_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Visit
                    </a>
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="font-mono text-primary text-lg break-all">{shortenedUrl.short_url}</p>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Original: {shortenedUrl.original_url}</p>
                <p>Created: {new Date(shortenedUrl.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
