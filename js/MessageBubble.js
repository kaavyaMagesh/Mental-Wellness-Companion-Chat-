export function createMessageBubble(text, sender, timestamp) {
  const wrapper = document.createElement("div");

  wrapper.className =
    sender === "user"
      ? "message-row user-row"
      : "message-row assistant-row";

  const bubble = document.createElement("div");

  bubble.className =
    sender === "user"
      ? "message-bubble user-bubble"
      : "message-bubble assistant-bubble";

  bubble.innerHTML = `
      <p>${text}</p>
      <span class="timestamp">${timestamp}</span>
    `;

  wrapper.appendChild(bubble);

  return wrapper;
}