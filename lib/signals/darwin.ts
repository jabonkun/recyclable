export type  TERM_SIGNALS = keyof typeof TERM_STATUS;
export const TERM_SIGNALS: TERM_SIGNALS[] = [
    'SIGHUP'   ,
    'SIGINT'   ,
    'SIGQUIT'  ,
    'SIGILL'   ,
    'SIGTRAP'  ,
    'SIGABRT'  ,
    'SIGEMT'   ,
    'SIGFPE'   ,
    'SIGKILL'  ,
    'SIGBUS'   ,
    'SIGSEGV'  ,
    'SIGSYS'   ,
    'SIGPIPE'  ,
    'SIGALRM'  ,
    'SIGTERM'  ,
    'SIGSTOP'  ,
    'SIGTSTP'  ,
    'SIGTTIN'  ,
    'SIGTTOU'  ,
    'SIGXCPU'  ,
    'SIGXFSZ'  ,
    'SIGVTALRM',
    'SIGPROF'  ,
    'SIGUSR1'  ,
    'SIGUSR2'
]

/**
 * On most Unix systems, the Exit Code or Status of
 * an app terminated by one of those app-terminated
 * signals is the Signal ID + 128. So since MacOS
 * is POSIX based I assume it does the same?
 */
export const TERM_STATUS = {
    SIGHUP   :  1 + 128,
    SIGINT   :  2 + 128,
    SIGQUIT  :  3 + 128,
    SIGILL   :  4 + 128,
    SIGTRAP  :  5 + 128,
    SIGABRT  :  6 + 128,
    SIGEMT   :  7 + 128,
    SIGFPE   :  8 + 128,
    SIGKILL  :  9 + 128,
    SIGBUS   : 10 + 128,
    SIGSEGV  : 11 + 128,
    SIGSYS   : 12 + 128,
    SIGPIPE  : 13 + 128,
    SIGALRM  : 14 + 128,
    SIGTERM  : 15 + 128,
    SIGSTOP  : 17 + 128,
    SIGTSTP  : 18 + 128,
    SIGTTIN  : 21 + 128,
    SIGTTOU  : 22 + 128,
    SIGXCPU  : 24 + 128,
    SIGXFSZ  : 25 + 128,
    SIGVTALRM: 26 + 128,
    SIGPROF  : 27 + 128,
    SIGUSR1  : 30 + 128,
    SIGUSR2  : 31 + 128
}