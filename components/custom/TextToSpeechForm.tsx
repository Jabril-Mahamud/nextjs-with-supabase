// components/TextToSpeechForm.tsx
'use client'
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await callTtsFunction(text);
      setResultUrl(result.url);
    } catch (err) {
      setError('Failed to generate speech.');
    } finally {
      setLoading(false);
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
        {loading && (
          <div className="mt-4">
            <Progress value={100} /> {/* Display the progress indicator */}
          </div>
        )}
        {error && <p className="mt-2 text-red-500">{error}</p>}
        {resultUrl && (
          <div className="mt-4">
            <p>Audio generated! <a href={resultUrl} target="_blank" rel="noopener noreferrer">Listen here</a></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
