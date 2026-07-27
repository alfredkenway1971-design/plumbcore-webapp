/**
 * POST /api/voice-chat
 *
 * Receives transcribed text from the browser's SpeechRecognition API,
 * sends it to the AI, and returns a response.
 * TTS is handled client-side via browser SpeechSynthesis.
 */
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Get AI response via OpenRouter (DeepSeek)
    let responseText = "I heard you. I'm having trouble connecting right now.";
    
    try {
      const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are Alfred, a helpful voice assistant for the user. Keep responses very brief — 1-3 sentences max. Natural, conversational tone. English only.',
            },
            { role: 'user', content: text },
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (aiRes.ok) {
        const result = await aiRes.json();
        responseText = result.choices?.[0]?.message?.content || responseText;
      } else {
        console.error('[VoiceChat] AI error:', await aiRes.text().catch(() => ''));
      }
    } catch (err) {
      console.error('[VoiceChat] AI fetch failed:', err);
    }

    return NextResponse.json({
      success: true,
      transcript: text,
      response: responseText,
    });

  } catch (err: any) {
    console.error('[VoiceChat] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
