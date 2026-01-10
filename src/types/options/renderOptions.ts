import { ASTNode } from '../parser';

/**
 * A strategy function type for rendering a specific AST node.
 * @template TOutput - The resulting type after rendered.
 * @template TNode - The specific `ASTNode` processed.
 * 
 * @param node - The `ASTNode` object containing its properties.
 * @param children - An array of already rendered `TOutput` of this node's childrens.
 * @returns The rendered result for the given node.
 * 
 * @since v.1.2.0 - Introduced `GenericNodeRenderer` for defining `RenderElement`
 */
type GenericNodeRenderer<TOutput, TNode extends ASTNode = ASTNode> =
    (node: TNode, children: TOutput[]) => TOutput;


/**
 * A mapping of `ASTNode` types to their coressponding rendering functions.
 * @template TOutput - The target output type of the renderer.
 */
export type GenericRenderElements<TOutput> = {
    //For known AST nodes
    [K in ASTNode["type"]]?: GenericNodeRenderer<TOutput, ASTNode>
} & {
    //Custom nodes or extensions
    [key: string]: GenericNodeRenderer<TOutput, any> | undefined
}


/**
 * Options for customizing the rendering process for a specific output type.
 * @template TOutput - The output type.
 */
export interface RenderOption<TOutput> {
    elements?: GenericRenderElements<TOutput>
}


/**
 * An utilities type alias for render `ASTNode` to `HTML string`
 * Equivalent to `GenericRenderElements<string>`.
 * @alias DefaultRenderElements
 */
export type DefaultRenderElements = GenericRenderElements<string>;


/**
 * An utilities type alias for render `ASTNode` to `React.ReactNode`
 * Equivalent to `GenericRenderElements<React.ReactNode>`.
 * @alias ReactRenderElements
 */
export type ReactRenderElements = GenericRenderElements<React.ReactNode>;



/**
 * Options to customize how AST nodes are renderes into HTML
 * @deprecated Use {@link RenderOption<string>} for generic support.
 * 
 * @property elements - Optional custom rendered for one or more node types
 * @example
 * ```ts
 * const renderOptions: RenderOption = {
 *   elements: {
 *     Paragraph: (_node, children) => `<div class="paragraph">${children.join("")}</div>`,
 *     Bold: (_node, children) => `<b class="bold-text">${children.join("")}</b>`,
 *   }
 * }
 * ```
 * 
 */
export type DefaultRenderOption = {
    elements?: DefaultRenderElements
}


/**
 * Options to customize how AST nodes are renderes into ReactNode elements
 * @deprecated Use {@link RenderOption<React.ReactNode>} for generic support.
 * 
 * @property elements - Optional custom rendered for one or more node types
 * @example
 * ```tsx
 * // Using JSX (Recommended for most users)
 * const renderOptions: ReactRenderOption = {
 *  elements: {
 *    Paragraph: (_node, children) => <p className="paragraph">{children}</p>,
 *    Bold: (_node, children) => <strong className="bold-text">{children}</strong>,
 *  }
 * }
 * // Or using React.createElement (Common in library core or without JSX)
 * const renderOptions: ReactRenderOption = {
 *  elements: {
 *    Bold: (_node, children) => React.createElement("b", { className: "bold" }, ...children),
 *   }
 * }
 * ```
 */
export type ReactRenderOption = {
    elements?: ReactRenderElements
}