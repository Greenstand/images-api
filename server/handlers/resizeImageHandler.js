const Joi = require('joi');
const stream = require('stream');
const { resizeImage } = require('../services/ResizeImageService');
const { version } = require('../../package.json');

const paramsSchema = Joi.object({
  domain: Joi.string().required(),
  image: Joi.string().required(),
  params: Joi.string(),
});

const resizeImageGet = async (req, res) => {
  await paramsSchema.validateAsync(req.params, { abortEarly: false });
  console.log('params', req.params);

  const url = `https://${req.params.domain}/${req.params.image}`;
  console.log('get-url', url);
  const imageBuffer = await resizeImage(url, req.params?.params || '');

  const readStream = new stream.PassThrough();
  readStream.end(imageBuffer);

  res.set('Content-Type', 'image/jpeg');
  readStream.pipe(res);
};

const resizeImageArbitraryDepth = async (req, res) => {
  // image domain with paths of arbitrary depth (url/path/path)
  const { url } = req;
  console.log('received url', url)
  if (url.includes('/img/')) {
    const urlString = url.split('/img/')[1];
    const urlGroups = urlString.split('/');

    const imageUrlArray = [];
    const params = [];

    for (let i = 0; i < urlGroups.length; i += 1) {
      if (
        urlGroups[i].includes('h=') ||
        urlGroups[i].includes('w=') ||
        urlGroups[i].includes('r=') ||
        urlGroups[i].includes('q=')
      ) {
        params.push(urlGroups[i]);
      } else {
        imageUrlArray.push(urlGroups[i]);
      }
    }

    const imageUrl = `https://${imageUrlArray.join('/')}`;
    const imageBuffer = await resizeImage(imageUrl, params.join(''));

    const readStream = new stream.PassThrough();
    readStream.end(imageBuffer);

    res.set('Content-Type', 'image/jpeg');
    readStream.pipe(res);
  } else {
    res.send(version);
  }
};

module.exports = { resizeImageGet, resizeImageArbitraryDepth };
