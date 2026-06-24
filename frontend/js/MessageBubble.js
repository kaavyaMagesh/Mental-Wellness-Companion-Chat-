export function createMessageBubble(
  text,
  sender,
  timestamp
) {
  const wrapper = document.createElement("div");
  wrapper.className = `message-row ${sender === "user" ? "user-row message-user" : "ai-row message-ai"} group`;

  const bubble = document.createElement("div");
  bubble.className = sender === "user" ? "bubble-user" : "bubble-ai";

  const messageText = document.createElement("p");
  messageText.textContent = text;
  bubble.appendChild(messageText);

  // Hover actions (optional bonus to match design spec)
  const actions = document.createElement("div");
  actions.className = "msg-actions";
  actions.innerHTML = `
    <button class="msg-action-btn" onclick="navigator.clipboard.writeText('${text.replace(/'/g, "\\'")}').then(() => { this.innerText='Copied'; this.classList.add('copied'); setTimeout(() => { this.innerText='Copy'; this.classList.remove('copied'); }, 1500); })">
      Copy
    </button>
  `;
  bubble.appendChild(actions);

  wrapper.appendChild(bubble);

  // Time stamp element (placed outside bubble for premium styling and high readability)
  const timestampElement = document.createElement("span");
  timestampElement.className = "msg-time block px-1";
  timestampElement.textContent = timestamp;
  wrapper.appendChild(timestampElement);

  return wrapper;
}