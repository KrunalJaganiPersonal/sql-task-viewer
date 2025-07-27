document.addEventListener("DOMContentLoaded", async function () {
  const countryTableBody = document.getElementById("countryTableBody");
  const searchInput = document.getElementById("countrySearchInput");
  const paginationTop = document.getElementById("countryPaginationTop");
  const paginationBottom = document.getElementById("countryPaginationBottom");

  let countryData = [];
  let filteredData = [];
  let currentPage = 1;
  const pageSize = 10;

  try {
    const response = await fetch("countrymaster.json");
    const data = await response.json();
    countryData = data;
    filteredData = [...countryData];
    renderTable();
    renderPagination();
  } catch (error) {
    console.error("Failed to load country data:", error);
    countryTableBody.innerHTML = `<tr><td colspan="14" class="text-danger text-center">Error loading data</td></tr>`;
  }

  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.trim().toLowerCase();
    filteredData = countryData.filter(country =>
      Object.values(country).some(val =>
        String(val).toLowerCase().includes(searchTerm)
      )
    );
    currentPage = 1;
    renderTable();
    renderPagination();
  });

  function renderTable() {
    countryTableBody.innerHTML = "";
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filteredData.slice(start, end);

    if (pageItems.length === 0) {
      countryTableBody.innerHTML = `<tr><td colspan="14" class="text-center text-danger">No data found</td></tr>`;
      return;
    }

    for (const country of pageItems) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${country.CountryId}</td>
        <td>${country.CountryCode}</td>
        <td>${country.CountryName}</td>
        <td>${country.ShortCode}</td>
        <td>${country.CurrencyCode}</td>
        <td>${country.CurrencyName}</td>
        <td>${country.CurrencySymbol}</td>
        <td>${country.CurrencyId}</td>
        <td>${country.CountryShortCode}</td>
        <td>${country.CountryAlpha3Code}</td>
        <td>${country.RiskScore}</td>
        <td>${country.IBANexist}</td>
        <td>${country.IBANlength}</td>
        <td>${country.DisplayNumber}</td>
      `;
      countryTableBody.appendChild(row);
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
      renderTable();
      renderPagination();
    });
    return btn;
  };

  const buildPagination = () => {
    const frag = document.createDocumentFragment();

    // Back button: Always visible unless on page 1
    frag.appendChild(createButton("Back", currentPage - 1, false, currentPage === 1));

    // Show first page if not nearby
    if (currentPage > 2) {
      frag.appendChild(createButton("1", 1, currentPage === 1));
      if (currentPage > 3) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.classList.add("mx-1");
        frag.appendChild(dots);
      }
    }

    // Show 3 pages: current-1, current, current+1
    const pageRange = [currentPage - 1, currentPage, currentPage + 1].filter(p => p >= 1 && p <= totalPages);
    pageRange.forEach(p => {
      frag.appendChild(createButton(p.toString(), p, currentPage === p));
    });

    // Show last page if not in range
    if (currentPage < totalPages - 1) {
      if (currentPage < totalPages - 2) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.classList.add("mx-1");
        frag.appendChild(dots);
      }
      frag.appendChild(createButton(totalPages.toString(), totalPages, currentPage === totalPages));
    }

    // Next button: Always visible unless on last page
    frag.appendChild(createButton("Next", currentPage + 1, false, currentPage === totalPages));

    return frag;
  };

  paginationTop.innerHTML = "";
  paginationTop.appendChild(buildPagination());

  paginationBottom.innerHTML = "";
  paginationBottom.appendChild(buildPagination());
}



});
