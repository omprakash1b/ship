// Bookings data
const bookings = [
    { id: 1, category: "Resort-Movie", details: "Movie: Avatar 2, Seats: 4" },
    { id: 2, category: "Beauty Salon", details: "Spa Appointment - 3 PM" },
    { id: 3, category: "Fitness Center", details: "Gym Slot: 6-7 AM" },
    { id: 4, category: "Party Hall", details: "Birthday Party, 20 Guests" },
  ];
  
  // Function to create booking cards
  function createBookingCards() {
    const bookingsContainer = document.getElementById('bookingsContainer');
  
    bookings.forEach((booking) => {
      const card = document.createElement('div');
      card.className = 'col-md-6 mb-3';
  
      card.innerHTML = `
        <div class="card shadow-sm p-3">
          <h5 class="card-title">${booking.category}</h5>
          <p class="card-text">${booking.details}</p>
          <button class="btn btn-primary" onclick="viewDetails()">View Details</button>
        </div>
      `;
  
      bookingsContainer.appendChild(card);
    });
  }
  
  // Function to navigate to the details page
  function viewDetails() {
    window.location.href = 'viewbookings.html';
  }
  
  // Initialize the page
  document.addEventListener('DOMContentLoaded', () => {
    createBookingCards();
  });