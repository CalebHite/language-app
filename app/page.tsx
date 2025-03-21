"use client"

import { getSession, useSession, signOut } from "next-auth/react"
import LoginBtn from "../components/login-btn"
import VideoSubmit from "@/components/video-submit"
import VideoSelect from "@/components/video-select"
import VideoLibrary from "@/components/video-library"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


interface VideoData {
  youtubeLink: string
  videoFile: File | null
}

export default function Home() {
  const { data: sessionData, update: updateSession } = useSession()
  const [session, setSession] = useState<any>(null)
  const [videoData, setVideoData] = useState<VideoData>({ youtubeLink: "", videoFile: null })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [targetLang, setTargetLang] = useState("de")
  const [activeTab, setActiveTab] = useState("watch")
  const [isUpdatingLang, setIsUpdatingLang] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      const userSession = await getSession()
      setSession(userSession)
      setTargetLang(userSession?.target_lang || "en")
    }

    fetchSession()
  }, [])

  const handleVideoDataChange = (youtubeLink: string, videoFile: File | null) => {
    setVideoData({ youtubeLink, videoFile })
  }

  const handleClipChange = (start: number, end: number) => {
    console.log(`Clip Start: ${start} seconds, Clip End: ${end} seconds`)
  }

  // Language change handler
  const changeLanguage = async (newLang: string) => {
    if (!session) return

    setIsUpdatingLang(true)

    try {
      // Update the session with the new target language
      await updateSession({
        target_lang: newLang,
      })

      // Update local state
      setTargetLang(newLang)

      // Refetch session to get updated data
      const updatedSession = await getSession()
      setSession(updatedSession)

      console.log(`Language changed to: ${newLang}`)
    } catch (error) {
      console.error("Failed to update language:", error)
    } finally {
      setIsUpdatingLang(false)
    }
  }

  // Function to render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return !isSubmitted ? (
          <VideoSubmit onVideoDataChange={handleVideoDataChange} setIsSubmitted={setIsSubmitted} />
        ) : (
          <VideoSelect videoData={videoData} onClipChange={handleClipChange} targetLang={targetLang} />
        )
      case "learn":
        return <div>Learn Content Here</div>
      case "watch":
        return <VideoLibrary target_lang={targetLang} />
      default:
        return <VideoLibrary target_lang={targetLang} />
    }
  }

  if (!session) {
    return (
      <div>
        <LoginBtn />
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="flex justify-between items-center px-4 py-2">
          <Avatar className="w-16 h-16 m-8 cursor-pointer">
            <AvatarImage src={sessionData?.user?.image} />
            <AvatarFallback>
              <img src="/static/backup-avatar.png" alt="User Avatar" />
            </AvatarFallback>
          </Avatar> 
          <div className="flex flex-col items-end">
          <LanguageSelector targetLang={targetLang} changeLanguage={changeLanguage} isUpdatingLang={isUpdatingLang} />
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </div>

      <div className="tabs mb-8">
        <Button className="mx-2 w-24" onClick={() => setActiveTab("watch")}>
          Watch
        </Button>
        <Button className="mx-2 w-24" onClick={() => setActiveTab("create")}>
          Create
        </Button>
        <Button className="mx-2 w-24" onClick={() => setActiveTab("learn")}>
          Learn
        </Button>
      </div>
      {renderContent()}
    </div>
  )
}

