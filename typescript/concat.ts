import { Glob, $ } from "bun";

const glob = new Glob("*");
const path = "/home/sdpro/automatic-video-cutter/inputs.txt"
const files = []

for (const file of glob.scanSync("./silence-removed/")) {
    files.push(`\n file './silence-removed/${file}'`);
}

await Bun.write(path, files)

await $`ffmpeg -f concat -safe 0 -i inputs.txt -c copy output.mp4`
