const ipfsClient = require('ipfs-http-client');
const express = require('express');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const fs = require('fs');
const Downloader = require('nodejs-file-downloader');
// const ipfs = new ipfsClient({
//     host: 'ipfs.infuro.io',
//     port: '5001',
//     protocol: 'https',
// })
const ipfs = new ipfsClient({
    host: 'localhost',
    port: '5001',
    protocol: 'http',
})

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({ debug: true, }));


app.get('/', (req, res) => {
    res.render('home')
});

app.post("/upload", (req, res) => {
    const file = req.files.file;
    const fileName = req.body.fileName;
    const filePath = 'files/' + fileName;

    file.mv(filePath, async (err) => {
        if (err) {
            console.log('Error: faild to download the file');
            return res.status(500).json({ err });
        }
        const fileHash = await addFile({ fileName, filePath });

        fs.unlink(filePath, async (err) => {
            if (err) {
                console.log(err);
            }

            // const downloader = new Downloader({
            //     url: 'https://ipfs.io/ipfs/' + fileHash,//If the file name already exists, a new file with the name 200MB1.zip is created.     
            //     directory: "./downloads",//This folder will be created, if it doesn't exist.               
            // })
            // console.log(downloader);

            res.render('upload', { fileName, fileHash });

            // await downloader.save();//Downloader.download() returns a promise


        })
    })

});


const addFile = async ({ fileName, filePath }) => {
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({ path: fileName, content: file });
    const fileHash = fileAdded.cid.toString();
    return fileHash;
}

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running🔥`));

