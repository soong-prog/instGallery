/* global process */
// 调试工具函数 / Debug utility functions
const debug = {
  log: (...args) => {
    // 如果当前环境是开发环境，则输出日志 / If the current environment is development, output the log
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args) => {
    // 如果当前环境是开发环境，则输出错误信息 / If the current environment is development, output the error message
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },
  warn: (...args) => {
    // 如果当前环境是开发环境，则输出警告信息 / If the current environment is development, output the warning message
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  }
};

export { debug }; 