export const posts = [
  {
    id: 1,
    title: "Getting Started with Photography",
    content: "Photography is a wonderful hobby that allows you to capture moments and express creativity. Start with mastering the basics of composition and lighting.",
    image: "https://via.placeholder.com/300x200?text=Photography",
    author: "sarah_photo",
    upvotes: 24,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ["Great tips!", "Very helpful"]
  },
  {
    id: 2,
    title: "My First Painting",
    content: "After years of hesitation, I finally picked up a brush and created my first painting. It's not perfect, but I'm proud of it!",
    image: "https://via.placeholder.com/300x200?text=Painting",
    author: "artist_mike",
    upvotes: 42,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ["Amazing work!", "Keep it up"]
  },
  {
    id: 3,
    title: "Best Gardening Tips for Spring",
    content: "Spring is the perfect time to start gardening! Here are my top tips for a successful garden this season.",
    image: "https://via.placeholder.com/300x200?text=Gardening",
    author: "garden_lover",
    upvotes: 15,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    comments: ["Love this!"]
  },
  {
    id: 4,
    title: "Learning to Cook Italian Pasta",
    content: "Making fresh pasta from scratch is easier than you think. Here's my step-by-step guide to homemade Italian pasta.",
    image: "https://via.placeholder.com/300x200?text=Cooking",
    author: "chef_alex",
    upvotes: 38,
    createdAt: new Date().toISOString(),
    comments: ["Looks delicious", "Can't wait to try"]
  }
];