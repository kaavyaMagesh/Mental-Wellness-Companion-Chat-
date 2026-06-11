import { supportTickets }
from "../data/mockSupportData.js";


export function renderSupportForm() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="support-page">

      <div class="support-card">

        <h1>Support Center</h1>

        <p class="subtitle">
          Submit a support request and our team
          will get back to you shortly.
        </p>

        <input
          id="subjectInput"
          type="text"
          placeholder="Subject"
        />

        <select id="categoryInput">
          <option value="">
            Select Category
          </option>

          <option value="Technical">
            Technical Issue
          </option>

          <option value="Account">
            Account
          </option>

          <option value="Billing">
            Billing
          </option>

          <option value="General">
            General
          </option>
        </select>

        <textarea
          id="descriptionInput"
          placeholder="Describe your issue..."
        ></textarea>

        <select id="priorityInput">
          <option value="Low">
            Low
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="High">
            High
          </option>
        </select>

        <button id="submitBtn">
          Submit Request
        </button>

      </div>

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