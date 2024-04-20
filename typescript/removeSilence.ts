import chalk from "chalk";
import { Glob, $ } from "bun";
import { unlink } from "node:fs/promises";
import { videoRequirements } from "./types/types";
import { getSilentParts } from "@remotion/renderer";

const cuttedOutSilenceVideoList: string = import.meta.resolve(
	"../config/text/inputs-silence.txt",
);

const editedVideo: string = import.meta.resolve("../videos/silence-removed");
const editedVideoParts: string = "../videos/silence-removed/";
const glob: Glob = new Glob("*");
export async function removeSileceFromVideo(
	uneditedVideo: string,
	padding: number,
) {
	const { audibleParts, durationInSeconds } = await getSilentParts({
		src: uneditedVideo,
		noiseThresholdInDecibels: -30,
		minDurationInSeconds: 1,
	});

	for (let i = 0; i < audibleParts.length; i++) {
		await $`ffmpeg -hide_banner -loglevel error -i ${uneditedVideo} -ss ${
			audibleParts[i].startInSeconds - padding
		} -to ${
			audibleParts[i].endInSeconds + padding * 2
		} -y -c copy ${editedVideo}${i}.mp4`;
		console.log(`${chalk.blue("created:") + editedVideo + i}.mp4`);
	}
	async function createVideoFromCuttedParts() {
		const deleteFiles: string[] = [];
		const files: string[] = [];
		for (const file of glob.scanSync(editedVideoParts)) {
			files.push(`\n file '${editedVideoParts}${file}'`);
			deleteFiles.push(`${editedVideoParts}${file}`);
		}

		await Bun.write(cuttedOutSilenceVideoList, files);
		await $`ffmpeg -hide_banner -loglevel error -f concat -safe 0 -i inputs.txt -y -c copy ${videoRequirements.output}`;
		for (const file of files) {
			console.log(`${chalk.yellow("Concated:")} ${file}`);
		}
		async function deleteUnusedParts() {
			for (const i of deleteFiles) {
				await unlink(i);
				console.log(`${chalk.red("Deleted:")} ${i}`);
			}
		}
		deleteUnusedParts();
	}
	createVideoFromCuttedParts();
}
