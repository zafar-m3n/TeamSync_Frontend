import api from '@/lib/axios'

// Types a browser tab can show inline. Word documents can only be downloaded.
const PREVIEWABLE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export const canPreview = (mimeType) => PREVIEWABLE_TYPES.includes(mimeType)

function fileNameFrom(disposition = '', fallback = 'download') {
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1])
    } catch {
      // Malformed encoding: fall back to the plain filename parameter.
    }
  }
  const plain = /filename="((?:[^"\\]|\\.)*)"/i.exec(disposition)
  return plain ? plain[1].replace(/\\(.)/g, '$1') : fallback
}

// Downloads go through axios because the JWT is sent in a header, not a cookie.
async function fetchFile(url) {
  const response = await api.get(url, { responseType: 'blob' })
  return {
    blob: response.data,
    fileName: fileNameFrom(response.headers['content-disposition']),
  }
}

function saveBlob(blob, fileName) {
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(href), 1000)
}

export async function downloadFile(url) {
  const { blob, fileName } = await fetchFile(url)
  saveBlob(blob, fileName)
}

// The tab opens before the request, while the click still counts as user
// input, so popup blockers allow it. If popups are blocked anyway, the file
// is downloaded instead.
export async function openFile(url) {
  const tab = window.open('', '_blank')
  if (tab) tab.opener = null
  try {
    const { blob, fileName } = await fetchFile(url)
    if (!tab) {
      saveBlob(blob, fileName)
      return
    }
    const href = URL.createObjectURL(blob)
    tab.location.href = href
    setTimeout(() => URL.revokeObjectURL(href), 60_000)
  } catch (error) {
    tab?.close()
    throw error
  }
}
