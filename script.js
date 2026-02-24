// Vox AI Studio - SECURE VERSION
// Humne yahan se key hata di hai taaki Google warning na de.
const GEMINI_API_KEY = ""; // Ise khali hi rehne dein

const createWavUrl = (base64, sampleRate = 24000) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const buffer = new ArrayBuffer(44 + bytes.length);
    const view = new DataView(buffer);
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
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
    const textInput = document.getElementById('text-input');
    const text = textInput.value;
    const button = document.querySelector('.main-btn');
    
    // YAHAN DHAYAN DEIN: Hum key ko Netlify se mangwayenge ya manual input se
    const secureKey = GEMINI_API_KEY || prompt("Security ke liye, apni nayi Gemini API Key yahan dalein:");

    if (!text.trim()) {
        alert("Sachin bhai, pehle script toh likhiye!");
        return;
    }
    if (!secureKey) {
        alert("API Key ke bina awaaz nahi ban sakti!");
        return;
    }

    button.innerText = "🎙️ AI Voice Processing...";
    button.disabled = true;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${secureKey}`, {
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
        
        if (data.candidates && data.candidates[0].content.parts[0].inlineData) {
            const base64Audio = data.candidates[0].content.parts[0].inlineData.data;
            const audioUrl = createWavUrl(base64Audio);
            const audio = new Audio(audioUrl);
            audio.play();
            button.innerText = "✅ Play Again";
        } else {
            throw new Error("API error");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Galti hui! Shayad Key bekar ho gayi hai.");
        button.innerText = "❌ Error! Try Again";
    } finally {
        button.disabled = false;
        setTimeout(() => {
            button.innerText = "VoxAI Frank (Premium)";
        }, 3000);
    }
}
