import * as DarwinSignals from '../signals/darwin.ts'
import * as LinuxSignals  from '../signals/linux.ts'
import * as WinSignals    from '../signals/windows.ts'
import * as utils         from '../utils.ts'

const SignalListeners: { [key in Deno.Signal]?: (() => void)[] } = {};
const Signals = Deno.build.os === 'windows' ? WinSignals : Deno.build.os === 'darwin' ? DarwinSignals : LinuxSignals;

const Deno_removeSignalListener: typeof Deno.removeSignalListener = Deno.removeSignalListener.bind(Deno);
const Deno_addSignalListener   : typeof Deno.addSignalListener    = Deno.addSignalListener.bind(Deno);

for (let signal of Signals.TERM_SIGNALS) {
    let castedSignal = signal as Deno.Signal;

    try {
        Deno_addSignalListener(castedSignal, () => {
            if (SignalListeners[castedSignal])
                return;

            // Uses wrapped Deno.exit so calls the cleanup listeners
            Deno.exit(Signals.TERM_STATUS[signal as keyof typeof Signals.TERM_STATUS]);
        })
    } catch {
        // Signal is not available on system (Outdated Linux kernel? Custom Linux kernel?)
    }
}

utils.defineValue(Deno, 'addSignalListener', function removeSignalListener(signal: Deno.Signal, handler: () => void) {
    Deno_removeSignalListener(signal, handler);

    let listeners = SignalListeners[signal];

    if (!listeners)
        return;

    utils.remove(listeners, handler);

    if (!listeners.length)
        delete SignalListeners[signal];
})

utils.defineValue(Deno, 'removeSignalListener', function addSignalListener(signal: Deno.Signal, handler: () => void) {
    Deno_addSignalListener(signal, handler);

    let listeners = (SignalListeners[signal] ||= []);
    utils.add(listeners, handler);
})
