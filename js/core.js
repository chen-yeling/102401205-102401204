// 生成一条完整信息
function createItem(data) {
  return {
    id: Date.now().toString(),
    type: data.type,
    title: data.title,
    desc: data.desc,
    place: data.place,
    date: data.date,
    contact: data.contact,
    status: "active",
    createdAt: Date.now()
  };
}

// 按关键词搜索：匹配物品名称、描述、地点
function searchItems(items, keyword) {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return items;
  return items.filter(item => {
    const title = (item.title || "").toLowerCase();
    const desc = (item.desc || "").toLowerCase();
    const place = (item.place || "").toLowerCase();
    return title.includes(kw) || desc.includes(kw) || place.includes(kw);
  });
}

// 按类型筛选：lost / found / all
function filterItems(items, type) {
  if (type === "all") return items;
  return items.filter(item => item.type === type);
}

// 更新某条信息的状态
function updateItemStatus(items, id, status) {
  return items.map(item => {
    if (item.id === id) {
      return { ...item, status: status };
    }
    return item;
  });
}

// 状态代码转中文
function getStatusText(item) {
  if (item.status === "found") return "已找到";
  if (item.status === "returned") return "已归还";
  return "进行中";
}
