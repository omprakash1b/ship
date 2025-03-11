// Admin options data
const adminOptions = [
    { name: "Add Item", description: "Add new items to the system.", path: "/addItems.html" },
    { name: "Edit/Delete Item", description: "Modify or remove existing items.", path: "/deleteItems.html" },
    { name: "Maintain Menu Items", description: "Manage the availability of menu items.", path: "/manage-food-items.html" },
    { name: "Voyager Registration", description: "Register new voyagers into the system.", path: "/voyagerRegistration.html" },
  ];
  
  // Function to create admin option cards
  function createAdminOptions() {
    const adminOptionsContainer = document.getElementById("adminOptions");
  
    adminOptions.forEach((option) => {
      const card = document.createElement("div");
      card.className = "col-md-4 mb-4";
  
      card.innerHTML = `
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h3 class="card-title">${option.name}</h3>
            <p class="card-text">${option.description}</p>
            <button class="btn btn-primary" onclick="navigateTo('${option.path}')">Manage</button>
          </div>
        </div>
      `;
  
      adminOptionsContainer.appendChild(card);
    });
  }
  
  // Function to navigate to a specific page
  function navigateTo(path) {
    window.location.href = path;
  }
  
  // Initialize the page
  document.addEventListener("DOMContentLoaded", () => {
    createAdminOptions();
  });