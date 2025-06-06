// DOM Elements
const profileName = document.getElementById("profile-name")
const profileRole = document.getElementById("profile-role")
const profileAvatar = document.getElementById("profile-avatar")
const profileCover = document.getElementById("profile-cover")
const postsCount = document.getElementById("posts-count")
const commentsCount = document.getElementById("comments-count")
const reputationPoints = document.getElementById("reputation-points")
const profileBadges = document.getElementById("profile-badges")
const profileActions = document.getElementById("profile-actions")
const settingsTab = document.getElementById("settings-tab")
const userPosts = document.getElementById("user-posts")
const userComments = document.getElementById("user-comments")
const userAbout = document.getElementById("user-about")
const profileSettingsForm = document.getElementById("profile-settings-form")

// API URL
const API_URL = "https://forum-service-csdl.onrender.com"

// Get token and current user
const token = localStorage.getItem("token")
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

// Format date function
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

// Show login modal
function showLoginModal() {
  alert("Vui lòng đăng nhập để tiếp tục.")
  window.location.href = "login.html"
}

// Initialize profile
document.addEventListener("DOMContentLoaded", () => {
  // Get user ID from URL
  const urlParams = new URLSearchParams(window.location.search)
  const userId = urlParams.get("id")

  // If no user ID, assume it's the current user's profile
  const isCurrentUser = !userId || (currentUser && userId === currentUser._id)

  // Load profile data
  loadProfileData(userId, isCurrentUser)

  // Setup tabs
  setupProfileTabs()
})

// Load profile data
async function loadProfileData(userId, isCurrentUser) {
  try {
    // If it's the current user and no userId provided, use the current user's ID
    const targetUserId = isCurrentUser && !userId ? currentUser._id : userId

    const response = await fetch(`${API_URL}/users/${targetUserId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user profile")
    }

    const user = await response.json()

    // Update profile data
    if (profileName) profileName.textContent = user.fullname
    if (profileRole)
      profileRole.textContent =
        user.role === "admin" ? "Quản trị viên" : user.role === "moderator" ? "Điều hành viên" : "Thành viên"

    if (profileAvatar) {
      profileAvatar.innerHTML = `<img src="${user.avatar || "assets/images/default-avatar.png"}" alt="${user.fullname}">`
    }

    if (profileCover) {
      if (user.cover) {
        profileCover.style.backgroundImage = `url(${user.cover})`
      }
    }

    if (postsCount) postsCount.textContent = user.postsCount || 0
    if (commentsCount) commentsCount.textContent = user.commentsCount || 0
    if (reputationPoints) reputationPoints.textContent = user.reputation || 0

    if (profileBadges) {
      if (user.badges && user.badges.length > 0) {
        profileBadges.innerHTML = user.badges
          .map(
            (badge) => `
              <div class="profile-badge" title="${badge.name}">
                <i class="fas ${badge.icon}"></i> ${badge.name}
              </div>
            `,
          )
          .join("")
      } else {
        profileBadges.innerHTML = `<div class="empty-state">Chưa có huy hiệu nào.</div>`
      }
    }

    // Setup profile actions
    if (profileActions) {
      if (isCurrentUser) {
        profileActions.innerHTML = `
          <button class="btn btn-outline" id="edit-profile-btn">
            <i class="fas fa-edit"></i> Chỉnh sửa
          </button>
        `

        // Show settings tab
        if (settingsTab) {
          settingsTab.style.display = "block"
        }

        // Setup edit profile button
        const editProfileBtn = document.getElementById("edit-profile-btn")
        if (editProfileBtn) {
          editProfileBtn.addEventListener("click", () => {
            // Switch to settings tab
            switchTab("settings")
          })
        }
      } else {
        profileActions.innerHTML = `
          <button class="btn btn-outline" id="follow-btn">
            <i class="fas fa-user-plus"></i> Theo dõi
          </button>
          <button class="btn btn-outline" id="message-btn">
            <i class="fas fa-envelope"></i> Nhắn tin
          </button>
        `

        // Setup follow button
        const followBtn = document.getElementById("follow-btn")
        if (followBtn) {
          followBtn.addEventListener("click", async () => {
            if (!token) {
              showLoginModal()
              return
            }

            try {
              const isFollowing = followBtn.querySelector("i").classList.contains("fa-user-check")

              const response = await fetch(`${API_URL}/users/${userId}/follow`, {
                method: isFollowing ? "DELETE" : "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })

              if (!response.ok) {
                throw new Error("Failed to follow/unfollow user")
              }

              const icon = followBtn.querySelector("i")
              if (isFollowing) {
                icon.classList.remove("fa-user-check")
                icon.classList.add("fa-user-plus")
                followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Theo dõi'
              } else {
                icon.classList.remove("fa-user-plus")
                icon.classList.add("fa-user-check")
                followBtn.innerHTML = '<i class="fas fa-user-check"></i> Đang theo dõi'
              }
            } catch (error) {
              console.error("Error following/unfollowing user:", error)
              alert("Đã xảy ra lỗi. Vui lòng thử lại sau.")
            }
          })
        }

        // Setup message button
        const messageBtn = document.getElementById("message-btn")
        if (messageBtn) {
          messageBtn.addEventListener("click", () => {
            if (!token) {
              showLoginModal()
              return
            }

            alert("Tính năng nhắn tin đang được phát triển")
          })
        }
      }
    }

    // Load user posts
    loadUserPosts(user._id)

    // Load user comments
    loadUserComments(user._id)

    // Load user about
    if (userAbout) {
      const userAboutLoading = document.getElementById("user-about-loading")
      if (userAboutLoading) {
        userAboutLoading.style.display = "none"
      }

      userAbout.innerHTML = `
        <div class="about-content">
          <p>${user.bio || "Người dùng chưa cập nhật thông tin giới thiệu."}</p>
          <p>Tham gia: ${formatDate(user.createdAt)}</p>
        </div>
      `
    }

    // Setup settings form if current user
    if (isCurrentUser && profileSettingsForm) {
      // Populate form with user data
      document.getElementById("settings-fullname").value = user.fullname
      document.getElementById("settings-bio").value = user.bio || ""

      // Setup avatar preview
      const avatarPreview = document.getElementById("avatar-preview")
      if (avatarPreview) {
        avatarPreview.innerHTML = `<img src="${user.avatar || "assets/images/default-avatar.png"}" alt="${user.fullname}">`
      }

      // Setup form submission
      profileSettingsForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        const fullname = document.getElementById("settings-fullname").value
        const bio = document.getElementById("settings-bio").value
        const password = document.getElementById("settings-password").value
        const confirmPassword = document.getElementById("settings-confirm-password").value

        // Validate inputs
        if (!fullname) {
          showSettingsError("Vui lòng nhập họ và tên")
          return
        }

        if (password && password !== confirmPassword) {
          showSettingsError("Mật khẩu xác nhận không khớp")
          return
        }

        try {
          const formData = new FormData()
          formData.append("fullname", fullname)
          formData.append("bio", bio)

          if (password) {
            formData.append("password", password)
          }

          // Handle avatar upload
          const avatarInput = document.getElementById("settings-avatar")
          if (avatarInput.files.length > 0) {
            formData.append("avatar", avatarInput.files[0])
          }

          // Handle cover upload
          const coverInput = document.getElementById("settings-cover")
          if (coverInput.files.length > 0) {
            formData.append("cover", coverInput.files[0])
          }

          const response = await fetch(`${API_URL}/users/profile`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Failed to update profile")
          }

          const updatedUser = await response.json()

          // Update current user in localStorage
          localStorage.setItem("currentUser", JSON.stringify(updatedUser))

          showSettingsSuccess("Đã cập nhật thông tin thành công")

          // Reload page after a short delay
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } catch (error) {
          console.error("Error updating profile:", error)
          showSettingsError("Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại sau.")
        }
      })
    }
  } catch (error) {
    console.error("Error loading profile data:", error)
    // Show error message
    if (profileName) profileName.textContent = "Không thể tải thông tin người dùng"
    if (profileRole) profileRole.textContent = ""

    if (userAbout) {
      const userAboutLoading = document.getElementById("user-about-loading")
      if (userAboutLoading) {
        userAboutLoading.style.display = "none"
      }

      userAbout.innerHTML = `
        <div class="error-state">
          <p>Đã xảy ra lỗi khi tải thông tin người dùng. Vui lòng thử lại sau.</p>
        </div>
      `
    }
  }
}

// Load user posts
async function loadUserPosts(userId) {
  if (!userPosts) return

  const userPostsLoading = document.getElementById("user-posts-loading")

  try {
    const response = await fetch(`${API_URL}/users/${userId}/posts`)

    if (!response.ok) {
      throw new Error("Failed to fetch user posts")
    }

    const posts = await response.json()

    if (userPostsLoading) {
      userPostsLoading.style.display = "none"
    }

    if (posts.length === 0) {
      userPosts.innerHTML = `
        <div class="empty-state">
          <p>Người dùng chưa có bài viết nào.</p>
        </div>
      `
      return
    }

    // Render posts
    userPosts.innerHTML = posts
      .map(
        (post) => `
          <div class="post-card">
            <h3 class="post-title"><a href="post.html?id=${post._id}">${post.title}</a></h3>
            <div class="post-content">${post.content}</div>
            <div class="post-footer">
              <div class="post-stats">
                <div class="stat"><i class="fas fa-eye"></i> ${post.viewCount || 0}</div>
                <div class="stat"><i class="fas fa-comment"></i> ${post.commentCount || 0}</div>
                <div class="stat"><i class="fas fa-thumbs-up"></i> ${post.voteCount || 0}</div>
              </div>
              <div class="post-date">${formatDate(post.createdAt)}</div>
            </div>
          </div>
        `,
      )
      .join("")
  } catch (error) {
    console.error("Error loading user posts:", error)

    if (userPostsLoading) {
      userPostsLoading.style.display = "none"
    }

    userPosts.innerHTML = `
      <div class="error-state">
        <p>Đã xảy ra lỗi khi tải bài viết. Vui lòng thử lại sau.</p>
      </div>
    `
  }
}

// Load user comments
async function loadUserComments(userId) {
  if (!userComments) return

  const userCommentsLoading = document.getElementById("user-comments-loading")

  try {
    const response = await fetch(`${API_URL}/users/${userId}/comments`)

    if (!response.ok) {
      throw new Error("Failed to fetch user comments")
    }

    const comments = await response.json()

    if (userCommentsLoading) {
      userCommentsLoading.style.display = "none"
    }

    if (comments.length === 0) {
      userComments.innerHTML = `
        <div class="empty-state">
          <p>Người dùng chưa có bình luận nào.</p>
        </div>
      `
      return
    }

    // Render comments
    userComments.innerHTML = comments
      .map(
        (comment) => `
          <div class="comment-item">
            <div class="comment-content">${comment.content}</div>
            <div class="comment-meta">
              <div class="comment-post">
                Trong bài viết: <a href="post.html?id=${comment.post._id}">${comment.post.title}</a>
              </div>
              <div class="comment-stats">
                <div class="stat"><i class="fas fa-thumbs-up"></i> ${comment.voteCount || 0}</div>
                <div class="comment-date">${formatDate(comment.createdAt)}</div>
              </div>
            </div>
          </div>
        `,
      )
      .join("")
  } catch (error) {
    console.error("Error loading user comments:", error)

    if (userCommentsLoading) {
      userCommentsLoading.style.display = "none"
    }

    userComments.innerHTML = `
      <div class="error-state">
        <p>Đã xảy ra lỗi khi tải bình luận. Vui lòng thử lại sau.</p>
      </div>
    `
  }
}

// Setup profile tabs
function setupProfileTabs() {
  const tabs = document.querySelectorAll(".tabs li")
  const tabPanes = document.querySelectorAll(".tab-pane")

  if (!tabs.length || !tabPanes.length) return

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab
      switchTab(tabId)
    })
  })
}

// Switch tab
function switchTab(tabId) {
  const tabs = document.querySelectorAll(".tabs li")
  const tabPanes = document.querySelectorAll(".tab-pane")

  // Remove active class from all tabs and panes
  tabs.forEach((tab) => {
    tab.classList.remove("active")
  })

  tabPanes.forEach((pane) => {
    pane.classList.remove("active")
  })

  // Add active class to selected tab and pane
  const selectedTab = document.querySelector(`.tabs li[data-tab="${tabId}"]`)
  const selectedPane = document.getElementById(`${tabId}-tab`)

  if (selectedTab) {
    selectedTab.classList.add("active")
  }

  if (selectedPane) {
    selectedPane.classList.add("active")
  }
}

// Show settings error
function showSettingsError(message) {
  const errorElement = document.getElementById("settings-error")
  const successElement = document.getElementById("settings-success")

  if (errorElement) {
    errorElement.textContent = message
    errorElement.style.display = "block"

    // Hide success message if visible
    if (successElement) {
      successElement.style.display = "none"
    }

    // Hide error after 5 seconds
    setTimeout(() => {
      errorElement.style.display = "none"
    }, 5000)
  }
}

// Show settings success
function showSettingsSuccess(message) {
  const successElement = document.getElementById("settings-success")
  const errorElement = document.getElementById("settings-error")

  if (successElement) {
    successElement.textContent = message
    successElement.style.display = "block"

    // Hide error message if visible
    if (errorElement) {
      errorElement.style.display = "none"
    }

    // Hide success after 5 seconds
    setTimeout(() => {
      successElement.style.display = "none"
    }, 5000)
  }
}
