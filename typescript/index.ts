import { Glob, $ } from "bun";
import { removeSileceFromVideo } from "./removeSilence";
import projectSettings from "../config/projectSettings";
import audio from "../config/json/audio.wav.words.json";
import { removeUnwantedWords, createVideoFromCuttedParts } from "./removeUnwatnedWords";
const audioWordsJson = audio;
const glob: Glob = new Glob("*.mp4");

const findVideo: string[] = [];
const inputVideo: string[] = [];

for await (const file of glob.scan("./videos/")) {
	findVideo.push(file);
}
for await (const file of glob.scan("./config/video/input/")) {
	inputVideo.push(file);
}

const outputVideo: string[] = [];
for await (const file of glob.scan("./config/video/output/")) {
	outputVideo.push(file);
}

async function stateManager() {
	if (!(inputVideo.length === 1)) {
		console.error("You need to have 1 video in ./config/video/input/");
		return;
	}

	if (outputVideo.includes("output.mp4")) {
		console.error(
			"Results are in ./config/video/output/ remove it to create a new one",
		);
		return;
	}
	if (!projectSettings.CutOutSilence.use) {
		return;
	}

	if (!findVideo.includes("silenceRemoved.mp4")) {
		await removeSilence();
		if (!projectSettings.SpeechToText.use) {
			return;
		}
		if (Object.keys(audioWordsJson).length !== 0) {
			return;
		}
		await $`bun typescript/whisper.ts`;
		return;
	}

	
	if (!projectSettings.SpeechToText.use) {
		return;
	}

	if (Object.keys(audioWordsJson).length === 0) {
		return;
	}
	await $`bun typescript/whisper.ts`;

	if (projectSettings.SpeechToText.removeWords.length === 0) {
		console.error(
			"Now run the bun typescript/index.ts and paste to the rojectSettings.ts, removeWords: []",
		);
		return;
	}
	
}
stateManager();

async function removeSilence() {
	if (!findVideo.includes("unedited.mp4")) {
		await $`ffmpeg -v info -i ./config/video/input/unedited.mp4 -r 30 -c:v mpeg4 -b:v 5M -c:a copy ./videos/unedited.mp4`;
		await removeSileceFromVideo(
			import.meta.resolve("../videos/unedited.mp4"),
			projectSettings.CutOutSilence.padding ?? 0,
		);
		return;
	}
	await removeSileceFromVideo(
		import.meta.resolve("../videos/unedited.mp4"),
		projectSettings.CutOutSilence.padding ?? 0,
	);
}
