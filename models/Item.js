import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  isbn: String,
  author: String,
  genre: String,
  title: String,
  reviews: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5
    },
    comment: { 
      type: String, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  averageRating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  }
});

// Add text indexes for search optimization
itemSchema.index({
  title: "text",
  author: "text",
  genre: "text"
});

export default mongoose.model("Item", itemSchema);
