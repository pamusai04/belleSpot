export const calculateAverageRating = (ratings) => {
  if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
    return { value: 0, count: 0 };
  }

  const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
  const average = totalScore / ratings.length;
  const formattedValue = average % 1 === 0 ? average : average.toFixed(1);
  
  return {
    value: parseFloat(formattedValue),
    count: ratings.length,
  }
}