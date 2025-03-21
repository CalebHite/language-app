import { useEffect, useState } from "react";

interface VideoEntry {
  dubbing_id: string;
  expected_duration_sec: number;
  target_lang: string;
  dubbedIpfsUrl: string;
  name: string;
}

const VideoLibrary = ({ target_lang }: { target_lang: string }) => {
  const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchVideoEntries = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/get-entries?target_lang=${target_lang}`);
      if (!response.ok) {
        throw new Error('Could not fetch video entries');
      }
      const data = await response.json();
  
      const formattedData = data.map(entry => ({
        dubbing_id: entry.data?.dubbing_id || "N/A",
        expected_duration_sec: entry.data?.expected_duration_sec || 0,
        target_lang: entry.data?.target_lang || target_lang, // fallback to provided target_lang
        dubbedIpfsUrl: entry.dubbedIpfsUrl,
        name: entry.name
      }));
  
      setVideoEntries(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Fetch error:', err);
    }
  };
  

  useEffect(() => {
    fetchVideoEntries();
  }, [target_lang]);

  return (
    <div>
      <h1>Video Library</h1>
      <button onClick={fetchVideoEntries}>Refresh</button>
      {error && <p>Error: {error}</p>}
      <ul>
        {videoEntries.map((entry) => (
          // add in videoPlayer here
          <h1></h1>
        ))}
      </ul>
    </div>
  );
};

export default VideoLibrary;
