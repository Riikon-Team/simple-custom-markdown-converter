import { Node } from "../node"

/**
 * Function type for rendering an AST node to a ReactNode.
 * 
 * @template T - A subtype of `Node` corresponding to the render node
 * @param node - The AST node to render
 * @param children - An array of rendered `ReactNode` from the node's children
 * @returns A `React.ReactNode` representation of the node
 */
type ReactNodeRenderer<T extends Node = Node> = (node: T, children: React.ReactNode[]) => React.ReactNode

/**
 * A mapping of AST node types to custom render functions.
 * 
 * - The key is a `Node["type"]` string literal (e.g. `"Header"`, `"Paragraph"`)
 * - The value is a function `ReactNodeRenderer` function:
 *      - `node` is a `Node` with its attribute depending on its `type`.
 *      (e.g. `"Header"` nodes include `level`, `"CodeBlock"` nodes include `lang` and `content`, etc)
 *      - `children` is the array of rendered `ReactNode` of its children.
 */
export type ReactRenderElements = {
    [K in Node["type"]]?: ReactNodeRenderer<Extract<Node, { type: K }>>
}

/**
 * Options to customize how AST nodes are renderes into ReactNode elements
 * 
 * @property elements - Optional custom rendered for one or more node types
 * 
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