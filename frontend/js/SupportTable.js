import { supportTickets }
from "../data/mockSupportData.js";

export function createSupportTable() {
  const container =
    document.createElement("div");

  container.className = "overflow-x-auto";

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
  container.innerHTML = `
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-cream-dark/20 text-warm-dark font-medium text-sm">
          <th class="px-4 py-3">ID</th>
          <th class="px-4 py-3">User</th>
          <th class="px-4 py-3">Date</th>
          <th class="px-4 py-3">Category</th>
          <th class="px-4 py-3">Priority</th>
          <th class="px-4 py-3">Status</th>
          <th class="px-4 py-3">Action</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const tbody = container.querySelector("tbody");

  allTickets.forEach((ticket) => {
    let statusClass = "bg-orange/10 text-orange";
    if (ticket.status.toLowerCase() === "resolved") {
      statusClass = "bg-green-100 text-green-800";
    } else if (ticket.status.toLowerCase() === "in progress") {
      statusClass = "bg-yellow-100 text-yellow-800";
    }

    const row = document.createElement("tr");
    row.className = "border-t border-cream-border hover:bg-cream-dark/5 transition-colors duration-150";
    row.innerHTML = `
      <td class="px-4 py-3 text-xs font-mono text-warm-dark">${ticket.id}</td>
      <td class="px-4 py-3 text-sm text-warm-dark">${ticket.user}</td>
      <td class="px-4 py-3 text-sm text-warm-gray">${ticket.date}</td>
      <td class="px-4 py-3 text-sm text-warm-dark">${ticket.category}</td>
      <td class="px-4 py-3 text-sm text-warm-dark">${ticket.priority}</td>
      <td class="px-4 py-3 text-xs">
        <span class="inline-block px-2.5 py-0.5 rounded-full font-medium ${statusClass}">
          ${ticket.status}
        </span>
      </td>
      <td class="px-4 py-3 text-sm">
        <button class="view-ticket-btn bg-orange hover:bg-orange-light text-white px-3 py-1 rounded text-xs transition-colors duration-150">
          View
        </button>
      </td>
    `;

    row.querySelector(".view-ticket-btn").addEventListener("click", () => {
      showTicketModal(ticket);
    });

    tbody.appendChild(row);
  });

  return container;
}

function showTicketModal(ticket) {
  // Check if modal container already exists
  let modal = document.getElementById("ticketDetailsModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "ticketDetailsModal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="modal-box" style="max-width: 500px;" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3 class="font-serif text-lg text-warm-dark font-medium">Ticket Details (${ticket.id})</h3>
        <button class="close-modal-btn icon-btn"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12"/></svg></button>
      </div>
      <div style="padding: 20px;" class="flex flex-col gap-4">
        <div>
          <label class="text-[10px] text-warm-gray uppercase tracking-wider block mb-1">Subject</label>
          <p class="text-sm font-semibold text-warm-dark">${ticket.subject || 'No Subject'}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] text-warm-gray uppercase tracking-wider block mb-1">Category</label>
            <p class="text-xs text-warm-dark">${ticket.category}</p>
          </div>
          <div>
            <label class="text-[10px] text-warm-gray uppercase tracking-wider block mb-1">Priority</label>
            <p class="text-xs text-warm-dark">${ticket.priority}</p>
          </div>
        </div>
        <div>
          <label class="text-[10px] text-warm-gray uppercase tracking-wider block mb-1">Description</label>
          <p class="text-xs text-warm-dark leading-relaxed whitespace-pre-wrap bg-cream-dark/10 p-3 border border-cream-border rounded">${ticket.description || 'No description provided.'}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] text-warm-gray uppercase tracking-wider block mb-1">Submitted By</label>
            <p class="text-xs text-warm-dark">${ticket.user}</p>
          </div>
          <div>
            <label class="text-[10px] text-warm-gray uppercase tracking-wider block mb-1">Date</label>
            <p class="text-xs text-warm-dark">${ticket.date}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const closeBtn = modal.querySelector(".close-modal-btn");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Clicking overlay backdrop closes the modal
  modal.addEventListener("click", () => {
    modal.style.display = "none";
  });
}