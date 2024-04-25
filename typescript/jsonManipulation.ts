import projectSettings from "../config/projectSettings";

export async function refineWhisperWords() {
	const transcriptionJson = import("../config/json/audio.wav.words.json");
	const transcription = (await transcriptionJson).default;

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
	await Bun.write(
		"./config/json/transcription-refined.json",
		JSON.stringify(json, null, 2),
	);
}

export async function transcriptionRefined() {
	const transcription_refinedJson = import(
		"../config/json/transcription-refined.json"
	);
	const transcription_refined = (await transcription_refinedJson).default;

	const ids: number[] = projectSettings.SpeechToText.removeWords;

	const jsonDelete = [];
	for (let i = 0; i < (await transcription_refined.length); i++) {
		if (
			ids.find((number) => number === transcription_refined[i].id) === undefined
		) {
		} else {
			jsonDelete.push(
				ids.find((number) => number === transcription_refined[i].id),
			);
		}
	}

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
}
