import { defineConfig } from 'rolldown';

export default defineConfig({
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        file: 'index.js',
        format: 'esm'
    },
});