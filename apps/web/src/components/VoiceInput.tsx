"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Local Whisper API (self-hosted on VPS)
const WHISPER_API_URL = "http://144.91.106.188:8082/inference";
const WHISPER_API_KEY = "whisper_key2026";

interface VoiceInputProps {
  onTranscribed: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onTranscribed, className }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `recording-${Date.now()}.webm`);
      formData.append("temperature", "0.0");
      formData.append("temperature_inc", "0.2");
      formData.append("response_format", "json");

      const res = await fetch(WHISPER_API_URL, {
        method: "POST",
        headers: { "x-api-key": WHISPER_API_KEY },
        body: formData,
      });

      if (!res.ok) throw new Error(`Whisper API returned ${res.status}`);
      const data = await res.json();
      if (data.text) onTranscribed(data.text);
    } catch (err) {
      console.error("Transcription failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={className}>
      {isProcessing ? (
        <Button size="icon" variant="ghost" disabled className="rounded-full h-8 w-8">
          <Loader2 className="w-4 h-4 animate-spin" />
        </Button>
      ) : isRecording ? (
        <Button
          size="icon"
          variant="destructive"
          className="rounded-full h-8 w-8 animate-pulse"
          onClick={stopRecording}
          title="Stop recording"
        >
          <Square className="w-3 h-3" />
        </Button>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={startRecording}
          title="Record voice"
        >
          <Mic className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
