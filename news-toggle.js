document.addEventListener("DOMContentLoaded", function () {
    const newsItems = document.querySelectorAll("#news-list .news-item");
    const toggleBtn = document.getElementById("toggle-news");
    const defaultVisibleCount = 10;
  
    // Hide the toggle button when every item is already visible.
    if (newsItems.length <= defaultVisibleCount) {
      toggleBtn.style.display = "none";
      return;
    }
  
    // Hide items beyond the default visible count.
    newsItems.forEach((item, index) => {
      if (index >= defaultVisibleCount) {
        item.classList.add("hidden");
      }
    });
  
    let expanded = false;
  
    toggleBtn.addEventListener("click", function () {
      const wasExpanded = expanded;
      expanded = !expanded;
      toggleBtn.setAttribute("aria-expanded", expanded);
      
      newsItems.forEach((item, index) => {
        if (index >= defaultVisibleCount) {
          item.classList.toggle("hidden", !expanded);
        }
      });
      toggleBtn.textContent = expanded ? "Show recent news" : "Show all news";
      // Scroll to button if collapsing
      if (!expanded && wasExpanded) {
        setTimeout(() => {
          toggleBtn.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150); // Delay ensures layout has updated before scroll
      }
    });
  });
