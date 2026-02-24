const GEMINI_API_KEY = "";

async function generateSpeech() {
    const text = document.getElementById('text-input').value;
    const button = document.querySelector('.main-btn');

    const key = GEMINI_API_KEY || prompt("Apni Gemini API Key dalo:");

    if (!text.trim() || !key) return;

    button.innerText = "🎙️ Free Voice Processing...";
    button.disabled = true;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }],
                    generationConfig: {
                        responseModalities: ["AUDIO"],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: { voiceName: "Puck" }
                            }
                        }
                    }
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            alert("Error: " + data.error.message);
            return;
        }

        const base64Audio =
            data.candidates[0].content.parts[0].inlineData.data;

        const audio = new Audio("data:audio/wav;base64," + base64Audio);
        audio.play();

        button.innerText = "✅ Voice Ready!";
    } catch (e) {
        alert("Network Error");
    } finally {
        button.disabled = false;
        setTimeout(() => {
            button.innerText = "VoxAI Frank (Free)";
        }, 3000);
    }
}
