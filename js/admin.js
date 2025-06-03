// DOM Elements
const adminTabs = document.querySelectorAll(".admin-menu li")
const adminTabPanes = document.querySelectorAll(".admin-tab-pane")
const totalUsers = document.getElementById("total-users")
const totalPosts = document.getElementById("total-posts")
const totalComments = document.getElementById("total-comments")
const totalReports = document.getElementById("total-reports")
const activityChart = document.getElementById("activity-chart")
const categoriesChart = document.getElementById("categories-chart")
const recentActivitiesList = document.getElementById("recent-activities-list")
const usersTableBody = document.getElementById("users-table-body")
const usersPagination = document.getElementById("users-pagination")

// API URL
const API_URL = "https://forum-service-csdl.onrender.com"

// Get token and current user
const token = localStorage.getItem("token")
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

// Format date function
function formatDate(dateString) {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Initialize admin
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is admin
  if (token && currentUser && currentUser.role === "admin") {
    // Setup tabs
    setupAdminTabs()

    // Load dashboard data
    loadDashboardData()

    // Load users data
    loadUsersData()
  } else {
    // Redirect to home if not admin
    window.location.href = "index.html"
  }
})

// Setup admin tabs
function setupAdminTabs() {
  if (!adminTabs.length || !adminTabPanes.length) return

  adminTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab

      // Remove active class from all tabs and panes
      adminTabs.forEach((t) => t.classList.remove("active"))
      adminTabPanes.forEach((p) => p.classList.remove("active"))

      // Add active class to selected tab and pane
      tab.classList.add("active")
      document.getElementById(`${tabId}-tab`).classList.add("active")

      // Load data based on tab
      switch (tabId) {
        case "users":
          loadUsersData()
          break
        case "posts":
          loadPostsData()
          break
        case "comments":
          loadCommentsData()
          break
        case "categories":
          loadCategoriesData()
          break
        case "tags":
          loadTagsData()
          break
        case "reports":
          loadReportsData()
          break
        case "settings":
          loadSettingsData()
          break
      }
    })
  })
}

// Load dashboard data
async function loadDashboardData() {
  try {
    const response = await fetch(`${API_URL}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data")
    }

    const data = await response.json()

    // Update stats
    if (totalUsers) totalUsers.textContent = data.totalUsers || 0
    if (totalPosts) totalPosts.textContent = data.totalPosts || 0
    if (totalComments) totalComments.textContent = data.totalComments || 0
    if (totalReports) totalReports.textContent = data.totalReports || 0

    // Update charts
    if (activityChart) {
      activityChart.innerHTML = '<div class="chart-placeholder">Biểu đồ hoạt động sẽ được hiển thị ở đây</div>'
      // In a real implementation, you would use a charting library like Chart.js
    }

    if (categoriesChart) {
      categoriesChart.innerHTML = '<div class="chart-placeholder">Biểu đồ phân bố danh mục sẽ được hiển thị ở đây</div>'
      // In a real implementation, you would use a charting library like Chart.js
    }

    // Update recent activities
    if (recentActivitiesList && data.recentActivities) {
      if (data.recentActivities.length === 0) {
        recentActivitiesList.innerHTML = `
          <div class="empty-state">
            <p>Không có hoạt động gần đây.</p>
          </div>
        `
        return
      }

      recentActivitiesList.innerHTML = data.recentActivities
        .map((activity) => {
          let icon, content

          switch (activity.type) {
            case "user_registered":
              icon = "fa-user-plus"
              content = `<p><strong>${activity.user.fullname}</strong> đã đăng ký tài khoản mới</p>`
              break
            case "post_created":
              icon = "fa-file-alt"
              content = `<p><strong>${activity.user.fullname}</strong> đã đăng bài viết <a href="post.html?id=${activity.post._id}">${activity.post.title}</a></p>`
              break
            case "comment_created":
              icon = "fa-comment"
              content = `<p><strong>${activity.user.fullname}</strong> đã bình luận trong bài viết <a href="post.html?id=${activity.post._id}">${activity.post.title}</a></p>`
              break
            case "post_reported":
              icon = "fa-flag"
              content = `<p><strong>${activity.user.fullname}</strong> đã báo cáo bài viết <a href="post.html?id=${activity.post._id}">${activity.post.title}</a></p>`
              break
            case "user_banned":
              icon = "fa-user-slash"
              content = `<p><strong>${activity.user.fullname}</strong> đã bị cấm</p>`
              break
            default:
              icon = "fa-bell"
              content = `<p>Hoạt động không xác định</p>`
          }

          return `
            <div class="activity-item">
              <div class="activity-icon">
                <i class="fas ${icon}"></i>
              </div>
              <div class="activity-content">
                ${content}
                <div class="activity-time">${formatDate(activity.createdAt)}</div>
              </div>
            </div>
          `
        })
        .join("")
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error)
    // Show error message
    if (totalUsers) totalUsers.textContent = "Error"
    if (totalPosts) totalPosts.textContent = "Error"
    if (totalComments) totalComments.textContent = "Error"
    if (totalReports) totalReports.textContent = "Error"

    if (recentActivitiesList) {
      recentActivitiesList.innerHTML = `
        <div class="error-state">
          <p>Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
        </div>
      `
    }
  }
}

// Load users data
async function loadUsersData() {
  if (!usersTableBody) return

  // Get query parameters
  const searchInput = document.getElementById("search-users")
  const roleFilter = document.getElementById("filter-users-role")
  const statusFilter = document.getElementById("filter-users-status")

  const search = searchInput ? searchInput.value : ""
  const role = roleFilter ? roleFilter.value : ""
  const status = statusFilter ? statusFilter.value : ""

  // Get page from URL or default to 1
  const urlParams = new URLSearchParams(window.location.search)
  const page = Number.parseInt(urlParams.get("page")) || 1

  try {
    // Build query string
    let queryString = `?page=${page}`
    if (search) queryString += `&search=${encodeURIComponent(search)}`
    if (role) queryString += `&role=${role}`
    if (status) queryString += `&status=${status}`

    const response = await fetch(`${API_URL}/admin/users${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    const data = await response.json()
    const users = data.users
    const totalPages = data.totalPages || 1

    if (users.length === 0) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">Không có người dùng nào.</td>
        </tr>
      `
    } else {
      // Render users table
      usersTableBody.innerHTML = users
        .map(
          (user) => `
            <tr>
              <td>${user._id}</td>
              <td class="user-name">
                <img src="${user.avatar || "assets/images/default-avatar.png"}" alt="${user.fullname}" class="user-avatar">
                ${user.fullname}
              </td>
              <td>${user.email}</td>
              <td>${user.role === "admin" ? "Quản trị viên" : user.role === "moderator" ? "Điều hành viên" : "Thành viên"}</td>
              <td>
                <span class="status ${user.status}">${
                  user.status === "active" ? "Hoạt động" : user.status === "inactive" ? "Không hoạt động" : "Bị cấm"
                }</span>
              </td>
              <td>${formatDate(user.createdAt)}</td>
              <td class="actions">
                <button class="edit" title="Chỉnh sửa" data-id="${user._id}"><i class="fas fa-edit"></i></button>
                <button class="delete" title="Xóa" data-id="${user._id}"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          `,
        )
        .join("")
    }

    // Setup pagination
    if (usersPagination) {
      usersPagination.innerHTML = `
        <div class="admin-pagination-item">
          <a href="admin.html?page=${Math.max(1, page - 1)}" class="admin-pagination-link ${page === 1 ? "disabled" : ""}">
            <i class="fas fa-chevron-left"></i>
          </a>
        </div>
        ${Array.from({ length: totalPages }, (_, i) => i + 1)
          .map(
            (p) => `
              <div class="admin-pagination-item">
                <a href="admin.html?page=${p}" class="admin-pagination-link ${p === page ? "active" : ""}">
                  ${p}
                </a>
              </div>
            `,
          )
          .join("")}
        <div class="admin-pagination-item">
          <a href="admin.html?page=${Math.min(totalPages, page + 1)}" class="admin-pagination-link ${page === totalPages ? "disabled" : ""}">
            <i class="fas fa-chevron-right"></i>
          </a>
        </div>
      `
    }

    // Setup edit buttons
    const editButtons = document.querySelectorAll(".actions .edit")
    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const userId = button.dataset.id
        showEditUserModal(userId)
      })
    })

    // Setup delete buttons
    const deleteButtons = document.querySelectorAll(".actions .delete")
    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const userId = button.dataset.id
        showDeleteUserModal(userId)
      })
    })

    // Setup search and filters
    if (searchInput) {
      searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          loadUsersData()
        }
      })
    }

    if (roleFilter) {
      roleFilter.addEventListener("change", loadUsersData)
    }

    if (statusFilter) {
      statusFilter.addEventListener("change", loadUsersData)
    }

    // Setup add user button
    const addUserBtn = document.getElementById("add-user-btn")
    if (addUserBtn) {
      addUserBtn.addEventListener("click", showAddUserModal)
    }
  } catch (error) {
    console.error("Error loading users:", error)
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Đã xảy ra lỗi khi tải dữ liệu người dùng. Vui lòng thử lại sau.</td>
      </tr>
    `
  }
}

// Show edit user modal
async function showEditUserModal(userId) {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }

    const user = await response.json()

    // Create modal
    const modal = document.createElement("div")
    modal.className = "modal"
    modal.innerHTML = `
      <div class="modal-header">
        <h3>Chỉnh sửa người dùng</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-user-form" class="admin-form">
          <div class="form-group">
            <label for="edit-user-fullname">Họ và tên</label>
            <input type="text" id="edit-user-fullname" name="fullname" value="${user.fullname}">
          </div>
          <div class="form-group">
            <label for="edit-user-email">Email</label>
            <input type="email" id="edit-user-email" name="email" value="${user.email}">
          </div>
          <div class="form-group">
            <label for="edit-user-role">Vai trò</label>
            <select id="edit-user-role" name="role">
              <option value="member" ${user.role === "member" ? "selected" : ""}>Thành viên</option>
              <option value="moderator" ${user.role === "moderator" ? "selected" : ""}>Điều hành viên</option>
              <option value="admin" ${user.role === "admin" ? "selected" : ""}>Quản trị viên</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-user-status">Trạng thái</label>
            <select id="edit-user-status" name="status">
              <option value="active" ${user.status === "active" ? "selected" : ""}>Hoạt động</option>
              <option value="inactive" ${user.status === "inactive" ? "selected" : ""}>Không hoạt động</option>
              <option value="banned" ${user.status === "banned" ? "selected" : ""}>Bị cấm</option>
            </select>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="cancel-edit-user">Hủy</button>
        <button class="btn btn-primary" id="save-edit-user">Lưu</button>
      </div>
    `

    // Add modal to container
    const modalContainer = document.getElementById("modal-container")
    modalContainer.innerHTML = ""
    modalContainer.appendChild(modal)
    modalContainer.classList.add("active")

    // Setup close button
    const closeBtn = modal.querySelector(".close-modal")
    closeBtn.addEventListener("click", () => {
      modalContainer.classList.remove("active")
    })

    // Setup cancel button
    const cancelBtn = document.getElementById("cancel-edit-user")
    cancelBtn.addEventListener("click", () => {
      modalContainer.classList.remove("active")
    })

    // Setup save button
    const saveBtn = document.getElementById("save-edit-user")
    saveBtn.addEventListener("click", async () => {
      const fullname = document.getElementById("edit-user-fullname").value
      const email = document.getElementById("edit-user-email").value
      const role = document.getElementById("edit-user-role").value
      const status = document.getElementById("edit-user-status").value

      if (!fullname || !email) {
        alert("Vui lòng nhập đầy đủ thông tin")
        return
      }

      try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fullname, email, role, status }),
        })

        if (!response.ok) {
          throw new Error("Failed to update user")
        }

        alert("Đã cập nhật người dùng thành công")

        // Reload users data
        loadUsersData()

        // Close modal
        modalContainer.classList.remove("active")
      } catch (error) {
        console.error("Error updating user:", error)
        alert("Đã xảy ra lỗi khi cập nhật người dùng. Vui lòng thử lại sau.")
      }
    })
  } catch (error) {
    console.error("Error fetching user for edit:", error)
    alert("Đã xảy ra lỗi khi tải thông tin người dùng. Vui lòng thử lại sau.")
  }
}

// Show delete user modal
function showDeleteUserModal(userId) {
  // Create modal
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.innerHTML = `
    <div class="modal-header">
      <h3>Xóa người dùng</h3>
      <button class="close-modal">&times;</button>
    </div>
    <div class="modal-body">
      <p>Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" id="cancel-delete-user">Hủy</button>
      <button class="btn btn-danger" id="confirm-delete-user">Xóa</button>
    </div>
  `

  // Add modal to container
  const modalContainer = document.getElementById("modal-container")
  modalContainer.innerHTML = ""
  modalContainer.appendChild(modal)
  modalContainer.classList.add("active")

  // Setup close button
  const closeBtn = modal.querySelector(".close-modal")
  closeBtn.addEventListener("click", () => {
    modalContainer.classList.remove("active")
  })

  // Setup cancel button
  const cancelBtn = document.getElementById("cancel-delete-user")
  cancelBtn.addEventListener("click", () => {
    modalContainer.classList.remove("active")
  })

  // Setup confirm button
  const confirmBtn = document.getElementById("confirm-delete-user")
  confirmBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      alert("Đã xóa người dùng thành công")

      // Reload users data
      loadUsersData()

      // Close modal
      modalContainer.classList.remove("active")
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Đã xảy ra lỗi khi xóa người dùng. Vui lòng thử lại sau.")
    }
  })
}

// Show add user modal
function showAddUserModal() {
  // Create modal
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.innerHTML = `
    <div class="modal-header">
      <h3>Thêm người dùng mới</h3>
      <button class="close-modal">&times;</button>
    </div>
    <div class="modal-body">
      <form id="add-user-form" class="admin-form">
        <div class="form-group">
          <label for="add-user-fullname">Họ và tên</label>
          <input type="text" id="add-user-fullname" name="fullname" required>
        </div>
        <div class="form-group">
          <label for="add-user-username">Tên đăng nhập</label>
          <input type="text" id="add-user-username" name="username" required>
        </div>
        <div class="form-group">
          <label for="add-user-email">Email</label>
          <input type="email" id="add-user-email" name="email" required>
        </div>
        <div class="form-group">
          <label for="add-user-password">Mật khẩu</label>
          <input type="password" id="add-user-password" name="password" required>
        </div>
        <div class="form-group">
          <label for="add-user-role">Vai trò</label>
          <select id="add-user-role" name="role">
            <option value="member">Thành viên</option>
            <option value="moderator">Điều hành viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" id="cancel-add-user">Hủy</button>
      <button class="btn btn-primary" id="save-add-user">Thêm</button>
    </div>
  `

  // Add modal to container
  const modalContainer = document.getElementById("modal-container")
  modalContainer.innerHTML = ""
  modalContainer.appendChild(modal)
  modalContainer.classList.add("active")

  // Setup close button
  const closeBtn = modal.querySelector(".close-modal")
  closeBtn.addEventListener("click", () => {
    modalContainer.classList.remove("active")
  })

  // Setup cancel button
  const cancelBtn = document.getElementById("cancel-add-user")
  cancelBtn.addEventListener("click", () => {
    modalContainer.classList.remove("active")
  })

  // Setup save button
  const saveBtn = document.getElementById("save-add-user")
  saveBtn.addEventListener("click", async () => {
    const fullname = document.getElementById("add-user-fullname").value
    const username = document.getElementById("add-user-username").value
    const email = document.getElementById("add-user-email").value
    const password = document.getElementById("add-user-password").value
    const role = document.getElementById("add-user-role").value

    if (!fullname || !username || !email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin")
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullname, username, email, password, role }),
      })

      if (!response.ok) {
        throw new Error("Failed to add user")
      }

      alert("Đã thêm người dùng thành công")

      // Reload users data
      loadUsersData()

      // Close modal
      modalContainer.classList.remove("active")
    } catch (error) {
      console.error("Error adding user:", error)
      alert("Đã xảy ra lỗi khi thêm người dùng. Vui lòng thử lại sau.")
    }
  })
}

// Load posts data
function loadPostsData() {
  // Implement similar to loadUsersData
  console.log("Loading posts data...")
}

// Load comments data
function loadCommentsData() {
  // Implement similar to loadUsersData
  console.log("Loading comments data...")
}

// Load categories data
function loadCategoriesData() {
  // Implement similar to loadUsersData
  console.log("Loading categories data...")
}

// Load tags data
function loadTagsData() {
  // Implement similar to loadUsersData
  console.log("Loading tags data...")
}

// Load reports data
function loadReportsData() {
  // Implement similar to loadUsersData
  console.log("Loading reports data...")
}

// Load settings data
function loadSettingsData() {
  // Implement similar to loadUsersData
  console.log("Loading settings data...")
}
