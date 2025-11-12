import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { connectDB } from '../config/db';

// Import all models
import { User } from '../models/User';
import { Client } from '../models/Client';
import { RSNumber } from '../models/RSNumber';
import { Plot } from '../models/Plot';
import Sale from '../models/Sale';
import Receipt from '../models/Receipt';
import InstallmentSchedule from '../models/InstallmentSchedule';
import Expense from '../models/Expense';
import ExpenseCategory from '../models/ExpenseCategory';
import Employee from '../models/Employee';
import EmployeeCost from '../models/EmployeeCost';
import BankAccount from '../models/BankAccount';
import CashAccount from '../models/CashAccount';
import Cheque from '../models/Cheque';
import Cancellation from '../models/Cancellation';
import Refund from '../models/Refund';
import Ledger from '../models/Ledger';
import SMSTemplate from '../models/SMSTemplate';
import SystemSetting from '../models/SystemSetting';

dotenv.config();

// Helper functions
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Bangladesh phone number generator
const generatePhone = () => `01${randomInt(3, 9)}${randomInt(10000000, 99999999)}`;

// Bangladesh NID generator
const generateNID = () => String(randomInt(1000000000, 9999999999999999));

// Name generators
const firstNames = ['Mohammad', 'Abdul', 'Ahmed', 'Rahul', 'Karim', 'Rahim', 'Jamal', 'Kamrul', 'Shakib', 'Tamim', 'Mushfiq', 'Mahmud', 'Hasan', 'Sohel', 'Iqbal', 'Farhan', 'Rashed', 'Tanvir', 'Sabbir', 'Imran'];
const lastNames = ['Rahman', 'Islam', 'Khan', 'Ahmed', 'Ali', 'Hossain', 'Uddin', 'Chowdhury', 'Miah', 'Sheikh', 'Akter', 'Begum', 'Khatun', 'Sultana', 'Hassan'];

const generateName = () => `${randomChoice(firstNames)} ${randomChoice(lastNames)}`;

const projects = ['Arshinagar Phase 1', 'Arshinagar Phase 2', 'Green Valley', 'Sunset Heights', 'City Garden'];
const areas = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Gazipur', 'Narayanganj'];

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Client.deleteMany({}),
    RSNumber.deleteMany({}),
    Plot.deleteMany({}),
    Sale.deleteMany({}),
    Receipt.deleteMany({}),
    InstallmentSchedule.deleteMany({}),
    Expense.deleteMany({}),
    ExpenseCategory.deleteMany({}),
    Employee.deleteMany({}),
    EmployeeCost.deleteMany({}),
    BankAccount.deleteMany({}),
    CashAccount.deleteMany({}),
    Cheque.deleteMany({}),
    Cancellation.deleteMany({}),
    Refund.deleteMany({}),
    Ledger.deleteMany({}),
    SMSTemplate.deleteMany({}),
    SystemSetting.deleteMany({}),
  ]);
  console.log('✅ Database cleared');
}

async function seedUsers() {
  console.log('👥 Seeding users...');

  const users = [
    { username: 'admin', email: 'admin@arshinagar.com', password: 'Admin@123', role: 'Admin', isActive: true },
    { username: 'accountmgr', email: 'manager@arshinagar.com', password: 'Manager@123', role: 'AccountManager', isActive: true },
    { username: 'hof', email: 'hof@arshinagar.com', password: 'Hof@1234', role: 'HOF', isActive: true },
  ];

  // Use create() instead of insertMany() to trigger pre-save hooks for password hashing
  const createdUsers = await User.create(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
}

async function seedExpenseCategories(users: any[]) {
  console.log('💰 Seeding expense categories...');

  const adminUser = users[0]; // Use admin user as creator

  const categories = [
    { name: 'Land Purchase', description: 'Land acquisition costs', isActive: true, createdBy: adminUser._id },
    { name: 'Salary', description: 'Employee salaries', isActive: true, createdBy: adminUser._id },
    { name: 'Stationery', description: 'Office supplies', isActive: true, createdBy: adminUser._id },
    { name: 'Utility', description: 'Electricity, water, internet', isActive: true, createdBy: adminUser._id },
    { name: 'Sales Commission', description: 'Sales agent commissions', isActive: true, createdBy: adminUser._id },
    { name: 'Fuel', description: 'Vehicle fuel costs', isActive: true, createdBy: adminUser._id },
    { name: 'Client Entertainment', description: 'Client meetings and entertainment', isActive: true, createdBy: adminUser._id },
    { name: 'Marketing', description: 'Advertising and marketing', isActive: true, createdBy: adminUser._id },
    { name: 'Legal', description: 'Legal and registration fees', isActive: true, createdBy: adminUser._id },
    { name: 'Maintenance', description: 'Property maintenance', isActive: true, createdBy: adminUser._id },
  ];

  const createdCategories = await ExpenseCategory.insertMany(categories);
  console.log(`✅ Created ${createdCategories.length} expense categories`);
  return createdCategories;
}

async function seedClients() {
  console.log('👤 Seeding clients...');

  const clients = [];
  for (let i = 0; i < 80; i++) {
    clients.push({
      name: generateName(),
      phone: generatePhone(),
      email: `client${i + 1}@example.com`,
      address: `${randomInt(1, 999)}, ${randomChoice(areas)}, Bangladesh`,
      nid: Math.random() > 0.3 ? generateNID() : undefined,
      isActive: true,
    });
  }

  const createdClients = await Client.insertMany(clients);
  console.log(`✅ Created ${createdClients.length} clients`);
  return createdClients;
}

async function seedLandInventory() {
  console.log('🏞️  Seeding land inventory...');

  // Create RS Numbers
  const rsNumbers = [];
  for (let i = 0; i < 15; i++) {
    const totalArea = randomInt(10, 50);
    rsNumbers.push({
      rsNumber: `RS-${String(i + 1).padStart(4, '0')}`,
      projectName: randomChoice(projects),
      location: randomChoice(areas),
      totalArea: totalArea,
      unitType: 'Katha',
      soldArea: 0,
      allocatedArea: 0,
      remainingArea: totalArea,
      description: `DAG-${randomInt(100, 999)}`,
      isActive: true,
    });
  }

  const createdRSNumbers = await RSNumber.insertMany(rsNumbers);
  console.log(`✅ Created ${createdRSNumbers.length} RS Numbers`);

  // Create Plots
  const plots = [];
  for (const rs of createdRSNumbers) {
    const plotCount = randomInt(3, 8);
    for (let i = 0; i < plotCount; i++) {
      const area = randomInt(2, 10);
      const pricePerUnit = randomInt(500000, 2000000);
      plots.push({
        rsNumberId: rs._id,
        plotNumber: `${rs.rsNumber}-P${String(i + 1).padStart(3, '0')}`,
        area: area,
        unitType: 'Katha',
        status: 'Available',
        price: area * pricePerUnit,
        isActive: true,
      });
    }
  }

  const createdPlots = await Plot.insertMany(plots);
  console.log(`✅ Created ${createdPlots.length} plots`);

  return { rsNumbers: createdRSNumbers, plots: createdPlots };
}

async function seedEmployees(users: any[]) {
  console.log('👨‍💼 Seeding employees...');

  const adminUser = users[0]; // Use admin user as creator

  const employees = [
    {
      name: 'Karim Uddin',
      designation: 'Sales Manager',
      phone: generatePhone(),
      email: 'karim@arshinagar.com',
      bankAccount: {
        bankName: 'DBBL',
        accountNumber: '1234567890',
        accountHolderName: 'Karim Uddin'
      },
      joinDate: new Date('2020-01-01'),
      baseSalary: 80000,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: 'Rahim Hossain',
      designation: 'Sales Executive',
      phone: generatePhone(),
      email: 'rahim@arshinagar.com',
      bankAccount: {
        bankName: 'BRAC Bank',
        accountNumber: '0987654321',
        accountHolderName: 'Rahim Hossain'
      },
      joinDate: new Date('2021-06-01'),
      baseSalary: 50000,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: 'Shamim Ahmed',
      designation: 'Accountant',
      phone: generatePhone(),
      email: 'shamim@arshinagar.com',
      bankAccount: {
        bankName: 'Islami Bank',
        accountNumber: '1122334455',
        accountHolderName: 'Shamim Ahmed'
      },
      joinDate: new Date('2020-03-01'),
      baseSalary: 60000,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: 'Fahim Rahman',
      designation: 'Marketing Officer',
      phone: generatePhone(),
      email: 'fahim@arshinagar.com',
      bankAccount: {
        bankName: 'City Bank',
        accountNumber: '5566778899',
        accountHolderName: 'Fahim Rahman'
      },
      joinDate: new Date('2021-01-01'),
      baseSalary: 55000,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: 'Tanim Khan',
      designation: 'Sales Executive',
      phone: generatePhone(),
      email: 'tanim@arshinagar.com',
      bankAccount: {
        bankName: 'EBL',
        accountNumber: '9988776655',
        accountHolderName: 'Tanim Khan'
      },
      joinDate: new Date('2022-01-01'),
      baseSalary: 50000,
      isActive: true,
      createdBy: adminUser._id
    },
  ];

  const createdEmployees = await Employee.insertMany(employees);
  console.log(`✅ Created ${createdEmployees.length} employees`);
  return createdEmployees;
}

async function seedBankAccounts(users: any[]) {
  console.log('🏦 Seeding bank accounts...');

  const adminUser = users[0]; // Use admin user as creator

  const accounts = [
    {
      bankName: 'Dutch Bangla Bank',
      accountNumber: 'DBBL-001-234567',
      accountName: 'Arshinagar Real Estate - DBBL',
      accountType: 'Current',
      branchName: 'Gulshan',
      openingBalance: 5000000,
      currentBalance: 5000000,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      bankName: 'BRAC Bank',
      accountNumber: 'BRAC-002-345678',
      accountName: 'Arshinagar Real Estate - BRAC',
      accountType: 'Savings',
      branchName: 'Dhanmondi',
      openingBalance: 2000000,
      currentBalance: 2000000,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      bankName: 'Islami Bank',
      accountNumber: 'IBBL-003-456789',
      accountName: 'Arshinagar Real Estate - IBBL',
      accountType: 'Current',
      branchName: 'Motijheel',
      openingBalance: 3000000,
      currentBalance: 3000000,
      isActive: true,
      createdBy: adminUser._id
    },
  ];

  const createdAccounts = await BankAccount.insertMany(accounts);
  console.log(`✅ Created ${createdAccounts.length} bank accounts`);

  // Create cash account
  const cashAccount = await CashAccount.create({
    name: 'Cash in Hand',
    description: 'Office cash for petty expenses',
    openingBalance: 500000,
    currentBalance: 500000,
    isActive: true,
    createdBy: adminUser._id,
  });
  console.log(`✅ Created cash account`);

  return { bankAccounts: createdAccounts, cashAccount };
}

async function seedSalesAndReceipts(clients: any[], plots: any[], users: any[], _bankAccounts: any[]) {
  console.log('💼 Seeding sales, receipts, and installments...');

  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');

  let saleCounter = 1;
  let receiptCounter = 1;

  const sales = [];
  const receipts = [];
  const installments = [];
  const cheques = [];

  // Create 60 sales over the year
  for (let i = 0; i < 60; i++) {
    const client = randomChoice(clients);
    const plot = plots.find((p: any) => p.status === 'Available') || randomChoice(plots);

    const saleDate = randomDate(startDate, endDate);
    const totalPrice = plot.price || (plot.area * 1000000); // Use plot price or fallback
    const bookingAmount = totalPrice * 0.2; // 20% booking
    const registrationAmount = totalPrice * 0.05; // 5% registration
    const handoverAmount = totalPrice * 0.05; // 5% handover
    const installmentAmount = totalPrice * 0.70; // 70% in installments

    const monthlyInstallment = installmentAmount / 12;

    const sale = {
      _id: new mongoose.Types.ObjectId(),
      saleNumber: `SAL-2024-${String(saleCounter++).padStart(5, '0')}`,
      clientId: client._id,
      plotId: plot._id,
      rsNumberId: plot.rsNumberId,
      saleDate,
      totalPrice,
      paidAmount: 0,
      dueAmount: totalPrice,
      status: 'Active',
      stages: [
        { _id: new mongoose.Types.ObjectId(), stageName: 'Booking', plannedAmount: bookingAmount, receivedAmount: 0, dueAmount: bookingAmount, status: 'Pending' },
        { _id: new mongoose.Types.ObjectId(), stageName: 'Installments', plannedAmount: installmentAmount, receivedAmount: 0, dueAmount: installmentAmount, status: 'Pending' },
        { _id: new mongoose.Types.ObjectId(), stageName: 'Registration', plannedAmount: registrationAmount, receivedAmount: 0, dueAmount: registrationAmount, status: 'Pending' },
        { _id: new mongoose.Types.ObjectId(), stageName: 'Handover', plannedAmount: handoverAmount, receivedAmount: 0, dueAmount: handoverAmount, status: 'Pending' },
      ],
      isActive: true,
    };

    sales.push(sale);

    // Update plot status
    plot.status = 'Sold';
    plot.clientId = client._id;
    plot.saleDate = saleDate;

    // Create booking receipt (approved)
    const bookingReceiptDate = new Date(saleDate.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000);
    const bookingMethod = randomChoice(['Cash', 'Bank Transfer', 'Cheque']);
    const bookingReceipt: any = {
      receiptNumber: `RCP-2024-${String(receiptCounter++).padStart(5, '0')}`,
      clientId: client._id,
      saleId: sale._id,
      stageId: sale.stages[0]._id,
      receiptType: 'Booking',
      amount: bookingAmount,
      method: bookingMethod,
      receiptDate: bookingReceiptDate,
      approvalStatus: 'Approved',
      postedToLedger: true,
      ledgerPostingDate: bookingReceiptDate,
      approvalHistory: [
        { approvedBy: users[1]._id, approvalLevel: 'Accounts Manager', approvedAt: bookingReceiptDate, action: 'Approved' },
        { approvedBy: users[2]._id, approvalLevel: 'HOF', approvedAt: bookingReceiptDate, action: 'Approved' },
      ],
      createdBy: users[1]._id,
      isActive: true,
    };

    // Add instrument details if payment is by cheque
    if (bookingMethod === 'Cheque') {
      bookingReceipt.instrumentDetails = {
        bankName: randomChoice(['DBBL', 'BRAC Bank', 'City Bank', 'Islami Bank']),
        chequeNumber: `CHQ-${randomInt(100000, 999999)}`,
        chequeDate: bookingReceiptDate,
      };
    }

    receipts.push(bookingReceipt);
    sale.paidAmount += bookingAmount;
    sale.stages[0].receivedAmount = bookingAmount;
    sale.stages[0].dueAmount = 0;
    sale.stages[0].status = 'Completed';

    // Create installment schedule (12 months)
    for (let month = 0; month < 12; month++) {
      const dueDate = new Date(saleDate);
      dueDate.setMonth(dueDate.getMonth() + month + 1);

      const isPaid = dueDate < new Date() && Math.random() > 0.2; // 80% paid if due

      const installment = {
        saleId: sale._id,
        clientId: client._id,
        installmentNumber: month + 1,
        dueDate,
        amount: monthlyInstallment,
        status: isPaid ? 'Paid' : (dueDate < new Date() ? 'Overdue' : 'Pending'),
        paidDate: isPaid ? new Date(dueDate.getTime() + randomInt(0, 5) * 24 * 60 * 60 * 1000) : undefined,
        paidAmount: isPaid ? monthlyInstallment : 0,
      };

      installments.push(installment);

      // Create receipt for paid installments
      if (isPaid) {
        const paymentMethod = randomChoice(['Cash', 'Bank Transfer', 'Cheque', 'PDC']);
        const receiptDate = installment.paidDate!;

        const installmentReceipt: any = {
          receiptNumber: `RCP-2024-${String(receiptCounter++).padStart(5, '0')}`,
          clientId: client._id,
          saleId: sale._id,
          stageId: sale.stages[1]._id,
          installmentId: new mongoose.Types.ObjectId(),
          receiptType: 'Installment',
          amount: monthlyInstallment,
          method: paymentMethod,
          receiptDate,
          approvalStatus: 'Approved',
          postedToLedger: true,
          ledgerPostingDate: receiptDate,
          approvalHistory: [
            { approvedBy: users[1]._id, approvalLevel: 'Accounts Manager', approvedAt: receiptDate, action: 'Approved' },
            { approvedBy: users[2]._id, approvalLevel: 'HOF', approvedAt: receiptDate, action: 'Approved' },
          ],
          createdBy: users[1]._id,
          isActive: true,
        };

        // Add instrument details for Cheque and PDC payments
        if (paymentMethod === 'Cheque' || paymentMethod === 'PDC') {
          const chequeNum = `CHQ-${randomInt(100000, 999999)}`;
          const bankName = randomChoice(['DBBL', 'BRAC Bank', 'City Bank', 'Islami Bank']);

          installmentReceipt.instrumentDetails = {
            bankName: bankName,
            chequeNumber: chequeNum,
            chequeDate: receiptDate,
          };

          // If PDC, also create cheque record
          if (paymentMethod === 'PDC') {
            const cheque = {
              chequeNumber: chequeNum,
              bankName: bankName,
              branchName: randomChoice(['Gulshan', 'Dhanmondi', 'Motijheel']),
              chequeType: 'PDC',
              issueDate: new Date(dueDate.getTime() - 30 * 24 * 60 * 60 * 1000),
              dueDate,
              amount: monthlyInstallment,
              clientId: client._id,
              saleId: sale._id,
              receiptId: new mongoose.Types.ObjectId(),
              status: 'Cleared',
              clearedDate: receiptDate,
              clearedBy: users[1]._id,
              createdBy: users[1]._id,
              isActive: true,
            };
            cheques.push(cheque);
          }
        }

        receipts.push(installmentReceipt);
        sale.paidAmount += monthlyInstallment;
        sale.stages[1].receivedAmount += monthlyInstallment;
        sale.stages[1].dueAmount = Math.max(0, sale.stages[1].dueAmount - monthlyInstallment);
      }
    }

    // If most installments paid, add registration and handover
    if (sale.stages[1].receivedAmount / installmentAmount > 0.8) {
      // Registration receipt
      const regDate = new Date();
      regDate.setMonth(regDate.getMonth() - randomInt(1, 3));

      const regMethod = randomChoice(['Bank Transfer', 'Cheque']);
      const regReceipt: any = {
        receiptNumber: `RCP-2024-${String(receiptCounter++).padStart(5, '0')}`,
        clientId: client._id,
        saleId: sale._id,
        stageId: sale.stages[2]._id,
        receiptType: 'Registration',
        amount: registrationAmount,
        method: regMethod,
        receiptDate: regDate,
        approvalStatus: 'Approved',
        postedToLedger: true,
        ledgerPostingDate: regDate,
        approvalHistory: [
          { approvedBy: users[1]._id, approvalLevel: 'Accounts Manager', approvedAt: regDate, action: 'Approved' },
          { approvedBy: users[2]._id, approvalLevel: 'HOF', approvedAt: regDate, action: 'Approved' },
        ],
        createdBy: users[1]._id,
        isActive: true,
      };

      // Add instrument details if payment is by cheque
      if (regMethod === 'Cheque') {
        regReceipt.instrumentDetails = {
          bankName: randomChoice(['DBBL', 'BRAC Bank', 'City Bank', 'Islami Bank']),
          chequeNumber: `CHQ-${randomInt(100000, 999999)}`,
          chequeDate: regDate,
        };
      }

      receipts.push(regReceipt);
      sale.paidAmount += registrationAmount;
      sale.stages[2].receivedAmount = registrationAmount;
      sale.stages[2].dueAmount = 0;
      sale.stages[2].status = 'Completed';

      // Handover receipt (if registration done)
      if (Math.random() > 0.3) {
        const handoverDate = new Date(regDate.getTime() + randomInt(30, 60) * 24 * 60 * 60 * 1000);

        const handoverReceipt = {
          receiptNumber: `RCP-2024-${String(receiptCounter++).padStart(5, '0')}`,
          clientId: client._id,
          saleId: sale._id,
          stageId: sale.stages[3]._id,
          receiptType: 'Handover',
          amount: handoverAmount,
          method: randomChoice(['Cash', 'Bank Transfer']),
          receiptDate: handoverDate,
          approvalStatus: 'Approved',
          postedToLedger: true,
          ledgerPostingDate: handoverDate,
          approvalHistory: [
            { approvedBy: users[1]._id, approvalLevel: 'Accounts Manager', approvedAt: handoverDate, action: 'Approved' },
            { approvedBy: users[2]._id, approvalLevel: 'HOF', approvedAt: handoverDate, action: 'Approved' },
          ],
          createdBy: users[1]._id,
          isActive: true,
        };

        receipts.push(handoverReceipt);
        sale.paidAmount += handoverAmount;
        sale.stages[3].receivedAmount = handoverAmount;
        sale.stages[3].dueAmount = 0;
        sale.stages[3].status = 'Completed';
        sale.status = 'Completed';
      }
    }
  }

  // Insert all data
  const createdSales = await Sale.insertMany(sales);
  const createdReceipts = await Receipt.insertMany(receipts);
  const createdInstallments = await InstallmentSchedule.insertMany(installments);
  const createdCheques = cheques.length > 0 ? await Cheque.insertMany(cheques) : [];

  // Update plots
  await Promise.all(plots.map((plot: any) => Plot.findByIdAndUpdate(plot._id, plot)));

  console.log(`✅ Created ${createdSales.length} sales`);
  console.log(`✅ Created ${createdReceipts.length} receipts`);
  console.log(`✅ Created ${createdInstallments.length} installment schedules`);
  console.log(`✅ Created ${createdCheques.length} cheques`);

  return { sales: createdSales, receipts: createdReceipts, installments: createdInstallments, cheques: createdCheques };
}

async function seedExpenses(categories: any[], _employees: any[], users: any[]) {
  console.log('💸 Seeding expenses...');

  const expenses = [];
  let expenseCounter = 1;

  // Create monthly expenses for 12 months
  for (let month = 0; month < 12; month++) {
    const monthDate = new Date('2024-01-01');
    monthDate.setMonth(month);

    // Utilities (monthly)
    expenses.push({
      expenseNumber: `EXP-2024-${String(expenseCounter++).padStart(5, '0')}`,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), randomInt(1, 5)),
      categoryId: categories.find((c: any) => c.name === 'Utility')?._id,
      amount: randomInt(50000, 100000),
      vendor: 'DESCO / WASA',
      description: 'Office electricity and water bills',
      paymentMethod: 'Bank Transfer',
      approvalStatus: 'Approved',
      approvedBy: users[2]._id,
      createdBy: users[1]._id,
      isActive: true,
    });

    // Stationery
    if (randomInt(1, 3) === 1) {
      expenses.push({
        expenseNumber: `EXP-2024-${String(expenseCounter++).padStart(5, '0')}`,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), randomInt(10, 15)),
        categoryId: categories.find((c: any) => c.name === 'Stationery')?._id,
        amount: randomInt(15000, 40000),
        vendor: 'Stationery Store',
        description: 'Office supplies and materials',
        paymentMethod: 'Cash',
        approvalStatus: 'Approved',
        approvedBy: users[1]._id,
        createdBy: users[1]._id,
        isActive: true,
      });
    }

    // Marketing
    expenses.push({
      expenseNumber: `EXP-2024-${String(expenseCounter++).padStart(5, '0')}`,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), randomInt(15, 20)),
      categoryId: categories.find((c: any) => c.name === 'Marketing')?._id,
      amount: randomInt(100000, 300000),
      vendor: 'Various Media',
      description: 'Social media ads, banners, and promotions',
      paymentMethod: 'Bank Transfer',
      approvalStatus: 'Approved',
      approvedBy: users[2]._id,
      createdBy: users[1]._id,
      isActive: true,
    });

    // Fuel
    expenses.push({
      expenseNumber: `EXP-2024-${String(expenseCounter++).padStart(5, '0')}`,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), randomInt(20, 25)),
      categoryId: categories.find((c: any) => c.name === 'Fuel')?._id,
      amount: randomInt(30000, 80000),
      vendor: 'Fuel Stations',
      description: 'Vehicle fuel for site visits and client meetings',
      paymentMethod: 'Cash',
      approvalStatus: 'Approved',
      approvedBy: users[1]._id,
      createdBy: users[1]._id,
      isActive: true,
    });

    // Client Entertainment
    if (randomInt(1, 2) === 1) {
      expenses.push({
        expenseNumber: `EXP-2024-${String(expenseCounter++).padStart(5, '0')}`,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), randomInt(10, 28)),
        categoryId: categories.find((c: any) => c.name === 'Client Entertainment')?._id,
        amount: randomInt(20000, 70000),
        vendor: 'Restaurants',
        description: 'Client meetings and entertainment',
        paymentMethod: 'Cash',
        approvalStatus: 'Approved',
        approvedBy: users[1]._id,
        createdBy: users[1]._id,
        isActive: true,
      });
    }
  }

  // Large expenses (land purchase, legal)
  expenses.push({
    expenseNumber: `EXP-2024-${String(expenseCounter++).padStart(5, '0')}`,
    date: new Date('2024-03-15'),
    categoryId: categories.find((c: any) => c.name === 'Land Purchase')?._id,
    amount: 15000000,
    vendor: 'Land Seller',
    description: 'Purchase of 20 Katha land for Phase 3',
    paymentMethod: 'Bank Transfer',
    approvalStatus: 'Approved',
    approvedBy: users[2]._id,
    createdBy: users[0]._id,
    isActive: true,
  });

  expenses.push({
    expenseNumber: `EXP-2024-${String(expenseCounter++).padStart(5, '0')}`,
    date: new Date('2024-06-20'),
    categoryId: categories.find((c: any) => c.name === 'Legal')?._id,
    amount: 500000,
    vendor: 'Law Firm',
    description: 'Land registration and legal fees',
    paymentMethod: 'Bank Transfer',
    approvalStatus: 'Approved',
    approvedBy: users[2]._id,
    createdBy: users[1]._id,
    isActive: true,
  });

  const createdExpenses = await Expense.insertMany(expenses);
  console.log(`✅ Created ${createdExpenses.length} expenses`);
  return createdExpenses;
}

async function seedEmployeeCosts(employees: any[], users: any[]) {
  console.log('💼 Seeding employee costs (12 months)...');

  const adminUser = users[0]; // Use admin user as creator
  const costs = [];

  // Salaries for each designation
  const salaries: Record<string, number> = {
    'Sales Manager': 80000,
    'Sales Executive': 50000,
    'Accountant': 60000,
    'Marketing Officer': 55000,
  };

  for (const employee of employees) {
    const baseSalary = salaries[employee.designation] || 50000;

    for (let month = 1; month <= 12; month++) {
      const commission = employee.designation.includes('Sales') ? randomInt(10000, 50000) : 0;
      const bonus = month === 12 ? baseSalary * 2 : 0; // Year-end bonus
      const fuel = randomInt(5000, 15000);
      const entertainment = randomInt(3000, 10000);
      const overtime = randomInt(0, 10000);
      const otherAllowances = randomInt(5000, 15000);

      const grossPay = baseSalary + commission + bonus + fuel + entertainment + overtime + otherAllowances;
      const deductions = grossPay * 0.05; // 5% deductions
      const netPay = grossPay - deductions;

      costs.push({
        employeeId: employee._id,
        month,
        year: 2024,
        salary: baseSalary,
        commission,
        fuel,
        entertainment,
        bonus,
        overtime,
        otherAllowances,
        advances: 0,
        deductions,
        grossPay,
        netPay,
        createdBy: adminUser._id,
      });
    }
  }

  const createdCosts = await EmployeeCost.insertMany(costs);
  console.log(`✅ Created ${createdCosts.length} employee cost records`);
  return createdCosts;
}

async function seedCancellationsAndRefunds(sales: any[], _clients: any[], users: any[]) {
  console.log('❌ Seeding cancellations and refunds...');

  const cancellations = [];
  const refunds = [];
  let refundCounter = 1;

  // Get eligible sales and shuffle them to avoid duplicates
  const eligibleSales = sales.filter((s: any) => s.status === 'Active' && s.paidAmount > 0);
  const shuffledSales = eligibleSales.sort(() => Math.random() - 0.5);
  const salesToCancel = shuffledSales.slice(0, Math.min(5, shuffledSales.length));

  // Cancel selected sales
  for (const sale of salesToCancel) {

    const cancellationDate = randomDate(new Date('2024-06-01'), new Date('2024-11-30'));
    const officeChargePercent = 10;
    const officeChargeAmount = sale.paidAmount * (officeChargePercent / 100);
    const otherDeductions = randomInt(10000, 50000);
    const refundableAmount = sale.paidAmount - officeChargeAmount - otherDeductions;

    const cancellation = {
      _id: new mongoose.Types.ObjectId(),
      saleId: sale._id,
      cancellationDate,
      reason: randomChoice(['Client request', 'Financial issues', 'Found alternative property', 'Personal reasons']),
      totalPaid: sale.paidAmount,
      officeChargePercent,
      officeChargeAmount,
      otherDeductions,
      refundableAmount,
      refundedAmount: 0,
      remainingRefund: refundableAmount,
      status: 'Pending',
      approvedBy: users[2]._id,
      approvedAt: cancellationDate,
      createdBy: users[1]._id,
      isActive: true,
    };

    cancellations.push(cancellation);

    // Create refund schedule (6 months)
    const monthlyRefund = refundableAmount / 6;
    for (let month = 0; month < 6; month++) {
      const dueDate = new Date(cancellationDate);
      dueDate.setMonth(dueDate.getMonth() + month + 1);

      const isPaid = month < 3; // First 3 paid

      refunds.push({
        refundNumber: `RFD-2024-${String(refundCounter++).padStart(5, '0')}`,
        cancellationId: cancellation._id,
        saleId: sale._id,
        clientId: sale.clientId,
        installmentNumber: month + 1,
        dueDate,
        amount: monthlyRefund,
        status: isPaid ? 'Paid' : 'Pending',
        paidDate: isPaid ? dueDate : undefined,
        paidAmount: isPaid ? monthlyRefund : 0,
        paymentMethod: isPaid ? randomChoice(['Bank Transfer', 'Cash']) : undefined,
        approvalStatus: isPaid ? 'Approved' : 'Draft',
        approvedBy: isPaid ? users[2]._id : undefined,
        createdBy: users[1]._id,
        isActive: true,
      });
    }
  }

  const createdCancellations = cancellations.length > 0 ? await Cancellation.insertMany(cancellations) : [];
  const createdRefunds = refunds.length > 0 ? await Refund.insertMany(refunds) : [];

  console.log(`✅ Created ${createdCancellations.length} cancellations`);
  console.log(`✅ Created ${createdRefunds.length} refund installments`);

  return { cancellations: createdCancellations, refunds: createdRefunds };
}

async function seedSMSTemplates() {
  console.log('📱 Seeding SMS templates...');

  const templates = [
    {
      templateCode: 'PAYMENT_CONFIRM',
      name: 'Payment Confirmation',
      messageBN: 'প্রিয় {name}, আপনার {amount} টাকা পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে। রসিদ নং: {receiptNumber}। তারিখ: {date}। ধন্যবাদ - আরশীনগর',
      messageEN: 'Dear {name}, your payment of {amount} has been received successfully. Receipt No: {receiptNumber}. Date: {date}. Thank you - Arshinagar',
      variables: ['name', 'amount', 'receiptNumber', 'date'],
      category: 'payment_confirmation',
      isActive: true,
    },
    {
      templateCode: 'INSTALLMENT_REMINDER',
      name: 'Installment Reminder',
      messageBN: 'প্রিয় {name}, আপনার {amount} টাকা কিস্তি {dueDate} তারিখে দেয় হবে। প্লট: {plot}। সময়মতো পরিশোধ করুন। ধন্যবাদ - আরশীনগর',
      messageEN: 'Dear {name}, your installment of {amount} is due on {dueDate}. Plot: {plot}. Please pay on time. Thank you - Arshinagar',
      variables: ['name', 'amount', 'dueDate', 'plot'],
      category: 'installment_reminder',
      isActive: true,
    },
    {
      templateCode: 'MISSED_INSTALLMENT',
      name: 'Missed Installment Alert',
      messageBN: 'প্রিয় {name}, আপনার {amount} টাকা কিস্তি {dueDate} তারিখে দেয় ছিল ({monthsDue} মাস)। অনুগ্রহ করে শীঘ্রই পরিশোধ করুন। - আরশীনগর',
      messageEN: 'Dear {name}, your installment of {amount} was due on {dueDate} ({monthsDue} months overdue). Please make payment soon. - Arshinagar',
      variables: ['name', 'amount', 'dueDate', 'monthsDue'],
      category: 'missed_installment',
      isActive: true,
    },
    {
      templateCode: 'CHEQUE_DUE',
      name: 'Cheque Due Reminder',
      messageBN: 'প্রিয় {name}, আপনার {amount} টাকার চেক (নং: {chequeNumber}) আজ {dueDate} তারিখে দেয় হবে। অনুগ্রহ করে নিশ্চিত করুন। ধন্যবাদ - আরশীনগর',
      messageEN: 'Dear {name}, your cheque of {amount} (No: {chequeNumber}) is due today {dueDate}. Please ensure it clears. Thank you - Arshinagar',
      variables: ['name', 'amount', 'chequeNumber', 'dueDate'],
      category: 'cheque_due',
      isActive: true,
    },
  ];

  const createdTemplates = await SMSTemplate.insertMany(templates);
  console.log(`✅ Created ${createdTemplates.length} SMS templates`);
  return createdTemplates;
}

async function seedSystemSettings() {
  console.log('⚙️  Seeding system settings...');

  const settings = [
    { key: 'DEFAULT_OFFICE_CHARGE_PERCENT', value: 10, type: 'number', category: 'finance', description: 'Default office charge percentage for cancellations', isEditable: true, isActive: true },
    { key: 'INSTALLMENT_REMINDER_DAYS', value: 3, type: 'number', category: 'sms', description: 'Days before installment due date to send reminder', isEditable: true, isActive: true },
    { key: 'COMPANY_NAME', value: 'Arshinagar Real Estate', type: 'string', category: 'general', description: 'Company name', isEditable: true, isActive: true },
    { key: 'CURRENCY', value: 'BDT', type: 'string', category: 'general', description: 'Default currency', isEditable: false, isActive: true },
    { key: 'TIMEZONE', value: 'Asia/Dhaka', type: 'string', category: 'general', description: 'System timezone', isEditable: false, isActive: true },
    { key: 'SMS_ENABLED', value: true, type: 'boolean', category: 'sms', description: 'Enable SMS notifications', isEditable: true, isActive: true },
    { key: 'SMS_TIME_START', value: '09:00', type: 'string', category: 'sms', description: 'SMS sending start time', isEditable: true, isActive: true },
    { key: 'SMS_TIME_END', value: '20:00', type: 'string', category: 'sms', description: 'SMS sending end time', isEditable: true, isActive: true },
  ];

  const createdSettings = await SystemSetting.insertMany(settings);
  console.log(`✅ Created ${createdSettings.length} system settings`);
  return createdSettings;
}

async function main() {
  try {
    console.log('🌱 Starting comprehensive seed process...\n');

    await connectDB();
    await clearDatabase();

    console.log('\n📊 Seeding all data...\n');

    const users = await seedUsers();
    const categories = await seedExpenseCategories(users);
    const clients = await seedClients();
    const { rsNumbers, plots } = await seedLandInventory();
    const employees = await seedEmployees(users);
    const { bankAccounts, cashAccount: _cashAccount } = await seedBankAccounts(users);
    const { sales, receipts, installments, cheques } = await seedSalesAndReceipts(clients, plots, users, bankAccounts);
    const expenses = await seedExpenses(categories, employees, users);
    const employeeCosts = await seedEmployeeCosts(employees, users);
    const { cancellations, refunds } = await seedCancellationsAndRefunds(sales, clients, users);
    const smsTemplates = await seedSMSTemplates();
    const systemSettings = await seedSystemSettings();

    console.log('\n✅ SEED COMPLETE! Summary:\n');
    console.log(`👥 Users: ${users.length}`);
    console.log(`👤 Clients: ${clients.length}`);
    console.log(`🏞️  RS Numbers: ${rsNumbers.length}`);
    console.log(`📦 Plots: ${plots.length}`);
    console.log(`💼 Sales: ${sales.length}`);
    console.log(`🧾 Receipts: ${receipts.length}`);
    console.log(`📅 Installments: ${installments.length}`);
    console.log(`💰 Expense Categories: ${categories.length}`);
    console.log(`💸 Expenses: ${expenses.length}`);
    console.log(`👨‍💼 Employees: ${employees.length}`);
    console.log(`💼 Employee Costs: ${employeeCosts.length}`);
    console.log(`🏦 Bank Accounts: ${bankAccounts.length}`);
    console.log(`💵 Cash Account: 1`);
    console.log(`📝 Cheques: ${cheques.length}`);
    console.log(`❌ Cancellations: ${cancellations.length}`);
    console.log(`↩️  Refunds: ${refunds.length}`);
    console.log(`📱 SMS Templates: ${smsTemplates.length}`);
    console.log(`⚙️  System Settings: ${systemSettings.length}`);

    console.log('\n🎉 Database seeded with 1 year of comprehensive data!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@arshinagar.com / Admin@123');
    console.log('   Account Manager: manager@arshinagar.com /  Manager@123');
    console.log('   HOF: hof@arshinagar.com / Hof@1234');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
