export const calculateAmountPaid = (transactions) => {
    if (!transactions) return 0;
    return transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
};

export const calculateFinalDueDate = (loan) => {
    const startDate = new Date(loan.startDate);
    if (isNaN(startDate.getTime())) return null;
    
    const finalDate = new Date(startDate);
    
    switch (loan.loanType) {
        case 'Finance':
            if (!loan.durationInMonths) return null;
            finalDate.setMonth(startDate.getMonth() + loan.durationInMonths);
            return finalDate;
        case 'Tender':
            if (!loan.durationInDays) return null;
            finalDate.setDate(startDate.getDate() + loan.durationInDays);
            return finalDate;
        case 'InterestRate':
            if (!loan.durationValue || !loan.durationUnit) return null;
            switch (loan.durationUnit) {
                case 'Days':
                    finalDate.setDate(startDate.getDate() + loan.durationValue);
                    break;
                case 'Weeks':
                    finalDate.setDate(startDate.getDate() + loan.durationValue * 7);
                    break;
                case 'Months':
                    finalDate.setMonth(startDate.getMonth() + loan.durationValue);
                    break;
            }
            return finalDate;
        default:
            return null;
    }
};

const getInterestRateCalculationDetails = (loan) => {
    const transactions = loan.transactions ? [...loan.transactions].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()) : [];

    if (loan.loanAmount <= 0 && transactions.length === 0) {
        return { balance: 0, nextDueDate: null, status: 'Completed' };
    }

    let currentPrincipal = loan.loanAmount;
    const startDate = new Date(loan.startDate);
    const today = new Date();
    let hasOverdueInterest = false;

    // Start iterating from the beginning of the loan's first month
    let monthIterator = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    // Only calculate compounding for full months that have passed.
    const lastFullMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    while (monthIterator < lastFullMonthStart) {
        const interestForMonth = currentPrincipal * ((loan.interestRate || 0) / 100);

        const startOfMonth = new Date(monthIterator);
        const endOfMonth = new Date(monthIterator.getFullYear(), monthIterator.getMonth() + 1, 0, 23, 59, 59);

        const paidThisMonth = transactions
            .filter(tx => {
                const txDate = new Date(tx.payment_date);
                return txDate >= startOfMonth && txDate <= endOfMonth;
            })
            .reduce((sum, tx) => sum + tx.amount, 0);

        const unpaidInterest = interestForMonth - paidThisMonth;

        if (unpaidInterest > 0) {
            currentPrincipal += unpaidInterest; // Compound unpaid interest
            hasOverdueInterest = true;
        } else {
            currentPrincipal += unpaidInterest; // Reduce principal by excess payment
        }
        
        monthIterator.setMonth(monthIterator.getMonth() + 1);
    }
    
    // Subtract payments made in the current, not-yet-compounded month
    const paidThisCurrentMonth = transactions
        .filter(tx => {
            const txDate = new Date(tx.payment_date);
            return txDate >= lastFullMonthStart && txDate <= today;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

    currentPrincipal -= paidThisCurrentMonth;
    
    const balance = Math.max(0, currentPrincipal);

    if (balance < 0.01) {
        return { balance: 0, nextDueDate: null, status: 'Completed' };
    }
    
    let nextDueDate = new Date(today.getFullYear(), today.getMonth(), startDate.getDate());
    if (nextDueDate <= today) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    const status = hasOverdueInterest ? 'Overdue' : 'Active';
    
    return { balance, nextDueDate, status };
};


export const calculateTotalAmount = (loan) => {
    switch (loan.loanType) {
        case 'Finance': {
            const monthlyInterest = (loan.loanAmount || 0) * ((loan.interestRate || 0) / 100);
            const totalInterest = monthlyInterest * (loan.durationInMonths || 0);
            return (loan.loanAmount || 0) + totalInterest;
        }
        case 'Tender': {
            return loan.loanAmount;
        }
        case 'InterestRate': {
            // Total amount is dynamic. This represents the total liability (balance + paid).
            const { balance } = getInterestRateCalculationDetails(loan);
            const amountPaid = calculateAmountPaid(loan.transactions);
            return balance + amountPaid;
        }
        default:
            return 0;
    }
};

export const calculateBalance = (loan) => {
    if (loan.loanType === 'InterestRate') {
        return getInterestRateCalculationDetails(loan).balance;
    }
    const totalAmount = calculateTotalAmount(loan);
    const amountPaid = calculateAmountPaid(loan.transactions);
    return Math.max(0, totalAmount - amountPaid);
};

export const calculateLoanProfit = (loan) => {
    switch (loan.loanType) {
        case 'Finance': {
            const totalAmount = calculateTotalAmount(loan);
            return totalAmount - (loan.givenAmount || 0);
        }
        case 'Tender': {
            // Profit is the difference between what's repaid and what was given
            return loan.loanAmount - loan.givenAmount;
        }
        case 'InterestRate': {
            const totalLiability = calculateTotalAmount(loan);
            return Math.max(0, totalLiability - (loan.givenAmount || loan.loanAmount));
        }
        default:
          return 0;
    }
};

export const calculateNextDueDate = (loan) => {
    if (calculateBalance(loan) <= 0) return null;

    if (loan.loanType === 'InterestRate') {
        return getInterestRateCalculationDetails(loan).nextDueDate;
    }

    return calculateFinalDueDate(loan);
};

export const getLoanStatus = (loan) => {
    // Check for completion first, as it's the definitive final state.
    if (calculateBalance(loan) <= 0.01) {
        return 'Completed';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check against final due date for all types that might have one
    const finalDueDate = calculateFinalDueDate(loan);
    if (finalDueDate) {
        finalDueDate.setHours(0, 0, 0, 0);
        if (finalDueDate < today) {
            return 'Overdue';
        }
    }
    
    // For InterestRate, also check if there's missed interest payments.
    if (loan.loanType === 'InterestRate') {
        const { status: interestStatus } = getInterestRateCalculationDetails(loan);
        // If the main check above didn't find it overdue by final date, use the monthly interest status.
        if (interestStatus === 'Overdue') {
            return 'Overdue';
        }
    }

    // If not completed or overdue, it's active.
    return 'Active';
};