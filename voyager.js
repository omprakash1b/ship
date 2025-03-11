// Categories data
const categories = [
    { name: "Catering", description: "Order snacks, food, and beverages.", path: "/catering-dashboard.html" },
    { name: "Stationery", description: "Order gift items, chocolates, and tale books.", path: "/stationary-dashboard.html" },
    { name: "Resort-Movies", description: "Book movie tickets and check seating availability.", path: "/movies-dashboard.html" },
    { name: "Beauty Salon", description: "Book an appointment at the beauty salon.", path: "/beautySalon-dashboard.html" },
    { name: "Fitness Center", description: "Select training equipment and schedule gym time.", path: "/gym-dashboard.html" },
    { name: "Party Hall", description: "Reserve a hall for various types of gatherings.", path: "/partyHall-dashboard.html" },
  ];
  
  // Function to create category cards
  function createCategoryCards() {
    const categoriesContainer = document.getElementById("categoriesContainer");
  
    categories.forEach((category) => {
      const card = document.createElement("div");
      card.className = "col-md-4 mb-4";
  
      card.innerHTML = `
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h3 class="card-title">${category.name}</h3>
            <p class="card-text">${category.description}</p>
            <button class="btn btn-primary" onclick="navigateTo('${category.path}')">Explore</button>
          </div>
        </div>
      `;
  
      categoriesContainer.appendChild(card);
    });
  }
  
  // Function to navigate to a specific page
  function navigateTo(path) {
    window.location.href = path;
  }
  
  // Initialize the page
  document.addEventListener("DOMContentLoaded", () => {
    createCategoryCards();
  });