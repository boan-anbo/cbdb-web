# Desktop Workers

This directory contains worker threads specific to the Electron desktop application.

## Architecture

Desktop workers are TypeScript files that get compiled to JavaScript during the build process. They run in separate threads to prevent blocking the main Electron process.

## Directory Structure

```
src/main/workers/          # Source TypeScript workers
├── 7zip.worker.ts         # Archive extraction worker
├── worker-manager.ts      # Centralized worker management
└── README.md             # This file

dist/workers/              # Compiled JavaScript workers (build output)
├── 7zip.worker.js        # Compiled from TypeScript
├── graph-metrics.worker.js    # Copied from server
└── graph-coordinate.worker.js # Copied from server
```

## Build Process

1. **Desktop Workers**: TypeScript files in this directory are compiled by `vite-plugin-desktop-workers.ts`
2. **Server Workers**: Pre-compiled JavaScript workers from the server are copied by `vite-plugin-copy-server-workers.ts`
3. **Output**: All workers end up in `dist/workers/` for runtime use

## Creating a New Desktop Worker

1. Create a new TypeScript file ending with `.worker.ts`:

```typescript
// example.worker.ts
import { parentPort } from 'worker_threads';

interface TaskMessage {
  action: string;
  data: any;
}

parentPort?.on('message', async (task: TaskMessage) => {
  try {
    // Process the task
    const result = await processTask(task);

    // Send result back
    parentPort?.postMessage({ success: true, data: result });
  } catch (error) {
    parentPort?.postMessage({ success: false, error: error.message });
  }
});
```

2. Use the worker via `DesktopWorkerManager`:

```typescript
import { DesktopWorkerManager } from '../workers/worker-manager';

const result = await DesktopWorkerManager.executeTask(
  'example.worker.js',  // Note: .js extension for compiled file
  { action: 'process', data: someData },
  30000  // timeout in ms
);
```

## Worker Manager API

The `DesktopWorkerManager` provides utilities for working with workers:

- `createWorker(name)`: Create a new worker instance
- `executeTask(name, task, timeout)`: Execute a task and wait for result
- `workerExists(name)`: Check if a worker file exists
- `listAvailableWorkers()`: List all available workers

## Path Resolution

Workers are resolved differently in development vs production:

- **Development**: `{app-root}/dist/workers/`
- **Production**: `{app.asar}/dist/workers/`

The `DesktopWorkerManager` handles this automatically using `app.getAppPath()`.

## Current Workers

### 7zip.worker.ts
Handles archive operations using 7z-wasm:
- Extract archives to filesystem
- Test archive integrity
- List archive contents

## Notes

- Workers are compiled with esbuild targeting Node.js 18+
- External modules like `worker_threads`, `fs`, `path` are not bundled
- Source maps are generated for debugging
- In production, workers are minified

## Troubleshooting

### Worker Not Found
- Check that the worker file exists in `dist/workers/`
- Ensure the build process completed successfully
- Verify the worker name includes `.js` extension when calling

### Worker Compilation Failed
- Check for TypeScript errors in the worker file
- Ensure all imports are available
- Check the build logs for esbuild errors

### Worker Timeout
- Increase the timeout value in `executeTask()`
- Check if the worker is stuck in an infinite loop
- Verify the worker sends a response via `postMessage()`