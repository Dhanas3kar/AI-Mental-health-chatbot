document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const chatHistory = document.getElementById("chat-history");
    const quickReplyBtns = document.querySelectorAll(".quick-reply-btn");
    const moodSelector = document.getElementById("mood-selector");
    const loginBtn = document.getElementById("login-btn");

    const typingIndicator = `
        <div class="typing-indicator" id="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

    const appendMessage = (sender, message, isQuickReply = false) => {
        const msg = document.createElement("div");
        msg.classList.add("message", sender === "You" ? "user-message" : "bot-message");

        if (sender === "MindCare Assistant") {
            msg.innerHTML = `
                <div class="fw-bold mb-1">${sender}</div>
                <p>${message}</p>
                ${isQuickReply ? generateQuickReplies(message) : ""}
            `;
        } else {
            msg.innerHTML = `
                <div class="fw-bold mb-1">${sender}</div>
                <p>${message}</p>
            `;
        }

        chatHistory.appendChild(msg);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    const generateQuickReplies = (message) => {
        const options = {
            greeting: ["I'm feeling anxious", "I'm feeling down", "I'm okay, thanks"],
            anxious: ["Breathing exercise", "Coping strategies", "Talk more"],
            down: ["Self-care tips", "Positive activities", "What's bothering me"]
        };

        let replies = [];
        if (message.includes("Hello") || message.includes("Hi")) replies = options.greeting;
        else if (message.includes("anxious")) replies = options.anxious;
        else if (message.includes("down")) replies = options.down;

        return replies.length
            ? `<div class="quick-replies mt-2">
                    ${replies.map(r => `<button class="quick-reply-btn">${r}</button>`).join("")}
               </div>`
            : "";
    };

    const showTypingIndicator = () => {
        chatHistory.insertAdjacentHTML("beforeend", typingIndicator);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) indicator.remove();
    };

    const sendMessage = async (messageContent = null) => {
        const message = messageContent || userInput.value.trim();
        if (!message) return;

        appendMessage("You", message);
        if (!messageContent) userInput.value = "";

        showTypingIndicator();

        try {
            const res = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });

            const data = await res.json();
            removeTypingIndicator();
            appendMessage("MindCare Assistant", data.response, true);

            if (data.sentiment) updateMoodIndicator(data.sentiment);
        } catch (err) {
            removeTypingIndicator();
            appendMessage("MindCare Assistant", "I'm having trouble connecting right now. Please try again later.");
            console.error("Error:", err);
        }
    };

    const updateMoodIndicator = (sentimentScore) => {
        const marker = document.querySelector(".sentiment-marker");
        if (!marker) return;

        const pos = ((sentimentScore + 1) / 2) * 100;
        marker.style.left = `${pos}%`;

        const sentimentText = document.querySelector(".sentiment-indicator + p");
        if (sentimentText) {
            let state = "";
            if (sentimentScore > 0.6) state = "Very Positive";
            else if (sentimentScore > 0.2) state = "Positive";
            else if (sentimentScore > -0.2) state = "Neutral";
            else if (sentimentScore > -0.6) state = "Negative";
            else state = "Very Negative";

            sentimentText.textContent = `Your current emotional state: ${state}`;
        }
    };

    sendBtn.addEventListener("click", () => sendMessage());
    userInput.addEventListener("keypress", (e) => e.key === "Enter" && sendMessage());
    quickReplyBtns.forEach(btn => btn.addEventListener("click", () => sendMessage(btn.textContent)));

    moodSelector.addEventListener("click", () => {
        console.log("Mood selector clicked");
    });

    loginBtn.addEventListener("click", () => {
        console.log("Login clicked");
    });

    setTimeout(() => {
        appendMessage("MindCare Assistant", "Hello there! I'm here to support you. How are you feeling today?", true);
    }, 500);
});
