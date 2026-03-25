export const isFakeProfile = (user) => {
  let score = 0;

  if (!user.email.includes('.edu')) score += 3;
  if (!user.description) score += 2;
  if (user.skills.length === 0) score += 2;

  return score > 3;
};