export function delay(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), ms)
    })
}

export function toDict<T>(items: T[], toKey: (t: T) => string): Record<string, T> {
    const dict: Record<string, T> = {}
    items.forEach(item => {
        const key = toKey(item)
        dict[key] = item
    })
    return dict
}