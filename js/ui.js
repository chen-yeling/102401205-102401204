// 当前的状态：关键词、类型
let currentKeyword = "";
let currentType = "lost";

// 渲染列表
function render() {
  let items = loadItems();
  items = searchItems(items, currentKeyword);
  items = filterItems(items, currentType);

  const list = document.getElementById("itemList");

  if (items.length === 0) {
    list.innerHTML = '<div class="empty-state">无相关信息</div>';
    return;
  }

  list.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="tag ${item.type === "lost" ? "tag-lost" : "tag-found"}">
        ${item.type === "lost" ? "寻物" : "招领"}
      </span>
      <h3 class="item-title">${escapeHtml(item.title)}</h3>
      <p class="item-info">地点：${escapeHtml(item.place || "未填写")}</p>
      <p class="item-info">时间：${escapeHtml(item.date || "未填写")}</p>
      <p class="item-status">${getStatusText(item)}</p>
    </div>
  `).join("");
}

// 防止用户输入特殊字符破坏页面
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 切换标签：更新 currentType，移动红线，重新渲染
function switchTab(type) {
  currentType = type;

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });

  render();
}

// 绑定所有事件
function bindEvents() {
  // 1. 顶部两个切换按钮
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.type);
    });
  });

  // 2. 搜索框
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    currentKeyword = e.target.value;
    render();
  });

  // 3. 底部“首页”：清空搜索、回到默认类型
  document.getElementById("navHome").addEventListener("click", () => {
    currentKeyword = "";
    searchInput.value = "";
    switchTab("lost");
  });

  // 4. 底部“+”：暂时只提示，下一步做发布页
  document.getElementById("navAdd").addEventListener("click", () => {
    alert("发布信息功能即将上线");
  });

  // 5. 底部“我的”：暂时只提示
  document.getElementById("navMine").addEventListener("click", () => {
    alert("我的发布功能即将上线");
  });
}
