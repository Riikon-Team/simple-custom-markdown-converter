# Simple Customize Markdown Converter
This simple library help you convert Markdown to HTML and customize it.

## Feature
This library currently supports the most common Markdown syntaxes:
- Headings (`#, ##, …`)
- Paragraphs
- Bold (`\*\*text\*\*`)
- Italic (`\*text\* or \_text\_`)
- Strikethrough (`\~\~text\~\~`)
- Inline code (`\`code\``)
- Code blocks (`\`\`\`lang ... \`\`\``)
- Quotes (`> text`)
- Lists (`- Item 1,...`)
- Tasklists (`- [ ], - \[x\]`)
- Links (`\[link\]\(url\)`)
- Images (`\[alt\]\(url\)`)
- Horizontal lines (`---` or `***` or `___`)
- Tables

And customizable renderer for all elements

## Install
```bash
npm install simple-customize-markdown-converter
```

## Usage
### 1. Standard HTML
```js
const input = `
# Hello World
This is **bold** and *italic*
`
console.log(convertMarkdownToHTML(input))
```
Output:
```html
<h1>Hello World</h1>
<p>This is <strong>bold</strong> and <em>italic</em></p>
```

### 2. ReactJS Integration (v1.1.0+)
Render Markdown directly as ReactJS elements.

#### Using the provided component
```tsx
import { MarkdownComponent } from 'simple-customize-markdown-converter/react';

function App() {
  return (
    <MarkdownComponent 
      content="# Hello React" 
      className="md-body"
      options={{ converterOptions: { allowDangerousHtml: false } }}
    />
  );
}
```

#### Using the render function
```tsx
import { convertMarkdownToReactNode } from 'simple-customize-markdown-converter/react';

const node = convertMarkdownToReactNode("## Subtitle");
return <div>{node}</div>;
```
## Customization

#### 1. Customize your HTML converter
You can also customize which HTML should be rendered which every commmon Markdown syntax.

For example: change `<h1>` to `<h5>`, wrap paragraphs in `<div>`, or style bold text:
```ts
const options: MarkdownDefaultOptions = {
  renderOptions: {
    elements: {
      Header: (node, children) => {
          //Customize for only Heading 1
          if (node.level === 1) {
              return `<h5 class="custom-h1">${children.join("")}</h5>`
          }
          //Keep all remain Heading
          return `<h${node.level}>${children.join("")}</h${node.level}>`
      },
      Paragraph: (_node, children) => `<div class="paragraph">${children.join("")}</div>`,
      Bold: (_node, children) => `<b class="bold-text">${children.join("")}</b>`,
    }
  },
  converterOptions: { allowDangerousHtml: false }
}

const input = `
# Title
Hello **World**
`

console.log(convertMarkdownToHTML(input, MarkdownDefaultOptions))
```

Output:
```html
<h5 class="custom-h1">Title</h5>
<div class="paragraph">Hello <b class="bold-text">World</b></div>
```

#### 2. Customize React Elements
You can override default elements using `MarkdownReactOptions`.
```tsx
import { MarkdownReactOptions } from 'simple-customize-markdown-converter';

const options: MarkdownReactOptions = {
  renderOptions: {
    elements: {
      // Custom Blue Bold text
      Bold: (_node, children) => <strong style={{ color: 'blue' }}>{children}</strong>,
      // Custom Link behavior (e.g., for Mentions)
      Link: (node) => {
        if (node.href.startsWith('@')) {
            return <button className="mention">{node.text}</button>;
        }
        return <a href={node.href}>{node.text}</a>;
      }
    }
  }
};
```

#### 3. Customize className (v1.2.1+)
You can custom CSS class name for each elements
- For HTML
```ts
const renderOptions: RenderOption<string> = {
  className: {
    Header: "common-h",
    Header1: "main-title",
    Paragraph: "text-muted"
  }
};

const md = "# Title\nParagraph content";
const result = convertMarkdownToHTML(md, { renderOptions });
```

Output:
```html
<h1 class="main-title" style="border-bottom: 1px solid #d1d9e0b3">Title</h1>
<p class="text-muted">Paragraph content</p>
```

- For ReactJS
```ts
import { MarkdownComponent } from 'simple-customize-markdown-converter/react';

const options: MarkdownOptions<React.ReactNode> = {
  renderOptions: {
    className: {
      Header: "h-common",
      Header2: "h2-special",
      Bold: "font-heavy"
    }
  }
};

function App() {
  return (
    <MarkdownComponent 
      content="# Hello React" 
      className="md-body"
      options
    />
  );
}

```

## Plugin (v1.3.0+)
You can create a plugin to define custom sytax rule handler
- With default converter
```ts
import { DefaultMarkdownConverter } from 'simple-customize-markdown-converter';

const emojiPlugin = createPlugin<string, React.ReactNode>(
  "Emoji",
  "inline",
  {
      match: (lexer) => lexer.peek() === ":",
      emit: (lexer) => {
        lexer.next();
        const value = lexer.readUntil(":");
        lexer.listToken.push({ type: "Emoji", value });
      }
  },
  {
    execute: (parser, token) => {
      parser.next(1);
      return { type: "Emoji", value: token.value };
    }
  },
  {
    render: (node) => React.createElement(
      "span",
      { className: `emoji emoji-${node.value}` },
      "😲"
    )
  }
);

const converter = new DefaultMarkdownConverter({}, plugin).convert(input)
```

- With React converter
```tsx
import { MarkdownComponent } from 'simple-customize-markdown-converter/react';

function App() {
  const emojiPlugin = createPlugin<string, React.ReactNode>(
    "Emoji",
    "inline",
    {
        match: (lexer) => lexer.peek() === ":",
          emit: (lexer) => {
            lexer.next();
            const value = lexer.readUntil(":");
            lexer.listToken.push({ type: "Emoji", value });
          }
    },
    {
      execute: (parser, token) => {
        parser.next(1);
        return { type: "Emoji", value: token.value };
      }
    },
    {
      render: (node) => React.createElement(
        "span",
        { className: `emoji emoji-${node.value}` },
        "😲"
      )
    }
  );

  return (
    <MarkdownComponent 
      content="Hello :omg: world"
      className="md-body"
      options=options
      plugin=[emojiPlugin]
    />
  );
}
```


## Security
By default, HTML tags in Markdown are escaped. To allow raw HTML, explicitly set `allowDangerousHtml: true` in `converterOptions`. Be sure only **enable** this for **trusted** content.

**Note**: Upgrade to `React v19.2.0` or later when using `React 19` for security reason.