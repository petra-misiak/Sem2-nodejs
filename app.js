const express = require("express");
const app = express();
const port = process.env.PORT || 4700;

app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("Hello world from Petra");
});

// Na żądania wysłane pod adres /heartbeat aplikacja odpowiada zwracając aktualną datę i godzinę.
app.get("/heartbeat", (req, res) => {
  const currentDate = new Date().toUTCString();
  res.send(`Current date and time: ${currentDate}`);
});

// Aplikacja umożliwia dodawanie ogłoszenia.
const announcements = [];
let nextId = 1;

app.post("/announcement", (req, res) => {
  const newAnnouncements = req.body.announcements;
  if (!Array.isArray(newAnnouncements)) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  const addedAnnouncements = [];
  newAnnouncements.forEach((announcement) => {
    const { title, description, author, category, tags, price } = announcement;
    const newAnnouncement = {
      id: nextId.toString(),
      title,
      description,
      author,
      category,
      tags,
      price,
    };
    addedAnnouncements.push(newAnnouncement);
    announcements.push(newAnnouncement);
    nextId++;
  });
  res.status(201).json({
    message: "Announcements added successfully!",
    announcements: addedAnnouncements,
  });
});

// Aplikacja umożliwia zwracanie wszystkich ogłoszeń.
app.get("/announcement", (req, res) => {
  if (announcements.length > 0) {
    res.status(200).json(announcements);
  } else {
    res.status(404).json({ message: "No announcements found" });
  }
});

// / Aplikacja umożliwia zwracanie pojedynczego ogłoszenia
app.get("/announcement/:id", (req, res) => {
  const { id } = req.params;
  const announcement = announcements.find(
    (announcement) => announcement.id === id.toString()
  );

  if (announcement) {
    res.format({
      "text/plain": () => {
        res.send(
          `Title: ${announcement.title}\nDescription: ${announcement.description}\nAuthor: ${announcement.author}\nCategory: ${announcement.category}\nTags: ${announcement.tags}\nPrice: ${announcement.price}`
        );
      },
      "text/html": () => {
        res.send(
          `<h1>${announcement.title}</h1>
          <p>Description: ${announcement.description}</p>
          <p>Author: ${announcement.author}</p>
          <p>Category: ${announcement.category}</p>
          <p>Tags: ${announcement.tags}</p>
          <p>Price: ${announcement.price}</p>`
        );
      },
      "application/json": () => {
        res.json(announcement);
      },
      default: () => {
        res.status(406).send("Not Acceptable");
      },
    });
  } else {
    res.status(404).json({ message: "Announcement not found" });
  }
});

// Aplikacja umożliwia usuwanie wybranego ogłoszenia.
app.delete("/announcement/:id", (req, res) => {
  const { id } = req.params;
  if (id === "all") {
    announcements.length = 0; // Clear the announcements array
    res.json({ message: "All announcements deleted" });
  } else if (id >= 0 && id < announcements.length) {
    const deletedAnnouncement = announcements.splice(id, 1);
    res.json(deletedAnnouncement[0]);
  } else {
    res.status(404).send("Ad not found");
  }
});

// Aplikacja umożliwia modyfikowanie wybranego ogłoszenia
app.put("/announcement/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, author, category, tags, price } = req.body;

  const index = announcements.findIndex((item) => item.id == id);
  if (index !== -1) {
    const updatedAnnouncement = {
      ...announcements[index],
      title,
      description,
      author,
      category,
      tags,
      price,
    };
    announcements[index] = updatedAnnouncement;
    res.json(updatedAnnouncement);
  } else {
    res.status(404).send("Ad not found");
  }
});

// Aplikacja pozwala na wyszukiwanie ogłoszeń według różnych kryteriów
app.get("/search", (req, res) => {
  const { title, description, author, category, minPrice, maxPrice } =
    req.query;
  const searchResults = announcements.filter((ad) => {
    let matches = true;
    if (title && !ad.title.toLowerCase().includes(title.toLowerCase())) {
      matches = false;
    }
    if (
      description &&
      !ad.description.toLowerCase().includes(description.toLowerCase())
    ) {
      matches = false;
    }
    if (author && !ad.author.toLowerCase().includes(author.toLowerCase())) {
      matches = false;
    }
    if (
      category &&
      !ad.category.toLowerCase().includes(category.toLowerCase())
    ) {
      matches = false;
    }
    if (minPrice && ad.price < parseFloat(minPrice)) {
      matches = false;
    }
    if (maxPrice && ad.price > parseFloat(maxPrice)) {
      matches = false;
    }
    return matches;
  });
  if (searchResults.length > 0) {
    res.status(200).json(searchResults);
  } else {
    res.status(404).json({ message: "No matching announcements found" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`server started on ${port}`);
});
