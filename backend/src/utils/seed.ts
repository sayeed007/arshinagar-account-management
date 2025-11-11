import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { UserRole } from '../types';
import { logger } from './logger';

// Load environment variables
dotenv.config();

/**
 * Database Seed Script
 * Creates initial admin user and system defaults
 */
async function seed() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/arshinagar-accounts';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for seeding');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: UserRole.ADMIN });

    if (existingAdmin) {
      logger.info('Admin user already exists. Skipping seed.');
      logger.info(`Existing admin: ${existingAdmin.email}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create default admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@arshinagar.com',
      password: 'Admin@123', // IMPORTANT: Change this in production!
      role: UserRole.ADMIN,
      isActive: true,
    });

    logger.info('✓ Admin user created successfully');
    logger.info(`  Email: ${adminUser.email}`);
    logger.info(`  Password: Admin@123 (CHANGE THIS IN PRODUCTION!)`);
    logger.info(`  Role: ${adminUser.role}`);

    // Create sample Account Manager user
    const accountManager = await User.create({
      username: 'accountmanager',
      email: 'manager@arshinagar.com',
      password: 'Manager@123', // IMPORTANT: Change this in production!
      role: UserRole.ACCOUNT_MANAGER,
      isActive: true,
    });

    logger.info('✓ Account Manager user created successfully');
    logger.info(`  Email: ${accountManager.email}`);
    logger.info(`  Password: Manager@123 (CHANGE THIS IN PRODUCTION!)`);
    logger.info(`  Role: ${accountManager.role}`);

    // Create sample HOF user
    const hofUser = await User.create({
      username: 'hof',
      email: 'hof@arshinagar.com',
      password: 'Hof@123', // IMPORTANT: Change this in production!
      role: UserRole.HOF,
      isActive: true,
    });

    logger.info('✓ Head of Finance user created successfully');
    logger.info(`  Email: ${hofUser.email}`);
    logger.info(`  Password: Hof@123 (CHANGE THIS IN PRODUCTION!)`);
    logger.info(`  Role: ${hofUser.role}`);

    logger.info('\n===========================================');
    logger.info('Seed completed successfully!');
    logger.info('===========================================');
    logger.info('\nIMPORTANT: Change all default passwords in production!');
    logger.info('\nDefault Users:');
    logger.info('1. Admin:');
    logger.info('   Email: admin@arshinagar.com');
    logger.info('   Password: Admin@123');
    logger.info('\n2. Account Manager:');
    logger.info('   Email: manager@arshinagar.com');
    logger.info('   Password: Manager@123');
    logger.info('\n3. Head of Finance:');
    logger.info('   Email: hof@arshinagar.com');
    logger.info('   Password: Hof@123');
    logger.info('===========================================\n');

    // Close connection
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run seed
seed();
