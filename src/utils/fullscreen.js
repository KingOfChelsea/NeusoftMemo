/**
 * 切换全屏状态 s
 * @param {HTMLElement} element - 要全屏的元素，默认是整个文档
 */
export const toggleFullScreen = (element = document.documentElement) => {
  if (!document.fullscreenElement) {
    // 进入全屏
    const requestFullscreen =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen

    if (requestFullscreen) {
      requestFullscreen.call(element)
    }
  } else {
    // 退出全屏
    const exitFullscreen =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen

    if (exitFullscreen) {
      exitFullscreen.call(document)
    }
  }
}

/**
 * 进入全屏
 * @param {HTMLElement} element - 要全屏的元素
 */
export const enterFullScreen = (element = document.documentElement) => {
  if (!document.fullscreenElement) {
    const requestFullscreen =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen

    if (requestFullscreen) {
      requestFullscreen.call(element)
    }
  }
}

/**
 * 退出全屏
 */
export const exitFullScreen = () => {
  if (document.fullscreenElement) {
    const exitFullscreen =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen

    if (exitFullscreen) {
      exitFullscreen.call(document)
    }
  }
}

/**
 * 检查是否支持全屏API
 * @returns {boolean} 是否支持全屏
 */
export const isFullscreenSupported = () => {
  return !!(
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled
  )
}

/**
 * 获取当前全屏状态
 * @returns {boolean} 是否全屏中
 */
export const isFullscreen = () => {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )
}

/**
 * 监听全屏变化事件
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消监听函数
 */
export const onFullscreenChange = (callback) => {
  const eventNames = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'MSFullscreenChange',
  ]

  const handler = () => {
    callback(isFullscreen())
  }

  eventNames.forEach((event) => {
    document.addEventListener(event, handler, false)
  })

  // 返回取消监听函数
  return () => {
    eventNames.forEach((event) => {
      document.removeEventListener(event, handler, false)
    })
  }
}

// 默认导出
export default {
  toggle: toggleFullScreen,
  enter: enterFullScreen,
  exit: exitFullScreen,
  isSupported: isFullscreenSupported,
  isActive: isFullscreen,
  onChange: onFullscreenChange,
}
