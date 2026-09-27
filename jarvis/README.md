# Nori Jarvis Web 11.0.0

Standalone Jarvis/control layer for Nori/KAGE. It is not the APK. It connects to the existing app through a native bridge contract.

Run: npm install && node server/index.mjs, then open http://127.0.0.1:8787.

Server environment: OPENAI_API_KEYS, GEMINI_API_KEYS, ANTHROPIC_API_KEYS (comma-separated). Keys stay server-side.

Native bridge contract: NoriNative.speak, stopSpeaking, openScreen, getKageState, updateKage, setAppBlock, clearAppBlock, vibrate, notify.

Historical handbook rules are structural reference only. The engine uses safe academic recovery/accountability actions and Human Override; no physical punishments are implemented.