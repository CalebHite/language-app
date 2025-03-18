"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"
import { Upload } from "lucide-react"

interface VideoSubmitProps {
  onVideoDataChange: (youtubeLink: string, videoFile: File | null) => void;
  setIsSubmitted: (submitted: boolean) => void; // New prop
}

export default function VideoSubmitForm({ onVideoDataChange, setIsSubmitted }: VideoSubmitProps) {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const link = event.target.value;
    setYoutubeLink(link);
    onVideoDataChange(link, videoFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setVideoFile(file);
    onVideoDataChange(youtubeLink, file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted with:", { youtubeLink, videoFile });
    
    // Mark the form as submitted
    setIsSubmitted(true);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Create Your Own Dub</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="youtube-link">YouTube Link</Label>
            <Input
              id="youtube-link"
              type="text"
              value={youtubeLink}
              onChange={handleLinkChange}
              placeholder="Enter YouTube link"
            />
          </div>

          <div className="relative">
            <Separator className="my-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-muted-foreground text-sm">OR</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-file">Upload Video</Label>
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="video-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
              >
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                <Input id="video-file" type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
              </Label>
            </div>
            {videoFile && <p className="text-sm text-muted-foreground mt-2">Selected file: {videoFile.name}</p>}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" onClick={handleSubmit}>
          Submit Video
        </Button>
      </CardFooter>
    </Card>
  );
}


