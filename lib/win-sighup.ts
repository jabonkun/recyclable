import { addCleanupListener } from './listeners/cleanup.ts'
import * as utils from './utils.ts'

// Make sure it is only loaded on Windows
if (Deno.build.os === 'windows') {
    let kernel32 = Deno.dlopen('kernel32.dll', {
        SetConsoleCtrlHandler: {
            result: 'bool',
            parameters: [ 'function', 'bool' ]
        }
    });

    const WINDOWS_SIGHUP_STATUS = -1073741510;
    const CTRL_BREAK_EVENT      = 0x01;
    const CTRL_C_EVENT          = 0x00;

    let cb = utils.threadUnsafe({ parameters: [ 'i32' ], result: 'bool' }, dwCtrlType => {
        switch (dwCtrlType) {
            case CTRL_C_EVENT:
                return false;

            case CTRL_BREAK_EVENT:
                return false;

            default:
                // Uses wrapped Deno.exit so calls the cleanup listeners
                Deno.exit(WINDOWS_SIGHUP_STATUS);
        }
    })

    kernel32.symbols.SetConsoleCtrlHandler(cb.pointer, true);
    addCleanupListener(() => { cb.close(); kernel32.close(); });
}
