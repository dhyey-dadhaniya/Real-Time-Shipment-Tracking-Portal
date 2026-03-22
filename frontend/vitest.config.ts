import { defineConfig } from 'vitest/config'

/** Kept separate from vite.config.ts so `defineConfig` uses one Vite type tree (avoids Vitest-bundled Vite vs root `vite` plugin mismatch). */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
