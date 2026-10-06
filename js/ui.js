// 当前的状态：关键词、类型
let currentKeyword = "";
let currentType = "lost";

// 切换视图（加了防御，找不到不会白屏崩溃）
function showView(viewId) {
  const target = document.getElementById(viewId);
  if (!target) {
    console.error("找不到视图元素，请检查 index.html 里是否有 id=" + viewId);
    return;
  }
  document.querySelectorAll(".view").forEach(v => {
    v.classList.remove("active");
  });
  target.classList.add("active");
}

// 把红线移动到当前激活按钮的文字下方
function moveIndicator() {
  const tabBar = document.querySelector(".tab-bar");
  const indicator = document.querySelector(".tab-indicator");
  const activeBtn = document.querySelector(".tab-btn.active");
  if (!tabBar || !indicator || !activeBtn) return;
  const span = activeBtn.querySelector("span");
  if (!span) return;
  const spanRect = span.getBoundingClientRect();
  const barRect = tabBar.getBoundingClientRect();
  indicator.style.left = (spanRect.left - barRect.left) + "px";
  indicator.style.width = spanRect.width + "px";
}

// 回到首页
function goHome() {
  showView("homeView");
  moveIndicator();
  render();

  // 等浏览器完成布局后，再算红线位置
  requestAnimationFrame(() => {
    moveIndicator();
  });
}

// 清空表单错误
function clearErrors() {
  document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
}

// 显示字段错误
function showError(fieldId, message) {
  const el = document.getElementById("err-" + fieldId);
  if (el) el.textContent = message;
}

// 图片压缩
function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      const maxW = 600;
      if (w > maxW) { h = h * maxW / w; w = maxW; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// 重置表单
function resetPublishForm() {
  const form = document.getElementById("publishForm");
  if(form) form.reset();
  const preview = document.getElementById("imagePreview");
  if(preview) preview.innerHTML = "";
  clearErrors();
  const btn = document.getElementById("submitBtn");
  if(btn) btn.disabled = false;
}

// 发布提交逻辑
function handlePublish(e) {
  e.preventDefault();
  clearErrors();
  const form = e.target;
  const submitBtn = document.getElementById("submitBtn");
  const typeEl = form.querySelector('input[name="type"]:checked');
  const title = form.title.value.trim();
  const desc = form.desc.value.trim();
  const date = form.date.value;
  const place = form.place.value.trim();
  const contact = form.contact.value.trim();
  const remark = form.remark.value.trim();

  let hasError = false;
  if (!typeEl) { showError("type", "请选择类型"); hasError = true; }
  if (!title) { showError("title", "请填写物品名称"); hasError = true; }
  if (!date) { showError("date", "请选择失物/拾物时间"); hasError = true; }
  if (!place) { showError("place", "请填写失物/拾物地点"); hasError = true; }
  if (!contact) { showError("contact", "请填写联系方式"); hasError = true; }
  if (hasError) return;

  submitBtn.disabled = true;
  const fileInput = document.getElementById("p-image");
  const file = fileInput.files[0];

  const finish = (imageData) => {
    const item = createItem({
      type: typeEl.value, title, desc, date, place,
      image: imageData, contact, remark
    });
    const items = loadItems();
    items.unshift(item);
    saveItems(items);
    showToast("发布成功！");
    setTimeout(() => { resetPublishForm(); goHome(); }, 1200);
  };

  if (file) compressImage(file, finish);
  else finish("");
}

// 提示框
function showToast(message) {
  const toast = document.getElementById("toast");
  if(!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1500);
}

// 渲染首页列表
function render() {
  let items = loadItems();
  items = searchItems(items, currentKeyword);
  items = filterItems(items, currentType);
  const list = document.getElementById("itemList");
  if (!list) return;
  if (items.length === 0) {
    list.innerHTML = '<div class="empty-state">无相关信息</div>';
    return;
  }
  list.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="tag ${item.type === "lost" ? "tag-lost" : "tag-found"}">${item.type === "lost" ? "寻物" : "招领"}</span>
      <h3 class="item-title">${escapeHtml(item.title)}</h3>
      <p class="item-info">地点：${escapeHtml(item.place || "未填写")}</p>
      <p class="item-info">时间：${escapeHtml(item.date || "未填写")}</p>
      <p class="item-status">${getStatusText(item)}</p>
    </div>
  `).join("");
}

// 渲染“我的发布”列表
function renderMine() {
  const items = loadItems();
  const list = document.getElementById("mineList");
  if (!list) return;
  if (items.length === 0) {
    list.innerHTML = '<div class="empty-state">你还没有发布过信息</div>';
    return;
  }
  list.innerHTML = items.map(item => `
    <div class="item-card">
      <span class="tag ${item.type === "lost" ? "tag-lost" : "tag-found"}">${item.type === "lost" ? "寻物" : "招领"}</span>
      <h3 class="item-title">${escapeHtml(item.title)}</h3>
      <p class="item-info">地点：${escapeHtml(item.place || "未填写")}</p>
      <p class="item-info">时间：${escapeHtml(item.date || "未填写")}</p>
      <p class="item-status">${getStatusText(item)}</p>
      ${item.status === "active" ? `
        <button class="mark-btn" data-id="${item.id}" data-type="${item.type}" style="margin-top:10px; padding:6px 12px; background:#c62828; color:#fff; border:none; border-radius:4px; cursor:pointer;">
          ${item.type === "lost" ? "标记为已找到" : "标记为已归还"}
        </button>
      ` : `<p style="color:#1a7f37; font-weight:bold; margin-top:10px;">已完成</p>`}
    </div>
  `).join("");
}

// 防注入
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// 切换标签
function switchTab(type) {
  currentType = type;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });
  moveIndicator();
  render();
}

let currentDetailId = null;

function showDetail(id) {
  const items = loadItems();
  const item = items.find(it => it.id === id);
  if (!item) return;

  currentDetailId = id;

  const imageWrap = document.getElementById("detailImageWrap");
  imageWrap.innerHTML = item.image ? `<img src="${item.image}" alt="">` : "";

  const tag = document.getElementById("detailTag");
  tag.textContent = item.type === "lost" ? "寻物" : "招领";
  tag.className = "tag " + (item.type === "lost" ? "tag-lost" : "tag-found");

  const statusEl = document.getElementById("detailStatus");
  statusEl.textContent = getStatusText(item);
  statusEl.className = "detail-status" + (item.status !== "active" ? " done" : "");

  document.getElementById("detailTitle").textContent = item.title || "未填写";
  document.getElementById("detailDesc").textContent = item.desc || "无";
  document.getElementById("detailDate").textContent = item.date || "未填写";
  document.getElementById("detailPlace").textContent = item.place || "未填写";
  document.getElementById("detailContact").textContent = item.contact || "未填写";
  document.getElementById("detailRemark").textContent = item.remark || "无";


  showView("detailView");
}

// 绑定所有事件
function bindEvents() {
  // 1. 顶部切换
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.type));
  });
  
  // 2. 搜索框
  const searchInput = document.getElementById("searchInput");
  if(searchInput) searchInput.addEventListener("input", (e) => { currentKeyword = e.target.value; render(); });
  
  // 3. 首页底部导航
  const navHome = document.getElementById("navHome");
  if(navHome) navHome.addEventListener("click", () => { currentKeyword = ""; if(searchInput) searchInput.value = ""; switchTab("lost"); goHome(); });
  
  const navAdd = document.getElementById("navAdd");
  if(navAdd) navAdd.addEventListener("click", () => { resetPublishForm(); showView("publishView"); });
  
  const navMine = document.getElementById("navMine");
  if(navMine) navMine.addEventListener("click", () => { showView("mineView"); renderMine(); });

  // 4. 我的页面-返回按钮
  const mineBackBtn = document.getElementById("mineBackBtn");
  if(mineBackBtn) mineBackBtn.addEventListener("click", () => goHome());
  
  // 5. 我的页面-标记按钮（事件委托）
  const mineList = document.getElementById("mineList");
  if(mineList) {
    mineList.addEventListener("click", (e) => {
      const btn = e.target.closest(".mark-btn");
      if (!btn) return;
      const id = btn.dataset.id, type = btn.dataset.type;
      const newStatus = type === "lost" ? "found" : "returned";
      const items = loadItems();
      const updated = updateItemStatus(items, id, newStatus);
      saveItems(updated);
      showToast(newStatus === "found" ? "已标记为已找到" : "已标记为已归还");
      renderMine(); render();
    });
  }

  // 6. 我的页面底部导航专属绑定
  const navHomeMine = document.getElementById("navHomeMine");
  if(navHomeMine) {
    navHomeMine.addEventListener("click", () => {
      currentKeyword = "";
      if(searchInput) searchInput.value = "";
      switchTab("lost");
      goHome();
    });
  }

  const navAddMine = document.getElementById("navAddMine");
  if(navAddMine) {
    navAddMine.addEventListener("click", () => {
      resetPublishForm();
      showView("publishView");
    });
  }

  // 7. 发布页-返回按钮
  const backBtn = document.getElementById("backBtn");
  if(backBtn) backBtn.addEventListener("click", () => goHome());
  
  // 8. 发布页-图片预览
  const imageInput = document.getElementById("p-image");
  if(imageInput) {
    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const preview = document.getElementById("imagePreview");
      if(!preview) return;
      preview.innerHTML = "";
      if (!file) return;
      compressImage(file, (dataUrl) => {
        const img = document.createElement("img");
        img.src = dataUrl;
        preview.appendChild(img);
      });
    });
  }
  
  // 9. 发布页-提交
  const publishForm = document.getElementById("publishForm");
  if(publishForm) publishForm.addEventListener("submit", handlePublish);
  
  // 10. 窗口变化
  window.addEventListener("resize", moveIndicator);
  
    // 11. 点击卡片打开详情
  const itemList = document.getElementById("itemList");
  if (itemList) {
    itemList.addEventListener("click", (e) => {
      const card = e.target.closest(".item-card");
      if (!card) return;
      const id = card.dataset.id;
      if (id) showDetail(id);
    });
  }

  // 12. 详情页返回
  const detailBackBtn = document.getElementById("detailBackBtn");
  if (detailBackBtn) {
    detailBackBtn.addEventListener("click", () => goHome());
  }

  // 13. 我的页面底部“我的”按钮
  const navMineMine = document.getElementById("navMineMine");
  if (navMineMine) {
    navMineMine.addEventListener("click", () => {
      showView("mineView");
      renderMine();
    });
  }
}
