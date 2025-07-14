import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // 引入 Tailwind CSS
import CodeNarrator from './CodeNarrator'; // 引入您的 CodeNarrator 组件
import reportWebVitals from './reportWebVitals'; // 性能报告 (可选)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CodeNarrator />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
