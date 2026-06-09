import { defineConfig } from 'rspress/config';
import { pluginPreview } from '@rspress/plugin-preview';

export default defineConfig({
    // 文档根目录
    root: 'docs',
    // 文档标题
    title: 'AiPPT-Plugin-Common',
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
                        {
                            text: 'useWheelScroll 滚轮滚动',
                            link: '/hooks/useWheelScroll/',
                        },
                    ],
                },
                {
                    text: '模块',
                    items: [
                        {
                            text: 'EventTracking 埋点上报',
                            link: '/modules/EventTracking/',
                        },
                    ],
                },
                {
                    text: '工具方法',
                    items: [
                        {
                            text: 'AsyncUtil',
                            link: '/utils/AsyncUtil',
                        },
                        {
                            text: 'PlatformUtil',
                            link: '/utils/PlatformUtil',
                        },
                        {
                            text: 'StringUtil',
                            link: '/utils/StringUtil',
                        },
                    ],
                },
            ],
        }
    }
});