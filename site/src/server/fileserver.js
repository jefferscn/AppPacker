import multer from 'multer';
import fs from 'fs';
import path from 'path';
import safeMiddle from './safeMiddle';
var upload = multer({ dest: path.resolve(__dirname, 'uploads/') });
// const baseUrl = "http://1.1.8.34:3001/download?id=";
const baseUrl = "./download?id=";
export default function bind(app, mongoose) {
    const FileRecordSchema = new mongoose.Schema({
        filename: String,
        mimetype: String,
        path: String
    });
    const FileRecord = mongoose.model('FileRecord', FileRecordSchema);

    app.post('/upload', upload.single('file'), async (req, res) => {
        var fr = new FileRecord();
        fr.filename = req.file.originalname;
        fr.mimetype = req.file.mimetype;
        fr.path = path.relative(__dirname, req.file.path);
        try {
            await fr.save();
            var result = {
                success: true,
                filename: fr.filename,
                id: fr.id,
                url: `${baseUrl}${fr.id}`
            }
            res.json(result).end();
        } catch (ex) {
            res.json({
                success: false,
                message: ex.message
            })
        }
    });
    app.get('/download', safeMiddle(async (req, res) => {
        var fr = await FileRecord.findById(req.query.id);
        if (fr) {
            var file = path.resolve(__dirname, fr.path);
            var filename = fr.filename;
            var mimetype = fr.mimetype;
            var newFileName = encodeURIComponent(filename);
            var stats = fs.statSync(file); 
            res.setHeader('Content-Disposition', 'inline;filename*=UTF-8\'\'' + newFileName);
            res.setHeader('Content-type', mimetype);
            res.setHeader('Content-Length', stats.size);
            var filestream = fs.createReadStream(file);
            filestream.on('error', function(err){ 
                res.status(500).send({
                    message: err,
                })
            });
            filestream.pipe(res);
            return;
        }
        res.status(404).end();
    }));
    app.get('/download/:id', safeMiddle(async (req, res) => {
        var fr = await FileRecord.findById(req.params.id);
        if (fr) {
            var file = path.resolve(__dirname, fr.path);
            var filename = fr.filename;
            var mimetype = fr.mimetype;
            var stats = fs.statSync(file); 
            var newFileName = encodeURIComponent(filename);
            res.setHeader('Content-Disposition', 'inline;filename*=UTF-8\'\'' + newFileName);
            res.setHeader('Content-type', mimetype);
            res.setHeader('Content-Length', stats.size);
            var filestream = fs.createReadStream(file);
            filestream.on('error', function(err){ 
                console.log(err);
                res.status(500).send({
                    message: err,
                })
            });
            filestream.pipe(res);
            return;
        }
        res.status(404).end();
    }))
}
