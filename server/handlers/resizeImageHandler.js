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

  const url = `https://${req.params.domain}/${req.params.image}`;
  const imageBuffer = await resizeImage(url, req.params?.params || '');

  const readStream = new stream.PassThrough();
  readStream.end(imageBuffer);

  res.set('Content-Type', 'image/jpeg');
  readStream.pipe(res);
};

const resizeImageArbitraryDepth = async (req, res) => {
  // image domain with paths of arbitrary depth (url/path/path)
  const { url } = req;
  if (url.includes('/img/')) {
    const urlString = url.split('/img/')[1];
    const urlGroups = urlString.split('/');

    const image = urlGroups.pop();
    let params = urlGroups[urlGroups.length - 1];
    if (
      params.includes('h=') ||
      params.includes('w=') ||
      params.includes('r=') ||
      params.includes('q=')
    ) {
      urlGroups.pop();
    } else {
      params = '';
    }
    const domain = urlGroups.join('/');
    await paramsSchema.validateAsync({ image, domain }, { abortEarly: false });

    const imageUrl = `https://${domain}/${image}`;
    const imageBuffer = await resizeImage(imageUrl, params || '');

    const readStream = new stream.PassThrough();
    readStream.end(imageBuffer);

    res.set('Content-Type', 'image/jpeg');
    readStream.pipe(res);
  } else {
    res.send(version);
  }
};

module.exports = { resizeImageGet, resizeImageArbitraryDepth };
