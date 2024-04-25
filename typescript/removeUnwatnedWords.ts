import { $, Glob } from "bun";
import { unlink } from "node:fs/promises";
import chalk from "chalk";
import { videoRequirements } from "./types/types";

import OpenAI from "openai";

const editedUnwantedWordsFFMPEG: string = "videos/removed-unwanted-words";
const cuttedOutUnwantedWordsVideoList: string =
	"./config/text/inputs-unwanted.txt";

const removedUnwantedWords: string = "./videos/removed-unwanted-words";
const glob: Glob = new Glob("*.mp4");

const editedUnwantedWords: string = "./videos/removed-unwanted-words";
const openai = new OpenAI({
	apiKey: Bun.env.OPENAI_API_KEY,
});

export async function removeUnwantedWords() {
	const unwantedWordsJson = import("../config/json/transcription-unwantedWords.json")
	const unwantedWords = (await unwantedWordsJson).default
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
		await $`ffmpeg -hide_banner -nostdin -v info  -i ${videoRequirements.silenceRemovedVideo} -ss ${compressedJson[i].start} -to ${compressedJson[i].end} -y -c:v copy -c:a copy  ${removedUnwantedWords}/${i}.mp4 `;


	}
}
export async function createVideoFromCuttedParts() {
	const deleteFiles: string[] = [];
	const files: string[] = [];

	for (const file of glob.scanSync(editedUnwantedWords)) {
		files.push(`\n file '../../${editedUnwantedWordsFFMPEG}/${file}'`);
		deleteFiles.push(`${editedUnwantedWordsFFMPEG}/${file}`);
	}

	await Bun.write(cuttedOutUnwantedWordsVideoList, files);

	await $`ffmpeg -hide_banner -f concat -safe 0  -i ${cuttedOutUnwantedWordsVideoList} -y -c copy ${videoRequirements.outputWantedWordsVideo}`;
}
