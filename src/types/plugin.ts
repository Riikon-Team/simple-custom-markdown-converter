import { TokenizerStrategy } from "./token";
import { NodeType, ParsingStrategy } from "./parser"
import { RenderStrategy } from "./renderer";

export interface MarkdownPlugin<TOutput> {
    name: string
    type: "block" | "inline"
    tokenizer: TokenizerStrategy,
    parser: ParsingStrategy
    renderer: RenderStrategy<TOutput>
}

export function createPlugin<TOutput>(name: string, type: "block" | "inline", tokenizer: TokenizerStrategy, parser: ParsingStrategy, renderer: RenderStrategy<TOutput>): MarkdownPlugin<TOutput> {
    return {
        name,
        type,
        tokenizer,
        parser,
        renderer
    }
}