import express from 'express';
import {
  getAllEmployeeCosts,
  getEmployeeCostById,
  createEmployeeCost,
  updateEmployeeCost,
  deleteEmployeeCost,
  getPayrollSummary,
  getEmployeeCostStats,
} from '../controllers/employeeCostController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /employee-costs/payroll/summary:
 *   get:
 *     summary: Get payroll summary
 *     description: Get payroll summary including total costs by period
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year
 *     responses:
 *       200:
 *         description: Payroll summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSalary:
 *                       type: number
 *                       example: 500000
 *                     totalBonus:
 *                       type: number
 *                       example: 50000
 *                     totalDeductions:
 *                       type: number
 *                       example: 25000
 *                     netPayable:
 *                       type: number
 *                       example: 525000
 *                     employeeCount:
 *                       type: number
 *                       example: 20
 *       401:
 *         description: Unauthorized
 */
router.get('/payroll/summary', getPayrollSummary);

/**
 * @swagger
 * /employee-costs/stats:
 *   get:
 *     summary: Get employee cost statistics
 *     description: Get aggregated statistics for employee costs
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter costs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter costs until this date
 *     responses:
 *       200:
 *         description: Employee cost statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCosts:
 *                       type: number
 *                       example: 2000000
 *                     monthlyCosts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           total:
 *                             type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getEmployeeCostStats);

/**
 * @swagger
 * /employee-costs:
 *   get:
 *     summary: Get all employee costs
 *     description: Get paginated list of all employee costs with optional filters
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: costType
 *         schema:
 *           type: string
 *           enum: [Salary, Bonus, Advance, Deduction, Other]
 *         description: Filter by cost type
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter by month
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *     responses:
 *       200:
 *         description: Employee costs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EmployeeCost'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new employee cost
 *     description: Create a new employee cost record (salary, bonus, advance, etc.)
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - costType
 *               - amount
 *               - month
 *               - year
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: MongoDB ObjectId of the employee
 *                 example: 507f1f77bcf86cd799439011
 *               costType:
 *                 type: string
 *                 enum: [Salary, Bonus, Advance, Deduction, Other]
 *                 example: Salary
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 30000
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 1
 *               year:
 *                 type: integer
 *                 example: 2024
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-31
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Bank Transfer, Cheque]
 *                 example: Bank Transfer
 *               notes:
 *                 type: string
 *                 example: Monthly salary for January 2024
 *     responses:
 *       201:
 *         description: Employee cost created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EmployeeCost'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router
  .route('/')
  .get(getAllEmployeeCosts)
  .post(authorize('Admin', 'AccountManager'), createEmployeeCost);

/**
 * @swagger
 * /employee-costs/{id}:
 *   get:
 *     summary: Get employee cost by ID
 *     description: Retrieve detailed information for a specific employee cost record
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee cost ID
 *     responses:
 *       200:
 *         description: Employee cost details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EmployeeCost'
 *       404:
 *         description: Employee cost not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update employee cost
 *     description: Update employee cost information
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee cost ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               paymentDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Bank Transfer, Cheque]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee cost updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EmployeeCost'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Employee cost not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 *   delete:
 *     summary: Delete employee cost
 *     description: Delete an employee cost record (Admin only)
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee cost ID
 *     responses:
 *       200:
 *         description: Employee cost deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Employee cost not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route('/:id')
  .get(getEmployeeCostById)
  .put(authorize('Admin', 'AccountManager'), updateEmployeeCost)
  .delete(authorize('Admin'), deleteEmployeeCost);

export default router;
