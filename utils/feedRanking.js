export const rankPosts = (posts, user) => {
  return posts
    .map(post => {
      let score = 0;

      if (user.interests.includes(post.type)) score += 3;
      score += post.likes;
      score += post.replies * 2;

      return { ...post, score };
    })
    .sort((a, b) => b.score - a.score);
};