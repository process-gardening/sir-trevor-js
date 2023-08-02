// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.js'),
      name: 'SirTrevor',
      // the proper extensions will be added
      fileName: 'sir-trevor',
    },
  },
  test: {
    globals: true,
    setupFiles: [
      "./javascripts/helpers/shims.js",
      "./javascripts/helpers/sir-trevor.js",
    ],
    root: "./spec",
    environment: "happy-dom",
  }
})
