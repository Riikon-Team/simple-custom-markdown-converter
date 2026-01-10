import { IRenderer } from "../renderers";
import { ASTNode, NodeType } from "../types/parser";

export function escapeHtml(str: string) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function getClassName<TOutput>(renderer: IRenderer<TOutput>, node: ASTNode, defaultClass: string = ""): string | undefined {
    const { type, level } = node;
    const classNames = renderer.options.renderOptions?.className;

    if (!classNames) return defaultClass || undefined;

    if (type === "Header" && level) {
        const levelClass = classNames[`Header${level}` as NodeType];
        if (levelClass) return `${defaultClass} ${levelClass}`.trim();
    }

    const typeClass = classNames[type];
    return [defaultClass, typeClass].filter(Boolean).join(" ") || undefined;
}