const mainContent = document.getElementById("main-content");
const navLinks = document.querySelector(".app-nav");

// ===============================
// CARGAR CONTENIDO
// ===============================
const loadContent = async (page) => {
  try {
    const response = await fetch(`pages/${page}.html`);

    if (!response.ok) {
      throw new Error(
        `Error ${response.status} - ${response.statusText}`
      );
    }

    const html = await response.text();
    mainContent.innerHTML = html;

    // Cargar JS específico de cada página
    if (page === "panel") {
      import("./pages/panel.js").then((module) => module.init());
    }

    if (page === "users") {
      import("../pages/users.js").then((module) => module.init());
    }

    if (page === "roles") {
      import("../pages/roles.js").then((module) => module.init());
    }

    if (page === "tareas") {
      import("../pages/tareas.js").then((module) => module.init());
    }

  } catch (error) {
    console.error("Error cargando contenido:", error);
    mainContent.innerHTML = `
      <h3 class="text-center text-danger p-5">
        No se pudo cargar la página.
      </h3>
    `;
  }
};

// ===============================
// CLICK EN MENÚ
// ===============================
navLinks.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-page]");

  if (link) {
    event.preventDefault();
    const pageToLoad = link.dataset.page;
    loadContent(pageToLoad);
  }
});

// ===============================
// CARGAR DASHBOARD AL INICIAR
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadContent("panel");
});

// ===============================
// LOGOUT
// ===============================
const logoutButton = document.getElementById("logout-button");

if (logoutButton) {
  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.clear();
    window.location.href = "/index.html";
  });
}

// Permite llamar desde otras páginas
window.loadContent = loadContent;
