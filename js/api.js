// API configuration
const API_URL = "https://forum-service-csdl.onrender.com" // Update to your ngrok URL
const MAX_RETRIES = 3
const RETRY_DELAY = 3000 // 3 seconds

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map()

// Fallback mock data
const MOCK_DATA = {
  categories: [
    { _id: "cat1", name: "Học tập", postCount: 5 },
    { _id: "cat2", name: "Đời sống", postCount: 3 },
    { _id: "cat3", name: "Sự kiện", postCount: 2 },
    { _id: "cat4", name: "Hỏi đáp", postCount: 4 },
    { _id: "cat5", name: "Chia sẻ tài liệu", postCount: 6 },
  ],
  tags: [
    { _id: "tag1", name: "JavaScript", postCount: 10 },
    { _id: "tag2", name: "Python", postCount: 8 },
    { _id: "tag3", name: "Java", postCount: 6 },
    { _id: "tag4", name: "C++", postCount: 4 },
    { _id: "tag5", name: "React", postCount: 12 },
  ],
  users: [
    { _id: "user1", fullname: "Nguyễn Văn A", avatar: null, reputation: 100, commentCount: 50 },
    { _id: "user2", fullname: "Trần Thị B", avatar: null, reputation: 80, commentCount: 40 },
    { _id: "user3", fullname: "Lê Văn C", avatar: null, reputation: 60, commentCount: 30 },
    { _id: "user4", fullname: "Phạm Thị D", avatar: null, reputation: 40, commentCount: 20 },
    { _id: "user5", fullname: "Hoàng Văn E", avatar: null, reputation: 20, commentCount: 10 },
  ],
  posts: [
    {
      _id: "post1",
      title: "Hỏi đáp về lập trình Python",
      content: "Xin chào các bạn, mình đang học Python và có một số thắc mắc về cách sử dụng các thư viện...",
      author: { _id: "user1", fullname: "Nguyễn Văn A", avatar: null },
      category: { _id: "cat4", name: "Hỏi đáp" },
      tags: [{ _id: "tag2", name: "Python" }],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 120,
      commentCount: 5,
      voteCount: 10,
      userVote: 0,
      isSaved: false,
    },
    {
      _id: "post2",
      title: "Chia sẻ tài liệu học React.js",
      content: "Chào mọi người, mình vừa hoàn thành khóa học React và muốn chia sẻ một số tài liệu hay...",
      author: { _id: "user2", fullname: "Trần Thị B", avatar: null },
      category: { _id: "cat5", name: "Chia sẻ tài liệu" },
      tags: [{ _id: "tag5", name: "React" }, { _id: "tag1", name: "JavaScript" }],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 200,
      commentCount: 8,
      voteCount: 15,
      userVote: 0,
      isSaved: false,
    },
    {
      _id: "post3",
      title: "Kinh nghiệm học tập hiệu quả",
      content: "Khi mình vào đại học, mình đã gặp rất nhiều khó khăn trong việc quản lý thời gian và học tập. Sau đây là một số kinh nghiệm mình đã rút ra...",
      author: { _id: "user3", fullname: "Lê Văn C", avatar: null },
      category: { _id: "cat1", name: "Học tập" },
      tags: [],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 300,
      commentCount: 12,
      voteCount: 25,
      userVote: 0,
      isSaved: false,
    }
  ],
  comments: [
    {
      _id: "comment1",
      content: "Bài viết rất hay, cảm ơn bạn đã chia sẻ!",
      author: { _id: "user2", fullname: "Trần Thị B", avatar: null },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      voteCount: 3,
      userVote: 0,
      replies: []
    },
    {
      _id: "comment2",
      content: "Mình có thắc mắc về phần...",
      author: { _id: "user3", fullname: "Lê Văn C", avatar: null },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      voteCount: 1,
      userVote: 0,
      replies: [
        {
          _id: "reply1",
          content: "Về phần đó, bạn có thể tham khảo thêm...",
          author: { _id: "user1", fullname: "Nguyễn Văn A", avatar: null },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          voteCount: 2,
          userVote: 0,
        }
      ]
    }
  ],
  notifications: [
    {
      _id: "notif1",
      content: "Bạn có một bình luận mới từ Trần Thị B",
      type: "comment_created",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      _id: "notif2",
      content: "Bài viết của bạn đã được yêu thích",
      type: "post_voted",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true
    }
  ]
};

// Helper function to handle API responses
async function handleResponse(response) {
  const result = response;
  
  // Check if response follows the new format
  if (result.success !== undefined) {
    if (!result.success) {
      throw new Error(result.message || 'API request failed')
    }
    return result.data
  }
  
  // Fallback for old format
  return result
}

// Function to check if the API is available
async function isApiAvailable() {
  try {
    return await $.ajax({
      url: `${API_URL}/health-check`,
      method: 'GET',
      timeout: 2000,
      crossDomain: true,
    }).then(() => true).catch(() => false);
  } catch (error) {
    console.log("API not available:", error.message);
    return false;
  }
}

// Main API call function with retry mechanism
async function apiCall(endpoint, options = {}, retryCount = 0) {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`
  
  // Check cache first for GET requests
  if (options.method === 'GET' || !options.method) {
    if (cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey)
      if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.log(`Using cached data for ${endpoint}`)
        return cachedData.data
      }
      cache.delete(cacheKey)
    }
  }

  try {
    console.log(`Fetching ${API_URL}${endpoint}`, options)

    // Parse the body if it's a string (JSON)
    let parsedBody = options.body;
    if (typeof options.body === 'string') {
      try {
        parsedBody = JSON.parse(options.body);
      } catch (e) {
        parsedBody = options.body;
      }
    }

    const ajaxOptions = {
      url: `${API_URL}${endpoint}`,
      method: options.method || 'GET',
      contentType: 'application/json',
      dataType: 'json',
      crossDomain: true,
      xhrFields: {
        withCredentials: false
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options.headers
      }
    };

    // Add data for POST/PUT/PATCH requests
    if (parsedBody) {
      ajaxOptions.data = JSON.stringify(parsedBody);
    }

    // Configure jQuery to handle CORS
    $.ajaxSetup({
      beforeSend: function(xhr) {
        if (options.headers?.Authorization) {
          xhr.setRequestHeader('Authorization', options.headers.Authorization);
        }
      }
    });

    const response = await $.ajax(ajaxOptions);
    console.log(`Response for ${endpoint}:`, response);

    // Cache GET requests
    if (!options.method || options.method === 'GET') {
      cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
    }

    return response;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying ${endpoint} (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return apiCall(endpoint, options, retryCount + 1);
    }
    
    throw new Error(error.responseJSON?.message || error.statusText || 'API request failed');
  }
}

// Function to get mock data based on endpoint
function getMockData(endpoint, options = {}) {
  // Extract endpoint path and ID if any
  const parts = endpoint.split('/').filter(Boolean);
  const resource = parts[0];
  
  // Handle pagination and filtering
  if (resource === 'category') {
    return MOCK_DATA.categories;
  }
  
  if (resource === 'tag') {
    return { tags: MOCK_DATA.tags, total: MOCK_DATA.tags.length };
  }
  
  if (resource === 'users') {
    if (parts.length === 1) {
      return MOCK_DATA.users;
    } else if (parts[1] === 'me') {
      return MOCK_DATA.users[0];
    } else {
      const userId = parts[1];
      return MOCK_DATA.users.find(user => user._id === userId) || null;
    }
  }
  
  if (resource === 'post') {
    if (parts.length === 1) {
      // Get all posts with optional filtering
      const params = new URLSearchParams(endpoint.split('?')[1] || '');
      const categoryId = params.get('categoryId');
      const tagIds = params.get('tagIds');
      const userId = params.get('userId');
      const search = params.get('search');
      
      let filteredPosts = [...MOCK_DATA.posts];
      
      if (categoryId) {
        filteredPosts = filteredPosts.filter(post => post.category._id === categoryId);
      }
      
      if (tagIds) {
        const tagIdArray = tagIds.split(',');
        filteredPosts = filteredPosts.filter(post => 
          post.tags.some(tag => tagIdArray.includes(tag._id))
        );
      }
      
      if (userId) {
        filteredPosts = filteredPosts.filter(post => post.author._id === userId);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(searchLower) || 
          post.content.toLowerCase().includes(searchLower)
        );
      }
      
      const skip = parseInt(params.get('skip') || '0');
      const take = parseInt(params.get('take') || '10');
      
      return {
        posts: filteredPosts.slice(skip, skip + take),
        total: filteredPosts.length
      };
    } else if (parts.length === 2) {
      // Get specific post
      const postId = parts[1];
      return MOCK_DATA.posts.find(post => post._id === postId) || null;
    }
  }
  
  if (resource === 'comment') {
    const params = new URLSearchParams(endpoint.split('?')[1] || '');
    const postId = params.get('postId');
    const userId = params.get('userId');
    const parentCommentId = params.get('parentCommentId');
    
    let filteredComments = [...MOCK_DATA.comments];
    
    if (postId) {
      // In a real app, comments would have postId, 
      // but in our mock we'll just return all comments for simplicity
    }
    
    if (userId) {
      filteredComments = filteredComments.filter(comment => comment.author._id === userId);
    }
    
    if (parentCommentId) {
      // Get replies to a specific comment
      const parentComment = filteredComments.find(comment => comment._id === parentCommentId);
      return parentComment ? parentComment.replies : [];
    }
    
    const skip = parseInt(params.get('skip') || '0');
    const take = parseInt(params.get('take') || '10');
    
    return {
      comments: filteredComments.slice(skip, skip + take),
      total: filteredComments.length
    };
  }
  
  if (resource === 'vote') {
    // Mock votes data
    return { votes: [], total: 0 };
  }
  
  if (resource === 'notifications') {
    return {
      notifications: MOCK_DATA.notifications,
      total: MOCK_DATA.notifications.length
    };
  }
  
  // Default fallback
  return [];
}

// API endpoints
const api = {
  // Auth
  async login(credentials) {
    return await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  },

  async register(userData) {
    return await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },

  // Users
  async getAllUsers() {
    return await apiCall('/users')
  },
  
  async getUser(id) {
    return await apiCall(`/users/${id}`)
  },
  
  async getCurrentUser(token) {
    return await apiCall('/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },
  
  async updateProfile(userData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/users/me', {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
  },
  
  async deleteProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/users/me', {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Categories
  async getCategories() {
    return await apiCall('/category')
  },
  
  async getCategory(id) {
    return await apiCall(`/category/${id}`)
  },
  
  async createCategory(categoryData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/category', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    });
  },
  
  async updateCategory(id, categoryData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/category/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    });
  },
  
  async deleteCategory(id) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/category/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Posts
  async getPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await apiCall(`/post?${queryString}`)
  },

  async getPost(postId) {
    return await apiCall(`/post/${postId}`)
  },

  async createPost(postData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    })
  },
  
  async updatePost(id, postData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/post/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });
  },
  
  async deletePost(id) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/post/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  async toggleLockPost(id) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/post/${id}/lock`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Comments
  async getComments(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await apiCall(`/comment?${queryString}`)
  },
  
  async getComment(id) {
    return await apiCall(`/comment/${id}`)
  },
  
  async createComment(commentData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/comment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(commentData)
    })
  },
  
  async updateComment(id, commentData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/comment/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(commentData)
    });
  },
  
  async deleteComment(id) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/comment/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Votes
  async getVotes(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await apiCall(`/vote?${queryString}`)
  },
  
  async createVote(voteData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/vote', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(voteData)
    });
  },
  
  async deleteVote(id) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/vote/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Tags
  async getTags(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return await apiCall(`/tag?${queryString}`)
  },
  
  async getTag(id) {
    return await apiCall(`/tag/${id}`)
  },
  
  async createTag(tagData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/tag', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tagData)
    });
  },
  
  async updateTag(id, tagData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/tag/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tagData)
    });
  },
  
  async deleteTag(id) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/tag/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Notifications
  async getNotifications() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },
  
  async getUnreadNotificationCount() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/notifications/unread/count', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },
  
  async createNotification(notificationData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/notifications', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(notificationData)
    });
  },

  async markNotificationAsRead(notificationId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  async markAllNotificationsAsRead() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall('/notifications/read/all', {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  async deleteNotification(id) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return await apiCall(`/notifications/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Reports
  createReport: (reportData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return apiCall('/report', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: reportData
    });
  },

  // Saved Posts
  getSavedPosts: (params = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/saved-posts${queryString ? `?${queryString}` : ''}`, {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  savePost: (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return apiCall(`/saved-posts/${postId}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  },

  unsavePost: (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return apiCall(`/saved-posts/${postId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

// Log initial message
console.log("API module loaded and ready");

// Test API connection on load
isApiAvailable().then(available => {
  if (available) {
    console.log("✅ API is available and connected");
  } else {
    console.warn("⚠️ API is not available, will use fallback data");
    // You might want to implement fallback behavior here
  }
}).catch(error => {
  console.error("❌ Error checking API availability:", error);
});

// Expose API to global scope
window.api = api 