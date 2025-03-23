"use client"

import { getSession, useSession, signOut } from "next-auth/react";
import LoginBtn from "../components/login-btn";
import VideoSubmit from "@/components/video-submit";
import VideoSelect from "@/components/video-select";
import VideoLibrary from "@/components/video-library";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MyProfile from "../components/my-profile";


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
  const [isProfileVisible, setIsProfileVisible] = useState(false)

  

  useEffect(() => {
    // Use the sessionData from useSession instead of fetching a separate session
    if (sessionData) {
      setTargetLang(sessionData.target_lang || "en");
      // Create user in IPFS when they log in
      createUserInIPFS(sessionData.user.id, sessionData.user.name, sessionData.user.email, sessionData.target_lang);
    }
  }, [sessionData]);

  // Function to create user in IPFS
  const createUserInIPFS = async (userId: string, name: string, email: string, target_lang: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, name, email, target_lang }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user in IPFS');
      }

      const data = await response.json();
      console.log('User created in IPFS:', data.ipfsUrl);
    } catch (error) {
      console.error('Error creating user in IPFS:', error);
    }
  };

  const handleVideoDataChange = (youtubeLink: string, videoFile: File | null) => {
    setVideoData({ youtubeLink, videoFile })
  }

  const handleClipChange = (start: number, end: number) => {
    console.log(`Clip Start: ${start} seconds, Clip End: ${end} seconds`)
  }

  // Language change handler
  const changeLanguage = async (newLang: string) => {
    setIsUpdatingLang(true);
    
    try {
      await updateSession({
        target_lang: newLang,
      });
      
      // Update user in IPFS when language changes
      await updateUserInIPFS(sessionData.user.id, { target_lang: newLang });
    } catch (error) {
      console.error("Failed to update language:", error);
      setTargetLang(newLang);
    } finally {
      setIsUpdatingLang(false);
    }
  };

  // Function to update user in IPFS
  const updateUserInIPFS = async (userId: string, updatedData: { target_lang: string }) => {
    try {
      const response = await fetch(`http://localhost:3001/api/update-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user in IPFS');
      }

      const data = await response.json();
      console.log('User updated in IPFS:', data.ipfsUrl);
    } catch (error) {
      console.error('Error updating user in IPFS:', error);
    }
  };

  // Function to render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return !isSubmitted ? (
          <VideoSubmit onVideoDataChange={handleVideoDataChange} setIsSubmitted={setIsSubmitted} />
        ) : (
          <VideoSelect 
            videoData={videoData} 
            onClipChange={handleClipChange} 
            targetLang={targetLang} 
            onSelectClip={() => setActiveTab("watch")}
          />
        )
      case "learn":
        return <div>Learn Content Here</div>
      case "watch":
        return <VideoLibrary target_lang={targetLang} />
      default:
        return <VideoLibrary target_lang={targetLang} />
    }
  }

  // Function to toggle profile visibility
  const toggleProfileVisibility = () => {
    setIsProfileVisible(prev => !prev);
  };

  if (!sessionData) {
    return (
      <div>
        <LoginBtn />
      </div>
    )
  }

  return (
    <div className="text-center">
      {isProfileVisible && <MyProfile onClose={toggleProfileVisibility} />}
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex flex-col m-8">
          <div 
            className="cursor-pointer" 
            onClick={toggleProfileVisibility}
          >
            <Avatar className="w-16 h-16 mb-2">
              <AvatarImage src={sessionData?.user?.image} />
              <AvatarFallback>
                <img src="/static/backup-avatar.png" alt="User Avatar" />
              </AvatarFallback>
            </Avatar>
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
        <div className="">
          <LanguageSelector targetLang={targetLang} changeLanguage={changeLanguage} isUpdatingLang={isUpdatingLang} />
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

