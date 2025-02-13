import multer, { StorageEngine } from 'multer';
import { Request } from 'express';

const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const { folder } = req.params as { folder: string };
    cb(null, `public/images/${folder}`);
  },
  filename: (req: Request, file, cb) => {
    const extension = file.originalname.split('.').pop(); // ดึงนามสกุลไฟล์
    const uniqueName = `${Date.now()}${Math.round(Math.random() * 1_000_000)}.${extension}`;
    cb(null, uniqueName);
  },
});

// กำหนดประเภทให้กับ Multer Instance
const uploadMiddleware = multer({ storage });

export default uploadMiddleware;

// EX => upload แบบ local
// router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded!' });
//   }
//   res.status(200).json({
//     message: 'File uploaded successfully!',
//     filePath: `/uploads/${req.file.filename}`, // Path ของไฟล์ที่บันทึก
//   });
// });
