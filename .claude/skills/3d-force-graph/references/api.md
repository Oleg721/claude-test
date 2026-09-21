# 3d-force-graph — Full API reference

Complete method list for `new ForceGraph3D(domElement, configOptions)`. All methods are chainable getters/setters unless noted. Defaults shown after each.

## Table of contents

- [Initialisation](#initialisation)
- [Data input](#data-input)
- [Container layout](#container-layout)
- [Node styling](#node-styling)
- [Link styling](#link-styling)
- [Directional arrows](#directional-arrows)
- [Directional particles](#directional-particles)
- [Render control](#render-control)
- [Force engine](#force-engine)
- [Interaction](#interaction)
- [Utility](#utility)

## Initialisation

```js
new ForceGraph3D(domElement, { controlType, rendererConfig, extraRenderers })
```

| Option | Description | Default |
|---|---|---|
| `controlType` | `'trackball'`, `'orbit'`, or `'fly'` | `'trackball'` |
| `rendererConfig` | Passed to ThreeJS `WebGLRenderer` | `{ antialias: true, alpha: true }` |
| `extraRenderers` | Additional renderers (e.g. `CSS2DRenderer`) | `[]` |

## Data input

| Method | Description | Default |
|---|---|---|
| `graphData([data])` | `{ nodes, links }`. Supports incremental updates. | `{ nodes: [], links: [] }` |
| `jsonUrl([url])` | Load graph from JSON URL | |
| `nodeId([str])` | Node id accessor attribute | `id` |
| `linkSource([str])` | Link source accessor attribute | `source` |
| `linkTarget([str])` | Link target accessor attribute | `target` |

## Container layout

| Method | Description | Default |
|---|---|---|
| `width([px])` | Canvas width | window width |
| `height([px])` | Canvas height | window height |
| `backgroundColor([str])` | Background color | `#000011` |
| `showNavInfo([bool])` | Footer controls hint | `true` |

## Node styling

| Method | Description | Default |
|---|---|---|
| `nodeRelSize([num])` | Sphere volume per unit of `val` | `4` |
| `nodeVal([num\|str\|fn])` | Volume accessor | `val` |
| `nodeLabel([str\|fn])` | Label (text / HTML / HTMLElement) | `name` |
| `nodeVisibility([bool\|str\|fn])` | Show/hide individual nodes | `true` |
| `nodeColor([str\|fn])` | Sphere color accessor | `color` |
| `nodeAutoColorBy([str\|fn])` | Auto-color by field; ignored if `color` set | |
| `nodeOpacity([num])` | Sphere opacity [0,1] | `0.75` |
| `nodeResolution([num])` | Sphere geometric resolution (slice segments) | `8` |
| `nodeThreeObject([Object3D\|str\|fn])` | Custom ThreeJS object for nodes | default sphere |
| `nodeThreeObjectExtend([bool\|str\|fn])` | Extend default (`true`) or replace (`false`) | `false` |
| `nodePositionUpdate([fn(nodeObj, {x,y,z}, node)])` | Custom per-frame node position update. Return truthy to skip default. | |

## Link styling

| Method | Description | Default |
|---|---|---|
| `linkLabel([str\|fn])` | Link label (text/HTML) | `name` |
| `linkVisibility([bool\|str\|fn])` | Render or hide link line (force still applies when hidden) | `true` |
| `linkColor([str\|fn])` | Line color | `color` |
| `linkAutoColorBy([str\|fn])` | Auto-color by field | |
| `linkOpacity([num])` | Line opacity [0,1] | `0.2` |
| `linkWidth([num\|str\|fn])` | Width; `0` → ThreeJS `Line` (1px constant) | `0` |
| `linkResolution([num])` | Cylinder segments (only for width > 0) | `6` |
| `linkCurvature([num\|str\|fn])` | `0` straight; `1` semi-circle; negative = counter-clockwise. Self-loops supported. | `0` |
| `linkCurveRotation([num\|str\|fn])` | Rotate curve around source-target axis (radians) | `0` |
| `linkMaterial([Material\|str\|fn])` | Custom ThreeJS material | `MeshLambertMaterial` |
| `linkThreeObject([Object3D\|str\|fn])` | Custom ThreeJS object for links | default line/cylinder |
| `linkThreeObjectExtend([bool\|str\|fn])` | Extend default or replace | `false` |
| `linkPositionUpdate([fn(linkObj, {start, end}, link)])` | Custom per-frame link position update | |

## Directional arrows

| Method | Description | Default |
|---|---|---|
| `linkDirectionalArrowLength([num\|str\|fn])` | Arrow size; `0` hides | `0` |
| `linkDirectionalArrowColor([str\|fn])` | Arrow color | link `color` |
| `linkDirectionalArrowRelPos([num\|str\|fn])` | Position along link [0,1] | `0.5` |
| `linkDirectionalArrowResolution([num])` | Cone base segments | `8` |

## Directional particles

| Method | Description | Default |
|---|---|---|
| `linkDirectionalParticles([num\|str\|fn])` | Particle count on link | `0` |
| `linkDirectionalParticleSpeed([num\|str\|fn])` | Link-length ratio per frame; avoid > 0.5 | `0.01` |
| `linkDirectionalParticleOffset([num\|str\|fn])` | Initial offset [0,1] | `0` |
| `linkDirectionalParticleWidth([num\|str\|fn])` | Particle width | `0.5` |
| `linkDirectionalParticleColor([str\|fn])` | Particle color | link `color` |
| `linkDirectionalParticleResolution([num])` | Sphere slice segments | `4` |
| `linkDirectionalParticleThreeObject([Object3D\|str\|fn])` | Custom particle object (ignores width/color/resolution) | |
| `emitParticle(link)` | Emit one non-cyclical particle on a link; uses the regular particle styling | not a getter/setter |

## Render control

| Method | Description | Default |
|---|---|---|
| `pauseAnimation()` | Freeze rendering + interaction | |
| `resumeAnimation()` | Resume | |
| `cameraPosition([{x,y,z}], [lookAt], [ms])` | Animated camera move. Any coord optional. | faces center at auto `z` |
| `zoomToFit([ms], [px], [nodeFilterFn])` | Move camera so all (filtered) nodes fit. | `0ms, 10px, all` |
| `postProcessingComposer()` | Access ThreeJS `EffectComposer` for post-effects | single `RenderPass` |
| `lights([array])` | Scene lights | AmbientLight + DirectionalLight |
| `scene()` | ThreeJS `Scene` | |
| `camera()` | ThreeJS `PerspectiveCamera` | |
| `renderer()` | ThreeJS `WebGLRenderer` | |
| `controls()` | Active controls object | |
| `refresh()` | Redraw all nodes/links | |

## Force engine

| Method | Description | Default |
|---|---|---|
| `forceEngine([str])` | `'d3'` or `'ngraph'` | `'d3'` |
| `numDimensions([int])` | 1, 2, or 3 | `3` |
| `dagMode([str])` | `'td'`, `'bu'`, `'lr'`, `'rl'`, `'zout'`, `'zin'`, `'radialout'`, `'radialin'` | off |
| `dagLevelDistance([num])` | Depth spacing when `dagMode` on | auto |
| `dagNodeFilter([fn])` | Return `false` to exclude a node from DAG constraints | `true` |
| `onDagError([fn])` | Called with cycle node-id array; by default throws | throws |
| `d3AlphaMin([num])` | Simulation alpha floor (d3 only) | `0` |
| `d3AlphaDecay([num])` | Intensity decay (d3 only) | `0.0228` |
| `d3VelocityDecay([num])` | Velocity decay (d3 only) | `0.4` |
| `d3Force(str, [fn])` | Configure `'link'`, `'charge'`, `'center'`, or add new forces | |
| `d3ReheatSimulation()` | Set alpha back to 1 | |
| `ngraphPhysics([obj])` | Custom ngraph physics config | ngraph default |
| `warmupTicks([int])` | Dry-run ticks before rendering | `0` |
| `cooldownTicks([int])` | Frames before freezing layout | `Infinity` |
| `cooldownTime([num])` | Milliseconds before freezing | `15000` |
| `onEngineTick(fn)` | Per-tick callback | |
| `onEngineStop(fn)` | Fires when layout freezes | |

## Interaction

| Method | Description | Default |
|---|---|---|
| `onNodeClick(fn(node, event))` | Left-click on node | |
| `onNodeRightClick(fn(node, event))` | Right-click on node | |
| `onNodeHover(fn(node, prevNode))` | Mouse over node; `node` is null when leaving | |
| `onNodeDrag(fn(node, translate))` | While dragging; `translate` = delta since last frame | |
| `onNodeDragEnd(fn(node, translate))` | On release; `translate` = total delta | |
| `onLinkClick(fn(link, event))` | | |
| `onLinkRightClick(fn(link, event))` | | |
| `onLinkHover(fn(link, prevLink))` | | |
| `onBackgroundClick(fn(event))` | Click in empty space | |
| `onBackgroundRightClick(fn(event))` | Right-click in empty space | |
| `linkHoverPrecision([int])` | Hover tolerance | `1` |
| `showPointerCursor(bool\|fn)` | Pointer cursor on clickables | `true` |
| `enablePointerInteraction([bool])` | Master switch for hover/click; disable for max perf | `true` |
| `enableNodeDrag([bool])` | Only works on d3 engine | `true` |
| `enableNavigationControls([bool])` | Trackball/orbit/fly controls | `true` |

## Utility

| Method | Description |
|---|---|
| `getGraphBbox([nodeFilterFn])` | `{ x: [min,max], y: [min,max], z: [min,max] }` or `null` |
| `graph2ScreenCoords(x, y, z)` | Graph coords → viewport `{x, y}` |
| `screen2GraphCoords(x, y, distance)` | Viewport + depth → graph `{x, y, z}` |
