# 🎬 CineSphere – Online Movie Ticket Reservation System

CineSphere is a fully functional and responsive movie ticket reservation website developed from scratch using modern web technologies. It provides a seamless experience for users to explore movies, watch trailers, view showtimes, select seats interactively, and complete bookings — with instant digital ticket confirmation.

---

## 📌 Features

### 🧾 User-Side Functionality

- **🎥 Home Page:** Displays featured movies with attractive visuals.
- **🔍 Movie Details:** Dynamic movie details page with full description, synopsis, and cast information.
- **🎞️ Embedded Trailers:** Integrated YouTube trailers based on movie titles, enhancing user engagement.
- **👨‍🎤 IMDb Data:** Fetches cast, director, rating, and runtime information from the IMDb (OMDb API) for accurate movie details.
- **🕐 Showtimes:** Lists available showtimes with cinema names and times, allowing users to choose their preferred screening.
- **🎟️ Interactive Seat Selection:** Provides an intuitive seat selection grid with clear distinctions between VIP, Standard, and Booked seats.
- **📝 Booking Form:** Simple and user-friendly booking form requiring essential user information (name, email, phone).
- **📩 Confirmation & QR Code Ticket:** Generates a confirmation page with a downloadable QR code ticket for easy access and verification.

### 🔐 Admin Dashboard

- **🔒 Secure Login:** Robust login system for secure admin access.
- **🎬 Movie Management:** Allows admins to add new movies, update existing movie details, and manage showtimes.
- **📊 Real-time Income Tracking:** Dashboard displays real-time income from ticket sales, providing valuable insights.
- **🧾 Booking Management:** Enables admins to view and manage user bookings, ensuring smooth operations.

---

## 🛠 Technologies Used

- **Frontend & Backend:** [RemixJS](https://remix.run/) - A full-stack web framework for building fast, resilient web apps.
- **Styling:** [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development, with Dark Mode support.
- **Database:** MySQL - A robust and reliable relational database for storing movie, showtime, and booking data.
- **Server Runtime:** Node.js (`mysql2`, `@remix-run/node`) - For efficient server-side operations and database interactions.
- **QR Code Generation:** `qrcode.react` - A React component for generating QR codes, providing digital tickets for users.
- **External APIs:**
  - **🎬 OMDb API:** [https://www.omdbapi.com/](https://www.omdbapi.com/) - Fetches comprehensive movie metadata, including cast, director, and ratings.
  - **📺 YouTube Embed API:** [https://developers.google.com/youtube/player_parameters](https://developers.google.com/youtube/player_parameters) - Dynamically embeds movie trailers from YouTube.

---

## 💻 How to Run the Project

1. **Clone the project:**

   ```bash
   git clone https://github.com/your-repo/cinesphere.git
   cd cinesphere
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the project's root directory with the following variables:

   ```ini
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   OMDB_API_KEY=5666252d
   ```

   Replace the placeholders with your actual database credentials and your OMDb API key.

4. **Set up the database:**

   - Create your MySQL database using the credentials you defined.
   - **Important:** Use the provided `init.sql` file to automatically create the database schema, tables, and import dummy data:

   ```bash
   mysql -u your_database_user -p your_database_name < init.sql
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Visit the app:**

   Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🔑 Admin Panel Access

Manage all bookings, movies, showtimes, and seats from a single place.

**Admin URL:** [https://cinesphere.eleventastic.com/admin](https://cinesphere.eleventastic.com/admin)

**Credentials:**

```
Username: admin
Password: admin2008!!
```

> 🛡️ Note: These credentials are set in your `init.sql` file and are securely stored with bcrypt hashing.
> For production, always ensure you update to strong unique passwords.

🌐 **Live Demo:** [https://cinesphere.eleventastic.com](https://cinesphere.eleventastic.com)

## 📝 Notes

- Ensure MySQL is running and accessible with the provided credentials.
- Obtain an OMDb API key from [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx).
- The `SESSION_SECRET` should be a randomly generated, long string for security.
- The database schema and initial data setup are included in the `init.sql` file.

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/menukarisith/CineSphere).

---

## Ⓒ Copyright

Copyright © 2024 Menuka Risith. All rights reserved.
