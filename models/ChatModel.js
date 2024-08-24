import mongoose from 'mongoose';

const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }  // Track if a message is read
});

const chatSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [messageSchema],
  advertId: { type: Schema.Types.ObjectId, ref: 'Advert', required: true } // Reference to Advert
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
