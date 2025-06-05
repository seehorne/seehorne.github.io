document.addEventListener("DOMContentLoaded", function () {
    const newsItems = document.querySelectorAll("#news-list .news-item");
    const toggleBtn = document.getElementById("toggle-news");
  
    // If 10 or fewer items, hide the toggle button
    if (newsItems.length <= 5) {
      toggleBtn.style.display = "none";
      return;
    }
  
    // Hide items beyond the 10th
    newsItems.forEach((item, index) => {
      if (index >= 5) {
        item.classList.add("hidden");
      }
    });
  
    let expanded = false;
  
    toggleBtn.addEventListener("click", function () {
      expanded = !expanded;
      newsItems.forEach((item, index) => {
        if (index >= 10) {
          item.classList.toggle("hidden", !expanded);
        }
      });
      toggleBtn.textContent = expanded ? "Show all news" : "Show recent news";
    });
  });
  