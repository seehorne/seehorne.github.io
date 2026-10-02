let currentSort = { key: '', asc: true };

function sortPublications(key) {
    const container = document.getElementById('pub-container');
    const pubs = Array.from(container.getElementsByClassName('pub-card'));

    if (currentSort.key === key) {
        currentSort.asc = !currentSort.asc;
    } else {
        currentSort = { key, asc: true };
    }

    pubs.sort((a, b) => {
        const valA = a.dataset[key].toLowerCase();
        const valB = b.dataset[key].toLowerCase();

        if (valA < valB) return currentSort.asc ? -1 : 1;
        if (valA > valB) return currentSort.asc ? 1 : -1;
        return 0;
    });

    pubs.forEach(pub => container.appendChild(pub));

    updateSortLabels();
}

function updateSortLabels() {
    const yearBtn = document.getElementById('sort-year');
    const titleBtn = document.getElementById('sort-title');

    const upArrow = '▲';
    const downArrow = '▼';

    yearBtn.textContent = 'Year';
    titleBtn.textContent = 'Title';

    if (currentSort.key === 'year') {
        yearBtn.textContent += currentSort.asc ? ` ${upArrow}` : ` ${downArrow}`;
    } else if (currentSort.key === 'title') {
        titleBtn.textContent += currentSort.asc ? ` ${upArrow}` : ` ${downArrow}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const faders = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    faders.forEach(el => observer.observe(el));
});

const navLinks = document.querySelectorAll(".navbar a[href^='#']");
const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const id = entry.target.getAttribute("id");
            const link = document.querySelector(`.navbar a[href="#${id}"]`);
            if (entry.isIntersecting) {
                navLinks.forEach((lnk) => lnk.classList.remove("active"));
                if (link) link.classList.add("active");
            }
        });
    },
    {
        rootMargin: "-50% 0px -49% 0px", // center bias
        threshold: 0,
    }
);

document.querySelectorAll("section").forEach((section) => {
    sectionObserver.observe(section);
});

const BIB_FIELDS_TO_HIDE = new Set(['bibtex_show', 'selected']);

function splitTopLevel(text, delimiter = ',') {
    const parts = [];
    let start = 0;
    let braceDepth = 0;
    let inQuotes = false;
    let escaped = false;

    for (let i = 0; i < text.length; i += 1) {
        const character = text[i];

        if (escaped) {
            escaped = false;
            continue;
        }
        if (character === '\\') {
            escaped = true;
            continue;
        }
        if (character === '"' && braceDepth === 0) inQuotes = !inQuotes;
        if (!inQuotes && character === '{') braceDepth += 1;
        if (!inQuotes && character === '}') braceDepth -= 1;

        if (character === delimiter && braceDepth === 0 && !inQuotes) {
            parts.push(text.slice(start, i));
            start = i + 1;
        }
    }

    parts.push(text.slice(start));
    return parts;
}

function formatBibEntry(type, key, body) {
    const fields = splitTopLevel(body)
        .map(field => field.trim())
        .filter(Boolean)
        .map(field => {
            const equalsIndex = field.indexOf('=');
            if (equalsIndex === -1) return null;

            const name = field.slice(0, equalsIndex).trim();
            const value = field.slice(equalsIndex + 1).trim().replace(/\s+/g, ' ');
            if (BIB_FIELDS_TO_HIDE.has(name.toLowerCase())) return null;
            return `  ${name.toLowerCase()} = ${value}`;
        })
        .filter(Boolean);

    return `@${type}{${key},\n${fields.join(',\n')}\n}`;
}

function parseBibliography(source) {
    const entries = new Map();
    const entryStart = /@(\w+)\s*\{/g;
    let match;

    while ((match = entryStart.exec(source)) !== null) {
        const type = match[1];
        const contentStart = entryStart.lastIndex;
        let depth = 1;
        let inQuotes = false;
        let escaped = false;
        let end = contentStart;

        for (; end < source.length && depth > 0; end += 1) {
            const character = source[end];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (character === '\\') {
                escaped = true;
                continue;
            }
            if (character === '"' && depth === 1) inQuotes = !inQuotes;
            if (!inQuotes && character === '{') depth += 1;
            if (!inQuotes && character === '}') depth -= 1;
        }

        if (depth !== 0) continue;
        const content = source.slice(contentStart, end - 1);
        const keySeparator = splitTopLevel(content).shift();
        const firstComma = content.indexOf(',');
        if (!keySeparator || firstComma === -1) continue;

        const key = keySeparator.trim();
        const body = content.slice(firstComma + 1);
        entries.set(key, formatBibEntry(type, key, body));
        entryStart.lastIndex = end;
    }

    return entries;
}

async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
}

function addBibPanel(card, bibtex) {
    const key = card.dataset.bibKey;
    const panelId = `bib-panel-${key.toLowerCase()}`;
    const button = document.createElement('button');
    button.className = 'bib-toggle';
    button.type = 'button';
    button.textContent = 'Bib';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panelId);

    const panel = document.createElement('div');
    panel.className = 'bib-panel';
    panel.id = panelId;
    panel.hidden = true;

    const copyButton = document.createElement('button');
    copyButton.className = 'bib-copy';
    copyButton.type = 'button';
    copyButton.textContent = 'Copy BibTeX';

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = bibtex;
    pre.appendChild(code);
    panel.append(copyButton, pre);
    card.append(button, panel);

    button.addEventListener('click', () => {
        const shouldOpen = panel.hidden;
        panel.hidden = !shouldOpen;
        button.setAttribute('aria-expanded', String(shouldOpen));
    });

    copyButton.addEventListener('click', async () => {
        try {
            await copyText(bibtex);
            copyButton.textContent = 'Copied!';
            window.setTimeout(() => {
                copyButton.textContent = 'Copy BibTeX';
            }, 1600);
        } catch (error) {
            copyButton.textContent = 'Copy failed';
            console.error('Unable to copy BibTeX.', error);
        }
    });
}

async function initializeBibPanels() {
    try {
        const response = await fetch('bibliography/papers.bib');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const entries = parseBibliography(await response.text());

        document.querySelectorAll('.pub-card[data-bib-key]').forEach(card => {
            const bibtex = entries.get(card.dataset.bibKey);
            if (bibtex) {
                addBibPanel(card, bibtex);
            } else {
                console.warn(`No BibTeX entry found for ${card.dataset.bibKey}.`);
            }
        });
    } catch (error) {
        console.error('Unable to load bibliography.', error);
    }
}

initializeBibPanels();
