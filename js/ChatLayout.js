import {
  mockSessions,
  sessionMessages,
  olderMessages,
} from "../data/mockChatData.js";

import { createMessageBubble }
from "./MessageBubble.js";

let sessions = [...mockSessions];

let currentSessionId =
  sessions[0]?.id || null;

let isLoadingOlderMessages = false;

export function renderChatLayout() {
  const app =
    document.getElementById("app");

  app.innerHTML = `
    <div class="chat-layout">

      <aside class="sidebar">

        <div class="logo-section">
          <h2>🌿 Wellness AI</h2>
          <p>Mind. Body. Balance.</p>
        </div>

        <div class="nav-links">
         <a href="support.html" class="nav-btn">
  Support Center
</a>
        </div>

        <button
          class="new-chat-btn"
          id="newChatBtn"
        >
          ✨ New Chat
        </button>

        <div id="sessionList"></div>

      </aside>

      <main class="chat-window">

  <div class="chat-header">

    <div>
      <h2>AI Companion</h2>

      <span class="online-status">
        ● Online • Created Jun 8, 2026
      </span>
    </div>

    <button
      id="bookmarkBtn"
      class="bookmark-btn"
      title="Bookmarks"
    >
      🔖
    </button>

  </div>

  <div
    id="chatContainer"
    class="messages-container"
  ></div>

  <div class="chat-input-container">

    <input
      id="messageInput"
      placeholder="Type your message here..."
    />

    <button id="sendBtn">
      ➤
    </button>

  </div>

</main>

<aside
  id="bookmarkPanel"
  class="bookmark-panel"
>
  <div class="bookmark-panel-inner">
    <div class="bookmark-header">
      <h3>🔖 Bookmarked Messages</h3>
      <button id="closeBookmarkBtn" class="close-bookmark-btn" title="Close Bookmarks">✕</button>
    </div>

    <div id="bookmarkList">
      <div class="bookmark-item">
        No bookmarks yet
      </div>
    </div>
  </div>
</aside>
    </div>
  `;

  renderSessionList();
  renderMessages();
  setupEventListeners();
}

function renderSessionList() {
  const sessionList =
    document.getElementById(
      "sessionList"
    );

  sessionList.innerHTML = "";

  if (sessions.length === 0) {
    sessionList.innerHTML = `
      <div class="empty-state">
        No conversations yet.
        <br>
        Start a new chat.
      </div>
    `;
    return;
  }

  sessions.forEach((session) => {
    const item =
      document.createElement("div");

    item.className =
      currentSessionId === session.id
        ? "conversation-item active"
        : "conversation-item";

    item.innerHTML = `
      <h4>${session.title}</h4>
      <p>${session.preview}</p>
      <span>${session.time}</span>
    `;

    item.addEventListener(
      "click",
      () => selectSession(session.id)
    );

    sessionList.appendChild(item);
  });
}

function renderMessages() {
  const chatContainer =
    document.getElementById(
      "chatContainer"
    );

  chatContainer.innerHTML = "";

  const messages =
    sessionMessages[
      currentSessionId
    ] || [];

  if (messages.length === 0) {
    chatContainer.innerHTML = `
      <div class="empty-state">
        No messages yet.
        <br>
        Start the conversation.
      </div>
    `;
    return;
  }

  messages.forEach((message) => {
    chatContainer.appendChild(
      createMessageBubble(
        message.text,
        message.sender,
        message.timestamp
      )
    );
  });

  chatContainer.scrollTop =
    chatContainer.scrollHeight;
}

function setupEventListeners() {
  const sendBtn =
    document.getElementById(
      "sendBtn"
    );
const bookmarkBtn =
  document.getElementById(
    "bookmarkBtn"
  );

const bookmarkPanel =
  document.getElementById(
    "bookmarkPanel"
  );

bookmarkBtn.addEventListener(
  "click",
  () => {
    bookmarkPanel.classList.toggle(
      "open"
    );
  }
);

const closeBookmarkBtn = document.getElementById("closeBookmarkBtn");
if (closeBookmarkBtn) {
  closeBookmarkBtn.addEventListener("click", () => {
    bookmarkPanel.classList.remove("open");
  });
}
  const input =
    document.getElementById(
      "messageInput"
    );

  const newChatBtn =
    document.getElementById(
      "newChatBtn"
    );

  const chatContainer =
    document.getElementById(
      "chatContainer"
    );

  sendBtn.addEventListener(
    "click",
    sendMessage
  );

  input.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") {
        sendMessage();
      }
    }
  );

  newChatBtn.addEventListener(
    "click",
    createNewSession
  );

  chatContainer.addEventListener(
    "scroll",
    handleInfiniteScroll
  );
}

function createTypingIndicator() {
  const indicator =
    document.createElement("div");

  indicator.className =
    "typing-indicator";

  indicator.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  return indicator;
}

async function sendMessage() {
  const input =
    document.getElementById(
      "messageInput"
    );

  const chatContainer =
    document.getElementById(
      "chatContainer"
    );

  const content =
    input.value.trim();

  if (!content) {
  input.focus();
  return;
}

if (content.length > 1000) {
  alert(
    "Message is too long. Please keep it under 1000 characters."
  );
  return;
}

  const userMessage = {
    text: content,
    sender: "user",
    timestamp: "Now",
  };

  if (
  !sessionMessages[
    currentSessionId
  ]
) {
  sessionMessages[
    currentSessionId
  ] = [];
}

sessionMessages[
  currentSessionId
].push(userMessage);

  chatContainer.appendChild(
    createMessageBubble(
      userMessage.text,
      userMessage.sender,
      userMessage.timestamp
    )
  );

  input.value = "";

  chatContainer.scrollTop =
    chatContainer.scrollHeight;

  const typingIndicator =
    createTypingIndicator();

  chatContainer.appendChild(
    typingIndicator
  );

  chatContainer.scrollTop =
    chatContainer.scrollHeight;

  try {
    /*
    TODO:

    POST
    /api/chat/sessions/:id/messages

    const response = await fetch(
      `/api/chat/sessions/${currentSessionId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          message: content
        })
      }
    );
    */
    const timeoutId =
  setTimeout(() => {

    typingIndicator.remove();

    chatContainer.appendChild(
      createMessageBubble(
        "The AI is taking longer than expected. Please try again shortly.",
        "ai",
        "Now"
      )
    );

    chatContainer.scrollTop =
      chatContainer.scrollHeight;

  }, 5000);
    await new Promise(
      (resolve) =>
        setTimeout(resolve, 1500)
    );
    clearTimeout(timeoutId);
    typingIndicator.remove();

    const aiMessage = {
      text:
        "I'm here to help. Tell me more about how you're feeling.",
      sender: "ai",
      timestamp: "Now",
    };

    sessionMessages[
      currentSessionId
    ].push(aiMessage);

    chatContainer.appendChild(
      createMessageBubble(
        aiMessage.text,
        aiMessage.sender,
        aiMessage.timestamp
      )
    );
  } catch (error) {
  console.error(error);

  typingIndicator.remove();

  chatContainer.appendChild(
    createMessageBubble(
      "Unable to send message. Please check your connection and try again.",
      "ai",
      "Now"
    )
  );
  }

  chatContainer.scrollTop =
    chatContainer.scrollHeight;
}

function createNewSession() {
  /*
  TODO:
  POST /api/chat/sessions
  */

  const newSession = {
    id: Date.now(),
    title: "New Conversation",
    preview: "Start chatting...",
    time: "Now",
  };

  sessions.unshift(newSession);

  sessionMessages[
    newSession.id
  ] = [];

  currentSessionId =
    newSession.id;

  renderSessionList();
  renderMessages();
}

function selectSession(sessionId) {
  /*
  TODO:
  GET /api/chat/sessions/:id
  */

  currentSessionId =
    sessionId;

  renderSessionList();
  renderMessages();

  console.log(
    "Loaded Session:",
    sessionId
  );
}

function handleInfiniteScroll() {
  const chatContainer =
    document.getElementById(
      "chatContainer"
    );

  if (
    chatContainer.scrollTop === 0 &&
    !isLoadingOlderMessages
  ) {
    loadOlderMessages();
  }
}

function loadOlderMessages() {
  isLoadingOlderMessages = true;

  const chatContainer =
    document.getElementById(
      "chatContainer"
    );

  const previousHeight =
    chatContainer.scrollHeight;

  olderMessages
    .slice()
    .reverse()
    .forEach((message) => {
      chatContainer.prepend(
        createMessageBubble(
          message.text,
          message.sender,
          message.timestamp
        )
      );
    });

  const newHeight =
    chatContainer.scrollHeight;

  chatContainer.scrollTop =
    newHeight - previousHeight;

  console.log(
    "Loaded older messages"
  );

  isLoadingOlderMessages = false;
}