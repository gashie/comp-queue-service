
module.exports = {
  prepareColumns: (payload) => {
    let columns = Object.keys(payload)
    let ids = '';
    for (let i = 0; i < columns.length; i++) {
      ids += i === 0 ? '$1' : `, $${i + 1}`;
    }
    return ids;
  },
  calculatePaymentDetails: (order, charge) => {
    // Calculate the total amount for all items in the order
    const totalAmount = order.items.reduce((total, item) => {
      const itemPrice = item.price * item.qty;
      return total + itemPrice;
    }, 0);

    // Calculate charges (as a percentage of the total items price)
    const charges = (charge / 100) * totalAmount;

    // Apply discount (if any)
    const discountedAmount = totalAmount - (order.discount || 0);

    // Calculate the total amount to be paid
    const totalToBePaid = discountedAmount;

    // Calculate the balance to be given to the customer
    let balance = order.cash_received - totalToBePaid;

    // If the payment method is 'credit' and cash_received is less than totalToBePaid, set balance to zero
    if (order.cash_received < totalToBePaid) {
      balance = 0;
    }

    // Initialize credit-related variables
    let totalAmountPaid = 0;
    let totalAmountDue = 0;
    let totalAmountRemaining = 0;

    // Determine the payment method
    const paymentMethod = order.payment_method === 'credit' ? 'Credit' : 'Cash';

    if (order.cash_received < totalToBePaid) {
      totalAmountPaid = order.cash_received;
      totalAmountDue = totalToBePaid;
      totalAmountRemaining = totalAmountDue - totalAmountPaid;
    }

    return {
      totalAmount,
      discount: order.discount || 0,
      charges,
      totalToBePaid,
      balance,
      paymentMethod,
      totalAmountPaid,
      totalAmountDue,
      totalAmountRemaining,
    };
  },
  calculateCreditPaymentDetails: (totalToBePaid, cash_received) => {
    // Calculate the total amount for all items in the order


    // Calculate the balance to be given to the customer
    let balance = cash_received - totalToBePaid;

    // If the payment method is 'credit' and cash_received is less than totalToBePaid, set balance to zero
    if (cash_received < totalToBePaid) {
      balance = 0;
    }

    // Initialize credit-related variables
    let totalAmountPaid = 0;
    let totalAmountDue = 0;
    let totalAmountRemaining = 0;


    if (cash_received < totalToBePaid) {
      totalAmountPaid = cash_received;
      totalAmountDue = totalToBePaid;
      totalAmountRemaining = totalAmountDue - totalAmountPaid;
    }

    return {
      totalToBePaid,
      balance,
      totalAmountPaid,
      totalAmountDue,
      totalAmountRemaining,
    };
  },
  /**
 * Extracts payroll_month and payroll_year from start and end dates.
 * Ensures that both dates are within the same month.
 * @param {string} startDate - Start date in 'YYYY-MM-DD' format.
 * @param {string} endDate - End date in 'YYYY-MM-DD' format.
 * @returns {Object} - Object containing payroll_month and payroll_year, or an error message.
 */
  extractPayrollMonthYear: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if start and end are in the same month and year
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return {
        payroll_month: start.getMonth() + 1, // +1 because JavaScript months are 0-indexed
        payroll_year: start.getFullYear(),
      };
    } else {
      // Handle the error case or return a specific result as per your requirement
      return { error: 'Start and end dates are not in the same month.' };
    }
  },
  generateSecondPrefix: () => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    return `${year}${month}${day}`;
  }




};