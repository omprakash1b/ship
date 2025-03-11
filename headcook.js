document.addEventListener("DOMContentLoaded", function () {
    const ordersTableBody = document.getElementById("orders-table-body");
  
    // Fetch orders from the API
    fetch("http://localhost:5000/headcook")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch catering orders");
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.results)) {
          renderOrders(data.results);
        } else {
          throw new Error("Unexpected response format");
        }
      })
      .catch((error) => {
        console.error("❌ Catering Orders Fetch Error:", error);
        ordersTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-danger">Error: ${error.message}</td>
          </tr>
        `;
      });
  
    // Render orders in the table
    function renderOrders(orders) {
      if (orders.length > 0) {
        const rows = orders
          .map(
            (order) => `
            <tr>
              <td>${order.ItemName}</td>
              <td>${order.Quantity}</td>
              <td>${order.CustomerID}</td>
              <td>${order.Price}</td>
            </tr>
          `
          )
          .join("");
        ordersTableBody.innerHTML = rows;
      } else {
        ordersTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No orders found</td>
          </tr>
        `;
      }
    }
  });