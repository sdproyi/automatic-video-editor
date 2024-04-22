import projectSettings from "../../config/projectSettings";
import { Glob } from "bun";

const glob = new Glob("*.mp4");

const video =[]

for await (const file of glob.scan("./config/video/input")) {
	video.push(file)
  }

export const videoRequirements: VideoRequirements = {
	uneditedVideo: import.meta.resolve(`../../config/video/input/${video}`),
	silenceRemovedVideo: import.meta.resolve("../../videos/silenceRemoved.mp4"),
	outputWantedWords: `../../config/video/output/${projectSettings.ExportedVideoName}`,
	audioInput: "../audio/audio.wav",
	silencePadding: projectSettings.CutOutSilence.padding ?? 0,
	outputWantedWordsVideo: "./config/video/output/output.mp4",
};
