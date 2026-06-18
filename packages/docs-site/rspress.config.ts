import { defineConfig } from 'rspress/config';
import { pluginPreview } from '@rspress/plugin-preview';

export default defineConfig({
    base: 'ui-components/docs',
    // 文档根目录
    root: 'docs',
    // 文档标题
    title: 'UI Components',
    plugins: [
        pluginPreview({
            defaultRenderMode: 'pure'
        })
    ],
    themeConfig: {
        sidebar: {
            '/': [
                {
                    text: 'Home',
                    link: '/',
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
    }
});