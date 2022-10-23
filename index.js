require('dotenv').config();
const express = require('express')
const multer = require('multer');
const { s3Upload } = require('./s3Service');
const app = express();
const port = 4000;

//single file uploads
const upload = multer({ dest: "uploads/" })
app.post('/upload', upload.single("file"), (req, res) => {
    res.json({ status: 'successful upload' });
});

//multiple files uploads (only allow 2 files per upload)
const multiupload = multer({ dest: "uploads/" })
app.post('/multiupload', multiupload.array("file", 2), (req, res) => {
    console.log(req.files)
    res.json({ status: 'successful upload multiple of files' });
});

//custom filename handling
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads");
//     },
//     filename: (req, file, cb) => {
//         const { originalname } = file;
//         cb(null, `${originalname}`);
//     },
// });

const storage = multer.memoryStorage();

//file filter 
const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === 'image') {
        cb(null, true);
    } else {
        cb(new Error("image type only"), false);
    }
}

//multi upload image with original filename & file filter & file limit size 10mb
const multiuploadName = multer({ storage, fileFilter, limits:{fileSize:100000000} })
app.post('/upload/name', multiuploadName.array("file"), async (req, res) => {
    const file = req.files[0];
    const result = await s3Upload(file);
    res.json({ status: `successful upload to s3 bucket` })
})

app.listen(port, () => console.log(`Server is listening on port: ${port}`));