import { defineConfig } from '@rspress/core';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginLess } from '@rsbuild/plugin-less';

export default defineConfig({
    base: 'ui-components',
    // 文档根目录
    root: 'docs',
    // 文档标题
    title: '@mmjg/ui-components',
    icon: '/cat-logo-02.png',
    plugins: [
        pluginPreview({
            defaultRenderMode: 'pure'
        })
    ],
    themeConfig: {
        socialLinks: [
            {
                icon: 'github',
                mode: 'link',
                content: 'https://github.com/MMJG-Team/ui-components',
            },
        ],
        nav: [
            {
                text: '简介',
                link: '/intro',
            }
        ],
        sidebar: {
            '/': [
                {
                    text: 'Home',
                    link: '/',
                },
                {
                    text: '简介',
                    link: '/intro',
                },
                {
                    text: 'Components',
                    items: [
                        {
                            text: 'Masonry 瀑布流',
                            link: '/components/Masonry/',
                        },
                    ],
                },
                {
                    text: 'Hooks',
                    items: [
                        {
                            text: 'useMockProgress 模拟进度',
                            link: '/hooks/useMockProgress/',
                        },
                    ],
                },
                {
                    text: 'Modules',
                    items: [
                        {
                            text: 'UniqueRequest 唯一请求',
                            link: '/modules/UniqueRequest/',
                        },
                        {
                            text: 'VerticalViewportMonitor 视口监控',
                            link: '/modules/VerticalViewportMonitor/',
                        }
                    ],
                }
            ],
        }
    },
    builderConfig: {
        resolve: {
            alias: {
                '@components': './docs/components',
                '@mmjg/ui-components': './packages/ui-components/src/index.ts'
            }
        },
        plugins: [pluginLess()],
    },
});