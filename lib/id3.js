import {write} from "node-id3"

function writeTags(buffer, tags) {
  return new Promise((resolve, reject) => {
    write(tags, buffer, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export default writeTags;