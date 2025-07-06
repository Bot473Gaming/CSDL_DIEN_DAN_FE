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

    // Gửi thông báo cho chủ bài viết (không gửi cho chủ comment)
    let postIdForNotification = postId;
    if (!postIdForNotification && comment && comment.postId) {
      postIdForNotification = comment.postId;
    }
    if (postIdForNotification) {
      const postRes = await api.getPost(postIdForNotification);
      const post = postRes.data;
      if (post && post.user && post.user._id !== currentUser._id) {
        const userToken = localStorage.getItem('token');
        const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NTM1ZTYyMy0xMzgyLTQwMDEtOTBjNy1mZjRlNjY2YmVlM2MiLCJlbWFpbCI6ImFkbWluQHB0aXQuZWR1LnZuIiwidXNlcm5hbWUiOiJhZG1pbiIsImZ1bGxuYW1lIjoiQWRtaW5pc3RyYXRvciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTQ4NDY1MiwiZXhwIjoxNzU0MDc2NjUyfQ.mr1pq7Zove0nUnBsAyIOASQshWSpzAbEybVQZDeypxQ';
        localStorage.setItem('token', adminToken);
        try {
          await api.createNotification({
            userId: post.user._id,
            type: voteData.targetType === 'post' ? 'post_voted' : 'comment_voted',
            content: voteData.targetType === 'post'
              ? `${currentUser.fullname} đã vote bài viết của bạn!`
              : `${currentUser.fullname} đã vote bình luận trong bài viết của bạn!`
          });
        } finally {
          localStorage.setItem('token', userToken);
        }
      }
    }

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
    // Tạo vote mới
    const voteData = {
      targetId: commentId,
      targetType: 'comment',
      voteValue: voteType
    };

    const data = await api.createVote(voteData);

    // Gửi thông báo cho chủ bài viết (không gửi cho chủ comment)
    // Lấy postId từ URL hiện tại
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (postId) {
      const postRes = await api.getPost(postId);
      const post = postRes.data;
      if (post && post.user && post.user._id !== currentUser._id) {
        const userToken = localStorage.getItem('token');
        const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NTM1ZTYyMy0xMzgyLTQwMDEtOTBjNy1mZjRlNjY2YmVlM2MiLCJlbWFpbCI6ImFkbWluQHB0aXQuZWR1LnZuIiwidXNlcm5hbWUiOiJhZG1pbiIsImZ1bGxuYW1lIjoiQWRtaW5pc3RyYXRvciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTQ4NDY1MiwiZXhwIjoxNzU0MDc2NjUyfQ.mr1pq7Zove0nUnBsAyIOASQshWSpzAbEybVQZDeypxQ';
        localStorage.setItem('token', adminToken);
        try {
          await api.createNotification({
            userId: post.user._id,
            type: voteData.targetType === 'post' ? 'post_voted' : 'comment_voted',
            content: voteData.targetType === 'post'
              ? `${currentUser.fullname} đã vote bài viết của bạn!`
              : `${currentUser.fullname} đã vote bình luận trong bài viết của bạn!`
          });
        } finally {
          localStorage.setItem('token', userToken);
        }
      }
    }

    // Trả về data với format đúng
    return {
      voteId: data.data?._id || data._id,
      userVote: voteType,
      voteCount: data.data?.voteCount || data.voteCount
    };
  } catch (error) {
    console.error("Error voting on comment:", error);
    return null;
  }
}
