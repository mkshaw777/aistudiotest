import { Advance, Collection, Expense, Return, TransportPayment, User } from '../types';
import { getExpenses, getAdvances, getReturns, getTransportPayments, getCollections, getAllUsers } from './data';
import { MAX_REPORT_DAYS, TRANSPORT_COMPANIES } from './constants';
import { toast } from 'sonner';
import { getDaysDifference, formatDateTime } from './utils';

// Helper to filter data by date range
function filterByDateRange<T extends { date: string }>(
  data: T[],
  startDate: string,
  endDate: string,
): T[] {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0); // Start of the day
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // End of the day

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
}

// Main function to download CSV
export async function downloadCSV(
  reportType:
    | 'expenses'
    | 'advances'
    | 'returns'
    | 'transport_payments'
    | 'collections'
    | 'users',
  startDate?: string,
  endDate?: string,
  companyFilter?: string,
) {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = getDaysDifference(start, end);
    if (diffDays > MAX_REPORT_DAYS) {
      toast.error(`Date range cannot exceed ${MAX_REPORT_DAYS} days for reports.`);
      return;
    }
  }

  let csvContent = '';
  let filename = '';

  try {
    switch (reportType) {
        case 'expenses':
        {
            const expenses: Expense[] = await getExpenses();
            const filteredExpenses = startDate && endDate ? filterByDateRange(expenses, startDate, endDate) : expenses;

            filename = `expenses_report_${new Date().toISOString().split('T')[0]}.csv`;
            csvContent += 'ID,Staff Name,Advance ID,Category,Sub Category,Fare,Parking,Oil,Breakfast,Others,Remarks,Total Amount,Status,Submission Date,Reviewed By,Reviewed At,Rejection Note\n';
            filteredExpenses.forEach((exp) => {
            csvContent += `${exp.id},"${exp.staffName}",${exp.advanceId},"${exp.category}","${exp.subCategory}",${exp.fare},${exp.parking},${exp.oil},${exp.breakfast},${exp.others},"${exp.remarks}",${exp.totalAmount},${exp.status},${formatDateTime(exp.date)},${exp.reviewedBy || ''},${formatDateTime(exp.reviewedAt)},"${exp.rejectionNote || ''}"\n`;
            });
        }
        break;

        case 'advances':
        {
            const advances: Advance[] = await getAdvances();
            const filteredAdvances = startDate && endDate ? filterByDateRange(advances, startDate, endDate) : advances;

            filename = `advances_report_${new Date().toISOString().split('T')[0]}.csv`;
            csvContent += 'ID,Staff Name,Amount,Purpose,Issue Date,Status,Issued By,Total Expenses,Total Returned,Balance To Settle,Settlement Date,Settled By\n';
            filteredAdvances.forEach((adv) => {
            csvContent += `${adv.id},"${adv.staffName}",${adv.amount},"${adv.purpose}",${formatDateTime(adv.date)},${adv.status},${adv.issuedBy},${adv.totalExpenses},${adv.totalReturned},${adv.balanceToSettle},${formatDateTime(adv.settlementDate)},${adv.settledBy || ''}\n`;
            });
        }
        break;

        case 'returns':
        {
            const returns: Return[] = await getReturns();
            const filteredReturns = startDate && endDate ? filterByDateRange(returns, startDate, endDate) : returns;

            filename = `returns_report_${new Date().toISOString().split('T')[0]}.csv`;
            csvContent += 'ID,Staff Name,Advance ID,Amount,Note,Return Date,Status,Approved By,Approved At\n';
            filteredReturns.forEach((ret) => {
            csvContent += `${ret.id},"${ret.staffName}",${ret.advanceId},${ret.amount},"${ret.note}",${formatDateTime(ret.date)},${ret.status},${ret.approvedBy || ''},${formatDateTime(ret.approvedAt)}\n`;
            });
        }
        break;

        case 'transport_payments':
        {
            const payments: TransportPayment[] = await getTransportPayments();
            let filteredPayments = startDate && endDate ? filterByDateRange(payments, startDate, endDate) : payments;

            if (companyFilter && companyFilter !== 'All') {
                filteredPayments = filteredPayments.filter(p => p.company === companyFilter);
                filename = `transport_payments_${companyFilter}_report_${new Date().toISOString().split('T')[0]}.csv`;
            } else {
                filename = `transport_payments_report_${new Date().toISOString().split('T')[0]}.csv`;
            }
            
            const companyData: { [key: string]: TransportPayment[] } = {};
            TRANSPORT_COMPANIES.forEach(comp => companyData[comp.name] = []);
            filteredPayments.forEach(p => {
                if (companyData[p.company]) {
                    companyData[p.company].push(p);
                }
            });

            let fullCsvContent = '';
            for (const companyName of Object.keys(companyData)) {
                if (companyData[companyName].length > 0) {
                    fullCsvContent += `\n\n--- ${companyName} Payments ---\n`;
                    fullCsvContent += 'ID,Staff Name,Company,Amount,Details,Payment Date\n';
                    companyData[companyName].forEach(pay => {
                        fullCsvContent += `${pay.id},"${pay.staffName}",${pay.company},${pay.amount},"${pay.details}",${formatDateTime(pay.date)}\n`;
                    });
                    const totalAmount = companyData[companyName].reduce((sum, p) => sum + p.amount, 0);
                    fullCsvContent += `Total for ${companyName}:,${totalAmount}\n`;
                }
            }
            csvContent = fullCsvContent;
        }
        break;

        case 'collections':
        {
            const collections: Collection[] = await getCollections();
            const filteredCollections = startDate && endDate ? filterByDateRange(collections, startDate, endDate) : collections;

            filename = `collections_report_${new Date().toISOString().split('T')[0]}.csv`;
            csvContent += 'ID,Staff Name,Amount,Source,Details,Collection Date\n';
            filteredCollections.forEach((col) => {
            csvContent += `${col.id},"${col.staffName}",${col.amount},"${col.source}","${col.details}",${formatDateTime(col.date)}\n`;
            });
        }
        break;
        
        case 'users':
        {
            const users: User[] = await getAllUsers();
            filename = `users_report_${new Date().toISOString().split('T')[0]}.csv`;
            csvContent += 'ID,Name,Email,Role,Created At,Created By\n';
            users.forEach((user) => {
                csvContent += `${user.id},"${user.name}",${user.email},${user.role},${formatDateTime(user.createdAt)},${user.createdBy}\n`;
            });
        }
        break;

        default:
        toast.error('Unknown report type.');
        return;
    }

    if (!csvContent || csvContent.trim().length === 0) { 
        toast.info('No data available for the selected criteria to generate a report.');
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report downloaded successfully!');
    } else {
        toast.error('Your browser does not support downloading files.');
    }
  } catch (e) {
    console.error("Report generation failed", e);
    toast.error("Failed to generate report from database.");
  }
}