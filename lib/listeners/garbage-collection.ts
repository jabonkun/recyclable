import * as utils from '../utils.ts'

const Registry = new FinalizationRegistry((listener: () => void) => utils.tryCall(listener));

export function addGarbageCollectionListener(target: object, listener: () => void) {
    Registry.register(target, listener, listener);
}

export function removeGarbageCollectionListener(listener: () => void) {
    Registry.unregister(listener);
}
