const GEMINI_API_KEY = ""; // Isse khali hi rehne dein

const createWavUrl = (base64, sampleRate = 24000) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
    const buffer = new ArrayBuffer(44 + bytes.length);
    const view = new DataView(buffer);
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) { view.setUint8(offset + i, string.charCodeAt(i)); }
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + bytes.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, bytes.length, true);
    const pcmData = new Uint8Array(buffer, 44);
    pcmData.set(bytes);
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
};

async function generateSpeech() {
    const text = document.getElementById('text-input').value;
    const button = document.querySelector('.main-btn');
    const secureKey = GEMINI_API_KEY || prompt("Gemini 3 Flash Key dalein:");

    if (!text.trim() || !secureKey) return;

    button.innerText = "🎙️ Gemini 3 Processing...";
    button.disabled = true;

    try {
        // Gemini 3.0 Flash Preview ka sahi endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${secureKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
                    }
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            alert("Google Error: " + data.error.message);
        } else if (data.candidates && data.candidates[0].content.parts[0].inlineData) {
            const base64Audio = data.candidates[0].content.parts[0].inlineData.data;
            const audioUrl = createWavUrl(base64Audio);
            const audio = new Audio(audioUrl);
            audio.play();
            button.innerText = "✅ Play Again";
        }
    } catch (error) {
        alert("Network Error!");
    } finally {
        button.disabled = false;
        setTimeout(() => { button.innerText = "VoxAI Frank (Premium)"; }, 3000);
    }
}
