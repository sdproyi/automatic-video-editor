# **Automatic Video Cutter**
is a tool which provides **automatic silence remove**, aautomatic **word detection** using Whisper + visual word deletion from video

<a href="https://www.buymeacoffee.com/Sdpro" target="_blank" title="buymeacoffee">
  <img src="https://iili.io/JoQ1MeS.md.png"  alt="buymeacoffee-blue-badge" style="width:200px;">
</a>

---

# install project dependencies: <a id="install-project"></a>

### Bun ( JavaScript runtime ) v1.1.4:

MacOS & Linux
```bash
curl -fsSL https://bun.sh/install | bash
```
Windows
```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

**After installation**:

```bash
bun install
```
### Whisper_timestamped

`python3` (version higher or equal to 3.7, at least 3.9 is recommended)

[Download Python](https://www.python.org/downloads/) if haven't yet

```bash
pip3 install whisper-timestamped
```
### whisper-timestamped [original documentation + project](https://github.com/linto-ai/whisper-timestamped?tab=readme-ov-file#installation)
### FFmpeg

[Downloand Ffmpeg](https://ffmpeg.org/download.html)

--- 

# Usage:


### Change your [Project settings](./config/projectSettings.ts) as you wish.

<br>

To run the project:

find the Automatic Video Cutter and open it in the terminal

```bash
bun typescript/index.ts
```
after that, start the webpage (to remove words from video)

```bash
bun start
```

to open the webpage: http://localhost:3000/

click on th **button** to copy the words and paste them to [Project settings](./config/projectSettings.ts) 

```js
RemoveWords: [ ] // your numbers goes here
```