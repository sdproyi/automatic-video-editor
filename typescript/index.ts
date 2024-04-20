import OpenAI from "openai";
import { Glob, $ } from "bun";
import { unlink } from "node:fs/promises";
import fs from "node:fs";
import chalk from "chalk";
import { videoRequirements } from "./types/types";
import { removeSileceFromVideo } from "./removeSilence";
import projectSettings from "../config/projectSettings";

const removedUnwantedWords: string = import.meta.resolve(
	"../videos/removed-unwanted-words",
);

const glob: Glob = new Glob("*");
const cuttedOutUnwantedWordsVideoList: string = import.meta.resolve(
	"../config/text/inputs-unwanted.txt",
);

const editedUnwantedWords: string = "./removed-unwanted-words";
import unwantedWords from "../config/json/transcription-unwantedWords.json";

const openai = new OpenAI({
	apiKey: Bun.env.OPENAI_API_KEY,
});

// projectSettings.CutOutSilence.use &&
// 	removeSileceFromVideo(videoRequirements.uneditedVideo, projectSettings.CutOutSilence.padding ?? 0)

async function createTranscriptionFromVideoAudio(audioInput: string) {
	await $`ffmpeg -i ${videoRequirements.output} -y ${audioInput}`;

	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(audioInput),
		model: "whisper-1",
		response_format: "verbose_json",
		timestamp_granularities: ["segment"],
	});

	await Bun.write("transcription.json", JSON.stringify(transcription, null, 2));
}

async function removeUnwantedWords() {
	// let videos = 0;
	// let stepsTrim = "";
	// let concatInputs = "";

	// for (let i = 0; i < unwantedWords.length; i++) {
	// 	if (unwantedWords[i].keepORdelete === true) {
	// 		stepsTrim += `[0:v]trim=0:${
	// 			unwantedWords[i].start
	// 		},setpts=PTS[v${i}];[0:a]atrim=0:${
	// 			unwantedWords[i].start
	// 		},asetpts=PTS-STARTPTS[a${i}];[0:v]trim=${unwantedWords[i].start}:${
	// 			unwantedWords[i].end
	// 		},setpts=PTS[v${unwantedWords.length + i + 1}];[0:a]atrim=${
	// 			unwantedWords[i].start
	// 		}:${unwantedWords[i].end},asetpts=PTS-STARTPTS[a${
	// 			unwantedWords.length + i + 1
	// 		}];`;

	// 		concatInputs += `[v${i}][a${i}][v${unwantedWords.length + i + 1}][a${
	// 			unwantedWords.length + i + 1
	// 		}]`;
	// 		videos += 2;
	// 	}
	// }
	// stepsTrim = stepsTrim.slice(0, -1);

	// await $`ffmpeg -hide_banner -i ${videoRequirements.output} -filter_complex "${{raw:stepsTrim}},${{raw:concatInputs}} concat=n=${videos}:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]" -c:v libopenh264 -preset slow -c:a mp3 -vsync 1 -y ${removedUnwantedWords}/fastAf.mp4`;

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
		await $ `ffmpeg -hide_banner  -hwaccel_output_format cuda -threads 8 -i ${videoRequirements.output} -ss ${compressedJson[i].start} -to ${compressedJson[i].end} -y -c:v libopenh264 -preset slow -c:a copy ${removedUnwantedWords}/${i}.mp4 `.stdin
	}
}
removeUnwantedWords()
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
		files.push(`\n file '${editedUnwantedWords}/${file}'`);
		deleteFiles.push(`${editedUnwantedWords}/${file}`);
	}
	// console.log(deleteFiles);
	console.log(files);
	for (const file of files) {
		console.log(`${chalk.yellow("Concated:")} ${file}`);
	}

	await Bun.write(cuttedOutUnwantedWordsVideoList, files);
	await $`ffmpeg -hide_banner -f concat -safe 0  -i ${cuttedOutUnwantedWordsVideoList} -y -c copy ${videoRequirements.outputWantedWordsVideo} && echo "Video creation successful!" || echo "Error creating video.`;
}
