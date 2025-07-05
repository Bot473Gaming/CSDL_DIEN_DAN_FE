// DOM Elements
const postContent = document.getElementById("post-content")
const postLoading = document.getElementById("post-loading")
const commentsSection = document.getElementById("comments-section")
const commentsList = document.getElementById("comments-list")
const commentsLoading = document.getElementById("comments-loading")
const commentFormContainer = document.getElementById("comment-form-container")
const commentCount = document.getElementById("comment-count")
const relatedPosts = document.getElementById("related-posts")
const createPostForm = document.getElementById("create-post-form")
const postCategory = document.getElementById("post-category")


import { API_URL, token, currentUser } from './config.js';
import { votePost, voteComment } from './votes.js'; 


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

// Initialize posts
document.addEventListener("DOMContentLoaded", () => {
  console.log("Posts.js: DOM fully loaded")
  
  // If we're on the post detail page
  if (postContent && postLoading) {
    loadPostDetail()
  }

  // If we're on the create post page
  if (createPostForm) {
    setupCreatePostForm()
  }
})

async function TotalVotes() {
  try {
    const response = await api.getVotes(); // Gọi API có sẵn của bạn
    const votes = response?.data?.votes || []; // An toàn nếu không có dữ liệu

    const totals = {};

    for (const vote of votes) {
      if (vote.targetType !== 'post') continue; // ⛔ Bỏ qua vote cho comment

      const postId = vote.targetId;
      const voteValue = vote.voteValue || 0;

      if (!totals[postId]) {
        totals[postId] = 0;
      }

      totals[postId] += voteValue;
    }

    console.log("Tổng vote mỗi post:", totals);
    return totals;
  } catch (error) {
    console.error("Lỗi khi tính tổng vote:", error.message);
    return {};
  }
}




// Load post detail
async function loadPostDetail() {
  // Get post ID from URL
  const urlParams = new URLSearchParams(window.location.search)
  const postId = urlParams.get("id")

  if (!postId) {
    window.location.href = "index.html"
    return
  }

  try {
    console.log(`Loading post detail for ID: ${postId}`)
    // const post = await api.getPost(postId)
    const response = await api.getPost(postId)
    const post = response.data
    
    
    // Hide loading spinner
    if (postLoading) postLoading.style.display = "none"
    const totalVote=await TotalVotes()
    const idPost=post._id
    
    // Check if current user is the author
    const isAuthor = currentUser._id === post.user?._id
    const isAdmin = currentUser.role === 'admin'
    
    // Render post
    if (postContent) {
      postContent.innerHTML = `
        <div onclick="window.history.back()" class="post-back">← Quay lại</i></div>
        <div class="post-header">
          <div class="post-author">
            <img src="${post.user?.avatar || "assets/images/default-avatar.png"}" alt="${post.user?.fullname}">
            <div>
              <div class="author-name">${post.user?.fullname}</div>
              <div class="post-date">${formatDate(post.createdAt)}</div>
            </div>
          </div>
          <div class="post-category">
            <a href="index.html?category=${post.category?._id}">${post.category?.name || ""}</a>
          </div>
        </div>
        <h1 class="post-title">${post.title}</h1>
        <div class="post-content-text">${post.content}</div>
        <div class="post-tags">
          ${(post.tags || []).map((tag) => `<a href="index.html?tag=${tag._id}" class="tag">${tag.name}</a>`).join("")}
        </div>
        <div class="post-meta">
          <div>
            <i class="fas fa-eye"></i> ${post.viewCount || 0} lượt xem
            <i class="fas fa-comment ml-3"></i> ${post.comments?.length || 0} bình luận
          </div>
          <div>
            <i class="fas fa-clock"></i> Cập nhật: ${formatDate(post.updatedAt)}
          </div>
        </div>
        <div class="post-actions">
          <div class="vote-buttons">
            <button class="vote-btn upvote ${post.userVote === 1 ? "upvoted" : ""}" data-id="${post._id}">
              <i class="fas fa-thumbs-up"></i>
            </button>
            <span class="vote-count">${totalVote[idPost] || 0}</span>
            <button class="vote-btn downvote ${post.userVote === -1 ? "downvoted" : ""}" data-id="${post._id}">
              <i class="fas fa-thumbs-down"></i>
            </button>
          </div>
          <div class="post-buttons">
            ${(isAuthor || isAdmin) ? `
              <button class="post-btn edit-post-btn" data-id="${post._id}">
                <i class="fas fa-edit"></i> Chỉnh sửa
              </button>
              <button class="post-btn delete-post-btn" data-id="${post._id}">
                <i class="fas fa-trash"></i> Xóa
              </button>
            ` : ''}
            <button class="post-btn save-post" data-id="${post._id}">
              <i class="${post.isSaved ? "fas" : "far"} fa-bookmark"></i> Lưu
            </button>
            <button class="post-btn share-post" data-id="${post._id}">
              <i class="fas fa-share-alt"></i> Chia sẻ
            </button>
            <button class="post-btn report-post" data-id="${post._id}">
              <i class="fas fa-flag"></i> Báo cáo
            </button>
          </div>
        </div>
      `

      // Update document title
      document.title = `${post.title} - Diễn đàn Sinh viên`

      // Load comments
      loadComments(postId)

      // Load related posts
      loadRelatedPosts(post.category?._id, (post.tags || []).map((t) => t._id))

      // Setup post actions
      setupPostDetailActions(post)
    }
  } catch (error) {
    console.error("Error loading post detail:", error)
    // Hide loading spinner
    if (postLoading) postLoading.style.display = "none"

    // Show error message
    if (postContent) {
      postContent.innerHTML = `
        <div class="error-state">
          <p>Đã xảy ra lỗi khi tải bài viết. Vui lòng thử lại sau.</p>
          <a href="index.html" class="btn btn-primary">Quay lại trang chủ</a>
        </div>
      `
    }
  }
}

// Load comments
async function loadComments(postId) {
  if (!commentsList || !commentsLoading) return

  try {
    // Get comments for the post
    const response = await api.getComments({ postId })
    if (!response.success) {
      throw new Error(response.message || "Không thể tải bình luận")
    }

    const comments = response.data.comments || response.data || []
    const totlaComment = response.data.total || 0

    
    // Hide loading spinner
    commentsLoading.style.display = "none"

    // Update comment count
    if (commentCount) {
      commentCount.textContent = totlaComment;
    }

    // Render comment form if user is logged in
    if (commentFormContainer) {
      if (token) {
        commentFormContainer.innerHTML = `
          <form id="comment-form">
            <div class="form-group">
              <textarea id="comment-content" name="content" placeholder="Viết bình luận của bạn..." rows="3" required></textarea>
            </div>
            <div id="comment-error" class="form-error" style="display: none;"></div>
            <button type="submit" class="btn btn-primary">Gửi bình luận</button>
          </form>
        `

        // Setup comment form
        const commentForm = document.getElementById("comment-form")
        if (commentForm) {
          commentForm.addEventListener("submit", async (e) => {
            e.preventDefault()
            const content = document.getElementById("comment-content").value.trim()
            if (content) {
              await submitComment(postId, content)
            }
          })
        }
      } else {
        commentFormContainer.innerHTML = `
          <div class="login-prompt">
            <p>Vui lòng <a href="login.html">đăng nhập</a> để bình luận.</p>
          </div>
        `
      }
    }

    // Render comments
    const totalComment=await TotalVotesForComments()
    if (comments.length === 0) {
      commentsList.innerHTML = `
        <div class="no-comments">
          <p>Chưa có bình luận nào.</p>
        </div>
      `
    } else {
      commentsList.innerHTML = comments.map(comment => renderComment(comment,totalComment)).join("")
    }

    // Setup comment actions
    setupCommentActions(postId)
  } catch (error) {
    console.error("Error loading comments:", error)
    commentsLoading.style.display = "none"
    commentsList.innerHTML = `
      <div class="error-state">
        <p>Đã xảy ra lỗi khi tải bình luận. Vui lòng thử lại sau.</p>
      </div>
    `
  }
}

async function TotalVotesForComments() {
  try {
    const response = await api.getVotes(); // Gọi API lấy toàn bộ votes
    const votes = response?.data?.votes || []; // Phòng khi không có dữ liệu
    console.log("mmmmm",votes)
    const totals = {}; // Lưu tổng vote cho từng commentId

    for (const vote of votes) {
      if (vote.targetType !== 'comment') continue; // ⛔ Bỏ qua vote cho post

      const commentId = vote.targetId;
      const voteValue = vote.voteValue || 0;

      if (!totals[commentId]) {
        totals[commentId] = 0;
      }

      totals[commentId] += voteValue;
    }

    console.log("Tổng vote mỗi comment:", totals);
    return totals;
  } catch (error) {
    console.error("Lỗi khi tính tổng vote cho comment:", error.message);
    return {};
  }
}
// Render a single comment
function renderComment(comment,totalComment) {
  // console.log("mmmm",comment)
  const vote = comment.votes?.[0] || {};
  const userVote = vote.voteValue || 0;
  const voteId = vote._id || '';
  console.log("mmmm",userVote)
  
  // Check if current user is the author of this comment
  const isCommentAuthor = currentUser._id === comment.user?._id
  const isAdmin = currentUser.role === 'admin'
  
  return `
    <div class="comment-item ${comment.parentId ? 'reply' : ''}" 
         data-id="${comment._id}" 
         data-user-vote="${userVote}" 
         data-vote-id="${voteId}" >
      <div class="comment-author">
        <img src="${comment.user?.avatar || 'assets/images/default-avatar.png'}" alt="${comment.user?.fullname}">
        <div>
          <div class="author-name">${comment.user?.fullname}</div>
          <div class="comment-date">${formatDate(comment.createdAt)}</div>
        </div>
      </div>
      <div class="comment-content" id="comment-content-${comment._id}">${comment.content}</div>
      <div class="comment-actions">
        <div class="vote-buttons">
          <button class="vote-btn upvote ${comment.userVote === 1 ? 'upvoted' : ''}" data-id="${comment._id}">
            <i class="fas fa-thumbs-up"></i>
          </button>
          <span class="vote-count">${totalComment[comment._id] || 0}</span>
          <button class="vote-btn downvote ${comment.userVote === -1 ? 'downvoted' : ''}" data-id="${comment._id}">
            <i class="fas fa-thumbs-down"></i>
          </button>
        </div>
        <div class="comment-buttons">
          ${token ? `
            <button class="comment-btn reply-btn" data-id="${comment._id}">
              <i class="fas fa-reply"></i> Trả lời
            </button>
          ` : ''}
          ${(isCommentAuthor || isAdmin) ? `
            <button class="comment-btn edit-comment-btn" data-id="${comment._id}">
              <i class="fas fa-edit"></i> Sửa
            </button>
            <button class="comment-btn delete-comment-btn" data-id="${comment._id}">
              <i class="fas fa-trash"></i> Xóa
            </button>
          ` : ''}
          <button class="comment-btn report-btn" data-id="${comment._id}">
            <i class="fas fa-flag"></i> Báo cáo
          </button>
        </div>
      </div>
      ${comment.isEdited ? '<div class="comment-edited">(Đã chỉnh sửa)</div>' : ''}
      <div class="reply-form-container" id="reply-form-${comment._id}"></div>
      <div class="replies-container" id="replies-${comment._id}">
        ${(comment.replies || []).map(reply => renderComment(reply,totalComment)).join('')}
      </div>
    </div>
  `
}

// Submit a new comment
async function submitComment(postId, content, parentCommentId = null) {
  if (!token) {
    showLoginModal()
    return
  }

  try {
    const commentData = {
      postId,
      content
    }
    
    if (parentCommentId) {
      commentData.parentCommentId = parentCommentId
    }
    
    const response = await api.createComment(commentData)
    const newComment = response.data 

    if (!newComment.user) {
      newComment.user = {
        fullname: currentUser.fullname,
        avatar: currentUser.avatar
      }
    }

    // Tạo phần tử HTML từ bình luận mới
    const totalComment=await TotalVotesForComments()
    const wrapper = document.createElement("div")
    wrapper.innerHTML = renderComment(newComment,totalComment)
    const newCommentElement = wrapper.firstElementChild 
    // Reload comments to show the new comment
        
    // Clear the comment form
    const commentContent = document.getElementById("comment-content")
    if (commentContent) {
      commentContent.value = ""
    }
    
    // Hide reply form if this was a reply

    if (parentCommentId) {
      let repliesContainer = document.getElementById(`replies-${parentCommentId}`)
      if (!repliesContainer) {
        const parentComment = document.querySelector(`.comment-item[data-id="${parentCommentId}"]`)
        repliesContainer = document.createElement("div")
        repliesContainer.id = `replies-${parentCommentId}`
        repliesContainer.className = "replies-container"
        parentComment.appendChild(repliesContainer)
      }

      // Chèn lên đầu
      repliesContainer.prepend(newCommentElement)
    } else {
      // Chèn bình luận gốc lên đầu danh sách
      const commentsList = document.getElementById("comments-list")
      if (commentsList) commentsList.prepend(newCommentElement)
    }


    // Tăng số bình luận
    if (commentCount) {
      commentCount.textContent = Number(commentCount.textContent || 0) + 1
    }
    setupCommentActions(postId)

    // Gửi thông báo cho chủ bài viết (không gửi cho chủ comment cha)
    try {
      const postRes = await api.getPost(postId);
      const post = postRes.data;
      if (post && post.user && post.user._id !== currentUser._id) {
        // Sử dụng token admin để gửi notification
        const userToken = localStorage.getItem('token');
        const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NTM1ZTYyMy0xMzgyLTQwMDEtOTBjNy1mZjRlNjY2YmVlM2MiLCJlbWFpbCI6ImFkbWluQHB0aXQuZWR1LnZuIiwidXNlcm5hbWUiOiJhZG1pbiIsImZ1bGxuYW1lIjoiQWRtaW5pc3RyYXRvciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTQ4NDY1MiwiZXhwIjoxNzU0MDc2NjUyfQ.mr1pq7Zove0nUnBsAyIOASQshWSpzAbEybVQZDeypxQ';
        localStorage.setItem('token', adminToken);
        try {
          await api.createNotification({
            userId: post.user._id,
            type: 'comment_created',
            content: `${currentUser.fullname} đã bình luận bài viết của bạn.`
          });
        } finally {
          localStorage.setItem('token', userToken);
        }
      }
    } catch (notifyErr) {
      console.error('Lỗi gửi thông báo comment:', notifyErr);
    }
  } catch (error) {
    console.error("Error submitting comment:", error)
    const commentError = document.getElementById("comment-error")
    if (commentError) {
      commentError.textContent = "Đã xảy ra lỗi khi gửi bình luận. Vui lòng thử lại sau."
      commentError.style.display = "block"
    }
  }
}

// Load related posts
async function loadRelatedPosts(categoryId, tagIds) {
  if (!relatedPosts) return

  try {
    // Get posts from the same category
    const result = await api.getPosts({ 
      categoryId, 
      skip: 0, 
      take: 3 
    })
    const rawPosts = Array.isArray(result?.posts)
      ? result.posts
      : Array.isArray(result)
        ? result
        : []

    const posts = rawPosts.filter(post => post._id !== urlParams.get("id")).slice(0, 3)

    if (posts.length === 0) {
      relatedPosts.innerHTML = `
        <div class="empty-state">
          <p>Không có bài viết liên quan.</p>
        </div>
      `
      return
    }

    relatedPosts.innerHTML = posts
      .map(
        (post) => `
        <div class="related-post-item">
          <a href="post.html?id=${post._id}">
            <h4>${post.title}</h4>
            <div class="post-meta">
              <span><i class="fas fa-user"></i> ${post.author?.fullname || post.user?.fullname}</span>
              <span><i class="fas fa-clock"></i> ${formatDate(post.createdAt)}</span>
            </div>
          </a>
        </div>
      `,
      )
      .join("")
  } catch (error) {
    console.error("Error loading related posts:", error)
    relatedPosts.innerHTML = `
      <div class="empty-state">
        <p>Không thể tải bài viết liên quan.</p>
      </div>
    `
  }
}

// Setup post detail actions
///
async function setupPostDetailActions(post) {
  // Vote buttons
  const upvoteBtn = document.querySelector(".vote-btn.upvote");
  const downvoteBtn = document.querySelector(".vote-btn.downvote");
  const voteCount = document.querySelector(".vote-count");

  console.log(post)
  // Tìm vote hiện tại của user từ mảng votes (nếu có)
  const currentVote = Array.isArray(post.votes)
    ? post.votes.find(v => v.userId === currentUser._id)
    : post.votes;

  post.voteId = currentVote?._id || null;
  post.userVote = currentVote?.voteValue || 0;
  
  // Cập nhật giao diện ban đầu
  if (post.userVote === 1) upvoteBtn.classList.add("upvoted");
  if (post.userVote === -1) downvoteBtn.classList.add("downvoted");
  
  if (upvoteBtn && downvoteBtn && voteCount) {
    upvoteBtn.addEventListener("click", async () => {
      if (!token) return showLoginModal();
      const isUndo = post.userVote;
      try {
        if (isUndo === 1) {
          // Unvote
          voteCount.textContent = parseInt(voteCount.textContent) - 1;
          upvoteBtn.classList.remove("upvoted");
          post.userVote = 0;
          await api.deleteVote(post.voteId);
          post.voteId = null;
        } else {
          post.userVote = 1; // ⬅️ Cập nhật trước
          const data = await votePost(post._id, post.userVote); // gửi đúng userVote
          upvoteBtn.classList.add("upvoted");
          downvoteBtn.classList.remove("downvoted");
          post.voteId = data.data._id;
          if(isUndo === -1){
            voteCount.textContent = parseInt(voteCount.textContent) + 2;
          }else{
            voteCount.textContent = parseInt(voteCount.textContent) + 1;
          }
          
        }
      } catch (err) {
        console.error("Vote error:", err);
      }
    });

    downvoteBtn.addEventListener("click", async () => {
      if (!token) return showLoginModal();

      const isUndo = post.userVote;
    
      try {
        console.log("mmmm",post)
        if (isUndo === -1) {
          // Unvote
          voteCount.textContent = parseInt(voteCount.textContent) + 1;
          console.log("mmmm",post)
          downvoteBtn.classList.remove("downvoted");
          post.userVote = 0;
          await api.deleteVote(post.voteId);
          post.voteId = null;
        } else {
          post.userVote = -1; // ⬅️ Cập nhật trước
          const data = await votePost(post._id, post.userVote); // gửi đúng userVote
          downvoteBtn.classList.add("downvoted");
          upvoteBtn.classList.remove("upvoted");
          post.voteId = data.data._id;
          if(isUndo === 1){
            voteCount.textContent = parseInt(voteCount.textContent) - 2;
          }else{
            voteCount.textContent = parseInt(voteCount.textContent) - 1;
          }
        }
      } catch (err) {
        console.error("Vote error:", err);
      }
    });

  }

  // Save post button
  const savePostBtn = document.querySelector(".save-post")
  if (savePostBtn) {
    savePostBtn.addEventListener("click", async () => {
      if (!token) {
        showLoginModal()
        return
      }

      try {
        const response = await fetch(`${API_URL}/posts/${post._id}/save`, {
          method: post.isSaved ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to save/unsave post")
        }

        const icon = savePostBtn.querySelector("i")
        if (post.isSaved) {
          icon.classList.remove("fas")
          icon.classList.add("far")
          post.isSaved = false
        } else {
          icon.classList.remove("far")
          icon.classList.add("fas")
          post.isSaved = true
        }
      } catch (error) {
        console.error("Error saving/unsaving post:", error)
        alert("Đã xảy ra lỗi khi lưu/bỏ lưu bài viết. Vui lòng thử lại sau.")
      }
    })
  }

  // Share post button
  const sharePostBtn = document.querySelector(".share-post")
  if (sharePostBtn) {
    sharePostBtn.addEventListener("click", () => {
      const url = `${window.location.origin}/post.html?id=${post._id}`

      // Create a temporary input element
      const input = document.createElement("input")
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)

      alert("Đã sao chép liên kết bài viết vào clipboard")
    })
  }

  // Report post button
  const reportPostBtn = document.querySelector(".report-post")
  if (reportPostBtn) {
    reportPostBtn.addEventListener("click", () => {
      if (!token) {
        showLoginModal()
        return
      }

      showReportModal("post", post._id)
    })
  }

  // Edit post button
  const editPostBtn = document.querySelector(".edit-post-btn")
  if (editPostBtn) {
    editPostBtn.addEventListener("click", () => {
      if (!token) {
        showLoginModal()
        return
      }

      showEditPostModal(post)
    })
  }

  // Delete post button
  const deletePostBtn = document.querySelector(".delete-post-btn")
  if (deletePostBtn) {
    deletePostBtn.addEventListener("click", async () => {
      if (!token) {
        showLoginModal()
        return
      }

      if (confirm("Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.")) {
        // Check if post has comments
        const commentCount = post.comments?.length || 0
        if (commentCount > 0) {
          const shouldDeleteComments = confirm(`Bài viết này có ${commentCount} bình luận. Bạn có muốn xóa tất cả bình luận và bài viết không?`)
          if (!shouldDeleteComments) {
            return
          }
        }
        
        try {
          console.log("Attempting to delete post:", post._id)
          console.log("Current user:", currentUser)
          console.log("Token exists:", !!token)
          
          // Try to delete post first
          let response = await api.deletePost(post._id)
          console.log("Delete post response:", response)
          
          // If post deletion failed and has comments, try deleting comments first
          if (!response.success && commentCount > 0) {
            console.log("Post deletion failed, trying to delete comments first...")
            
            // Get all comments for this post
            const commentsResponse = await api.getComments({ postId: post._id })
            console.log("Comments response:", commentsResponse)
            
            // Handle different response formats
            let comments = []
            if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
              comments = commentsResponse.data
            } else if (commentsResponse.data && Array.isArray(commentsResponse.data.comments)) {
              comments = commentsResponse.data.comments
            } else if (Array.isArray(commentsResponse)) {
              comments = commentsResponse
            } else if (commentsResponse.comments && Array.isArray(commentsResponse.comments)) {
              comments = commentsResponse.comments
            }
            
            // Fallback: use comments from post object if API call failed
            if (comments.length === 0 && post.comments && Array.isArray(post.comments)) {
              comments = post.comments
              console.log("Using comments from post object:", comments)
            }
            
            console.log("Comments to delete:", comments)
            
            // Delete all comments
            for (const comment of comments) {
              try {
                await api.deleteComment(comment._id)
                console.log(`Deleted comment: ${comment._id}`)
              } catch (commentError) {
                console.error(`Failed to delete comment ${comment._id}:`, commentError)
                // Continue with other comments even if one fails
              }
            }
            
            console.log("All comments deleted, now trying to delete post again...")
            response = await api.deletePost(post._id)
            console.log("Second delete post response:", response)
          }
          
          // Check different response formats
          if (response.success || response.status === 200 || response.statusCode === 200) {
            if (commentCount > 0) {
              alert(`Đã xóa ${commentCount} bình luận và bài viết thành công`)
            } else {
              alert("Đã xóa bài viết thành công")
            }
            window.location.reload();
            setTimeout(() => {
              window.location.href = "index.html";
            }, 500);
          } else {
            console.error("Delete failed - response:", response)
            throw new Error(response.message || response.error || "Xóa thất bại")
          }
        } catch (error) {
          console.error("Error deleting post:", error)
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            response: error.response,
            status: error.status,
            statusText: error.statusText
          })
          
          // Provide more specific error messages
          let errorMessage = "Đã xảy ra lỗi khi xóa bài viết"
          if (error.status === 500) {
            errorMessage = "Lỗi server (500) - Có thể bài viết này có bình luận nên không thể xóa. Vui lòng xóa tất cả bình luận trước khi xóa bài viết."
          } else if (error.status === 403) {
            errorMessage = "Bạn không có quyền xóa bài viết này"
          } else if (error.status === 404 || error.message === "Post not found") {
            errorMessage = "Không tìm thấy bài viết để xóa. Chuyển về trang chủ."
            window.location.reload();
            setTimeout(() => {
              window.location.href = "index.html";
            }, 500);
            return;
          } else if (error.status === 409) {
            errorMessage = "Không thể xóa bài viết vì có bình luận. Vui lòng xóa tất cả bình luận trước."
          } else if (error.message) {
            errorMessage = `Lỗi: ${error.message}`
          }
          
          alert(errorMessage)
        }
      }
    })
  }
}

// Setup comment actions
function setupCommentActions(postId) {
  const commentItems = document.querySelectorAll(".comment-item");

  commentItems.forEach((commentItem) => {
    const commentId = commentItem.dataset.id;
    const voteCountSpan = commentItem.querySelector(".vote-count");
    const upvoteBtn = commentItem.querySelector(".vote-btn.upvote");
    const downvoteBtn = commentItem.querySelector(".vote-btn.downvote");

    let voteId = commentItem.dataset.voteId || null;
    let userVote = parseInt(commentItem.dataset.userVote);
    // Cập nhật giao diện ban đầu
    if (parseInt(commentItem.dataset.userVote) === 1) upvoteBtn.classList.add("upvoted");
    if (parseInt(commentItem.dataset.userVote) === -1) downvoteBtn.classList.add("downvoted");

    upvoteBtn.addEventListener("click", async () => {
      if (!token) return showLoginModal();

      try {
        console.log("lkkkkkk",userVote)
        if (userVote === 1) {
          // Unvote
          userVote = 0;
          voteCountSpan.textContent = parseInt( voteCountSpan.textContent) - 1;
          upvoteBtn.classList.remove("upvoted");
          await api.deleteVote(voteId);
          commentItem.dataset.voteId = '';
        } else {
          // Nếu đã downvote trước đó, +2. Nếu chưa vote, +1
          upvoteBtn.classList.add("upvoted");
          downvoteBtn.classList.remove("downvoted");
          if(userVote === 0){
            voteCountSpan.textContent = parseInt( voteCountSpan.textContent) + 1
            userVote = 1;
            const data = await voteComment(commentId, 1);
          }else{
            voteCountSpan.textContent = parseInt( voteCountSpan.textContent) + 2
            userVote = 1;
            const data = await voteComment(commentId, 1);
          }
          commentItem.dataset.voteId = data?.voteId || '';
  
        }

        // Cập nhật dataset
        // commentItem.dataset.voteCount = parseInt( voteCountSpan.textContent);
        // commentItem.dataset.userVote = userVote;
        
      } catch (error) {
        console.error("Error voting on comment (upvote):", error);
      }
    });

    downvoteBtn.addEventListener("click", async () => {
      if (!token) return showLoginModal();

      try {
        if (userVote === -1) {
          // Unvote
          userVote = 0;
          voteCountSpan.textContent = parseInt( voteCountSpan.textContent) + 1
          downvoteBtn.classList.remove("downvoted");
          await api.deleteVote(voteId);
          commentItem.dataset.voteId = '';
        } else {
          // Nếu đã upvote trước đó, -2. Nếu chưa vote, -1
          downvoteBtn.classList.add("downvoted");
          upvoteBtn.classList.remove("upvoted");
          if(userVote === 0){
            voteCountSpan.textContent = parseInt( voteCountSpan.textContent) - 1
            userVote = -1;
            const data = await voteComment(commentId, -1);
          }else{
            voteCountSpan.textContent = parseInt( voteCountSpan.textContent) - 2
            userVote = -1;
            const data = await voteComment(commentId, -1);
          }
          commentItem.dataset.voteId = data?.voteId || '';
        }

        // commentItem.dataset.voteId = voteId || '';
        // commentItem.dataset.userVote = userVote;
        // Cập nhật dataset
        // commentItem.dataset.voteCount = parseInt( voteCountSpan.textContent);
        // commentItem.dataset.userVote = userVote;
        // commentItem.dataset.voteId = voteId || '';
      } catch (error) {
        console.error("Error voting on comment (downvote):", error);
      }
    });
  });
  // Reply buttons
  const replyButtons = document.querySelectorAll(".reply-btn")
  replyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!token) {
        showLoginModal()
        return
      }

      const commentId = button.dataset.id
      const commentItem = document.getElementById(`comment-${commentId}`)
      const replyForm = commentItem.querySelector(".reply-form")

      if (replyForm) {
        replyForm.remove()
        return
      }

      const newReplyForm = document.createElement("form")
      newReplyForm.className = "reply-form"
      newReplyForm.innerHTML = `
        <textarea name="content" placeholder="Viết phản hồi của bạn..." required></textarea>
        <div class="form-actions">
          <button type="button" class="btn btn-outline cancel-reply">Hủy</button>
          <button type="submit" class="btn btn-primary">Gửi phản hồi</button>
        </div>
      `

      const repliesContainer = commentItem.querySelector(".comment-replies") || document.createElement("div")
      repliesContainer.className = "comment-replies"
      commentItem.appendChild(repliesContainer)
      repliesContainer.appendChild(newReplyForm)

      // Setup cancel button
      const cancelBtn = newReplyForm.querySelector(".cancel-reply")
      cancelBtn.addEventListener("click", () => {
        newReplyForm.remove()
      })

      // Setup submit button
      newReplyForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        const content = newReplyForm.querySelector("textarea[name='content']").value.trim()
        if (!content) return

        try {
          const response = await fetch(`${API_URL}/comments/${commentId}/replies`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
          })

          if (!response.ok) {
            throw new Error("Failed to create reply")
          }

          loadComments(postId)
        } catch (error) {
          console.error("Error creating reply:", error)
          alert("Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại sau.")
        }
      })
    })
  })

  // Report buttons
  const reportButtons = document.querySelectorAll(".report-btn")
  reportButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!token) {
        showLoginModal()
        return
      }

      const commentId = button.dataset.id
      showReportModal("comment", commentId)
    })
  })

  // Edit comment buttons
  const editCommentButtons = document.querySelectorAll(".edit-comment-btn")
  editCommentButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!token) {
        showLoginModal()
        return
      }

      const commentId = button.dataset.id
      const commentItem = button.closest(".comment-item")
      const commentContent = commentItem.querySelector(`#comment-content-${commentId}`)
      const currentContent = commentContent.textContent

      showEditCommentModal(commentId, currentContent, postId)
    })
  })

  // Delete comment buttons
  const deleteCommentButtons = document.querySelectorAll(".delete-comment-btn")
  deleteCommentButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (!token) {
        showLoginModal()
        return
      }

      const commentId = button.dataset.id
      
      if (confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
        try {
          const response = await api.deleteComment(commentId)
          if (response.success) {
            alert("Đã xóa bình luận thành công")
            // Reload the page to update the list
            window.location.reload()
          } else {
            throw new Error(response.message || "Xóa thất bại")
          }
        } catch (error) {
          console.error("Error deleting comment:", error)
          alert("Đã xảy ra lỗi khi xóa bình luận. Vui lòng thử lại sau.")
        }
      }
    })
  })
}

// Show report modal
function showReportModal(type, id) {
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Báo cáo ${type === "post" ? "bài viết" : "bình luận"}</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="report-form">
          <div class="form-group">
            <label>Lý do báo cáo</label>
            <select name="reason" required>
              <option value="">Chọn lý do</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Nội dung không phù hợp</option>
              <option value="harassment">Quấy rối</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div class="form-group">
            <label>Mô tả chi tiết</label>
            <textarea name="description" rows="4" required></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline cancel-report">Hủy</button>
            <button type="submit" class="btn btn-primary">Gửi báo cáo</button>
          </div>
        </form>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Close modal
  const closeBtn = modal.querySelector(".close-modal")
  const cancelBtn = modal.querySelector(".cancel-report")
  const closeModal = () => {
    modal.remove()
  }

  closeBtn.addEventListener("click", closeModal)
  cancelBtn.addEventListener("click", closeModal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal()
  })

  // Handle form submission
  const form = modal.querySelector("#report-form")
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = new FormData(form)
    const reason = formData.get("reason")
    const description = formData.get("description")

    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: type,
          targetId: id,
          reason,
          description,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit report")
      }

      alert("Báo cáo đã được gửi thành công")
      closeModal()
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau.")
    }
  })
}

// Show edit post modal
function showEditPostModal(post) {
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Chỉnh sửa bài viết</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-post-form">
          <div class="form-group">
            <label>Tiêu đề</label>
            <input type="text" name="title" value="${post.title}" required>
          </div>
          <div class="form-group">
            <label>Nội dung</label>
            <textarea name="content" rows="10" required>${post.content}</textarea>
          </div>
          <div class="form-group">
            <label>Danh mục</label>
            <select name="categoryId" required>
              <option value="">Chọn danh mục</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tags (phân cách bằng dấu phẩy)</label>
            <input type="text" name="tags" value="${(post.tags || []).map(tag => tag.name).join(', ')}" placeholder="Ví dụ: JavaScript, React, Tutorial">
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline cancel-edit">Hủy</button>
            <button type="submit" class="btn btn-primary">Cập nhật</button>
          </div>
        </form>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Load categories
  loadCategoriesForEdit(modal, post.category?._id)

  // Close modal
  const closeBtn = modal.querySelector(".close-modal")
  const cancelBtn = modal.querySelector(".cancel-edit")
  const closeModal = () => {
    modal.remove()
  }

  closeBtn.addEventListener("click", closeModal)
  cancelBtn.addEventListener("click", closeModal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal()
  })

  // Handle form submission
  const form = modal.querySelector("#edit-post-form")
  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    await handleEditPost(form, post._id, closeModal)
  })
}

// Load categories for edit form
async function loadCategoriesForEdit(modal, selectedCategoryId) {
  try {
    const categories = await api.getCategories()

    const select = modal.querySelector("select[name='categoryId']")
    select.innerHTML = `
      <option value="">Chọn danh mục</option>
      ${categories.data.categories.map(
        (category) => `
        <option value="${category._id}" ${category._id === selectedCategoryId ? 'selected' : ''}>${category.name}</option>
      `,
      ).join("")}
    `
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

// Handle edit post submission
async function handleEditPost(form, postId, closeModal) {
  const formData = new FormData(form)
  const title = formData.get("title").trim()
  const content = formData.get("content").trim()
  const categoryId = formData.get("categoryId")
  const tagsInput = formData.get("tags").trim()

  if (!title || !content || !categoryId) {
    alert("Vui lòng điền đầy đủ thông tin bắt buộc")
    return
  }

  try {
    // Parse tags
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : []

    const postData = {
      title,
      content,
      categoryId,
      tags
    }

    const response = await api.updatePost(postId, postData)
    
    if (response.success) {
      alert("Cập nhật bài viết thành công")
      closeModal()
      // Reload the page to show updated content
      window.location.reload()
    } else {
      throw new Error(response.message || "Cập nhật thất bại")
    }
  } catch (error) {
    console.error("Error updating post:", error)
    alert("Đã xảy ra lỗi khi cập nhật bài viết. Vui lòng thử lại sau.")
  }
}

// Show edit comment modal
function showEditCommentModal(commentId, currentContent, postId) {
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Chỉnh sửa bình luận</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-comment-form">
          <div class="form-group">
            <label>Nội dung bình luận</label>
            <textarea name="content" rows="5" required>${currentContent}</textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline cancel-edit-comment">Hủy</button>
            <button type="submit" class="btn btn-primary">Cập nhật</button>
          </div>
        </form>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Close modal
  const closeBtn = modal.querySelector(".close-modal")
  const cancelBtn = modal.querySelector(".cancel-edit-comment")
  const closeModal = () => {
    modal.remove()
  }

  closeBtn.addEventListener("click", closeModal)
  cancelBtn.addEventListener("click", closeModal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal()
  })

  // Handle form submission
  const form = modal.querySelector("#edit-comment-form")
  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    await handleEditComment(form, commentId, postId, closeModal)
  })
}

// Handle edit comment submission
async function handleEditComment(form, commentId, postId, closeModal) {
  const formData = new FormData(form)
  const content = formData.get("content").trim()

  if (!content) {
    alert("Vui lòng nhập nội dung bình luận")
    return
  }

  try {
    const commentData = {
      content
    }

    const response = await api.updateComment(commentId, commentData)
    
    if (response.success) {
      alert("Cập nhật bình luận thành công")
      closeModal()
      // Reload the page to show updated comment
      window.location.reload()
    } else {
      throw new Error(response.message || "Cập nhật thất bại")
    }
  } catch (error) {
    console.error("Error updating comment:", error)
    alert("Đã xảy ra lỗi khi cập nhật bình luận. Vui lòng thử lại sau.")
  }
}

// Setup create post form
async function setupCreatePostForm() {
  if (!createPostForm) return

  try {
    // Load categories
    const categories = await api.getCategories()

    postCategory.innerHTML = `
      // <option value="">Chọn danh mục</option>
      ${categories
        .data.categories.map(
          (category) => `
        <option value="${category._id}">${category.name}</option>
      `,
        )
        .join("")}
    `

    // Setup form submission
    createPostForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      if (!token) {
        showLoginModal()
        return
      }

      const formData = new FormData(createPostForm)
      const postData = {
        title: formData.get("title"),
        content: formData.get("content"),
        categoryId: formData.get("category"),
        tags: formData.get("tags").split(",").map((tag) => tag.trim()),
      }

      try {
        const response = await api.createPost(postData)
        if (response.success) {
          alert("Tạo bài viết thành công")
          window.location.href = "index.html"
        } else {
          throw new Error(response.message || "Tạo bài viết thất bại")
        }
      } catch (error) {
        console.error("Error creating post:", error)
        alert(`Đã xảy ra lỗi khi tạo bài viết: ${error.message}`)
      }
    })
  } catch (error) {
    console.error("Error setting up create post form:", error)
    alert("Đã xảy ra lỗi khi tải form. Vui lòng thử lại sau.")
  }
}

// Show login modal
function showLoginModal() {
  alert("Vui lòng đăng nhập để tiếp tục.")
  window.location.href = "login.html"
}

// Tạo các hàm toàn cục để gọi từ HTML
window.loadComments = loadComments
