/**
 * WebGPU context initialization and management
 */

export class WebGPUContext {
    constructor(canvas) {
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.format = null;
        this.depthTexture = null;
    }
    
    async initialize() {
        // Check for WebGPU support
        if (!navigator.gpu) {
            throw new Error('WebGPU not supported in this browser');
        }
        
        // Get GPU adapter
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('Failed to get GPU adapter');
        }
        
        // Request device
        this.device = await adapter.requestDevice();
        
        // Get canvas context
        this.context = this.canvas.getContext('webgpu');
        this.format = navigator.gpu.getPreferredCanvasFormat();
        
        // Configure canvas
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: 'opaque'
        });
        
        // Create depth texture
        this.createDepthTexture();
        
        console.log('WebGPU initialized successfully');
        return true;
    }
    
    createDepthTexture() {
        this.depthTexture = this.device.createTexture({
            size: {
                width: this.canvas.width,
                height: this.canvas.height
            },
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.createDepthTexture();
    }
    
    getCurrentTexture() {
        return this.context.getCurrentTexture();
    }
    
    getDepthTextureView() {
        return this.depthTexture.createView();
    }
}
