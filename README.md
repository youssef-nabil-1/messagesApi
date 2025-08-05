# REST API with Node.js

A RESTful API built with Node.js that provides functionality for creating, reading, updating, and deleting posts with image attachments. The API includes user authentication and real-time updates using WebSocket connections.

## Features

-   User authentication
-   CRUD operations for posts
-   Image upload and management
-   Real-time updates using WebSocket
-   Input validation
-   Error handling
-   MongoDB integration with Mongoose
-   User-post relationship management

## Project Structure

```
├── controllers/
│   ├── auth.js        # Authentication controller
│   └── feed.js        # Posts controller
├── middlewares/
│   └── is-auth.js     # Authentication middleware
├── models/
│   ├── post.js        # Post model schema
│   └── user.js        # User model schema
├── routes/
│   ├── auth.js        # Authentication routes
│   └── feed.js        # Posts routes
├── images/            # Uploaded images storage
├── app.js            # Main application file
├── socket.js         # WebSocket configuration
└── package.json      # Project dependencies
```

## API Endpoints

### Posts

-   `GET /feed/posts` - Get all posts
-   `POST /feed/post` - Create a new post
-   `GET /feed/post/:postId` - Get a specific post
-   `PUT /feed/post/:postId` - Update a post
-   `DELETE /feed/post/:postId` - Delete a post

### Authentication

-   Authentication endpoints are handled in the auth routes

## Real-time Features

The API uses WebSocket connections to provide real-time updates when:

-   A new post is created
-   A post is updated
-   A post is deleted

## Prerequisites

-   Node.js
-   MongoDB
-   npm or yarn

## Getting Started

1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```
3. Configure your MongoDB connection
4. Start the server:
    ```bash
    npm start
    ```

## Authentication

The API uses token-based authentication. Protected routes require a valid JWT token to be included in the Authorization header.

## Image Handling

-   Images are stored locally in the `images` directory
-   The API automatically manages image cleanup when posts are updated or deleted
-   Supported image formats can be configured in the application

## Error Handling

The API implements centralized error handling with proper HTTP status codes and error messages.
