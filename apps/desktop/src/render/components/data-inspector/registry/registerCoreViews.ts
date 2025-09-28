import { inspectorViewRegistry } from './InspectorViewRegistry';
import {
  personNetworkInspectorViewDef,
  personDetailInspectorViewDef
} from '../views';

/**
 * Registers all core inspector views with the registry.
 * This should be called once during app initialization.
 */
export function registerCoreInspectorViews(): void {
  // Register all core views
  inspectorViewRegistry.registerMany([
    personDetailInspectorViewDef,
    personNetworkInspectorViewDef
  ]);
}