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

    for (let i = index; i < array.length; i++)
        array[i] = array[i + 1];

    array.pop();
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
    const backup = [ ...array ];

    while (array.length)
        array.pop();

    return backup;
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