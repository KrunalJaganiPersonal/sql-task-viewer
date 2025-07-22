let taskData = [];
let currentPage = 1;
const recordsPerPage = 10;
const singleBreakIds = [11, 15, 16];

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

    function createCellContent(contentArray, type) {
      if (!Array.isArray(contentArray)) return contentArray || "";

      const joiner = singleBreakIds.includes(item.id) ? "<br>" : "<br><br>";
      const lineLimit = 3;

      const fullHTML = contentArray.map((line, i) =>
        i === 0 ? line : `${joiner}${line}`
      ).join('');

      if (contentArray.length <= lineLimit) {
        return `<div class="copyable cursor-pointer">${fullHTML}</div>`;
      }

      const previewHTML = contentArray
        .slice(0, lineLimit)
        .map((line, i) => (i === 0 ? line : `${joiner}${line}`))
        .join('');

      return `
        <div class="text-snippet copyable cursor-pointer" data-type="${type}" data-id="${item.id}" data-full="${escapeHtml(contentArray.join('\n\n'))}">
          <div class="preview">${previewHTML}</div>
          <span class="toggle-more badge rounded-pill bg-light text-dark border show-more-btn" style="cursor:pointer;">...</span>
          <div class="full-text d-none mt-1">${fullHTML}</div>
        </div>`;
    }

    tr.innerHTML = `
      <td style="text-align: center;">${item.id || ""}</td>
      <td>${item.task || ""}</td>
      <td class="select-cell">${createCellContent(item.select, 'select')}</td>
      <td class="update-cell">${createCellContent(item.update, 'update')}</td>
    `;

    // Toggle expand/collapse — prevent copy
    tr.querySelectorAll(".show-more-btn").forEach(btn => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation(); // prevent bubble to copy

        const wrapper = this.closest(".text-snippet");
        const fullText = wrapper.querySelector(".full-text");
        const preview = wrapper.querySelector(".preview");

        if (fullText.classList.contains("d-none")) {
          fullText.classList.remove("d-none");
          preview.classList.add("d-none");
          this.innerText = "↑";
        } else {
          fullText.classList.add("d-none");
          preview.classList.remove("d-none");
          this.innerText = "...";
        }
      });
    });

    // Copy full content
    tr.querySelectorAll(".copyable").forEach(cell => {
      cell.addEventListener("click", () => {
        let rawText;

        if (cell.dataset.full) {
          const id = parseInt(cell.dataset.id);
          const fullArray = unescapeHtml(cell.dataset.full).split(/\n{2}|\n/g); // split by line breaks
          const joiner = singleBreakIds.includes(id) ? '\n' : '\n\n';
          rawText = fullArray.join(joiner);
        } else {
          rawText = cell.innerText.trim();
        }
        
        navigator.clipboard.writeText(rawText).then(() => toast.show());
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
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, function (c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[c];
  });
}

function unescapeHtml(str) {
  return str.replace(/&(amp|lt|gt|quot|#39);/g, function (m, code) {
    return {
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      '#39': "'"
    }[code];
  });
}
