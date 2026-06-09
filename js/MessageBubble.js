export function createMessageBubble(
  text,
  sender,
  timestamp
) {
  const wrapper =
    document.createElement("div");

  wrapper.className =
    sender === "user"
      ? "message-row user-row"
      : "message-row assistant-row";

  const bubble =
    document.createElement("div");

  bubble.className =
    sender === "user"
      ? "message-bubble user-bubble"
      : "message-bubble assistant-bubble";

  const messageText =
    document.createElement("p");

  messageText.textContent = text;

  const time =
    document.createElement("span");

  time.className = "timestamp";
  time.textContent = timestamp;

  bubble.appendChild(messageText);
  bubble.appendChild(time);

  wrapper.appendChild(bubble);

  return wrapper;
}