
# 📚 SK@VNIT Books – A Modern Book Review Platform

Welcome to **SK@VNIT Books**, a full-featured web application where readers can explore books, leave thoughtful reviews, and discover their next great read! Powered by **Node.js**, **Express.js**, and **JWT authentication**, this platform combines clean design with powerful features.


## ✨ Features

### 🚀 Platform Highlights

- **🔐 User Authentication**  
  Secure sign-up and login with **JWT-based authentication** to protect user sessions.

- **📚 Book Management**  
  Add, browse, and filter books by author or genre. Includes pagination for seamless browsing.

- **📝 Review System**  
  Authenticated users can write, edit, and delete reviews. Each book shows average ratings and user reviews.

- **🔎 Powerful Search**  
  Case-insensitive search by title or author makes discovering books quick and easy.

---

## 💻 API Endpoints (RESTful)

Built with **Node.js** and **Express.js**, our backend provides secure and performant APIs:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register a new user |
| `POST` | `/login` | Authenticate user and return JWT |
| `POST` | `/books` | Add a new book *(Authenticated)* |
| `GET` | `/books` | List all books with filters & pagination |
| `GET` | `/books/:id` | Get book details and reviews |
| `POST` | `/books/:id/reviews` | Submit a review *(One per user/book)* |
| `PUT` | `/reviews/:id` | Update user review |
| `DELETE` | `/reviews/:id` | Delete a review |
| `GET` | `/search` | Search books by title or author |

> ✅ Designed with performance, security, and scalability in mind.

---

## 📁 Project Structure

```

.
├── routes/              # Express route handlers
├── views/               # EJS templates
├── public/              # Static CSS & JS files
├── .env                 # Environment variables (e.g., PORT, DB)
├── app.js               # Main server file
├── package.json         # Dependencies and scripts

````

---

## 🛠 Tech Stack

- **Frontend:** EJS, HTML, CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose ODM)  
- **Auth:**  session-based authentication, 
- **Styling:** CSS Grid, Flexbox  

---

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/sohelkureshi/book-review-platform
   cd book-review-platform
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file**

   ```env
   PORT=3001
   MONGODB_URI=your-mongodb-uri
   ```

4. **Run the app**

   ```bash
   npm app.js
   ```

Visit [http://localhost:3001](http://localhost:3001)



## 🙌 Contributing

Feel free to fork this repository and contribute. Open issues or pull requests are welcome!

---

## 📜 License

This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.

---

## 💡 Inspiration

Built to create a book discovery experience where user reviews, clean UI, and developer best practices meet.

---

**Happy Reading! 📖✨**

