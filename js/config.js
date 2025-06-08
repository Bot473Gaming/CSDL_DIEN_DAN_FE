// API URL
export const API_URL = "https://forum-service-csdl.onrender.com"

// Get token and current user
export const token = localStorage.getItem("token")
export const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")