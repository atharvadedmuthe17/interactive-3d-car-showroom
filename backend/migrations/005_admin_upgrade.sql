-- Add new fields for Cars
ALTER TABLE cars ADD COLUMN IF NOT EXISTS stock INT DEFAULT 1;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add new fields for Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Ensure bookings has correct status check
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('Confirmed', 'Pending', 'Cancelled', 'Completed'));

-- Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status VARCHAR(50) DEFAULT 'Success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('Success', 'Failed', 'Refunded'))
);

-- Create Content Management Table
CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize default content
INSERT INTO content (key, value) VALUES
('homepage_title', 'Experience The Future Of Driving'),
('homepage_subtitle', 'Step into the next generation of performance machines.'),
('show_featured_cars', 'true'),
('banner_image', '/mountain.png')
ON CONFLICT (key) DO NOTHING;

-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
