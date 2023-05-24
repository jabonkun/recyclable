import { printUncaught } from './utils.ts'

const registry = new FinalizationRegistry((callback: () => void) => {
    try {
        callback();
    } catch(err: unknown) {
        printUncaught(err);
    }
})

export function onGC(target: object, callback: () => void) {
    registry.register(target, callback, callback);
}

export function offGC(callback: () => void) {
    registry.unregister(callback);
}