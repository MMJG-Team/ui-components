---
pageType: home
title: "@mmjg/ui-components"
titleSuffix: "基于 Rsbuild 的静态站点生成器"

hero:
    name: "@mmjg/ui-components"
    text: |
        做一个小而美的
        组件库
    tagline: 易用、灵活、可扩展
    image:
        src: /cat-logo-02.png
        alt: logo
    actions:
        - theme: brand
          text: 开始使用
          link: ./intro
        # - theme: alt
        #   text: 快速开始
        #   link: ./intro

features:
    - title: 高性能的组件
      details: 内置虚拟滚动、懒加载等性能优化方案，大量复用实例降低重绘开销，复杂页面也能保持流畅交互。
      icon: /components.svg
      link: ./components/Masonry
    - title: 灵活易用的hooks
      details: 封装通用逻辑，与组件解耦，大幅减少重复样板代码。
      icon: /hooks.svg
      link: ./hooks/useMockProgress
    - title: 功能强大的模块
      details: 开箱即用的请求、监听器等模块，统一类型定义，天然适配TS
      icon: /modules.svg
      link: ./modules/UniqueRequest
---
