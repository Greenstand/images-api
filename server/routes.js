const express = require('express');

const router = express.Router();
const { resizeImageGet } = require('./handlers/resizeImageHandler');
const { handlerWrapper } = require('./utils/utils');

router.route('/img/:domain/:image').get(handlerWrapper(resizeImageGet));
router.route('/img/:domain/:params/:image').get(handlerWrapper(resizeImageGet));

module.exports = router;
