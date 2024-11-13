
export interface GenerateTextResponse {
  response: string;
}

export async function generateText(prompt: string): Promise<GenerateTextResponse> {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt: prompt,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to connect to Ollama');
    }

    const data = await response.json();
    return { response: data.response };
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to connect to local Ollama service');
  }
}