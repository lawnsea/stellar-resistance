export interface Stateful<S> {
  getState(): S;
  setState(state: S): void;
}

export interface Tickable<T> {
  tick(n?: number): T;
}
