# The Austrian Diet — design system

## Positioning

- **Narrative role:** an epistemological hook followed by four evidence chapters and a synthesis.
- **Viewing distance:** designed first for a laptop and classroom projector during a five-minute live demonstration; fully usable on mobile.
- **Visual temperature:** authoritative and editorial, with enough warmth to keep food and public health human.
- **Capacity:** large chapter openings establish one idea at a time; visualization stages reserve space for exploration without competing copy.

## Design decisions

- **Anchor:** a custom editorial data atlas informed by modern information design and Austrian print culture.
- **Palette:** parchment (`#f3efe3`), warm ink (`#191713`), and Austrian red (`#c33a2c`). Gold, land green, and water blue are reserved for semantic data encodings.
- **Typography:** Newsreader for narrative display type and Outfit for interface, body, and data labels. Numeric labels use tabular figures.
- **Spacing:** an 8 px base rhythm with fluid page gutters and a 1280 px narrative container.
- **Radius:** square editorial frames and 2 px control corners; circular geometry appears only as a recurring data-orbit motif.
- **Shadow:** sparse, warm-tinted elevation only where a visualization needs to separate from the page.
- **Motion:** 180–240 ms interaction feedback and 680 ms editorial reveals using `cubic-bezier(0.22, 1, 0.36, 1)`. Reduced-motion preferences are respected.

## Narrative map

1. Epistemological hook
2. Production versus consumption
3. Cheese and ecological cost
4. Multidimensional environmental footprint
5. Nutritional biochemistry network
6. Synthesis and sources

## Assignment constraints

- Preserve at least four distinct D3 visualization components.
- Preserve sorting, reveal/toggle, filtering, zooming, panning, hovering, and node manipulation.
- Keep at least six narrative views for a three-person group.
- Remain a standalone web application with `index.html` as its entry point.
- Keep source attribution visible and make the experience suitable for a five-minute live demonstration.
- Document AI-assisted implementation separately before submission, as required by the course brief.
