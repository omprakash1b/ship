// DOM Elements
const itemList = document.getElementById("itemList");
const errorDiv = document.getElementById("error");

// Fetch items from the backend
async function fetchItems() {
  try {
    const response = await fetch("http://localhost:5000/getstationeryitems");
    if (!response.ok) throw new Error("Failed to fetch items");

    const data = await response.json();
    if (!Array.isArray(data.results)) throw new Error("Invalid data format");

    displayItems(data.results);
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    showError("Could not load items.");
  }
}

// Display items in the list
function displayItems(items) {
  if (items.length === 0) {
    itemList.innerHTML = `<li class="list-group-item text-muted text-center">No items available.</li>`;
    return;
  }

  itemList.innerHTML = items
    .map(
      (item) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${item.ItemName}</span>
        <button class="btn btn-danger" onclick="deleteItem(${item.ItemID})">❌ Delete</button>
      </li>
    `
    )
    .join("");
}

// Handle item deletion
async function deleteItem(id) {
  try {
    const response = await fetch(`http://localhost:5000/deleteitem/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete item");
    }

    // Remove item from UI
    const updatedItems = Array.from(itemList.children)
      .filter((li) => {
        const button = li.querySelector("button");
        return button && button.getAttribute("onclick").includes(`deleteItem(${id})`);
      })
      .map((li) => ({
        ItemID: id,
        ItemName: li.querySelector("span").textContent,
      }));

    displayItems(updatedItems);
  } catch (error) {
    console.error("❌ Delete Error:", error);
    showError(`Could not delete item. ${error.message}`);
  }
}

// Show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = message ? "block" : "none";
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  fetchItems();
});