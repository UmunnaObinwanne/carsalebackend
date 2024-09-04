import mongoose from 'mongoose';

const TransmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Transmission = mongoose.model('Transmission', TransmissionSchema);

export default Transmission;
