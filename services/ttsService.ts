// services/ttsService.ts

interface TtsResponse {
    url: string; // Adjust based on your actual response structure
  }
  
  export async function callTtsFunction(text: string): Promise<TtsResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Text: text }), // Ensure 'Text' matches the expected key in your Azure Function
    });
  
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  
    const data: TtsResponse = await response.json();
    return data;
  }
  