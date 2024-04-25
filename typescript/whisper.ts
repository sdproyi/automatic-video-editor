import { $, Glob } from "bun";
import projectSettings from "../config/projectSettings";
import { refineWhisperWords, transcriptionRefined } from "./jsonManipulation";
import {
	createVideoFromCuttedParts,
	removeUnwantedWords,
} from "./removeUnwatnedWords";
import { deleteUnusedParts } from "./deleteEverything";
const glob: Glob = new Glob("*");

const findAudio: string[] = [];

for await (const file of glob.scan("./audio/")) {
	findAudio.push(file);
}
async function whisper() {
	if (!findAudio.includes("audio.wav")) {
		await $`ffmpeg -i ./videos/silenceRemoved.mp4 -y ./audio/audio.wav`;
	}

	// Call whisper_timestamped only if no words need removal
	if (projectSettings.SpeechToText.removeWords.length === 0) {
		await $`whisper_timestamped "./audio/audio.wav" --language ${projectSettings.SpeechToText.language} --output_format json --output_dir "./config/json/" --efficient --threads 8 --model ${projectSettings.SpeechToText.AImodel}`;
	}

	await refineWhisperWords();
	await transcriptionRefined();

	if (projectSettings.SpeechToText.removeWords.length === 0) {
		console.error(
			"Now run the bun typescript/index.ts and paste to the rojectSettings.ts, removeWords: []",
		);
		return;
	}
	await removeUnwantedWords();
	await createVideoFromCuttedParts();
	await deleteUnusedParts();
}

whisper();
