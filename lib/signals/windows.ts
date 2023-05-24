export type  TERM_SIGNALS = keyof typeof TERM_STATUS;
export const TERM_SIGNALS: TERM_SIGNALS[] = [
    'SIGINT'  ,
    'SIGBREAK'
]

/**
 * I ran some apps on the Command Prompt myself
 * then sent them the signals and took a look at
 * %ERRORLEVEL%. This is what I found
 */
export const TERM_STATUS = {
    SIGINT  : -1073741510,
    SIGBREAK: -1073741510
}
