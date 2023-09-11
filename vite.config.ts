// vite.config.js
import {resolve} from 'path'
import {defineConfig} from 'vitest/config'

export default defineConfig(({command, mode, ssrBuild}) => {

  const testConfig = {
    server: {
      strictPort: true
    },
    test: {
      globals: true,
      setupFiles: [
        "./helpers/shims.js",
        "./helpers/sir-trevor.js",
      ],
      root: "./spec/javascripts",
      environment: "jsdom",
    }
  }

  if (command == 'build') {
    return {
      build: {
        lib: {
          // Could also be a dictionary or array of multiple entry points
          entry: resolve(__dirname, 'lib/index.js'),
          name: 'SirTrevor',
          // the proper extensions will be added
          fileName: 'sir-trevor',
        },
      }
    }
  } else {
    return {
      ...testConfig
    }
  }
})

