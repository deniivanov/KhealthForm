# H3ALTH animated header logo

One self-contained file: h3alth-logo.js (images embedded, no other assets needed).

## Install
1. Copy h3alth-logo.js into your site.
2. Load it once, anywhere: <script src="/path/h3alth-logo.js"></script>
3. Place the logo:   <h3alth-logo mode="both" height="48" idle-every="6"></h3alth-logo>
   Usually inside your home link: <a href="/"><h3alth-logo ...></h3alth-logo></a>

## Attributes
- mode: "hover" = replay build on pointer | "idle" = only the diamond spins occasionally | "both" (default) | "none" = static
- height: logo height in px (default 48; width follows automatically)
- idle-every: seconds between idle spins (default 6)

Works in plain HTML, React (as a normal custom element), Vue, etc. Open demo.html to see it in a sample header.
