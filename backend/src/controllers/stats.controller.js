import { isPostgresConnected } from '../config/db.js';
import { vehicleService } from '../services/vehicle.service.js';
import { fineService } from '../services/fine.service.js';
import { disputeService } from '../services/dispute.service.js';
import { stationService } from '../services/station.service.js';

export const statsController = {
  /**
   * GET /api/health
   */
  async getHealth(req, res) {
    return res.status(200).json({
      success: true,
      service: 'E-Mobility Shared Backend API Server',
      postgresConnected: isPostgresConnected(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      frontends: {
        admin: 'http://localhost:5173',
        vehiclePortal: 'http://localhost:5174'
      }
    });
  },

  /**
   * GET /api/stats
   */
  async getOverviewStats(req, res, next) {
    try {
      const [vehicles, fines, disputes, stations] = await Promise.all([
        vehicleService.getVehicles(),
        fineService.getFines(),
        disputeService.getDisputes(),
        stationService.getStations()
      ]);

      const unpaidFines = fines.filter(f => f.status !== 'Paid');
      const paidFines = fines.filter(f => f.status === 'Paid');
      const totalRevenue = paidFines.reduce((sum, f) => sum + (f.amount || 0), 0);
      const pendingFinesAmount = unpaidFines.reduce((sum, f) => sum + (f.amount || 0), 0);

      return res.status(200).json({
        success: true,
        stats: {
          totalVehicles: vehicles.length,
          totalFines: fines.length,
          unpaidFinesCount: unpaidFines.length,
          paidFinesCount: paidFines.length,
          totalDisputes: disputes.length,
          totalStations: stations.length,
          totalRevenueLkr: totalRevenue,
          pendingRevenueLkr: pendingFinesAmount,
          cameraCheckpointsOnline: 4
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
