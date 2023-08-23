// vite.config.js
import {resolve} from 'path'
import {defineConfig} from 'vitest/config'

export default defineConfig(({command, mode, ssrBuild}) => {

  const testConfig = {
    test: {
      globals: true,
      setupFiles: [
        "./javascripts/helpers/shims.js",
        "./javascripts/helpers/sir-trevor.js",
      ],
      root: "./spec",
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

