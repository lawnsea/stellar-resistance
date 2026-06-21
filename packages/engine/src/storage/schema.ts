import { struct, u8, u16, u32, s32, f32, f64, type Layout as BufferLayout } from "@solana/buffer-layout";
import { Store } from "./store.js";

export type FieldType = "u8" | "u16" | "u32" | "i32" | "f32" | "f64";
export type Layout = "aos" | "soa";

type TypedArrayConstructor =
  | typeof Uint8Array
  | typeof Uint16Array
  | typeof Uint32Array
  | typeof Int32Array
  | typeof Float32Array
  | typeof Float64Array;

interface FieldTypeInfo {
  readonly bytes: number;
  readonly ArrayType: TypedArrayConstructor;
  readonly dataViewGet: "getUint8" | "getUint16" | "getUint32" | "getInt32" | "getFloat32" | "getFloat64";
  readonly dataViewSet: "setUint8" | "setUint16" | "setUint32" | "setInt32" | "setFloat32" | "setFloat64";
}

const FIELD_TYPE_INFO: Record<FieldType, FieldTypeInfo> = {
  u8: { bytes: 1, ArrayType: Uint8Array, dataViewGet: "getUint8", dataViewSet: "setUint8" },
  u16: { bytes: 2, ArrayType: Uint16Array, dataViewGet: "getUint16", dataViewSet: "setUint16" },
  u32: { bytes: 4, ArrayType: Uint32Array, dataViewGet: "getUint32", dataViewSet: "setUint32" },
  i32: { bytes: 4, ArrayType: Int32Array, dataViewGet: "getInt32", dataViewSet: "setInt32" },
  f32: { bytes: 4, ArrayType: Float32Array, dataViewGet: "getFloat32", dataViewSet: "setFloat32" },
  f64: { bytes: 8, ArrayType: Float64Array, dataViewGet: "getFloat64", dataViewSet: "setFloat64" },
};

/** buffer-layout's signed-32 factory is named `s32`, not `i32`. */
const LAYOUT_FACTORY: Record<FieldType, (property: string) => BufferLayout<number>> = {
  u8,
  u16,
  u32,
  i32: s32,
  f32,
  f64,
};

interface FieldAccessor {
  get(index: number): number;
  set(index: number, value: number): void;
}

export interface EntitySchemaConfig<Fields extends Record<string, FieldType>> {
  readonly fields: Fields;
  readonly layout?: Layout;
  readonly initialCapacity?: number;
}

/** Reserved property names a view exposes besides the declared fields. */
export type ReservedViewKeys = "id";

export type EntityView<Fields extends Record<string, FieldType>> = {
  readonly id: number;
} & {
  -readonly [K in keyof Fields]: number;
};

export interface EntityCollection<Fields extends Record<string, FieldType>> {
  alloc(): number;
  free(id: number): void;
  get(id: number): EntityView<Fields> | undefined;
  ids(): number[];
  readonly length: number;
  readonly capacity: number;
}

/** @internal exported only for the byte-layout regression test in schema.test.ts */
export function buildAosAccessors<Fields extends Record<string, FieldType>>(
  fields: Fields,
  capacity: number,
): {
  accessors: Record<string, FieldAccessor>;
  grow: (newCapacity: number) => void;
  stride: number;
  offsetOf: (name: keyof Fields & string) => number;
} {
  const names = Object.keys(fields) as (keyof Fields & string)[];
  const rowLayout = struct<Record<string, number>>(names.map((name) => LAYOUT_FACTORY[fields[name]!](name)));
  const stride = rowLayout.span;
  const offsetOf = (name: keyof Fields & string): number => rowLayout.offsetOf(name)!;

  let buffer = new ArrayBuffer(Math.max(capacity, 1) * stride);
  let view = new DataView(buffer);

  const grow = (newCapacity: number): void => {
    const newBuffer = new ArrayBuffer(newCapacity * stride);
    new Uint8Array(newBuffer).set(new Uint8Array(buffer));
    buffer = newBuffer;
    view = new DataView(buffer);
  };

  const accessors: Record<string, FieldAccessor> = {};
  for (const name of names) {
    const info = FIELD_TYPE_INFO[fields[name]!];
    const fieldOffset = rowLayout.offsetOf(name)!;
    accessors[name] = {
      get(index: number): number {
        return (view[info.dataViewGet] as (byteOffset: number, littleEndian?: boolean) => number)(
          index * stride + fieldOffset,
          true,
        );
      },
      set(index: number, value: number): void {
        (
          view[info.dataViewSet] as (byteOffset: number, value: number, littleEndian?: boolean) => void
        )(index * stride + fieldOffset, value, true);
      },
    };
  }

  return { accessors, grow, stride, offsetOf };
}

function buildSoaAccessors<Fields extends Record<string, FieldType>>(
  fields: Fields,
  capacity: number,
): { accessors: Record<string, FieldAccessor>; grow: (newCapacity: number) => void } {
  const names = Object.keys(fields) as (keyof Fields & string)[];
  const arrays: Record<string, InstanceType<TypedArrayConstructor>> = {};
  for (const name of names) {
    const info = FIELD_TYPE_INFO[fields[name]!];
    arrays[name] = new info.ArrayType(Math.max(capacity, 1));
  }

  const grow = (newCapacity: number): void => {
    for (const name of names) {
      const info = FIELD_TYPE_INFO[fields[name]!];
      const newArray = new info.ArrayType(newCapacity);
      newArray.set(arrays[name]!);
      arrays[name] = newArray;
    }
  };

  const accessors: Record<string, FieldAccessor> = {};
  for (const name of names) {
    accessors[name] = {
      get(index: number): number {
        return arrays[name]![index]!;
      },
      set(index: number, value: number): void {
        arrays[name]![index] = value;
      },
    };
  }

  return { accessors, grow };
}

export function defineEntitySchema<Fields extends Record<string, FieldType>>(
  config: EntitySchemaConfig<Fields>,
): EntityCollection<Fields> {
  const layout = config.layout ?? "aos";
  const fieldNames = Object.keys(config.fields) as (keyof Fields & string)[];
  for (const reserved of ["id"] as const) {
    if (fieldNames.includes(reserved as keyof Fields & string)) {
      throw new Error(`field name "${reserved}" is reserved`);
    }
  }

  const initialCapacity = config.initialCapacity ?? 8;
  const built =
    layout === "aos"
      ? buildAosAccessors(config.fields, initialCapacity)
      : buildSoaAccessors(config.fields, initialCapacity);
  const { accessors } = built;

  const store = new Store((newCapacity) => built.grow(newCapacity), initialCapacity);

  class View {
    readonly id: number;
    private readonly _index: number;
    constructor(id: number, index: number) {
      this.id = id;
      this._index = index;
    }
  }
  for (const name of fieldNames) {
    Object.defineProperty(View.prototype, name, {
      enumerable: true,
      get(this: { _index: number }) {
        return accessors[name]!.get(this._index);
      },
      set(this: { _index: number }, value: number) {
        accessors[name]!.set(this._index, value);
      },
    });
  }

  function resetRow(index: number): void {
    for (const name of fieldNames) {
      accessors[name]!.set(index, 0);
    }
  }

  return {
    alloc(): number {
      const id = store.alloc();
      const index = store.resolve(id)!;
      resetRow(index);
      return id;
    },
    free(id: number): void {
      store.free(id);
    },
    get(id: number): EntityView<Fields> | undefined {
      const index = store.resolve(id);
      if (index === undefined) return undefined;
      return new View(id, index) as unknown as EntityView<Fields>;
    },
    ids(): number[] {
      return store.liveIds();
    },
    get length(): number {
      return store.length;
    },
    get capacity(): number {
      return store.capacity;
    },
  };
}
