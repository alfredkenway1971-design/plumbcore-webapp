/**
 * POST /api/voice-chat
 *
 * Orchestrates the full voice pipeline:
 *   Audio → Whisper (VPS) → DeepSeek (me) → OmniVoice (VPS) → Audio response
 */
import { NextResponse } from 'next/server';

const WHISPER_API = 'http://144.91.106.188:8082/inference';
const OMNIVOICE_API = 'http://144.91.106.188:8083';
const WHISPER_KEY = process.env.WHISPER_API_KEY || 'whisper_key2026';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Step 1: Send audio to Whisper API on VPS
    const whisperForm = new FormData();
    whisperForm.append('file', audioFile, 'recording.wav');

    const whisperRes = await fetch(WHISPER_API, {
      method: 'POST',
      headers: { 'x-api-key': WHISPER_KEY },
      body: whisperForm,
    });

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      return NextResponse.json({ error: `Whisper failed: ${errText}` }, { status: 502 });
    }

    const whisperResult = await whisperRes.json();
    const transcript = whisperResult.text || whisperResult.transcription || '';

    if (!transcript.trim()) {
      return NextResponse.json({ error: 'No speech detected' }, { status: 400 });
    }

    // Step 2: Send transcript to DeepSeek for response
    const deepseekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are Alfred, a helpful AI assistant. Respond conversationally, keep answers brief and natural since the user is speaking. Use English only.' },
          { role: 'user', content: transcript },
        ],
        max_tokens: 500,
      }),
    });

    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text();
      return NextResponse.json({ error: `DeepSeek failed: ${errText}` }, { status: 502 });
    }

    const deepseekResult = await deepseekRes.json();
    const responseText = deepseekResult.choices?.[0]?.message?.content || 'Sorry, I had trouble processing that.';

    // Step 3: Send response to OmniVoice for TTS
    const ttsRes = await fetch(`${OMNIVOICE_API}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: responseText,
        voice: 'en-US-Standard-D',
        speed: 1.0,
      }),
    });

    let audioUrl = '';
    if (ttsRes.ok) {
      const ttsResult = await ttsRes.json();
      audioUrl = ttsResult.audio_url || ttsResult.url || '';
    }

    return NextResponse.json({
      success: true,
      transcript,
      response: responseText,
      audio_url: audioUrl,
    });

  } catch (err: any) {
    console.error('[VoiceChat] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
