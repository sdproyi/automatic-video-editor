import fs from "node:fs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: Bun.env.OPENAI_API_KEY,
});

async function main() {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream("audio.mp3"),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word"]
  });

  await Bun.write("transcription.json", JSON.stringify(transcription, null, 2));
}
main();