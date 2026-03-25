export const calculateMatchScore = (currentUser, candidate) => {
  let score = 0;

  const commonSkills = candidate.skills.filter(skill =>
    currentUser.skills.includes(skill)
  );

  score += commonSkills.length * 3;

  if (candidate.availability === currentUser.availability) {
    score += 2;
  }

  score += candidate.projectsCompleted * 2;
  score += candidate.hackathons * 3;

  if (candidate.isVerified) score += 5;

  return score;
};

export const rankUsers = (users, currentUser) => {
  return users
    .map(user => ({
      ...user,
      score: calculateMatchScore(currentUser, user),
    }))
    .sort((a, b) => b.score - a.score);
};