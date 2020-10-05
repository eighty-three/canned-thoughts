# Canned Thoughts
Just another (attempt at a) twitter clone, mostly because I wanted to know more about authentication, authorization, and security. And tags.

https://cannedthoughts.xyz


## Authentication
### Wrappers
* [withAuth.jsx](client/src/components/AuthComponents/withAuth.jsx) - For the component, if it's meant to be a protected page (the user needs to be logged in), it will redirect to the login page if the user is not authorized
* [withAuthGSSP.js](client/src/components/AuthComponents/withAuthGSSP.js) - In order to confirm authorization (via `getServerSideProps`), a wrapper is used so that it goes through `authCheck` first

### Client checks
* [authCheck](client/src/lib/authCheck.js) - The main function used for checking authorization. It queries the database to verify the user
* [lightAuthCheck](client/src/lib/authCheck.js) - Only used in the [profile page](client/src/pages/profile/[user]/index.jsx) and the [post page](client/src/pages/profile/\[user\]/\[post\]/index.jsx) because these pages aren't sensitive. It only needs to check if the cookie still hasn't expired; it doesn't need to query the database

### Server checks
* [verifyToken](api/src/authMiddleware/authToken.ts) - The main function used for checking authorization in the server. Every sensitive route runs through `verifyToken`.
* [verifyUser](api/src/authMiddleware/accountController.ts) - The `verifyUser` function does nothing except return the username; it is used because the `verifyToken` function itself is just a middleware.


## Tags
* [Creating tags](api/src/content/model.ts#L5) - `createPost` (baked-in functionality) 
* [Searching tags](api/src/content/model.ts#L194) - `searchPostsWithTags`

```
CREATE TABLE posts (
  post_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES accounts(user_id) ON DELETE CASCADE NOT NULL,
  post TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  date TIMESTAMP DEFAULT now(),
  tags TEXT []
);

CREATE TABLE tags (
  tag_id SERIAL PRIMARY KEY,
  tag_name CITEXT NOT NULL UNIQUE
);

CREATE TABLE posts_tags (
  post_id INT REFERENCES posts(post_id) ON DELETE CASCADE NOT NULL,
  tag_id INT [] NOT NULL
);
```
