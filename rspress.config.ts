import { defineConfig } from 'rspress/config';
import { pluginPreview } from '@rspress/plugin-preview';

export default defineConfig({
    // 文档根目录
    root: 'docs',
    // 文档标题
    title: 'ui-components',
    plugins: [
        pluginPreview({
            defaultRenderMode: 'pure'
        })
    ],
    themeConfig: {
        sidebar: {
            '/': [
                {
                    text: '首页',
                    link: '/',
                },
                {
                    text: '组件',
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
                            text: 'useMockProgress 模拟进度条',
                            link: '/hooks/useMockProgress/',
                        },
                    ],
                },
                {
                    text: '模块',
                    items: [
                        {
                            text: 'UniqueRequest 唯一请求管理',
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