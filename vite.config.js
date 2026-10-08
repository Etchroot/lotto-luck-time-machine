import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // 정적 호스팅(GitHub Pages 등)의 하위 경로에서도 동작하도록 상대 경로로 빌드
});
