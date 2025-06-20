import { API_URL, token, currentUser } from './config.js';


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
export async function votePost(postId, voteType) { // voteType ở đây vẫn giữ nguyên vì nó là tham số đầu vào
  if (!token) {
    showLoginModal()
    return null
  }

  try {
    // Chuẩn bị dữ liệu cho backend, sử dụng targetId, targetType và voteValue
    const voteData = {
      targetId: postId,
      targetType: 'post',
      voteValue: voteType // Đã thay đổi 'voteType' thành 'voteValue' ở đây
    };
    
    // Gọi hàm createVote từ api.js
    const data = await api.createVote(voteData);

    return data;
  } catch (error) {
    console.error("Error voting on post:", error)
    alert(`Đã xảy ra lỗi khi bình chọn: ${error.message}. Vui lòng thử lại sau.`)
    return null
  }
}

// Vote on a comment
export async function voteComment(commentId, voteType) { // voteType ở đây vẫn giữ nguyên vì nó là tham số đầu vào
  if (!token) {
    showLoginModal()
    return null
  }

  try {
    // Chuẩn bị dữ liệu cho backend, sử dụng targetId, targetType và voteValue
    const voteData = {
      targetId: commentId,
      targetType: 'comment',
      voteValue: voteType // Đã thay đổi 'voteType' thành 'voteValue' ở đây
    };
    
    // Gọi hàm createVote từ api.js
    const data = await api.getVote(voteData);

    return data;
  } catch (error) {
    console.error("Error voting on comment:", error)
    alert(`Đã xảy ra lỗi khi bình chọn: ${error.message}. Vui lòng thử lại sau.`)
    return null
  }
}