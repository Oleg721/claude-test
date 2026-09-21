---
name: 3d-force-graph
description: Build and customize interactive 3D graph visualizations with the vanilla-JS `3d-force-graph` library (ThreeJS / WebGL, d3-force-3d). Use this skill whenever the user wants to create, edit, style, or debug a 3D network/graph visualization using `ForceGraph3D`, even if they just say "add a node", "change link color", "highlight on hover", "add arrows", "emit particles", "curve the links", "load graph from JSON", "make nodes clickable", or reference `3d-force-graph` / `ForceGraph3D` / files in a `3d-force-graph` project. Also triggers on requests about DAG layouts, custom node geometries (spheres, text, images, HTML), camera control, force tuning, or any `<example>/index.html` file that imports `3d-force-graph`.
---

# 3d-force-graph (vanilla JS)

`3d-force-graph` renders a force-directed graph in a 3D WebGL canvas. It is a chainable web component: instantiate once, then call setter methods to configure data, styling, interaction, and physics.

This skill focuses on **vanilla JS / HTML** usage (script tag or ES module). For React, the user should use `react-force-graph` instead.

## When to read the reference files

`SKILL.md` covers 80% of tasks. Reach for `references/` when the request needs detail beyond what's here:

- **references/api.md** — complete method reference (every setter, every default). Consult when you need to look up an exact method name, its default value, or an option you don't remember.
- **references/patterns.md** — copy-paste recipes for common tasks: highlight-on-hover, click-to-focus camera, DAG trees, dynamic data, custom node geometries (text/HTML/images), gradient links, emitting particles, fixing dragged nodes, performance tuning.

When the user mentions a feature that matches a recipe title in `patterns.md`, read that file first — don't re-derive the pattern from scratch.

## Minimal setup

```html
<head>
  <style>body { margin: 0; }</style>
  <script src="https://cdn.jsdelivr.net/npm/3d-force-graph"></script>
</head>
<body>
  <div id="3d-graph"></div>
  <script>
    const Graph = new ForceGraph3D(document.getElementById('3d-graph'))
      .graphData({
        nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        links: [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }]
      });
  </script>
</body>
```

Anything fancier than the base sphere/line rendering (custom geometry, HTML labels, CSS2D overlays) needs `<script type="module">` so ThreeJS can be imported from `https://esm.sh/three`.

## Data shape

```js
{
  nodes: [ { id, name?, val?, color?, ...userFields } ],
  links: [ { source, target, ...userFields } ]
}
```

- `id` uniquely identifies a node. `source`/`target` on a link must match a node `id` (or be the node object itself after the simulation has run — the library mutates link endpoints in place from ids → node references).
- `val` scales the sphere volume; `color` sets it directly. Both are just accessor defaults — any field can be used via `nodeVal('weight')`, `nodeColor(n => ...)`, etc.
- Extra fields are preserved on the object, so store whatever you need (`group`, `type`, `weight`) and read it back in accessors.

## The chainable API pattern

Every configuration method is a getter/setter:
```js
Graph.nodeColor('red')              // setter — returns Graph for chaining
Graph.nodeColor()                   // getter — returns the current accessor
Graph.nodeColor(Graph.nodeColor())  // trigger a re-render with the same accessor
```

That last idiom is how you force a visual refresh after mutating external state (see the highlight-on-hover pattern in `patterns.md`). The library memoizes accessor results, so re-setting the accessor invalidates the cache.

Accessors accept **three forms**: a constant (`.nodeColor('red')`), a string attribute name (`.nodeColor('group')` reads `node.group`), or a function (`.nodeColor(n => n.active ? 'red' : 'grey')`).

## The most-used setters (quick reference)

**Styling**
- `nodeColor`, `nodeVal`, `nodeLabel`, `nodeOpacity`, `nodeAutoColorBy`
- `linkColor`, `linkWidth`, `linkOpacity`, `linkCurvature`, `linkAutoColorBy`
- `backgroundColor`

**Directionality**
- `linkDirectionalArrowLength`, `linkDirectionalArrowColor`, `linkDirectionalArrowRelPos`
- `linkDirectionalParticles`, `linkDirectionalParticleSpeed`, `linkDirectionalParticleWidth`, `linkDirectionalParticleColor`
- `emitParticle(link)` — fire a single non-cyclical particle

**Custom 3D objects**
- `nodeThreeObject(fn)` + `nodeThreeObjectExtend(true)` — return a `THREE.Object3D`; `extend=true` keeps the default sphere and adds your object on top
- `linkThreeObject`, `linkPositionUpdate` — same idea for links

**Interaction**
- `onNodeClick`, `onNodeHover`, `onNodeDrag`, `onNodeDragEnd`, `onNodeRightClick`
- `onLinkClick`, `onLinkHover`, `onLinkRightClick`
- `onBackgroundClick`, `onBackgroundRightClick`
- `enableNodeDrag`, `enablePointerInteraction`, `enableNavigationControls`

**Camera & scene**
- `cameraPosition({x,y,z}, lookAt, ms)` — animated camera move
- `zoomToFit(ms, padPx, nodeFilter)`
- `scene()`, `camera()`, `renderer()`, `controls()` — raw ThreeJS escape hatches

**Physics**
- `forceEngine('d3' | 'ngraph')`
- `d3Force('link' | 'charge' | 'center', ...)` — reconfigure built-in forces
- `d3AlphaDecay`, `d3VelocityDecay`, `cooldownTicks`, `warmupTicks`
- `dagMode('td' | 'bu' | 'lr' | 'rl' | 'radialout' | ...)` — for tree/DAG layouts

Full API in `references/api.md`.

## When editing an existing graph file

1. **Read the file first.** Look at how the graph is already configured — every `.methodName(...)` in the chain is a setter you can tweak or remove. Don't introduce new setters that duplicate existing ones.
2. **Preserve the chain.** Prefer appending to or modifying the existing `.new ForceGraph3D(...)` chain rather than making a second one.
3. **The `3d-force-graph` CDN script exposes `ForceGraph3D` as a global.** No import needed for base usage. Only add `<script type="module">` + `import * as THREE from 'https://esm.sh/three'` when the change actually needs the `THREE` namespace (custom geometries, materials, groups).
4. **Colors are a common ask** — remember `linkColor` ≠ `linkDirectionalArrowColor` ≠ `linkDirectionalParticleColor`. Arrows and particles default to the link's `color`, so changing `linkColor` cascades unless they're set independently.

## Common pitfalls

- **Link endpoints after the first tick**: `link.source` and `link.target` start as ids (what you passed in) and get replaced with node object references once the simulation runs. Code that assumes they stay as ids will break. If you need the id, read `link.source.id ?? link.source`.
- **`d3Force('charge').strength(-120)` before `graphData()`**: the forces don't exist until data is loaded. Configure forces *after* setting data, or they'll no-op silently.
- **Re-rendering after external state changes**: the library caches accessor results per node/link. To force a refresh, call `Graph.nodeColor(Graph.nodeColor())` (or `.refresh()` for everything).
- **Dragging with `ngraph`**: node drag is only supported on the `d3` force engine. If you switch to `ngraph`, `enableNodeDrag` becomes a no-op.
- **`cooldownTicks(0)`** freezes the layout immediately — useful if you're positioning nodes manually via fixed `fx/fy/fz`, surprising if you didn't mean to.

## Output style

When writing code into HTML files, match the existing example structure: minimal `<head>` with CDN script tag, `<div id="3d-graph">`, one `<script>` block. Don't add build tooling, bundlers, or framework wrappers unless the user asks. Don't add explanatory comments inside the chain — well-named methods are self-documenting. Keep the `<style>body { margin: 0; }</style>` reset.
