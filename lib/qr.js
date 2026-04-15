import axios from "axios"

const generateQR = async (text) => {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=50&data=${encodeURIComponent(text)}`;
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

export default generateQR