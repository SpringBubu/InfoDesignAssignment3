export class EmojiCanvas extends HTMLElement {
    static observedAttributes = ["width", "height", "emojis", "scale", "bg"];

    constructor() {
        super();
        //this.attachShadow({ mode: 'open' });

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.append(this.canvas);
        this.redraw();
    }

    emojis() {
        return this.getAttribute("emojis")?.split(" ") ?? ["😀"];
    }

    scale() {
        return +this.getAttribute("scale") || 16;
    }

    bg() {
        return this.getAttribute("bg") || "#ddd";
    }

    attributeChangedCallback() {
        this.redraw();
    }

    redraw() {

        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const width = this.getAttribute("width") || window.innerWidth;
        const height = this.getAttribute("height") || window.innerHeight;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);


        const scale = this.scale();
        const spacing = 16;
        const cols = Math.floor(width / (scale + spacing));
        const rows = Math.floor(height / (scale + spacing));

        const emojis = this.emojis();
        console.log(emojis);
        const emoji = (i) => emojis[i % emojis.length];

        this.ctx.font = `${this.scale()}px system-ui, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji`;
        //this.ctx.textAlign = 'center';
        //this.ctx.textBaseline = 'middle';

        this.ctx.fillStyle = this.bg();
        this.ctx.fillRect(0, 0, width, height);

        const cell = scale + spacing;
        const half = cell / 2;
        let offset = 0;
        this.ctx.fillStyle = "#000";
        for (let cx = 0; cx < cols; cx++) {
            for (let cy = 0; cy < rows + 1; cy++) {
                const ty = (cy + offset) % (rows + 1);
                const x = cx * cell + half;
                const y = ty * cell;
                const e = emoji(Math.abs(cy) + Math.abs(cx));

                /* this.ctx.fillStyle = "#fff"
                const r = Math.min(scale * 0.6, (scale + spacing - 0) / 2);
                this.ctx.beginPath();
                this.ctx.arc(x, y, r, 0, Math.PI * 2);
                this.ctx.fill(); */

                const m = this.ctx.measureText(e);
                const offsetX = ((m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || 0)) / 2;
                const offsetY = ((m.actualBoundingBoxAscent || 0) + (m.actualBoundingBoxDescent || 0)) / 2;

                this.ctx.fillText(e, x - offsetX, y - offsetY);
            }
            offset += 0.067;
        }
    }
}
