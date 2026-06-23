import { defineConfig } from '@rspress/core';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginLess } from '@rsbuild/plugin-less';

export default defineConfig({
    lang: 'zh',
    base: 'ui-components',
    root: './docs',
    // 文档标题
    title: '@mmjg/ui-components',
    icon: '/cat-logo-02.png',
    plugins: [
        pluginPreview({
            defaultRenderMode: 'pure'
        })
    ],
    locales: [
        // {
        //     lang: 'en',
        //     label: 'English',
        //     title: '@mmjg/ui-components',
        //     description: '@mmjg/ui-components',
        // },
        {
            lang: 'zh',
            label: '简体中文',
            title: '@mmjg/ui-components',
            description: '@mmjg/ui-components',
        },
    ],
    themeConfig: {
        socialLinks: [
            {
                icon: 'github',
                mode: 'link',
                content: 'https://github.com/MMJG-Team/ui-components',
            },
        ]
    },
    builderConfig: {
        resolve: {
            alias: {
                '@assets': './docs/assets',
                "@demo": './docs/_demo',
                '@mmjg/ui-components': '../packages/ui-components/src/index.ts'
            }
        },
        plugins: [pluginLess()],
    }
});