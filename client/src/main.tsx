import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { sdk } from "@farcaster/miniapp-sdk";

createRoot(document.getElementById("root")!).render(<App />);

(async () => {
    try {
      await sdk.actions.ready();
      console.log('Farcaster overlay dismissed.');
    } catch {
      console.warn('Farcaster SDK not available (likely dev mode).');
    }
  })();

//   if (import.meta.env.DEV) {
//       import("./debugOverlay");
//   }