const calculateDailyRate = ({ currentWeight, height, age, desiredWeight }) => {
  const BMR = 10 * currentWeight + 6.25 * height - 5 * age - 161;
  const correction = (currentWeight - desiredWeight) * 10;

  return Math.round(BMR - correction);
};

module.exports = {
  calculateDailyRate,
};
