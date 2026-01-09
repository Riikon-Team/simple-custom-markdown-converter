import Lexer, { ILexer } from "../core/lexer"
import { Token } from "../types/token"

function handleTextBlock(lex: ILexer) {
    const currentChar = lex.peek()
    if (currentChar === null) return
    const lastToken = lex.getLastToken()

    if (lastToken?.type === "Text") lastToken.value += currentChar
    else lex.listToken.push({ type: "Text", value: currentChar })
}

function handleHtmlBlock(lex: ILexer) {
    const openTag = lex.readUntil(">", true) + ">"
    const matchTagName = /^<\s*([a-zA-Z0-9]+)/.exec(openTag)
    const tagName = matchTagName ? matchTagName[1] : null
    //Tagname is not valid
    if (!tagName) {
        lex.listToken.push({ type: "Text", value: "<" })
        return
    }

    //If it's self-closing tag
    if (openTag.endsWith("/>") || ["hr", "img", "br", "input", "meta", "link"].includes(tagName)) {
        lex.listToken.push({ type: "HTMLBlock", value: openTag })
        return
    }

    let content = ""
    while (!lex.isEndOfFile()) {
        if (lex.peekUntilByOffset(`</${tagName}>`.length).toLowerCase() === `</${tagName}>`) {
            break
        }
        content += lex.peek()
        lex.next()
    }
    const closeTag = `</${tagName}>`
    lex.next(closeTag.length - 1)  //Skip closing tag
    lex.listToken.push({ type: "HTMLBlock", value: openTag + content + closeTag })
}

function handleHtmlInline(lex: ILexer) {
    const openTag = lex.readUntil(">", true) + ">"
    const matchTagName = /^<\s*([a-zA-Z0-9]+)/.exec(openTag)
    const tagName = matchTagName ? matchTagName[1] : null
    if (!tagName) {
        lex.listToken.push({ type: "Text", value: "<" })
        return
    }

    const content = lex.readUntilMatchString(`</${tagName}>`, false)
    const closeTag = `</${tagName}>`
    lex.next(closeTag.length - 1)  //Skip closing tag
    lex.listToken.push({ type: "HTMLInline", value: openTag + content + closeTag });
}


//Task and List utilities
function handleList(lex: ILexer, isOrdered: boolean, isTask: boolean) {
    const line = lex.peekUntil("\n")
    if (isTask) {
        const m = line.match(/^(\s*)([-*+]) \[( |x|X)\] (.*)$/)!
        const indent = Math.floor(m[1].length / 2) + 1
        while (lex.listLevelFlag < indent) handleStartList(lex, false)
        while (lex.listLevelFlag > indent) handleEndList(lex)

        lex.next(m[1].length + 4)
        handleTaskItem(lex, m[3].toLowerCase() === "x")
    }
    else {
        //Regex: line started with: Group 1: zero or more spaces, group 2: (- or + or * + 1 space) or (number with . character), group 3: everything else in line
        const m = isOrdered ? line.match(/^(\s*)(\d+)\. (.*)$/)! : line.match(/^(\s*)([-*+]) (.*)$/)!
        const indent = Math.floor(m[1].length / 2) + 1  //m[1] to get the spaces in group 1
        while (lex.listLevelFlag < indent) handleStartList(lex, isOrdered)
        while (lex.listLevelFlag > indent) handleEndList(lex)

        lex.next(m[1].length + (isOrdered ? 1 : 0)) //+1 due to marker have 2 characters (e.g: 1.) instead 1 like unordered list
        handleListItem(lex)
    }
}

function handleStartList(lex: ILexer, isOrder: boolean) {
    lex.listLevelFlag++
    lex.listToken.push({ type: "ListStart", level: lex.listLevelFlag, ordered: isOrder })
}

function handleListItem(lex: ILexer,) {
    lex.next() // Skip space between - and text
    lex.listToken.push({ type: "ListItem" })
}

function handleTaskItem(lex: ILexer, isChecked: boolean) {
    lex.next() // Skip space between last ] and text
    lex.listToken.push({ type: "TaskItem", checked: isChecked })
}

function handleEndList(lex: ILexer) {
    lex.listLevelFlag === 0 ? 0 : lex.listLevelFlag--
    lex.listToken.push({ type: "ListEnd" })
}


//Table utilities
function handleTable(lex: ILexer): void {
    const tokenizeResult: Token[] = []
    const handler = new Lexer("")
    const header = lex.readUntil("\n", true)
    const headerDetails = header.trim().replace(/^ *\|/, "").replace(/\| *$/, "").split("|")
    const align = lex.readUntil("\n", true)
    const alignDetails = align.trim().replace(/^ *\|/, "").replace(/\| *$/, "").split("|")
    if (alignDetails.length !== headerDetails.length || !alignDetails.every(c => /^:?-{3,}:?$/.test(c))) {
        lex.listToken.push({ type: "Text", value: `${header}\n${align}\n` })
        return
    }
    else {
        //Handle alignment
        const normalizeAlign = alignDetails.map(value => {
            if (value.startsWith(":") && value.endsWith(":")) return "center"
            else if (value.endsWith(":")) return "right"
            else return "left"
        })

        tokenizeResult.push({ type: "TableStart" })
        //Handle header
        tokenizeResult.push({ type: "RowStart", isHeader: true })
        headerDetails.forEach((cell, index) => {
            tokenizeResult.push({ type: "CellStart", align: normalizeAlign[index] ?? "left" })
            handler.setInput(cell.trim())
            tokenizeResult.push(...handler.tokenize(false))
            tokenizeResult.push({ type: "CellEnd" })
        })
        tokenizeResult.push({ type: "RowEnd" })

        //Handle body
        while (!lex.isEndOfFile()) {
            const body = lex.readUntil("\n", true)
            if (!body) break
            const line = body.trim()
            if (!line.startsWith("|") || !line.endsWith("|")) break //End of table
            const bodyDetail = body.trim().replace(/^ *\|/, "").replace(/\| *$/, "").split("|")
            tokenizeResult.push({ type: "RowStart", isHeader: false })
            bodyDetail.forEach((cell, index) => {
                tokenizeResult.push({ type: "CellStart", align: normalizeAlign[index] ?? "left" })
                handler.setInput(cell.trim())
                tokenizeResult.push(...handler.tokenize(false))
                tokenizeResult.push({ type: "CellEnd" })
            })
            tokenizeResult.push({ type: "RowEnd" })
        }
        tokenizeResult.push({ type: "TableEnd" })
        lex.listToken.push(...tokenizeResult)
    }
}

export {
    handleEndList,
    handleHtmlBlock,
    handleHtmlInline,
    handleList,
    handleListItem,
    handleStartList,
    handleTable,
    handleTaskItem,
    handleTextBlock,
}