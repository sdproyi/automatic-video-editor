// TODO: default settings feel free to change them

const projectSettings: ProjectSettings = {
	ExportedVideoName: "name as u wish",
	CutOutSilence: {
		use: true,
		padding: 0.3, // not required when use = false
	},
	SpeechToText: {
		use: true,
		language: "English", // not required (AI will automatically detects it)
		removeWords: [], // to get these numbers run `bun start` go to `http://localhost:3000/` then click on the words and click on the button and paste it here
	},
	// for advanced users
	FfmpegSettings: {
		VideoCodec: "mpeg4", //changing this may cause ffmpeg to crash
	},
};

export default projectSettings;
