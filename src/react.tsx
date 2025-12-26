import React from "react";
import { ReactRenderOption } from "./types/options/reactRenderOptions";
import Lexer from "./core/lexer";
import { FootnoteResolver } from "./core/resolver";
import { Parser } from "./core/parser";
import ReactRenderer from "./renderers/react";
import { MarkdownReactOptions } from "./types/options";

/**
 * Convert a Markdown string into a ReactNode.
 * @param input - The Markdown source string
 * @param renderOptions - Optional rendering options
 * @param options - Optional handle options
 * @returns The rendered HTML string
 * 
 * @example
 * ```ts
 * const html = convertMarkdownToHTML("Hello **world**")
 * // => <p>Hello <strong>world</strong></p>
 * ```
 */
export function convertMarkdownToReactNode(
    input: string,
    options: MarkdownReactOptions = {
        renderOptions: {},
        converterOptions: { allowDangerousHtml: false }
    }): React.ReactNode {
    const tokens = new Lexer(input).tokenize()
    const footNoteResolver = new FootnoteResolver()
    const nodes = new Parser(tokens, footNoteResolver).parse()
    return new ReactRenderer(footNoteResolver, options).render(nodes)
}

export const MarkdownComponent: React.FC<{
    content: string,
    options: MarkdownReactOptions
    className?: string
}> = ({ content, className, options }) => {
    const rendered = React.useMemo(() => {
        return convertMarkdownToReactNode(content, options)
    }, [content, options])

    return React.createElement("div", { className }, rendered)
}