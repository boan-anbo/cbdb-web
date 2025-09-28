# Worker Architecture

This directory contains Node.js Worker Thread files for CPU-intensive operations in the CBDB Desktop application.

## Overview

Workers are pre-compiled JavaScript files that run in separate threads, enabling parallel processing for computationally expensive tasks like graph metrics calculation and coordinate layout generation.

## Architecture Principles

### Convention-Based Path Resolution

All workers follow a simple convention:
- **Location**: Always in `dist/workers/` directory after build
- **Naming**: Files must end with `.worker.js`
- **Resolution**: `WorkerPathResolverService` abstracts path resolution

### Build Process

The worker files are handled differently in each environment:

1. **NestJS Standalone** (development/production)
   - `nest-cli.json` copies `src/workers/*.worker.js` → `dist/workers/`
   - Workers are treated as static assets
   - Automatic re-copy in watch mode

2. **Electron Desktop** (development/production)
   - Vite plugin (`copyWorkersPlugin`) copies workers during build
   - Source: `apps/server/src/workers/*.worker.js`
   - Target: `apps/desktop/dist/workers/*.worker.js`
   - Runs on both `buildStart` (dev) and `writeBundle` (prod)

### Worker Management

Services that use workers follow these patterns:

1. **Initialization**
   - Use `WorkerPathResolverService` to get worker paths
   - Create worker pool with appropriate size limits
   - Handle initialization failures gracefully

2. **Graceful Degradation**
   - Always provide synchronous fallback
   - Log but don't throw on worker initialization failure
   - Small datasets use sync processing (faster than worker overhead)

3. **Resource Management**
   - Implement `OnModuleDestroy` to clean up worker pools
   - Use appropriate pool sizes (CPU-bound vs memory-bound)
   - Reuse worker instances across requests

## Current Workers

### graph-metrics.worker.js
- **Purpose**: Calculate graph metrics (centrality, clustering, etc.)
- **Used by**: `PersonGraphWorkerPoolService`
- **Pool size**: min(4, CPU cores / 2)
- **Strategy**: CPU-intensive parallel processing

### graph-coordinate.worker.js
- **Purpose**: Generate x,y coordinates for graph visualization
- **Used by**: `GraphCoordinateService`
- **Pool size**: 1-2 threads (memory-bound)
- **Strategy**: Layout calculation for large graphs

## Adding New Workers

1. **Create Worker File**
   ```javascript
   // src/workers/my-task.worker.js
   const workerpool = require('workerpool');

   function myTask(data) {
     // CPU-intensive work here
     return result;
   }

   workerpool.worker({
     myTask: myTask
   });
   ```

2. **Create or Update Service**
   ```typescript
   @Injectable()
   export class MyService {
     private pool: workerpool.Pool | null = null;

     constructor(
       private readonly workerPathResolver: WorkerPathResolverService
     ) {
       const workerPath = this.workerPathResolver.getWorkerPath('my-task.worker.js');
       // Initialize pool with error handling
     }
   }
   ```

3. **Register Service**
   - Add `WorkerPathResolverService` to module providers if not present
   - Add your service to the module

## Best Practices

1. **Worker Design**
   - Keep workers stateless and pure functions
   - Avoid large data transfers (serialization overhead)
   - Use workers for CPU-intensive tasks, not I/O

2. **Error Handling**
   - Always provide synchronous fallback
   - Log worker initialization failures
   - Don't block service startup on worker availability

3. **Performance**
   - Benchmark worker vs sync for your use case
   - Small datasets often faster without workers
   - Consider serialization overhead

4. **Testing**
   - Test both worker and synchronous paths
   - Mock `WorkerPathResolverService` in unit tests
   - Integration tests should verify worker loading

## Debugging

### Check Worker Availability
```typescript
const resolver = new WorkerPathResolverService();
console.log('Available workers:', resolver.listAvailableWorkers());
console.log('Workers directory:', resolver.getWorkersDirectory());
```

### Verify Build Output
```bash
# After build, check workers are copied
ls -la apps/server/dist/workers/
ls -la apps/desktop/dist/workers/
```

### Common Issues

1. **MODULE_NOT_FOUND**: Worker file not found
   - Check build completed successfully
   - Verify worker copied to dist/workers
   - Check file naming convention (*.worker.js)

2. **Worker Pool Initialization Failed**: Can't create pool
   - Check worker file syntax is valid
   - Verify workerpool is installed
   - Check worker exports correct functions

3. **Performance Degradation**: Workers slower than sync
   - Profile serialization overhead
   - Check pool size configuration
   - Consider data size thresholds

## Maintenance

When updating the worker architecture:

1. **Path Changes**: Update both Vite plugin and nest-cli.json
2. **New Workers**: Follow naming convention and update documentation
3. **Testing**: Verify in both NestJS and Electron environments
4. **Monitoring**: Check logs for worker initialization status