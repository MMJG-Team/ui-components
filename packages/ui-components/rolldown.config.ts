import { defineConfig } from 'rolldown';
import postcss from 'rollup-plugin-postcss';
import { dts } from 'rolldown-plugin-dts'

export default defineConfig({
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'esm'
    },
    plugins: [
        dts(),
        postcss({
            modules: {
                // 自定义类名哈希规则
                generateScopedName: '[name]__[local]___[hash:base64:5]'
            }
        })
    ],
    external: [
        'react',
        'react-dom',
        'axios'
    ]
});