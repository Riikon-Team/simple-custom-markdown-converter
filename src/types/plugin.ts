import { TokenizerStrategy } from "./token";
import { NodeType, ParsingStrategy } from "./parser"
import { RenderStrategy } from "./renderer";

/**
 * Representing a custom plugin for the Markdown converter.
 * It allow to define new syntax by hooking into the `Lexing`, `Parsing` and `Rendering` stages.
 * @template TOutput - The type of final rendered output
 */
export interface MarkdownPlugin<T extends string, TOutput> {
    /**
     * Unique identifier for the plugin
     */
    name: T
    /**
     * Define the context of plugin
     */
    type: "block" | "inline"
    /**
     * Strategy for the Lexer.
     * The `type` property of this property must be same as `name` property
     */
    tokenizer: TokenizerStrategy & { type: T },
    /**
     * Strategy for the Parser.
     * The `type` property of this property must be same as `name` property
     */
    parser: ParsingStrategy & { type: T }
    /**
     * Strategy for the Renderer.
     * The `type` property of this property must be same as `name` property
     */
    renderer: RenderStrategy<TOutput> & { type: T }
}

/**
 * A helper function to create a plugin
 * @template T - The literal string type for the plugin name.
 * @template TOutput - The output type.
 * @param name - Name of plugin
 * @param type - Context of plugin, determine for parser processing
 * @param tokenizer - Tokenizer strategy for Lexer
 * @param parser - Parser strategy for Parser
 * @param renderer - Render strategy for Renderer
 * @returns - A complete Markdown plugin
 */
export function createPlugin<T extends string, TOutput>(
    name: T,
    type: "block" | "inline",
    tokenizer: Omit<TokenizerStrategy, "type">,
    parser: Omit<ParsingStrategy, "type">,
    renderer: Omit<RenderStrategy<TOutput>, "type">
): MarkdownPlugin<T, TOutput> {
    const finalTokenizer = Object.assign(tokenizer, { type: name }) as TokenizerStrategy & { type: T }
    const finalParser = Object.assign(parser, { type: name }) as ParsingStrategy & { type: T }
    const finalRenderer = Object.assign(renderer, { type: name }) as RenderStrategy<TOutput> & { type: T }

    return {
        name,
        type,
        tokenizer: finalTokenizer,
        parser: finalParser,
        renderer: finalRenderer
    }
}