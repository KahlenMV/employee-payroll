import { PrismaClient, EmploymentType, EmployeeStatus, LeaveType, LeaveStatus, BonusType, BonusStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    // Paths to CSV files (relative to prisma directory)
    const employeesPath = path.resolve(__dirname, './data/employees.csv');
    const leaveRequestsPath = path.resolve(__dirname, './data/leave_requests.csv');
    const bonusesPath = path.resolve(__dirname, './data/bonuses.csv');

    // 1. Seed Employees
    console.log('Reading employees.csv...');
    const employeesCsv = fs.readFileSync(employeesPath, 'utf8');
    const employeesData = Papa.parse(employeesCsv, { header: true, skipEmptyLines: true }).data as any[];

    for (const row of employeesData) {
        // Clean status: "ON_LEAVE (10%)" -> "ON_LEAVE"
        let statusStr = row.status.split(' ')[0].toUpperCase();
        if (statusStr === 'TERMINATED') statusStr = 'TERMINATED';
        if (statusStr === 'ACTIVE') statusStr = 'ACTIVE';
        if (statusStr === 'ON_LEAVE') statusStr = 'ON_LEAVE';

        // Clean employment type
        const empType = row.employment_type as EmploymentType;

        await prisma.employee.upsert({
            where: { id: parseInt(row.id) },
            update: {},
            create: {
                id: parseInt(row.id),
                firstName: row.first_name,
                lastName: row.last_name,
                email: row.email,
                gender: row.gender,
                nationalId: row.national_id,
                phone: row.phone,
                address: row.address,
                emergencyContactName: row.emergency_contact_name,
                emergencyContactPhone: row.emergency_contact_phone,
                department: row.department,
                position: row.position,
                employmentType: empType,
                status: statusStr as EmployeeStatus,
                startDate: new Date(row.start_date),
                bankAccountNumber: row.bank_account_number,
                bankName: row.bank_name,
                baseSalary: parseFloat(row.base_salary),
                housingAllowance: parseFloat(row.housing_allowance),
                transportAllowance: parseFloat(row.transport_allowance),
                mealSubsidy: parseFloat(row.meal_subsidy),
                taxFilingStatus: row.tax_filing_status,
                taxExemptions: Math.floor(parseFloat(row.tax_exemptions)),
            },
        });
    }
    console.log(`Seeded ${employeesData.length} employees.`);

    // 2. Seed Leave Requests
    console.log('Reading leave_requests.csv...');
    const leaveCsv = fs.readFileSync(leaveRequestsPath, 'utf8');
    const leaveData = Papa.parse(leaveCsv, { header: true, skipEmptyLines: true }).data as any[];

    for (const row of leaveData) {
        await prisma.leaveRequest.upsert({
            where: { id: parseInt(row.id) },
            update: {},
            create: {
                id: parseInt(row.id),
                employeeId: parseInt(row.employee_id),
                leaveType: row.leave_type as LeaveType,
                startDate: new Date(row.start_date),
                endDate: new Date(row.end_date),
                reason: row.reason,
                status: row.status.trim() as LeaveStatus,
            },
        });
    }
    console.log(`Seeded ${leaveData.length} leave requests.`);

    // 3. Seed Bonuses
    console.log('Reading bonuses.csv...');
    const bonusesCsv = fs.readFileSync(bonusesPath, 'utf8');
    const bonusesData = Papa.parse(bonusesCsv, { header: true, skipEmptyLines: true }).data as any[];

    for (const row of bonusesData) {
        await prisma.bonus.upsert({
            where: { id: parseInt(row.id) },
            update: {},
            create: {
                id: parseInt(row.id),
                employeeId: parseInt(row.employee_id),
                amount: parseFloat(row.amount),
                bonusType: row.bonus_type as BonusType,
                effectiveDate: new Date(row.effective_date),
                status: row.status.trim() as BonusStatus,
                notes: row.notes,
            },
        });
    }
    console.log(`Seeded ${bonusesData.length} bonuses.`);

    // 4. Seed Tax Brackets (Standard values for demo)
    console.log('Seeding standard tax brackets...');
    const taxBrackets = [
        { filingStatus: 'SINGLE', minAmount: 0, maxAmount: 11600, rate: 0.10 },
        { filingStatus: 'SINGLE', minAmount: 11600, maxAmount: 47150, rate: 0.12 },
        { filingStatus: 'SINGLE', minAmount: 47150, maxAmount: 100525, rate: 0.22 },
        { filingStatus: 'SINGLE', minAmount: 100525, maxAmount: 191950, rate: 0.24 },
        { filingStatus: 'MARRIED_FILING_JOINTLY', minAmount: 0, maxAmount: 23200, rate: 0.10 },
        { filingStatus: 'MARRIED_FILING_JOINTLY', minAmount: 23200, maxAmount: 94300, rate: 0.12 },
        { filingStatus: 'HEAD_OF_HOUSEHOLD', minAmount: 0, maxAmount: 16550, rate: 0.10 },
        { filingStatus: 'HEAD_OF_HOUSEHOLD', minAmount: 16550, maxAmount: 63100, rate: 0.12 },
    ];

    for (const bracket of taxBrackets) {
        await prisma.taxBracket.create({
            data: bracket,
        });
    }

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
