import { tryCall } from './utils.ts'

const registry = new FinalizationRegistry((callback: () => void) => tryCall(callback));

export function onGC(target: object, callback: () => void) {
    registry.register(target, callback, callback);
}

export function offGC(callback: () => void) {
    registry.unregister(callback);
}
