import Lexer from "./core/lexer";
import { Parser } from "./core/parser";
import { FootnoteResolver } from "./core/resolver";
import DefaultRenderer from "./renderers/default";
import { MarkdownDefaultOptions } from "./types/options";
import { RenderOption } from "./types/options/renderOptions";
import { Node } from "./types/node"

export { RenderOption, MarkdownDefaultOptions, Node }

/**
 * Convert a Markdown string into HTML.
 * @param input - The Markdown source string
 * @param options - Optional rendering options
 * @returns The rendered HTML string
 * 
 * @example
 * ```ts
 * const html = convertMarkdownToHTML("Hello **world**")
 * // => <p>Hello <strong>world</strong></p>
 * ```
 */
export function convertMarkdownToHTML(input: string, options: MarkdownDefaultOptions = {
    renderOptions: {},
    converterOptions: { allowDangerousHtml: false }
}): string {
    const tokens = new Lexer(input).tokenize()
    const footNoteResolver = new FootnoteResolver()
    const nodes = new Parser(tokens, footNoteResolver).parse()
    return new DefaultRenderer(options, footNoteResolver).render(nodes)
}