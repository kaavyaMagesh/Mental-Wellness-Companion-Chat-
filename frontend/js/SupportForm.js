import { supportTickets }
from "../data/mockSupportData.js";


export function renderSupportForm() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="flex h-screen w-screen overflow-hidden">
      <!-- SIDEBAR (Left panel for navigation) -->
      <aside id="sidebar" class="flex flex-col border-r border-cream-border w-64 bg-cream">
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
        </div>

        <div style="padding:10px 20px; flex-shrink:0; border-bottom:1px solid #d8d3c8;">
          <a href="chat.html" class="btn-primary" style="display:block; text-align:center; text-decoration:none; font-size:11px; padding:8px 14px;">
            ← Back to Chat
          </a>
        </div>

        <!-- Help/Settings mimic footer -->
        <div style="margin-top:auto; border-top:1px solid #d8d3c8; padding:10px 12px; flex-shrink:0;">
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

      <!-- MAIN CONTENT (Support Card Form) -->
      <main class="flex-1 flex items-center justify-center p-8 overflow-y-auto bg-cream">
        <div class="w-full max-w-2xl bg-white border border-cream-border rounded-xl p-8 shadow-sm flex flex-col gap-5">
          <h1 class="font-serif text-3xl text-warm-dark font-medium">Support Center</h1>
          <p class="text-sm text-warm-gray leading-relaxed">
            Submit a support request and our team will get back to you shortly.
          </p>

          <input
            id="subjectInput"
            type="text"
            placeholder="Subject"
            class="w-full p-3 border border-cream-border rounded-md text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange"
          />

          <select id="categoryInput" class="w-full p-3 border border-cream-border rounded-md text-sm outline-none bg-white focus:border-orange focus:ring-1 focus:ring-orange">
            <option value="">Select Category</option>
            <option value="Technical">Technical Issue</option>
            <option value="Account">Account</option>
            <option value="Billing">Billing</option>
            <option value="General">General</option>
          </select>

          <textarea
            id="descriptionInput"
            placeholder="Describe your issue..."
            class="w-full p-3 border border-cream-border rounded-md text-sm min-h-[140px] resize-y outline-none focus:border-orange focus:ring-1 focus:ring-orange"
          ></textarea>

          <select id="priorityInput" class="w-full p-3 border border-cream-border rounded-md text-sm outline-none bg-white focus:border-orange focus:ring-1 focus:ring-orange">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <button id="submitBtn" class="btn-primary w-full py-3 rounded-md font-medium text-sm transition-all duration-200">
            Submit Request
          </button>
        </div>
      </main>
    </div>
  `;

  document
    .getElementById("submitBtn")
    .addEventListener(
      "click",
      submitSupportRequest
    );
}

async function submitSupportRequest() {
  const subject =
    document
      .getElementById("subjectInput")
      .value.trim();

  const category =
    document.getElementById(
      "categoryInput"
    ).value;

  const description =
    document
      .getElementById(
        "descriptionInput"
      )
      .value.trim();

  const priority =
    document.getElementById(
      "priorityInput"
    ).value;

  if (
    !subject ||
    !category ||
    !description
  ) {
    alert(
      "Please complete all fields."
    );
    return;
  }

  const newTicket = {
    id: `SUP-${Date.now()}`,
    user: "Current User",
    category,
    priority,
    status: "Open",
    date: new Date()
      .toISOString()
      .split("T")[0],
    subject,
    description,
  };

  // Add to mock data
  supportTickets.unshift(
    newTicket
  );

  // Save to localStorage
  const storedTickets =
    JSON.parse(
      localStorage.getItem(
        "supportTickets"
      )
    ) || [];

  storedTickets.unshift(
    newTicket
  );

  localStorage.setItem(
    "supportTickets",
    JSON.stringify(
      storedTickets
    )
  );

  /*
    TODO:
    POST /api/support

    await fetch("/api/support", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        subject,
        category,
        description,
        priority
      })
    });
  */

  alert(
    "Support request submitted successfully."
  );

  document.getElementById(
    "subjectInput"
  ).value = "";

  document.getElementById(
    "categoryInput"
  ).selectedIndex = 0;

  document.getElementById(
    "descriptionInput"
  ).value = "";

  document.getElementById(
    "priorityInput"
  ).selectedIndex = 0;

  console.log(
    "Support Tickets:",
    storedTickets
  );
}