/**
 * 复制文本 Created By Zane Xu 2026-05-31
 * @param {string} text
 * @param {string} successMsg
 * @param {string} errorMsg
 * @returns {Promise<any>}
 */

import Clipboard from 'clipboard'
export const copyToClipboard = (text, successMsg = '复制成功', errorMsg = '复制失败') => {
  return new Promise((resolve, reject) => {
    const copyButton = document.createElement('button')
    copyButton.className = 'temp-copy-btn'
    copyButton.style.display = 'none'
    copyButton.setAttribute('data-clipboard-text', text)
    document.body.appendChild(copyButton)

    const clipboard = new Clipboard('.temp-copy-btn')

    clipboard.on('success', (e) => {
      ElMessage.success(successMsg)
      clipboard.destroy()
      document.body.removeChild(copyButton)
      resolve(e.text)
    })

    clipboard.on('error', (e) => {
      ElMessage.error(errorMsg)
      clipboard.destroy()
      document.body.removeChild(copyButton)
      reject(e)
    })

    copyButton.click()
  })
}
