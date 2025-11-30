#!/usr/bin/env node

const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

const mongoose = require('../src/config/db');
require('../src/models/User');

const UserModel = mongoose.model('User');

const args = process.argv.slice(2);
const getArg = (flag) => {
  const match = args.find((arg) => arg === flag || arg.startsWith(`${flag}=`));
  if (!match) return null;
  if (match.includes('=')) {
    return match.split('=').slice(1).join('=');
  }
  const nextIndex = args.indexOf(match) + 1;
  return args[nextIndex] && !args[nextIndex].startsWith('--') ? args[nextIndex] : null;
};

const emailInput = (getArg('--email') || process.env.ADMIN_EMAIL || 'admin@clearpath.com').trim();
const passwordInput = (getArg('--password') || process.env.ADMIN_PASSWORD || '').trim();
const nameInput = (getArg('--name') || process.env.ADMIN_NAME || 'Admin').trim();

if (!emailInput || !passwordInput) {
  console.error('Email and password are required. Pass --email and --password arguments or set ADMIN_EMAIL / ADMIN_PASSWORD');
  process.exit(1);
}

const normalizeEmail = (value) => value.toLowerCase();

(async () => {
  try {
    const email = normalizeEmail(emailInput);
    const passwordHash = await bcrypt.hash(passwordInput, 10);

    let user = await UserModel.findOne({ email });

    if (user) {
      user.name = nameInput || user.name;
      user.password_hash = passwordHash;
      user.role = 'admin';
      await user.save();
      console.log('Updated existing user to admin:', emailInput);
    } else {
      user = await UserModel.create({
        name: nameInput || 'Admin',
        email,
        password_hash: passwordHash,
        role: 'admin',
      });
      console.log('Created new admin user:', emailInput);
    }

    console.log('Admin account ready. You can now log in with the provided credentials.');
  } catch (err) {
    console.error('Failed to create or update admin user');
    console.error(err.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
})();
