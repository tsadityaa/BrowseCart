🛒 BrowseCart

A full-stack local discovery platform that helps users find nearby shops and their products within a 2 km radius.
Built using React.js, Node.js, Express.js, and MongoDB.

🚀 Features

🔐 User Authentication — Register, login, and manage accounts securely.

🏪 Shop Management — Add, edit, and list local shops with detailed info.

📦 Item Uploads — Upload shop items using Excel sheets (.xlsx).

📍 Geolocation Filtering — Find shops within a 2 km radius using latitude and longitude.

🔎 Dynamic Product Search — Instantly filter items by name or category.

💾 RESTful APIs — Built with Express.js and MongoDB for robust backend operations.

🌐 Deployed on Render with a clean and responsive React frontend.

🧩 Tech Stack
Layer	Technology
Frontend	React.js, Axios, TailwindCSS (or your chosen UI lib)
Backend	Node.js, Express.js
Database	MongoDB (Mongoose)
Deployment	Render (Frontend + Backend)
⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/<tsadityaa>/browsecart.git
cd browsecart

2. Install dependencies

For both frontend and backend:

npm install

3. Start the backend server
node server.js

4. Start the frontend (React)
npm run dev

5. Visit the app

Frontend runs on http://localhost:5173

Backend runs on http://localhost:5000
 (or your configured port)

🌍 Environment Variables

Create a .env file in the backend directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

🗄️ Database Design (ER Diagram)

Below is the ER Diagram for BrowseCart, showing relationships between users, shops, and shop_items.

🧩 Diagram Image:
(Insert your ER diagram image here)
Example:

![ER Diagram](./assets/browsecart-er-diagram.png)


Entities:

users → manages authentication and profile data

shops → stores shop details and owner information

shop_items → lists available items per shop

📡 API Overview
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Authenticate user
GET	/api/shops	Get all shops
POST	/api/shops	Add a new shop
GET	/api/shops/:id/items	Get shop items
POST	/api/shops/:id/items/upload	Upload items via Excel
GET	/api/shops/nearby	Find shops within 2 km
💻 Deployment

The app is deployed using Render:

Frontend → React build served on Render static site

Backend → Node.js Express API hosted on Render server

Database → MongoDB Atlas

🧠 Future Enhancements

Add Google Maps integration for visual shop location

Enable user reviews and ratings for shops

Support multi-image uploads for shop items

Implement JWT-based session refresh tokens
<img width="919" height="735" alt="image" src="https://github.com/user-attachments/assets/7d42e410-f940-4d5c-933f-b8d6f796068c" />

