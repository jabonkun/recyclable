import * as utils from '../utils.ts'

export const CleanupListeners = [] as (() => void)[];

export function callCleanupListeners() {
    const ListenersBackup = utils.empty(CleanupListeners);

    for (let listener of ListenersBackup)
        utils.tryCall(listener);
}

export function addCleanupListener(listener: () => void) {
    utils.prepend(CleanupListeners, listener);
}

export function removeCleanupListener(listener: () => void) {
    utils.remove(CleanupListeners, listener);
}
