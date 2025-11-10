-- Initial Database Schema for Komunidad
-- Version: 0.1.0
-- Description: Complete database schema for consorcio management platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'owner', 'tenant', 'provider');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive', 'blocked');
CREATE TYPE building_type AS ENUM ('residential', 'commercial', 'mixed');
CREATE TYPE unit_type AS ENUM ('apartment', 'garage', 'storage', 'commercial');
CREATE TYPE expense_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'partial');
CREATE TYPE work_order_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE communication_type AS ENUM ('announcement', 'voting', 'message', 'alert');
CREATE TYPE notification_type AS ENUM ('email', 'push', 'sms');

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(10) UNIQUE,
    cuit_cuil VARCHAR(13) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'pending',

    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    phone_secondary VARCHAR(20),

    -- Address
    address VARCHAR(300),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),

    -- Notification Preferences
    notification_preferences JSONB DEFAULT '{
        "email": true,
        "push": true,
        "sms": false,
        "digest_frequency": "daily"
    }'::jsonb,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,

    CONSTRAINT check_dni_or_cuit CHECK (dni IS NOT NULL OR cuit_cuil IS NOT NULL)
);

CREATE INDEX idx_users_dni ON users(dni);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- =====================================================
-- BUILDINGS (CONSORCIOS) TABLE
-- =====================================================
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    cuit VARCHAR(13),
    name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(300),

    -- Address
    address VARCHAR(300) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),

    -- Building Info
    total_units INTEGER NOT NULL,
    building_type building_type NOT NULL,
    floors INTEGER,
    year_built INTEGER,

    -- Management
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Configuration
    config JSONB DEFAULT '{
        "amenities_enabled": true,
        "voting_enabled": true,
        "auto_expense_generation": false,
        "payment_methods": ["bank_transfer", "cash"],
        "expense_due_day": 10,
        "late_fee_percentage": 2
    }'::jsonb,

    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buildings_admin ON buildings(admin_id);
CREATE INDEX idx_buildings_active ON buildings(is_active);

-- =====================================================
-- UNITS (UNIDADES FUNCIONALES) TABLE
-- =====================================================
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,

    -- Unit Info
    unit_number VARCHAR(10) NOT NULL,
    floor INTEGER,
    unit_type unit_type NOT NULL,

    -- Size
    square_meters DECIMAL(8,2),

    -- Ownership
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    tenant_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Expense Calculation
    percentage DECIMAL(5,2) NOT NULL, -- Percentage for expense calculation

    -- Additional Info
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_unit_per_building UNIQUE (building_id, unit_number),
    CONSTRAINT check_percentage CHECK (percentage > 0 AND percentage <= 100)
);

CREATE INDEX idx_units_building ON units(building_id);
CREATE INDEX idx_units_owner ON units(owner_id);
CREATE INDEX idx_units_tenant ON units(tenant_id);

-- =====================================================
-- EXPENSES (EXPENSAS) TABLE
-- =====================================================
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,

    -- Period
    period DATE NOT NULL, -- First day of the month
    due_date DATE NOT NULL,

    -- Amounts
    total_amount DECIMAL(12,2) NOT NULL,

    -- Status
    status expense_status DEFAULT 'draft',

    -- Details (JSON with breakdown)
    details JSONB NOT NULL DEFAULT '{
        "ordinary": [],
        "extraordinary": [],
        "individual": {}
    }'::jsonb,

    -- Audit
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,

    CONSTRAINT unique_expense_per_period UNIQUE (building_id, period)
);

CREATE INDEX idx_expenses_building ON expenses(building_id);
CREATE INDEX idx_expenses_period ON expenses(period);
CREATE INDEX idx_expenses_status ON expenses(status);

-- =====================================================
-- UNIT EXPENSES (EXPENSAS POR UNIDAD) TABLE
-- =====================================================
CREATE TABLE unit_expenses (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,

    -- Amounts
    ordinary_amount DECIMAL(10,2) DEFAULT 0,
    extraordinary_amount DECIMAL(10,2) DEFAULT 0,
    individual_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,

    -- Payment
    payment_status payment_status DEFAULT 'pending',
    paid_amount DECIMAL(10,2) DEFAULT 0,
    payment_date TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_unit_expense UNIQUE (expense_id, unit_id)
);

CREATE INDEX idx_unit_expenses_expense ON unit_expenses(expense_id);
CREATE INDEX idx_unit_expenses_unit ON unit_expenses(unit_id);
CREATE INDEX idx_unit_expenses_payment_status ON unit_expenses(payment_status);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    unit_expense_id INTEGER NOT NULL REFERENCES unit_expenses(id) ON DELETE CASCADE,

    -- Payment Info
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- bank_transfer, cash, check, etc
    payment_date DATE NOT NULL,
    reference_number VARCHAR(100),

    -- Receipt
    receipt_number VARCHAR(50),
    receipt_url VARCHAR(500),

    -- Notes
    notes TEXT,

    -- Audit
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_unit_expense ON payments(unit_expense_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- =====================================================
-- COMMUNICATIONS TABLE
-- =====================================================
CREATE TABLE communications (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,

    -- Communication Info
    type communication_type NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,

    -- Targeting
    target_roles user_role[] DEFAULT ARRAY['owner', 'tenant']::user_role[],
    target_units INTEGER[], -- Specific units (NULL = all)

    -- Voting specific
    voting_options JSONB, -- For voting type
    voting_deadline TIMESTAMP,
    voting_results JSONB,

    -- Status
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,

    -- Priority
    is_important BOOLEAN DEFAULT false,
    is_urgent BOOLEAN DEFAULT false,

    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Audit
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_communications_building ON communications(building_id);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_published ON communications(is_published);

-- =====================================================
-- COMMUNICATION READS TABLE
-- =====================================================
CREATE TABLE communication_reads (
    id SERIAL PRIMARY KEY,
    communication_id INTEGER NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_read UNIQUE (communication_id, user_id)
);

CREATE INDEX idx_communication_reads_comm ON communication_reads(communication_id);
CREATE INDEX idx_communication_reads_user ON communication_reads(user_id);

-- =====================================================
-- VOTES TABLE
-- =====================================================
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    communication_id INTEGER NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,

    vote_option VARCHAR(100) NOT NULL,
    comments TEXT,

    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_vote UNIQUE (communication_id, user_id)
);

CREATE INDEX idx_votes_communication ON votes(communication_id);
CREATE INDEX idx_votes_user ON votes(user_id);

-- =====================================================
-- PROVIDERS TABLE
-- =====================================================
CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Company Info
    company_name VARCHAR(300) NOT NULL,
    business_type VARCHAR(100), -- plumber, electrician, lawyer, etc

    -- Contact
    contact_person VARCHAR(200),

    -- Services
    services_offered TEXT[],

    -- Ratings
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,

    -- Status
    is_verified BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_provider_user UNIQUE (user_id)
);

CREATE INDEX idx_providers_user ON providers(user_id);
CREATE INDEX idx_providers_business_type ON providers(business_type);

-- =====================================================
-- BUILDING PROVIDERS (Relationship) TABLE
-- =====================================================
CREATE TABLE building_providers (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,

    -- Status
    is_active BOOLEAN DEFAULT true,
    added_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_building_provider UNIQUE (building_id, provider_id)
);

CREATE INDEX idx_building_providers_building ON building_providers(building_id);
CREATE INDEX idx_building_providers_provider ON building_providers(provider_id);

-- =====================================================
-- WORK ORDERS TABLE
-- =====================================================
CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES providers(id) ON DELETE SET NULL,

    -- Order Info
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),

    -- Status
    status work_order_status DEFAULT 'pending',

    -- Dates
    scheduled_date DATE,
    completed_date DATE,

    -- Budget
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),

    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Audit
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_orders_building ON work_orders(building_id);
CREATE INDEX idx_work_orders_provider ON work_orders(provider_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);

-- =====================================================
-- BUDGETS (PRESUPUESTOS) TABLE
-- =====================================================
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    work_order_id INTEGER REFERENCES work_orders(id) ON DELETE SET NULL,

    -- Budget Info
    title VARCHAR(300) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,

    -- Validity
    valid_until DATE,

    -- Terms
    payment_terms TEXT,
    warranty_terms TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,

    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budgets_building ON budgets(building_id);
CREATE INDEX idx_budgets_provider ON budgets(provider_id);
CREATE INDEX idx_budgets_status ON budgets(status);

-- =====================================================
-- AMENITIES TABLE
-- =====================================================
CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,

    -- Amenity Info
    name VARCHAR(200) NOT NULL,
    description TEXT,
    capacity INTEGER,

    -- Booking Rules
    booking_rules JSONB DEFAULT '{
        "max_hours": 4,
        "advance_days": 7,
        "cancellation_hours": 24,
        "requires_payment": false,
        "price_per_hour": 0
    }'::jsonb,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_amenities_building ON amenities(building_id);
CREATE INDEX idx_amenities_active ON amenities(is_active);

-- =====================================================
-- AMENITY RESERVATIONS TABLE
-- =====================================================
CREATE TABLE amenity_reservations (
    id SERIAL PRIMARY KEY,
    amenity_id INTEGER NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Reservation Info
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, completed

    -- Payment
    amount_charged DECIMAL(10,2) DEFAULT 0,
    payment_status payment_status DEFAULT 'paid',

    -- Notes
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_reservations_amenity ON amenity_reservations(amenity_id);
CREATE INDEX idx_reservations_unit ON amenity_reservations(unit_id);
CREATE INDEX idx_reservations_date ON amenity_reservations(start_time);

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
    unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,

    -- Document Info
    title VARCHAR(300) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- regulation, insurance, contract, etc

    -- File
    file_name VARCHAR(300) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),

    -- Access Control
    is_public BOOLEAN DEFAULT false,
    allowed_roles user_role[] DEFAULT ARRAY['admin', 'owner']::user_role[],

    -- Audit
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_building ON documents(building_id);
CREATE INDEX idx_documents_unit ON documents(unit_id);
CREATE INDEX idx_documents_category ON documents(category);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,

    -- User Info
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Action Info
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,

    -- Changes
    old_values JSONB,
    new_values JSONB,

    -- Request Info
    ip_address INET,
    user_agent TEXT,

    -- Building Context
    building_id INTEGER REFERENCES buildings(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_building ON audit_logs(building_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Notification Info
    type notification_type NOT NULL,
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,

    -- Related Entity
    entity_type VARCHAR(50),
    entity_id INTEGER,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,

    -- Delivery
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- =====================================================
-- TICKETS (RECLAMOS/SOLICITUDES) TABLE
-- =====================================================
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,

    -- Ticket Info
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100), -- maintenance, complaint, request, etc
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent

    -- Status
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed

    -- Assignment
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMP,

    -- Audit
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_building ON tickets(building_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);

-- =====================================================
-- TICKET COMMENTS TABLE
-- =====================================================
CREATE TABLE ticket_comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,

    -- Comment
    comment TEXT NOT NULL,

    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Audit
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA (SUPERADMIN)
-- =====================================================
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (dni, email, password_hash, role, status, first_name, last_name, email_verified)
VALUES ('00000000', 'superadmin@komunidad.com', '$2a$10$8K1p/a0dL3I8U/oIKvRNIe5Dy0R7gp/KbJlT3X19T0Q3dJ8HZn8ma', 'superadmin', 'active', 'Super', 'Admin', true)
ON CONFLICT (dni) DO NOTHING;

-- Add comments
COMMENT ON TABLE users IS 'Stores all system users (superadmin, admin, owners, tenants, providers)';
COMMENT ON TABLE buildings IS 'Stores consorcio/building information';
COMMENT ON TABLE units IS 'Stores individual units within buildings';
COMMENT ON TABLE expenses IS 'Stores monthly expense periods for buildings';
COMMENT ON TABLE unit_expenses IS 'Stores individual unit expenses per period';
COMMENT ON TABLE audit_logs IS 'Stores all system activity for auditing purposes';
