document.addEventListener("DOMContentLoaded", function () {
  bindEvents();
  render();

  // 等布局完全稳定后再算红线
  setTimeout(() => {
    const indicator = document.querySelector(".tab-indicator");
    if (indicator) {
      indicator.style.transition = "none";
      moveIndicator();
      void indicator.offsetWidth;
      indicator.style.transition = "";
    }
  }, 100);
});
