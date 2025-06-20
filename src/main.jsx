// 导入StrictMode组件 / Import StrictMode component
import React from 'react'
// 导入createRoot函数 / Import createRoot function
import ReactDOM from 'react-dom/client'
// 导入index.css样式文件 / Import index.css style file
import './index.css'
// 导入App组件 / Import App component
import App from './App'

// 使用createRoot函数创建一个根节点，并将App组件渲染到该节点上 / Use the createRoot function to create a root node and render the App component to it
ReactDOM.createRoot(document.getElementById('root')).render(
  // 使用StrictMode组件包裹App组件 / Wrap the App component with the StrictMode component
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
