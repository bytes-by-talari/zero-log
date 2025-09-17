import { defineConfig } from 'tsup'

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        browser: 'src/browser.ts'
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: false,
    splitting: false,
    treeshake: true,
    external: ['@sentry/node', '@sentry/browser']
})
