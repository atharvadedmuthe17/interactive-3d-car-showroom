-- =====================================================================
-- MIGRATION: Create Bookings Table
-- =====================================================================
-- This migration creates a bookings table for car rental/booking system
-- with proper foreign key relationships and indexes.
-- =====================================================================

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_name VARCHAR(255) NOT NULL,
    car_model_id VARCHAR(100) NOT NULL,
    booking_type VARCHAR(100),
    city VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add constraints
    CONSTRAINT bookings_status_check CHECK (status IN ('Confirmed', 'Pending', 'Cancelled', 'Completed'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_car_model_id ON bookings(car_model_id);
CREATE INDEX IF NOT EXISTS idx_bookings_city ON bookings(city);

-- Add comments for documentation
COMMENT ON TABLE bookings IS 'Car booking/rental records linked to users';
COMMENT ON COLUMN bookings.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN bookings.car_name IS 'Name of the car being booked';
COMMENT ON COLUMN bookings.car_model_id IS 'Unique identifier for car model';
COMMENT ON COLUMN bookings.booking_type IS 'Type of booking (e.g., daily, weekly, monthly)';
COMMENT ON COLUMN bookings.city IS 'City where booking is made';
COMMENT ON COLUMN bookings.status IS 'Booking status: Confirmed, Pending, Cancelled, or Completed';

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- Show indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'bookings';

-- Show constraints
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass
ORDER BY contype, conname;

-- Success message
SELECT 'Bookings table created successfully!' AS status;
