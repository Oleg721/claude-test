# 3d-force-graph — Common patterns (vanilla JS)

Copy-paste recipes for frequent tasks. Each pattern assumes the standard setup: CDN script tag, `<div id="3d-graph">`, one `<script>` block.

## Table of contents

- [Load data from a JSON URL](#load-data-from-a-json-url)
- [Auto-color nodes by group](#auto-color-nodes-by-group)
- [Directional arrows](#directional-arrows)
- [Moving particles along links](#moving-particles-along-links)
- [Emit particles on click](#emit-particles-on-click)
- [Click to focus camera on a node](#click-to-focus-camera-on-a-node)
- [Highlight neighbours on hover](#highlight-neighbours-on-hover)
- [Fix a node's position after drag](#fix-a-nodes-position-after-drag)
- [Curved links and self-loops](#curved-links-and-self-loops)
- [DAG / tree layout](#dag--tree-layout)
- [Dynamic data (add/remove nodes live)](#dynamic-data-addremove-nodes-live)
- [Custom node geometry (ThreeJS shapes)](#custom-node-geometry-threejs-shapes)
- [HTML/CSS2D labels on nodes](#htmlcss2d-labels-on-nodes)
- [Text nodes (sprites)](#text-nodes-sprites)
- [Image nodes](#image-nodes)
- [Tune the force simulation](#tune-the-force-simulation)
- [Pause / resume for performance](#pause--resume-for-performance)
- [Fit graph to canvas](#fit-graph-to-canvas)
- [Trigger a visual refresh after external state changes](#trigger-a-visual-refresh-after-external-state-changes)

---

## Load data from a JSON URL

```js
const Graph = new ForceGraph3D(document.getElementById('3d-graph'))
  .jsonUrl('./data/graph.json')
  .nodeLabel('id')
  .nodeAutoColorBy('group');
```

## Auto-color nodes by group

```js
Graph.nodeAutoColorBy('group')   // reads node.group
     .linkAutoColorBy(link => link.source.group);  // or via accessor fn
```
`autoColorBy` is only applied when the object has no explicit `color` field.

## Directional arrows

```js
Graph.linkDirectionalArrowLength(3.5)
     .linkDirectionalArrowRelPos(1)      // arrow at target end
     .linkDirectionalArrowColor(() => 'orange')
     .linkCurvature(0.25);                // optional: curve so reciprocal arrows don't overlap
```

## Moving particles along links

```js
Graph.linkDirectionalParticles(2)
     .linkDirectionalParticleWidth(2)
     .linkDirectionalParticleSpeed(d => d.value * 0.001);
```
`linkDirectionalParticles` accepts a number, an attribute name, or a function — so you can make particle count reflect link weight.

## Emit particles on click

```js
Graph.linkDirectionalParticleColor(() => 'red')
     .linkDirectionalParticleWidth(4)
     .onLinkClick(Graph.emitParticle);  // fire one particle per click
```
`emitParticle(link)` sends a single non-cyclical particle down a specific link — handy for signaling events without always-on motion.

## Click to focus camera on a node

```js
Graph.onNodeClick(node => {
  const distance = 40;
  const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
  const newPos = (node.x || node.y || node.z)
    ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
    : { x: 0, y: 0, z: distance }; // node sits at origin
  Graph.cameraPosition(newPos, node, 3000);
});
```

## Highlight neighbours on hover

Requires pre-computing neighbour lists. The re-set trick at the bottom is how you force a redraw.

```js
gData.links.forEach(link => {
  const a = gData.nodes[link.source];
  const b = gData.nodes[link.target];
  (a.neighbors ||= []).push(b);
  (b.neighbors ||= []).push(a);
  (a.links ||= []).push(link);
  (b.links ||= []).push(link);
});

const highlightNodes = new Set();
const highlightLinks = new Set();
let hoverNode = null;

const Graph = new ForceGraph3D(document.getElementById('3d-graph'))
  .graphData(gData)
  .nodeColor(n => highlightNodes.has(n)
    ? (n === hoverNode ? 'rgb(255,0,0,1)' : 'rgba(255,160,0,0.8)')
    : 'rgba(0,255,255,0.6)')
  .linkWidth(l => highlightLinks.has(l) ? 4 : 1)
  .linkDirectionalParticles(l => highlightLinks.has(l) ? 4 : 0)
  .linkDirectionalParticleWidth(4)
  .onNodeHover(node => {
    if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors.forEach(n => highlightNodes.add(n));
      node.links.forEach(l => highlightLinks.add(l));
    }
    hoverNode = node || null;
    refresh();
  });

function refresh() {
  Graph.nodeColor(Graph.nodeColor())
       .linkWidth(Graph.linkWidth())
       .linkDirectionalParticles(Graph.linkDirectionalParticles());
}
```

## Fix a node's position after drag

```js
Graph.onNodeDragEnd(node => {
  node.fx = node.x;
  node.fy = node.y;
  node.fz = node.z;
});
```
Setting `fx/fy/fz` pins the node in the simulation. Clear them (`= undefined`) to release.

## Curved links and self-loops

```js
Graph.linkCurvature(0.3)          // semi-circle at 1, straight at 0, counter-clockwise for negatives
     .linkCurveRotation(Math.PI); // rotate curve around the source-target axis
```
For self-loops (source === target), the loop size scales with `linkCurvature`.

## DAG / tree layout

```js
Graph.dagMode('td')          // 'td' | 'bu' | 'lr' | 'rl' | 'zout' | 'zin' | 'radialout' | 'radialin'
     .dagLevelDistance(50)
     .onDagError(() => null); // tolerate cycles instead of throwing
```

## Dynamic data (add/remove nodes live)

```js
const Graph = new ForceGraph3D(elem).graphData({ nodes: [{ id: 0 }], links: [] });

setInterval(() => {
  const { nodes, links } = Graph.graphData();
  const id = nodes.length;
  Graph.graphData({
    nodes: [...nodes, { id }],
    links: [...links, { source: id, target: Math.round(Math.random() * (id - 1)) }]
  });
}, 1000);

function removeNode(node) {
  let { nodes, links } = Graph.graphData();
  links = links.filter(l => l.source !== node && l.target !== node);
  nodes.splice(nodes.indexOf(node), 1);
  Graph.graphData({ nodes, links });
}
```
After the first tick, `link.source` / `link.target` are node object references, not ids — filter against `node`, not `node.id`.

## Custom node geometry (ThreeJS shapes)

Requires `<script type="module">`:

```html
<script type="module">
  import * as THREE from 'https://esm.sh/three';

  const Graph = new ForceGraph3D(document.getElementById('3d-graph'))
    .nodeThreeObject(({ id }) => new THREE.Mesh(
      new THREE.TorusKnotGeometry(6, 1.5),
      new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff, transparent: true, opacity: 0.75 })
    ))
    .graphData(gData);
</script>
```
Return any `THREE.Object3D`. Combine with `.nodeThreeObjectExtend(true)` to keep the default sphere underneath (useful for labels on top of spheres).

## HTML/CSS2D labels on nodes

```html
<script type="module">
  import { CSS2DRenderer, CSS2DObject } from 'https://esm.sh/three/examples/jsm/renderers/CSS2DRenderer.js';

  const Graph = new ForceGraph3D(document.getElementById('3d-graph'), {
    extraRenderers: [new CSS2DRenderer()]
  })
    .jsonUrl('./data.json')
    .nodeAutoColorBy('group')
    .nodeThreeObject(node => {
      const el = document.createElement('div');
      el.textContent = node.id;
      el.style.color = node.color;
      el.className = 'node-label';
      return new CSS2DObject(el);
    })
    .nodeThreeObjectExtend(true);
</script>
```
Remember to register `CSS2DRenderer` via `extraRenderers`; without it the DOM element won't be placed.

## Text nodes (sprites)

```js
import SpriteText from 'https://esm.sh/three-spritetext';

Graph.nodeThreeObject(node => {
  const sprite = new SpriteText(node.id);
  sprite.color = node.color;
  sprite.textHeight = 8;
  return sprite;
});
```

## Image nodes

```js
import * as THREE from 'https://esm.sh/three';

const imgTexture = new THREE.TextureLoader().load('./icon.png');
const material = new THREE.SpriteMaterial({ map: imgTexture });

Graph.nodeThreeObject(() => {
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(12, 12);
  return sprite;
});
```

## Tune the force simulation

```js
Graph.d3Force('charge').strength(-200);              // stronger repulsion
Graph.d3Force('link').distance(link => link.weight * 10);
Graph.d3Force('center', null);                       // disable centering
Graph.d3ReheatSimulation();                          // re-run after changes
```
Configure forces **after** `.graphData(...)` — they're initialised when data loads.

## Pause / resume for performance

```js
Graph.pauseAnimation();   // freeze
// ...
Graph.resumeAnimation();
```
For maximum render perf on large static graphs: `enablePointerInteraction(false)` + `cooldownTicks(100)` freezes the layout quickly and skips per-frame mouse intersection tests.

## Fit graph to canvas

```js
Graph.onEngineStop(() => Graph.zoomToFit(400, 20));
```
`zoomToFit(ms, padding, nodeFilter)` — pass a filter fn to frame only a subset.

## Trigger a visual refresh after external state changes

The library caches accessor results. After mutating state that an accessor depends on, re-set the accessor to invalidate the cache:

```js
Graph.nodeColor(Graph.nodeColor());   // same accessor, but forces refresh
Graph.linkWidth(Graph.linkWidth());
```

Or, for a global redraw:

```js
Graph.refresh();
```
