// routes/ChatRoutes.js
import express from 'express';
import Chat from '../models/ChatModel.js';
import isAuthenticated  from '../middleware/IsAuthenticated.js';

const router = express.Router();

// Send a message in a chat
router.post('/chats/:advertId', isAuthenticated, async (req, res) => {
  const { advertId } = req.params;
  const { content } = req.body;
  const senderId = req.user._id

  try {
    // Find or create a chat for the advert and participants
    let chat = await Chat.findOne({
      advertId,
      participants: { $all: [senderId, req.body.receiverId] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, req.body.receiverId],
        advertId,
        messages: [],
      });
    }

    // Add the message to the chat
    chat.messages.push({ sender: senderId, content });
    await chat.save();

    res.status(201).json({ message: 'Message sent', chat });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all chats for a user
router.get('/chats', isAuthenticated, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    }).populate('participants', 'username')
      .populate('messages.sender', 'username')
      .populate('advertId', 'title');

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve chats' });
  }
});

// Mark a message as read
router.post('/chats/:chatId/messages/:messageId/read', isAuthenticated, async (req, res) => {
  const { chatId, messageId } = req.params;

  try {
    const chat = await Chat.findOne({
      _id: chatId,
      'messages._id': messageId,
      'participants': req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat or message not found' });
    }

    const message = chat.messages.id(messageId);
    message.isRead = true;
    await chat.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

export default router;
