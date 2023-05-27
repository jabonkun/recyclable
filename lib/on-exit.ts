import { printUncaught, remove, add, prepend, empty, tryCall } from './utils.ts'
import * as DarwinSignals from './signals/darwin.ts'
import * as LinuxSignals  from './signals/linux.ts'
import * as WinSignals    from './signals/windows.ts'

const Signals = Deno.build.os === 'windows' ? WinSignals : Deno.build.os === 'darwin' ? DarwinSignals : LinuxSignals;

const Deno_removeSignalListener: typeof Deno.removeSignalListener = Deno.removeSignalListener.bind(Deno);
const Deno_addSignalListener   : typeof Deno.addSignalListener    = Deno.addSignalListener.bind(Deno);
const Deno_exit                : typeof Deno.exit                 = Deno.exit.bind(Deno);

const SignalListeners: { [key in Deno.Signal]?: (() => void)[] } = {};
const Listeners      : (() => void)[]                            = [];

for (let signal of Signals.TERM_SIGNALS) {
    let castedSignal = signal as Deno.Signal;

    try {
        Deno_addSignalListener(castedSignal, () => {
            if (SignalListeners[castedSignal])
                return;

            fireListeners();
            Deno_exit(Signals.TERM_STATUS[signal as keyof typeof Signals.TERM_STATUS]);
        })
    } catch {
        // Signal is not available in system (Outdated Linux kernel? Custom Linux kernel?)
    }
}

Deno.removeSignalListener = function removeSignalListener(signal: Deno.Signal, handler: () => void) {
    Deno_removeSignalListener(signal, handler);

    let listeners = SignalListeners[signal];

    if (!listeners)
        return;

    remove(listeners, handler);

    if (!listeners.length)
        delete SignalListeners[signal];
}

Deno.addSignalListener = function addSignalListener(signal: Deno.Signal, handler: () => void) {
    Deno_addSignalListener(signal, handler);

    let listeners = (SignalListeners[signal] ||= []);
    add(listeners, handler);
}

Deno.exit = function exit(code?: number): never {
    fireListeners();
    Deno_exit(code);
}

window.addEventListener('unhandledrejection', fireListeners);
window.addEventListener('beforeunload'      , fireListeners);
window.addEventListener('unload'            , fireListeners);

function fireListeners() {
    const ListenersBackup = empty(Listeners);

    for (let listener of ListenersBackup)
        tryCall(listener);
}

export function onExit(listener: () => void) {
    prepend(Listeners, listener);
}

export function offExit(listener: () => void) {
    remove(Listeners, listener);
}
