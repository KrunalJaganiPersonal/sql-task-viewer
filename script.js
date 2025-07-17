let taskData = [];
let currentPage = 1;
const recordsPerPage = 10;

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

  async function fetchData() {
    try {
      const res = await fetch("data.json");
      taskData = await res.json();
      renderTablePage();
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  }

  function renderTable(data) {
    taskTableBody.innerHTML = "";
    data.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td style="text-align: center;">${item.id || ""}</td>
        <td>${item.task || ""}</td>
        <td class="cursor-pointer copyable">
          ${Array.isArray(item.select)
            ? item.select.map((line, i) =>
                i === 0
                  ? line
                  : `${item.id === 11 ? '<br>' : '<br><br>'}${line}`
              ).join('')
            : item.select || ""}
        </td>
        <td class="cursor-pointer copyable">
          ${Array.isArray(item.update)
            ? item.update.map((line, i) =>
                i === 0
                  ? line
                  : `${item.id === 11 ? '<br>' : '<br><br>'}${line}`
              ).join('')
            : item.update || ""}
        </td>
      `;

      tr.querySelectorAll(".copyable").forEach(cell => {
        cell.addEventListener("click", () => {
          const isSelectCell = cell.cellIndex === 2;
          const isUpdateCell = cell.cellIndex === 3;
          const dataArray = isSelectCell ? item.select : item.update;

          if (Array.isArray(dataArray)) {
            const joinedText = dataArray.map((line, i) =>
              i === 0 ? line : `${item.id === 11 ? '\n' : '\n\n'}${line}`
            ).join('');
            navigator.clipboard.writeText(joinedText).then(() => toast.show());
          } else {
            navigator.clipboard.writeText(cell.textContent).then(() => toast.show());
          }
        });
      });

      taskTableBody.appendChild(tr);
    });
  }

  function renderTablePage() {
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const visible = taskData.slice(start, end);

    renderTable(visible);
    renderPagination(taskData.length);
  }


  function renderPagination(totalRecords) {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    if (totalPages <= 1) return;

    const backBtn = `<button ${currentPage === 1 ? "disabled" : ""} class="btn btn-sm btn-outline-primary me-1" onclick="changePage(${currentPage - 1})">Back</button>`;
    const nextBtn = `<button ${currentPage === totalPages ? "disabled" : ""} class="btn btn-sm btn-outline-primary ms-1" onclick="changePage(${currentPage + 1})">Next</button>`;

    let pageBtns = "";
    for (let i = 1; i <= totalPages; i++) {
      pageBtns += `<button class="btn btn-sm ${currentPage === i ? "btn-primary" : "btn-outline-primary"} me-1" onclick="changePage(${i})">${i}</button>`;
    }

    const paginationHTML = backBtn + pageBtns + nextBtn;

    // ✅ Inject into both containers
    const topDiv = document.getElementById("paginationControls");
    const bottomDiv = document.getElementById("paginationControlsBottom");

    if (topDiv) topDiv.innerHTML = paginationHTML;
    if (bottomDiv) bottomDiv.innerHTML = paginationHTML;
  }


  window.changePage = function (page) {
    currentPage = page;
    renderTablePage();
  };

  searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();
    const filtered = taskData.filter((item) =>
      item.task.toLowerCase().includes(value)
    );
    renderTable(filtered);
  });

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
      if (isAdmin) addButton.classList.remove("d-none");

      fetchData();
    } else {
      err.classList.remove("d-none");
    }
  });

  const currentUser = localStorage.getItem("loggedInUser");
  const userRole = localStorage.getItem("userRole");

  if (currentUser) {
    mainContent.classList.remove("d-none");
    logoutContainer.classList.remove("d-none");
    if (userRole === "admin") addButton.classList.remove("d-none");
    fetchData();
  } else {
    loginModal.show();
  }

  addTaskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("taskName").value.trim();
    const select = document.getElementById("selectQuery").value.trim();
    const update = document.getElementById("updateQuery").value.trim();
    const sp = document.getElementById("spQuery").value.trim();

    if (name && select && update) {
      const newId = taskData.length > 0 ? Math.max(...taskData.map(t => t.id)) + 1 : 1;

      const newTask = {
        id: newId,
        task: name,
        select: select,
        update: update,
        sp: sp
      };

      taskData.push(newTask);
      localStorage.setItem("taskData", JSON.stringify(taskData));
      renderTablePage();
      addTaskForm.reset();
      bootstrap.Modal.getInstance(document.getElementById("addTaskModal")).hide();
      alert("✅ Task added successfully.");
    } else {
      alert("❌ Please fill all required fields.");
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => logoutModal.show());
  document.getElementById("confirmLogout").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    location.reload();
  });
});

function getPlainText(cell) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cell.innerHTML;
  return tempDiv.innerText.replace(/\n\n/g, '\n');
}
