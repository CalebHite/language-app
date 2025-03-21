import type React from "react"
import ReactPlayer from "react-player"

interface VideoPrefixProps {
  video_url: string
}

const VideoPlayer: React.FC<VideoPrefixProps> = ({ video_url }) => {
  return (
    <ReactPlayer
      url={video_url}
      width="100%"
      height="100%"
    />
  )
}

export default VideoPlayer

