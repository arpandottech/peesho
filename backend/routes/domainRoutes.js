const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');

router.post('/', domainController.addDomain);
router.get('/', domainController.getDomains);
router.get('/:id/status', domainController.checkStatus);
router.put('/:id/toggle', domainController.toggleStatus);
router.post('/:id/retry', domainController.retryProvisioning);
router.delete('/:id', domainController.deleteDomain);

module.exports = router;
