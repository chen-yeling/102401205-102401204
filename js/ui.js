// 当前的状态：关键词、类型
let currentKeyword = "";
let currentType = "lost";

// 切换视图
function showView(viewId) {
  document.querySelectorAll(".view").forEach(v => {
    v.classList.remove("active");
  });
  document.getElementById(viewId).classList.add("active");
}

// 回到首页
function goHome() {
  showView("homeView");
  // 视图切换后红线位置要重算
  moveIndicator();
  render();
}

// 清空表单的所有错误提示
function clearErrors() {
  document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
}

// 显示某个字段的错误
function showError(fieldId, message) {
  const el = document.getElementById("err-" + fieldId);
  if (el) el.textContent = message;
}

// 图片压缩：把用户选的图缩到最大 600px 宽，转成 Base64
function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;
      const maxW = 600;
      if (w > maxW) {
        h = h * maxW / w;
        w = maxW;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// 重置发布表单
function resetPublishForm() {
  const form = document.getElementById("publishForm");
  form.reset();
  document.getElementById("imagePreview").innerHTML = "";
  clearErrors();
  document.getElementById("submitBtn").disabled = false;
}

function handlePublish(e) {
  e.preventDefault();
  clearErrors();

  const form = e.target;
  const submitBtn = document.getElementById("submitBtn");

  // 取值
  const typeEl = form.querySelector('input[name="type"]:checked');
  const title = form.title.value.trim();
  const desc = form.desc.value.trim();
  const date = form.date.value;
  const place = form.place.value.trim();
  const contact = form.contact.value.trim();
  const remark = form.remark.value.trim();

  // 校验
  let hasError = false;
  if (!typeEl) {
    showError("type", "请选择类型");
    hasError = true;
  }
  if (!title) {
    showError("title", "请填写物品名称");
    hasError = true;
  }
  if (!date) {
    showError("date", "请选择失物/拾物时间");
    hasError = true;
  }
  if (!place) {
    showError("place", "请填写失物/拾物地点");
    hasError = true;
  }
  if (!contact) {
    showError("contact", "请填写联系方式");
    hasError = true;
  }

  if (hasError) return;

  // 防止重复提交
  submitBtn.disabled = true;

  // 处理图片
  const fileInput = document.getElementById("p-image");
  const file = fileInput.files[0];

  const finish = (imageData) => {
    const item = createItem({
      type: typeEl.value,
      title: title,
      desc: desc,
      date: date,
      place: place,
      image: imageData,
      contact: contact,
      remark: remark
    });

    const items = loadItems();
    items.unshift(item);
    saveItems(items);

    showToast("发布成功！");

    // 1.2 秒后回首页
    setTimeout(() => {
      resetPublishForm();
      goHome();
    }, 1200);
  };

  if (file) {
    compressImage(file, finish);
  } else {
    finish("");
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

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

  // 3. 底部“首页”
  document.getElementById("navHome").addEventListener("click", () => {
    currentKeyword = "";
    searchInput.value = "";
    switchTab("lost");
    goHome();
  });

  // 4. 底部“+”：打开发布视图
  document.getElementById("navAdd").addEventListener("click", () => {
    resetPublishForm();
    showView("publishView");
  });

  // 5. 底部“我的”
  document.getElementById("navMine").addEventListener("click", () => {
    alert("我的发布功能即将上线");
  });

  // 6. 发布页返回按钮
  document.getElementById("backBtn").addEventListener("click", () => {
    goHome();
  });

  // 7. 图片预览
  document.getElementById("p-image").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("imagePreview");
    preview.innerHTML = "";
    if (!file) return;
    compressImage(file, (dataUrl) => {
      const img = document.createElement("img");
      img.src = dataUrl;
      preview.appendChild(img);
    });
  });

  // 8. 表单提交
  document.getElementById("publishForm").addEventListener("submit", handlePublish);

  // 9. 窗口大小变化时红线重算
  window.addEventListener("resize", moveIndicator);
}
