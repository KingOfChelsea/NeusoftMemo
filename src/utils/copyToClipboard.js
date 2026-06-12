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
    // 验证输入参数
    if (!text && text !== 0 && text !== false) {
      // 允许数字0和false
      console.error('copyToClipboard: 文本参数无效:', text)
      ElMessage.error('复制内容为空')
      reject(new Error('复制内容为空'))
      return
    }

    // 确保text是字符串
    const textStr = String(text)

    const copyButton = document.createElement('button')
    copyButton.className = 'temp-copy-btn'
    copyButton.style.cssText = `
      position: fixed;
      left: -9999px;
      top: -9999px;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    `

    // 使用更安全的方式设置属性
    try {
      copyButton.dataset.clipboardText = textStr
    } catch (err) {
      console.error('copyToClipboard: 设置属性失败:', err)
      ElMessage.error('复制失败')
      reject(err)
      return
    }

    document.body.appendChild(copyButton)

    const clipboard = new Clipboard('.temp-copy-btn')

    clipboard.on('success', (e) => {
      ElMessage.success(successMsg)
      setTimeout(() => {
        clipboard.destroy()
        if (copyButton.parentNode) {
          document.body.removeChild(copyButton)
        }
      }, 100)
      resolve(e.text)
    })

    clipboard.on('error', (e) => {
      ElMessage.error(errorMsg)
      setTimeout(() => {
        clipboard.destroy()
        if (copyButton.parentNode) {
          document.body.removeChild(copyButton)
        }
      }, 100)
      reject(e)
    })

    try {
      copyButton.click()
    } catch (err) {
      console.error('copyToClipboard: 点击失败:', err)
      clipboard.destroy()
      if (copyButton.parentNode) {
        document.body.removeChild(copyButton)
      }
      reject(err)
    }
  })
}
