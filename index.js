const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(express.json());

app.post('/upload', upload.single('video'), (req, res) => {
  // Store video file information in the database or perform any necessary actions
  const videoPath = req.file.path;
  res.json({ message: 'Video uploaded successfully', videoPath });
});

app.post('/subtitles', (req, res) => {
  const { videoPath, subtitles } = req.body;

  // Store subtitles data in a file or database
  const subtitlesFilePath = videoPath + '.srt'; // Assuming a simple method for creating a subtitles file
  createSubtitlesFile(subtitlesFilePath, subtitles);

  res.json({ message: 'Subtitles created and associated with the video' });
});

app.get('/subtitles/:videoPath', (req, res) => {
  const videoPath = req.params.videoPath;
  const subtitlesFilePath = videoPath + '.srt';

  // Retrieve subtitles data from the file or database
  if (fs.existsSync(subtitlesFilePath)) {
    const subtitlesData = fs.readFileSync(subtitlesFilePath, 'utf-8');
    res.send(subtitlesData);
  } else {
    res.status(404).json({ message: 'Subtitles not found for the video' });
  }
});

function createSubtitlesFile(filePath, subtitles) {
  // Create and write subtitles to a file
  const subtitlesContent = subtitles.map((subtitle, index) => {
    return `${index + 1}\n${formatTime(subtitle.time)} --> ${formatTime(subtitle.time + 5)}\n${subtitle.text}\n\n`;
  }).join('');

  fs.writeFileSync(filePath, subtitlesContent, 'utf-8');
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
