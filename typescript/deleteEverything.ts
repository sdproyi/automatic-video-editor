import { file, Glob } from "bun";
import chalk from "chalk";
import { unlink } from "node:fs/promises";

const editedUnwantedWords: string = "./videos/removed-unwanted-words";
const silenceVideos: string = "./videos/silence-removed";
const reusableVideos: string = "./videos";
const audio: string = "./audio";
const glob: Glob = new Glob("*.mp4");
const globAudio: Glob = new Glob("*.wav");
export async function deleteUnusedParts() {
	const deleteFiles: string[] = [];
	const files: string[] = [];

	for (const file of glob.scanSync(editedUnwantedWords)) {
		files.push(`\n file '${editedUnwantedWords}/${file}'`);
		deleteFiles.push(`${editedUnwantedWords}/${file}`);
	}
	for (const file of glob.scanSync(silenceVideos)) {
		files.push(`\n file '${silenceVideos}/${file}'`);
		deleteFiles.push(`${silenceVideos}/${file}`);
	}
	for (const file of glob.scanSync(reusableVideos)) {
		files.push(`\n file '${reusableVideos}/${file}'`);
		deleteFiles.push(`${reusableVideos}/${file}`);
	}
	for (const file of globAudio.scanSync(audio)) {
		files.push(`\n file '${audio}/${file}'`);
		deleteFiles.push(`${audio}/${file}`);
	}
	await Bun.write("./config/json/transcription-refined.json", "{}");
	await Bun.write("./config/json/transcription-unwantedWords.json", "{}");
	await Bun.write("./config/json/audio.wav.words.json", "{}");

	for (const i of deleteFiles) {
		await unlink(i);
		console.log(`${chalk.red("Deleted:")} ${i}`);
	}
}
deleteUnusedParts()