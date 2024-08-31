import express from 'express';
import Chat from '../models/ChatModel.js';
import authenticateJWT from '../middleware/jwtMiddleware.js';

const router = express.Router();

// Send a message in a chat or reply to a message
router.post('/chats/:advertId', authenticateJWT, async (req, res) => {
  const { advertId } = req.params;
  const { content, receiverId } = req.body;

  console.log('User ID (JWT Authenticated):', req.user.userId); // User ID from JWT authentication

  // Ensure that req.user is defined
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No user data' });
  }

  const senderId = req.user.userId;
  console.log('Sender ID:', senderId);

  // Validate required fields
  if (!receiverId) {
    return res.status(400).json({ error: 'Receiver ID is required' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    // Check if a chat already exists between the participants for the given advert
    let chat = await Chat.findOne({
      advertId,
      participants: { $all: [senderId, receiverId] }
    });

    // If no chat exists, create a new one
    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        advertId,
        messages: []
      });
    }

    // Add the new message to the chat
    chat.messages.push({ sender: senderId, content });

    // Save the chat document
    await chat.save();

    // Emit a socket event for real-time updates (if needed)
    req.io.to(chat._id.toString()).emit('receiveMessage', { chatId: chat._id, message: chat.messages[chat.messages.length - 1] });

    res.status(201).json({ message: 'Message sent', chat });
  } catch (error) {
    console.error('Error in sending message:', error); // Log the exact error to the console
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

// Get all chats for a user
router.get('/chats', authenticateJWT, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.userId
    })
      .populate('participants', 'username')
      .populate('messages.sender', 'username')
      .populate('advertId', 'title');  // Ensures advert details are included

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve chats' });
  }
});

// Mark a message as read
router.post('/chats/:chatId/messages/:messageId/read', authenticateJWT, async (req, res) => {
  const { chatId, messageId } = req.params;

  try {
    const chat = await Chat.findOne({
      _id: chatId,
      'messages._id': messageId,
      'participants': req.user.userId,
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

// Get chat details
router.get('/chats/:chatId', authenticateJWT, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.userId,
    }).populate('participants', 'username')
      .populate('messages.sender', 'username');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve chat details' });
  }
});


//reply to a message route
router.post('/chats/:chatId/messages', authenticateJWT, async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const senderId = req.user.userId;

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const chat = await Chat.findById(chatId).populate('participants', 'username _id');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Ensure the sender is a participant in the chat
    if (!chat.participants.some(participant => participant._id.equals(senderId))) {
      return res.status(403).json({ error: 'Unauthorized: You are not a participant in this chat' });
    }

    // Add the message to the chat with full sender details
    const sender = chat.participants.find(participant => participant._id.equals(senderId));
    const newMessage = { sender: sender._id, content, sentAt: new Date() };
    chat.messages.push(newMessage);
    await chat.save();

    // Include sender details in the message object
    const populatedMessage = {
      ...newMessage,
      sender: {
        _id: sender._id,
        username: sender.username,
      }
    };

    // Emit socket event for real-time updates
    req.io.to(chat._id.toString()).emit('receiveMessage', { chatId: chat._id, message: populatedMessage });

    res.status(201).json({ message: 'Message sent', chat });
  } catch (error) {
    console.error('Error in sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});


export default router;
