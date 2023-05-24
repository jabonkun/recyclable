import Recyclable from "../mod.ts";

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
