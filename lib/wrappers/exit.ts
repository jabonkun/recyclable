import { callCleanupListeners } from '../listeners/cleanup.ts'

const Deno_exit: typeof Deno.exit = Deno.exit.bind(Deno);

Deno.exit = function exit(code?: number): never {
    callCleanupListeners();
    Deno_exit(code);
}

window.addEventListener('unhandledrejection', callCleanupListeners);
window.addEventListener('beforeunload'      , callCleanupListeners);
window.addEventListener('unload'            , callCleanupListeners);
