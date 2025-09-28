import { InspectorViewDefinition } from '../types';

export class InspectorViewRegistry {
  private views = new Map<string, InspectorViewDefinition>();
  private listeners = new Set<(views: InspectorViewDefinition[]) => void>();

  register(view: InspectorViewDefinition): void {
    if (this.views.has(view.id)) {
      console.warn(`Inspector view with id "${view.id}" is already registered. Overwriting.`);
    }
    this.views.set(view.id, view);
    this.notifyListeners();
  }

  unregister(viewId: string): boolean {
    const deleted = this.views.delete(viewId);
    if (deleted) {
      this.notifyListeners();
    }
    return deleted;
  }

  get(viewId: string): InspectorViewDefinition | undefined {
    return this.views.get(viewId);
  }

  getAll(): InspectorViewDefinition[] {
    return Array.from(this.views.values())
      .sort((a, b) => (a.defaultOrder ?? 999) - (b.defaultOrder ?? 999));
  }

  getByCategory(category: string): InspectorViewDefinition[] {
    return this.getAll().filter(view => view.category === category);
  }

  subscribe(listener: (views: InspectorViewDefinition[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current views
    listener(this.getAll());
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const views = this.getAll();
    this.listeners.forEach(listener => listener(views));
  }

  // Batch registration for initial setup
  registerMany(views: InspectorViewDefinition[]): void {
    views.forEach(view => this.views.set(view.id, view));
    this.notifyListeners();
  }

  clear(): void {
    this.views.clear();
    this.notifyListeners();
  }
}

// Singleton instance for the app
export const inspectorViewRegistry = new InspectorViewRegistry();