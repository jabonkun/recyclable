<p align="center">
	<img src="https://raw.githubusercontent.com/jabonkun/recyclable/main/header.png">
</p>

<hr />

*A TypeScript library for Deno 🦕 designed to provide a high-level API to manage low-level resources.*

**Recyclable** allows you to free and/or close your resources automatically, preventing memory leaks and unnecessary memory usage. It uses V8's Garbage Collection system to know when to clean up, and, if the object is never collected, then it will be free'd right before the program exits.

<br />

## Advantages
<hr />

- 🌐 **Cross-Platform**. Works on Windows, Linux and MacOS.
- 🎉 **Portable**. Zero dependencies
- 🔐 **Secure**. No permission flags needed
- 📚 **Types**. Includes types declarations

<br />

## Table of Contents
<hr />

- <a  href="#start">Quick Start</a>
- <a  href="#docs">Documentation</a>
- <a  href="#use">Usage</a>
- <a  href="#issues">Known Issues ⚠️</a>
- <a  href="#bugs">Suggestions and Bugs 🐞</a>
- <a  href="#license">License</a>

<br />

<a name="start"></a>
## Quick Start
<hr />

To use Recyclable, simply import it into your project like this:

```ts
import Recyclable from "https://deno.land/x/recyclable/mod.ts";
```

Then, extend the ``Recyclable`` class and implement the ``create()`` and ``delete()`` methods.

```ts
class SomeClass extends Recyclable {
	create() {
		// Initialize and allocate the object here
	}
  
	delete() {
		// Clean up and free the resources here
	}
}
```

**IMPORTANT:** Recyclable must be the first module you import in your proyect, as it relies on Monkey-patching the ``Deno.exit()``, ``Deno.addSignalListener()`` and ``Deno.removeSignalListener()`` methods. Until Deno adds proper way of handling exit events, this is the only option.

<br />

<a name="docs"></a>
## Documentation
<hr />

Recyclable exports a _single_, _default_, _export_, which is an abstract class named ``Recyclable`` with the following implementation:
```ts
abstract class Recyclable<Parameters extends unknown[] = []> {
	constructor(...params: Parameters);
	
	abstract create(...params: Parameters): void;
	abstract delete(): void;
}
```

You must extend the ``Recyclable`` class to use it, and then, when an instance of your class is constructed, the underlying ``Recyclable`` 's constructor will...
- Create a "Symbolic Reference" to the actual instance, which will be returned by the class
- Call ``create()`` with the same arguments that were passed to ``super()`` and with the "Symbolic Reference" as ``this`` parameter
- Define non-configurable wrappers for ``delete()`` and ``create()`` in the instance to prevent calling them more than once

<br />

Since a "Symbolic Reference" (Made via ``Proxy``ing the real instance) is returned, it's possible to detect when the object is out of reach while mainting the original instance available so it can be used as ``this`` parameter for the ``delete()`` function, which will be called when...
- The "Symbolic Reference" instance is garbage collected
- ``Deno.exit()`` gets called
- A process-terminating signal (Like ``SIGINT`` sent by ``CTRL+C``) is received
- No code to execute is left

And in the case that a ``delete()`` method throws while being called right before exiting, it will print the uncaught error to stderr but won't prevent the rest of ``delete()`` methods in queue from being called, ensuring that every object is free'd before exiting.

<br />

However, this also introduces some **limitations**:

- ``create()`` and ``delete()`` can **only be called once**. In the case of ``create()``, it is called when constructing the instance, so in practice, it can't never be called. In the other hand, ``delete()`` is called automatically, unless you have called it before manually (However the purpose of this library is that you don't have to... so why would you? 🤔).

- A ``Reference`` instance **can not** create any circular references of the instance during any moment at runtime (circulars of other objects inside of it are allowed, just not of the instance itself), otherwise, an error will be thrown by the ``Proxy`` traps.

- ``create()`` **can not** use any asynchronous methods or be asynchronous itself, as that would make it return a ``Promise`` which is unsupported.

- ``delete()`` **can not** use any asynchronous methods or be asynchronous itself, as that would require the program to continue executing in circumstances where it shouldn't like when calling ``Deno.exit()``.

- In TypeScript, the `declare` keyword **must** be used when defining class properties. If you do not, the properties will be set to their default value or `undefined` after the `super()` and `create()` calls return.

- In JavaScript, class properties that are initialized by ``create()`` **cannot** be specified in the class body nor have default values for the same reason listed above.

<br />

<a name="use"></a>
## Usage
<hr />

Let's take a look at some examples to understand better  how to use Recyclable. Our first example shows us how to use ``Deno.dlopen`` and ``Recyclable`` together.

**Using Deno.dlopen with Recyclable:**
```ts
import Recyclable from "https://deno.land/x/recyclable/mod.ts";

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
```
**Output:**
```
Opening the user32.dll library
Closing the user32.dll library
```
*(This example requires the ``--allow-ffi`` and ``--unstable`` flags).*

In this example ``User32::delete()`` was called and closed the ``Deno.DynamicLibrary`` even thought we never explicitly called that function. That is thanks to the ``Recyclable`` class calling the method right before exiting.

<br /><br />**Using Deno.FsFile with Recyclable:**
```ts
import Recyclable from "https://deno.land/x/recyclable/mod.ts";

class WritableFile extends Recyclable<[filepath: string]> {
	// Don't forget to use the declare keyword
	declare filepath: string;
	declare encoder: TextEncoder;
	declare fsFile: Deno.FsFile;

	create(filepath: string) {
		console.log(`Opening a handle to ${filepath}`);
		
		this.filepath = filepath;
		this.encoder = new TextEncoder();
		this.fsFile = Deno.openSync(filepath, { write: true, create: true });
	}

	delete() {
		console.log(`Closing the handle to ${this.filepath}`);
		this.fsFile.close();
	}

	write(contents: string) {
		let buffer = this.encoder.encode(contents);
		this.fsFile.writeSync(buffer);

		return buffer.length;
	}
}

let myFile = new WritableFile('./greeting.txt');
let written = myFile.write('Hello, World!');

console.log(`${written} bytes written to ${myFile.filepath}. Time to exit`);
Deno.exit(0);
// No need to manually call myFile.fsFile.close() Yey! 🥳
```
**Output**
```
Opening a handle to ./greeting.txt
13 bytes written to ./greeting.txt. Time to exit
Closing the handle to ./greeting.txt
```
*(This example requires the ``--allow-write`` flag).*

This example is very interesting, as we can see that ``Deno.exit()`` is called without ``WritableFile::delete()`` being called before, yet it is called anyways right after ``Deno.exit()`` gets called without preventing the program from exiting.

<br />

<a name="issues"></a>
## Known Issues ⚠️
<hr />

- Certain signals cannot be handled as the OS does not allows them to be handled, that means that, despite ``Recyclable`` trying it's best to make sure that ``delete()`` is called before exiting, it is not guaranteed under the circumstance that an unhandleable signal is sent. However, if the user is sending these signals, it should know that not a single program will be able to gracefully exit, so... 🤷‍♀️

- Currently, it is **not possible** to detect when the console attached to the Deno process is **destroyed/detached** on Windows, such as when the user closes the command prompt. This limitation is due to the Deno runtime's lack of support for adding listeners to the ``SIGHUP`` signal. Any attempts to use ``SetConsoleCtrlHandler`` will cause Deno to panic. One possible workaround is to hide the Terminal window completely using the Windows API to prevent the user from closing the command prompt, but this approach has its own drawbacks and is beyond the scope of this library.

<br />

<a name="bugs"></a>
## Suggestions and Bugs 🐞
<hr />

Aaaand just like that you've reached the end! But remember, despite there being only 2 examples, there are many more uses you can give to this library! If you have any suggestions, or want to report a bug, please do so by creating an issue at [Recyclable's Repository](https://github.com/jabonkun/recyclable). 

<br />

<a name="license"></a>
## License
<hr />

Recyclable is licensed under the MIT License. By using it, you accept the conditions and limitations specified in the [LICENSE](https://choosealicense.com/licenses/mit/) file.

Copyright © 2023 [@jabonkun](https://github.com/jabonkun)
