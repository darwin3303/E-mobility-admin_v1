import { fineService } from '../services/fine.service.js';

export const fineController = {
  /**
   * GET /api/fines
   */
  async getFines(req, res, next) {
    try {
      const vehiclePlate = req.query.plate || req.query.vehicle;
      const fines = await fineService.getFines(vehiclePlate);
      return res.status(200).json(fines);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/fines/:id
   */
  async getFineById(req, res, next) {
    try {
      const fineId = req.params.id;
      const fine = await fineService.getFineById(fineId);
      if (!fine) {
        return res.status(404).json({ success: false, message: 'Citation not found' });
      }
      return res.status(200).json(fine);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/fines/violations (Record new high-speed violation event)
   */
  async recordViolation(req, res, next) {
    try {
      const violationData = req.body;
      const result = await fineService.recordViolation(violationData);
      return res.status(201).json({
        success: true,
        message: 'High-speed violation logged and ticket linked to vehicle successfully.',
        fine: result
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/fines/pay or POST /api/fines/:id/pay
   */
  async payFine(req, res, next) {
    try {
      const fineId = req.params.id || req.body.fineId || req.body.id;
      const paymentDetails = req.body.paymentDetails || req.body;

      if (!fineId) {
        return res.status(400).json({
          success: false,
          message: 'Fine ID is required to process payment.'
        });
      }

      const result = await fineService.payFine(fineId, paymentDetails);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/fines/dispute or POST /api/fines/:id/dispute
   */
  async disputeFine(req, res, next) {
    try {
      const fineId = req.params.id || req.body.fineId || req.body.id;
      const disputeData = req.body;

      if (!fineId) {
        return res.status(400).json({
          success: false,
          message: 'Fine ID is required to dispute citation.'
        });
      }

      const result = await fineService.disputeFine(fineId, disputeData);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
};
