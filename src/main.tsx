import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ứng dụng dùng bảng màu sáng thống nhất, không theo chế độ tối của hệ điều hành.
document.documentElement.classList.remove('dark');

createRoot(document.getElementById('root')!).render(<App />);
