import { addGarbageCollectionListener, removeGarbageCollectionListener } from './listeners/garbage-collection.ts'
import { addCleanupListener, removeCleanupListener } from './listeners/cleanup.ts'
import { createWeakView } from './weak-view.ts'
import { frozenSet } from './utils.ts'

const CreateError = `A Recyclable instance may not call the ::create() method more than once`;
const DeleteError = `A Recyclable instance may not call the ::delete() method more than once`;

function patchedCreate() {
    throw new Error(CreateError);
}

export default abstract class Recyclable<Parameters extends unknown[] = []> {
    abstract create(...params: Parameters): void;
    abstract delete(): void;

    constructor(...params: Parameters) {
        let destroyed = false;
        let weakThis  = createWeakView(this);
        let ref       = this as typeof this | null;

        const methods = {
            // @ts-ignore
            create: Function.call.bind(this.create),
            delete: Function.call.bind(this.delete)
        }

        const cleanup = () => {
            if (destroyed)
                throw new Error(DeleteError);
            
            // Allow for the original this to also be GC'd
            let This  = ref;
            destroyed = true;
            ref       = null;

            removeCleanupListener(cleanup);
            removeGarbageCollectionListener(cleanup);

            methods.delete(This);
        }

        frozenSet(this, 'create', patchedCreate);
        frozenSet(this, 'delete', cleanup);

        addCleanupListener(cleanup);
        addGarbageCollectionListener(weakThis, cleanup);
        
        methods.create(weakThis, ...params);

        return weakThis;
    }
}
