---
name: "update-component-doc"
description: "Updates and creates documentation for components, hooks, modules, and utils with standardized structure. Invoke when user asks to update/create documentation or add demos."
---

# Update Component Documentation

This skill provides a standardized workflow for creating and updating documentation in the ui-components project, including components, hooks, modules, and utils.

## When to Invoke

**CRITICAL: Invoke this skill IMMEDIATELY when:**

- User asks to update documentation for any type (component/hook/module/util)
- User asks to create documentation for new items
- User asks to add demos to existing documentation
- User mentions "文档更新"、"组件文档"、"hooks 文档"、"模块文档"、"工具类文档"
- User wants to update API descriptions or best practices

## Documentation Type Detection

Before starting, determine the documentation type:

1. **Components**: Located in `site/docs/zh/components/`
    - Visual UI components (e.g., Cube, PartitionLayout, Menu3D)
    - Focus on props, visual effects, user interactions

2. **Hooks**: Located in `site/docs/zh/hooks/`
    - React custom hooks (e.g., useMockProgress, useEvent)
    - Focus on parameters, return values, usage patterns

3. **Modules**: Located in `site/docs/zh/modules/`
    - Business logic modules (e.g., SyncTaskQueue, UniqueRequest)
    - Focus on classes, methods, workflow, practical scenarios

4. **Utils**: Located in `site/docs/zh/utils/`
    - Utility functions (e.g., AsyncUtil)
    - Focus on function signatures, parameters, simple examples

## Documentation Standards by Type

### 1. Component Documentation Standard

**Structure**:

````markdown
# ComponentName 中文名

简短描述组件的功能和用途。 ✨

:::tip 特性

- **特性1** 🔍：特性1的详细描述
- **特性2** 📏：特性2的详细描述
- **特性3** ⚡：特性3的详细描述

:::

## 代码演示

### Demo标题1

Demo用途说明。

```tsx preview
<Demo代码>
```

### Demo标题2

...

## API 📚

### ComponentProps ⚙️

| 属性  | 说明 | 类型   | 默认值 | 版本 |
| ----- | ---- | ------ | ------ | ---- |
| prop1 | 说明 | `Type` | 默认值 | -    |

### 类型定义

```typescript
interface TypeName {
    // 定义
}
```

**说明**：

- 详细说明

## 特性说明 🎯

### 特性1

详细说明...

## 注意事项 ⚠️

1. **标题1** 📏：
    - 说明1
    - 说明2

2. **标题2** ⚡：
    - 说明1

## 最佳实践 💡

1. **分类1**：
    - 建议1
    - 建议2

2. **分类2**：
    - 建议1
````

**Key Points**:

- Use `:::tip 特性` for feature list (NOT `:::tip 导入`)
- Features must have emoji markers
- Demo titles should have emoji markers
- Must include 特性说明 section
- Must include 注意事项 and 最佳实践 (8-10 items each)

### 2. Hook Documentation Standard

**Structure**:

````markdown
# hookName 中文名

## 概述

详细描述 hook 的功能、用途、适用场景。

:::tip 导入

```tsx
import { hookName } from "@mmjg/ui-components";
```

:::

## 使用示例

### Demo标题

Demo用途说明。

```tsx preview
<Demo代码>
```

## API

### 参数说明

| 参数   | 说明 | 类型   | 默认值 | 版本 |
| ------ | ---- | ------ | ------ | ---- |
| param1 | 说明 | `Type` | 默认值 | -    |

### 返回值

| 属性  | 说明 | 类型   |
| ----- | ---- | ------ |
| prop1 | 说明 | `Type` |

### 类型定义

```typescript
interface Options {
    // 定义
}
```

## 工作原理

详细说明 hook 的实现原理和工作流程。

## 使用场景

1. **场景1**：详细说明
2. **场景2**：详细说明

## 注意事项

1. **注意点1**：详细说明
2. **注意点2**：详细说明

## 最佳实践

1. **实践1**：详细说明
2. **实践2**：详细说明
````

**Key Points**:

- Use `## 概述` for overview (NOT feature list)
- Use `:::tip 导入` for import instructions
- Must include 工作原理 section
- Must include 使用场景 section
- Focus on parameters and return values

### 3. Module Documentation Standard

**Structure**:

````markdown
# ModuleName 中文名

## 概述

详细描述模块的功能、用途、核心价值。

:::tip 特殊说明（可选）

特别适用于某个场景，确保某个效果。

:::

:::tip 导入

```tsx
import { ModuleName } from "@mmjg/ui-components";
```

:::

## 使用示例

### Demo标题

Demo用途说明（必须贴合实际场景）。

```tsx preview
<Demo代码>
```

## API

### ModuleName 类

#### 构造函数

```typescript
const instance = new ModuleName(options);
```

#### 属性

| 属性  | 类型   | 说明 |
| ----- | ------ | ---- |
| prop1 | `Type` | 说明 |

#### 方法

| 方法    | 类型                     | 说明 |
| ------- | ------------------------ | ---- |
| method1 | `(params) => ReturnType` | 说明 |

### 类型定义

```typescript
interface Options {
    // 定义
}
```

**说明**：

- 详细说明

## 工作原理

1. **步骤1**：详细说明
2. **步骤2**：详细说明

## 使用场景

1. **场景1**：详细说明
2. **场景2**：详细说明

## 注意事项

1. **注意点1**：详细说明
2. **注意点2**：详细说明

## 最佳实践（可选）

1. **实践1**：详细说明
````

**Key Points**:

- Use `:::tip` for special notes (like stream rendering scenarios)
- Use `:::tip 导入` for import instructions
- Must include constructor, properties, methods in API
- Must include 工作原理 section (step-by-step)
- Must include 使用场景 section
- Demos must be practical (e.g., typewriter effect for SyncTaskQueue)

### 4. Util Documentation Standard

**Structure**:

````markdown
# UtilName 中文名

## 概述

简短描述工具类的功能和用途。

:::tip 导入

```ts
import { UtilName } from "@mmjg/ui-components";
```

:::

## 使用示例

### Function1 标题

函数用途说明。

```tsx preview
<Demo代码>
```

### Function2 标题

函数用途说明。

```tsx preview
<Demo代码>
```

## API

### Function1

```typescript
function function1(params: Type): ReturnType;
```

#### 参数

| 参数   | 说明 | 类型   | 默认值 |
| ------ | ---- | ------ | ------ |
| param1 | 说明 | `Type` | 默认值 |

#### 返回值

`ReturnType` - 返回值说明

### Function2

...

## 使用场景（可选）

1. **场景1**：详细说明

## 注意事项（可选）

1. **注意点1**：详细说明
````

**Key Points**:

- Use `## 概述` for brief description
- Use `:::tip 导入` for import instructions
- Each function gets its own demo
- Simple and focused on function signatures
- 使用场景 and 注意事项 are optional

## Demo Standards (Apply to All Types)

### Theme Compatibility

**CRITICAL**: All demos must use rspress CSS variables for theme compatibility:

```tsx
// ✅ Correct - Use CSS variables
<div style={{
    background: "var(--rp-c-bg)",
    color: "var(--rp-c-text-1)",
    padding: "20px",
}}>
    Content
</div>

// ❌ Wrong - Use hardcoded colors
<div style={{
    background: "#fff",
    color: "#000",
}}>
    Content
</div>
```

**Available CSS Variables**:

- `var(--rp-c-bg)` - Background color
- `var(--rp-c-bg-soft)` - Soft background color
- `var(--rp-c-text-1)` - Primary text color
- `var(--rp-c-text-2)` - Secondary text color
- `var(--rp-c-border)` - Border color
- `var(--rp-c-brand)` - Brand color
- `var(--rp-c-brand-light)` - Light brand color

### Practical Scenarios

**CRITICAL**: Demos must show real-world usage, not just static props:

**✅ Correct - Practical Demo**:

```tsx
// PartitionLayout demo showing file manager
const ApplicationDemo = () => {
    const [showSubContent, setShowSubContent] = useState(false);

    const subContent = showSubContent && (
        <div style={{ background: "var(--rp-c-bg-soft)" }}>
            <h3>文件详情</h3>
            <button onClick={() => setShowSubContent(false)}>关闭</button>
        </div>
    );

    return (
        <PartitionLayout subContent={subContent}>
            <div style={{ background: "var(--rp-c-bg)" }}>
                <button onClick={() => setShowSubContent(true)}>
                    打开详情
                </button>
            </div>
        </PartitionLayout>
    );
};
```

**❌ Wrong - Static Demo**:

```tsx
// Just showing static subContent with percentage
const BadDemo = () => {
    return (
        <PartitionLayout subContent={<div>子内容30%</div>}>
            <div>主内容</div>
        </PartitionLayout>
    );
};
```

### Demo Titles

- Use emoji markers in demo titles (📏 ⚡ 📐 🎨 🔄 🎯 etc.)
- Titles should be descriptive and indicate the feature being shown
- Examples:
    - `### 自定义尺寸 📏`
    - `### 流式数据打字机效果渲染`
    - `### 实际应用场景 🎯`

## Workflow

### Step 1: Determine Documentation Type

Check the item being documented:

- **Component**: Visual UI element → Use Component Standard
- **Hook**: React custom hook → Use Hook Standard
- **Module**: Business logic class → Use Module Standard
- **Util**: Utility function → Use Util Standard

### Step 2: Analyze Source Code

Read the source code to understand:

- **Components**: Props, CSS mechanisms, visual effects
- **Hooks**: Parameters, return values, state management
- **Modules**: Constructor, methods, properties, workflow
- **Utils**: Function signatures, parameters, return values

**Actions**:

```typescript
// Read source code
Read packages/ui-components/src/[type]/[name]/index.tsx
Read packages/ui-components/src/[type]/[name]/style.module.less (for components)
```

### Step 3: Check Existing Documentation

Read the existing documentation file to identify missing content.

**Actions**:

```typescript
// Check existing docs
Read site/docs/zh/[type]/[name].mdx
```

### Step 4: Update Documentation Based on Type

Follow the appropriate standard for the documentation type:

**For Components**:

1. Update feature list in `:::tip 特性` block
2. Add practical demos (3-5 demos)
3. Update API table with all props
4. Add 特性说明 section
5. Add 注意事项 (8-10 items)
6. Add 最佳实践 (8-10 items)

**For Hooks**:

1. Update 概述 section
2. Add demos showing usage patterns (2-4 demos)
3. Update parameter and return value tables
4. Add 工作原理 section
5. Add 使用场景 (4-6 items)
6. Add 注意事项 (4-6 items)

**For Modules**:

1. Update 概述 section
2. Add special notes in `:::tip` if applicable
3. Add practical demos (2-3 demos)
4. Update API with constructor, properties, methods
5. Add 工作原理 section (step-by-step)
6. Add 使用场景 (4-6 items)
7. Add 注意事项 (4-6 items)

**For Utils**:

1. Update 概述 section
2. Add demo for each function
3. Update API with function signatures and parameters
4. Add 使用场景 if needed
5. Add 注意事项 if needed

### Step 5: Quality Check

Verify the documentation follows all standards:

**Common Checklist**:

- ✅ Correct structure for the type
- ✅ All demos use rspress CSS variables
- ✅ Demos show practical scenarios
- ✅ Demo titles have emoji markers
- ✅ API is complete with all properties/methods
- ✅ Type definitions are provided
- ✅ Language matches user's request

**Type-Specific Checklist**:

- **Components**: ✅ 特性说明 section, ✅ 注意事项 (8-10 items), ✅ 最佳实践 (8-10 items)
- **Hooks**: ✅ 工作原理 section, ✅ 使用场景 section
- **Modules**: ✅ 工作原理 section, ✅ 使用场景 section
- **Utils**: ✅ Each function has demo, ✅ Simple and focused

## Common Mistakes to Avoid

### 1. Wrong Tip Block for Components

**❌ Wrong**:

```markdown
# Cube 立方体

Cube 是一个3D旋转立方体组件。 ✨

:::tip 导入

import { Cube } from "@mmjg/ui-components";

:::
```

**✅ Correct**:

```markdown
# Cube 立方体

Cube 是一个3D旋转立方体组件。 ✨

:::tip 特性

- **自动旋转** 🔍：立方体自动旋转动画
- **自定义尺寸** 📏：支持自定义立方体大小

:::
```

### 2. Static Demos Instead of Practical

**❌ Wrong**:

```tsx
// Just showing static content
<PartitionLayout subContent={<div>子内容30%</div>}>
    <div>主内容</div>
</PartitionLayout>
```

**✅ Correct**:

```tsx
// Showing real file manager scenario
const FileManagerDemo = () => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <PartitionLayout
            subContent={
                showDetails && (
                    <FileDetails onClose={() => setShowDetails(false)} />
                )
            }
        >
            <FileList onFileClick={() => setShowDetails(true)} />
        </PartitionLayout>
    );
};
```

### 3. Hardcoded Colors Instead of CSS Variables

**❌ Wrong**:

```tsx
<div
    style={{
        background: "#ffffff",
        color: "#333333",
    }}
>
    Content
</div>
```

**✅ Correct**:

```tsx
<div
    style={{
        background: "var(--rp-c-bg)",
        color: "var(--rp-c-text-1)",
    }}
>
    Content
</div>
```

### 4. Missing Sections

**❌ Wrong**: Only have demo and API sections

**✅ Correct**: Include all required sections based on type:

- Components: 特性说明, 注意事项, 最佳实践
- Hooks: 工作原理, 使用场景
- Modules: 工作原理, 使用场景

## Examples

### Example 1: Updating Component Documentation

**User Request**: "Update Cube component documentation"

**Workflow**:

1. Determine type: Component → Use Component Standard
2. Read source: `packages/ui-components/src/components/Cube/index.tsx`
3. Read existing doc: `site/docs/zh/components/Cube.mdx`
4. Update documentation:
    - Update feature list in `:::tip 特性`
    - Add demos: basic usage, custom size, custom rotation, application scenario
    - Update API table with size, autoRotate, padding, rotateClassName
    - Add 特性说明: rotation control, CSS 3D, padding control
    - Add 注意事项: size settings, rotation control, performance, compatibility
    - Add 最佳实践: size recommendations, rotation control, application scenarios

### Example 2: Updating Hook Documentation

**User Request**: "Update useMockProgress hook documentation"

**Workflow**:

1. Determine type: Hook → Use Hook Standard
2. Read source: `packages/ui-components/src/hooks/useMockProgress.ts`
3. Read existing doc: `site/docs/zh/hooks/useMockProgress.mdx`
4. Update documentation:
    - Update 概述 section
    - Add demos: basic usage, custom parameters, dynamic configuration
    - Update parameter table with step, stopCondition, updateInterval
    - Add 工作原理: how progress is calculated
    - Add 使用场景: loading states, mock progress
    - Add 注意事项: parameter settings, performance

### Example 3: Updating Module Documentation

**User Request**: "Update SyncTaskQueue module documentation"

**Workflow**:

1. Determine type: Module → Use Module Standard
2. Read source: `packages/ui-components/src/modules/SyncTaskQueue.ts`
3. Read existing doc: `site/docs/zh/modules/SyncTaskQueue.mdx`
4. Update documentation:
    - Update 概述 section
    - Add special note about stream rendering
    - Add demo: typewriter effect for stream data
    - Update API with constructor, properties (event, queue, running), methods (add, run, clear)
    - Add 工作原理: task addition, auto execution, blocking execution
    - Add 使用场景: stream rendering, file upload, API requests
    - Add 注意事项: task order, error handling, memory management

## Notes

- Always use the user's language (Chinese if user writes in Chinese)
- Maintain consistency with existing documentation style
- Focus on practical, real-world usage scenarios
- Emphasize theme compatibility with rspress CSS variables
- Provide detailed explanations, not just surface-level descriptions
- Each documentation type has its own structure and requirements
- Demos must be practical and interactive, not static demonstrations
