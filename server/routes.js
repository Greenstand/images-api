const express = require('express');

const router = express.Router();
const {
  resizeImageGet,
  resizeImageArbitraryDepth,
} = require('./handlers/resizeImageHandler');
const { handlerWrapper } = require('./utils/utils');

router.route('/img/:domain/:image').get(handlerWrapper(resizeImageGet));
router.route('/img/:domain/:params/:image').get(handlerWrapper(resizeImageGet));
router.route('*').get(handlerWrapper(resizeImageArbitraryDepth));

module.exports = router;
