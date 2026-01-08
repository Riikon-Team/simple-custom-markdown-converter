import { IParser } from '../core/parser/index'
import { Token } from './token';

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
export interface TableCell {
    align: "left" | "center" | "right";
    children: ASTNode[];
}

export interface TableRow {
    isHeader: boolean;
    cells: TableCell[];
}

export interface ASTNode {
    type: NodeType,
    //Default payload for default ASTNode
    children?: ASTNode[];
    value?: string;
    content?: string;
    level?: number;
    lang?: string;
    href?: string;
    text?: string;
    src?: string;
    alt?: string;
    ordered?: boolean;
    checked?: boolean;
    rows?: TableRow[];
    id?: string;
    //Extends payload
    [key: string]: any
}

export interface ParsingStrategy {
    type: string,
    execute: (parser: IParser, token: Token) => ASTNode | ASTNode[] | void;
}

