// Global variables
let token = localStorage.getItem("token")
let currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

// DOM Elements
const userActionsContainer = document.getElementById("user-actions")
const modalContainer = document.getElementById("modal-container")
const createPostBtn = document.getElementById("create-post-btn")
const categoriesMenu = document.getElementById("categories-menu")
const sidebarCategories = document.getElementById("sidebar-categories")
const popularTags = document.getElementById("popular-tags")
const topUsers = document.getElementById("top-users")
const postsContainer = document.getElementById("posts-container")
const postsLoading = document.getElementById("posts-loading")
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded")
  
  // Check if user is logged in
  if (token) {
    fetchCurrentUser()
  } else {
    updateUI()
  }

  // Load initial data
  initializeHomePage()
})

// Initialize homepage data
async function initializeHomePage() {
  try {
    // Show loading states
    if (postsLoading) postsLoading.style.display = "block"
    
    // Load all data in parallel
    await Promise.all([
      loadCategories(),
      loadPopularTags(),
      loadTopUsers()
    ])

    // If we're on the homepage, load posts
    if (postsContainer) {
      await loadPosts()
    }
  } catch (error) {
    console.error("Error initializing homepage:", error)
  } finally {
    // Hide loading states
    if (postsLoading) postsLoading.style.display = "none"
  }
}

// Show login modal
function showLoginModal() {
  alert("Vui lòng đăng nhập để tiếp tục.")
  window.location.href = "login.html"
}

// Logout function
function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("currentUser")
  token = null
  currentUser = null
  updateUI()
  window.location.href = "index.html"
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} ngày trước`
  } else if (hours > 0) {
    return `${hours} giờ trước`
  } else if (minutes > 0) {
    return `${minutes} phút trước`
  } else {
    return "Vừa xong"
  }
}

// Fetch current user
async function fetchCurrentUser() {
  try {
    console.log("Fetching current user...")
    const response = await api.getCurrentUser(token)
    if (response.success && response.data) {
      currentUser = response.data
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
      updateUI()
    } else {
      // If response is not successful, logout
      console.error("Failed to fetch user:", response.message)
      logout()
    }
  } catch (error) {
    console.error("Error fetching current user:", error)
    // If token is invalid, logout
    logout()
  }
}

// Update UI based on authentication status
function updateUI() {
  if (userActionsContainer) {
    if (token && currentUser) {
      userActionsContainer.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-bell"></i>
                    <span class="notification-count" id="notification-count" style="display: none;">0</span>
                </div>
                <div class="user-profile">
                    <img src="${currentUser.avatar || "assets/images/default-avatar.png"}" alt="${currentUser.fullname}">
                    <span class="user-name">${currentUser.fullname}</span>
                    <ul class="user-menu">
                        <li><a href="profile.html?id=${currentUser._id}"><i class="fas fa-user"></i> Trang cá nhân</a></li>
                        <li><a href="settings.html"><i class="fas fa-cog"></i> Cài đặt</a></li>
                        ${currentUser.role === "admin" ? `<li><a href="admin.html"><i class="fas fa-shield-alt"></i> Quản trị</a></li>` : ""}
                        <li><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a></li>
                    </ul>
                </div>
            `

      // Setup logout button
      const logoutBtn = document.getElementById("logout-btn")
      if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
          e.preventDefault()
          logout()
        })
      }

      // Setup notification icon
      const notificationIcon = document.querySelector(".notification-icon")
      if (notificationIcon) {
        notificationIcon.addEventListener("click", toggleNotificationPanel)
      }

      // Update notification count
      updateNotificationCount()
    } else {
      userActionsContainer.innerHTML = `
                <a href="login.html" class="btn btn-outline">Đăng nhập</a>
                <a href="register.html" class="btn btn-primary">Đăng ký</a>
            `
    }
  }
}

// Load categories
async function loadCategories() {
  try {
    const response = await api.getCategories()
    if (!response.success) {
      console.error("Failed to load categories:", response.message)
      return
    }

    const categories = response.data.categories || response.data

    // Update categories menu
    if (categoriesMenu) {
      categoriesMenu.innerHTML = categories
        .map(
          (category) => `
            <li><a href="index.html?category=${category._id}">${category.name}</a></li>
          `,
        )
        .join("")
    }

    // Update sidebar categories
    if (sidebarCategories) {
      sidebarCategories.innerHTML = categories
        .map(
          (category) => `
            <li>
              <a href="index.html?category=${category._id}">
                ${category.name}
                <span class="count">${category.postCount || 0}</span>
              </a>
            </li>
          `,
        )
        .join("")
    }
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

// Load popular tags
async function loadPopularTags() {
  try {
    const response = await api.getTags({ take: 10 })
    if (!response.success) {
      console.error("Failed to load tags:", response.message)
      return
    }

    const tags = response.data.tags || response.data

    if (popularTags) {
      popularTags.innerHTML = tags
        .map(
          (tag) => `
            <a href="index.html?tag=${tag._id}" class="tag">
              ${tag.tagName}
              <span class="count">${tag.postCount || 0}</span>
            </a>
          `,
        )
        .join("")
    }
  } catch (error) {
    console.error("Error loading popular tags:", error)
  }
}

// Load top users
async function loadTopUsers() {
  if (!topUsers) return

  try {
    const response = await api.getAllUsers()
    if (!response.success) {
      console.error("Failed to load users:", response.message)
      return
    }

    const users = response.data || []
    // Sort users by reputation (if available)
    const sortedUsers = users.sort((a, b) => (b.reputation || 0) - (a.reputation || 0)).slice(0, 5)

    topUsers.innerHTML = sortedUsers
      .map(
        (user) => `
          <li>
            <a href="profile.html?id=${user._id}">
              <img src="${user.avatar || "assets/images/default-avatar.png"}" alt="${user.fullname}">
              <div class="user-info">
                <h4>${user.fullname}</h4>
                <p>${user.reputation || 0} điểm uy tín</p>
              </div>
            </a>
          </li>
        `,
      )
      .join("")
  } catch (error) {
    console.error("Error loading top users:", error)
  }
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
  );
}
// Load posts
async function loadPosts() {
  try {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const categoryId = urlParams.get("category")
    const tagIds = urlParams.get("tag")
    const userId = urlParams.get("user")
    const search = urlParams.get("search")
    const sort = urlParams.get("sort") || "newest"
    const page = parseInt(urlParams.get("page")) || 1
    const limit = 10

    // Calculate pagination
    const skip = (page - 1) * limit

    // Show loading
    if (postsLoading) postsLoading.style.display = "block"
    if (postsContainer) postsContainer.innerHTML = ""

    // Fetch posts
    const params = cleanParams({
      categoryId,
      tagIds,
      userId,
      search,
      sort,
      skip,
      take: limit
    });

    const response = await api.getPosts(params);

    // Extract posts and total from response data
    const posts = response.data.posts
    const total = response.data.total

    // Hide loading
    if (postsLoading) postsLoading.style.display = "none"

    // Render posts
    if (postsContainer) {
      if (posts.length === 0) {
        postsContainer.innerHTML = `
          <div class="no-posts">
            <p>Không có bài viết nào.</p>
            ${token ? '<a href="create-post.html" class="btn btn-primary">Tạo bài viết mới</a>' : ''}
          </div>
        `
      } else {
        postsContainer.innerHTML = `
          <div class="posts-list">
            ${posts.map(post => `
              <div class="post-card">
                <div class="post-header">
                  <div class="post-author">
                    <img src="${post.user?.avatar || 'assets/images/default-avatar.png'}" 
                         alt="${post.user?.fullname}">
                    <div>
                      <a href="profile.html?id=${post.user?._id}" class="author-name">
                        ${post.user?.fullname}
                      </a>
                      <span class="post-date">${formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div class="post-category">
                    <a href="index.html?category=${post.category?._id}">${post.category?.name}</a>
                  </div>
                </div>
                <a href="post.html?id=${post._id}">
                <div class="post-content">
                  <h2 class="post-title">
                    ${post.title}
                  </h2>
                  <p class="post-excerpt">${post.content}</p>
                </div>
                </a>
                <div class="post-footer">
                  <div class="post-meta">
                    <span><i class="fas fa-eye"></i> ${post.viewCount || 0}</span>
                    <span><i class="fas fa-comment"></i> ${post.comments?.length || 0}</span>
                    <span><i class="fas fa-thumbs-up"></i> ${post.votes?.length || 0}</span>
                  </div>
                  <div class="post-tags">
                    ${(post.tags || []).map(tag => 
                      `<a href="index.html?tag=${tag._id}" class="tag">${tag.tagName}</a>`
                    ).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          ${renderPagination(page, Math.ceil(total / limit))}
        `

        // Setup post actions
        setupPostActions()
      }
    }
  } catch (error) {
    console.error("Error loading posts:", error)
    if (postsContainer) {
      postsContainer.innerHTML = `
        <div class="error-state">
          <p>Đã xảy ra lỗi khi tải bài viết. Vui lòng thử lại sau.</p>
          <button onclick="loadPosts()" class="btn btn-primary">Thử lại</button>
        </div>
      `
    }
  } finally {
    if (postsLoading) postsLoading.style.display = "none"
  }
}

// Render pagination
function renderPagination(currentPage, totalPages) {
  if (totalPages <= 1) return ''

  let pages = []
  const urlParams = new URLSearchParams(window.location.search)

  // Always show first page, last page, and pages around current page
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // First page
      i === totalPages || // Last page
      (i >= currentPage - 2 && i <= currentPage + 2) // Pages around current page
    ) {
      urlParams.set('page', i)
      pages.push(`
        <a href="?${urlParams.toString()}" 
           class="page-link ${i === currentPage ? 'active' : ''}"
        >${i}</a>
      `)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return `
    <div class="pagination">
      ${currentPage > 1 ? `
        <a href="?${urlParams.set('page', currentPage - 1) && urlParams.toString()}" 
           class="page-link"
        >Trước</a>
      ` : ''}
      ${pages.join('')}
      ${currentPage < totalPages ? `
        <a href="?${urlParams.set('page', currentPage + 1) && urlParams.toString()}" 
           class="page-link"
        >Sau</a>
      ` : ''}
    </div>
  `
}

// Setup post actions
function setupPostActions() {
  // Add event listeners for vote buttons, save buttons, etc.
  const voteButtons = document.querySelectorAll('.vote-btn')
  const saveButtons = document.querySelectorAll('.save-post')
  
  voteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault()
      if (!token) {
        showLoginModal()
        return
      }
      
      const postId = button.dataset.id
      const voteType = button.classList.contains('upvote') ? 1 : -1
      
      try {
        await api.createVote({
          targetType: 'post',
          targetId: postId,
          value: voteType
        })
        loadPosts() // Reload posts to update vote count
      } catch (error) {
        console.error('Error voting:', error)
      }
    })
  })
  
  saveButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault()
      if (!token) {
        showLoginModal()
        return
      }
      
      const postId = button.dataset.id
      const isSaved = button.classList.contains('saved')
      
      try {
        if (isSaved) {
          await api.unsavePost(postId)
          button.classList.remove('saved')
        } else {
          await api.savePost(postId)
          button.classList.add('saved')
        }
      } catch (error) {
        console.error('Error saving post:', error)
      }
    })
  })
}

// Setup mobile menu
function setupMobileMenu() {
  if (!mobileMenuToggle) return

  mobileMenuToggle.addEventListener("click", () => {
    document.body.classList.toggle("mobile-menu-open")
  })

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      document.body.classList.contains("mobile-menu-open") &&
      !e.target.closest(".mobile-menu-toggle") &&
      !e.target.closest(".mobile-menu")
    ) {
      document.body.classList.remove("mobile-menu-open")
    }
  })
}

// Setup search form
function setupSearchForm() {
  const searchForm = document.getElementById("search-form")
  if (!searchForm) return

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const searchInput = searchForm.querySelector("input[name='search']")
    const searchQuery = searchInput.value.trim()

    if (searchQuery) {
      window.location.href = `index.html?search=${encodeURIComponent(searchQuery)}`
    }
  })
}

// Toggle notification panel
function toggleNotificationPanel() {
  const notificationPanel = document.getElementById("notification-panel")
  if (!notificationPanel) return

  if (notificationPanel.style.display === "block") {
    notificationPanel.style.display = "none"
  } else {
    notificationPanel.style.display = "block"
    loadNotifications()
  }
}

// Load notifications
async function loadNotifications() {
  const notificationPanel = document.getElementById("notification-panel")
  const notificationList = document.getElementById("notification-list")
  const notificationLoading = document.getElementById("notification-loading")
  const notificationError = document.getElementById("notification-error")

  if (!notificationPanel || !notificationList || !notificationLoading) return

  try {
    // Show loading state
    notificationLoading.style.display = "block"
    if (notificationError) notificationError.style.display = "none"

    // Fetch notifications
    const response = await api.getNotifications(token)
    if (!response.success) {
      throw new Error(response.message)
    }

    const notifications = response.data.notifications || response.data

    // Hide loading state
    notificationLoading.style.display = "none"

    // Render notifications
    if (notifications.length === 0) {
      notificationList.innerHTML = `
        <div class="empty-state">
          <p>Không có thông báo nào.</p>
        </div>
      `
    } else {
      notificationList.innerHTML = notifications
        .map(
          (notification) => `
            <div class="notification-item ${notification.read ? "" : "unread"}" data-id="${notification._id}">
              <div class="notification-icon">
                ${getNotificationIcon(notification.type)}
              </div>
              <div class="notification-content">
                <div class="notification-text">${notification.content}</div>
                <div class="notification-date">${formatDate(notification.createdAt)}</div>
              </div>
              ${!notification.read ? `<div class="notification-dot"></div>` : ""}
            </div>
          `,
        )
        .join("")

      // Setup notification item click handlers
      const notificationItems = notificationList.querySelectorAll(".notification-item")
      notificationItems.forEach((item) => {
        item.addEventListener("click", async () => {
          const notificationId = item.dataset.id
          if (!notificationId) return

          try {
            const response = await api.markNotificationAsRead(notificationId, token)
            if (response.success) {
              item.classList.remove("unread")
              item.querySelector(".notification-dot")?.remove()
              updateNotificationCount()
            }
          } catch (error) {
            console.error("Error marking notification as read:", error)
          }
        })
      })
    }
  } catch (error) {
    console.error("Error loading notifications:", error)
    // Hide loading state
    notificationLoading.style.display = "none"

    // Show error state
    if (notificationError) {
      notificationError.style.display = "block"
      notificationError.innerHTML = `
        <div class="error-state">
          <p>Đã xảy ra lỗi khi tải thông báo. Vui lòng thử lại sau.</p>
          <button class="btn btn-primary" onclick="loadNotifications()">Thử lại</button>
        </div>
      `
    }
  }
}

// Get notification icon based on type
function getNotificationIcon(type) {
  switch (type) {
    case "comment":
      return '<i class="fas fa-comment"></i>'
    case "reply":
      return '<i class="fas fa-reply"></i>'
    case "like":
      return '<i class="fas fa-thumbs-up"></i>'
    case "mention":
      return '<i class="fas fa-at"></i>'
    case "system":
      return '<i class="fas fa-bell"></i>'
    default:
      return '<i class="fas fa-bell"></i>'
  }
}

// Update notification count
async function updateNotificationCount() {
  const notificationCount = document.getElementById("notification-count")
  if (!notificationCount || !token) return

  try {
    // Try to get unread count directly if the endpoint is available
    let unreadCount = 0;
    try {
      const response = await api.getUnreadNotificationCount(token);
      if (response.success) {
        unreadCount = response.data.count || 0;
      }
    } catch (e) {
      // If unread count endpoint fails, fallback to counting from notifications
      const response = await api.getNotifications({ isRead: false }, token);
      if (response.success) {
        const notifications = response.data.notifications || response.data || [];
        unreadCount = notifications.length;
      }
    }

    if (unreadCount > 0) {
      notificationCount.textContent = unreadCount;
      notificationCount.style.display = "block";
    } else {
      notificationCount.style.display = "none";
    }
  } catch (error) {
    console.error("Error updating notification count:", error);
    notificationCount.style.display = "none";
  }
}

// Tạo các hàm toàn cục để gọi từ HTML
window.loadPosts = loadPosts
window.loadNotifications = loadNotifications
