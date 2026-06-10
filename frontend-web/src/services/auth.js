import { userProfile } from '../data/mockData';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

let currentUser = {
  ...userProfile,
  phone: '+2348012345678',
  status: 'trial_active',
  trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};

export const login = async (phone) => {
  await delay(800);
  if (!phone || phone.length < 10) {
    throw new Error('Please enter a valid Nigerian phone number');
  }
  return { success: true, message: 'OTP sent successfully via Termii SMS' };
};

export const verifyOtp = async (phone, otp) => {
  await delay(1000);
  if (otp !== '1234' && otp !== '123456') {
    throw new Error('Invalid OTP code. For testing, please use 1234.');
  }
  currentUser = {
    ...currentUser,
    phone
  };
  return { success: true, user: currentUser };
};

export const logout = async () => {
  await delay(300);
  return { success: true };
};

export const getCurrentUser = () => {
  return currentUser;
};
