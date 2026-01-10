import Lexer from "./core/lexer"
import { Parser } from "./core/parser"
import { FootnoteResolver } from "./core/resolver/footnote-resolver"
import { DefaultRenderer } from "./renderers/default"
import { MarkdownOptions } from "./types/options"
import { Token, TokenizerStrategy } from './types/token'
import { ASTNode, ParsingStrategy } from './types/parser'
import { RenderStrategy } from './types/renderer'

export {
    MarkdownOptions,
    Token, TokenizerStrategy,
    ASTNode, ParsingStrategy,
    RenderStrategy
}

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
export function convertMarkdownToHTML(input: string, options: MarkdownOptions<string> = {
    renderOptions: {},
    converterOptions: { allowDangerousHtml: false }
}): string {
    const tokens = new Lexer(input).tokenize()
    const footNoteResolver = new FootnoteResolver()
    const nodes = new Parser(tokens, footNoteResolver).parse()
    return new DefaultRenderer(footNoteResolver, options).render(nodes)
}