// typings/json.d.ts
declare module "*.json" {
    const value: any;
    export default value;
}

// ----- img -----
declare module "*.svg" {
    const content: string;
    export default content;
}

declare module "*.png" {
    const content: string;
    export default content;
}

declare module "*.gif" {
    const content: string;
    export default content;
}

// 匹配 *.module.less
declare module '*.module.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}