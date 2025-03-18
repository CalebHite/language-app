"use client";

import { getSession } from "next-auth/react";
import LoginBtn from "../components/login-btn";
import VideoSubmit from "@/components/video-submit";
import { useEffect, useState } from 'react';

export default function Home() {
  const [session, setSession] = useState(null);
  const [videoData, setVideoData] = useState({ youtubeLink: '', videoFile: null });

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
      <VideoSubmit onVideoDataChange={handleVideoDataChange} />
    </div>
  );
}
