export function bool(value: boolean) {
    return { type: 'Bool', value }
}

export function uint8(value: number) {
    return { type: 'UInt8', value: value.toString() }
}

export function enumUint8(id: string, value: number) {
    return {
        type: 'Enum',
        value: {
            fields: [{
                name: 'rawValue',
                value: uint8(value)
            }],
            id
        }
    }
}

export function int(value: number) {
    return { type: 'Int', value: value.toString() }
}

export function uint32(value: number) {
    return { type: 'UInt32', value: value.toString() }
}

export function uint64<V = number>(value: V) {
    return { type: 'UInt64', value: typeof value == 'number' ? value.toString() : value }
}

export function ufix64<V = number>(value: V) {
    return { type: 'UFix64', value: typeof value == 'number' ? value.toFixed(2) : value }
}

export function string<V = string>(value: V) {
    return { type: 'String', value }
}

export function dicss(kvs: { [key: string]: any }) {
    return { type: 'Dictionary', value:
        Object.keys(kvs).map((key) =>
            ({ key: string(key), value: string(kvs[key]) })
        )
    }
}

export function dicsa(kvs: { [key: string]: any }) {
    return { type: 'Dictionary', value:
        Object.keys(kvs).map((key) =>
            ({ key: string(key), value: kvs[key] })
        )
    }
}

export function dicaa(kvs: {key: any, value: any}[]) {
    return { type: 'Dictionary', value: kvs }
}

export function address(value: string) {
    return {
        type: 'Address',
        value: typeof value == 'string' && !value.startsWith('0x') ? '0x' + value : value
    }
}

export function event<T>(type: T, fields: { [name: string]: object }) {
    return {
        type: 'Event',
        value: {
            fields: Object.keys(fields).map(name => ({
                name,
                value: fields[name]
            })),
            id: type
        }
    }
}

export function events(...events: { value: { id: any} }[]) {
    return events.map((event, index) => ({
        index,
        type: event.value.id,
        values: event
    }))
}

export function json(value: object) {
    return JSON.stringify(value)
}

export function array(value: any) {
    return {
        type: 'Array',
        value
    }
}

export function arrays(value: string[]) {
    return array(value.map(string))
}

export function optional(value: any) {
    return {
        type: 'Optional',
        value
    }
}

export function resource<T>(type: T, fields: { [name: string]: object }) {
    return {
        type: 'Resource',
        value: {
            fields: Object.keys(fields).map(name => ({
                name,
                value: fields[name]
            })),
            id: type
        }
    }
}

export function struct<T>(type: T, fields: { [name: string]: object }) {
    return {
        type: 'Struct',
        value: {
            fields: Object.keys(fields).map(name => ({
                name,
                value: fields[name]
            })),
            id: type
        }
    }
}
