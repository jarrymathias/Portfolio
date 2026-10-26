const header = document.querySelector("#site-header");
const progressBar = document.querySelector("#progress-bar");
const menuToggle = document.querySelector("#menu-toggle");
const navPanel = document.querySelector("#nav-panel");
const themeToggle = document.querySelector("#theme-toggle");
const year = document.querySelector("#year");
const dialog = document.querySelector("#project-dialog");
const dialogBody = document.querySelector("#dialog-body");
const form = document.querySelector("#contact-form");
const formSuccess = document.querySelector("#form-success");
const projectCount = document.querySelector("#project-count");
const emptyProjects = document.querySelector("#empty-projects");

year.textContent = String(new Date().getFullYear());

function onScroll() {
  const scrolled = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle("is-scrolled", scrolled > 8);
  progressBar.style.width = `${height > 0 ? (scrolled / height) * 100 : 0}%`;
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function setMenu(open) {
  navPanel.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.querySelector(".menu-label").textContent = open ? "Fermer" : "Menu";
  document.body.classList.toggle("nav-open", open);
}

menuToggle.addEventListener("click", () => {
  setMenu(!navPanel.classList.contains("is-open"));
});

navPanel.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navPanel.classList.contains("is-open")) {
    setMenu(false);
    menuToggle.focus();
  }
});

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...navPanel.querySelectorAll("a")];

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-40% 0px -50% 0px" }
);

sections.forEach((section) => spy.observe(section));

function syncThemeButton() {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeToggle.setAttribute("aria-label", dark ? "Activer le thème clair" : "Activer le thème sombre");
}

syncThemeButton();

themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  if (dark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
  syncThemeButton();
});

document.querySelector("#print-cv").addEventListener("click", () => window.print());

const projects = [...document.querySelectorAll(".project")];

function applyFilter(category) {
  let visible = 0;
  projects.forEach((project) => {
    const show = category === "tous" || project.dataset.category === category;
    project.hidden = !show;
    if (show) visible += 1;
  });
  projectCount.textContent = visible > 1 ? `${visible} projets` : `${visible} projet`;
  emptyProjects.hidden = visible !== 0;
}

document.querySelectorAll(".filters button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    applyFilter(button.dataset.filter);
  });
});

document.querySelectorAll(".project-open").forEach((button) => {
  button.addEventListener("click", () => {
    const template = button.parentElement.querySelector("template");
    dialogBody.replaceChildren(template.content.cloneNode(true));
    const heading = dialogBody.querySelector("h3");
    if (heading) heading.id = "dialog-title-slot";
    dialog.showModal();
  });
});

document.querySelector("#dialog-close").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const fields = [
  { id: "name", message: "Indiquez votre nom." },
  { id: "email", message: "Indiquez un e-mail valide.", check: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) },
  { id: "subject", message: "Choisissez un sujet." },
  { id: "message", message: "Écrivez au moins quelques mots.", check: (value) => value.trim().length >= 12 }
];

function showError(input, message) {
  const error = document.querySelector(`#${input.id}-error`);
  error.hidden = !message;
  error.textContent = message || "";
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (message) input.setAttribute("aria-describedby", error.id);
  else input.removeAttribute("aria-describedby");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let firstInvalid = null;

  fields.forEach(({ id, message, check }) => {
    const input = document.querySelector(`#${id}`);
    const value = input.value.trim();
    const invalid = !value || (check && !check(value));
    showError(input, invalid ? message : "");
    if (invalid && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const name = document.querySelector("#name").value.trim();
  document.querySelector("#success-copy").textContent =
    `${name}, rien n’a été envoyé : cette page est une démonstration. Branchez plus tard votre propre adresse ou un service de formulaire.`;
  form.hidden = true;
  formSuccess.hidden = false;
  formSuccess.focus();
});

document.querySelector("#reset-form").addEventListener("click", () => {
  form.reset();
  fields.forEach(({ id }) => showError(document.querySelector(`#${id}`), ""));
  formSuccess.hidden = true;
  form.hidden = false;
  document.querySelector("#name").focus();
});
