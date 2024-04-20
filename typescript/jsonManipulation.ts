import transcription from "../config/json/audio.mp3.words.json";
import projectSettings from "../config/projectSettings";
import { $ } from "bun";

await $`whisper_timestamped ./audio/audio.mp3 ${
	projectSettings.SpeechToText.use &&
	` --language  ${projectSettings.SpeechToText.language}`
}  --output_format json --output_dir ./config/json/ --efficient --threads 8 --model medium.en`;

const json = [];

for (const segment of transcription.segments) {
	for (const word of segment.words) {
		json.push({
			word: word.text,
			id: 0,
			keepORdelete: true,
			start: word.start,
			end: word.end,
		});
	}
}

for (let i = 0; i < json.length; i++) {
	json[i].id = i;
}

const ids = [
	0, 1, 2, 4, 3, 5, 6, 7, 8, 9, 10, 11, 31, 12, 13, 14, 15, 17, 18, 16, 19, 20,
	21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 36, 38, 37, 40, 39, 41, 42,
	43, 44, 45, 61, 60, 62, 63, 64, 799, 856, 843, 854,
];

const jsonDelete = [];
for (let i = 0; i < transcription_refined.length; i++) {
	if (
		ids.find((number) => number === transcription_refined[i].id) === undefined
	) {
	} else {
		jsonDelete.push(
			ids.find((number) => number === transcription_refined[i].id),
		);
	}
}

await Bun.write(
	"./config/json/transcription-refined.json",
	JSON.stringify(json, null, 2),
);
import transcription_refined from "../config/json/transcription-refined.json";


const newJsonDelete = [];
for (const value of transcription_refined.entries()) {
	if (jsonDelete.find((x) => x === value[1].id) === undefined) {
		newJsonDelete.push({
			word: value[1].word,
			id: value[1].id,
			keepORdelete: value[1].keepORdelete,
			start: value[1].start,
			end: value[1].end,
		});
	} else {
		newJsonDelete.push({
			word: value[1].word,
			id: value[1].id,
			keepORdelete: false,
			start: value[1].start,
			end: value[1].end,
		});
	}
}

await Bun.write(
	"./config/json/transcription-unwantedWords.json",
	JSON.stringify(newJsonDelete, null, 2),
);

import unwantedWords from "../config/json/transcription-unwantedWords.json";

const filteredWords = unwantedWords.filter((word) => word.keepORdelete);
const wordIds = filteredWords.map((word) => word.id);
function findConsecutiveArraysMinMax(
	wordIds: number[],
): { array: number[]; smallest: number; biggest: number }[] {
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

const consecutiveArraysMinMax = findConsecutiveArraysMinMax(wordIds);
const compressedJson = [];
for (const value of consecutiveArraysMinMax.entries()) {
	compressedJson.push({
		id: value[0],
		start: unwantedWords[value[1].smallest].start,
		end: unwantedWords[value[1].biggest].end,
	});
}
