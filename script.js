document.addEventListener("DOMContentLoaded", function () {
  const taskTableBody = document.getElementById("taskTableBody");
  const searchInput = document.getElementById("searchInput");
  const addTaskForm = document.getElementById("addTaskForm");
  const toast = new bootstrap.Toast(document.getElementById("copyToast"));
  const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
  const logoutModal = new bootstrap.Modal(document.getElementById("logoutModal"));
  const loginForm = document.getElementById("loginForm");

  const mainContent = document.getElementById("mainContent");
  const addButton = document.getElementById("addButtonContainer");
  const logoutContainer = document.getElementById("logoutContainer");

  let taskData = [];

  // Fetch JSON data
  async function fetchData() {
    try {
      const res = await fetch("data.json");
      taskData = await res.json();
      renderTable(taskData);
    } catch (error) {
      console.error("Failed to load JSON data:", error);
    }
  }

  function renderTable(data) {
    taskTableBody.innerHTML = "";
    data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.task}</td>
        <td class="cursor-pointer copyable">${item.select}</td>
        <td class="cursor-pointer copyable">${item.update}</td>
      `;

      // Copy to clipboard on click
      tr.querySelectorAll(".copyable").forEach(cell => {
        cell.addEventListener("click", () => {
          navigator.clipboard.writeText(cell.textContent).then(() => {
            toast.show();
          });
        });
      });

      taskTableBody.appendChild(tr);
    });
  }

  // Search functionality
  searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();
    const filtered = taskData.filter((item) =>
      item.task.toLowerCase().includes(value)
    );
    renderTable(filtered);
  });

  // Login form submission
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const user = document.getElementById("loginUsername").value.trim();
    const pass = document.getElementById("loginPassword").value.trim();
    const err = document.getElementById("loginError");

    const isAdmin = user === "krunal" && pass === "Krunal";

    if ((user === "kkk" && pass === "kkk") || isAdmin) {
      localStorage.setItem("loggedInUser", user);
      localStorage.setItem("userRole", isAdmin ? "admin" : "basic");

      loginModal.hide();
      mainContent.classList.remove("d-none");
      logoutContainer.classList.remove("d-none");

      if (isAdmin) {
        addButton.classList.remove("d-none");
      }

      fetchData();
    } else {
      err.classList.remove("d-none");
    }
  });


// Auto login on reload
const currentUser = localStorage.getItem("loggedInUser");
const userRole = localStorage.getItem("userRole");

if (currentUser) {
  mainContent.classList.remove("d-none");
  logoutContainer.classList.remove("d-none");

  if (userRole === "admin") {
    addButton.classList.remove("d-none");
  }

  fetchData();
} else {
  loginModal.show();
}


  // Add new task
  addTaskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("taskName").value.trim();
    const select = document.getElementById("selectQuery").value.trim();
    const update = document.getElementById("updateQuery").value.trim();

    if (name && select && update) {
      const newId = taskData.length > 0 ? Math.max(...taskData.map(t => t.id)) + 1 : 1;
      const newTask = { id: newId, task: name, select, update };
      taskData.push(newTask);
      renderTable(taskData);
      addTaskForm.reset();
      bootstrap.Modal.getInstance(document.getElementById("addTaskModal")).hide();
      alert("Task added (but not persisted to file - only in memory).");
    }
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    logoutModal.show();
  });

  document.getElementById("confirmLogout").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    location.reload();
  });
});
