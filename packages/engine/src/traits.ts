export interface Stateful<S> {
  getState(): S;
  setState(state: S): void;
}

export interface Tickable {
  tick(n?: number): void;
}
