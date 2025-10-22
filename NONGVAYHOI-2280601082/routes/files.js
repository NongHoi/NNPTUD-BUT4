var express = require("express");
var router = express.Router();
var path = require("path");
let fs = require("fs");
let {
  uploadAFileWithField,
  uploadMultiFilesWithField,
} = require("../utils/uploadHandler");
const { Response } = require("../utils/responseHandler");
let { Authentication } = require("../utils/authHandler");

router.get("/:filename", function (req, res, next) {
  let pathFile = path.join(
    __dirname,
    "../resources/files/",
    req.params.filename
  );
  if (fs.existsSync(pathFile)) {
    res.status(200).sendFile(pathFile);
  } else {
    Response(res, 404, false, "File not found");
  }
});

router.post(
  "/uploads",
  uploadAFileWithField("image"),
  function (req, res, next) {
    let URL = `${req.protocol}://${req.get("host")}/files/${req.file.filename}`;
    Response(res, 200, true, URL);
  }
);
router.post(
  "/uploadMulti",
  uploadMultiFilesWithField("image"),
  function (req, res, next) {
    let URLs = req.files.map(function (file) {
      return `${req.protocol}://${req.get("host")}/files/${file.filename}`;
    });
    Response(res, 200, true, URLs);
  }
);

// Upload multiple images with authentication
router.post(
  "/upload-multiple",
  Authentication,
  uploadMultiFilesWithField("files"),
  function (req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return Response(
          res,
          400,
          false,
          "Vui lòng chọn ít nhất 1 file để upload"
        );
      }

      let fileData = req.files.map(function (file) {
        return {
          filename: file.filename,
          originalName: file.originalname,
          url: `/images/${file.filename}`,
          fullURL: `${req.protocol}://${req.get("host")}/images/${
            file.filename
          }`,
          mimetype: file.mimetype,
          size: file.size,
        };
      });

      Response(res, 200, true, fileData);
    } catch (error) {
      Response(res, 500, false, error.message);
    }
  }
);

module.exports = router;
