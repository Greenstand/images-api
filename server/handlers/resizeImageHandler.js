const Joi = require('joi');
const stream = require('stream');
const { resizeImage } = require('../services/ResizeImageService');

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

module.exports = { resizeImageGet };
