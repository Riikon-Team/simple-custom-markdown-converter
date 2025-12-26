export abstract class Renderer {
    protected allowDangerousHtml: boolean

    constructor(allowDangerousHtml = false) {
        this.allowDangerousHtml = allowDangerousHtml
    }
}