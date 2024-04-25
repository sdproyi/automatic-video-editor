import { For, type Component } from "solid-js";
import transcription from "../config/json/transcription-unwantedWords.json";
import { createSignal, createEffect } from "solid-js";
import { writeClipboard, copyToClipboard } from "@solid-primitives/clipboard";
import {
	createFileSystem,
	makeVirtualFileSystem,
} from "@solid-primitives/filesystem";

const vfs = makeVirtualFileSystem({});
const fs = createFileSystem(vfs);

createEffect(() => {
	fs.writeFile("/yfeuibyf.js", "disybidsyb");
});

const App: Component = () => {
	const storage = window.localStorage;
	// Create a reactive signal to hold the array
	const [idArray, setIdArray] = createSignal<number[]>([]);

	return (
		<div class="m-5">
			<For each={transcription}>
				{(value, i) => (
					<button
						type="button"
						class={`${
							idArray().includes(value.id) ? "bg-red-500" : "text-black"
						} px-1`}
						onMouseDown={() => {
							const updatedArray = idArray(); // Get the current array state

							if (updatedArray.includes(value.id)) {
								// Element exists in the array, remove it
								const filteredArray = updatedArray.filter(
									(id) => id !== value.id,
								);
								setIdArray(filteredArray);
								console.log(filteredArray);
							} else {
								// Element doesn't exist, add it (same logic as before)
								setIdArray([...updatedArray, value.id]);
								console.log([...updatedArray, value.id]);
								storage.setItem(
									"ids",
									JSON.stringify(setIdArray([...updatedArray, value.id])),
								);
								writeClipboard(
									JSON.stringify(setIdArray([...updatedArray, value.id])),
								);
								console.log("localStorage:", storage.getItem("ids"));
								fs;
							}
						}}
					>
						{value.word}
					</button>
				)}
			</For>
			<br />
			<input
				class="w-full h-7 bg-gray-400 rounded-xl"
				type="button"
				use:copyToClipboard
			/>
		</div>
	);
};

export default App;
