import { mockSessions, messages } from "../data/mockChatData.js";
import { createMessageBubble } from "./MessageBubble.js";

let sessions = [...mockSessions];
let currentSessionId = sessions[0]?.id || null;

export function renderChatLayout() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="chat-layout">

      <aside class="sidebar">

        <div class="logo-section">
          <h2>🌿 Wellness AI</h2>
          <p>Mind. Body. Balance.</p>
        </div>

        <div class="nav-links">
          <a href="admin.html" class="nav-btn">
            Admin Panel →
          </a>
        </div>

        <button class="new-chat-btn" id="newChatBtn">
          ✨ New Chat
        </button>

        <div id="sessionList"></div>

      </aside>

      <main class="chat-window">

        <div class="chat-header">
          <div>
            <h2>AI Companion</h2>
            <span class="online-status">
              ● Online
            </span>
          </div>
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

      <aside class="info-panel">

        <div class="info-card">
          <h3>Session Details</h3>
          <p>Created: Jun 8, 2026</p>
          <p>Messages: 24</p>
        </div>

        <div class="info-card">
          <h3>Wellness Tip</h3>
          <p>Take a short walk today.</p>
        </div>

        <div class="info-card">
          <h3>Resource</h3>
          <p>5-Minute Breathing Exercise</p>
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
    document.getElementById("sessionList");

  sessionList.innerHTML = "";

  sessions.forEach((session) => {
    const item = document.createElement("div");

    item.className =
      currentSessionId === session.id
        ? "conversation-item active"
        : "conversation-item";

    item.innerHTML = `
      <h4>${session.title}</h4>
      <p>${session.preview}</p>
      <span>${session.time}</span>
    `;

    item.addEventListener("click", () => {
      selectSession(session.id);
    });

    sessionList.appendChild(item);
  });
}

function renderMessages() {
  const chatContainer =
    document.getElementById("chatContainer");

  chatContainer.innerHTML = "";

  messages.forEach((message) => {
    chatContainer.appendChild(
      createMessageBubble(
        message.text,
        message.sender,
        message.timestamp
      )
    );
  });
}

function setupEventListeners() {
  const sendBtn =
    document.getElementById("sendBtn");

  const input =
    document.getElementById("messageInput");

  const newChatBtn =
    document.getElementById("newChatBtn");

  sendBtn.addEventListener("click", () => {
    const value = input.value.trim();

    if (!value) return;

    const chatContainer =
      document.getElementById("chatContainer");

    chatContainer.appendChild(
      createMessageBubble(
        value,
        "user",
        "Now"
      )
    );

    input.value = "";

    chatContainer.scrollTop =
      chatContainer.scrollHeight;
  });

  newChatBtn.addEventListener(
    "click",
    createNewSession
  );
}

function createNewSession() {
  // TODO: Replace with POST /api/chat/sessions

  const newSession = {
    id: Date.now(),
    title: "New Conversation",
    preview: "Start chatting...",
    time: "Now",
  };

  sessions.unshift(newSession);

  currentSessionId = newSession.id;

  renderSessionList();
}

function selectSession(sessionId) {
  // TODO: Replace with GET /api/chat/sessions/:id

  currentSessionId = sessionId;

  renderSessionList();

  console.log(
    "Selected Session:",
    sessionId
  );
}