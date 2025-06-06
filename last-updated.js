document.addEventListener("DOMContentLoaded", function () {
    const lastUpdated = new Date(document.lastModified);
    const formatted = lastUpdated.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById("last-updated").textContent = `Last updated: ${formatted}`;
  });