import { createSupportTable } from "./SupportTable.js";
import { users } from "../data/mockSupportData.js";

export function renderAdminLayout() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="flex h-screen w-screen overflow-hidden">
      <!-- SIDEBAR -->
      <aside id="sidebar" class="flex flex-col border-r border-cream-border w-64 bg-cream flex-shrink-0">
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

        <div style="padding:10px 20px; flex-shrink:0; border-bottom:1px solid #d8d3c8; display: flex; flex-direction: column; gap: 8px;">
          <a href="chat.html" class="btn-primary" style="display:block; text-align:center; text-decoration:none; font-size:11px; padding:8px 14px;">
            ← Back to Chat
          </a>
          <a href="assessment.html" class="btn-secondary" style="display:block; text-align:center; text-decoration:none; font-size:11px; padding:8px 14px;">
            PHQ-9 Assessment
          </a>
        </div>

        <!-- Navigation list -->
        <nav class="flex-1 p-4 flex flex-col gap-2">
          <div class="nav-item active px-3 py-2 rounded-md bg-orange/10 text-orange font-medium text-sm cursor-pointer">
            Support Requests
          </div>
          <div class="nav-item px-3 py-2 rounded-md hover:bg-orange/5 text-warm-gray hover:text-warm-dark text-sm cursor-pointer">
            Users
          </div>
          <div class="nav-item px-3 py-2 rounded-md hover:bg-orange/5 text-warm-gray hover:text-warm-dark text-sm cursor-pointer">
            Reports
          </div>
          <div class="nav-item px-3 py-2 rounded-md hover:bg-orange/5 text-warm-gray hover:text-warm-dark text-sm cursor-pointer">
            Settings
          </div>
        </nav>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 p-8 overflow-y-auto bg-cream">
        <div class="admin-header mb-6">
          <h1 class="font-serif text-3xl text-warm-dark font-medium">Support Request Dashboard</h1>
        </div>

        <div id="supportTableMount" class="bg-white border border-cream-border rounded-xl p-6 shadow-sm mb-8"></div>

        <div class="user-section">
          <h2 class="font-serif text-2xl text-warm-dark font-medium mb-4">Users</h2>
          <div id="userList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
        </div>
      </main>
    </div>
  `;

  const tableMount =
    document.getElementById("supportTableMount");

  tableMount.appendChild(
    createSupportTable()
  );

  const userList =
    document.getElementById("userList");

  users.forEach((user) => {
    const card = document.createElement("div");

    card.className = "bg-white border border-cream-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200";

    card.innerHTML = `
      <strong class="text-sm font-medium text-warm-dark block mb-1">${user.name}</strong>
      <p class="text-xs text-warm-gray mb-2">${user.email}</p>
      <span class="inline-block text-[10px] uppercase tracking-wider font-semibold text-orange bg-orange/10 px-2 py-0.5 rounded">${user.role}</span>
    `;

    userList.appendChild(card);
  });
}