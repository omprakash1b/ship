// Function to handle login
async function login(email, password) {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
  
      const data = await response.json();
      console.log("Login successful:", data);
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  
  // Function to toggle password visibility
  function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggleButton = document.querySelector(
      "#password + .btn-outline-secondary"
    );
  
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleButton.textContent = "Hide";
    } else {
      passwordInput.type = "password";
      toggleButton.textContent = "Show";
    }
  }
  
  // Function to handle form submission
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
  
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }
  
    try {
      const data = await login(email, password);
      const userRole = data["type"]?.toLowerCase();
      const userId = data["id"];
  
      // Store user ID in localStorage
      localStorage.setItem("userId", userId);
  
      // Redirect based on role
      switch (userRole) {
        case "voyager":
          window.location.href = "/voyager.html";
          break;
        case "admin":
          window.location.href = "/admin.html";
          break;
        case "manager":
          window.location.href = "/manager.html";
          break;
        case "cook":
          window.location.href = "/headcook.html";
          break;
        case "supervisor":
          window.location.href = "/supervisor.html";
          break;
        default:
          alert("Invalid role!");
      }
    } catch (error) {
      alert(error.message || "Invalid login credentials");
    }
  });