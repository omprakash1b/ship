// DOM Elements
const ordersTable = document.getElementById('ordersTable');

// Fetch ordered stationery items
async function fetchOrders() {
  try {
    const response = await fetch('http://localhost:5000/orderedstatoneryitems');
    if (!response.ok) throw new Error('Failed to fetch orders');

    const data = await response.json();
    const orders = Array.isArray(data.result) ? data.result : [];
    displayOrders(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    ordersTable.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">Failed to load orders. Please try again later.</td>
      </tr>
    `;
  }
}

// Display orders in the table
function displayOrders(orders) {
  ordersTable.innerHTML = orders.length > 0
    ? orders.map(order => `
        <tr>
          <td class="fw-bold">${order.ItemName}</td>
          <td>${order.Quantity}</td>
          <td>${order.CustomerID || 'N/A'}</td>
          <td>
            <span class="badge bg-primary">${order.OrderID}</span>
          </td>
        </tr>
      `).join('')
    : `
      <tr>
        <td colspan="4" class="text-center text-muted">No orders found 🛒</td>
      </tr>
    `;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchOrders);