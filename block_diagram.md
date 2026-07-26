flowchart TB
    %% ----------------------------------------------------
    %% STYLING DEFINITIONS
    %% ----------------------------------------------------
    classDef actorStyle fill:#2D3748,stroke:#4A5568,stroke-width:2px,color:#FFF;
    classDef feStyle fill:#1A365D,stroke:#2B6CB0,stroke-width:2px,color:#FFF;
    classDef authStyle fill:#4A154B,stroke:#6B116B,stroke-width:2px,color:#FFF;
    classDef engineStyle fill:#1C4532,stroke:#2F855A,stroke-width:2px,color:#FFF;
    classDef dbStyle fill:#744210,stroke:#B7791F,stroke-width:2px,color:#FFF;
    classDef externalStyle fill:#363636,stroke:#555555,stroke-width:2px,color:#FFF;
    classDef stateStyle fill:#2A4365,stroke:#3182CE,stroke-width:1px,color:#FFF;

    %% ----------------------------------------------------
    %% LAYER 1: ACTORS & USER PERSONAS
    %% ----------------------------------------------------
    subgraph L1 ["1. User Personas & Actors"]
        A_CSR["Service Advisor (CSR)\n• Customer Intake\n• Vehicle Check-In"]:::actorStyle
        A_TECH["Technician\n• Diagnosis & Job Notes\n• Spare Parts Requests"]:::actorStyle
        A_INV["Inventory Clerk\n• Parts Catalogue & Reorders\n• Stock Movement Approvals"]:::actorStyle
        A_FIN["Finance Clerk / Manager\n• Invoice Approval\n• Payment Recording (Kobo)"]:::actorStyle
        A_SALES["Sales Representative\n• CRM Lead Pipeline\n• Orders & Handover"]:::actorStyle
        A_ADMIN["Administrator\n• User RBAC & Rates Setup\n• Immutable Audit View"]:::actorStyle
    end

    %% ----------------------------------------------------
    %% LAYER 2: FRONTEND WEB APP (TanStack Start + React 19)
    %% ----------------------------------------------------
    subgraph L2 ["2. Frontend Web Application (TanStack Start + React 19 + Tailwind v4)"]
        UI_AUTH["Auth Router & Session Guard"]:::feStyle
        
        subgraph UI_MODS ["UI Modules"]
            UI_WORKSHOP["Workshop Module UI\n• Vehicle Intake & History\n• Job Board & Repair Status"]:::feStyle
            UI_PARTS["Parts & Inventory UI\n• Catalogue & Reorder Alerts\n• Parts Dispatch UI"]:::feStyle
            UI_FINANCE["Billing & Finance UI\n• Invoice Builder & Rates Config\n• Payment Gateway / Entry"]:::feStyle
            UI_SALES["Sales & CRM UI\n• CRM Lead Board\n• Orders & Delivery Handover"]:::feStyle
            UI_ADMIN["Admin & Settings UI\n• User Access & Settings\n• System Audit Trail Log"]:::feStyle
        end
    end

    %% ----------------------------------------------------
    %% LAYER 3: AUTHENTICATION & ACCESS CONTROL
    %% ----------------------------------------------------
    subgraph L3 ["3. Security & Access Control Layer"]
        AUTH_PROVIDER["Convex Auth Provider\n(Password Credentials)"]:::authStyle
        RBAC_GUARD["Role-Based Access Control (RBAC)\n(Middleware & Function Authorization)"]:::authStyle
    end

    %% ----------------------------------------------------
    %% LAYER 4: BACKEND SERVERLESS ENGINE (Convex Functions)
    %% ----------------------------------------------------
    subgraph L4 ["4. Backend Serverless API & Business Logic (Convex)"]
        
        subgraph STATE_ENG ["8-Stage Job Lifecycle State Machine"]
            S_CHECKED["Checked In"]:::stateStyle --> S_ASSIGNED["Assigned"]:::stateStyle
            S_ASSIGNED --> S_DIAG["Diagnosed"]:::stateStyle
            S_DIAG --> S_WAITING["Waiting Release\n(Parts Requested)"]:::stateStyle
            S_DIAG --> S_PROGRESS["In Progress"]:::stateStyle
            S_WAITING -->|Inventory Clerk Approves| S_PROGRESS
            S_PROGRESS --> S_READY["Ready for Pickup"]:::stateStyle
            S_READY --> S_DONE["Completed"]:::stateStyle
            S_DONE --> S_PAID["Paid"]:::stateStyle
        end

        ENG_PARTS["Parts & Stock Engine\n• Stock Dispatch Verification\n• Low-Stock Alert Monitor"]:::engineStyle
        ENG_FINANCE["Finance & Billing Engine\n• Labour Rates Lookup\n• 7.5% VAT Calculation\n• Locked Invoice Snapshots"]:::engineStyle
        ENG_SALES["Sales & CRM Engine\n• Lead Stage Workflow\n• Inventory Reservation\n• Handover Verification"]:::engineStyle
        ENG_AUDIT["Audit Log Engine\n• Immutable Action Tracker"]:::engineStyle
    end

    %% ----------------------------------------------------
    %% LAYER 5: DATABASE & STORAGE (Convex Reactive DB)
    %% ----------------------------------------------------
    subgraph L5 ["5. Persistence Layer (Convex Reactive DB)"]
        DB_USERS[("users\n• Credentials & User Roles")]:::dbStyle
        DB_CUST_VEH[("customers & vehicles\n• Directory & Vehicle Link\n• VIN, Plate, History")]:::dbStyle
        DB_JOBS[("jobs & partsRequests\n• Active Workshop Jobs\n• Parts Dispatch Queue")]:::dbStyle
        DB_PARTS[("parts & inventoryLogs\n• Catalogue (Cost/Sell)\n• Stock Audit Movements")]:::dbStyle
        DB_FINANCE[("invoices, payments, labourTypes\n• Configured Labour Rates\n• Locked Line Items & Kobo Balances")]:::dbStyle
        DB_SALES[("leads, salesOrders, deliveries\n• CRM Sales Pipeline\n• Handover Verification Checklists")]:::dbStyle
        DB_AUDIT[("auditLogs\n• Immutable Audit Trail Log")]:::dbStyle
    end

    %% ----------------------------------------------------
    %% LAYER 6: DATA UTILITIES & INTEGRATIONS
    %% ----------------------------------------------------
    subgraph L6 ["6. Utilities & Data Import"]
        EXCEL_IMPORT["Excel / CSV Importer\n(Bulk Load Parts Catalogue & Customers)"]:::externalStyle
    end

    %% ----------------------------------------------------
    %% END-TO-END DATA FLOW CONNECTIONS
    %% ----------------------------------------------------
    %% User Interactions
    A_CSR -->|Add Customer / Check-In| UI_WORKSHOP
    A_TECH -->|Log Diagnosis & Request Parts| UI_WORKSHOP
    A_INV -->|Manage Parts & Approve Dispatch| UI_PARTS
    A_FIN -->|Approve Invoices & Log Payment| UI_FINANCE
    A_SALES -->|Track Leads & Delivery| UI_SALES
    A_ADMIN -->|Configure Rates & Users| UI_ADMIN

    %% Data Import
    EXCEL_IMPORT -->|Bulk Seed Data| UI_PARTS

    %% UI to Auth Security
    L2 -->|Session Verification| AUTH_PROVIDER
    AUTH_PROVIDER --> RBAC_GUARD

    %% UI to Backend Calls
    UI_WORKSHOP -->|Queries & Mutations| RBAC_GUARD
    UI_PARTS -->|Queries & Mutations| RBAC_GUARD
    UI_FINANCE -->|Queries & Mutations| RBAC_GUARD
    UI_SALES -->|Queries & Mutations| RBAC_GUARD
    UI_ADMIN -->|Queries & Mutations| RBAC_GUARD

    %% Auth Guard to Serverless Logic
    RBAC_GUARD -->|Execute Repair Flow| STATE_ENG
    RBAC_GUARD -->|Execute Stock Logic| ENG_PARTS
    RBAC_GUARD -->|Execute Invoice Calculation| ENG_FINANCE
    RBAC_GUARD -->|Execute CRM Logic| ENG_SALES

    %% Backend Logic to Reactive DB Collections
    STATE_ENG <-->|Mutate Job Status| DB_JOBS
    STATE_ENG <-->|Query Vehicle History| DB_CUST_VEH
    STATE_ENG -->|Log Audit Event| ENG_AUDIT

    ENG_PARTS <-->|Update Quantity / Log Stock| DB_PARTS
    ENG_PARTS -->|Link Dispatched Parts| DB_JOBS
    ENG_PARTS -->|Log Audit Event| ENG_AUDIT

    ENG_FINANCE <-->|Generate Locked Invoices| DB_FINANCE
    ENG_FINANCE <-->|Fetch Job Parts & Labour| DB_JOBS
    ENG_FINANCE -->|Log Audit Event| ENG_AUDIT

    ENG_SALES <-->|Update Lead State & Vehicle| DB_SALES
    ENG_SALES <-->|Link Sold Vehicle to Customer| DB_CUST_VEH
    ENG_SALES -->|Log Audit Event| ENG_AUDIT

    ENG_AUDIT -->|Write Mutation Entry| DB_AUDIT
