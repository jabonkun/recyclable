export type  TERM_SIGNALS = keyof typeof TERM_STATUS;
export const TERM_SIGNALS: TERM_SIGNALS[] = [
    'SIGHUP'   ,
    'SIGINT'   ,
    'SIGQUIT'  ,
    'SIGILL'   ,
    'SIGTRAP'  ,
    'SIGABRT'  ,
    'SIGIOT'   ,
    'SIGBUS'   ,
    'SIGFPE'   ,
    'SIGKILL'  ,
    'SIGUSR1'  ,
    'SIGSEGV'  ,
    'SIGUSR2'  ,
    'SIGPIPE'  ,
    'SIGALRM'  ,
    'SIGTERM'  ,
    'SIGSTKFLT',
    'SIGXCPU'  ,
    'SIGXFSZ'  ,
    'SIGVTALRM',
    'SIGPROF'  ,
    'SIGIO'    ,
    'SIGPOLL'  ,
    'SIGPWR'   ,
    'SIGSYS'   ,
    'SIGUNUSED'
]

/**
 * On most Unix systems, the Exit Code or Status of
 * an app terminated by one of those app-terminated
 * signals is the Signal ID + 128
 */
export const TERM_STATUS = {
    SIGHUP:     1 + 128,
    SIGINT:     2 + 128,
    SIGQUIT:    3 + 128,
    SIGILL:     4 + 128,
    SIGTRAP:    5 + 128,
    SIGABRT:    6 + 128,
    SIGIOT:     6 + 128,
    SIGBUS:     7 + 128,
    SIGFPE:     8 + 128,
    SIGKILL:    9 + 128,
    SIGUSR1:   10 + 128,
    SIGSEGV:   11 + 128,
    SIGUSR2:   12 + 128,
    SIGPIPE:   13 + 128,
    SIGALRM:   14 + 128,
    SIGTERM:   15 + 128,
    SIGSTKFLT: 16 + 128,
    SIGXCPU:   24 + 128,
    SIGXFSZ:   25 + 128,
    SIGVTALRM: 26 + 128,
    SIGPROF:   27 + 128,
    SIGIO:     29 + 128,
    SIGPOLL:   29 + 128,
    SIGPWR:    30 + 128,
    SIGSYS:    31 + 128,
    SIGUNUSED: 31 + 128
}