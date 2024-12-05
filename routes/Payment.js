// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment, verifySignature, sendPaymentSuccessEmail } = require("../controller/Payment")
const { auth, isInstructor, isStudent, isAdmin } = require("../middleware/auth")
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment",auth, isStudent, verifySignature)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);

module.exports = router