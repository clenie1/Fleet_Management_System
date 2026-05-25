const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

// CORS configuration - FIXED (no wildcard issues)
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Session setup
app.use(session({
    secret: 'fms_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 3600000,
        sameSite: 'lax'
    }
}));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Your MySQL password (leave empty for XAMPP)
    database: 'fms'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure MySQL is running in XAMPP/WAMP');
        console.log('2. Check if database "fms" exists');
        console.log('3. Verify username and password');
        return;
    }
    console.log('✅ Connected to fms database');
});

// ============ AUTHENTICATION ROUTES ============

// Create Account - saves data to users table
app.post('/api/create-account', async (req, res) => {
    const { username, password, confirmPassword, email, fullname } = req.body;
    
    console.log('📝 Creating account for:', username);
    
    // Validation
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username and password are required' 
        });
    }
    
    if (password !== confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Passwords do not match' 
        });
    }
    
    if (password.length < 4) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 4 characters' 
        });
    }
    
    try {
        // Check if username already exists
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Server error. Please try again.' 
                });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username already exists. Please choose another.' 
                });
            }
            
            // Hash password and insert into users table
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const insertQuery = `INSERT INTO users (username, password, email, fullname) VALUES (?, ?, ?, ?)`;
            
            db.query(insertQuery, [username, hashedPassword, email || null, fullname || null], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error creating account: ' + err.message 
                    });
                }
                
                console.log('✅ Account created successfully:', username);
                res.json({ 
                    success: true, 
                    message: 'Account created successfully! Please login.',
                    userId: result.insertId
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
});

// Login - checks credentials against users table
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('🔐 Login attempt for:', username);
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username and password required' 
        });
    }
    
    // Query users table
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Server error. Please try again.' 
            });
        }
        
        if (results.length === 0) {
            console.log('❌ User not found:', username);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
        
        const user = results[0];
        
        // Compare password with hashed password in database
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (isValidPassword) {
            // Store user info in session
            req.session.user = { 
                userId: user.user_id,
                username: user.username,
                fullname: user.fullname,
                email: user.email
            };
            
            console.log('✅ Login successful:', username);
            res.json({ 
                success: true, 
                message: 'Login successful',
                user: { 
                    username: user.username, 
                    fullname: user.fullname,
                    email: user.email
                }
            });
        } else {
            console.log('❌ Invalid password for:', username);
            res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
});

// Check authentication status
app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Get current user info
app.get('/api/current-user', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

// Get all users (for testing)
app.get('/api/users', (req, res) => {
    db.query('SELECT user_id, username, email, fullname, created_at FROM users', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ============ MIDDLEWARE TO PROTECT ROUTES ============
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized - Please login' });
    }
};

// ============ DRIVER ROUTES ============

// Get all drivers
app.get('/api/drivers', requireAuth, (req, res) => {
    db.query('SELECT * FROM driver ORDER BY DriverID DESC', (err, results) => {
        if (err) {
            console.error('Error fetching drivers:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Add new driver
app.post('/api/drivers', requireAuth, (req, res) => {
    const { FirstName, LastName, Gender, Telephone, LicenseNumber, Address, HireDate } = req.body;
    
    db.query(
        'INSERT INTO driver (FirstName, LastName, Gender, Telephone, LicenseNumber, Address, HireDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [FirstName, LastName, Gender, Telephone, LicenseNumber, Address, HireDate],
        (err, result) => {
            if (err) {
                console.error('Error adding driver:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, DriverID: result.insertId, message: 'Driver added successfully' });
        }
    );
});

// Update driver
app.put('/api/drivers/:id', requireAuth, (req, res) => {
    const { FirstName, LastName, Gender, Telephone, LicenseNumber, Address, HireDate } = req.body;
    const { id } = req.params;
    
    db.query(
        'UPDATE driver SET FirstName=?, LastName=?, Gender=?, Telephone=?, LicenseNumber=?, Address=?, HireDate=? WHERE DriverID=?',
        [FirstName, LastName, Gender, Telephone, LicenseNumber, Address, HireDate, id],
        (err, result) => {
            if (err) {
                console.error('Error updating driver:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Driver updated successfully' });
        }
    );
});

// Delete driver
app.delete('/api/drivers/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM driver WHERE DriverID = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting driver:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Driver deleted successfully' });
    });
});

// Get drivers list for dropdown
app.get('/api/drivers/list', requireAuth, (req, res) => {
    db.query('SELECT DriverID, FirstName, LastName FROM driver ORDER BY FirstName', (err, results) => {
        if (err) {
            console.error('Error fetching drivers list:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// ============ VEHICLE ROUTES ============

// Get all vehicles
app.get('/api/vehicles', requireAuth, (req, res) => {
    db.query('SELECT * FROM vehicle ORDER BY VehicleCode', (err, results) => {
        if (err) {
            console.error('Error fetching vehicles:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Add new vehicle
app.post('/api/vehicles', requireAuth, (req, res) => {
    const { VehicleCode, PlateNumber, VehicleType, Brand, Capacity, Status, PurchaseDate } = req.body;
    
    db.query(
        'INSERT INTO vehicle (VehicleCode, PlateNumber, VehicleType, Brand, Capacity, Status, PurchaseDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [VehicleCode, PlateNumber, VehicleType, Brand, Capacity, Status || 'Available', PurchaseDate],
        (err, result) => {
            if (err) {
                console.error('Error adding vehicle:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Vehicle added successfully' });
        }
    );
});

// Update vehicle
app.put('/api/vehicles/:code', requireAuth, (req, res) => {
    const { PlateNumber, VehicleType, Brand, Capacity, Status, PurchaseDate } = req.body;
    const { code } = req.params;
    
    db.query(
        'UPDATE vehicle SET PlateNumber=?, VehicleType=?, Brand=?, Capacity=?, Status=?, PurchaseDate=? WHERE VehicleCode=?',
        [PlateNumber, VehicleType, Brand, Capacity, Status, PurchaseDate, code],
        (err, result) => {
            if (err) {
                console.error('Error updating vehicle:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Vehicle updated successfully' });
        }
    );
});

// Delete vehicle
app.delete('/api/vehicles/:code', requireAuth, (req, res) => {
    const { code } = req.params;
    
    db.query('DELETE FROM vehicle WHERE VehicleCode = ?', [code], (err, result) => {
        if (err) {
            console.error('Error deleting vehicle:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Vehicle deleted successfully' });
    });
});

// Get vehicles list for dropdown
app.get('/api/vehicles/list', requireAuth, (req, res) => {
    db.query('SELECT VehicleCode, PlateNumber FROM vehicle WHERE Status = "Available" ORDER BY PlateNumber', (err, results) => {
        if (err) {
            console.error('Error fetching vehicles list:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// ============ TRIP ROUTES ============

// Get all trips with driver and vehicle info
app.get('/api/trips', requireAuth, (req, res) => {
    db.query(`
        SELECT t.*, 
               CONCAT(d.FirstName, ' ', d.LastName) as DriverName,
               v.PlateNumber, 
               v.VehicleType
        FROM trip t
        LEFT JOIN driver d ON t.DriverID = d.DriverID
        LEFT JOIN vehicle v ON t.VehicleCode = v.VehicleCode
        ORDER BY t.TripID DESC
    `, (err, results) => {
        if (err) {
            console.error('Error fetching trips:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Add new trip
app.post('/api/trips', requireAuth, (req, res) => {
    const { DriverID, VehicleCode, DepartureLocation, Destination, DepartureDate, ReturnDate, FuelUsed, TripStatus } = req.body;
    
    db.query(
        'INSERT INTO trip (DriverID, VehicleCode, DepartureLocation, Destination, DepartureDate, ReturnDate, FuelUsed, TripStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [DriverID, VehicleCode, DepartureLocation, Destination, DepartureDate, ReturnDate || null, FuelUsed || null, TripStatus || 'Scheduled'],
        (err, result) => {
            if (err) {
                console.error('Error adding trip:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, TripID: result.insertId, message: 'Trip added successfully' });
        }
    );
});

// Update trip
app.put('/api/trips/:id', requireAuth, (req, res) => {
    const { DriverID, VehicleCode, DepartureLocation, Destination, DepartureDate, ReturnDate, FuelUsed, TripStatus } = req.body;
    const { id } = req.params;
    
    db.query(
        'UPDATE trip SET DriverID=?, VehicleCode=?, DepartureLocation=?, Destination=?, DepartureDate=?, ReturnDate=?, FuelUsed=?, TripStatus=? WHERE TripID=?',
        [DriverID, VehicleCode, DepartureLocation, Destination, DepartureDate, ReturnDate, FuelUsed, TripStatus, id],
        (err, result) => {
            if (err) {
                console.error('Error updating trip:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Trip updated successfully' });
        }
    );
});

// Delete trip
app.delete('/api/trips/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM trip WHERE TripID = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting trip:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Trip deleted successfully' });
    });
});

// ============ REPORTS ROUTES ============

// Trip history report
app.get('/api/reports/trip-history', requireAuth, (req, res) => {
    db.query(`
        SELECT 
            CONCAT(d.FirstName, ' ', d.LastName) as DriverName,
            v.PlateNumber, 
            t.DepartureLocation, 
            t.Destination,
            DATE(t.DepartureDate) as DepartureDate, 
            DATE(t.ReturnDate) as ReturnDate, 
            t.FuelUsed, 
            t.TripStatus
        FROM trip t
        LEFT JOIN driver d ON t.DriverID = d.DriverID
        LEFT JOIN vehicle v ON t.VehicleCode = v.VehicleCode
        ORDER BY t.DepartureDate DESC
    `, (err, results) => {
        if (err) {
            console.error('Error generating trip history report:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Fuel usage summary report
app.get('/api/reports/fuel-summary', requireAuth, (req, res) => {
    db.query(`
        SELECT 
            v.PlateNumber, 
            v.VehicleType, 
            COUNT(t.TripID) as TotalTrips,
            COALESCE(SUM(t.FuelUsed), 0) as TotalFuelUsed,
            COALESCE(AVG(t.FuelUsed), 0) as AverageFuelUsed
        FROM vehicle v
        LEFT JOIN trip t ON v.VehicleCode = t.VehicleCode
        GROUP BY v.VehicleCode
        ORDER BY TotalFuelUsed DESC
    `, (err, results) => {
        if (err) {
            console.error('Error generating fuel summary report:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// ============ DASHBOARD STATS ============
app.get('/api/dashboard/stats', requireAuth, (req, res) => {
    const queries = {
        drivers: 'SELECT COUNT(*) as count FROM driver',
        vehicles: 'SELECT COUNT(*) as count FROM vehicle',
        trips: 'SELECT COUNT(*) as count FROM trip',
        activeTrips: 'SELECT COUNT(*) as count FROM trip WHERE TripStatus = "Ongoing"',
        completedTrips: 'SELECT COUNT(*) as count FROM trip WHERE TripStatus = "Completed"'
    };
    
    db.query(queries.drivers, (err, driversResult) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.query(queries.vehicles, (err, vehiclesResult) => {
            if (err) return res.status(500).json({ error: err.message });
            
            db.query(queries.trips, (err, tripsResult) => {
                if (err) return res.status(500).json({ error: err.message });
                
                db.query(queries.activeTrips, (err, activeResult) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    db.query(queries.completedTrips, (err, completedResult) => {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        res.json({
                            totalDrivers: driversResult[0].count,
                            totalVehicles: vehiclesResult[0].count,
                            totalTrips: tripsResult[0].count,
                            activeTrips: activeResult[0].count,
                            completedTrips: completedResult[0].count
                        });
                    });
                });
            });
        });
    });
});

// ============ TEST ROUTE ============
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'FMS Backend is working perfectly!', 
        database: 'fms',
        status: 'connected',
        timestamp: new Date().toISOString()
    });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`
    ═══════════════════════════════════════════════════════════
    🚀 FMS Backend Server Started Successfully!
    ═══════════════════════════════════════════════════════════
    📡 Server URL: http://localhost:${PORT}
    🗄️  Database: fms
    📊 Tables: users, driver, vehicle, trip
    🔐 Authentication: Ready
    🌐 CORS Enabled for: http://localhost:5173
    ✅ Status: Ready to accept requests
    ═══════════════════════════════════════════════════════════
    
    📝 Test Commands:
    - Test API: curl http://localhost:${PORT}/api/test
    - Create Account: POST http://localhost:${PORT}/api/create-account
    - Login: POST http://localhost:${PORT}/api/login
    
    💡 IMPORTANT: Fix your users table password column:
    ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL;
    `);
});