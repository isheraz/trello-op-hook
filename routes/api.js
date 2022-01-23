var express = require('express');
var router = express.Router();

/**
 * 
 * @request POST
 * @param req { name, title, description, assignee, expectedHours }
 * @returns res 
 */
router.post('/work-package', function(req, res, next) {
    console.log(req.body);
    res.send('respond with a resource');
});

module.exports = router;
