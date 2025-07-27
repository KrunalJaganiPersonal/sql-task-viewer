console.log("✅ Script loaded");
document.addEventListener("DOMContentLoaded", async function () {
  const currencyTableBody = document.getElementById("currencyTableBody");
  const searchInput = document.getElementById("currencySearchInput");
  const paginationTop = document.getElementById("currencyPaginationTop");
  const paginationBottom = document.getElementById("currencyPaginationBottom");

  let currencyData = [];
  let filteredData = [];
  let currentPage = 1;
  const pageSize = 10;

  try {
    const response = await fetch("currencymaster.json");
    const data = await response.json();
    currencyData = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    filteredData = [...currencyData];
    renderTable(getPageItems());
    renderPagination();
  } catch (error) {
    console.error("Failed to load currency data:", error);
    currencyTableBody.innerHTML = `<tr><td colspan="10" class="text-danger text-center">Error loading data</td></tr>`;
  }

  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.trim().toLowerCase();
    filteredData = currencyData.filter(currency =>
      Object.values(currency).some(val =>
        String(val).toLowerCase().includes(searchTerm)
      )
    );
    currentPage = 1;
    renderTable(getPageItems());
    renderPagination();
  });

function getPageItems() {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return filteredData.slice(start, end);
}

  function renderTable(pageItems) {
  currencyTableBody.innerHTML = "";

  if (pageItems.length === 0) {
    currencyTableBody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">No data found</td></tr>`;
    return;
  }

  for (const currency of pageItems) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${currency.CurrencyId}</td>
      <td>${currency.CurrencyCode}</td>
      <td>${currency.CurrencyName}</td>
      <td>${currency.CurrencySymbol}</td>
      <td>${currency.ShortCode}</td>
      <td>${currency.IsActive}</td>
      <td>${currency.IsExoticCurrency}</td>
      <td>${currency.AllowConversion}</td>
      <td>${currency.AllowBuy}</td>
      <td>${currency.AllowSell}</td>
    `;
    currencyTableBody.appendChild(row);
  }
}


  function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    if (totalPages <= 1) {
      paginationTop.innerHTML = "";
      paginationBottom.innerHTML = "";
      return;
    }

    const createButton = (label, page, isActive = false, disabled = false) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-sm mx-1 " + (isActive ? "btn-primary" : "btn-outline-primary");
      btn.textContent = label;
      if (disabled) btn.disabled = true;
      btn.addEventListener("click", () => {
        currentPage = page;
        renderTable(getPageItems());
        renderPagination();
      });
      return btn;
    };

    const buildPagination = () => {
      const frag = document.createDocumentFragment();
      frag.appendChild(createButton("Back", currentPage - 1, false, currentPage === 1));

      if (currentPage > 2) {
        frag.appendChild(createButton("1", 1));
        if (currentPage > 3) {
          frag.appendChild(Object.assign(document.createElement("span"), {
            textContent: "...",
            className: "mx-1"
          }));
        }
      }

      const pageRange = [currentPage - 1, currentPage, currentPage + 1].filter(p => p >= 1 && p <= totalPages);
      pageRange.forEach(p => {
        frag.appendChild(createButton(p.toString(), p, currentPage === p));
      });

      if (currentPage < totalPages - 1) {
        if (currentPage < totalPages - 2) {
          frag.appendChild(Object.assign(document.createElement("span"), {
            textContent: "...",
            className: "mx-1"
          }));
        }
        frag.appendChild(createButton(totalPages.toString(), totalPages));
      }

      frag.appendChild(createButton("Next", currentPage + 1, false, currentPage === totalPages));
      return frag;
    };

    paginationTop.innerHTML = "";
    paginationTop.appendChild(buildPagination());

    paginationBottom.innerHTML = "";
    paginationBottom.appendChild(buildPagination());
  }
});
