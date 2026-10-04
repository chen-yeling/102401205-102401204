const STORAGE_KEY = "campus_lost_found_items";

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function clearItems() {
  localStorage.removeItem(STORAGE_KEY);
}
