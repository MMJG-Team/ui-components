# CI/CD 自动化

## 简介

`@mmjg/ui-components` 通过 GitHub Actions 实现持续集成与持续交付，共定义两个工作流，均位于 [.github/workflows/](file:///Users/linjianguang/code/repo/ui-components/.github/workflows) 目录：

| 工作流 | 文件 | 职责 |
| --- | --- | --- |
| 部署文档 | [deploy-docs.yml](file:///Users/linjianguang/code/repo/ui-components/.github/workflows/deploy-docs.yml) | 构建文档站并部署到 GitHub Pages |
| 发布 NPM 包 | [release-npm-pkg.yml](file:///Users/linjianguang/code/repo/ui-components/.github/workflows/release-npm-pkg.yml) | 消费 Changesets 提升版本并发布到 npm |

两个工作流均使用 `actions/checkout@v4`、`actions/setup-node@v4`（Node 22.18.0）与 `pnpm/action-setup@v4`（pnpm 10.12.1）搭建运行环境。

## 部署文档

工作流文件：[deploy-docs.yml](file:///Users/linjianguang/code/repo/ui-components/.github/workflows/deploy-docs.yml)。

### 触发条件

```yaml
on:
    push:
        branches: [main]
        paths:
            - ".github/workflows/deploy-docs.yml"
            - "packages/**"
            - "site/**"
            - "package.json"
            - "repress.config.ts"
            - "pnpm-lock.yaml"
    workflow_dispatch:
```

当 push 到 `main` 分支且变更涉及以下路径时触发：`.github/workflows/deploy-docs.yml`、`packages/**`、`site/**`、`package.json`、`repress.config.ts`（注：源文件中写作 `repress.config.ts`，实指 `rspress.config.ts`）、`pnpm-lock.yaml`。亦支持在 GitHub Actions 界面手动触发（`workflow_dispatch`）。

### 权限与并发

```yaml
permissions:
    contents: read
    pages: write
    id-token: write

concurrency:
    group: "pages"
    cancel-in-progress: false
```

- 权限授予 `pages: write` 与 `id-token: write`，用于部署到 GitHub Pages。
- 并发组为 `pages`，且 `cancel-in-progress: false`，即不会中断进行中的部署任务，避免重复部署冲突。

### 构建作业（build）

```yaml
jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout
              uses: actions/checkout@v4
            - name: Setup Node + pnpm
              uses: actions/setup-node@v4
              with:
                  node-version: 22.18.0
            - uses: pnpm/action-setup@v4
              with:
                  version: 10.12.1
            - name: Install dependencies
              run: pnpm install --frozen-lockfile
            - name: Build docs
              run: pnpm run build:docs
            - name: Upload artifact
              uses: actions/upload-pages-artifact@v3
              with:
                  path: ./site/doc_build
```

步骤说明：

1. `actions/checkout@v4` 检出代码。
2. `actions/setup-node@v4` 安装 Node 22.18.0。
3. `pnpm/action-setup@v4` 安装 pnpm 10.12.1。
4. `pnpm install --frozen-lockfile` 安装依赖。
5. `pnpm run build:docs` 构建文档站（等价于 `rspress build`），产物输出到 `site/doc_build`。
6. `actions/upload-pages-artifact@v3` 将 `./site/doc_build` 上传为部署产物。

### 部署作业（deploy）

```yaml
    deploy:
        needs: build
        runs-on: ubuntu-latest
        environment:
            name: github-pages
            url: ${{ steps.deployment.outputs.page_url }}
        steps:
            - name: Deploy to GitHub Pages
              id: deployment
              uses: actions/deploy-pages@v4
```

`deploy` 作业依赖 `build` 完成，运行在 `github-pages` 环境中，通过 `actions/deploy-pages@v4` 将产物部署到 GitHub Pages，部署后页面 URL 通过 `steps.deployment.outputs.page_url` 暴露。文档站最终访问地址为 <https://mmjg-team.github.io/ui-components>。

## 发布 NPM 包

工作流文件：[release-npm-pkg.yml](file:///Users/linjianguang/code/repo/ui-components/.github/workflows/release-npm-pkg.yml)。

### 触发条件

```yaml
on:
    push:
        branches: [main]
        paths:
            - ".changeset/**"
```

当 push 到 `main` 分支且 `.changeset/**` 路径下有变更（即有新的变更集被合入）时触发。这意味着开发者只要提交了变更集，合并到主分支后即会自动触发版本提升与发布。

### 权限

```yaml
permissions:
    contents: write
    pull-requests: write
```

授予 `contents: write` 以便回写版本提升提交与推送 tag，授予 `pull-requests: write` 以支持潜在的 PR 操作。

### 运行环境

与部署文档工作流一致：

- `actions/checkout@v4`（`fetch-depth: 1`）
- `actions/setup-node@v4`，Node 22.18.0
- `pnpm/action-setup@v4`，pnpm 10.12.1
- `pnpm install --frozen-lockfile` 安装全部 monorepo 依赖

### 设置 npm 鉴权

```yaml
- name: Set npm auth token
  env:
      NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  run: echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" > ~/.npmrc
```

通过仓库 Secret `NPM_TOKEN` 写入 `~/.npmrc`，配置 npm registry 鉴权令牌，供后续 `pnpm publish` 使用。

### 版本提升与提交

```yaml
- name: Update versions & generate changelog
  run: pnpm exec changeset version
- name: Commit version bump & push tag
  run: |
      git config --global user.name "github-actions[bot]"
      git config --global user.email "github-actions[bot]@users.noreply.github.com"
      git add .
      git commit -m "chore: bump package versions from changesets"
      git push --follow-tags
```

1. `pnpm exec changeset version` 消费所有变更集，提升 [packages/ui-components/package.json](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/package.json) 的版本号并生成 `CHANGELOG.md`。
2. 以 `github-actions[bot]` 身份提交所有变更（版本号、CHANGELOG、已删除的变更集文件），提交信息固定为 `chore: bump package versions from changesets`，并 `git push --follow-tags` 推送。

> 由于 [.changeset/config.json](file:///Users/linjianguang/code/repo/ui-components/.changeset/config.json) 中 `commit: false`，`changeset version` 不会自动提交，提交动作由此步骤显式完成。

### 发布到 npm

```yaml
- name: Publish packages to npm
  run: pnpm run publish:ui-components
```

执行根 [package.json](file:///Users/linjianguang/code/repo/ui-components/package.json) 的 `publish:ui-components` 脚本（等价于 `pnpm --filter ./packages/ui-components run publish`，运行 [scripts/publish.js](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/scripts/publish.js)）。发布前由 `prepublishOnly` 生命周期钩子先执行 `build:ui-components` 构建，确保发布的产物为最新源码构建结果。详见 [构建与发布](./构建与发布.md)。

## 两个工作流的协同

```
开发者提交变更集 → 合入 main
        │
        ├─ .changeset/** 变更 → release-npm-pkg.yml
        │       │
        │       ├─ changeset version（提升版本 + 生成 CHANGELOG）
        │       ├─ git commit & push --follow-tags
        │       └─ publish:ui-components（构建 + 发布到 npm）
        │
        └─ packages/** / site/** 变更 → deploy-docs.yml
                │
                ├─ build:docs（构建文档站）
                └─ 部署到 GitHub Pages
```

二者相互独立：仅提交变更集时只触发发布；仅修改文档或组件源码时只触发文档部署；若同时涉及两类路径，则两个工作流并行运行。

---

← [Changesets 版本管理](./Changesets-版本管理.md) · [首页](../Home.md)
