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

    // Get AI response from Z.AI, then generate natural TTS audio via OmniVoice on VPS
    let responseText = "I heard you. I'm having trouble connecting right now.";
    let audioBase64 = '';
    
    // Step 1: Get AI response
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
      console.error('[VoiceChat] Z.AI failed');
    }

    // Step 2: Generate natural TTS via OmniVoice on VPS (server-to-server, no mixed content issue)
    try {
      const ttsRes = await fetch('http://144.91.106.188:8083/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: responseText,
          voice: 'en-US-Neural2-D',
          speed: 1.0,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (ttsRes.ok) {
        const ttsResult = await ttsRes.json();
        // OmniVoice may return the audio as a URL or base64 or direct binary
        if (ttsResult.audio_url) {
          // Fetch the audio and return as base64
          const audioResp = await fetch(ttsResult.audio_url, { signal: AbortSignal.timeout(10000) });
          if (audioResp.ok) {
            const audioBuffer = await audioResp.arrayBuffer();
            audioBase64 = Buffer.from(audioBuffer).toString('base64');
          }
        } else if (ttsResult.audio_base64) {
          audioBase64 = ttsResult.audio_base64;
        }
      }
    } catch {
      console.error('[VoiceChat] OmniVoice failed');
    }

    return NextResponse.json({
      success: true,
      transcript: text,
      response: responseText,
      audio: audioBase64,
    });

  } catch (err: any) {
    console.error('[VoiceChat] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
