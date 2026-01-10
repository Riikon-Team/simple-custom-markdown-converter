import { IRenderer } from "../renderers"
import { ASTNode } from "./parser"

/**
 * A Strategy pattern for handle parsing process for each ASTNode.
 * @template TOutput - Output result after rendered by `render` property.
 * @property type - Strategy's type
 * @property execute - A function handle rendering a `ASTNode` to `TOutput`
 */
export interface RenderStrategy<TOutput> {
    type: string
    render: (node: ASTNode, children: TOutput[], context: IRenderer<TOutput>) => TOutput
}