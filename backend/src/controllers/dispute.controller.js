import { disputeService } from '../services/dispute.service.js';

export const disputeController = {
  /**
   * GET /api/disputes
   */
  async getDisputes(req, res, next) {
    try {
      const disputes = await disputeService.getDisputes();
      return res.status(200).json(disputes);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/disputes
   */
  async fileDispute(req, res, next) {
    try {
      const { fineId, reason, remarks } = req.body;
      if (!fineId || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Fine ID and dispute reason are required.'
        });
      }

      const dispute = await disputeService.fileDispute({ fineId, reason, remarks });
      return res.status(201).json(dispute);
    } catch (err) {
      next(err);
    }
  }
};
