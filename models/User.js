import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstname: { 
    type: String, 
    required: true 
  },
  lastname: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true,
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  photo: { 
    type: String,
    default: "default-avatar.jpg" 
  }
});

// Virtual for full name
userSchema.virtual('fullname').get(function() {
  return `${this.firstname} ${this.lastname}`;
});

export default mongoose.model("User", userSchema);
