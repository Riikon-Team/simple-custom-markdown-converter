import { IParser } from "../core/parser"
import { ASTNode } from "../types/parser"

function parseList(parser: IParser): ASTNode {
    const tok = parser.peek(0)
    if (tok?.type === "ListStart") {
        parser.next(1) //skip marker
        const result: ASTNode = {
            type: "List",
            level: tok.level,
            ordered: tok.ordered,
            children: [],
        }
        let nextToken = parser.peek(0)
        while (!parser.isEnd()) {
            if (nextToken?.type === "ListItem" || nextToken?.type === "TaskItem") {
                result.children?.push(parseListItem(parser))
                nextToken = parser.peek(0)
            }
            else if (nextToken?.type === "ListEnd") {
                parser.next(1)
                break
            }
            else break
        }

        return result
    }
    //Temp return
    return {
        type: "Text",
        value: ""
    }
}

function parseListItem(parser: IParser): ASTNode {
    const currentToken = parser.peek(0)
    parser.next(1) // skip marker   
    const children: ASTNode[] = []
    while (!parser.isEnd()) {
        const tok = parser.peek(0)
        if (!tok) break

        if (tok.type === "NewLine") {
            parser.next(1)
            continue
        }

        if (tok.type === "ListStart") {
            children.push(parseList(parser))
            continue
        }

        if (["ListItem", "TaskItem", "ListEnd"].includes(tok.type)) {
            break
        }

        children.push(...parser.parseInlineUntil("NewLine", true))
    }

    return currentToken?.type === "TaskItem" ? {
        type: "TaskItem",
        checked: currentToken.type === "TaskItem" ? currentToken.checked : false,
        children: children
    } : {
        type: "ListItem",
        children: children
    }
}

export {
    parseList,
    parseListItem
}