import { createMessageBubble } from "./MessageBubble.js";

let sessions = [];
let currentSessionId = null;
let isLoadingOlderMessages = false;
let currentMessageOffset = 0;
const MESSAGE_LIMIT = 50;

const API_BASE_URL = "http://localhost:8000/api/chat";

export function renderChatLayout() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="flex h-full w-full overflow-hidden">
      <!-- SIDEBAR -->
      <aside id="sidebar">
        <!-- Brand -->
        <div style="border-bottom:1px solid #d8d3c8; padding:16px 20px; flex-shrink:0;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
            <div style="width:32px;height:32px;border-radius:6px;background:linear-gradient(135deg,#e8651a,#f0894d);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C8 2 4 4 4 8C4 10.2 5.8 12 8 12C10.2 12 12 10.2 12 8C12 5 9.5 3 8 2Z" fill="white" opacity=".9"/>
                <path d="M6 8.5C6.5 9.2 7.2 9.5 8 9.5" stroke="white" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
                <circle cx="8" cy="14" r="1" fill="white" opacity=".5"/>
              </svg>
            </div>
            <div>
              <p style="font-weight:500;font-size:12px;color:#2a2520;letter-spacing:-.3px;">InnerWhispers</p>
              <p style="font-size:9px;color:#8c8680;">Wellness Companion</p>
            </div>
          </div>
          <button class="btn-primary" style="width:100%;display:flex;align-items:center;justify-content:center;gap:7px;font-size:11px;padding:8px 14px;" id="newChatBtn">
            <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 11 11"><path d="M5.5 1v9M1 5.5h9"/></svg>
            New Chat
          </button>
        </div>

        <!-- Links to Support -->
        <div style="padding:10px 20px; flex-shrink:0; border-bottom:1px solid #d8d3c8;">
          <a href="support.html" class="btn-secondary" style="display:block; text-align:center; text-decoration:none; font-size:11px; padding:6px 12px;">
            Support Center
          </a>
        </div>

        <!-- Search -->
        <div style="padding:10px 12px 4px; flex-shrink:0;">
          <div class="search-wrap">
            <svg class="search-icon" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>
            <input type="text" class="search-input" placeholder="Search conversations…" id="searchInput" />
          </div>
        </div>

        <!-- Chat history -->
        <div style="flex:1;overflow:hidden;display:flex;flex-direction:column;">
          <div style="padding:10px 12px 6px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;">
            <p style="font-size:9px;font-weight:500;color:#8c8680;letter-spacing:.08em;text-transform:uppercase;">Recent</p>
            <button class="icon-btn" style="padding:3px;" title="Clear all" id="clearAllChatsBtn">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16"><path d="M2 4h12M5 4V3h6v1M6 7v5M10 7v5M4 4l1 9h6l1-9H4z"/></svg>
            </button>
          </div>
          <div style="flex:1;overflow-y:auto;padding:0 8px;" id="sessionList"></div>
        </div>

        <!-- Mood quick-log -->
        <div style="border-top:1px solid #d8d3c8;padding:10px 14px;flex-shrink:0;">
          <p style="font-size:9px;color:#8c8680;letter-spacing:.07em;text-transform:uppercase;margin-bottom:7px;">Today's Mood</p>
          <div style="display:flex;gap:2px;margin-bottom:7px;" id="sidebarMoodRow">
            <button class="mood-quick-btn" title="Very low" onclick="alert('Mood tracked: Very low')"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><path d="M6.5 13.5s1-2 3.5-2 3.5 2 3.5 2M7 8h.01M13 8h.01"/></svg><span>Very</span></button>
            <button class="mood-quick-btn" title="Low" onclick="alert('Mood tracked: Low')"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><path d="M7 12.5h6M7 8h.01M13 8h.01"/></svg><span>Low</span></button>
            <button class="mood-quick-btn" title="Neutral" onclick="alert('Mood tracked: Neutral')"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><path d="M7 12h6M7 8h.01M13 8h.01"/></svg><span>Neut</span></button>
            <button class="mood-quick-btn" title="Good" onclick="alert('Mood tracked: Good')"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><path d="M7 12s1 2 3 2 3-2 3-2M7 8h.01M13 8h.01"/></svg><span>Good</span></button>
            <button class="mood-quick-btn" title="Great" onclick="alert('Mood tracked: Great')"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><path d="M6.5 12s1.5 2.5 3.5 2.5 3.5-2.5 3.5-2.5M7 8h.01M13 8h.01"/></svg><span>Great</span></button>
          </div>
          <div class="mood-bar"><div class="mood-bar-fill" id="moodBarFill" style="width:55%"></div></div>
        </div>

        <!-- Profile / settings footer -->
        <div style="border-top:1px solid #d8d3c8;padding:10px 12px;flex-shrink:0;">
          <div style="width:100%;display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;">
            <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,rgba(232,101,26,.18),rgba(240,137,77,.15));display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="13" height="13" fill="none" stroke="#e8651a" stroke-width="1.5" viewBox="0 0 16 16"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>
            </div>
            <div style="flex:1;min-width:0;">
              <p style="font-size:11px;font-weight:500;color:#2a2520;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Guest User</p>
              <p style="font-size:9px;color:#8c8680;">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Sidebar Overlay -->
      <div id="sidebarOverlay"></div>

      <!-- MAIN AREA -->
      <div id="mainArea" class="flex flex-col h-full flex-1 overflow-hidden">
        <!-- Top bar -->
        <div id="topbar">
          <button class="icon-btn" id="hamburgerBtn" title="Menu" style="flex-shrink:0;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 20 20"><path d="M3 6h14M3 10h14M3 14h14"/></svg>
          </button>
          <div style="flex:1;min-width:0;">
            <h2 style="font-family:'Instrument Serif',Georgia,serif;font-size:clamp(14px,3vw,18px);color:#2a2520;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:7px;">
              Wellness Companion
              <span class="status-dot"></span>
            </h2>
            <p style="font-size:10px;color:#8c8680;">AI-powered support · Always here</p>
          </div>
          <div style="display:flex;align-items:center;gap:2px;flex-shrink:0;position:relative;">
            <button class="icon-btn" id="topbarBookmarkBtn" title="Bookmarks">
              🔖
            </button>
          </div>
        </div>

        <!-- Messages container -->
        <div id="chatContainer" class="messages-container flex-1 overflow-y-auto"></div>

        <!-- Suggested prompts -->
        <div id="suggestedPrompts" style="padding:12px 16px;display:grid;grid-template-columns:1fr 1fr;gap:8px;flex-shrink:0;">
          <div class="prompt-card" onclick="document.getElementById('messageInput').value='How can I improve my sleep quality?'; document.getElementById('messageInput').focus();">
            <div class="prompt-icon"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16"><path d="M13.5 10A6.5 6.5 0 0 1 6 2.5a6.5 6.5 0 1 0 7.5 7.5z"/></svg></div>
            <span style="font-size:clamp(11px,2.5vw,13px);">Improve sleep quality</span>
          </div>
          <div class="prompt-card" onclick="document.getElementById('messageInput').value='What are some quick stress relief techniques?'; document.getElementById('messageInput').focus();">
            <div class="prompt-icon"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16"><path d="M2 8h8a2 2 0 1 0-2-2M2 11h6a2 2 0 1 1-2 2" stroke-linecap="round"/></svg></div>
            <span style="font-size:clamp(11px,2.5vw,13px);">Stress relief</span>
          </div>
          <div class="prompt-card" onclick="document.getElementById('messageInput').value='Tell me about building healthy habits'; document.getElementById('messageInput').focus();">
            <div class="prompt-icon"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/><path d="M5.5 8.5l2 2 3.5-4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <span style="font-size:clamp(11px,2.5vw,13px);">Build healthy habits</span>
          </div>
          <div class="prompt-card" onclick="document.getElementById('messageInput').value='How do I manage anxiety in my daily life?'; document.getElementById('messageInput').focus();">
            <div class="prompt-icon"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16"><path d="M8 13.5S2 10 2 5.5A3.5 3.5 0 0 1 8 3.7 3.5 3.5 0 0 1 14 5.5C14 10 8 13.5 8 13.5z"/></svg></div>
            <span style="font-size:clamp(11px,2.5vw,13px);">Manage anxiety</span>
          </div>
        </div>

        <!-- Input Area -->
        <div id="inputArea">
          <div style="display:flex;gap:8px;align-items:flex-end;">
            <div style="flex:1;position:relative;">
              <textarea
                id="messageInput"
                class="input-field"
                style="height:44px;min-height:44px;padding-right:44px;resize:none;"
                placeholder="Share your thoughts…"
                maxlength="1000"
              ></textarea>
            </div>
            <button class="btn-primary" id="sendBtn" title="Send (Enter)" style="height:44px;width:44px;padding:0;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:4px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 16 16"><path d="M2 8h12M10 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:7px;">
            <p style="font-size:9px;color:#8c8680;display:flex;align-items:center;gap:4px;">
              <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5"/><path d="M6 5.5v3M6 4h.01"/></svg>
              Not a substitute for professional care
            </p>
            <p style="font-size:9px;color:rgba(140,134,128,.6);" class="hidden-mobile">Enter to send · Shift+Enter for newline</p>
          </div>
        </div>
      </div>

      <!-- BOOKMARK PANEL -->
      <aside id="bookmarkPanel" class="bookmark-panel">
        <div class="bookmark-panel-inner">
          <div class="bookmark-header">
            <h3 style="font-family:'Instrument Serif',serif;font-size:18px;color:#2a2520;">🔖 Bookmarks</h3>
            <button id="closeBookmarkBtn" class="close-bookmark-btn" title="Close Bookmarks">✕</button>
          </div>
          <div id="bookmarkList">
            <div style="font-size:12px;color:#8c8680;text-align:center;padding:12px 0;">
              No bookmarks yet
            </div>
          </div>
        </div>
      </aside>
    </div>
  `;

  setupEventListeners();
  initializeChat();
}

async function initializeChat() {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`);
    if (!response.ok) throw new Error("Failed to fetch sessions");
    sessions = await response.json();

    // Fetch the last message for each session to show as the preview
    await Promise.all(sessions.map(async (session) => {
      try {
        const msgRes = await fetch(`${API_BASE_URL}/sessions/${session.id}/messages`);
        if (msgRes.ok) {
          const messages = await msgRes.json();
          if (messages.length > 0) {
            session.preview = messages[messages.length - 1].message;
          }
        }
      } catch (e) {
        console.error("Error fetching preview for session", session.id, e);
      }
    }));

    if (sessions.length > 0) {
      currentSessionId = sessions[0].id;
      renderSessionList();
      await loadSessionMessages(currentSessionId);
    } else {
      renderSessionList();
      renderMessages([]);
    }
  } catch (error) {
    console.error("Error initializing chat:", error);
    renderSessionList();
    renderMessages([]);
  }
}

function renderSessionList() {
  const sessionList = document.getElementById("sessionList");
  sessionList.innerHTML = "";

  if (sessions.length === 0) {
    sessionList.innerHTML = `
      <div style="font-size:10px;color:#8c8680;text-align:center;padding:16px 0;">
        No conversations yet
      </div>
    `;
    return;
  }

  sessions.forEach((session) => {
    const item = document.createElement("div");
    item.className = 'chat-item relative group' + (session.id === currentSessionId ? ' active' : '');
    
    const title = session.title || "New Conversation";
    const preview = session.preview || "No messages yet";
    const dateStr = session.last_message_at
      ? new Date(session.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "Now";

    item.innerHTML = `
      <div class="session-click-area" style="padding:10px 32px 10px 10px;border-radius:6px;cursor:pointer;display:flex;align-items:flex-start;justify-content:space-between;">
        <div style="flex:1;min-width:0;margin-right:8px;">
          <h4 style="font-size:12px;font-weight:500;color:#2a2520;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0 0 2px 0;">${title}</h4>
          <p style="font-size:10px;color:#8c8680;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0;">${preview}</p>
        </div>
        <span style="font-size:9px;color:#b8b4ae;flex-shrink:0;margin-top:2px;">${dateStr}</span>
      </div>
      <!-- 3 dots action menu -->
      <div class="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
        <button class="menu-dots-btn text-warm-gray hover:text-warm-dark p-1 rounded hover:bg-cream-dark" style="font-size: 14px; line-height: 1;">⋮</button>
        <div class="delete-dropdown hidden absolute right-0 mt-1 bg-white border border-cream-border rounded shadow-lg py-1 z-20 min-w-[80px]">
          <button class="delete-session-btn text-xs text-red-600 hover:bg-red-50 w-full text-left px-3 py-1.5 font-medium">Delete</button>
        </div>
      </div>
    `;

    // Click to load conversation
    item.querySelector('.session-click-area').addEventListener("click", () => selectSession(session.id));

    // Options dropdown toggler
    const dotsBtn = item.querySelector('.menu-dots-btn');
    const dropdown = item.querySelector('.delete-dropdown');
    dotsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Close other open delete dropdowns
      document.querySelectorAll('.delete-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.add('hidden');
      });
      dropdown.classList.toggle('hidden');
    });


    // Delete session button logic
    const deleteBtn = item.querySelector('.delete-session-btn');
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      dropdown.classList.add('hidden');
      if (confirm(`Delete "${title}"?`)) {
        try {
          const res = await fetch(`${API_BASE_URL}/sessions/${session.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete session from server");
          
          // Remove from local memory state
          sessions = sessions.filter(s => s.id !== session.id);
          renderSessionList();
          
          if (currentSessionId === session.id) {
            if (sessions.length > 0) {
              selectSession(sessions[0].id);
            } else {
              currentSessionId = null;
              renderMessages([]);
            }
          }
        } catch (err) {
          console.error(err);
          alert("Could not delete conversation. Please try again.");
        }
      }
    });

    sessionList.appendChild(item);
  });
}

function renderMessages(messages = []) {
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.innerHTML = "";

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
    const text = message.message;
    const sender = message.sender; // 'user' or 'assistant'
    const time = message.created_at
      ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "Now";
    chatContainer.appendChild(createMessageBubble(text, sender, time));
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function loadSessionMessages(sessionId) {
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.innerHTML = "";
  currentMessageOffset = 0;

  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "empty-state";
  loadingIndicator.innerText = "Loading messages...";
  chatContainer.appendChild(loadingIndicator);

  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages?limit=${MESSAGE_LIMIT}&offset=0`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    const messages = await response.json();
    currentMessageOffset = messages.length;
    renderMessages(messages);
  } catch (error) {
    console.error("Error loading messages:", error);
    renderMessages([]);
  }
}

async function selectSession(sessionId) {
  currentSessionId = sessionId;
  renderSessionList();
  await loadSessionMessages(sessionId);
  console.log("Loaded Session:", sessionId);
}

function setupEventListeners() {
  const sendBtn = document.getElementById("sendBtn");
  const bookmarkBtn = document.getElementById("topbarBookmarkBtn");
  const bookmarkPanel = document.getElementById("bookmarkPanel");

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", () => {
      bookmarkPanel.classList.toggle("open");
    });
  }

  const closeBookmarkBtn = document.getElementById("closeBookmarkBtn");
  if (closeBookmarkBtn) {
    closeBookmarkBtn.addEventListener("click", () => {
      bookmarkPanel.classList.remove("open");
    });
  }

  const input = document.getElementById("messageInput");
  const newChatBtn = document.getElementById("newChatBtn");
  const chatContainer = document.getElementById("chatContainer");

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  newChatBtn.addEventListener("click", createNewSession);
  chatContainer.addEventListener("scroll", handleInfiniteScroll);

  // Search input filtering
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value.toLowerCase();
      document.querySelectorAll("#sessionList .chat-item").forEach(item => {
        const titleText = item.querySelector("h4").textContent.toLowerCase();
        const previewText = item.querySelector("p").textContent.toLowerCase();
        if (titleText.includes(val) || previewText.includes(val)) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }
      });
    });
  }

  // Clear all sessions logic
  const clearBtn = document.getElementById("clearAllChatsBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      if (sessions.length === 0) return;
      if (confirm("Clear all conversations? This deletes them permanently.")) {
        for (const s of sessions) {
          try {
            await fetch(`${API_BASE_URL}/sessions/${s.id}`, { method: "DELETE" });
          } catch (e) {
            console.error("Failed to delete session ID:", s.id, e);
          }
        }
        sessions = [];
        currentSessionId = null;
        renderSessionList();
        renderMessages([]);
      }
    });
  }

  // Global click handler to close delete dropdowns
  document.addEventListener("click", () => {
    document.querySelectorAll('.delete-dropdown').forEach(d => d.classList.add('hidden'));
  });
}

function createTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  return indicator;
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const chatContainer = document.getElementById("chatContainer");
  const content = input.value.trim();

  if (!content) {
    input.focus();
    return;
  }

  if (content.length > 1000) {
    alert("Message is too long. Please keep it under 1000 characters.");
    return;
  }

  if (!currentSessionId) {
    await createNewSession();
  }

  // Pre-render user message
  chatContainer.appendChild(
    createMessageBubble(
      content,
      "user",
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  );

  input.value = "";
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const typingIndicator = createTypingIndicator();
  chatContainer.appendChild(typingIndicator);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${currentSessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: content
      })
    });

    typingIndicator.remove();

    if (!response.ok) throw new Error("Failed to send message");

    const messages = await response.json(); // [user_message, ai_message]
    const aiMessage = messages.find((m) => m.sender === "assistant");

    if (aiMessage) {
      chatContainer.appendChild(
        createMessageBubble(
          aiMessage.message,
          "assistant",
          new Date(aiMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        )
      );

      // Update session preview in the list
      const currentSession = sessions.find((s) => s.id === currentSessionId);
      if (currentSession) {
        currentSession.preview = aiMessage.message;
        currentSession.last_message_at = aiMessage.created_at;
        renderSessionList();
      }
    }
  } catch (error) {
    console.error(error);
    typingIndicator.remove();
    chatContainer.appendChild(
      createMessageBubble(
        "Unable to send message. Please check your connection and try again.",
        "assistant",
        "Now"
      )
    );
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function createNewSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "New Conversation",
        system_context: "You are a helpful and supportive AI Wellness Companion."
      })
    });

    if (!response.ok) throw new Error("Failed to create session");
    const newSession = await response.json();

    sessions.unshift(newSession);
    currentSessionId = newSession.id;

    renderSessionList();
    renderMessages([]);
  } catch (error) {
    console.error("Error creating session:", error);
    alert("Could not start a new conversation. Please try again.");
  }
}

function handleInfiniteScroll() {
  const chatContainer = document.getElementById("chatContainer");
  if (chatContainer.scrollTop === 0 && !isLoadingOlderMessages) {
    loadOlderMessages();
  }
}

async function loadOlderMessages() {
  if (!currentSessionId) return;
  isLoadingOlderMessages = true;

  const chatContainer = document.getElementById("chatContainer");
  const previousHeight = chatContainer.scrollHeight;

  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${currentSessionId}/messages?limit=${MESSAGE_LIMIT}&offset=${currentMessageOffset}`);
    if (!response.ok) throw new Error("Failed to fetch older messages");
    const messages = await response.json();

    if (messages.length > 0) {
      currentMessageOffset += messages.length;

      // Since the endpoint returns oldest first, we prepend them in order
      messages.forEach((message) => {
        const text = message.message;
        const sender = message.sender;
        const time = message.created_at
          ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : "Now";
        chatContainer.prepend(createMessageBubble(text, sender, time));
      });

      const newHeight = chatContainer.scrollHeight;
      chatContainer.scrollTop = newHeight - previousHeight;
      console.log("Loaded older messages");
    }
  } catch (error) {
    console.error("Error loading older messages:", error);
  } finally {
    isLoadingOlderMessages = false;
  }
}