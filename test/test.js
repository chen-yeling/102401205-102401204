// ================== 极简测试框架 ==================
let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log("✅ 通过：" + message);
  } else {
    console.error("❌ 失败：" + message);
  }
}

// ================== 构造测试数据 ==================
const mockData = [
  {
    id: "1",
    type: "lost",
    title: "校园卡",
    desc: "在图书馆丢失，姓名张三",
    place: "图书馆三楼",
    date: "2026-10-01",
    contact: "QQ: 123456",
    status: "active"
  },
  {
    id: "2",
    type: "found",
    title: "一串钥匙",
    desc: "在食堂捡到，有挂件",
    place: "第二食堂",
    date: "2026-10-02",
    contact: "微信: abc123",
    status: "active"
  }
];

// ================== 1. 测试 createItem ==================
const newItem = createItem({
  type: "lost",
  title: "蓝牙耳机",
  desc: "白色，带充电仓",
  place: "操场",
  date: "2026-10-03",
  contact: "13800000000",
  image: "",
  remark: "重谢"
});

assert(newItem.title === "蓝牙耳机", "createItem：标题正确");
assert(newItem.type === "lost", "createItem：类型正确");
assert(newItem.status === "active", "createItem：默认状态为 active");
assert(newItem.image === "", "createItem：图片默认为空字符串");
assert(typeof newItem.id === "string", "createItem：自动生成字符串 id");

// ================== 2. 测试 searchItems ==================
assert(searchItems(mockData, "校园卡").length === 1, "searchItems：按名称搜索命中");
assert(searchItems(mockData, "食堂").length === 1, "searchItems：按地点搜索命中");
assert(searchItems(mockData, "图书馆").length === 1, "searchItems：按描述搜索命中");
assert(searchItems(mockData, "手机").length === 0, "searchItems：搜索无结果返回空数组");
assert(searchItems(mockData, "  ").length === 2, "searchItems：空字符串返回全部");
assert(searchItems(mockData, "钥匙")[0].id === "2", "searchItems：返回正确的 id");

// ================== 3. 测试 filterItems ==================
assert(filterItems(mockData, "lost").length === 1, "filterItems：筛选寻物");
assert(filterItems(mockData, "found").length === 1, "filterItems：筛选招领");
assert(filterItems(mockData, "all").length === 2, "filterItems：all 返回全部");

// ================== 4. 测试 updateItemStatus ==================
const updatedItems = updateItemStatus(mockData, "1", "found");
assert(updatedItems[0].status === "found", "updateItemStatus：状态改为 found");
assert(updatedItems[1].status === "active", "updateItemStatus：其他数据不受影响");

// ================== 5. 测试 getStatusText ==================
assert(getStatusText({ status: "active" }) === "进行中", "getStatusText：active → 进行中");
assert(getStatusText({ status: "found" }) === "已找到", "getStatusText：found → 已找到");
assert(getStatusText({ status: "returned" }) === "已归还", "getStatusText：returned → 已归还");

// ================== 输出结果 ==================
const resultDiv = document.getElementById("result");
if (resultDiv) {
  resultDiv.textContent = `测试完成：通过 ${passed} / ${total} 个用例`;
  resultDiv.className = passed === total ? "pass" : "fail";
}