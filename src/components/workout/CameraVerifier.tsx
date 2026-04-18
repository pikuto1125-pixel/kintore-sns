"use client";
import { useRef, useState, useCallback } from "react";
import { Camera, CheckCircle, XCircle } from "lucide-react";

type Props = {
  onCapture: (dataUrl: string) => void;
  captured: boolean;
};

export default function CameraVerifier({ onCapture, captured }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setError(null);
      }
    } catch {
      setError("カメラへのアクセスが拒否されました");
    }
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    onCapture(dataUrl);

    // Stop camera
    const stream = video.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
    setStreaming(false);
  }, [onCapture]);

  return (
    <div className="rounded-2xl border p-6 space-y-4" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          カメラ認証（任意）
        </div>
        {captured && (
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#22c55e" }}>
            <CheckCircle className="w-3.5 h-3.5" />
            撮影完了
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs p-3 rounded-lg" style={{ background: "rgba(255,61,95,0.1)", color: "var(--accent)", border: "1px solid rgba(255,61,95,0.3)" }}>
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div
        className="relative rounded-xl overflow-hidden"
        style={{ aspectRatio: "16/9", background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ display: streaming ? "block" : "none" }}
        />
        {!streaming && !captured && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Camera className="w-12 h-12" style={{ color: "var(--text-secondary)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              カメラで筋トレ中の姿を記録
            </span>
          </div>
        )}
        {captured && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "rgba(34,197,94,0.1)" }}>
            <CheckCircle className="w-12 h-12" style={{ color: "#22c55e" }} />
            <span className="text-sm font-semibold" style={{ color: "#22c55e" }}>
              撮影済み
            </span>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-3">
        {!streaming && !captured && (
          <button
            onClick={startCamera}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            <Camera className="w-4 h-4" style={{ color: "var(--accent)" }} />
            カメラを起動
          </button>
        )}
        {streaming && (
          <button
            onClick={capture}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "var(--accent)", color: "white", boxShadow: "0 0 12px var(--accent-glow)" }}
          >
            <Camera className="w-4 h-4" />
            撮影する
          </button>
        )}
      </div>
    </div>
  );
}
