// client/src/components/StartGate.tsx
import { useEffect, useState } from "react";

export default function StartGate({ onStart }: { onStart: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handler = () => setReady(true);
    // As a fallback, treat any user interaction as consent
    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  if (!ready) {
    return (
      <div
        className="fixed inset-0 grid place-items-center bg-black/60 z-50"
        onClick={() => setReady(true)}
        onPointerDown={() => setReady(true)}
      >
        <div className="rounded-2xl px-6 py-4 bg-white text-black text-center">
          <p className="text-lg font-semibold">Space Dodger</p>
          <p>Tap anywhere to start</p>
        </div>
      </div>
    );
  }

  // trigger the game/audio start exactly once when ready flips true
  onStart();
  return null;
}
