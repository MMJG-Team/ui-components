# Changesets 版本管理

## 简介

`@mmjg/ui-components` 使用 [Changesets](https://github.com/changesets/changesets) 管理版本号提升与变更日志生成。开发者无需手动修改 `version` 或维护 `CHANGELOG`，只需在每次有意义的变更后新增一个变更集（changeset），后续的版本提升由 CI 自动完成。

## 什么是 Changesets

Changesets 是面向 monorepo 的版本管理工具，其核心思路是：

1. 开发者在本地为本次变更生成一个 Markdown 格式的「变更集」文件，声明受影响的包与版本提升类型。
2. CI 收集所有未消费的变更集，执行 `changeset version` 统一提升版本号并生成 `CHANGELOG.md`。
3. 随后执行发布。

在本项目中，变更集存放于 [.changeset/](file:///Users/linjianguang/code/repo/ui-components/.changeset) 目录，命令行工具 `@changesets/cli` 作为 devDependency 声明在根 [package.json](file:///Users/linjianguang/code/repo/ui-components/package.json) 中：

```json
"devDependencies": {
    "@changesets/cli": "^2.31.0"
}
```

## 配置

Changesets 的行为由 [.changeset/config.json](file:///Users/linjianguang/code/repo/ui-components/.changeset/config.json) 控制：

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.4/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

关键字段说明：

| 字段 | 值 | 说明 |
| --- | --- | --- |
| `baseBranch` | `main` | 主分支，CI 据此判断变更集来源 |
| `access` | `restricted` | 变更集默认的发布可见性（实际发布由包自身的 `publishConfig.access: public` 覆盖为公开） |
| `updateInternalDependencies` | `patch` | monorepo 内部依赖因其它包变更而联动升级时，仅做 patch 级提升 |
| `changelog` | `@changesets/cli/changelog` | 使用官方默认 changelog 生成器 |
| `commit` | `false` | 执行 `changeset version` 时不自动提交，由 CI 显式 `git commit` |
| `fixed` / `linked` | `[]` | 未使用固定版本组或联动版本组 |

## 新增变更集

完成一次有意义的代码变更后，运行：

```bash
pnpm exec changeset
```

交互式流程会依次询问：

1. **选择包**：勾选本次变更影响的包（本项目即 `@mmjg/ui-components`）。
2. **选择提升类型**：`patch`（修复）/ `minor`（功能）/ `major`（破坏性）。
3. **填写摘要**：一句话描述变更内容，会写入 `CHANGELOG.md`。

完成后，会在 [.changeset/](file:///Users/linjianguang/code/repo/ui-components/.changeset) 目录下生成一个以随机单词命名的 Markdown 文件，结构如下：

```markdown
---
"@mmjg/ui-components": patch
---

<本次变更的摘要说明>
```

frontmatter 中的 `"@mmjg/ui-components": patch|minor|major` 声明了对该包的提升类型，正文为变更说明。将该文件随代码一并提交即可。

## 版本提升流程

版本提升由 CI 在主分支上自动完成，流程见 [CI/CD 自动化](./CI-CD-自动化.md) 中的「发布 NPM 包」一节。核心步骤：

1. **触发**：当 push 到 `main` 且 `.changeset/**` 路径下有变更时，触发 `release-npm-pkg.yml` 工作流。
2. **消费变更集**：CI 执行 `pnpm exec changeset version`，该命令会：
   - 读取所有未消费的变更集文件；
   - 按声明类型提升 [packages/ui-components/package.json](file:///Users/linjianguang/code/repo/ui-components/packages/ui-components/package.json) 的 `version`；
   - 生成 / 追加 `CHANGELOG.md`；
   - 删除已消费的变更集文件。
3. **提交版本提升**：CI 以 `github-actions[bot]` 身份执行：

   ```bash
   git add .
   git commit -m "chore: bump package versions from changesets"
   git push --follow-tags
   ```

4. **发布**：CI 执行 `pnpm run publish:ui-components`，将新版本发布到 npm（详见 [构建与发布](./构建与发布.md)）。

由于 `config.json` 中 `commit: false`，`changeset version` 本身不会提交，提交动作由 CI 显式完成，提交信息固定为 `chore: bump package versions from changesets`。

## 示例

仓库中现存一个示例变更集 [.changeset/polite-clouds-argue.md](file:///Users/linjianguang/code/repo/ui-components/.changeset/polite-clouds-argue.md)，其内容为：

```markdown
---
"@mmjg/ui-components": patch
---

test CI
```

- frontmatter `"@mmjg/ui-components": patch` 表示将对 `@mmjg/ui-components` 做 patch 级提升。
- 正文 `test CI` 为变更说明，会出现在 `CHANGELOG.md` 对应版本下。

该文件用于验证 CI 发布流水线的连通性。当 CI 执行 `changeset version` 时，它会将 `1.0.0-beta.2` 提升为 `1.0.0-beta.3`（patch 级），并把 `test CI` 写入变更日志，随后删除该变更集文件并提交。

## 与发布的关系

变更集只负责声明「要提升什么」，不负责执行发布。版本提升与发布均由 [CI/CD 自动化](./CI-CD-自动化.md) 中的 `release-npm-pkg.yml` 工作流串行完成：先 `changeset version` 提升版本并提交，再 `publish:ui-components` 发布到 npm。因此开发者的工作仅限于「写代码 + 新增变更集 + 提交」。

---

← [构建与发布](./构建与发布.md) · → [CI/CD 自动化](./CI-CD-自动化.md)
