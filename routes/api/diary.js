const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const diary = require("../../controllers/diaryController");

router.post("/save", auth, diary.addProductToDiary);
router.delete("/:productId", auth, diary.removeProductFromDiary);
router.get("/day", auth, diary.getDiaryForDay);
router.get("/summary", auth, diary.getDiarySummary);

module.exports = router;
