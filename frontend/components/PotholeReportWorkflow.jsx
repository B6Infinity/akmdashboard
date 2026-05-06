"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createReport } from "../services/reportService";

const ISSUE_TYPES = [
  { value: "pothole", label: "Pothole", emoji: "🕳️" },
  { value: "broken_lamp", label: "Broken Lamp", emoji: "💡" },
  { value: "garbage", label: "Garbage", emoji: "🗑️" },
  { value: "drainage", label: "Drainage", emoji: "🌊" },
  { value: "other", label: "Other", emoji: "⚠️" },
];

// ── Permissions ────────────────────────────────────────────────────────────────
async function requestPermissions() {
  const position = await new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
    })
  );

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" } },
    audio: false,
  });

  return {
    location: { lat: position.coords.latitude, lng: position.coords.longitude },
    stream,
  };
}

// ── Mini-map ───────────────────────────────────────────────────────────────────
function useMiniMap(containerRef, location, theme) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !location) return;
    if (mapRef.current) return; // already initialised

    let destroyed = false;

    import("leaflet").then((L) => {
      if (destroyed || !containerRef.current) return;

      const tileUrl =
        theme === "dark"
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      const map = L.map(containerRef.current, {
        center: [location.lat, location.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
      });

      L.tileLayer(tileUrl).addTo(map);
      L.circleMarker([location.lat, location.lng], {
        color: "#1d6cf2",
        fillColor: "#3f8ef7",
        fillOpacity: 0.9,
        radius: 10,
        weight: 3,
      }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [containerRef, location, theme]);
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PotholeReportWorkflow({ theme, onClose }) {
  const [step, setStep] = useState("requesting"); // requesting | capture | confirm | submitting
  const [issueType, setIssueType] = useState("pothole");
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null); // base64
  const [remarks, setRemarks] = useState("");
  const [permError, setPermError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const miniMapRef = useRef(null);

  useMiniMap(miniMapRef, location, theme);

  // ── Request permissions on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { location: loc, stream } = await requestPermissions();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setLocation(loc);
        setStep("capture");
      } catch (err) {
        if (!cancelled) {
          console.error("[PotholeReport] Permission error:", err);
          setPermError(
            err.code === 1
              ? "Location or camera access was denied. Both are required."
              : "Could not access GPS or camera. Please check your browser settings."
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Attach stream to video element when capture step is ready
  useEffect(() => {
    if (step === "capture" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [step]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPhoto(dataUrl);
    stopCamera();
    setStep("confirm");
  }, [stopCamera]);

  const retake = useCallback(async () => {
    setPhoto(null);
    setStep("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setStep("capture");
    } catch {
      setPermError("Could not restart camera.");
    }
  }, []);

  const submitReport = useCallback(async () => {
    setStep("submitting");
    try {
      await createReport({
        type: issueType,
        photo,
        location,
        remarks: remarks.trim(),
      });
      alert("✅ Report submitted successfully!");
      onClose();
    } catch (err) {
      console.error("[PotholeReport] Submit error:", err);
      alert(`❌ Failed to submit: ${err.message}`);
      setStep("confirm");
    }
  }, [issueType, photo, location, remarks, onClose]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-[#0a0a0a]">

      {/* ── Header ── */}
      <div className="flex-none flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
        <span className="text-white font-bold tracking-wide">Report Incident</span>
        {/* Issue type pill */}
        <span className="text-xs bg-accent/20 text-accent border border-accent/30 rounded-full px-3 py-1 font-medium capitalize">
          {issueType.replace("_", " ")}
        </span>
      </div>

      {/* ── Permission Error State ── */}
      {permError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-4xl">🚫</div>
          <p className="text-white/80 text-sm leading-relaxed max-w-xs">{permError}</p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 bg-accent rounded-full text-white font-semibold text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* ── Requesting State ── */}
      {step === "requesting" && !permError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/60">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Requesting GPS & Camera…</p>
        </div>
      )}

      {/* ── Capture State ── */}
      {step === "capture" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mini-map */}
          <div ref={miniMapRef} className="h-[18%] w-full bg-[#111]" />

          {/* Camera */}
          <div className="flex-1 relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-white/25 rounded-2xl" />
              <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-xs">
                Point camera at the issue
              </div>
            </div>
          </div>

          {/* Issue type selector */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-[#111] scrollbar-none">
            {ISSUE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setIssueType(t.value)}
                className={`flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  issueType === t.value
                    ? "bg-accent border-accent text-white"
                    : "bg-white/5 border-white/15 text-white/60 hover:text-white"
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Shutter */}
          <div className="flex-none flex items-center justify-center h-[90px] bg-[#111]">
            <button
              onClick={capturePhoto}
              className="w-[70px] h-[70px] rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Capture photo"
            >
              <div className="w-[54px] h-[54px] rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm State ── */}
      {step === "confirm" && photo && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mini-map */}
          <div ref={miniMapRef} className="h-[18%] w-full bg-[#111]" />

          {/* Photo preview */}
          <div className="flex-1 relative overflow-hidden">
            <img src={photo} alt="Captured" className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              📍 {location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}
            </div>
          </div>

          {/* Remarks + actions */}
          <div className="flex-none flex flex-col gap-3 p-4 bg-[#111]">
            <textarea
              rows={2}
              placeholder="Add a description… (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/35 text-sm resize-none focus:outline-none focus:border-accent/70 transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={retake}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={submitReport}
                className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all"
              >
                Submit Report ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submitting overlay ── */}
      {step === "submitting" && (
        <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-semibold">Submitting report…</p>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
