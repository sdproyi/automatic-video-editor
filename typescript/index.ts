import OpenAI from "openai";
import { Glob, $ } from "bun";
import { unlink } from "node:fs/promises";
import fs from "node:fs";
import chalk from "chalk";
import { videoRequirements } from "./types/types";
import { removeSileceFromVideo } from "./removeSilence";
import projectSettings from "../config/projectSettings";

const removedUnwantedWords: string = "./videos/removed-unwanted-words";

const glob: Glob = new Glob("*.mp4");
const cuttedOutUnwantedWordsVideoList: string =
	"./config/text/inputs-unwanted.txt";

const editedUnwantedWords: string = "./videos/removed-unwanted-words";
const editedUnwantedWordsFFMPEG: string = "videos/removed-unwanted-words";
import unwantedWords from "../config/json/transcription-unwantedWords.json";

const openai = new OpenAI({
	apiKey: Bun.env.OPENAI_API_KEY,
});
const findVideo = [];
for await (const file of glob.scan("./videos/")) {
	findVideo.push(file);
}
const inputVideo = [];
for await (const file of glob.scan("./config/video/input/")) {
	inputVideo.push(file);
}
if (inputVideo.length > 1) {
	console.error('".config/video/input has 2 or more files"');
} else {
	if (
		findVideo.find((x) => x === "silenceRemoved.mp4") === "silenceRemoved.mp4"
	) {
		// await $`ffmpeg -i ./videos/silenceRemoved.mp4  ./audio/audio.wav`
		await removeUnwantedWords();
		await createVideoFromCuttedParts();
	} else {
		if (findVideo.find((x) => x === "unedited.mp4") === "unedited.mp4") {
			projectSettings.CutOutSilence.use &&
				removeSileceFromVideo(
					import.meta.resolve("../videos/unedited.mp4"),
					projectSettings.CutOutSilence.padding ?? 0,
				);
		} else {
			await $`ffmpeg -v info -i ./config/video/input/unedited.mp4 -r 30 -c:v mpeg4 -b:v 5M -c:a copy ./videos/unedited.mp4`;
			projectSettings.CutOutSilence.use &&
				removeSileceFromVideo(
					import.meta.resolve("../videos/unedited.mp4"),
					projectSettings.CutOutSilence.padding ?? 0,
				);
		}
	}
}

async function removeUnwantedWords() {
	const filteredWords = unwantedWords.filter((word) => word.keepORdelete);
	const wordIds = filteredWords.map((word) => word.id);
	function findConsecutiveArraysMinMax(wordIds: number[]): TimeCalculator {
		const consecutiveArrays = [];
		let currentArray = [];

		for (let i = 0; i < wordIds.length - 1; i++) {
			currentArray.push(wordIds[i]);

			if (wordIds[i] + 1 !== wordIds[i + 1]) {
				consecutiveArrays.push({
					array: currentArray,
					smallest: Math.min(...currentArray),
					biggest: Math.max(...currentArray),
				});
				currentArray = [];
			}
		}
		if (currentArray.length > 0) {
			currentArray.push(wordIds[wordIds.length - 1]);
			consecutiveArrays.push({
				array: currentArray,
				smallest: Math.min(...currentArray),
				biggest: Math.max(...currentArray),
			});
		}

		return consecutiveArrays;
	}

	const consecutiveArraysMinMax: TimeCalculator =
		findConsecutiveArraysMinMax(wordIds);

	const compressedJson = [];
	for (const value of consecutiveArraysMinMax.entries()) {
		compressedJson.push({
			id: value[0],
			start: unwantedWords[value[1].smallest].start,
			end: unwantedWords[value[1].biggest].end,
		});
	}

	for (let i = 0; i < compressedJson.length; i++) {
		console.log(i,compressedJson[i].start, compressedJson[i].end);
		await $`ffmpeg -hide_banner -nostdin -v info  -i ${videoRequirements.silenceRemovedVideo} -ss ${compressedJson[i].start} -to ${compressedJson[i].end} -y -c:v copy -c:a copy  ${removedUnwantedWords}/${i}.mp4 `;

		console.log(`ffmpeg -hide_banner -nostdin -v info  -i ${videoRequirements.silenceRemovedVideo} -ss ${compressedJson[i].start} -to ${compressedJson[i].end} -y -c:v copy -c:a copy  ${removedUnwantedWords}/${i}.mp4 `)

		// -c:v ${projectSettings.FfmpegSettings.VideoCodec} -c:a copy
		// codec test passed:
		// mpeg4 3~s/1s, mpeg2video 2.5s/1s,-c:v copy
	}
}
async function deleteUnusedParts() {
	const deleteFiles: string[] = [];
	const files: string[] = [];

	for (const file of glob.scanSync(editedUnwantedWords)) {
		files.push(`\n file '${editedUnwantedWords}/${file}'`);
		deleteFiles.push(`${editedUnwantedWords}/${file}`);
	}
	// console.log(deleteFiles);
	console.log(files);

	for (const i of deleteFiles) {
		await unlink(i);
		console.log(`${chalk.red("Deleted:")} ${i}`);
	}
}

async function createVideoFromCuttedParts() {
	const deleteFiles: string[] = [];
	const files: string[] = [];

	for (const file of glob.scanSync(editedUnwantedWords)) {
		files.push(`\n file '../../${editedUnwantedWordsFFMPEG}/${file}'`);
		deleteFiles.push(`${editedUnwantedWordsFFMPEG}/${file}`);
	}
	// console.log(deleteFiles);
	console.log(files);
	for (const file of files) {
		console.log(`${chalk.yellow("Concated:")} ${file}`);
	}

	await Bun.write(cuttedOutUnwantedWordsVideoList, files);

	await $`ffmpeg -hide_banner -f concat -safe 0  -i ${cuttedOutUnwantedWordsVideoList} -y -c copy ${videoRequirements.outputWantedWordsVideo}`;
}
