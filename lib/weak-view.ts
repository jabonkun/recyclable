const error = `A Recyclable instance may not contain a reference to itself in any way`;
const seen  = new WeakSet();

function references(search: object[], value: unknown) {
    if (typeof value !== 'object' || value === null)
        return false;

    if (seen.has(value))
        return search.some(element => value === element);

    seen.add(value);
    
    let descriptors = Object.getOwnPropertyDescriptors(value);
    let prototype   = Object.getPrototypeOf(value);

    if (references(search, prototype))
        return true;

    for (let key in descriptors) {
        let descriptor = descriptors[key];

        if (descriptor.hasOwnProperty('value')) {
            if (references(search, descriptor.value))
                return true;

        } else if (references(search, descriptor.get) || references(search, descriptor.set)) {
            return true;
        }
    }
  
    return false;
}

export function createWeakView<Shape extends object>(value: Shape): Shape {
    if (references([ value ], value))
        throw new ReferenceError(error);
    
    let weakView = new Proxy(value, {
        set(target, property, value, receiver) {
            if (references([ weakView, target ], value))
                throw new ReferenceError(error);

            return Reflect.set(target, property, value, receiver);
        },

        defineProperty(target, property, descriptor) {
            if (descriptor.hasOwnProperty('value')) {
                if (references([ weakView, target ], descriptor.value))
                    throw new ReferenceError(error);
    
            } else if (references([ weakView, target ], descriptor.get) || references([ weakView, target ], descriptor.set)) {
                throw new ReferenceError(error);
            }

            return Reflect.defineProperty(target, property, descriptor);
        },

        setPrototypeOf(target, prototype) {
            if (references([ weakView, target ], prototype))
                throw new ReferenceError(error);

            return Reflect.setPrototypeOf(target, prototype);
        },
    })

    return weakView;
}