const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// ======================================================
// GALLERY IMAGE UPLOAD SETUP
// ======================================================

const galleryUploadDir = path.join(
    __dirname,
    "uploads",
    "gallery"
);

fs.mkdirSync(galleryUploadDir, {
    recursive: true
});

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// ------------------------------------------------------
// MULTER STORAGE
// ------------------------------------------------------

const galleryStorage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            galleryUploadDir
        );

    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const uniqueName =
            `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${extension}`;

        cb(
            null,
            uniqueName
        );

    }

});


// ------------------------------------------------------
// MULTER VALIDATION
// ------------------------------------------------------

const galleryUpload = multer({

    storage: galleryStorage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only JPG, PNG and WEBP images are allowed"
                )
            );

        }

    }

});


// ======================================================
// DATABASE CONNECTION
// ======================================================

const db = mysql.createConnection({

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

});


db.connect((error) => {

    if (error) {

        console.log(
            "❌ MySQL connection failed"
        );

        console.log(
            error.message
        );

        return;
    }

    console.log(
        "✅ MySQL connected successfully"
    );

});


// ======================================================
// PUBLIC SERVICES
// ======================================================

app.get(
    "/api/services",
    (req, res) => {

        const sql = `
            SELECT *
            FROM services
            WHERE is_active = TRUE
            ORDER BY id ASC
        `;

        db.query(
            sql,
            (error, results) => {

                if (error) {

                    console.error(
                        "Services fetch error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch services"
                    });

                }

                res.json(results);

            }
        );

    }
);


// ======================================================
// PUBLIC REVIEWS
// ======================================================

app.get(
    "/api/reviews",
    (req, res) => {

        const sql = `
            SELECT *
            FROM reviews
            WHERE is_active = TRUE
            ORDER BY created_at DESC
        `;

        db.query(
            sql,
            (error, results) => {

                if (error) {

                    console.error(
                        "Public reviews error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch reviews"
                    });

                }

                res.json(results);

            }
        );

    }
);


// ======================================================
// PUBLIC BUSINESS SETTINGS
// ======================================================

app.get(
    "/api/business-settings",
    (req, res) => {

        const sql = `
            SELECT *
            FROM business_settings
            WHERE id = 1
            LIMIT 1
        `;

        db.query(
            sql,
            (error, results) => {

                if (error) {

                    console.error(
                        "Business settings fetch error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch business settings"
                    });

                }

                if (
                    results.length === 0
                ) {

                    return res.json({});

                }

                res.json(
                    results[0]
                );

            }
        );

    }
);


// ======================================================
// CUSTOMER BOOKING
// ======================================================

app.post(
    "/api/bookings",
    (req, res) => {

        const {
            name,
            phone,
            email,
            service_id,
            booking_date,
            booking_time,
            notes
        } = req.body;


        if (
            !name ||
            !phone ||
            !service_id ||
            !booking_date ||
            !booking_time
        ) {

            return res.status(400).json({
                message:
                    "Please fill all required fields"
            });

        }


        const customerSql = `
            SELECT id
            FROM customers
            WHERE phone = ?
        `;


        db.query(
            customerSql,
            [phone],
            (error, customerResult) => {

                if (error) {

                    console.error(
                        "Customer lookup error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Customer lookup failed"
                    });

                }


                if (
                    customerResult.length > 0
                ) {

                    createBooking(
                        customerResult[0].id
                    );

                } else {

                    const insertCustomerSql = `
                        INSERT INTO customers
                        (
                            name,
                            phone,
                            email
                        )
                        VALUES (?, ?, ?)
                    `;


                    db.query(
                        insertCustomerSql,
                        [
                            name,
                            phone,
                            email || null
                        ],
                        (
                            error,
                            customerInsertResult
                        ) => {

                            if (error) {

                                console.error(
                                    "Customer creation error:",
                                    error
                                );

                                return res.status(500).json({
                                    message:
                                        "Customer creation failed"
                                });

                            }


                            createBooking(
                                customerInsertResult.insertId
                            );

                        }
                    );

                }

            }
        );


        function createBooking(
            customerId
        ) {

            const bookingSql = `
                INSERT INTO bookings
                (
                    customer_id,
                    service_id,
                    booking_date,
                    booking_time,
                    notes
                )
                VALUES (?, ?, ?, ?, ?)
            `;


            db.query(
                bookingSql,
                [
                    customerId,
                    service_id,
                    booking_date,
                    booking_time,
                    notes || null
                ],
                (error, result) => {

                    if (error) {

                        console.error(
                            "Booking error:",
                            error
                        );

                        return res.status(500).json({
                            message:
                                "Booking failed"
                        });

                    }


                    res.status(201).json({

                        message:
                            "Appointment booked successfully",

                        booking_id:
                            result.insertId

                    });

                }
            );

        }

    }
);


// ======================================================
// ADMIN LOGIN
// ======================================================

app.post(
    "/api/admin/login",
    (req, res) => {

        const {
            email,
            password
        } = req.body;


        if (
            !email ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });

        }


        const sql = `
            SELECT *
            FROM admins
            WHERE email = ?
            LIMIT 1
        `;


        db.query(
            sql,
            [email],
            async (error, results) => {

                if (error) {

                    console.error(
                        "Admin login error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Database error"
                    });

                }


                if (
                    results.length === 0
                ) {

                    return res.status(401).json({
                        message:
                            "Invalid email or password"
                    });

                }


                const admin =
                    results[0];


                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        admin.password_hash
                    );


                if (!passwordMatch) {

                    return res.status(401).json({
                        message:
                            "Invalid email or password"
                    });

                }


                const token =
                    jwt.sign(
                        {
                            id:
                                admin.id,

                            email:
                                admin.email,

                            role:
                                "admin"
                        },

                        process.env.JWT_SECRET,

                        {
                            expiresIn:
                                "2h"
                        }
                    );


                res.json({

                    message:
                        "Login successful",

                    token,

                    admin: {

                        id:
                            admin.id,

                        name:
                            admin.name,

                        email:
                            admin.email

                    }

                });

            }
        );

    }
);


// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

function verifyAdminToken(
    req,
    res,
    next
) {

    const authHeader =
        req.headers.authorization;


    const token =
        authHeader &&
        authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;


    if (!token) {

        return res.status(401).json({
            message:
                "Access denied. Token required."
        });

    }


    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        if (
            decoded.role !== "admin"
        ) {

            return res.status(403).json({
                message:
                    "Admin access required."
            });

        }


        req.admin =
            decoded;


        next();

    } catch (error) {

        return res.status(401).json({
            message:
                "Invalid or expired token"
        });

    }

}


// ======================================================
// ADMIN BOOKINGS
// ======================================================

app.get(
    "/api/bookings",
    verifyAdminToken,
    (req, res) => {

        const sql = `
            SELECT
                bookings.id,
                customers.name AS customer_name,
                customers.phone,
                customers.email,
                services.name AS service_name,
                services.price,
                bookings.booking_date,
                bookings.booking_time,
                bookings.status,
                bookings.notes,
                bookings.created_at

            FROM bookings

            INNER JOIN customers
                ON bookings.customer_id =
                   customers.id

            INNER JOIN services
                ON bookings.service_id =
                   services.id

            ORDER BY
                bookings.booking_date ASC,
                bookings.booking_time ASC
        `;


        db.query(
            sql,
            (error, results) => {

                if (error) {

                    console.error(
                        "Bookings fetch error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch bookings"
                    });

                }


                res.json(
                    results
                );

            }
        );

    }
);


// ======================================================
// UPDATE BOOKING STATUS
// ======================================================

app.patch(
    "/api/bookings/:id/status",
    verifyAdminToken,
    (req, res) => {

        const bookingId =
            req.params.id;


        const {
            status
        } = req.body;


        const allowedStatuses = [
            "pending",
            "confirmed",
            "completed",
            "cancelled"
        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid booking status"
            });

        }


        const sql = `
            UPDATE bookings
            SET status = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                status,
                bookingId
            ],
            (error, result) => {

                if (error) {

                    console.error(
                        "Booking status error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update booking status"
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Booking not found"
                    });

                }


                res.json({
                    message:
                        "Booking status updated successfully"
                });

            }
        );

    }
);


// ======================================================
// ADMIN SERVICES CRUD
// ======================================================

// ADD SERVICE

app.post(
    "/api/admin/services",
    verifyAdminToken,
    (req, res) => {

        const {
            name,
            description,
            price,
            duration,
            image_url
        } = req.body;


        if (
            !name ||
            !price ||
            !duration
        ) {

            return res.status(400).json({
                message:
                    "Name, price and duration are required"
            });

        }


        const sql = `
            INSERT INTO services
            (
                name,
                description,
                price,
                duration,
                image_url
            )
            VALUES (?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                name.trim(),
                description || "",
                price,
                duration,
                image_url || null
            ],
            (error, result) => {

                if (error) {

                    console.error(
                        "Add service error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to add service"
                    });

                }


                res.status(201).json({

                    message:
                        "Service added successfully",

                    serviceId:
                        result.insertId

                });

            }
        );

    }
);


// UPDATE SERVICE

app.patch(
    "/api/admin/services/:id",
    verifyAdminToken,
    (req, res) => {

        const {
            id
        } = req.params;


        const {
            name,
            description,
            price,
            duration,
            image_url,
            is_active
        } = req.body;


        if (
            !name ||
            !price ||
            !duration
        ) {

            return res.status(400).json({
                message:
                    "Name, price and duration are required"
            });

        }


        const sql = `
            UPDATE services
            SET
                name = ?,
                description = ?,
                price = ?,
                duration = ?,
                image_url = ?,
                is_active = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                name.trim(),
                description || "",
                price,
                duration,
                image_url || null,
                is_active !== undefined
                    ? is_active
                    : true,
                id
            ],
            (error, result) => {

                if (error) {

                    console.error(
                        "Update service error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update service"
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Service not found"
                    });

                }


                res.json({
                    message:
                        "Service updated successfully"
                });

            }
        );

    }
);


// TOGGLE SERVICE

app.patch(
    "/api/admin/services/:id/toggle",
    verifyAdminToken,
    (req, res) => {

        const {
            id
        } = req.params;


        const sql = `
            UPDATE services
            SET is_active =
                NOT is_active
            WHERE id = ?
        `;


        db.query(
            sql,
            [id],
            (error, result) => {

                if (error) {

                    console.error(
                        "Toggle service error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to change service status"
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Service not found"
                    });

                }


                res.json({
                    message:
                        "Service status updated successfully"
                });

            }
        );

    }
);


// ======================================================
// ADMIN REVIEWS CRUD
// ======================================================

// GET ALL REVIEWS

app.get(
    "/api/admin/reviews",
    verifyAdminToken,
    (req, res) => {

        const sql = `
            SELECT *
            FROM reviews
            ORDER BY created_at DESC
        `;


        db.query(
            sql,
            (error, results) => {

                if (error) {

                    console.error(
                        "Load reviews error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to load reviews"
                    });

                }


                res.json(
                    results
                );

            }
        );

    }
);


// ADD REVIEW

app.post(
    "/api/admin/reviews",
    verifyAdminToken,
    (req, res) => {

        const {
            author,
            rating,
            review_text,
            source
        } = req.body;


        if (
            !author ||
            !rating ||
            !review_text
        ) {

            return res.status(400).json({
                message:
                    "Author, rating and review are required"
            });

        }


        const numericRating =
            Number(rating);


        if (
            numericRating < 1 ||
            numericRating > 5
        ) {

            return res.status(400).json({
                message:
                    "Rating must be between 1 and 5"
            });

        }


        const sql = `
            INSERT INTO reviews
            (
                author,
                rating,
                review_text,
                source,
                is_active
            )
            VALUES (?, ?, ?, ?, TRUE)
        `;


        db.query(
            sql,
            [
                author.trim(),
                numericRating,
                review_text.trim(),
                source
                    ? source.trim()
                    : "Demo"
            ],
            (error, result) => {

                if (error) {

                    console.error(
                        "Add review error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to add review"
                    });

                }


                res.status(201).json({

                    message:
                        "Review added successfully",

                    id:
                        result.insertId

                });

            }
        );

    }
);


// UPDATE REVIEW

app.patch(
    "/api/admin/reviews/:id",
    verifyAdminToken,
    (req, res) => {

        const reviewId =
            Number(req.params.id);


        const {
            author,
            rating,
            review_text,
            source
        } = req.body;


        if (
            !author ||
            !rating ||
            !review_text
        ) {

            return res.status(400).json({
                message:
                    "Author, rating and review are required"
            });

        }


        const numericRating =
            Number(rating);


        if (
            numericRating < 1 ||
            numericRating > 5
        ) {

            return res.status(400).json({
                message:
                    "Rating must be between 1 and 5"
            });

        }


        const sql = `
            UPDATE reviews
            SET
                author = ?,
                rating = ?,
                review_text = ?,
                source = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                author.trim(),
                numericRating,
                review_text.trim(),
                source
                    ? source.trim()
                    : "Demo",
                reviewId
            ],
            (error, result) => {

                if (error) {

                    console.error(
                        "Update review error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update review"
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Review not found"
                    });

                }


                res.json({
                    message:
                        "Review updated successfully"
                });

            }
        );

    }
);


// ACTIVATE / DEACTIVATE REVIEW

app.patch(
    "/api/admin/reviews/:id/status",
    verifyAdminToken,
    (req, res) => {

        const reviewId =
            Number(req.params.id);


        const {
            is_active
        } = req.body;


        if (
            typeof is_active !== "boolean"
        ) {

            return res.status(400).json({
                message:
                    "is_active must be true or false"
            });

        }


        const sql = `
            UPDATE reviews
            SET is_active = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                is_active,
                reviewId
            ],
            (error, result) => {

                if (error) {

                    console.error(
                        "Review status error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update review status"
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Review not found"
                    });

                }


                res.json({
                    message:
                        is_active
                            ? "Review activated"
                            : "Review deactivated"
                });

            }
        );

    }
);


// DELETE REVIEW

app.delete(
    "/api/admin/reviews/:id",
    verifyAdminToken,
    (req, res) => {

        const reviewId =
            Number(req.params.id);


        const sql = `
            DELETE FROM reviews
            WHERE id = ?
        `;


        db.query(
            sql,
            [reviewId],
            (error, result) => {

                if (error) {

                    console.error(
                        "Review delete error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to delete review"
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Review not found"
                    });

                }


                res.json({
                    message:
                        "Review deleted successfully"
                });

            }
        );

    }
);


// ======================================================
// ADMIN BUSINESS SETTINGS
// ======================================================

// GET BUSINESS SETTINGS

app.get(
    "/api/admin/business-settings",
    verifyAdminToken,
    (req, res) => {

        const sql = `
            SELECT *
            FROM business_settings
            WHERE id = 1
            LIMIT 1
        `;


        db.query(
            sql,
            (error, results) => {

                if (error) {

                    console.error(
                        "Admin settings fetch error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch business settings"
                    });

                }


                if (
                    results.length === 0
                ) {

                    return res.json({

                        id: 1,

                        business_name: "",

                        tagline: "",

                        phone: "",

                        whatsapp: "",

                        email: "",

                        address: "",

                        opening_time: "",

                        closing_time: "",

                        instagram_url: "",

                        facebook_url: "",

                        map_url: "",

                        logo_url: ""

                    });

                }


                res.json(
                    results[0]
                );

            }
        );

    }
);


// UPDATE BUSINESS SETTINGS

app.put(
    "/api/admin/business-settings",
    verifyAdminToken,
    (req, res) => {

        const {
            business_name,
            tagline,
            phone,
            whatsapp,
            email,
            address,
            opening_time,
            closing_time,
            instagram_url,
            facebook_url,
            map_url,
            logo_url
        } = req.body;


        if (
            !business_name ||
            !business_name.trim()
        ) {

            return res.status(400).json({
                message:
                    "Business name is required"
            });

        }


        const sql = `
            INSERT INTO business_settings
            (
                id,
                business_name,
                tagline,
                phone,
                whatsapp,
                email,
                address,
                opening_time,
                closing_time,
                instagram_url,
                facebook_url,
                map_url,
                logo_url
            )

            VALUES
            (
                1,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )

            ON DUPLICATE KEY UPDATE

                business_name =
                    VALUES(business_name),

                tagline =
                    VALUES(tagline),

                phone =
                    VALUES(phone),

                whatsapp =
                    VALUES(whatsapp),

                email =
                    VALUES(email),

                address =
                    VALUES(address),

                opening_time =
                    VALUES(opening_time),

                closing_time =
                    VALUES(closing_time),

                instagram_url =
                    VALUES(instagram_url),

                facebook_url =
                    VALUES(facebook_url),

                map_url =
                    VALUES(map_url),

                logo_url =
                    VALUES(logo_url)
        `;


        const values = [

            business_name.trim(),

            tagline?.trim() || "",

            phone?.trim() || "",

            whatsapp?.trim() || "",

            email?.trim() || "",

            address?.trim() || "",

            opening_time || null,

            closing_time || null,

            instagram_url?.trim() || "",

            facebook_url?.trim() || "",

            map_url?.trim() || "",

            logo_url?.trim() || ""

        ];


        db.query(
            sql,
            values,
            (error) => {

                if (error) {

                    console.error(
                        "Business settings update error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update business settings"
                    });

                }


                res.json({
                    message:
                        "Business settings updated successfully"
                });

            }
        );

    }
);


// ======================================================
// GALLERY
// ======================================================

// PUBLIC GET ACTIVE GALLERY

app.get(
    "/api/gallery",
    (req, res) => {

        const sql = `
            SELECT
                id,
                title,
                category,
                image_url
            FROM gallery
            WHERE is_active = TRUE
            ORDER BY created_at DESC
        `;


        db.query(
            sql,
            (error, results) => {

                if (error) {

                    console.error(
                        "Gallery fetch error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to load gallery"
                    });

                }


                res.json(
                    results
                );

            }
        );

    }
);


// ADMIN GET ALL GALLERY

app.get(
    "/api/admin/gallery",
    verifyAdminToken,
    (req, res) => {

        const sql = `
            SELECT
                id,
                title,
                category,
                image_url,
                is_active,
                created_at
            FROM gallery
            ORDER BY created_at DESC
        `;


        db.query(
            sql,
            (error, results) => {

                if (error) {

                    console.error(
                        "Admin gallery fetch error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to load gallery"
                    });

                }


                res.json(
                    results
                );

            }
        );

    }
);


// ADD GALLERY

app.post(
    "/api/admin/gallery",
    verifyAdminToken,
    galleryUpload.single("image"),
    (req, res) => {

        const {
            title,
            category,
            image_url
        } = req.body;


        if (
            !title ||
            !category ||
            (
                !req.file &&
                !image_url
            )
        ) {

            return res.status(400).json({
                message:
                    "Title, category and image are required"
            });

        }


        let finalImageUrl;


        if (req.file) {

            finalImageUrl =
                `/uploads/gallery/${req.file.filename}`;

        } else {

            finalImageUrl =
                image_url.trim();

        }


        const sql = `
            INSERT INTO gallery
            (
                title,
                category,
                image_url
            )
            VALUES (?, ?, ?)
        `;


        db.query(
            sql,
            [
                title.trim(),
                category.trim(),
                finalImageUrl
            ],
            (error, result) => {

                if (error) {

                    console.error(
                        "Add gallery error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to add gallery image"
                    });

                }


                res.status(201).json({

                    message:
                        "Gallery image added successfully",

                    id:
                        result.insertId,

                    image_url:
                        finalImageUrl

                });

            }
        );

    }
);


// EDIT GALLERY

app.patch(
    "/api/admin/gallery/:id",
    verifyAdminToken,
    galleryUpload.single("image"),
    (req, res) => {

        const {
            id
        } = req.params;


        const {
            title,
            category,
            image_url
        } = req.body;


        if (
            !title ||
            !category
        ) {

            return res.status(400).json({
                message:
                    "Title and category are required"
            });

        }


        const selectSql = `
            SELECT image_url
            FROM gallery
            WHERE id = ?
        `;


        db.query(
            selectSql,
            [id],
            (error, results) => {

                if (error) {

                    console.error(
                        "Gallery lookup error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to find gallery image"
                    });

                }


                if (
                    results.length === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Gallery image not found"
                    });

                }


                let finalImageUrl;


                if (req.file) {

                    finalImageUrl =
                        `/uploads/gallery/${req.file.filename}`;

                } else if (
                    image_url &&
                    image_url.trim()
                ) {

                    finalImageUrl =
                        image_url.trim();

                } else {

                    finalImageUrl =
                        results[0].image_url;

                }


                const updateSql = `
                    UPDATE gallery
                    SET
                        title = ?,
                        category = ?,
                        image_url = ?
                    WHERE id = ?
                `;


                db.query(
                    updateSql,
                    [
                        title.trim(),
                        category.trim(),
                        finalImageUrl,
                        id
                    ],
                    (error, result) => {

                        if (error) {

                            console.error(
                                "Update gallery error:",
                                error
                            );

                            return res.status(500).json({
                                message:
                                    "Failed to update gallery image"
                            });

                        }


                        if (
                            result.affectedRows === 0
                        ) {

                            return res.status(404).json({
                                message:
                                    "Gallery image not found"
                            });

                        }


                        res.json({

                            message:
                                "Gallery image updated successfully",

                            image_url:
                                finalImageUrl

                        });

                    }
                );

            }
        );

    }
);


// TOGGLE GALLERY STATUS

app.patch(
    "/api/admin/gallery/:id/status",
    verifyAdminToken,
    (req, res) => {

        const {
            id
        } = req.params;


        const {
            is_active
        } = req.body;


        if (
            typeof is_active !== "boolean"
        ) {

            return res.status(400).json({
                message:
                    "is_active must be true or false"
            });

        }


        const sql = `
            UPDATE gallery
            SET is_active = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                is_active,
                id
            ],
            (error, result) => {

                if (error) {

                    console.error(
                        "Gallery status error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update gallery status"
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Gallery image not found"
                    });

                }


                res.json({

                    message:
                        is_active
                            ? "Gallery image activated"
                            : "Gallery image deactivated"

                });

            }
        );

    }
);


// DELETE GALLERY IMAGE - SOFT DELETE

app.delete(
    "/api/admin/gallery/:id",
    verifyAdminToken,
    (req, res) => {

        const {
            id
        } = req.params;


        const sql = `
            UPDATE gallery
            SET is_active = FALSE
            WHERE id = ?
        `;


        db.query(
            sql,
            [id],
            (error, result) => {

                if (error) {

                    console.error(
                        "Gallery delete error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to delete gallery image"
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Gallery image not found"
                    });

                }


                res.json({
                    message:
                        "Gallery image removed successfully"
                });

            }
        );

    }
);


// ======================================================
// MULTER / UPLOAD ERROR HANDLER
// ======================================================

app.use(
    (error, req, res, next) => {

        if (
            error instanceof multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({
                    message:
                        "Image size must be less than 5MB"
                });

            }


            return res.status(400).json({
                message:
                    error.message
            });

        }


        if (error) {

            return res.status(400).json({
                message:
                    error.message
            });

        }


        next();

    }
);


// ======================================================
// SERVER START
// ======================================================

app.listen(
    process.env.PORT,
    () => {

        console.log(
            `🚀 Server running on http://localhost:${process.env.PORT}`
        );

    }
);
