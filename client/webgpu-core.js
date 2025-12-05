// client/webgpu-core.js

export async function initWebGPU(canvas) {
  if (!("gpu" in navigator)) {
    throw new Error("WebGPU not supported in this browser.");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("Failed to get GPU adapter.");
  }

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");

  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format,
    alphaMode: "opaque"
  });

  return { device, context, format };
}

export function resizeCanvasToDisplaySize(canvas) {
  const width = canvas.clientWidth * window.devicePixelRatio;
  const height = canvas.clientHeight * window.devicePixelRatio;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

export function createBasicPipeline(device, format) {
  const shaderCode = /* wgsl */`
    @vertex
    fn vs_main(@builtin(vertex_index) vertex_index: u32)
        -> @builtin(position) vec4<f32> {
      var pos = array<vec2<f32>, 3>(
        vec2<f32>(0.0,  0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>(0.5, -0.5)
      );
      let xy = pos[vertex_index];
      return vec4<f32>(xy, 0.0, 1.0);
    }

    @fragment
    fn fs_main() -> @location(0) vec4<f32> {
      return vec4<f32>(0.4, 0.8, 1.0, 1.0);
    }
  `;

  const module = device.createShaderModule({ code: shaderCode });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module,
      entryPoint: "vs_main",
    },
    fragment: {
      module,
      entryPoint: "fs_main",
      targets: [{ format }],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  return pipeline;
}

export function renderTriangle(device, context, pipeline) {
  const encoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();

  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r: 0.02, g: 0.02, b: 0.05, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });

  pass.setPipeline(pipeline);
  pass.draw(3, 1, 0, 0);
  pass.end();

  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}
