// ===== AI CHAT - GEMINI 2.0 FLASH =====
const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatTyping = document.getElementById('chatTyping');
const statusIndicator = document.getElementById('statusIndicator');

let isChatOpen = false;
let isProcessing = false;

// API Configuration - comes from config.js
const GEMINI_API_KEY = window.GEMINI_API_KEY || '';
// Use the correct model from your available list
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

function toggleChat() {
    isChatOpen = !isChatOpen;
    chatWindow.classList.toggle('open', isChatOpen);
    chatToggle.classList.toggle('open', isChatOpen);
    if (isChatOpen) {
        chatInput.focus();
        if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
            setStatus(false);
            addMessage('⚠️ API key not configured. Please contact the administrator.', 'ai');
        } else {
            setStatus(true);
        }
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br>');

    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(bubble);
    messageDiv.appendChild(timestamp);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setTyping(visible) {
    chatTyping.classList.toggle('show', visible);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setStatus(online) {
    if (online) {
        statusIndicator.textContent = '● Online';
        statusIndicator.className = 'status online';
    } else {
        statusIndicator.textContent = '● Offline';
        statusIndicator.className = 'status offline';
    }
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || isProcessing) return;

    if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
        addMessage('⚠️ API key not configured. Please contact the administrator.', 'ai');
        return;
    }

    isProcessing = true;
    chatSendBtn.disabled = true;
    chatInput.disabled = true;

    addMessage(message, 'user');
    chatInput.value = '';
    setTyping(true);
    setStatus(true);

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a helpful assistant for HRP Dev, a company that builds Zoho and Salesforce CRM extensions. Your name is HRP Dev Assistant.

Key information about HRP Dev:
- We build extensions for Zoho CRM and Salesforce
- Main products: Data Guardian (data quality, health scoring, email/phone/address validation), Email Verifier Pro, Address Verify & Timezone, US Address Verify, Phone Validator
- Services: Zoho CRM Customization, Creator App Development, Books & Finance Integration, API & Third-Party Integration, Zoho Analytics & Reporting, Marketplace App Development
- Our clients are in 60+ countries
- We have 15+ reviews on Fiverr with 4.8/5 rating

Be friendly, professional, and concise. If asked about pricing, suggest contacting us directly.

User question: ${message}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                }
            })
        });

        setTyping(false);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Error:', errorData);
            throw new Error(`API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'I apologize, but I couldn\'t generate a response. Please try again.';
        addMessage(aiResponse, 'ai');

    } catch (error) {
        setTyping(false);
        console.error('Chat error:', error);
        addMessage(`⚠️ Error: ${error.message || 'Unable to connect to Gemini API. Please try again later.'}`, 'ai');
        setStatus(false);
    }

    isProcessing = false;
    chatSendBtn.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
}

// Enter key to send
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
        setStatus(false);
        console.warn('⚠️ GEMINI_API_KEY not configured');
    } else {
        setStatus(true);
        console.log('✅ Gemini API is configured with model:', GEMINI_MODEL);
    }
});
