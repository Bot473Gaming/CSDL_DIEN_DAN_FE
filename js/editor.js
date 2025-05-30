// DOM Elements
const editorToolbar = document.querySelector(".editor-toolbar")
const editorContent = document.getElementById("post-content")
const contentHidden = document.getElementById("post-content-hidden")
const attachmentsInput = document.getElementById("post-attachments")
const attachmentsPreview = document.getElementById("attachments-preview")

// Initialize editor
document.addEventListener("DOMContentLoaded", () => {
  if (!editorToolbar || !editorContent || !contentHidden) return

  // Setup editor toolbar buttons
  const buttons = editorToolbar.querySelectorAll("button")
  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault()
      const command = button.dataset.command

      if (command === "createLink") {
        const url = prompt("Enter the link URL:")
        if (url) {
          document.execCommand(command, false, url)
        }
      } else if (command === "insertImage") {
        const url = prompt("Enter the image URL:")
        if (url) {
          document.execCommand(command, false, url)
        }
      } else {
        document.execCommand(command, false, null)
      }

      // Update hidden textarea with content
      contentHidden.value = editorContent.innerHTML
    })
  })

  // Update hidden textarea when content changes
  editorContent.addEventListener("input", () => {
    contentHidden.value = editorContent.innerHTML
  })

  // Setup file attachments preview
  if (attachmentsInput && attachmentsPreview) {
    attachmentsInput.addEventListener("change", () => {
      attachmentsPreview.innerHTML = ""

      if (attachmentsInput.files.length > 0) {
        for (let i = 0; i < attachmentsInput.files.length; i++) {
          const file = attachmentsInput.files[i]
          const reader = new FileReader()

          reader.onload = (e) => {
            const preview = document.createElement("div")
            preview.className = "attachment-preview"

            if (file.type.startsWith("image/")) {
              preview.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button class="remove-attachment" data-index="${i}">&times;</button>
              `
            } else {
              preview.innerHTML = `
                <div class="file-preview">
                  <i class="fas ${getFileIcon(file.type)}"></i>
                  <span>${file.name}</span>
                </div>
                <button class="remove-attachment" data-index="${i}">&times;</button>
              `
            }

            attachmentsPreview.appendChild(preview)

            // Setup remove button
            const removeBtn = preview.querySelector(".remove-attachment")
            removeBtn.addEventListener("click", () => {
              preview.remove()
              // Note: Can't actually remove from FileList, would need to use FormData in real implementation
            })
          }

          reader.readAsDataURL(file)
        }
      }
    })
  }
})

// Get file icon based on file type
function getFileIcon(fileType) {
  if (fileType.includes("pdf")) {
    return "fa-file-pdf"
  } else if (fileType.includes("word") || fileType.includes("document")) {
    return "fa-file-word"
  } else if (fileType.includes("excel") || fileType.includes("sheet")) {
    return "fa-file-excel"
  } else if (fileType.includes("powerpoint") || fileType.includes("presentation")) {
    return "fa-file-powerpoint"
  } else if (fileType.includes("image")) {
    return "fa-file-image"
  } else if (fileType.includes("video")) {
    return "fa-file-video"
  } else if (fileType.includes("audio")) {
    return "fa-file-audio"
  } else if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("archive")) {
    return "fa-file-archive"
  } else if (
    fileType.includes("code") ||
    fileType.includes("javascript") ||
    fileType.includes("html") ||
    fileType.includes("css")
  ) {
    return "fa-file-code"
  } else {
    return "fa-file"
  }
}
