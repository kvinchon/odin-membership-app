#! /usr/bin/env node

console.log(
  'This script populates some test users and posts to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/clubhouse?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Post = require('./models/post');
const User = require('./models/user');

const bcrypt = require('bcryptjs');
require('dotenv').config();

const posts = [];
const users = [];

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const mongoDB = userArgs[0];

main()
  .catch((err) => console.log(err))
  .finally(() => process.exit(0));

async function main() {
  console.log('Debug: About to connect');
  await mongoose.connect(mongoDB);
  console.log('Debug: Should be connected?');
  await createUsers();
  await createPosts();
  console.log('Debug: Closing mongoose');
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// user[0] will always be John, regardless of the order
// in which the elements of promise.all's argument complete.
async function userCreate(
  index,
  firstName,
  lastName,
  username,
  password,
  admin = false,
  status = 'guest'
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    first_name: firstName,
    last_name: lastName,
    username: username,
    password: hashedPassword,
    admin: admin,
    status: status,
  });

  await user.save();
  users[index] = user;
  console.log(`Added user: ${user.username}`);
}

async function postCreate(index, title, content, author) {
  const post = new Post({
    title: title,
    content: content,
    author: author,
    created_at: new Date(),
    updated_at: new Date(),
  });

  await post.save();
  posts[index] = post;
  console.log(`Added post: ${post.title}`);
}

async function createUsers() {
  console.log('Adding Users');
  const password = process.env.POPULATE_PASSWORD;
  if (!password) {
    console.log('Password not found');
    return;
  }
  await Promise.all([
    userCreate(0, 'John', 'Smith', 'John', password, true, 'moderator'),
    userCreate(1, 'Lena', 'Strauss', 'Lena', password, false, 'vip'),
    userCreate(2, 'Bruce', 'McKain', 'Bruce', password, false, 'member'),
    userCreate(3, 'Elena', 'Nova', 'Elena', password),
  ]);
}

async function createPosts() {
  console.log('Adding Posts');
  await Promise.all([
    postCreate(0, 'Hello', 'This is my first post!', users[0]),
    postCreate(1, 'Good morning', "I'm new here!", users[1]),
    postCreate(2, 'Wow', 'This club is awesome!', users[2]),
    postCreate(3, 'Hey', 'Nice to meet you!', users[3]),
  ]);
}
