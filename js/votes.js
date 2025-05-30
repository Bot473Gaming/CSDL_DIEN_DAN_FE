// API URL
const API_URL = "http://localhost:3004"

// Get token and current user
const token = localStorage.getItem("token")
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

// Show login modal
function showLoginModal() {
  alert("Vui lòng đăng nhập để tiếp tục.")
  window.location.href = "login.html"
}

// Initialize votes
document.addEventListener("DOMContentLoaded", () => {
  // Setup vote buttons
  // (already handled in posts.js)
})

// Vote on a post
async function votePost(postId, voteType) {
  if (!token) {
    showLoginModal()
    return
  }

  try {
    const response = await fetch(`${API_URL}/posts/${postId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ voteType }),
    })

    if (!response.ok) {
      throw new Error("Failed to vote")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error voting on post:", error)
    alert("Đã xảy ra lỗi khi bình chọn. Vui lòng thử lại sau.")
    return null
  }
}

// Vote on a comment
async function voteComment(commentId, voteType) {
  if (!token) {
    showLoginModal()
    return
  }

  try {
    const response = await fetch(`${API_URL}/comments/${commentId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ voteType }),
    })

    if (!response.ok) {
      throw new Error("Failed to vote")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error voting on comment:", error)
    alert("Đã xảy ra lỗi khi bình chọn. Vui lòng thử lại sau.")
    return null
  }
}
