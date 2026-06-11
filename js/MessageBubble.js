export function createMessageBubble(
  text,
  sender,
  timestamp
) {
  const wrapper =
    document.createElement("div");

  wrapper.classList.add(
    "message-row"
  );

  wrapper.classList.add(
    sender === "user"
      ? "user-row"
      : "assistant-row"
  );

  const bubble =
    document.createElement("div");

  bubble.classList.add(
    "message-bubble"
  );

  bubble.classList.add(
    sender === "user"
      ? "user-bubble"
      : "assistant-bubble"
  );

  const messageText =
    document.createElement("p");

  messageText.textContent =
    text;

  const timestampElement =
    document.createElement("span");

  timestampElement.className =
    "timestamp";

  timestampElement.textContent =
    timestamp;

  bubble.appendChild(
    messageText
  );

  bubble.appendChild(
    timestampElement
  );

  wrapper.appendChild(
    bubble
  );

  return wrapper;
}