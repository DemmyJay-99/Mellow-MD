function getRandomFourDigitNumber() {
  const min = 1000;
  const max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomNumber = getRandomFourDigitNumber();
export default randomNumber.toString();
