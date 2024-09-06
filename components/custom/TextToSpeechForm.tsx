// components/TextToSpeechForm.tsx
'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { callTtsFunction } from '@/services/ttsService';
import { Progress } from '../ui/progress';

export default function TextToSpeechForm() {
  const [text, setText] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setProgress(30);  // Simulate initial progress

    try {
      const result = await callTtsFunction(text);
      setProgress(70);  // Simulate progress at this point
      setResultUrl(result.url);
    } catch (err) {
      setError('Failed to generate speech. Please try again.');
    } finally {
      setLoading(false);
      setProgress(100);  // Mark the progress as complete
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2>Text-to-Speech</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">Enter Text</label>
            <Input
              id="text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your text here"
              className="mt-1 block w-full"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? 'Generating...' : 'Generate Speech'}
          </Button>
        </form>

        {/* Show progress bar while loading */}
        {loading && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Display error message */}
        {error && <p className="mt-2 text-red-500">{error}</p>}

        {/* Show the result with a link to listen to the audio */}
        {resultUrl && (
          <div className="mt-4">
            <p className="text-green-600">Audio generated! <a href={resultUrl} target="_blank" rel="noopener noreferrer">Listen here</a></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
