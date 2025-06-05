// API URL
const API_URL_vote = "https://forum-service-csdl.onrender.com/vote"

// Get token and current user
const token_vote = localStorage.getItem("token")
const currentUser_vote = JSON.parse(localStorage.getItem("currentUser") || "{}")

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
  if (!token_vote) {
    showLoginModal()
    return
  }

  try {
    const response = await fetch(`${API_URL_vote}/posts/${postId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token_vote}`,
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
  if (!token_vote) {
    showLoginModal()
    return
  }

  try {
    const response = await fetch(`${API_URL_vote}/comments/${commentId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token_vote}`,
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
