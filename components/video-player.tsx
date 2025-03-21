"use client"

import { useRef, useState, useEffect } from "react"
import ReactPlayer from "react-player"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack } from "lucide-react"

interface VideoPlayerProps {
  video_url: string;
}

const VideoPlayer = ({ video_url }: VideoPlayerProps) => {
  const playerRef = useRef<ReactPlayer>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }

    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)

    setControlsTimeout(timeout)
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [controlsTimeout])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds)
  }

  const handleDuration = (duration: number) => {
    setDuration(duration)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const handleSeek = (value: number[]) => {
    const seekTime = (value[0] / 100) * duration
    setCurrentTime(seekTime)
    playerRef.current?.seekTo(seekTime)
  }

  const handleSkipForward = () => {
    const newTime = Math.min(currentTime + 10, duration)
    playerRef.current?.seekTo(newTime)
  }

  const handleSkipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0)
    playerRef.current?.seekTo(newTime)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full  mx-auto overflow-hidden rounded-lg bg-black aspect-video"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <ReactPlayer
        ref={playerRef}
        url={video_url}
        playing={isPlaying}
        volume={volume}
        muted={isMuted}
        onProgress={handleProgress}
        onDuration={handleDuration}
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* Controls overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress bar */}
        <div className="mb-2">
          <Slider
            value={[(currentTime / duration) * 100 || 0]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={togglePlay} variant="ghost" size="icon" className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <Button onClick={handleSkipBackward} variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button onClick={handleSkipForward} variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <SkipForward className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <Button onClick={toggleMute} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <div className="w-24 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleVolumeChange(value.map((v) => v / 100))}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <Button onClick={toggleFullscreen} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer

