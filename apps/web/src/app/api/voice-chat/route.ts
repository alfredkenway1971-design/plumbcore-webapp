/**
 * POST /api/voice-chat
 *
 * Receives transcribed text from the voice page, sends to AI, returns response.
 * TTS is handled client-side.
 */
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Use Z.AI free model (or DeepSeek as fallback via OpenRouter)
    let responseText = "I heard you. I'm having trouble connecting right now.";
    
    // Try Z.AI first (free model)
    try {
      const aiRes = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZAI_API_KEY || ''}`,
        },
        body: JSON.stringify({
          model: 'glm-5.2',
          messages: [
            {
              role: 'system',
              content: 'You are Alfred, a helpful voice assistant. Keep responses very brief — 1-3 sentences max. Natural, conversational tone. English only.',
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
      }
    } catch {
      console.error('[VoiceChat] Z.AI failed, trying fallback');
      // Fallback to OpenRouter
      try {
        const fallbackRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: [
              { role: 'system', content: 'You are Alfred, a helpful voice assistant. Keep responses very brief. English only.' },
              { role: 'user', content: text },
            ],
            max_tokens: 200,
          }),
        });
        if (fallbackRes.ok) {
          const result = await fallbackRes.json();
          responseText = result.choices?.[0]?.message?.content || responseText;
        }
      } catch {}
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
