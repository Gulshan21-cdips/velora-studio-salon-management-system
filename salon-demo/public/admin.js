/* ==================================================
   API
================================================== */

const API =
    "http://localhost:3000/api";


/* ==================================================
   AUTH GUARD
================================================== */

const token =
    localStorage.getItem(
        "velora_admin_token"
    );


if (!token) {

    window.location.href =
        "admin-login.html";

}


/* ==================================================
   ELEMENTS
================================================== */

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


const sections =
    document.querySelectorAll(
        ".admin-section"
    );


const pageTitle =
    document.getElementById(
        "pageTitle"
    );


const sidebar =
    document.getElementById(
        "sidebar"
    );


const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


/* ==================================================
   SECTION NAVIGATION
================================================== */

function showSection(sectionName) {

    sections.forEach(
        section => {

            section.classList.remove(
                "active"
            );

        }
    );


    const selectedSection =
        document.getElementById(
            sectionName
        );


    if (selectedSection) {

        selectedSection.classList.add(
            "active"
        );

    }


    navItems.forEach(
        item => {

            item.classList.remove(
                "active"
            );


            if (
                item.dataset.section ===
                sectionName
            ) {

                item.classList.add(
                    "active"
                );

            }

        }
    );


    const titles = {

        dashboard:
            "Dashboard",

        appointments:
            "Appointments",

        services:
            "Services",

        gallery:
            "Gallery",

        reviews:
            "Reviews",

        settings:
            "Settings"

    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[sectionName] ||
            "Dashboard";

    }


    if (sidebar) {

        sidebar.classList.remove(
            "active"
        );

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


navItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                showSection(
                    item.dataset.section
                );

            }
        );

    }
);


/* ==================================================
   MOBILE SIDEBAR
================================================== */

if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        () => {

            if (sidebar) {

                sidebar.classList.toggle(
                    "active"
                );

            }

        }
    );

}


/* ==================================================
   AUTH ERROR HANDLER
================================================== */

function handleAuthError() {

    localStorage.removeItem(
        "velora_admin_token"
    );


    localStorage.removeItem(
        "velora_admin"
    );


    window.location.href =
        "admin-login.html";

}


/* ==================================================
   LOAD BOOKINGS
================================================== */

async function loadBookings() {

    const table =
        document.getElementById(
            "appointmentsTable"
        );


    const recent =
        document.getElementById(
            "recentAppointments"
        );


    if (!table) return;


    table.innerHTML = `
        <tr>
            <td colspan="7">
                Loading appointments...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API}/bookings`,
                {

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthError();

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load bookings"
            );

        }


        const bookings =
            await response.json();


        renderStats(
            bookings
        );


        renderAppointments(
            bookings,
            table
        );


        renderRecent(
            bookings,
            recent
        );


    } catch (error) {

        console.error(error);


        table.innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load appointments.
                </td>
            </tr>
        `;

    }

}


/* ==================================================
   STATS
================================================== */

function renderStats(
    bookings
) {

    const total =
        bookings.length;


    const pending =
        bookings.filter(
            booking =>
                booking.status ===
                "pending"
        ).length;


    const confirmed =
        bookings.filter(
            booking =>
                booking.status ===
                "confirmed"
        ).length;


    const revenue =
        bookings

            .filter(
                booking =>
                    booking.status ===
                    "completed"
            )

            .reduce(
                (
                    total,
                    booking
                ) => {

                    return total +
                        Number(
                            booking.price ||
                            0
                        );

                },
                0
            );


    const totalBookings =
        document.getElementById(
            "totalBookings"
        );


    const pendingBookings =
        document.getElementById(
            "pendingBookings"
        );


    const confirmedBookings =
        document.getElementById(
            "confirmedBookings"
        );


    const revenueElement =
        document.getElementById(
            "totalRevenue"
        );


    if (totalBookings) {

        totalBookings.textContent =
            total;

    }


    if (pendingBookings) {

        pendingBookings.textContent =
            pending;

    }


    if (confirmedBookings) {

        confirmedBookings.textContent =
            confirmed;

    }


    if (revenueElement) {

        revenueElement.textContent =
            `₹${revenue.toLocaleString(
                "en-IN"
            )}`;

    }

}


/* ==================================================
   APPOINTMENTS
================================================== */

function renderAppointments(
    bookings,
    table
) {

    if (!bookings.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No appointments found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        bookings
            .map(
                booking => `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                booking.customer_name
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            booking.phone
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            booking.service_name
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            booking.booking_date
                        )}
                    </td>

                    <td>
                        ${formatTime(
                            booking.booking_time
                        )}
                    </td>

                    <td>
                        <span
                            class="status-badge status-${booking.status}"
                        >
                            ${escapeHTML(
                                booking.status
                            )}
                        </span>
                    </td>

                    <td>

                        <select
                            class="action-select"
                            onchange="
                                changeStatus(
                                    ${booking.id},
                                    this.value
                                )
                            "
                        >

                            <option
                                value="pending"
                                ${
                                    booking.status ===
                                    "pending"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Pending
                            </option>

                            <option
                                value="confirmed"
                                ${
                                    booking.status ===
                                    "confirmed"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Confirmed
                            </option>

                            <option
                                value="completed"
                                ${
                                    booking.status ===
                                    "completed"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Completed
                            </option>

                            <option
                                value="cancelled"
                                ${
                                    booking.status ===
                                    "cancelled"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Cancelled
                            </option>

                        </select>

                    </td>

                </tr>

            `
            )
            .join("");

}


/* ==================================================
   RECENT APPOINTMENTS
================================================== */

function renderRecent(
    bookings,
    table
) {

    if (!table) return;


    if (!bookings.length) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    No appointments yet.
                </td>
            </tr>
        `;

        return;

    }


    const recent =
        bookings.slice(
            0,
            5
        );


    table.innerHTML =
        recent
            .map(
                booking => `

                <tr>

                    <td>
                        ${escapeHTML(
                            booking.customer_name
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            booking.service_name
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            booking.booking_date
                        )}
                    </td>

                    <td>
                        ${formatTime(
                            booking.booking_time
                        )}
                    </td>

                    <td>
                        <span
                            class="status-badge status-${booking.status}"
                        >
                            ${escapeHTML(
                                booking.status
                            )}
                        </span>
                    </td>

                </tr>

            `
            )
            .join("");

}


/* ==================================================
   CHANGE BOOKING STATUS
================================================== */

async function changeStatus(
    bookingId,
    status
) {

    try {

        const response =
            await fetch(
                `${API}/bookings/${bookingId}/status`,
                {

                    method:
                        "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({
                            status
                        })

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthError();

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Status update failed"
            );

        }


        showToast(
            "Appointment status updated"
        );


        loadBookings();


    } catch (error) {

        console.error(error);


        showToast(
            "Failed to update status"
        );

    }

}


/* ==================================================
   SERVICES
================================================== */

let servicesData = [];

let editingServiceId = null;


async function loadServices() {

    const grid =
        document.getElementById(
            "servicesAdminGrid"
        );


    if (!grid) return;


    grid.innerHTML = `
        <div class="admin-loading">
            Loading services...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API}/services`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load services"
            );

        }


        const services =
            await response.json();


        servicesData =
            services;


        const totalServices =
            document.getElementById(
                "totalServices"
            );


        if (totalServices) {

            totalServices.textContent =
                services.length;

        }


        if (!services.length) {

            grid.innerHTML = `
                <div class="admin-loading">
                    No services found.
                </div>
            `;

            return;

        }


        grid.innerHTML =
            services
                .map(
                    service => {

                        const active =
                            Number(
                                service.is_active
                            ) === 1;


                        return `

                        <div
                            class="
                                service-admin-card
                                ${
                                    !active
                                        ? "service-inactive"
                                        : ""
                                }
                            "
                        >

                            <span class="top-label">
                                SERVICE #${service.id}
                            </span>

                            <h3>
                                ${escapeHTML(
                                    service.name
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    service.description ||
                                    ""
                                )}
                            </p>

                            <div class="service-details">

                                <span>
                                    ₹${Number(
                                        service.price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </span>

                                <span>
                                    ${service.duration}
                                    min
                                </span>

                                <span
                                    class="
                                        ${
                                            active
                                                ? "service-active"
                                                : "service-disabled"
                                        }
                                    "
                                >
                                    ${
                                        active
                                            ? "Active"
                                            : "Inactive"
                                    }
                                </span>

                            </div>

                            <div
                                class="
                                    service-admin-bottom
                                "
                            >

                                <strong
                                    class="
                                        service-admin-price
                                    "
                                >
                                    ₹${Number(
                                        service.price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                                <div
                                    class="
                                        service-actions
                                    "
                                >

                                    <button
                                        class="edit-service"
                                        onclick="
                                            editService(
                                                ${service.id}
                                            )
                                        "
                                    >
                                        Edit
                                    </button>

                                    <button
                                        class="
                                            ${
                                                active
                                                    ? "disable-service"
                                                    : "enable-service"
                                            }
                                        "
                                        onclick="
                                            toggleService(
                                                ${service.id}
                                            )
                                        "
                                    >
                                        ${
                                            active
                                                ? "Disable"
                                                : "Enable"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>

                        `;

                    }
                )
                .join("");


    } catch (error) {

        console.error(error);


        grid.innerHTML = `
            <div class="admin-loading">
                Failed to load services.
            </div>
        `;

    }

}


function openServiceModal() {

    editingServiceId =
        null;


    const title =
        document.getElementById(
            "serviceModalTitle"
        );


    const submit =
        document.getElementById(
            "serviceSubmitBtn"
        );


    const form =
        document.getElementById(
            "serviceForm"
        );


    const active =
        document.getElementById(
            "serviceActive"
        );


    const id =
        document.getElementById(
            "serviceId"
        );


    if (title) {

        title.textContent =
            "Add Service";

    }


    if (submit) {

        submit.textContent =
            "Add Service";

    }


    if (form) {

        form.reset();

    }


    if (active) {

        active.checked =
            true;

    }


    if (id) {

        id.value =
            "";

    }


    const modal =
        document.getElementById(
            "serviceModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


function closeServiceModal() {

    const modal =
        document.getElementById(
            "serviceModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


function editService(
    serviceId
) {

    const service =
        servicesData.find(
            item =>
                Number(item.id) ===
                Number(serviceId)
        );


    if (!service) {

        showToast(
            "Service not found"
        );

        return;

    }


    editingServiceId =
        service.id;


    document.getElementById(
        "serviceModalTitle"
    ).textContent =
        "Edit Service";


    document.getElementById(
        "serviceSubmitBtn"
    ).textContent =
        "Save Changes";


    document.getElementById(
        "serviceId"
    ).value =
        service.id;


    document.getElementById(
        "serviceName"
    ).value =
        service.name || "";


    document.getElementById(
        "serviceDescription"
    ).value =
        service.description || "";


    document.getElementById(
        "servicePrice"
    ).value =
        service.price || "";


    document.getElementById(
        "serviceDuration"
    ).value =
        service.duration || "";


    document.getElementById(
        "serviceImage"
    ).value =
        service.image_url || "";


    document.getElementById(
        "serviceActive"
    ).checked =
        Number(
            service.is_active
        ) === 1;


    document.getElementById(
        "serviceModal"
    ).classList.add(
        "show"
    );

}


const serviceForm =
    document.getElementById(
        "serviceForm"
    );


if (serviceForm) {

    serviceForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                document.getElementById(
                    "serviceName"
                ).value.trim();


            const description =
                document.getElementById(
                    "serviceDescription"
                ).value.trim();


            const price =
                document.getElementById(
                    "servicePrice"
                ).value;


            const duration =
                document.getElementById(
                    "serviceDuration"
                ).value;


            const image_url =
                document.getElementById(
                    "serviceImage"
                ).value.trim();


            const is_active =
                document.getElementById(
                    "serviceActive"
                ).checked;


            const payload = {

                name,
                description,
                price,
                duration,
                image_url,
                is_active

            };


            const isEditing =
                editingServiceId !== null;


            const url =
                isEditing
                    ? `${API}/admin/services/${editingServiceId}`
                    : `${API}/admin/services`;


            try {

                const response =
                    await fetch(
                        url,
                        {

                            method:
                                isEditing
                                    ? "PATCH"
                                    : "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify(
                                    payload
                                )

                        }
                    );


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    handleAuthError();

                    return;

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to save service"
                    );

                }


                showToast(
                    isEditing
                        ? "Service updated successfully"
                        : "Service added successfully"
                );


                closeServiceModal();


                loadServices();


            } catch (error) {

                console.error(error);


                showToast(
                    error.message ||
                    "Failed to save service"
                );

            }

        }
    );

}


async function toggleService(
    serviceId
) {

    const service =
        servicesData.find(
            item =>
                Number(item.id) ===
                Number(serviceId)
        );


    if (!service) {

        showToast(
            "Service not found"
        );

        return;

    }


    const active =
        Number(
            service.is_active
        ) === 1;


    const action =
        active
            ? "disable"
            : "enable";


    const confirmed =
        confirm(
            `Are you sure you want to ${action} "${service.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/admin/services/${serviceId}/toggle`,
                {

                    method:
                        "PATCH",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthError();

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to change service status"
            );

        }


        showToast(
            active
                ? "Service disabled"
                : "Service enabled"
        );


        loadServices();


    } catch (error) {

        console.error(error);


        showToast(
            error.message ||
            "Failed to change service status"
        );

    }

}

/* =====================================================
   REVIEWS MANAGEMENT
===================================================== */


const adminToken =
    localStorage.getItem("velora_admin_token");


/* =====================================================
   AUTH HEADER
===================================================== */

function getAuthHeaders() {

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
    };

}


/* =====================================================
   ELEMENTS
===================================================== */

const reviewsGrid =
    document.getElementById("reviewsAdminGrid");

const addReviewBtn =
    document.getElementById("addReviewBtn");

const reviewModal =
    document.getElementById("reviewModal");

const closeReviewModal =
    document.getElementById("closeReviewModal");

const reviewForm =
    document.getElementById("reviewForm");

const reviewModalTitle =
    document.getElementById("reviewModalTitle");

const reviewId =
    document.getElementById("reviewId");

const reviewAuthor =
    document.getElementById("reviewAuthor");

const reviewRating =
    document.getElementById("reviewRating");

const reviewSource =
    document.getElementById("reviewSource");

const reviewText =
    document.getElementById("reviewText");

const totalReviews =
    document.getElementById("totalReviews");

const averageRating =
    document.getElementById("averageRating");

const activeReviews =
    document.getElementById("activeReviews");


/* =====================================================
   LOAD REVIEWS
===================================================== */

async function loadAdminReviews() {

    if (!reviewsGrid) return;

    try {

        const response = await fetch(
            `${API}/admin/reviews`,
            {
                headers: getAuthHeaders()
            }
        );


        if (response.status === 401) {

            localStorage.removeItem(
                "velora_admin_token"
            );

            localStorage.removeItem(
                "velora_admin"
            );

            window.location.href =
                "admin-login.html";

            return;
        }


        const reviews =
            await response.json();


        if (!response.ok) {

            throw new Error(
                reviews.message ||
                "Failed to load reviews"
            );

        }


        renderAdminReviews(reviews);

    } catch (error) {

        console.error(
            "Review loading error:",
            error
        );

        reviewsGrid.innerHTML = `
            <div class="admin-loading">
                Failed to load reviews.
            </div>
        `;

    }

}


/* =====================================================
   RENDER REVIEWS
===================================================== */

function renderAdminReviews(reviews) {

    if (!reviews.length) {

        reviewsGrid.innerHTML = `
            <div class="admin-loading">
                No reviews found.
            </div>
        `;

        updateReviewStats([]);

        return;
    }


    reviewsGrid.innerHTML =
        reviews.map(review => {

            const rating =
                Number(review.rating || 0).toFixed(1);


            const active =
                Number(review.is_active) === 1;


            const date =
                review.created_at
                    ? new Date(
                        review.created_at
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "";


            return `

                <article
                    class="admin-review-card"
                    data-id="${review.id}"
                >

                    <div class="review-card-top">

                        <div class="review-customer">

                            <h3>
                                ${escapeHTML(
                                    review.author
                                )}
                            </h3>

                            <span class="review-source">
                                ${escapeHTML(
                                    review.source ||
                                    "Demo"
                                )}
                            </span>

                        </div>


                        <div class="review-rating">
                            ⭐ ${rating}
                        </div>

                    </div>


                    <p class="review-card-text">
                        ${escapeHTML(
                            review.review_text
                        )}
                    </p>


                    <div class="review-card-bottom">

                        <span
                            class="review-status
                            ${active
                                ? "active"
                                : "inactive"}"
                        >
                            ${active
                                ? "● Active"
                                : "● Inactive"}
                        </span>


                        <span class="review-date">
                            ${date}
                        </span>

                    </div>


                    <div class="review-actions">

                        <button
                            class="review-action-btn"
                            onclick="editReview(${review.id})"
                        >
                            Edit
                        </button>


                        <button
                            class="review-action-btn"
                            onclick="toggleReviewStatus(
                                ${review.id},
                                ${active}
                            )"
                        >
                            ${active
                                ? "Disable"
                                : "Activate"}
                        </button>


                        <button
                            class="review-action-btn delete"
                            onclick="deleteReview(
                                ${review.id}
                            )"
                        >
                            Delete
                        </button>

                    </div>

                </article>

            `;

        }).join("");


    updateReviewStats(reviews);

}


/* =====================================================
   REVIEW STATS
===================================================== */

function updateReviewStats(reviews) {

    if (!reviews.length) {

        totalReviews.textContent = "0";
        averageRating.textContent = "0.0 ⭐";
        activeReviews.textContent = "0";

        return;
    }


    const active =
        reviews.filter(
            review =>
                Number(review.is_active) === 1
        );


    const ratingTotal =
        reviews.reduce(
            (sum, review) =>
                sum + Number(review.rating || 0),
            0
        );


    const average =
        ratingTotal / reviews.length;


    totalReviews.textContent =
        reviews.length;


    averageRating.textContent =
        `${average.toFixed(1)} ⭐`;


    activeReviews.textContent =
        active.length;

}


/* =====================================================
   OPEN ADD MODAL
===================================================== */

if (addReviewBtn) {

    addReviewBtn.addEventListener(
        "click",
        () => {

            reviewForm.reset();

            reviewId.value = "";

            reviewSource.value = "Demo";

            reviewModalTitle.textContent =
                "Add Review";

            reviewModal.classList.add("show");

        }
    );

}


/* =====================================================
   CLOSE MODAL
===================================================== */

if (closeReviewModal) {

    closeReviewModal.addEventListener(
        "click",
        () => {

            reviewModal.classList.remove(
                "show"
            );

        }
    );

}


/* =====================================================
   CLICK OUTSIDE MODAL
===================================================== */

if (reviewModal) {

    reviewModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                reviewModal
            ) {

                reviewModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =====================================================
   ADD / UPDATE REVIEW
===================================================== */

if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const id =
                reviewId.value;


            const data = {

                author:
                    reviewAuthor.value.trim(),

                rating:
                    Number(
                        reviewRating.value
                    ),

                source:
                    reviewSource.value.trim() ||
                    "Demo",

                review_text:
                    reviewText.value.trim()

            };


            if (
                !data.author ||
                !data.rating ||
                !data.review_text
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;
            }


            try {

                const url =
                    id
                        ? `${API}/api/admin/reviews/${id}`
                        : `${API}/api/admin/reviews`;


                const method =
                    id
                        ? "PATCH"
                        : "POST";


                const response =
                    await fetch(
                        url,
                        {
                            method,
                            headers:
                                getAuthHeaders(),
                            body:
                                JSON.stringify(data)
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Unable to save review"
                    );

                }


                reviewModal.classList.remove(
                    "show"
                );


                await loadAdminReviews();


                alert(
                    id
                        ? "Review updated successfully."
                        : "Review added successfully."
                );


            } catch (error) {

                console.error(
                    "Save review error:",
                    error
                );

                alert(
                    error.message
                );

            }

        }
    );

}


/* =====================================================
   EDIT REVIEW
===================================================== */

async function editReview(id) {

    try {

        const response =
            await fetch(
                `${API}/api/admin/reviews`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        const reviews =
            await response.json();


        const review =
            reviews.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!review) {

            alert(
                "Review not found."
            );

            return;
        }


        reviewId.value =
            review.id;

        reviewAuthor.value =
            review.author || "";

        reviewRating.value =
            review.rating;

        reviewSource.value =
            review.source || "Demo";

        reviewText.value =
            review.review_text || "";


        reviewModalTitle.textContent =
            "Edit Review";


        reviewModal.classList.add(
            "show"
        );


    } catch (error) {

        console.error(error);

        alert(
            "Unable to open review."
        );

    }

}


/* =====================================================
   ACTIVATE / DEACTIVATE
===================================================== */

async function toggleReviewStatus(
    id,
    currentlyActive
) {

    const action =
        currentlyActive
            ? "disable"
            : "activate";


    const confirmAction =
        confirm(
            `Are you sure you want to ${action} this review?`
        );


    if (!confirmAction) return;


    try {

        const response =
            await fetch(
                `${API}/admin/reviews/${id}/status`,
                {
                    method: "PATCH",
                    headers:
                        getAuthHeaders(),
                    body:
                        JSON.stringify({
                            is_active:
                                !currentlyActive
                        })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to update status"
            );

        }


        await loadAdminReviews();


    } catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


/* =====================================================
   DELETE REVIEW
===================================================== */

async function deleteReview(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this review?"
        );


    if (!confirmDelete) return;


    try {

        const response =
            await fetch(
                `${API}/admin/reviews/${id}`,
                {
                    method: "DELETE",
                    headers:
                        getAuthHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to delete review"
            );

        }


        await loadAdminReviews();


    } catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   INITIAL LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAdminReviews();

    }
);


/* ==================================================
   BUSINESS SETTINGS
================================================== */

const settingsForm =
    document.getElementById(
        "settingsForm"
    );


const settingsBusinessName =
    document.getElementById(
        "settingsBusinessName"
    );


const settingsTagline =
    document.getElementById(
        "settingsTagline"
    );


const settingsPhone =
    document.getElementById(
        "settingsPhone"
    );


const settingsWhatsapp =
    document.getElementById(
        "settingsWhatsapp"
    );


const settingsEmail =
    document.getElementById(
        "settingsEmail"
    );


const settingsAddress =
    document.getElementById(
        "settingsAddress"
    );


const settingsOpening =
    document.getElementById(
        "settingsOpening"
    );


const settingsClosing =
    document.getElementById(
        "settingsClosing"
    );


const settingsInstagram =
    document.getElementById(
        "settingsInstagram"
    );


const settingsFacebook =
    document.getElementById(
        "settingsFacebook"
    );


const settingsMap =
    document.getElementById(
        "settingsMap"
    );


const settingsLogo =
    document.getElementById(
        "settingsLogoFile"
    );


async function loadSettings() {

    if (!settingsForm) return;


    try {

        const response =
            await fetch(
                `${API}/admin/business-settings`,
                {

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthError();

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load settings"
            );

        }


        const settings =
            await response.json();


        if (!settings) {

            return;

        }


        settingsBusinessName.value =
            settings.business_name || "";


        settingsTagline.value =
            settings.tagline || "";


        settingsPhone.value =
            settings.phone || "";


        settingsWhatsapp.value =
            settings.whatsapp || "";


        settingsEmail.value =
            settings.email || "";


        settingsAddress.value =
            settings.address || "";


        settingsOpening.value =
            settings.opening_time
                ? String(
                    settings.opening_time
                ).substring(0, 5)
                : "";


        settingsClosing.value =
            settings.closing_time
                ? String(
                    settings.closing_time
                ).substring(0, 5)
                : "";


        settingsInstagram.value =
            settings.instagram_url || "";


        settingsFacebook.value =
            settings.facebook_url || "";


        settingsMap.value =
            settings.map_url || "";


        settingsLogoFile =
            settingsLogoFile.logo_url || "";


    } catch (error) {

        console.error(error);


        showToast(
            "Failed to load business settings"
        );

    }

}


if (settingsForm) {

    settingsForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const business_name =
                settingsBusinessName.value.trim();


            if (!business_name) {

                showToast(
                    "Business name is required"
                );

                return;

            }


            const payload = {

                business_name,

                tagline:
                    settingsTagline.value.trim(),

                phone:
                    settingsPhone.value.trim(),

                whatsapp:
                    settingsWhatsapp.value.trim(),

                email:
                    settingsEmail.value.trim(),

                address:
                    settingsAddress.value.trim(),

                opening_time:
                    settingsOpening.value,

                closing_time:
                    settingsClosing.value,

                instagram_url:
                    settingsInstagram.value.trim(),

                facebook_url:
                    settingsFacebook.value.trim(),

                map_url:
                    settingsMap.value.trim(),

                logo_url:
                    settingsLogo.value.trim()

            };


            const saveButton =
                document.getElementById(
                    "saveSettingsBtn"
                );


            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";

            }


            try {

                const response =
                    await fetch(
                        `${API}/admin/business-settings`,
                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify(
                                    payload
                                )

                        }
                    );


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    handleAuthError();

                    return;

                }


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Failed to save settings"
                    );

                }


                showToast(
                    "Business settings saved successfully"
                );


            } catch (error) {

                console.error(error);


                showToast(
                    error.message ||
                    "Failed to save settings"
                );

            } finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Save Changes";

                }

            }

        }
    );

}


/* ==================================================
   TOAST
================================================== */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "adminToast"
        );


    const text =
        document.getElementById(
            "adminToastMessage"
        );


    if (!toast || !text) {

        return;

    }


    text.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* ==================================================
   HELPERS
================================================== */

function formatDate(
    date
) {

    if (!date) {

        return "-";

    }


    return new Date(
        date
    ).toLocaleDateString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


function formatTime(
    time
) {

    if (!time) {

        return "-";

    }


    return String(
        time
    ).substring(
        0,
        5
    );

}


function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


function getGalleryImageUrl(
    url
) {

    if (!url) {

        return "";

    }


    if (
        /^https?:\/\//i.test(
            url
        )
    ) {

        return url;

    }


    return `http://localhost:3000${url}`;

}


/* ==================================================
   LOGOUT
================================================== */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "velora_admin_token"
            );


            localStorage.removeItem(
                "velora_admin"
            );


            window.location.href =
                "admin-login.html";

        }
    );

}


/* ==================================================
   GALLERY CRUD
================================================== */

const galleryGrid =
    document.getElementById(
        "galleryAdminGrid"
    );


const galleryModal =
    document.getElementById(
        "galleryModal"
    );


const galleryForm =
    document.getElementById(
        "galleryForm"
    );


const addGalleryBtn =
    document.getElementById(
        "addGalleryBtn"
    );


const closeGalleryModal =
    document.getElementById(
        "closeGalleryModal"
    );


const cancelGalleryBtn =
    document.getElementById(
        "cancelGalleryBtn"
    );


const galleryModalTitle =
    document.getElementById(
        "galleryModalTitle"
    );


const saveGalleryBtn =
    document.getElementById(
        "saveGalleryBtn"
    );


const galleryId =
    document.getElementById(
        "galleryId"
    );


const galleryTitle =
    document.getElementById(
        "galleryTitle"
    );


const galleryCategory =
    document.getElementById(
        "galleryCategory"
    );


const galleryImageFile =
    document.getElementById(
        "galleryImageFile"
    );


const galleryPreview =
    document.getElementById(
        "galleryPreview"
    );


async function loadGallery() {

    if (!galleryGrid) {

        return;

    }


    galleryGrid.innerHTML = `
        <div class="admin-loading">
            Loading gallery...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API}/admin/gallery`,
                {

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthError();

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load gallery"
            );

        }


        const gallery =
            await response.json();


        renderGallery(
            gallery
        );


    } catch (error) {

        console.error(
            error
        );


        galleryGrid.innerHTML = `
            <div class="admin-loading">
                Failed to load gallery.
            </div>
        `;

    }

}


function renderGallery(
    gallery
) {

    if (!gallery.length) {

        galleryGrid.innerHTML = `
            <div class="admin-loading">
                No gallery images found.
            </div>
        `;

        return;

    }


    galleryGrid.innerHTML =
        gallery.map(
            image => `

            <div
                class="
                    gallery-admin-card
                    ${
                        Number(
                            image.is_active
                        ) === 1
                            ? ""
                            : "gallery-inactive"
                    }
                "
            >

                <div class="gallery-admin-image">

                    <img
                        src="${escapeHTML(
                            getGalleryImageUrl(
                                image.image_url
                            )
                        )}"
                        alt="${escapeHTML(
                            image.title
                        )}"
                    >

                    <span class="gallery-status">

                        ${
                            Number(
                                image.is_active
                            ) === 1
                                ? "Active"
                                : "Inactive"
                        }

                    </span>

                </div>


                <div class="gallery-admin-content">

                    <span class="gallery-category">

                        ${escapeHTML(
                            image.category
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            image.title
                        )}

                    </h3>


                    <div class="gallery-admin-actions">

                        <button
                            class="edit-gallery-btn"
                            onclick="
                                editGallery(
                                    ${image.id}
                                )
                            "
                        >
                            Edit
                        </button>


                        <button
                            class="toggle-gallery-btn"
                            onclick="
                                toggleGalleryStatus(
                                    ${image.id},
                                    ${
                                        Number(
                                            image.is_active
                                        ) === 1
                                            ? "false"
                                            : "true"
                                    }
                                )
                            "
                        >

                            ${
                                Number(
                                    image.is_active
                                ) === 1
                                    ? "Deactivate"
                                    : "Activate"
                            }

                        </button>


                        <button
                            class="delete-gallery-btn"
                            onclick="
                                deleteGallery(
                                    ${image.id}
                                )
                            "
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </div>

        `
        ).join("");

}


function openGalleryModal() {

    if (!galleryForm) {

        return;

    }


    galleryForm.reset();


    galleryId.value =
        "";


    galleryModalTitle.textContent =
        "Add Gallery Image";


    saveGalleryBtn.textContent =
        "Add Image";


    galleryPreview.innerHTML = `
        <span>
            Image preview
        </span>
    `;


    galleryModal.classList.add(
        "show"
    );

}


function closeGalleryModalFunc() {

    if (!galleryModal) {

        return;

    }


    galleryModal.classList.remove(
        "show"
    );

}


if (addGalleryBtn) {

    addGalleryBtn.addEventListener(
        "click",
        openGalleryModal
    );

}


if (closeGalleryModal) {

    closeGalleryModal.addEventListener(
        "click",
        closeGalleryModalFunc
    );

}


if (cancelGalleryBtn) {

    cancelGalleryBtn.addEventListener(
        "click",
        closeGalleryModalFunc
    );

}


if (galleryImageFile) {

    galleryImageFile.addEventListener(
        "change",
        () => {

            const file =
                galleryImageFile.files[0];


            if (!file) {

                galleryPreview.innerHTML = `
                    <span>
                        Image preview
                    </span>
                `;

                return;

            }


            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                galleryImageFile.value =
                    "";


                showToast(
                    "Only JPG, PNG and WEBP images are allowed"
                );

                return;

            }


            const maxSize =
                5 * 1024 * 1024;


            if (
                file.size >
                maxSize
            ) {

                galleryImageFile.value =
                    "";


                showToast(
                    "Image must be smaller than 5MB"
                );

                return;

            }


            const imageURL =
                URL.createObjectURL(
                    file
                );


            galleryPreview.innerHTML = `
                <img
                    src="${imageURL}"
                    alt="Selected image preview"
                >
            `;

        }
    );

}


if (galleryForm) {

    galleryForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const id =
                galleryId.value;


            const title =
                galleryTitle.value.trim();


            const category =
                galleryCategory.value.trim();


            const selectedFile =
                galleryImageFile &&
                galleryImageFile.files.length
                    ? galleryImageFile.files[0]
                    : null;


            const isEdit =
                Boolean(id);


            if (
                !title ||
                !category
            ) {

                showToast(
                    "Please fill all fields"
                );

                return;

            }


            if (
                !isEdit &&
                !selectedFile
            ) {

                showToast(
                    "Please select an image"
                );

                return;

            }


            if (selectedFile) {

                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                if (
                    !allowedTypes.includes(
                        selectedFile.type
                    )
                ) {

                    showToast(
                        "Only JPG, PNG and WEBP images are allowed"
                    );

                    return;

                }


                const maxSize =
                    5 * 1024 * 1024;


                if (
                    selectedFile.size >
                    maxSize
                ) {

                    showToast(
                        "Image must be smaller than 5MB"
                    );

                    return;

                }

            }


            const formData =
                new FormData();


            formData.append(
                "title",
                title
            );


            formData.append(
                "category",
                category
            );


            if (selectedFile) {

                formData.append(
                    "image",
                    selectedFile
                );

            }


            const url =
                isEdit
                    ? `${API}/admin/gallery/${id}`
                    : `${API}/admin/gallery`;


            saveGalleryBtn.disabled =
                true;


            saveGalleryBtn.textContent =
                "Uploading...";


            try {

                const response =
                    await fetch(
                        url,
                        {

                            method:
                                isEdit
                                    ? "PATCH"
                                    : "POST",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                formData

                        }
                    );


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    handleAuthError();

                    return;

                }


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Gallery operation failed"
                    );

                }


                showToast(
                    isEdit
                        ? "Gallery updated successfully"
                        : "Gallery image uploaded successfully"
                );


                closeGalleryModalFunc();


                loadGallery();


            } catch (error) {

                console.error(
                    error
                );


                showToast(
                    error.message ||
                    "Gallery operation failed"
                );

            } finally {

                saveGalleryBtn.disabled =
                    false;


                saveGalleryBtn.textContent =
                    isEdit
                        ? "Update Image"
                        : "Add Image";

            }

        }
    );

}


async function editGallery(
    id
) {

    try {

        const response =
            await fetch(
                `${API}/admin/gallery`,
                {

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthError();

            return;

        }


        const gallery =
            await response.json();


        const image =
            gallery.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!image) {

            showToast(
                "Gallery image not found"
            );

            return;

        }


        galleryId.value =
            image.id;


        galleryTitle.value =
            image.title;


        galleryCategory.value =
            image.category;


        galleryImageFile.value =
            "";


        galleryModalTitle.textContent =
            "Edit Gallery Image";


        saveGalleryBtn.textContent =
            "Update Image";


        galleryPreview.innerHTML = `
            <img
                src="${escapeHTML(
                    getGalleryImageUrl(
                        image.image_url
                    )
                )}"
                alt="${escapeHTML(
                    image.title
                )}"
            >

            <span class="current-image-label">
                Current image
            </span>
        `;


        galleryModal.classList.add(
            "show"
        );


    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Failed to open editor"
        );

    }

}


async function toggleGalleryStatus(
    id,
    isActive
) {

    try {

        const active =
            isActive === true ||
            isActive === "true";


        const response =
            await fetch(
                `${API}/admin/gallery/${id}/status`,
                {

                    method:
                        "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            is_active:
                                active

                        })

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthError();

            return;

        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Status update failed"
            );

        }


        showToast(
            active
                ? "Image activated"
                : "Image deactivated"
        );


        loadGallery();


    } catch (error) {

        console.error(
            error
        );


        showToast(
            error.message ||
            "Failed to update image status"
        );

    }

}


async function deleteGallery(
    id
) {

    const confirmed =
        confirm(
            "Remove this gallery image?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/admin/gallery/${id}`,
                {

                    method:
                        "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthError();

            return;

        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Delete failed"
            );

        }


        showToast(
            "Gallery image removed"
        );


        loadGallery();


    } catch (error) {

        console.error(
            error
        );


        showToast(
            error.message ||
            "Failed to remove image"
        );

    }

}

/* =====================================================
   BUSINESS SETTINGS
===================================================== */



/* =====================================================
   LOAD BUSINESS SETTINGS
===================================================== */

async function loadBusinessSettings() {

    if (!settingsForm) return;


    try {

        const response =
            await fetch(
                `${API}/admin/business-settings`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        if (response.status === 401) {

            localStorage.removeItem(
                "velora_admin_token"
            );

            localStorage.removeItem(
                "velora_admin"
            );

            window.location.href =
                "admin-login.html";

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load business settings"
            );

        }


        /* ================================
           FILL FORM
        ================================= */

        settingsBusinessName.value =
            data.business_name || "";

        settingsTagline.value =
            data.tagline || "";

        settingsPhone.value =
            data.phone || "";

        settingsWhatsapp.value =
            data.whatsapp || "";

        settingsEmail.value =
            data.email || "";

        settingsAddress.value =
            data.address || "";

        settingsOpening.value =
            formatTimeForInput(
                data.opening_time
            );

        settingsClosing.value =
            formatTimeForInput(
                data.closing_time
            );

        settingsInstagram.value =
            data.instagram_url || "";

        settingsFacebook.value =
            data.facebook_url || "";

        settingsMap.value =
            data.map_url || "";

        settingsLogo.value =
            data.logo_url || "";


    } catch (error) {

        console.error(
            "Business settings load error:",
            error
        );

        showToast(
            "Failed to load settings"
        );

    }

}


/* =====================================================
   TIME FORMAT
===================================================== */

function formatTimeForInput(time) {

    if (!time) {
        return "";
    }


    /*
       MySQL TIME can return:

       09:00:00
       18:30:00
    */

    return String(time)
        .substring(0, 5);

}


/* =====================================================
   SAVE BUSINESS SETTINGS
===================================================== */

if (settingsForm) {

    settingsForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const businessName =
                settingsBusinessName.value.trim();


            if (!businessName) {

                showToast(
                    "Business name is required"
                );

                settingsBusinessName.focus();

                return;
            }


            const data = {

                business_name:
                    businessName,

                tagline:
                    settingsTagline.value.trim(),

                phone:
                    settingsPhone.value.trim(),

                whatsapp:
                    settingsWhatsapp.value.trim(),

                email:
                    settingsEmail.value.trim(),

                address:
                    settingsAddress.value.trim(),

                opening_time:
                    settingsOpening.value || null,

                closing_time:
                    settingsClosing.value || null,

                instagram_url:
                    settingsInstagram.value.trim(),

                facebook_url:
                    settingsFacebook.value.trim(),

                map_url:
                    settingsMap.value.trim(),

                logo_url:
                    settingsLogo.value.trim()

            };


            try {

                saveSettingsBtn.disabled = true;

                saveSettingsBtn.textContent =
                    "Saving...";


                const response =
                    await fetch(
                        `${API}/admin/business-settings`,
                        {
                            method: "PUT",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify(data)
                        }
                    );


                const result =
                    await response.json();


                if (response.status === 401) {

                    localStorage.removeItem(
                        "velora_admin_token"
                    );

                    localStorage.removeItem(
                        "velora_admin"
                    );

                    window.location.href =
                        "admin-login.html";

                    return;
                }


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Failed to save settings"
                    );

                }


                showToast(
                    "Business settings saved successfully"
                );


                await loadBusinessSettings();


            } catch (error) {

                console.error(
                    "Business settings save error:",
                    error
                );

                showToast(
                    error.message ||
                    "Failed to save settings"
                );

            } finally {

                saveSettingsBtn.disabled = false;

                saveSettingsBtn.textContent =
                    "Save Changes";

            }

        }
    );

}


/* =====================================================
   LOAD SETTINGS WHEN ADMIN PAGE OPENS
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadBusinessSettings();

    }
);


/* ==================================================
   INITIAL LOAD
================================================== */

loadBookings();

loadServices();

loadGallery();

loadAdminReviews();

loadSettings();