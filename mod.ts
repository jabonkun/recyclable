// Load and apply the patches/handlers
import * as winSighup from './lib/win-sighup.ts'
import * as signals from './lib/wrappers/signals.ts'
import * as exit from './lib/wrappers/exit.ts'

// Make sure TSC don't thinks those imports are not used
try {
    // @ts-ignore
    winSighup();
    // @ts-ignore
    signals();
    // @ts-ignore
    exit();
} catch {
    // Well, you're calling non-callable objects, what did u expected?
}

export { default } from './lib/recyclable.ts'
