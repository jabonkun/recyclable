import Recyclable from "../mod.ts";

class User32 extends Recyclable {
	// Don't forget to use the declare keyword
	declare library: Deno.DynamicLibrary<{
		MessageBoxA: {
			parameters: [ 'i32', 'buffer', 'buffer', 'i32' ],
			result: 'i32'
		}
	}>;

	create() {
		console.log('Opening the user32.dll library');
		
		this.library = Deno.dlopen('user32', {
			MessageBoxA: {
				parameters: [ 'i32', 'buffer', 'buffer', 'i32' ],
				result: 'i32'
			}
		})
	}

	delete() {
		console.log('Closing the user32.dll library');
		this.library.close();
	}
}

let encoder = new TextEncoder();
let user32  = new User32();

function CString(str: string) {
	return encoder.encode(`${str}\0`).buffer;
}

user32.library.symbols.MessageBoxA(0, CString('Hello world!'), CString('My Message Box'), 0);
// No need to manually call user32.library.close() Yey! 🥳
