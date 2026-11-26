import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (command === 'build' && mode === 'production' && !env.VITE_API_URL?.trim()) {
    throw new Error('VITE_API_URL must be configured before building HireAI for production.')
  }
  if (command === 'build' && mode === 'production') {
    let apiUrl
    try {
      apiUrl = new URL(env.VITE_API_URL.trim())
    } catch {
      throw new Error('VITE_API_URL must be an absolute HTTPS URL for production builds.')
    }
    if (apiUrl.protocol !== 'https:' || apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash) {
      throw new Error('VITE_API_URL must be a safe HTTPS backend URL for production builds.')
    }
  }

  return {
    plugins: [react()],
  }
})
