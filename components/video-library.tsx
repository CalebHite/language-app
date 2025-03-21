"use client"

import { useEffect, useState } from "react"
import { Clock, Globe, RefreshCw } from "lucide-react"
import VideoPreview from "./video-preview"
import VideoPlayer from "./video-player";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VideoEntry {
  dubbing_id: string
  expected_duration_sec: number
  target_lang: string
  dubbedIpfsUrl: string
  name: string
}

export default function VideoLibrary({ target_lang }: { target_lang: string }) {
  const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoEntry | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchVideoEntries = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const response = await fetch(`http://localhost:3001/api/get-entries?target_lang=${target_lang}`)
      if (!response.ok) {
        throw new Error("Could not fetch video entries")
      }

      const data = await response.json()
      const formattedData = data.map((entry: any) => ({
        dubbing_id: entry.data?.dubbing_id || "N/A",
        expected_duration_sec: entry.data?.expected_duration_sec || 0,
        target_lang: entry.data?.target_lang || target_lang,
        dubbedIpfsUrl: entry.dubbedIpfsUrl,
        name: entry.name || `Video ${entry.data?.dubbing_id}`,
      }))

      setVideoEntries(formattedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Fetch error:", err)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchVideoEntries()
  }, [target_lang])

  // Format seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Get language name from code
  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
      hi: "Hindi",
    }
    return languages[code] || code
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Library</h1>
          <p className="text-muted-foreground mt-1">Browsing videos in {getLanguageName(target_lang)}</p>
        </div>
        <Button onClick={fetchVideoEntries} disabled={isLoading || refreshing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedVideo ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={() => setSelectedVideo(null)}>
              Back to Library
            </Button>
          </div>
          <div className="rounded-lg overflow-hidden bg-black aspect-video">
            <VideoPlayer video_url={selectedVideo.dubbedIpfsUrl} />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(selectedVideo.expected_duration_sec)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>{getLanguageName(selectedVideo.target_lang)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">ID:</span>
              <span>{selectedVideo.dubbing_id}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="overflow-hidden">
                <Skeleton className="h-[180px] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : videoEntries.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No videos found. Try a different language or refresh.</p>
            </div>
          ) : (
            videoEntries.map((entry, index) => (
              <Card
                key={entry.dubbing_id}
                className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
                onClick={() => setSelectedVideo(entry)}
              >
                <div className="relative aspect-video bg-muted">
                  <VideoPreview video_url={entry.dubbedIpfsUrl} />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(entry.expected_duration_sec)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span>{getLanguageName(entry.target_lang)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

