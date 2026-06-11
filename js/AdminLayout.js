import { createSupportTable } from "./SupportTable.js";
import { users } from "../data/mockSupportData.js";

export function renderAdminLayout() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="admin-layout">

      <aside class="admin-sidebar">
        <h2>🌿 Wellness Admin</h2>
<div class="nav-links">

</div>
        <nav>
          <div class="nav-item active">
            Support Requests
          </div>

          <div class="nav-item">
            Users
          </div>

          <div class="nav-item">
            Reports
          </div>

          <div class="nav-item">
            Settings
          </div>
        </nav>
      </aside>

      <main class="admin-main">

        <div class="admin-header">
          <h1>Support Request Dashboard</h1>
        </div>

        <div id="supportTableMount"></div>

        <div class="user-section">
          <h2>Users</h2>

          <div id="userList"></div>
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

    card.className = "user-card";

    card.innerHTML = `
      <strong>${user.name}</strong>
      <p>${user.email}</p>
      <span>${user.role}</span>
    `;

    userList.appendChild(card);
  });
}