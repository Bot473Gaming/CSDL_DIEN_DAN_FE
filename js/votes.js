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
export async function voteComment(commentId, voteType) {
  if (!token) {
    showLoginModal();
    return null;
  }

  try {
    const commentItem = document.querySelector(`.comment-item[data-id="${commentId}"]`);
    const voteId = commentItem?.dataset.voteId || null;
    const currentUserVote = parseInt(commentItem?.dataset.userVote || "0");

    // // Nếu muốn bỏ vote
    // if (voteType === 0 && voteId) {
    //   await api.deleteVote(voteId);

    //   // Cập nhật DOM nếu cần
    //   commentItem.dataset.userVote = "0";
    //   commentItem.dataset.voteId = "";

    //   return {
    //     voteCount: parseInt(commentItem.dataset.voteCount || "0") - currentUserVote,
    //     userVote: 0
    //   };
    // }

    // // Nếu đang đổi vote thì cần xóa trước
    // if (voteId && currentUserVote !== 0 && currentUserVote !== voteType) {
    //   await api.deleteVote(voteId);
    // }

    // Tạo vote mới
    const voteData = {
      targetId: commentId,
      targetType: 'comment',
      voteValue: voteType
    };

    const data = await api.createVote(voteData);

    // Cập nhật lại DOM để lưu vote mới
    commentItem.dataset.userVote = data.userVote;
    commentItem.dataset.voteId = data.voteId;
    // commentItem.dataset.voteCount = data.voteCount;

    return data;
  } catch (error) {
    console.error("Error voting on comment:", error);
    alert(`Đã xảy ra lỗi khi bình chọn: ${error.message}. Vui lòng thử lại sau.`);
    return null;
  }
}
