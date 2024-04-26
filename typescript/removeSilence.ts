import chalk from "chalk";
import { Glob, $ } from "bun";
import { unlink } from "node:fs/promises";
import { videoRequirements } from "./types/types";
import { getSilentParts } from "@remotion/renderer";

const cuttedOutSilenceVideoList: string = "./config/text/inputs-silence.txt";
const glob: Glob = new Glob("*");
const editedVideo: string = import.meta.resolve("../videos/silence-removed/");
const editedVideoParts: string = "./videos/silence-removed/";

export async function removeSileceFromVideo(
	uneditedVideo: string,
	padding: number,
) {
	const { audibleParts, durationInSeconds } = await getSilentParts({
		src: uneditedVideo,
		noiseThresholdInDecibels: -20,
		minDurationInSeconds: 1,
	});

	async function createVideoCuts() {
		for (let i = 0; i < audibleParts.length; i++) {
			await $`ffmpeg -hide_banner -nostdin -v info -i ${uneditedVideo} -ss ${
				audibleParts[i].startInSeconds - padding
			} -to ${
				audibleParts[i].endInSeconds + padding * 2
			} -y -c:v copy -c:a copy ${editedVideo}${i}.mp4`;
			console.log(`${chalk.blue("created:") + editedVideo + i}.mp4`);
		}
	}
	async function createVideoFromCuttedParts() {
		const deleteFiles: string[] = [];
		const files: string[] = [];
		for (const file of glob.scanSync(editedVideoParts)) {
			files.push(`\n file '../.${editedVideoParts}${file}'`);
			deleteFiles.push(`${editedVideoParts}${file}`);
			// console.log(files);
		}

		await Bun.write(cuttedOutSilenceVideoList, files);
		await $`ffmpeg -hide_banner -f concat -safe 0 -i ${cuttedOutSilenceVideoList} -y -c copy ${videoRequirements.silenceRemovedVideo}`;
	}

	await createVideoCuts();

	await createVideoFromCuttedParts();
}
