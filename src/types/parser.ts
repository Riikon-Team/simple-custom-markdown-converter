import { IParser } from '../core/parser/index'
import { Token } from './token';

//TODO: remove the contains part in each variants
/**
 * AST (Abstract Syntax Tree) node definition.
 * 
 * Each node represents a Markdown construct and some special nodes (Document, Paragraph).
 * Some nodes are containers (have `children`), while others are leaf nodes (contain text).
 * 
 * Variants:
 * - Document: Root node, contains all other nodes.
 * - Paragraph: A block of text, contain inline nodes.
 * - Header: A header with given `level` (1-6)
 * - Bold: Bold text
 * - Italic: Italic text
 * - Strikethrough: Strilethrough text
 * - InlineCode: Inline code snippet, with it's `content`
 * - Quote: A quote block
 * - CodeBlock: A code block, with it's `lang` and `content`
 * - List: A list, with it's level and children
 * - ListItem: An item of a list, with it's children
 * - TaskItem: An item for tasklist, with it's checked state
 * - Link: A link, with it's `text` and `href`
 * - Image: An image, with it's `src` and `alt`
 * - HorizontalLine: A horizontal line
 * - Text: Raw text content.
 * - Table: A table, with it's rows
 * - HTMLBlock: A HTML block element, with it's `value`
 * - HTMLInline: An inline HTML element, with it's `value`
 * - FootnoteRef: A refernce with it's `id`
 * 
 * {@link ASTNode} for each variant's attribute listed detail
 */
export type DefaultNodeType =
    | "Document"
    | "Paragraph"
    | "Header"
    | "Bold"
    | "Italic"
    | "Strikethrough"
    | "InlineCode"
    | "CodeBlock"
    | "Quote"
    | "List"
    | "ListItem"
    | "TaskItem"
    | "Link"
    | "Image"
    | "HorizontalLine"
    | "Text"
    | "Table"
    | "HTMLBlock"
    | "HTMLInline"
    | "FootnoteRef";

export type NodeType = DefaultNodeType | (string & {})

//Subtype for Table
//Represent a Table's cell with its align and children ASTNode
export interface TableCell {
    align: "left" | "center" | "right";
    children: ASTNode[];
}
//Represent a Table's row with its cells for table's header and body
export interface TableRow {
    isHeader: boolean;
    cells: TableCell[];
}


/**
 * AST (Abstract Syntax Tree) node definition. It representing all possible Markdown constructs and its possible properties. 
 * 
 * Use the `type` property to determine which other properties are available.
 */
export interface ASTNode {
    /**
     * The type of the node, determining its structure and purpose.
     * @see {@link DefaultNodeType} for standard types.
     */
    type: NodeType;

    /**
     * Nested nodes within this container.
     * Applicable for: `Document`, `Paragraph`, `Header`, `Bold`, `Italic`, `Strikethrough`, `Quote`, `List`, `ListItem`, `TaskItem`.
     */
    children?: ASTNode[];

    /**
     * Raw string content.
     * Applicable for: `Text` (the plain text), `HTMLBlock` & `HTMLInline` (the raw HTML code).
     */
    value?: string;

    /**
     * The internal content of a code element.
     * Applicable for: `InlineCode`, `CodeBlock`.
     */
    content?: string;

    /**
     * The level of importance/depth.
     * Applicable for: `Header` (1-6).
     */
    level?: number;

    /**
     * Programming language identifier for syntax highlighting.
     * Applicable for: `CodeBlock` (e.g., "javascript", "python").
     */
    lang?: string;

    /**
     * URL or path for external resources.
     * Applicable for: `Link` (destination), `Image` (source).
     */
    href?: string;

    /**
     * The clickable text label for a link.
     * Applicable for: `Link`.
     */
    text?: string;

    /**
     * Source URL of an image.
     * Applicable for: `Image`.
     */
    src?: string;

    /**
     * Alternative text for accessibility.
     * Applicable for: `Image`.
     */
    alt?: string;

    /**
     * Indicates if a list is numbered (true) or bulleted (false).
     * Applicable for: `List`.
     */
    ordered?: boolean;

    /**
     * The completion status of a task.
     * Applicable for: `TaskItem`.
     */
    checked?: boolean;

    /**
     * Array of rows defining the table structure.
     * Applicable for: `Table`.
     */
    rows?: TableRow[];

    /**
     * Unique identifier for referencing.
     * Applicable for: `FootnoteRef`.
     */
    id?: string;

    /**
     * Allows custom properties for extensions or plugin-specific data.
     */
    [key: string]: any;
}

/**
 * A Strategy pattern for handle parsing process for each Token.
 * @property type - Strategy's type
 * @property execute - A function handle parsing a `Token` to `ASTNode`
 */
export interface ParsingStrategy {
    type: string,
    execute: (parser: IParser, token: Token) => ASTNode | ASTNode[] | void;
}

