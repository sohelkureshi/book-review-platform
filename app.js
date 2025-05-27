import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import flash from "connect-flash";
import Item from "./models/Item.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const saltRounds = 10;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("MongoDB connected!"))
.catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: "TOPSECRET",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: null, // True session cookie
    httpOnly: true,
    sameSite: 'lax',
    ephemeral: true // Forces browser to discard on exit
  }
}));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));

// Routes

// Home page: list all books (no sort/genre)
app.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ _id: 1 });
    res.render("index.ejs", { 
      book: items, 
      total: items.length, 
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


app.post("/immediate-logout", (req, res) => {
  // Passport 0.6 requires a callback
  req.logout(err => {
    if (err) console.error("Passport logout error:", err);
    // Now destroy the session
    req.session.destroy(err2 => {
      if (err2) console.error("Session destruction error:", err2);
      // Clear the cookie on the client
      res.clearCookie("connect.sid", { path: "/" });
      // Send back a simple success
      res.sendStatus(200);
    });
  });
});


app.get("/about", async (req, res) => {
  try {
    res.render("about.ejs", { 
      total: await Item.countDocuments(), 
      user: req.user 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Book detail page with paginated reviews
app.get("/book/:id/:name", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Reviews per page
    const skip = (page - 1) * limit;

    const item = await Item.findById(req.params.id)
      .populate({
        path: 'reviews.user',
        select: 'firstname lastname'
      });

    if (!item) return res.status(404).send("Book not found");

    // Sort reviews by createdAt (newest first)
    const sortedReviews = (item.reviews || []).sort((a, b) => b.createdAt - a.createdAt);
    const paginatedReviews = sortedReviews.slice(skip, skip + limit);

    const totalReviews = item.reviews.length;
    const totalPages = Math.ceil(totalReviews / limit);

    res.render("review.ejs", {
      book: {
        ...item.toObject(),
        reviews: paginatedReviews
      },
      total: await Item.countDocuments(),
      user: req.user,
      reviewPagination: {
        page,
        totalPages,
        totalReviews
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/register", async (req, res) => {
  try {
    res.render("register.ejs", { 
      total: await Item.countDocuments(),
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", async (req, res) => {
  try {
    res.render("login.ejs", {
      message: req.flash('error'),
      total: await Item.countDocuments(),
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect("/login");
  });
});

// Edit book (no genre/sort logic)
app.post("/edit", async (req, res) => {
  const { updatedItemId: id, title, author, isbn, genre } = req.body;
  
  try {
    await Item.findByIdAndUpdate(id, {
      isbn, author, genre, title
    });
    res.redirect(`/book/${id}/edited`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/new-review", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      res.render("new.ejs", { 
        total: await Item.countDocuments(), 
        user: req.user 
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/login");
  }
});

// Add new book (no genre/sort logic)
app.post("/new", async (req, res) => {
  const { title, author, isbn, genre } = req.body;
  
  try {
    const newItem = new Item({ isbn, author, genre, title });
    const savedItem = await newItem.save();
    res.redirect(`/book/${savedItem._id}/success`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Search books by keyword (still searches genre field, but does not filter)
app.post("/s", async (req, res) => {
  const searchKeyword = req.body.search.toLowerCase().trim();
  const searchRegex = new RegExp(searchKeyword, 'i');

  try {
    const results = await Item.find({
      $or: [
        { author: searchRegex },
        { title: searchRegex },
        { genre: searchRegex }
      ]
    });
    
    res.render("search.ejs", {
      book: results,
      total: await Item.countDocuments(),
      totalResult: results.length,
      searchTerm: searchKeyword,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// REST API Routes (no genre/sort)
app.get("/books", async (req, res) => {
  try {
    const { page = 1, limit = 10, author } = req.query;
    const filter = {};
    if (author) filter.author = new RegExp(author, 'i');

    const books = await Item.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-reviews');

    const total = await Item.countDocuments(filter);

    res.json({
      data: books,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;
    
    const book = await Item.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      { $project: {
          title: 1,
          author: 1,
          isbn: 1,
          averageRating: 1,
          reviews: { $slice: ['$reviews', (page - 1) * limit, Number(limit)] },
          totalReviews: { $size: '$reviews' }
        }}
    ]);

    if (!book.length) return res.status(404).json({ error: "Book not found" });
    
    await User.populate(book[0].reviews, { path: 'user', select: 'firstname lastname' });

    res.json({
      ...book[0],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: book[0].totalReviews,
        totalPages: Math.ceil(book[0].totalReviews / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Review routes
app.post("/books/:id/reviews", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  try {
    const book = await Item.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const existingReview = book.reviews.find(r => r.user.equals(req.user._id));
    if (existingReview) return res.status(400).json({ error: "Already reviewed" });

    const newReview = {
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    };

    book.reviews.push(newReview);
    book.averageRating = book.reviews.reduce((a,c) => a + c.rating, 0) / book.reviews.length;
    await book.save();

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/reviews/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  try {
    const book = await Item.findOne({ "reviews._id": req.params.id });
    if (!book) return res.status(404).json({ error: "Review not found" });

    const review = book.reviews.id(req.params.id);
    if (!review.user.equals(req.user._id)) {
      return res.status(403).json({ error: "You can only update your own reviews" });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    book.averageRating = book.reviews.reduce((a,c) => a + c.rating, 0) / book.reviews.length;
    await book.save();

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/reviews/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  try {
    const book = await Item.findOne({ "reviews._id": req.params.id });
    if (!book) return res.status(404).json({ error: "Review not found" });

    const review = book.reviews.id(req.params.id);
    if (!review.user.equals(req.user._id)) {
      return res.status(403).json({ error: "You can only delete your own reviews" });
    }

    book.reviews.pull(req.params.id);
    book.averageRating = book.reviews.length > 0 
      ? book.reviews.reduce((a,c) => a + c.rating, 0) / book.reviews.length
      : 0;
    await book.save();

    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authentication Routes
app.post("/register", async (req, res) => {
  const { email, password, first: firstName, last: lastName } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register.ejs", {
        message: `Email already exists. Try <a href="/login">logging in</a>.`,
        total: await Item.countDocuments(),
        user: req.user
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ 
      firstname: firstName, 
      lastname: lastName, 
      email, 
      password: hashedPassword 
    });
    
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login');
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.redirect('/new-review');
    });
  })(req, res, next);
});

// Passport Configuration
passport.use("local", new Strategy({
  usernameField: "email"
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? done(null, user) : done(null, false, { message: "Wrong password" });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Server Initialization
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
