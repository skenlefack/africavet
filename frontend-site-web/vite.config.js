import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
// Build timestamp: 2026-02-15T08:15:00
export default defineConfig({
  plugins: [react()],
})
