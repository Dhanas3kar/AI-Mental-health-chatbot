document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const chatHistory = document.getElementById("chat-history");
    const quickReplyBtns = document.querySelectorAll(".quick-reply-btn");
    const moodSelector = document.getElementById("mood-selector");
    const loginBtn = document.getElementById("login-btn");

    // Typing indicator elements
    const typingIndicator = `
        <div class="typing-indicator" id="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

    // Append message to chat
    function appendMessage(sender, message, isQuickReply = false) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender === "You" ? "user-message" : "bot-message");
        
        if (sender === "MindCare Assistant") {
            messageDiv.innerHTML = `
                <div class="fw-bold mb-1">${sender}</div>
                <p>${message}</p>
                ${isQuickReply ? generateQuickReplies(message) : ''}
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="fw-bold mb-1">${sender}</div>
                <p>${message}</p>
            `;
        }
        
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Generate quick replies based on message
    function generateQuickReplies(message) {
        const quickReplies = {
            "greeting": ["I'm feeling anxious", "I'm feeling down", "I'm okay, thanks"],
            "anxious": ["Breathing exercise", "Coping strategies", "Talk more"],
            "down": ["Self-care tips", "Positive activities", "What's bothering me"]
        };

        let replies = [];
        if (message.includes("Hello") || message.includes("Hi")) {
            replies = quickReplies.greeting;
        } else if (message.includes("anxious")) {
            replies = quickReplies.anxious;
        } else if (message.includes("down")) {
            replies = quickReplies.down;
        }

        if (replies.length > 0) {
            return `
                <div class="quick-replies mt-2">
                    ${replies.map(reply => `<button class="quick-reply-btn">${reply}</button>`).join('')}
                </div>
            `;
        }
        return '';
    }

    // Show typing indicator
    function showTypingIndicator() {
        chatHistory.insertAdjacentHTML('beforeend', typingIndicator);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) indicator.remove();
    }

    // Send message to server
    async function sendMessage(messageContent = null) {
        const message = messageContent || userInput.value.trim();
        if (!message) return;

        appendMessage("You", message);
        if (!messageContent) userInput.value = "";
        
        showTypingIndicator();

        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message }),
            });
            
            const data = await response.json();
            removeTypingIndicator();
            appendMessage("MindCare Assistant", data.response, true);
            
            // Update mood chart based on sentiment analysis if available
            if (data.sentiment) {
                updateMoodIndicator(data.sentiment);
            }
        } catch (error) {
            removeTypingIndicator();
            appendMessage("MindCare Assistant", "I'm having trouble connecting right now. Please try again later.");
            console.error("Error:", error);
        }
    }

    // Update mood indicator position
    function updateMoodIndicator(sentimentScore) {
        // sentimentScore should be between -1 (negative) and 1 (positive)
        const marker = document.querySelector(".sentiment-marker");
        if (marker) {
            const position = ((sentimentScore + 1) / 2) * 100; // Convert to 0-100 scale
            marker.style.left = `${position}%`;
            
            // Update text description
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
        }
    }

    // Event Listeners
    sendBtn.addEventListener("click", () => sendMessage());
    
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") sendMessage();
    });

    // Quick reply functionality
    quickReplyBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            sendMessage(this.textContent);
        });
    });

    // Mood selector functionality
    moodSelector.addEventListener("click", function() {
        // This would trigger the mood modal in the full implementation
        console.log("Mood selector clicked");
        // In a full implementation, this would open the mood modal
    });

    // Login button functionality
    loginBtn.addEventListener("click", function() {
        console.log("Login clicked");
        // This would trigger login modal or redirect in full implementation
    });

    // Initial bot greeting
    setTimeout(() => {
        appendMessage("MindCare Assistant", "Hello there! I'm here to support you. How are you feeling today?", true);
    }, 500);
});