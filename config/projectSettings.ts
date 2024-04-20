// TODO: default settings feel free to change them

const projectSettings: ProjectSettings = {
	ExportedVideoName: "Name it as You wish",
	CutOutSilence: {
		use: true,
		padding: 0.3, // not required when use = false
	},
	SpeechToText: {
		use: true,
		language: "en", // not required (AI will automatically detect it)
	},
	RemoveWords: [] // to get these numbers run `bun start` go to `http://localhost:3000/` then click on the words and click on the button
};

export default projectSettings;
