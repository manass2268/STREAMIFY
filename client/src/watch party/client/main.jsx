import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/grid.css' // 🔥 Sirf humara global dark CSS imported hoga

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)