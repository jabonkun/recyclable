const RegularExpressions = {
    ErrorIncludesMethod: {
        match  : /at (.*?) (\(|\<)(.*?)(\:)?([0-9]*)?(\:)?([0-9]*)?(\)|\>)\n/g,
        replace: '\x1b[0mat \x1b[1;3;97m$1\x1b[0m (\x1b[92m$3\x1b[0m$4\x1b[1;94m$5\x1b[0m$6\x1b[1;94m$7\x1b[0m)\n'
    },

    ErrorWithoutMethod: {
        match  : /at ([^\n ]*?)(\:)?([0-9]*)?(\:)?([0-9]*)?\n/g,
        replace: '\x1b[0mat \x1b[92m$1\x1b[0m$2\x1b[1;94m$3\x1b[0m$4\x1b[1;94m$5\x1b[0m\n'
    }
}

export function frozenSet<Value extends unknown>(target: object, property: string, value: Value) {
    return Object.defineProperty(target, property, {
        configurable: false,
        enumerable  : false,
        writable    : false,
        value
    })
}

export function remove<Element extends unknown>(array: Element[], element: Element) {
    let index = array.indexOf(element);

    if (index < 0)
        return;

    array.splice(index, 1);
    return;
}

export function add<Element extends unknown>(array: Element[], element: Element) {
    if (!array.includes(element))
        array.push(element);
}

export function prepend<Element extends unknown>(array: Element[], element: Element) {
    if (!array.includes(element))
        array.unshift(element);
}

export function empty<Element extends unknown>(array: Element[]) {
    return array.splice(0, array.length);
}

export function printUncaught(err: unknown) {
    let message = '\x1b[0;1;91merror\x1b[0m: Uncaught ';

    if (!(err instanceof Error)) {
        message += Deno.inspect(err, { colors: true });
        console.error(message);

        return;
    }

    message += err.stack;

    if (!message.endsWith('\n'))
        message += '\n';

    message = message.replace(RegularExpressions.ErrorIncludesMethod.match, RegularExpressions.ErrorIncludesMethod.replace);
    message = message.replace(RegularExpressions.ErrorWithoutMethod.match , RegularExpressions.ErrorWithoutMethod.replace );
    message = message.trim();

    console.error(message);
}

export function defineValue<T extends unknown>(obj: object, prop: string | symbol | number, value: T) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop) ?? {};

    if (descriptor.get)
        delete descriptor.get;

    if (descriptor.set)
        delete descriptor.set;

    descriptor.configurable ??= true;
    descriptor.enumerable   ??= false;
    descriptor.writable     ??= true;

    descriptor.value = value;

    Object.defineProperty(obj, prop, descriptor);
    return value;
}

export function tryCall(callback: () => void) {
    try {
        callback();
    } catch(err: unknown) {
        printUncaught(err);
    }
}

export const threadUnsafe = function(parameters, callback) {
    // This simple trick allows the callback to wake up the
    // event loop without preventing the program from
    // exiting. Not sure if it's intentional or not. Hope it is

    let cb = Deno.UnsafeCallback.threadSafe(parameters as any, callback);
        cb.unref();

    return cb;
} as typeof Deno.UnsafeCallback.threadSafe
