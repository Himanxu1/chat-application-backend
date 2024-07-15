const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require('../models/messageModel')
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    return res.status(400).send("Bad request");
  }
  var newMessage = {
    sender: req.user.id,
    content: content,
    chat: chatId,
  };
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name photoUrl")
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "name photoUrl email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal server error");
  }
});

router.get('/:chatId',auth,async(req,res)=>{
  try{
    

    const message = await Message.find({chat: req.params.chatId})
    .populate("sender","name photoUrl email")
    .populate("chat")

    res.json(message)

  }catch(err){
    console.log(err)
  }
})

module.exports = router;
