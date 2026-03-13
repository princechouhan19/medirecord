const Clinic = require('../models/Clinic.model');

/**
 * Middleware to check if a clinic's subscription is active and has required tier
 * @param {Array} requiredPlans - Plans allowed (e.g., ['pro'])
 */
const checkSubscription = (requiredPlans = []) => async (req, res, next) => {
  try {
    // 1. Get clinic info
    const clinicId = req.user.clinic;
    if (!clinicId && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'No clinic associated with this account' });
    }

    // Bypass check for superadmin
    if (req.user.role === 'superadmin') return next();

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    const { subscription, isActive } = clinic;

    // 2. Check if clinic is active at all
    if (!isActive) {
      return res.status(403).json({ error: 'Clinic account is suspended. Contact support.' });
    }

    // 3. Check for Expiry
    if (subscription.endDate && new Date() > new Date(subscription.endDate)) {
      return res.status(403).json({ 
        error: 'Subscription expired', 
        expired: true,
        expiryDate: subscription.endDate 
      });
    }

    // 4. Check for Plan Tier (if specified)
    if (requiredPlans.length > 0 && !requiredPlans.includes(subscription.plan)) {
      return res.status(403).json({ 
        error: `Feature restricted to ${requiredPlans.join(' or ')} plans`,
        requiredPlan: requiredPlans[0]
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { checkSubscription };
