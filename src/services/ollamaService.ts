import { API_CONFIG } from '../config';

export interface GenerateTextResponse {
  response: string;
  model: string;
  created_at: string;
  done: boolean;
}

export async function generateText(prompt: string): Promise<GenerateTextResponse> {
  const response = await fetch(API_CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      model: 'llama3.2:1b'
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to connect to AI service');
  }

  return response.json();
}