/**
 * T-R-A-V-I Engine Core - Rendering and update loop
 */

import { WebGPUContext } from './webgpu-context.js';
import { Scene } from './scene.js';

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.gpuContext = new WebGPUContext(canvas);
        this.scene = new Scene();
        this.isRunning = false;
        this.pipeline = null;
        this.vertexBuffer = null;
        this.uniformBuffer = null;
        this.bindGroup = null;
        this.camera = {
            position: [0, 3, 8],
            rotation: [0, 0, 0]
        };
    }
    
    async initialize() {
        console.log('Initializing engine...');
        
        // Initialize WebGPU
        await this.gpuContext.initialize();
        
        // Create render pipeline
        await this.createRenderPipeline();
        
        // Create cube mesh
        this.createCubeMesh();
        
        // Resize to fit window
        this.resize();
        
        console.log('Engine initialized');
    }
    
    async createRenderPipeline() {
        const device = this.gpuContext.device;
        
        // Shader code
        const shaderCode = `
            struct Uniforms {
                modelViewProjection: mat4x4<f32>,
                color: vec4<f32>,
            };
            @binding(0) @group(0) var<uniform> uniforms: Uniforms;
            
            struct VertexInput {
                @location(0) position: vec3<f32>,
            };
            
            struct VertexOutput {
                @builtin(position) position: vec4<f32>,
                @location(0) color: vec4<f32>,
            };
            
            @vertex
            fn vertexMain(input: VertexInput) -> VertexOutput {
                var output: VertexOutput;
                output.position = uniforms.modelViewProjection * vec4<f32>(input.position, 1.0);
                output.color = uniforms.color;
                return output;
            }
            
            @fragment
            fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
                return input.color;
            }
        `;
        
        const shaderModule = device.createShaderModule({
            code: shaderCode
        });
        
        // Create uniform buffer
        this.uniformBuffer = device.createBuffer({
            size: 80, // mat4x4 (64 bytes) + vec4 (16 bytes)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        // Create bind group layout
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: { type: 'uniform' }
            }]
        });
        
        // Create bind group
        this.bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: this.uniformBuffer }
            }]
        });
        
        // Create pipeline
        this.pipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            }),
            vertex: {
                module: shaderModule,
                entryPoint: 'vertexMain',
                buffers: [{
                    arrayStride: 12, // 3 floats * 4 bytes
                    attributes: [{
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3'
                    }]
                }]
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fragmentMain',
                targets: [{
                    format: this.gpuContext.format
                }]
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'back'
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus'
            }
        });
    }
    
    createCubeMesh() {
        // Simple cube vertices
        const vertices = new Float32Array([
            // Front face
            -1, -1,  1,  1, -1,  1,  1,  1,  1,
            -1, -1,  1,  1,  1,  1, -1,  1,  1,
            // Back face
            -1, -1, -1, -1,  1, -1,  1,  1, -1,
            -1, -1, -1,  1,  1, -1,  1, -1, -1,
            // Top face
            -1,  1, -1, -1,  1,  1,  1,  1,  1,
            -1,  1, -1,  1,  1,  1,  1,  1, -1,
            // Bottom face
            -1, -1, -1,  1, -1, -1,  1, -1,  1,
            -1, -1, -1,  1, -1,  1, -1, -1,  1,
            // Right face
             1, -1, -1,  1,  1, -1,  1,  1,  1,
             1, -1, -1,  1,  1,  1,  1, -1,  1,
            // Left face
            -1, -1, -1, -1, -1,  1, -1,  1,  1,
            -1, -1, -1, -1,  1,  1, -1,  1, -1,
        ]);
        
        this.vertexBuffer = this.gpuContext.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        
        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
        this.vertexBuffer.unmap();
        
        this.vertexCount = vertices.length / 3;
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const width = this.canvas.clientWidth * dpr;
        const height = this.canvas.clientHeight * dpr;
        
        this.gpuContext.resize(width, height);
    }
    
    start() {
        this.isRunning = true;
        this.render();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    render() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.render());
    }
    
    update() {
        // Update logic here
        // For now, just rotate camera around scene
        const time = performance.now() * 0.001;
        const radius = 8;
        this.camera.position[0] = Math.sin(time * 0.3) * radius;
        this.camera.position[2] = Math.cos(time * 0.3) * radius;
    }
    
    draw() {
        const device = this.gpuContext.device;
        const textureView = this.gpuContext.getCurrentTexture().createView();
        const depthView = this.gpuContext.getDepthTextureView();
        
        const commandEncoder = device.createCommandEncoder();
        
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                loadOp: 'clear',
                clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1.0 },
                storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: depthView,
                depthLoadOp: 'clear',
                depthClearValue: 1.0,
                depthStoreOp: 'store'
            }
        });
        
        renderPass.setPipeline(this.pipeline);
        renderPass.setVertexBuffer(0, this.vertexBuffer);
        
        // Render each entity
        const entities = this.scene.getEntities();
        for (const entity of entities) {
            this.renderEntity(renderPass, entity);
        }
        
        renderPass.end();
        device.queue.submit([commandEncoder.finish()]);
    }
    
    renderEntity(renderPass, entity) {
        // Create model-view-projection matrix
        const mvp = this.createMVPMatrix(entity);
        const color = new Float32Array(entity.color);
        
        // Update uniform buffer
        const uniformData = new Float32Array(20); // 16 for mat4 + 4 for color
        uniformData.set(mvp, 0);
        uniformData.set(color, 16);
        
        this.gpuContext.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            uniformData.buffer
        );
        
        renderPass.setBindGroup(0, this.bindGroup);
        renderPass.draw(this.vertexCount, 1, 0, 0);
    }
    
    createMVPMatrix(entity) {
        const aspectRatio = this.canvas.width / this.canvas.height;
        
        // Projection matrix
        const projection = this.createPerspectiveMatrix(
            Math.PI / 4,
            aspectRatio,
            0.1,
            100.0
        );
        
        // View matrix
        const view = this.createLookAtMatrix(
            this.camera.position,
            [0, 0, 0],
            [0, 1, 0]
        );
        
        // Model matrix
        const model = this.createModelMatrix(entity);
        
        // Combine: projection * view * model
        const viewProj = this.multiplyMatrices(projection, view);
        const mvp = this.multiplyMatrices(viewProj, model);
        
        return mvp;
    }
    
    createModelMatrix(entity) {
        const [x, y, z] = entity.position;
        const [sx, sy, sz] = entity.scale;
        
        // Simple translation and scale matrix
        return new Float32Array([
            sx,  0,  0, 0,
             0, sy,  0, 0,
             0,  0, sz, 0,
             x,  y,  z, 1
        ]);
    }
    
    createPerspectiveMatrix(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, 2 * far * near * nf, 0
        ]);
    }
    
    createLookAtMatrix(eye, target, up) {
        const zAxis = this.normalize([
            eye[0] - target[0],
            eye[1] - target[1],
            eye[2] - target[2]
        ]);
        const xAxis = this.normalize(this.cross(up, zAxis));
        const yAxis = this.cross(zAxis, xAxis);
        
        return new Float32Array([
            xAxis[0], yAxis[0], zAxis[0], 0,
            xAxis[1], yAxis[1], zAxis[1], 0,
            xAxis[2], yAxis[2], zAxis[2], 0,
            -this.dot(xAxis, eye), -this.dot(yAxis, eye), -this.dot(zAxis, eye), 1
        ]);
    }
    
    multiplyMatrices(a, b) {
        const result = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        return result;
    }
    
    normalize(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / len, v[1] / len, v[2] / len];
    }
    
    cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }
    
    dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
}
