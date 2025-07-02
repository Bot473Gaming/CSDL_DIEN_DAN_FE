// DOM Elements
const notificationPanel = document.getElementById("notification-panel")
const notificationList = document.getElementById("notification-list")
const notificationCount = document.getElementById("notification-count")
const markAllReadBtn = document.getElementById("mark-all-read")
const closeNotificationsBtn = document.querySelector(".close-notifications")

// Get token from localStorage
import { API_URL, token, currentUser } from './config.js';
import { updateNotificationCount } from './main.js';

// Initialize notifications
document.addEventListener("DOMContentLoaded", () => {
  // Setup notification panel
  setupNotificationPanel()

  // Load notifications
  if (token) {
    loadNotifications()
  }
})

// Set up notification panel
export function setupNotificationPanel() {
  if (!notificationPanel) return

  // Handle notification icon click
  const notificationIcon = document.querySelector(".notification-icon")
  if (notificationIcon) {
    notificationIcon.addEventListener("click", toggleNotificationPanel)
  }

  // Handle close button click
  if (closeNotificationsBtn) {
    closeNotificationsBtn.addEventListener("click", closeNotificationPanel)
  }

  // Handle mark all as read button click
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", markAllAsRead)
  }

  // Close notification panel when clicking outside of it
  document.addEventListener("click", (e) => {
    if (
      notificationPanel &&
      !notificationPanel.contains(e.target) &&
      !e.target.closest(".notification-icon") &&
      notificationPanel.classList.contains("active")
    ) {
      closeNotificationPanel()
    }
  })
}

// Toggle notification panel
function toggleNotificationPanel() {
  if (!notificationPanel) return

  notificationPanel.classList.add("active")
}

// Close notification panel
function closeNotificationPanel() {
  if (!notificationPanel) return
  
  notificationPanel.classList.remove("active")
}

// Load notifications
async function loadNotifications() {
  if (!token || !notificationList) return
  console.log("mmmmm")
  try {
    // Show loading state
    notificationList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>'

    // Fetch notifications from API
    const data = await api.getNotifications({}, token)
    const notifications = data.data.notifications || []

    // Lọc thông báo theo userId hiện tại
    const filteredNotifications = notifications.filter(noti => noti.userId === currentUser._id)

    if (filteredNotifications.length === 0) {
      notificationList.innerHTML = '<div class="empty-state">Không có thông báo nào</div>'
      return
    }

    // Create notification items
    let notificationItems = ''
    filteredNotifications.forEach(notification => {
      const isRead = notification.isRead
      const date = new Date(notification.createdAt)
      const formattedDate = formatDate(date)
      
      let icon = 'fa-bell'
      if (notification.type === 'comment_created') icon = 'fa-comment'
      else if (notification.type === 'post_voted') icon = 'fa-thumbs-up'
      else if (notification.type.includes('report')) icon = 'fa-flag'
      
      notificationItems += `
        <div class="notification-item mark-read ${isRead ? '' : 'unread'}" data-id="${notification._id}">        
          <div class="notification-content">
            <div class="notification-text">${notification.content}</div>
            <div class="notification-time">${formattedDate}</div>
          </div>
          <div class="notification-actions">
            <button class="delete-notification" title="Xóa thông báo">xóa thông báo</button>
          </div>
        </div>
      `
    })

    notificationList.innerHTML = notificationItems

    // Add event listeners to notification actions
    setupNotificationActions()

    // Update notification count
    updateNotificationCount()
  } catch (error) {
    console.error('Error loading notifications:', error)
    notificationList.innerHTML = '<div class="error-state">Không thể tải thông báo</div>'
  }
}

// Set up notification actions
function setupNotificationActions() {
  // Mark as read buttons
  const markReadBtns = notificationList.querySelectorAll('.mark-read')
  markReadBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const notificationItem = e.target.closest('.notification-item')
      const notificationId = notificationItem.dataset.id
      await markAsRead(notificationId, notificationItem)
    })
  })

  // Delete buttons
  const deleteBtns = notificationList.querySelectorAll('.delete-notification')
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const button = e.currentTarget // luôn là chính nút delete
      const notificationItem = button.closest('.notification-item')
      const notificationId = notificationItem.dataset.id
      notificationItem.style.display = "none"
      await deleteNotification(notificationId, notificationItem)
    })
  })

  // Make notification items clickable to mark as read
  const unreadItems = notificationList.querySelectorAll('.notification-item.unread')
  unreadItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.notification-actions')) {
        const notificationId = item.dataset.id
        markAsRead(notificationId, item)
      }
    })
  })
}

// Mark a notification as read
async function markAsRead(notificationId, notificationItem) {
  if (!token) return

  try {
    await api.markNotificationAsRead(notificationId, token)
    
    // Update UI
    notificationItem.classList.remove('unread')
    const markReadBtn = notificationItem.querySelector('.mark-read')
    if (markReadBtn) markReadBtn.remove()
    
    // Update notification count
    updateNotificationCount()
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

// Delete a notification
async function deleteNotification(notificationId, notificationItem) {
  if (!token) return

  try {
    await api.deleteNotification(notificationId, token)
    
    // Remove from UI with animation
    notificationItem.classList.add('removing')
    setTimeout(() => {
      notificationItem.remove()
      
      // Check if there are no more notifications
      if (notificationList.children.length === 0) {
        notificationList.innerHTML = '<div class="empty-state">Không có thông báo nào</div>'
      }

      // Update notification count
      updateNotificationCount()
    }, 0)
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

// Mark all notifications as read
async function markAllAsRead() {
  if (!token) return

  try {
    await api.markAllNotificationsAsRead(token)
    
    // Update UI
    const unreadItems = notificationList.querySelectorAll('.notification-item.unread')
    unreadItems.forEach(item => {
      item.classList.remove('unread')
      const markReadBtn = item.querySelector('.mark-read')
      if (markReadBtn) markReadBtn.remove()
    })
    
    // Update notification count
    updateNotificationCount()
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

// Update notification count
// export async function updateNotificationCount() {
//   if (!token || !notificationCount) return

//   try {
//     // Try to get unread count directly if the endpoint is available
//     let unreadCount = 0
//     try {
//       const result = await api.getUnreadNotificationCount(token)
//       unreadCount = result.count || 0
//     } catch (e) {
//       // If unread count endpoint fails, fallback to counting from notifications
//       const result = await api.getNotifications({ isRead: false }, token)
//       const notifications = result.notifications || result || []
//       unreadCount = notifications.length
//     }

//     if (unreadCount > 0) {
//       notificationCount.textContent = unreadCount
//       notificationCount.style.display = "flex"
//     } else {
//       notificationCount.style.display = "none"
//     }
//   } catch (error) {
//     console.error("Error updating notification count:", error)
//     // Hide notification count on error
//     notificationCount.style.display = "none"
//   }
// }

// Format date
function formatDate(date) {
  const now = new Date()
  const diff = now - date
  
  // Less than a minute
  if (diff < 60 * 1000) {
    return 'Vừa xong'
  }
  
  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes} phút trước`
  }
  
  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours} giờ trước`
  }
  
  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} ngày trước`
  }
  
  // Format as date
  return date.toLocaleDateString('vi-VN')
}


