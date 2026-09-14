CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (
        role IN (
            'customer',
            'operator',
            'admin',
            'owner'
        )
    ),
    is_active INTEGER NOT NULL DEFAULT 1,
    email_verified_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS buses (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    plate_number TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bus_seats (
    id TEXT PRIMARY KEY,
    bus_id TEXT NOT NULL REFERENCES buses (id),
    seat_number TEXT NOT NULL,
    seat_row INTEGER NOT NULL,
    seat_column INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    UNIQUE (bus_id, seat_number)
);

CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    origin_id TEXT NOT NULL REFERENCES locations (id),
    destination_id TEXT NOT NULL REFERENCES locations (id),
    duration_minutes INTEGER NOT NULL,
    distance_km INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (origin_id <> destination_id)
);

CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    trip_code TEXT NOT NULL UNIQUE,
    bus_id TEXT NOT NULL REFERENCES buses (id),
    route_id TEXT NOT NULL REFERENCES routes (id),
    departure_at TEXT NOT NULL,
    arrival_at TEXT NOT NULL,
    fare INTEGER NOT NULL CHECK (fare >= 0),
    status TEXT NOT NULL CHECK (
        status IN (
            'scheduled',
            'boarding',
            'departed',
            'arrived',
            'cancelled'
        )
    ),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    booking_code TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users (id),
    trip_id TEXT NOT NULL REFERENCES trips (id),
    status TEXT NOT NULL CHECK (
        status IN (
            'draft',
            'pending_payment',
            'confirmed',
            'cancelled',
            'expired',
            'completed'
        )
    ),
    subtotal INTEGER NOT NULL,
    admin_fee INTEGER NOT NULL DEFAULT 0,
    discount INTEGER NOT NULL DEFAULT 0,
    grand_total INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    paid_at TEXT,
    cancelled_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trip_seats (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL REFERENCES trips (id),
    bus_seat_id TEXT NOT NULL REFERENCES bus_seats (id),
    status TEXT NOT NULL CHECK (
        status IN (
            'available',
            'held',
            'booked',
            'blocked'
        )
    ),
    held_by_booking_id TEXT REFERENCES bookings (id),
    held_until TEXT,
    UNIQUE (trip_id, bus_seat_id)
);

CREATE TABLE IF NOT EXISTS booking_passengers (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL REFERENCES bookings (id),
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')),
    phone TEXT,
    identity_number TEXT,
    seat_id TEXT NOT NULL REFERENCES trip_seats (id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (booking_id, seat_id)
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL UNIQUE REFERENCES bookings (id),
    gateway TEXT NOT NULL DEFAULT 'manual',
    gateway_transaction_id TEXT UNIQUE,
    gateway_session_id TEXT,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL CHECK (
        status IN (
            'unpaid',
            'pending',
            'awaiting_verification',
            'paid',
            'failed',
            'rejected',
            'expired',
            'refunded'
        )
    ),
    payment_method TEXT,
    payment_channel TEXT,
    payment_url TEXT,
    proof_path TEXT,
    proof_uploaded_at TEXT,
    verified_by TEXT REFERENCES users (id),
    verified_at TEXT,
    verification_note TEXT,
    request_payload TEXT,
    response_payload TEXT,
    paid_at TEXT,
    expired_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL REFERENCES bookings (id),
    passenger_id TEXT NOT NULL UNIQUE REFERENCES booking_passengers (id),
    ticket_code TEXT NOT NULL UNIQUE,
    qr_token_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (
        status IN ('issued', 'used', 'cancelled')
    ),
    issued_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_webhooks (
    id TEXT PRIMARY KEY,
    gateway TEXT NOT NULL,
    event_id TEXT NOT NULL,
    transaction_id TEXT,
    payload TEXT NOT NULL,
    headers TEXT,
    status TEXT NOT NULL,
    processed_at TEXT,
    created_at TEXT NOT NULL,
    UNIQUE (gateway, event_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users (id),
    action TEXT NOT NULL,
    model_type TEXT NOT NULL,
    model_id TEXT,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content_html TEXT NOT NULL,
    thumbnail_path TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'published')
    ),
    published_at TEXT,
    author_id TEXT NOT NULL REFERENCES users (id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    is_public INTEGER NOT NULL DEFAULT 0,
    updated_by TEXT REFERENCES users (id),
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_news_public ON news (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_trips_departure ON trips (departure_at, status);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trip_seats_status ON trip_seats (trip_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status, created_at DESC);