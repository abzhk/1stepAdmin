export const FeaturedArticles = async (Article) => {
  await Article.updateMany(
    { featured: true },
    { featured: false }
  );
};