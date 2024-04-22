import transcription from "../config/json/audio.wav.words.json";
import projectSettings from "../config/projectSettings";
import { $ } from "bun";

// await $`whisper_timestamped ./audio/audio.wav ${projectSettings.SpeechToText.use && ` --language  ${projectSettings.SpeechToText.language}`}  --output_format json --output_dir ./config/json/ --efficient --threads 8 --model medium.en`

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
	279, 488, 286, 41, 307, 461, 504, 324, 215, 14, 16, 15, 9, 10, 11, 12, 13,
	17, 18, 20, 19, 32, 33, 31, 34, 35, 36, 38, 37, 39, 40, 42, 43, 44, 46,
	45, 47, 48, 49, 52, 53, 51, 50, 54, 55, 56, 57, 58, 59,
]

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
