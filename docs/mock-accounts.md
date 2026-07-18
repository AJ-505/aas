# Mock Accounts

All users share the password: `password123`

## Staff Accounts

| Name | Email | Role | Dashboard Access |
|------|-------|------|-----------------|
| Cedric Masters | cedric@cedricmastersautos.com | Admin | Everything |
| Amara Obi | amara@cedricmastersautos.com | CSR | Dashboard, Appointments, Customers, Jobs, Check-in |
| Tunde Bakare | tunde@cedricmastersautos.com | Technician | Dashboard, Jobs (assigned) |
| Kunle Davies | kunle@cedricmastersautos.com | Manager | Dashboard, Appointments, Customers, Jobs, Check-in, Parts, Finance, Sales, User Management |
| Yetunde Salami | yetunde@cedricmastersautos.com | Inventory Manager | Dashboard, Parts |
| Funmi Akinlade | funmi@cedricmastersautos.com | Finance | Dashboard, Finance |
| Emeka Okafor | emeka@cedricmastersautos.com | Sales Rep | Dashboard, Sales (Inventory, Leads, Orders) |

## Login URL

http://localhost:3000/auth/login

## Demo Data Summary

| Entity | Count |
|--------|-------|
| Parts | 45 (engine oil ₦18k, brake pads ₦18k, AC gas ₦25k, etc.) |
| Customers | 18 (Lagos addresses) |
| Vehicles | 19 (Toyota, Honda, Mercedes, Lexus, Hyundai) |
| Jobs | 7 (from checked-in to paid, including transmission service ₦179k) |
| Invoices | 3 (1 paid, 1 unpaid, 1 partial deposit) |
| Payments | 2 (1 bank transfer ₦179k, 1 POS deposit ₦40k) |
| Leads | 3 (qualified, new, contacted with detailed notes) |
| Sales Orders | 2 (Hyundai Sonata pending, Lexus ES350 completed) |
