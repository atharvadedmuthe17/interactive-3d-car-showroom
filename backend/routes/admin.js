import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router()

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: "User not found" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: "Invalid password" })

    const token = jwt.sign(
  {
    id: user.id,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.json({
      token,
      user: {
        id: user._id,
        role: user.role
      }
    })

  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

export default router