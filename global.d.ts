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

declare module "*.module.scss";