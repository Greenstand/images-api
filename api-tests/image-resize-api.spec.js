require('dotenv').config();
const chai = require('chai');
const sinon = require('sinon');
const mockery = require('mockery');
const log = require('loglevel');
const request = require('./lib/supertest');

const { expect } = chai;

describe('image resizing tests', () => {
  const imageFirstPart = 'image.com';
  const imageSecondPart = 'image.jpg';

  const axiosStub = sinon.stub().callsFake(async (url, config) => {
    const expectedUrl = `https://${imageFirstPart}/${imageSecondPart}`;
    if (url === expectedUrl && config.responseType === 'arraybuffer') {
      return {
        data: Buffer.from('image'),
      };
    }
    return {};
  });

  beforeEach(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true,
    });
    mockery.registerMock('axios', { default: { get: axiosStub } });
    delete require.cache[require.resolve('../server/app')];
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('GET', () => {
    it('should return image without filter', async () => {
      // Getting the server after the node modules have been mocked
      const server = require('../server/app');

      const res = await request(server).get(
        `/img/${imageFirstPart}/${imageSecondPart}`,
      );
      expect(res.header['content-type']).to.eql('image/jpeg');
      expect(res.body).to.eql(Buffer.from('image'));
    });

    it('should return image with filters', async () => {
      const result = {
        resize: sinon.stub().callsFake(function (a, b) {
          log.warn('resize stub');
          expect(a).to.eql(400);
          expect(b).to.eql(400);
          return this;
        }),
        rotate: sinon.stub().callsFake(function (a) {
          log.warn('rotate stub');
          expect(a).to.eql(90);
          return this;
        }),
        jpeg: sinon.stub().callsFake(function (a) {
          log.warn('jpeg stub');
          expect(a.quality).to.eql(100);
          return this;
        }),
        toBuffer: sinon.stub().callsFake(async function () {
          log.warn('toBuffer stub');
          return Buffer.from('sharpImage');
        }),
      };

      const sharpStub = sinon.stub().callsFake((imageBuffer) => {
        log.warn('sharp stub');
        expect(imageBuffer).to.eql(Buffer.from('image'));
        return result;
      });

      mockery.registerMock('sharp', sharpStub);
      const server = require('../server/app');

      const res = await request(server).get(
        `/img/${imageFirstPart}/f=auto,w=400,r=90,h=400,q=100/${imageSecondPart}`,
      );
      expect(res.header['content-type']).to.eql('image/jpeg');
      expect(res.body).to.eql(Buffer.from('sharpImage'));
    });
  });
});
