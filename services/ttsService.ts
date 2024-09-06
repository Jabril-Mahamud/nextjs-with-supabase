// services/ttsService.ts

export async function callTtsFunction(text: string): Promise<{ url: string }> {
    const response = await fetch('https://nextjsfunctions.azurewebsites.net/api/http?', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ text }),
    });
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }
  
    const result = await response.json();
    return result;
  }
  