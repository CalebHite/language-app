import { useEffect, useState } from "react";

interface VideoEntry {
  dubbing_id: string;
  expected_duration_sec: number;
  target_lang: string;
}

const VideoLibrary = () => {
  const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchVideoEntries = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/get-entries');
      if (!response.ok) {
        throw new Error('Could not fetch video entries');
      }
      const data = await response.json();
      console.log(data);
      setVideoEntries(data.map(entry => ({ dubbing_id: entry.name, targetLang: entry.data.targetLang })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchVideoEntries();
  }, []);

  return (
    <div>
      <h1>Video Library</h1>
      <button onClick={fetchVideoEntries}>Refresh</button>
      {error && <p>Error: {error}</p>}
      <ul>
        {videoEntries.map((entry) => (
          <li key={entry.dubbing_id}>
            <h2>{entry.target_lang}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideoLibrary;
