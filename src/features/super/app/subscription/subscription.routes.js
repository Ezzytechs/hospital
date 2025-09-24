const express = require('express');
const SubscriptionController = require('./subscription.controller');
const superAdminAuth = require('../../middleware/superAuth');
const tenantAuthLogin =require("../../../tenant/middleware/tenantAuthLogin")
const tenantAuth =require("../../../tenant/middleware/tenantAuth")

const router = express.Router();

// ---------- SUPER ADMIN ----------
router.post('/plans',superAdminAuth, SubscriptionController.createPlan);
router.put('/plans/:id', superAdminAuth, SubscriptionController.updatePlan);
router.delete('/plans/:id', superAdminAuth, SubscriptionController.deletePlan);
router.get('/plans/active', superAdminAuth, SubscriptionController.getActiveSubscribers);
router.get('/plans/active/total', superAdminAuth, SubscriptionController.getTotalActiveSubscribers);

// ---------- TENANT ADMIN ----------
router.post('/purchase', tenantAuthLogin, SubscriptionController.purchase);
router.get('/status', tenantAuth, SubscriptionController.checkStatus);

//Public
router.get('/plans', SubscriptionController.listPlans); // public (hospitals need to see plans)

module.exports = router;
