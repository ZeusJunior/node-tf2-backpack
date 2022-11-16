export function objectEntries<T extends object>(e: T) {
    return Object.entries(e) as [keyof T, T[keyof T]][];
} 