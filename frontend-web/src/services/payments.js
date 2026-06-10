const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const initializePayment = async (email, amountNaira) => {
  await delay(1200);
  return {
    success: true,
    authorizationUrl: '#',
    reference: 'fit_' + Math.floor(Math.random() * 100000000),
    message: 'Payment channel initialized via Paystack gateway API structure.'
  };
};

export const verifyPayment = async (reference) => {
  await delay(800);
  return {
    success: true,
    status: 'success',
    amount: 1500000, // 15,000 Naira in kobo
    message: 'Subscription entitlement approved successfully via RevenueCat payload.'
  };
};
