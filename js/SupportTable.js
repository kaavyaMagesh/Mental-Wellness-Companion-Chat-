import { supportTickets }
from "../data/mockSupportData.js";

export function createSupportTable() {
  const container =
    document.createElement("div");

  container.className =
    "support-table-container";

  const storedTickets =
    JSON.parse(
      localStorage.getItem(
        "supportTickets"
      )
    ) || [];

  const allTickets = [
    ...storedTickets,
    ...supportTickets,
  ];

  let tableRows = "";

  allTickets.forEach((ticket) => {
    tableRows += `
      <tr>
        <td>${ticket.id}</td>
        <td>${ticket.user}</td>
        <td>${ticket.date}</td>
        <td>${ticket.category}</td>
        <td>${ticket.priority}</td>
        <td>
          <span
            class="status-badge ${ticket.status
              .toLowerCase()
              .replace(" ", "-")}"
          >
            ${ticket.status}
          </span>
        </td>
        <td>
          <button
            class="action-btn"
          >
            View
          </button>
        </td>
      </tr>
    `;
  });

  container.innerHTML = `
    <table class="support-table">

      <thead>
        <tr>
          <th>ID</th>
          <th>User</th>
          <th>Date</th>
          <th>Category</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        ${tableRows}
      </tbody>

    </table>
  `;

  return container;
}