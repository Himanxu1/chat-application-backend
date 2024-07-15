const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const auth = require("../middleware/auth");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({
                name:user.name,
                email:user.email,
                photoUrl:user.photoUrl,
                token,
                _id:user._id

             });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
  
});

router.post('/register',async(req,res)=>{
    const { name, email, password ,photoUrl} = req.body;
    try {
        let ExistUser = await User.findOne({ email });
        if (ExistUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const user = new User({ name, email, password,photoUrl });
        await user.save();
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
    
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
})

router.get('/users',auth,async (req,res)=>{

        const keyword = req.query.search
          ? {
              $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
              ],
            }
          : {};
      
        const users = await User.find(keyword).find({ _id: { $ne: req.user.id } });
        res.send(users);
 
})



module.exports = router;
