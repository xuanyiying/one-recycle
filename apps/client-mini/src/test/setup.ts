
// Define Taro globals for test environment
// @ts-ignore
global.ENABLE_INNER_HTML = true
// @ts-ignore
global.ENABLE_ADJACENT_HTML = true
// @ts-ignore
global.ENABLE_SIZE_APIS = true
// @ts-ignore
global.ENABLE_TEMPLATE_CONTENT = true
// @ts-ignore
global.ENABLE_CLONE_NODE = true
// @ts-ignore
global.ENABLE_CONTAINS = true
// @ts-ignore
global.ENABLE_MUTATION_OBSERVER = true

// Mock canvas which is often needed by Taro components
// @ts-ignore
global.HTMLCanvasElement.prototype.getContext = () => {
  return {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (x, y, w, h) => ({
      data: new Array(w * h * 4)
    }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  };
}
