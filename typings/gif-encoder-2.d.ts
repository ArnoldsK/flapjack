declare module "gif-encoder-2" {
  import { CanvasRenderingContext2D } from "@napi-rs/canvas"

  // Define the shape of the GIFEncoder class
  export default class GIFEncoder {
    // Constructor: The useOptimizer and totalFrames are optional arguments
    constructor(
      width: number,
      height: number,
      algorithm?: "neuquant" | "octree",
      useOptimizer?: boolean,
      totalFrames?: number,
    )

    // Core methods
    start(): void
    addFrame(context: CanvasRenderingContext2D): void
    finish(): void

    // Configuration methods
    setDelay(ms: number): void
    setRepeat(iter: number): void // 0 for infinite loop
    setQuality(quality: number): void // 1-30, 10 is default
    setTransparent(color: number): void // 0x000000
    setThreshold(percent: number): void // 0-100 for optimizer

    // Output property
    out: {
      getData(): Buffer // Where the final Buffer is stored
    }
  }
}
