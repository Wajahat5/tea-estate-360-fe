# Backend Analysis

## Overview
The backend is an Express.js application using MongoDB with Mongoose for data modeling. It provides RESTful APIs for managing companies, gardens, labourers, employees, requests, expenses, and tasks.

## Models
- **User**: Authentication and user details.
- **Company**: Company details, owner, and associated gardens.
- **Garden**: Garden details.
- **Labourer**: Labourer details, type, marital status, gender, address.
- **Employee**: Employee details, profession, phone.
- **Request**: Maintenance requests with status.
- **Expense**: Expenses related to gardens or requests.
- **Task**: Tasks for gardens.

## API Endpoints
- **Auth**: `/user/login`, `/user/create`, `/user/logout`
- **Company**: `/company/fetchall`
- **Garden**: `/garden/fetch/:gardenid` (List endpoint missing, frontend assumes empty list or uses fetch by ID)
- **Labourer**: `/labourer/fetch` (List), `/labourer/create`, `/labourer/update`
- **Employee**: `/employee/fetch` (List by garden), `/employee/create` (Missing in frontend service), `/employee/update` (Missing in frontend service)
- **Requests**: `/requests/fetch/:gardenid/:from/:to/:status`, `/requests/create`, `/requests/update`
- **Expenses**: `/expense/fetch/:gardenid/:from/:to/:status`, `/expense/create`, `/expense/update`
- **Tasks**: `/task/fetch/:gardenid/:from/:to`, `/task/create`, `/task/update`

## Discrepancies & TODOs
1. **Employees**: Frontend `httpApi.ts` lacks `create` and `update` methods for Employees, but backend has endpoints.
2. **Requests**: Frontend `httpApi.ts` lacks `create` and `update` methods.
3. **Expenses**: Frontend `httpApi.ts` lacks `create` and `update` methods.
4. **Tasks**: Frontend `httpApi.ts` lacks `create` and `update` methods.
5. **Dashboard**: Frontend calls `/dashboard/*` endpoints which are missing in the backend. These likely need to be implemented or aggregated from existing data.

## Plan
Implement the missing `create` and `update` methods in the frontend `httpApi.ts` and add the corresponding UI features (Create buttons, Edit icons, FormModal integration) for Employees, Requests, Expenses, and Tasks.
