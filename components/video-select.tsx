"use client"

import { useRef, useState, useEffect } from "react"
import ReactPlayer from "react-player"
import { motion } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface VideoSelectProps {
  videoData: {
    youtubeLink: string
    videoFile: File | null
  }
  onClipChange: (start: number, end: number) => void
  targetLang: string
}

export default function VideoSelect({ videoData, onClipChange, targetLang }: VideoSelectProps) {
  const playerRef = useRef<ReactPlayer>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [clipStart, setClipStart] = useState(0)
  const [clipEnd, setClipEnd] = useState(0)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isDraggingStart, setIsDraggingStart] = useState(false)
  const [isDraggingEnd, setIsDraggingEnd] = useState(false)

  const videoSrc = videoData.videoFile ? URL.createObjectURL(videoData.videoFile) : videoData.youtubeLink

  // Add a ref for the progress bar container
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Initialize clip end to video duration when video metadata is loaded
  useEffect(() => {
    if (duration > 0 && clipEnd === 0) {
      setClipEnd(duration)
    }
  }, [duration, clipEnd])

  // Check if current time exceeds clip end
  useEffect(() => {
    if (currentTime >= clipEnd && isPlaying) {
      playerRef.current?.seekTo(clipStart, "seconds")
    }
  }, [currentTime, clipEnd, clipStart, isPlaying])

  useEffect(() => {
    onClipChange(clipStart, clipEnd)
  }, [clipStart, clipEnd, onClipChange])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)

    // If current time is outside clip range, reset to clip start
    if (currentTime < clipStart || currentTime > clipEnd) {
      playerRef.current?.seekTo(clipStart, "seconds")
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
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

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    playerRef.current?.seekTo(newTime, "seconds")
  }

  const MAX_CLIP_LENGTH = 40 // Maximum clip length in seconds

  const handleClipStartChange = (newStart: number) => {
    // Ensure start is not greater than end - 1
    const validStart = Math.min(newStart, clipEnd - 1)

    // Ensure clip doesn't exceed maximum length
    const maxStartForLength = clipEnd - MAX_CLIP_LENGTH
    const startWithMaxLength = Math.max(validStart, maxStartForLength)

    setClipStart(startWithMaxLength)

    // If current time is before new start, update current time
    if (currentTime < startWithMaxLength) {
      setCurrentTime(startWithMaxLength)
      playerRef.current?.seekTo(startWithMaxLength, "seconds")
    }
  }

  const handleClipEndChange = (newEnd: number) => {
    // Ensure end is not less than start + 1
    const validEnd = Math.max(newEnd, clipStart + 1)

    // Ensure clip doesn't exceed maximum length
    const minEndForLength = clipStart + MAX_CLIP_LENGTH
    const endWithMaxLength = Math.min(validEnd, minEndForLength)

    setClipEnd(endWithMaxLength)

    // If current time is after new end, update current time
    if (currentTime > endWithMaxLength) {
      setCurrentTime(endWithMaxLength)
      playerRef.current?.seekTo(endWithMaxLength, "seconds")
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const playClip = () => {
    playerRef.current?.seekTo(clipStart, "seconds")
    setIsPlaying(true)
  }

  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds)
  }

  const handleDuration = (duration: number) => {
    setDuration(duration)
    if (clipEnd === 0) {
      setClipEnd(duration)
    }
  }

  const isMaxLengthReached = () => {
    return clipEnd - clipStart >= MAX_CLIP_LENGTH
  }

  const handleSelectClip = async () => {
    const source_url = videoSrc;
    const start_time = Math.floor(clipStart);
    const end_time = Math.floor(clipEnd);

    const url = new URL('http://localhost:3001/api/request-dub');
    url.searchParams.append('source_url', source_url);
    url.searchParams.append('target_lang', targetLang);
    url.searchParams.append('start_time', start_time.toString());
    url.searchParams.append('end_time', end_time.toString());
    console.log(url);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Response data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  return (
    <div>
      <div className="relative w-full max-w-[53rem] mx-auto overflow-hidden rounded-lg bg-black">
        {/* Video Player */}
        <div className="aspect-video bg-black" onClick={togglePlay}>
          <ReactPlayer
            ref={playerRef}
            url={videoSrc}
            width="100%"
            height="100%"
            playing={isPlaying}
            volume={volume}
            muted={isMuted}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            progressInterval={100}
          />
        </div>

        {/* Video Controls */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2 px-4">
          {/* Custom Progress Bar with Clip Selectors */}
          <div className="relative h-10 mb-1 group">
            {/* Progress bar background */}
            <div ref={progressBarRef} className="absolute bottom-4 left-0 right-0 h-1 bg-white/30 rounded-full">
              {/* Buffered progress */}
              <div className="absolute h-full bg-white/50 rounded-full" style={{ width: "70%" }} />

              {/* Clip selection area */}
              <div
                className={`absolute h-full rounded-full ${isMaxLengthReached() ? "bg-yellow-500/70" : "bg-red-500/70"}`}
                style={{
                  left: `${(clipStart / duration) * 100}%`,
                  width: `${((clipEnd - clipStart) / duration) * 100}%`,
                }}
              />

              {/* Playback progress */}
              <div
                className="absolute h-full bg-red-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Start clip handle */}
            <motion.div
              className={cn(
                "absolute bottom-2.5 w-4 h-4 bg-white rounded-full cursor-pointer transform -translate-x-1/2",
                "hover:scale-125 transition-transform",
                "group-hover:opacity-100 opacity-0",
                isDraggingStart && "scale-125 opacity-100",
              )}
              style={{ left: `${(clipStart / duration) * 100}%` }}
              drag="x"
              dragConstraints={{ left: 0, right: (clipEnd / duration) * 100 + "%" }}
              dragElastic={0}
              dragMomentum={false}
              onDragStart={() => setIsDraggingStart(true)}
              onDragEnd={() => setIsDraggingStart(false)}
              onDrag={(_, info) => {
                if (progressBarRef.current) {
                  const containerRect = progressBarRef.current.getBoundingClientRect()
                  const newStartPercent = (info.point.x - containerRect.left) / containerRect.width
                  const clampedPercent = Math.max(0, Math.min(newStartPercent, 1))
                  handleClipStartChange(clampedPercent * duration)
                }
              }}
            />

            {/* End clip handle */}
            <motion.div
              className={cn(
                "absolute bottom-2.5 w-4 h-4 bg-white rounded-full cursor-pointer transform -translate-x-1/2",
                "hover:scale-125 transition-transform",
                "group-hover:opacity-100 opacity-0",
                isDraggingEnd && "scale-125 opacity-100",
              )}
              style={{ left: `${(clipEnd / duration) * 100}%` }}
              drag="x"
              dragConstraints={{ left: (clipStart / duration) * 100 + "%", right: "100%" }}
              dragElastic={0}
              dragMomentum={false}
              onDragStart={() => setIsDraggingEnd(true)}
              onDragEnd={() => setIsDraggingEnd(false)}
              onDrag={(_, info) => {
                if (progressBarRef.current) {
                  const containerRect = progressBarRef.current.getBoundingClientRect()
                  const newEndPercent = (info.point.x - containerRect.left) / containerRect.width
                  const clampedPercent = Math.max(0, Math.min(newEndPercent, 1))
                  handleClipEndChange(clampedPercent * duration)
                }
              }}
            />
          </div>

          {/* Controls and time display */}
          <div className="flex items-center gap-2 text-white">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={playClip}>
              <SkipForward className="h-5 w-5" />
              <span className="sr-only">Play clip</span>
            </Button>

            <div
              className="relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>

              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black/80 rounded-md w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                  />
                </div>
              )}
            </div>

            <div className="text-xs ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <div className="text-xs ml-auto">
              Clip: {formatTime(clipStart)} - {formatTime(clipEnd)} ({formatTime(clipEnd - clipStart)})
              {isMaxLengthReached() && <span className="ml-2 text-yellow-400">Max length</span>}
            </div>
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 ml-2">
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <Button className="mt-10 text-xl p-6 text-white bg-blue-600 hover:bg-blue-700" onClick={handleSelectClip}>Select Clip</Button>
    </div>
  )
}

