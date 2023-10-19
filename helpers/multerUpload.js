const multer = require('multer');

//Multer config to destinaton folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/excel/'); // Thư mục đích để lưu tệp
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Tên tệp sẽ giữ nguyên tên gốc
    },
  });
  
  const upload = multer({ storage: storage });

  module.exports = upload;