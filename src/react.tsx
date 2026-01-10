import React from "react"
import Lexer from "./core/lexer"
import { Parser } from "./core/parser"
import { FootnoteResolver } from "./core/resolver/footnote-resolver"
import { ReactRenderer } from "./renderers/react"
import { MarkdownOptions } from "./types/options"

/**
 * Convert a Markdown string into a ReactNode.
 * @param input - The Markdown source string
 * @param renderOptions - Optional rendering options
 * @param options - Optional handle options
 * @returns The rendered `React.ReactNode` ready to be rendered into a React component.
 * 
 * @example
 * ```tsx
 * const node = convertMarkdownToReactNode("## Hello React");
 * return <div>{node}</div>;
 * ```
 */
export function convertMarkdownToReactNode(
    input: string,
    options: MarkdownOptions<React.ReactNode> = {
        renderOptions: {},
        converterOptions: { allowDangerousHtml: false }
    }): React.ReactNode {
    const tokens = new Lexer(input).tokenize()
    const footNoteResolver = new FootnoteResolver()
    const nodes = new Parser(tokens, footNoteResolver).parse()
    return new ReactRenderer(footNoteResolver, options).render(nodes)
}

/**
 * A React commponent that renders Markdown content.
 * Using `React.useMemo` to ensure performance and prevent unnecessary re-render.
 * @param props.content - The Markdown source to render.
 * @param props.options - Optional configuration for the renderer. 
 * @param props.className - Optional CSS classes for the wrapping `div` element.
 * @example
 * ```tsx
 * <MarkdownComponent
 *    content="**Bold text here**"
 *    className="markdown markdown-rendered"
 *    options={{ converterOptions: { allowDangerousHtml: true } }}
 * />
 * ```
 */
export const MarkdownComponent: React.FC<{
    content: string,
    options?: MarkdownOptions<React.ReactNode>
    className?: string
}> = ({ content, className, options }) => {
    const rendered = React.useMemo(() => {
        return convertMarkdownToReactNode(content, options)
    }, [content])

    return React.createElement("div", { className }, rendered)
}