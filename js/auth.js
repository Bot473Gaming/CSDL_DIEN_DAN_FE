// DOM Elements
const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const loginError = document.getElementById("login-error")
const registerError = document.getElementById("register-error")

// Initialize auth
document.addEventListener("DOMContentLoaded", () => {
  // Setup login form
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
    
    // Check for registration success message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      showSuccess(loginError, "Đăng ký thành công! Vui lòng đăng nhập.");
    }
  }

  // Setup register form
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister)
  }
})

// Handle login
async function handleLogin(e) {
  e.preventDefault()

  const username = document.getElementById("username").value.trim()
  const password = document.getElementById("password").value
  const rememberMe = document.getElementById("remember-me")?.checked || false

  // Validate inputs
  if (!username) {
    showError(loginError, "Vui lòng nhập tên đăng nhập")
    return
  }
  if (!password) {
    showError(loginError, "Vui lòng nhập mật khẩu")
    return
  }

  try {
    // Show loading state
    const submitButton = loginForm.querySelector('button[type="submit"]')
    const originalText = submitButton.textContent
    submitButton.disabled = true
    submitButton.textContent = "Đang đăng nhập..."

    // Call login API
    const response = await api.login({ username, password })
    
    if (!response.success) {
      throw new Error(response.message || "Đăng nhập thất bại")
    }

    // Save token and user data
    const { access_token, user } = response.data
    localStorage.setItem("token", access_token)
    localStorage.setItem("currentUser", JSON.stringify(user))

    // Handle remember me
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true")
    } else {
      localStorage.removeItem("rememberMe")
    }

    // Trigger custom event for user change
    window.dispatchEvent(new CustomEvent('userChanged'));

    // Redirect to previous page or home
    const redirect = sessionStorage.getItem("loginRedirect") || "index.html"
    sessionStorage.removeItem("loginRedirect")
    window.location.href = redirect
  } catch (error) {
    showError(loginError, error.message || "Tên đăng nhập hoặc mật khẩu không đúng")
  } finally {
    // Reset button state
    const submitButton = loginForm.querySelector('button[type="submit"]')
    submitButton.disabled = false
    submitButton.textContent = "Đăng nhập"
  }
}

// Handle register
async function handleRegister(e) {
  e.preventDefault()

  const fullname = document.getElementById("fullname").value.trim()
  const username = document.getElementById("username").value.trim()
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirm-password").value
  const terms = document.getElementById("terms")?.checked || false

  // Validate inputs
  if (!fullname) {
    showError(registerError, "Vui lòng nhập họ tên")
    return
  }
  if (!username) {
    showError(registerError, "Vui lòng nhập tên đăng nhập")
    return
  }
  if (!email) {
    showError(registerError, "Vui lòng nhập email")
    return
  }
  if (!password) {
    showError(registerError, "Vui lòng nhập mật khẩu")
    return
  }
  if (password !== confirmPassword) {
    showError(registerError, "Mật khẩu xác nhận không khớp")
    return
  }
  if (!terms) {
    showError(registerError, "Vui lòng đồng ý với điều khoản sử dụng")
    return
  }

  try {
    // Show loading state
    const submitButton = registerForm.querySelector('button[type="submit"]')
    const originalText = submitButton.textContent
    submitButton.disabled = true
    submitButton.textContent = "Đang đăng ký..."

    // Call register API
    const response = await api.register({ fullname, username, email, password })
    console.log("vvvv",response)
    if (!response.success) {
      throw new Error(response.message || "Đăng ký thất bại")
    }

    // If registration returns token and user
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token)
      localStorage.setItem("currentUser", JSON.stringify(response.data.user))
      
      // Trigger custom event for user change
      window.dispatchEvent(new CustomEvent('userChanged'));
      
      window.location.href = "index.html"
    } else {
      // Redirect to login page with success message
      window.location.href = "login.html?registered=true"
    }
  } catch (error) {
    showError(registerError, error.message || "Đăng ký thất bại. Vui lòng thử lại.")
  } finally {
    // Reset button state
    const submitButton = registerForm.querySelector('button[type="submit"]')
    submitButton.disabled = false
    submitButton.textContent = "Đăng ký"
  }
}

// Show error message
function showError(element, message) {
  if (element) {
    element.textContent = message
    element.style.display = "block"
    element.classList.remove("success")
    element.classList.add("error")

    // Hide error after 5 seconds
    setTimeout(() => {
      element.style.display = "none"
    }, 5000)
  }
}

// Show success message
function showSuccess(element, message) {
  if (element) {
    element.textContent = message
    element.style.display = "block"
    element.classList.remove("error")
    element.classList.add("success")

    // Hide message after 5 seconds
    setTimeout(() => {
      element.style.display = "none"
    }, 5000)
  }
}

// Logout function
function logout() {
  // Clear all auth data
  localStorage.removeItem("token")
  localStorage.removeItem("currentUser")
  localStorage.removeItem("rememberMe")
  sessionStorage.removeItem("loginRedirect")

  // Redirect to home page
  window.location.href = "index.html"
}

// Export functions
window.logout = logout
