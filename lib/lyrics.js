import axios from "axios";

export async function getLyrics(artist, song) {
  try {
    artist = artist.replace(/ /g, "%20");
    const url = `https://api.lyrics.ovh/v1/${artist}/${song}`;
    const response = await axios.get(url);
    return response.data.lyrics;
  } catch (e) {
    return "err: Lyrics not found";
  }
}
