import SMSTemplate from '../models/SMSTemplate';
import { connectDB } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

const defaultTemplates = [
  {
    templateCode: 'PAYMENT_CONFIRM',
    name: 'Payment Confirmation',
    messageBN:
      'প্রিয় {name}, আপনার {amount} টাকা পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে। রসিদ নং: {receiptNumber}। তারিখ: {date}। ধন্যবাদ - আরশীনগর',
    messageEN:
      'Dear {name}, your payment of {amount} has been received successfully. Receipt No: {receiptNumber}. Date: {date}. Thank you - Arshinagar',
    variables: ['name', 'amount', 'receiptNumber', 'date'],
    category: 'payment_confirmation',
    isActive: true,
  },
  {
    templateCode: 'INSTALLMENT_REMINDER',
    name: 'Installment Reminder',
    messageBN:
      'প্রিয় {name}, আপনার {amount} টাকা কিস্তি {dueDate} তারিখে দেয় হবে। প্লট: {plot}। সময়মতো পরিশোধ করুন। ধন্যবাদ - আরশীনগর',
    messageEN:
      'Dear {name}, your installment of {amount} is due on {dueDate}. Plot: {plot}. Please pay on time. Thank you - Arshinagar',
    variables: ['name', 'amount', 'dueDate', 'plot'],
    category: 'installment_reminder',
    isActive: true,
  },
  {
    templateCode: 'MISSED_INSTALLMENT',
    name: 'Missed Installment Alert',
    messageBN:
      'প্রিয় {name}, আপনার {amount} টাকা কিস্তি {dueDate} তারিখে দেয় ছিল ({monthsDue} মাস)। অনুগ্রহ করে শীঘ্রই পরিশোধ করুন। - আরশীনগর',
    messageEN:
      'Dear {name}, your installment of {amount} was due on {dueDate} ({monthsDue} months overdue). Please make payment soon. - Arshinagar',
    variables: ['name', 'amount', 'dueDate', 'monthsDue'],
    category: 'missed_installment',
    isActive: true,
  },
  {
    templateCode: 'CHEQUE_DUE',
    name: 'Cheque Due Reminder',
    messageBN:
      'প্রিয় {name}, আপনার {amount} টাকার চেক (নং: {chequeNumber}) আজ {dueDate} তারিখে দেয় হবে। অনুগ্রহ করে নিশ্চিত করুন। ধন্যবাদ - আরশীনগর',
    messageEN:
      'Dear {name}, your cheque of {amount} (No: {chequeNumber}) is due today {dueDate}. Please ensure it clears. Thank you - Arshinagar',
    variables: ['name', 'amount', 'chequeNumber', 'dueDate'],
    category: 'cheque_due',
    isActive: true,
  },
];

async function seedSMSTemplates() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing templates (optional)
    // await SMSTemplate.deleteMany({});
    // console.log('Cleared existing SMS templates');

    // Insert default templates (only if they don't exist)
    for (const template of defaultTemplates) {
      const existing = await SMSTemplate.findOne({ templateCode: template.templateCode });
      if (!existing) {
        await SMSTemplate.create(template);
        console.log(`Created SMS template: ${template.templateCode}`);
      } else {
        console.log(`SMS template already exists: ${template.templateCode}`);
      }
    }

    console.log('SMS templates seeded successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding SMS templates:', error.message);
    process.exit(1);
  }
}

// Run seeder
seedSMSTemplates();
