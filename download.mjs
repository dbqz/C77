import fs from 'fs';
import https from 'https';

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = { headers: { 'User-Agent': 'Mozilla/5.0' } };
    https.get(url, options, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  fs.mkdirSync('./public', { recursive: true });
  console.log('Downloading Big Ben image...');
  await download('https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1920&auto=format&fit=crop', './public/big-ben.jpg');
  console.log('Downloading rain audio...');
  await download('https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg', './public/rain.ogg');
  console.log('Downloading thunder audio...');
  await download('https://actions.google.com/sounds/v1/weather/rolling_thunder.ogg', './public/thunder.ogg');
  console.log('All downloads complete!');
}
main();
