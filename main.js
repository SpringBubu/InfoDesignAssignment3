import { plots } from "./plots/index.js";
import { EmojiCanvas } from "./utils/EmojiCanvas.js";

if (!window.customElements.get("emoji-canvas")) {
    window.customElements.define("emoji-canvas", EmojiCanvas);
}

function setupTheme() {
    const root = document.documentElement;
    const toggle = document.querySelector(".theme-toggle");
    const label = toggle?.querySelector(".theme-toggle-label");
    const storedTheme = window.localStorage.getItem("austrian-diet-theme");
    const initialTheme = storedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    function applyTheme(theme) {
        root.dataset.theme = theme;
        const isDark = theme === "dark";
        toggle?.setAttribute("aria-pressed", String(isDark));
        if (label) label.textContent = isDark ? "Day view" : "Night view";
    }

    applyTheme(initialTheme);

    toggle?.addEventListener("click", () => {
        const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        window.localStorage.setItem("austrian-diet-theme", nextTheme);
    });
}

function setupScrollProgress() {
    const progress = document.querySelector(".scroll-progress span");
    let frame = null;

    function update() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
        if (progress) progress.style.transform = `scaleX(${ratio})`;
        frame = null;
    }

    window.addEventListener("scroll", () => {
        if (frame === null) frame = window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
}

function setupChapterNavigation() {
    const navLinks = [...document.querySelectorAll(".chapter-nav a")];
    const sections = [...document.querySelectorAll("main [data-section][id]")];

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        navLinks.forEach((link) => {
            const active = link.getAttribute("href") === `#${visible.target.id}`;
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
        });
    }, { rootMargin: "-28% 0px -58%", threshold: [0, 0.15, 0.35] });

    sections.forEach((section) => observer.observe(section));
}

function setupReveals() {
    const elements = [...document.querySelectorAll(".reveal")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { rootMargin: "0px 0px -12%", threshold: 0.08 });

    elements.forEach((element) => observer.observe(element));
}

function setupNetworkSearch() {
    const searchInputs = [...document.querySelectorAll("[data-filter-target]")];

    searchInputs.forEach((input) => {
        input.addEventListener("input", () => {
            const target = document.querySelector(input.dataset.filterTarget);
            if (!target) return;

            const query = input.value.trim().toLocaleLowerCase();
            [...target.children].forEach((row) => {
                row.hidden = query.length > 0 && !row.textContent.toLocaleLowerCase().includes(query);
            });
        });
    });
}

async function loadVisualizations() {
    const results = await Promise.allSettled([
        plots.bar(),
        plots.sankey(),
        plots.scatter(),
        plots.network()
    ]);

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            console.error(`Visualization ${index + 1} failed to load`, result.reason);
        }
    });

    document.body.dataset.visualizations = "ready";
}

function main() {
    setupTheme();
    setupScrollProgress();
    setupChapterNavigation();
    setupReveals();
    setupNetworkSearch();
    loadVisualizations();
}

main();
