import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeCosts,
  getEmployeeStats,
} from '../controllers/employeeController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /employees/stats:
 *   get:
 *     summary: Get employee statistics
 *     description: Get aggregated statistics for employees including total count, active employees, and by department
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: Employee statistics retrieved successfully
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
 *                     totalEmployees:
 *                       type: number
 *                       example: 50
 *                     activeEmployees:
 *                       type: number
 *                       example: 45
 *                     inactiveEmployees:
 *                       type: number
 *                       example: 5
 *                     employeesByDepartment:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           department:
 *                             type: string
 *                           count:
 *                             type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getEmployeeStats);

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get all employees
 *     description: Get paginated list of all employees with optional filters
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, employee number, or phone
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: designation
 *         schema:
 *           type: string
 *         description: Filter by designation
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
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
 *                     $ref: '#/components/schemas/Employee'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new employee
 *     description: Create a new employee record
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - department
 *               - designation
 *               - joiningDate
 *               - salary
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mohammad Hasan
 *               fatherName:
 *                 type: string
 *                 example: Abdul Karim
 *               phone:
 *                 type: string
 *                 example: +8801712345678
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hasan@example.com
 *               nid:
 *                 type: string
 *                 example: 1234567890123
 *               department:
 *                 type: string
 *                 example: Sales
 *               designation:
 *                 type: string
 *                 example: Sales Executive
 *               joiningDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-01
 *               salary:
 *                 type: number
 *                 example: 30000
 *               address:
 *                 type: string
 *                 example: Dhaka, Bangladesh
 *               emergencyContact:
 *                 type: string
 *                 example: +8801812345678
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 */
router
  .route('/')
  .get(getAllEmployees)
  .post(authorize('Admin', 'AccountManager'), createEmployee);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     description: Retrieve detailed information for a specific employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update employee
 *     description: Update employee information
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fatherName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               nid:
 *                 type: string
 *               department:
 *                 type: string
 *               designation:
 *                 type: string
 *               salary:
 *                 type: number
 *               address:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Account Manager access required
 *   delete:
 *     summary: Delete employee
 *     description: Delete an employee record (Admin only)
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deleted successfully
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
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route('/:id')
  .get(getEmployeeById)
  .put(authorize('Admin', 'AccountManager'), updateEmployee)
  .delete(authorize('Admin'), deleteEmployee);

/**
 * @swagger
 * /employees/{id}/costs:
 *   get:
 *     summary: Get employee costs
 *     description: Get all cost records (salary payments, bonuses, etc.) for a specific employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
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
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/costs', getEmployeeCosts);

export default router;
