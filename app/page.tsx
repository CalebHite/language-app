"use client";

import { getSession } from "next-auth/react";
import LoginBtn from "../components/login-btn";
import VideoSubmit from "@/components/video-submit";
import VideoSelect from "@/components/video-select";
import VideoLibrary from "@/components/video-library"
import VideoPlayer from "@/components/video-player";
import { useEffect, useState } from 'react';

interface VideoData {
  youtubeLink: string;
  videoFile: File | null;
}

export default function Home() {
  const [session, setSession] = useState<any>(null); // Use 'any' or a more specific type if available
  const [videoData, setVideoData] = useState<VideoData>({ youtubeLink: '', videoFile: null });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [targetLang, setTargetLang] = useState("de");

  useEffect(() => {
    const fetchSession = async () => {
      const userSession = await getSession();
      setSession(userSession);
    };

    fetchSession();
  }, []);

  const handleVideoDataChange = (youtubeLink: string, videoFile: File | null) => {
    setVideoData({ youtubeLink, videoFile });
  };

  const handleClipChange = (start: number, end: number) => {
    console.log(`Clip Start: ${start} seconds, Clip End: ${end} seconds`);
  };

  if (!session) {
    return (
      <div>
        <LoginBtn />
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-4xl my-16 font-bold">Welcome, {session.user?.name}!</h1>
      {!isSubmitted ? (
        <VideoSubmit onVideoDataChange={handleVideoDataChange} setIsSubmitted={setIsSubmitted} />
      ) : (
        <VideoSelect videoData={videoData} onClipChange={handleClipChange} targetLang={targetLang} />
      )}
      <VideoLibrary target_lang='de' />
      <VideoPlayer video_url='https://www.youtube.com/watch?v=E6ZW1hMYDW0&ab_channel=SportsOnPrime' />
    </div>
  );
}
