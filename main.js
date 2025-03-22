// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isRecording = false;

// DOM Elements
const recordButton = document.getElementById('recordButton');
const chatContainer = document.getElementById('chat-container');
const statusText = document.getElementById('status-text');
const clearButton = document.getElementById('clearButton');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');

// Initialize speech recognition if supported
function initializeSpeechRecognition() {
    try {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        // Event handlers
        recognition.onstart = handleRecognitionStart;
        recognition.onend = handleRecognitionEnd;
        recognition.onresult = handleRecognitionResult;
        recognition.onerror = handleRecognitionError;

        // Add click event listeners
        recordButton.addEventListener('click', toggleRecording);
        clearButton.addEventListener('click', clearChat);
    } catch (error) {
        showError("Speech recognition is not supported in your browser. Please try using Chrome.");
    }
}

// Toggle recording state
function toggleRecording() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

// Check and request microphone permission
async function checkMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        return false;
    }
}

// Start recording
async function startRecording() {
    try {
        const hasPermission = await checkMicrophonePermission();
        if (!hasPermission) {
            showError("Please allow microphone access to use the speaking assistant.");
            return;
        }
        recognition.start();
        isRecording = true;
    } catch (error) {
        showError("Error starting recording. Please try again.");
    }
}

// Stop recording
function stopRecording() {
    try {
        recognition.stop();
        isRecording = false;
    } catch (error) {
        showError("Error stopping recording. Please try again.");
    }
}

// Handle recognition start
function handleRecognitionStart() {
    recordButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    recordButton.classList.add('bg-red-500', 'hover:bg-red-600');
    
    // Show and animate recording ring
    const recordingRing = document.getElementById('recordingRing');
    recordingRing.classList.remove('hidden');
    recordingRing.classList.add('animate-ping');
    
    // Update status
    statusText.textContent = 'Listening...';
    statusText.classList.remove('bg-gray-100');
    statusText.classList.add('bg-red-100');
}

// Handle recognition end
function handleRecognitionEnd() {
    recordButton.classList.remove('bg-red-500', 'hover:bg-red-600');
    recordButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
    
    // Hide recording ring
    const recordingRing = document.getElementById('recordingRing');
    recordingRing.classList.add('hidden');
    recordingRing.classList.remove('animate-ping');
    
    // Update status
    statusText.textContent = 'Click the microphone to start speaking';
    statusText.classList.remove('bg-red-100');
    statusText.classList.add('bg-gray-100');
    
    isRecording = false;
}

// Handle recognition result
function handleRecognitionResult(event) {
    const result = event.results[0][0].transcript;
    addMessageToChat(result, 'user');
    generateAIResponse(result);
}

// Handle recognition error
function handleRecognitionError(event) {
    isRecording = false;
    handleRecognitionEnd();
    
    let errorMsg = "An error occurred during speech recognition. ";
    switch(event.error) {
        case 'network':
            errorMsg += "Please check your internet connection.";
            break;
        case 'not-allowed':
            errorMsg += "Please allow microphone access.";
            break;
        case 'no-speech':
            errorMsg += "No speech was detected. Please try again.";
            break;
        default:
            errorMsg += "Please try again.";
    }
    showError(errorMsg);
}

// Add message to chat
function addMessageToChat(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex items-start mb-4 ${sender === 'user' ? 'flex-row-reverse' : ''}`;

    const iconDiv = document.createElement('div');
    iconDiv.className = 'flex-shrink-0';
    iconDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full ${sender === 'user' ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center">
            <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'} text-white text-sm"></i>
        </div>
    `;

    const textDiv = document.createElement('div');
    textDiv.className = `${sender === 'user' ? 'mr-3 bg-green-100' : 'ml-3 bg-blue-100'} rounded-lg py-3 px-4 max-w-[80%]`;
    textDiv.innerHTML = `<p class="text-gray-800">${text}</p>`;

    if (sender === 'user') {
        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(iconDiv);
    } else {
        messageDiv.appendChild(iconDiv);
        messageDiv.appendChild(textDiv);
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Generate AI response
function generateAIResponse(userInput) {
    // Simulate AI processing delay
    setTimeout(() => {
        const responses = {
            greeting: [
                "Hello! How are you today?",
                "Hi there! Nice to meet you!",
                "Hey! How's it going?"
            ],
            question: [
                "That's an interesting question! Let me help you with that.",
                "Great question! Let's explore that together.",
                "I'd be happy to help you with that question."
            ],
            statement: [
                "I understand what you're saying. Could you tell me more?",
                "That's interesting! Let's discuss that further.",
                "I see what you mean. Would you like to elaborate?"
            ],
            default: [
                "Could you please rephrase that?",
                "Let's practice that sentence again.",
                "That's a good start! Try expressing it in a different way."
            ]
        };

        let responseType = 'default';
        const lowercaseInput = userInput.toLowerCase();

        if (lowercaseInput.includes('hello') || lowercaseInput.includes('hi') || lowercaseInput.includes('hey')) {
            responseType = 'greeting';
        } else if (lowercaseInput.includes('?')) {
            responseType = 'question';
        } else if (userInput.length > 20) {
            responseType = 'statement';
        }

        const possibleResponses = responses[responseType];
        const randomResponse = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
        
        addMessageToChat(randomResponse, 'ai');
    }, 1000);
}

// Clear chat
function clearChat() {
    while (chatContainer.firstChild) {
        chatContainer.removeChild(chatContainer.firstChild);
    }
    // Add welcome message back
    addMessageToChat("Hello! I'm your AI speaking assistant. Click the microphone button to start practicing your English speaking skills. I'll listen and respond to help you improve!", 'ai');
}

// Show error modal
function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.remove('hidden');
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeSpeechRecognition);