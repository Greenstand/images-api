const axios = require('axios').default;
const Joi = require('joi');
const sharp = require('sharp');

const resizeImage = async (url, paramString) => {
  const paramsFilterSchema = Joi.object({
    h: Joi.number().integer().greater(0).default(0),
    w: Joi.number().integer().greater(0).default(0),
    r: Joi.number().integer().default(0),
    q: Joi.number().integer().greater(0).less(101).default(80), // sharp's default quality is 80
  });

  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(response.data, 'base64');

  if (paramString) {
    const params = paramString.split(',');

    const filteredParams = params.reduce((results, p) => {
      const resultsCopy = { ...results };
      if (
        p.split('=')[0] === 'h' ||
        p.split('=')[0] === 'w' ||
        p.split('=')[0] === 'r' ||
        p.split('=')[0] === 'q'
      ) {
        resultsCopy[p.split('=')[0]] = +p.split('=')[1];
        return resultsCopy;
      }
      return results;
    }, {});

    const validatedParams = await paramsFilterSchema.validateAsync(
      filteredParams,
      { abortEarly: false },
    );

    const { w, h, r, q } = validatedParams;

    if (w || h) {
      const formattedImage = await sharp(imageBuffer)
        .resize(w || null, h || null)
        .rotate(r || null)
        .jpeg({ quality: q })
        .toBuffer();

      return formattedImage;
    }
  }

  return imageBuffer;
};

module.exports = { resizeImage };
