import React, { useEffect, useState } from 'react';

interface SubtitlesProps {
  dubbingId: string;
  targetLang: string;
}

const Subtitles: React.FC<SubtitlesProps> = ({ dubbingId, targetLang }) => {
  const [phrases, setPhrases] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/get-transcript?dubbing_id=${dubbingId}&target_lang=${targetLang}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transcript');
        }
        const data = await response.json();
        
        // Convert object values to an array of phrases
        const phrasesArray = Object.values(data);
        setPhrases(phrasesArray);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [dubbingId, targetLang]);

  if (loading) {
    return <div>Loading subtitles...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="subtitles">
      {phrases.length > 0 ? (
        phrases.map((phrase, index) => <p key={index}>{phrase}</p>)
      ) : (
        <p>No subtitles available.</p>
      )}
    </div>
  );
};

export default Subtitles;
