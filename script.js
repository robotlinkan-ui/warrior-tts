// ===== CONFIG =====
const OPENAI_API_KEY = ""; 
// अगर खाली रहेगा तो runtime पर key पूछेगा

// ===== WAV CREATOR =====
function createWavUrl(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

    const buffer = new ArrayBuffer(44 + bytes.length);
    const view = new DataView(buffer);

    function writeString(offset, str) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    writeString(0, "RIFF");
    view.setUint32(4, 36 + bytes.length, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 24000, true);
    view.setUint32(28, 24000 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, bytes.length, true);

    const pcm = new Uint8Array(buffer, 44);
    pcm.set(bytes);

    const blob = new Blob([buffer], { type: "audio/wav" });
    return URL.createObjectURL(blob);
}

// ===== MAIN TTS FUNCTION =====
async function generateSpeech() {
    const text = document.getElementById("text-input").value.trim();
    const button = document.querySelector(".main-btn");

    if (!text) return alert("Text likho pehle");

    const key = OPENAI_API_KEY || prompt("OpenAI API Key dalein:");

    if (!key) return;

    button.innerText = "🎙️ Generating...";
    button.disabled = true;

    try {
        const response = await fetch(
            "https://api.openai.com/v1/audio/speech",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${key}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini-tts",
                    voice: "alloy",
                    input: text
                })
            }
        );

        if (!response.ok) {
            const err = await response.text();
            alert("Error: " + err);
            return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        audio.play();

        button.innerText = "✅ Success!";
    } catch (e) {
        alert("Network error");
    } finally {
        button.disabled = false;
        setTimeout(() => {
            button.innerText = "VoxAI Frank (Premium)";
        }, 3000);
    }
}
