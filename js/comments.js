// This file contains functions related to comments
// Most of the comment functionality is already implemented in posts.js
// This file is included for completeness and future expansion

// DOM Elements
// (none specific to this file yet)

// API URL
const API_URL_comment = "https://forum-service-csdl.onrender.com/comment"

// Get token and current user
const token_comment = localStorage.getItem("token")
const currentUser_comment = JSON.parse(localStorage.getItem("currentUser") || "{}")

// Show login modal
function showLoginModal() {
  alert("Vui lòng đăng nhập để tiếp tục.")
  window.location.href = "login.html"
}

// Mock functions (replace with actual implementations)
// function showLoginModal() {
//   alert("Please log in to comment.")
// }

function setupCommentActions() {
  // Implement comment action setup here (e.g., event listeners for upvote, reply, etc.)
  console.log("Setting up comment actions...")
}

// Initialize comments
document.addEventListener("DOMContentLoaded", () => {
  // Setup comment actions
  // (already handled in posts.js)
})

// Add a comment
async function addComment(postId, content) {
  if (!token_comment) {
    showLoginModal()
    return
  }

  if (!content.trim()) {
    alert("Vui lòng nhập nội dung bình luận")
    return
  }

  try {
    const response = await fetch(`${API_URL_comment}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token_comment}`,
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error("Failed to add comment")
    }

    // Return success
    return true
  } catch (error) {
    console.error("Error adding comment:", error)
    alert("Đã xảy ra lỗi khi gửi bình luận. Vui lòng thử lại sau.")
    return false
  }
}

// Add a reply
async function addReply(commentId, content) {
  if (!token_comment) {
    showLoginModal()
    return
  }

  if (!content.trim()) {
    alert("Vui lòng nhập nội dung trả lời")
    return
  }

  try {
    const response = await fetch(`${API_URL_comment}/comments/${commentId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token_comment}`,
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error("Failed to add reply")
    }

    // Return success
    return true
  } catch (error) {
    console.error("Error adding reply:", error)
    alert("Đã xảy ra lỗi khi gửi trả lời. Vui lòng thử lại sau.")
    return false
  }
}

// Delete a comment
async function deleteComment(commentId) {
  if (!token_comment) {
    showLoginModal()
    return
  }

  try {
    const response = await fetch(`${API_URL_comment}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token_comment}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete comment")
    }

    // Return success
    return true
  } catch (error) {
    console.error("Error deleting comment:", error)
    alert("Đã xảy ra lỗi khi xóa bình luận. Vui lòng thử lại sau.")
    return false
  }
}

// Edit a comment
async function editComment(commentId, content) {
  if (!token_comment) {
    showLoginModal()
    return
  }

  if (!content.trim()) {
    alert("Vui lòng nhập nội dung bình luận")
    return
  }

  try {
    const response = await fetch(`${API_URL_comment}/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token_comment}`,
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error("Failed to edit comment")
    }

    // Return success
    return true
  } catch (error) {
    console.error("Error editing comment:", error)
    alert("Đã xảy ra lỗi khi chỉnh sửa bình luận. Vui lòng thử lại sau.")
    return false
  }
}
