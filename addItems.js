// DOM Elements
const addItemForm = document.getElementById("addItemForm");
const itemNameInput = document.getElementById("itemName");
const itemPriceInput = document.getElementById("itemPrice");
const errorDiv = document.getElementById("error");
const itemList = document.getElementById("itemList");

// Fetch and display items on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:5000/getstationeryitems");
    if (!response.ok) throw new Error("Failed to fetch items");

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid response format");

    displayItems(data);
  } catch (error) {
    console.error("❌ Error fetching items:", error);
    showError("Could not load items.");
  }
});

// Handle form submission
addItemForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = itemNameInput.value.trim();
  const price = itemPriceInput.value.trim();

  if (!name || !price) {
    showError("Please fill in all fields.");
    return;
  }

  if (isNaN(price) || parseFloat(price) <= 0) {
    showError("Price must be a positive number.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/additems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to add item");
    }

    // Add the new item to the list
    const newItem = { ItemName: name, Price: price, id: result.itemId };
    addItemToList(newItem);

    // Clear the form
    itemNameInput.value = "";
    itemPriceInput.value = "";
    showError("");
  } catch (error) {
    console.error("❌ Error adding item:", error.message);
    showError(error.message || "Failed to add item.");
  }
});

// Display items in the list
function displayItems(items) {
  if (items.length === 0) {
    itemList.innerHTML = `<li class="list-group-item text-muted text-center">No items added yet.</li>`;
    return;
  }

  itemList.innerHTML = items
    .map(
      (item) => `
      <li class="list-group-item">
        ${item.ItemName} - $${item.Price}
      </li>
    `
    )
    .join("");
}

// Add a single item to the list
function addItemToList(item) {
  const listItem = document.createElement("li");
  listItem.className = "list-group-item";
  listItem.textContent = `${item.ItemName} - $${item.Price}`;
  itemList.appendChild(listItem);

  // Remove the "No items added yet" message if it exists
  const noItemsMessage = itemList.querySelector(".text-muted");
  if (noItemsMessage) {
    noItemsMessage.remove();
  }
}

// Show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = message ? "block" : "none";
}