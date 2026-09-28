/* =========================================================
   VELORA STUDIO - FRONTEND JAVASCRIPT
   ========================================================= */


/* ================= GLOBAL ================= */

const API = "http://localhost:3000/api";
const SERVER_URL = "http://localhost:3000";

const loader = document.getElementById("loader");
const navLinks = document.getElementById("navLinks");
const menuBtn = document.getElementById("menuBtn");

const servicesGrid = document.getElementById("servicesGrid");
const reviewsGrid = document.getElementById("reviewsGrid");

const bookingModal = document.getElementById("bookingModal");
const successModal = document.getElementById("successModal");
const ownerModal = document.getElementById("ownerModal");

const bookingForm = document.getElementById("bookingForm");
const bookingService = document.getElementById("bookingService");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

let services = [];


/* =========================================================
   PAGE LOAD
   ========================================================= */

window.addEventListener("load", async () => {

    // Premium loader effect
    setTimeout(() => {

        if (loader) {
            loader.classList.add("hidden");
        }

    }, 700);


    /*
       IMPORTANT:
       Business settings FIRST load honge.
       Iske baad services/reviews/gallery load honge.
    */

    await loadBusinessSettings();

    await loadServices();
    await loadReviews();
    await loadGallery();


    // Other page setup
    setupRevealAnimations();
    setMinimumBookingDate();

});


/* =========================================================
   MOBILE MENU
   ========================================================= */

if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("active");

        if (navLinks.classList.contains("active")) {

            menuBtn.textContent = "×";

        } else {

            menuBtn.textContent = "☰";

        }

    });

}


/* =========================================================
   CLOSE MOBILE MENU
   ========================================================= */

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        if (navLinks) {
            navLinks.classList.remove("active");
        }

        if (menuBtn) {
            menuBtn.textContent = "☰";
        }

    });

});


/* =========================================================
   BUSINESS SETTINGS
   ========================================================= */

async function loadBusinessSettings() {

    try {

        const response =
            await fetch(`${API}/business-settings`);


        if (!response.ok) {

            throw new Error(
                `Business settings request failed: ${response.status}`
            );

        }


        const settings =
            await response.json();


        // console.log(
        //     "Business settings loaded:",
        //     settings
        // );


        if (!settings) {
            return;
        }


        /* ================= BUSINESS NAME ================= */

        const businessNames =
            document.querySelectorAll(".business-name");


        businessNames.forEach(element => {

            if (settings.business_name) {

                element.textContent =
                    settings.business_name;

            }

        });


        /* ================= TAGLINE ================= */

        const taglineElements =
            document.querySelectorAll(".business-tagline");


        taglineElements.forEach(element => {

            if (settings.tagline) {

                element.textContent =
                    settings.tagline;

            }

        });


        /* ================= PHONE ================= */

        const phoneElements =
            document.querySelectorAll(".business-phone");


        phoneElements.forEach(element => {

            if (settings.phone) {

                element.textContent =
                    settings.phone;

            }

        });


        /* ================= PHONE LINK ================= */

        const phoneLinks =
            document.querySelectorAll(".business-phone-link");


        phoneLinks.forEach(element => {

            if (settings.phone) {

                element.href =
                    `tel:${settings.phone}`;

            }

        });


        /* ================= WHATSAPP ================= */

        const whatsappElements =
            document.querySelectorAll(".business-whatsapp");


        whatsappElements.forEach(element => {

            if (settings.whatsapp) {

                element.href =
                    `https://wa.me/${cleanPhoneNumber(settings.whatsapp)}`;

                element.target =
                    "_blank";

                element.rel =
                    "noopener noreferrer";

            }

        });


        /* ================= ADDRESS ================= */

        const addressElements =
            document.querySelectorAll(".business-address");


        addressElements.forEach(element => {

            if (settings.address) {

                element.textContent =
                    settings.address;

            }

        });


        /* ================= GOOGLE MAP ================= */

        const mapElements =
            document.querySelectorAll(".business-map");


        mapElements.forEach(element => {

            if (settings.map_url) {

                element.href =
                    settings.map_url;

                element.target =
                    "_blank";

                element.rel =
                    "noopener noreferrer";

            }

        });


        /* ================= INSTAGRAM ================= */

        const instagramElements =
            document.querySelectorAll(".business-instagram");


        instagramElements.forEach(element => {

            if (settings.instagram_url) {

                element.href =
                    settings.instagram_url;

                element.target =
                    "_blank";

                element.rel =
                    "noopener noreferrer";

            }

        });


        /* ================= FACEBOOK ================= */

        const facebookElements =
            document.querySelectorAll(".business-facebook");


        facebookElements.forEach(element => {

            if (settings.facebook_url) {

                element.href =
                    settings.facebook_url;

                element.target =
                    "_blank";

                element.rel =
                    "noopener noreferrer";

            }

        });


        /* ================= LOGO ================= */

        /* ================= LOGO ================= */

        const logoImages =
            document.querySelectorAll(".business-logo");

        const logoFallbacks =
            document.querySelectorAll(".logo-fallback");

        logoImages.forEach(element => {

            if (settings.logo_url) {

                const logoUrl =
                    getAssetUrl(settings.logo_url);

                element.src = logoUrl;

                element.style.display = "block";


                element.onload = () => {

                    logoFallbacks.forEach(fallback => {

                        fallback.style.display = "none";

                    });

                };


                element.onerror = () => {

                    console.error(
                        "Unable to load business logo:",
                        logoUrl
                    );

                    element.style.display = "none";

                };

            }

        });

        /* ================= OPENING TIME ================= */

        const openingTime =
            document.getElementById(
                "businessOpeningTime"
            );


        if (
            openingTime &&
            settings.opening_time
        ) {

            openingTime.textContent =
                formatBusinessTime(
                    settings.opening_time
                );

        }


        /* ================= FOOTER BUSINESS NAME ================= */

        const footerBusinessName =
            document.getElementById(
                "footerBusinessName"
            );


        if (footerBusinessName) {

            footerBusinessName.textContent =
                settings.business_name ||
                "Velora Studio";

        }


        /*
           Optional:
           Browser tab title bhi business name ke according
           change ho jayega.
        */

        if (settings.business_name) {

            document.title =
                `${settings.business_name} | Premium Salon`;

        }


    } catch (error) {

        console.error(
            "Business settings loading error:",
            error
        );

    }

}


/* =========================================================
   ASSET URL HELPER
   ========================================================= */

function getAssetUrl(url) {

    if (!url) {
        return "";
    }


    /*
       Agar already full URL hai:
       https://...
       http://...
    */

    if (
        /^https?:\/\//i.test(url)
    ) {

        return url;

    }


    /*
       Agar database mein:
       /uploads/logo/logo.png

       save hai to:
       http://localhost:3000/uploads/logo/logo.png
    */

    return (
        SERVER_URL +
        (
            url.startsWith("/")
                ? url
                : `/${url}`
        )
    );

}


/* =========================================================
   CLEAN PHONE NUMBER
   ========================================================= */

function cleanPhoneNumber(phone) {

    if (!phone) {
        return "";
    }


    return String(phone)
        .replace(/\D/g, "");

}


/* =========================================================
   BUSINESS TIME FORMAT
   ========================================================= */

function formatBusinessTime(time) {

    if (!time) {
        return "";
    }


    const parts =
        String(time).split(":");


    let hour =
        Number(parts[0]);


    const minute =
        parts[1] || "00";


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${period}`;

}


/* =========================================================
   SERVICES
   ========================================================= */

async function loadServices() {

    if (!servicesGrid) {
        return;
    }


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


        services =
            await response.json();


        renderServices(
            services
        );


        populateServiceSelect(
            services
        );


    } catch (error) {

        console.error(error);


        servicesGrid.innerHTML = `

            <div class="loading-card">

                <p>
                    Unable to load services.
                </p>

                <small>
                    Please try again.
                </small>

            </div>

        `;

    }

}


/* =========================================================
   RENDER SERVICES
   ========================================================= */

function renderServices(data) {

    if (!servicesGrid) {
        return;
    }


    if (!data.length) {

        servicesGrid.innerHTML = `

            <div class="loading-card">

                <p>
                    No services available.
                </p>

            </div>

        `;

        return;

    }


    servicesGrid.innerHTML =
        data.map(
            (service, index) => {

                return `

                    <article
                        class="service-card reveal"
                    >

                        <span
                            class="service-number"
                        >
                            ${String(
                                index + 1
                            ).padStart(2, "0")}
                        </span>


                        <h3>
                            ${escapeHTML(
                                service.name
                            )}
                        </h3>


                        <p>
                            ${escapeHTML(
                                service.description ||
                                "Premium salon service."
                            )}
                        </p>


                        <div
                            class="service-bottom"
                        >

                            <div>

                                <div
                                    class="service-price"
                                >
                                    ₹${Number(
                                        service.price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </div>


                                <div
                                    class="service-duration"
                                >
                                    ${service.duration}
                                    minutes
                                </div>

                            </div>

                        </div>


                        <button
                            class="service-book"
                            onclick="openBooking(${service.id})"
                        >
                            Book This Service
                        </button>

                    </article>

                `;

            }
        ).join("");


    setupRevealAnimations();

}


/* =========================================================
   SERVICE SELECT
   ========================================================= */

function populateServiceSelect(data) {

    if (!bookingService) {
        return;
    }


    bookingService.innerHTML = `

        <option value="">
            Select a service
        </option>

    `;


    data.forEach(service => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            service.id;


        option.textContent =
            `${service.name} — ₹${Number(
                service.price
            ).toLocaleString("en-IN")}`;


        bookingService.appendChild(
            option
        );

    });

}


/* =========================================================
   REVIEWS
   ========================================================= */

async function loadReviews() {

    if (!reviewsGrid) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/reviews`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load reviews"
            );

        }


        const reviews =
            await response.json();


        renderReviews(
            reviews
        );


    } catch (error) {

        console.error(error);


        reviewsGrid.innerHTML = `

            <div class="loading-card">

                <p>
                    Unable to load reviews.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   RENDER REVIEWS
   ========================================================= */

function renderReviews(reviews) {

    if (!reviewsGrid) {
        return;
    }


    if (!reviews.length) {

        reviewsGrid.innerHTML = `

            <div class="loading-card">

                <p>
                    No reviews available.
                </p>

            </div>

        `;

        return;

    }


    reviewsGrid.innerHTML =
        reviews.map(review => {

            const rating =
                Number(
                    review.rating
                );


            return `

                <article
                    class="review-card reveal"
                >

                    <div
                        class="review-stars"
                    >
                        ${"★".repeat(
                            Math.round(rating)
                        )}
                    </div>


                    <p
                        class="review-text"
                    >
                        "${escapeHTML(
                            review.review_text
                        )}"
                    </p>


                    <div
                        class="review-author"
                    >

                        <div
                            class="review-avatar"
                        >
                            ${escapeHTML(
                                review.author
                                    .charAt(0)
                                    .toUpperCase()
                            )}
                        </div>


                        <div>

                            <strong>
                                ${escapeHTML(
                                    review.author
                                )}
                            </strong>


                            <span
                                class="review-source"
                            >
                                ${escapeHTML(
                                    review.source ||
                                    "Client"
                                )}
                            </span>

                        </div>

                    </div>

                </article>

            `;

        }).join("");


    setupRevealAnimations();

}


/* =========================================================
   BOOKING MODAL
   ========================================================= */

function openBooking(
    serviceId = null
) {

    if (!bookingModal) {
        return;
    }


    bookingModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    if (
        serviceId &&
        bookingService
    ) {

        bookingService.value =
            serviceId;

    }

}


/* =========================================================
   CLOSE BOOKING
   ========================================================= */

function closeBooking() {

    if (!bookingModal) {
        return;
    }


    bookingModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   BOOKING OUTSIDE CLICK
   ========================================================= */

if (bookingModal) {

    bookingModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                bookingModal
            ) {

                closeBooking();

            }

        }
    );

}


/* =========================================================
   SUCCESS MODAL
   ========================================================= */

function openSuccess(message) {

    const successMessage =
        document.getElementById(
            "successMessage"
        );


    if (successMessage) {

        successMessage.textContent =
            message;

    }


    if (successModal) {

        successModal.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";

    }

}


/* =========================================================
   CLOSE SUCCESS
   ========================================================= */

function closeSuccess() {

    if (!successModal) {
        return;
    }


    successModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   BOOKING FORM
   ========================================================= */

if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const submitButton =
                document.getElementById(
                    "bookingSubmit"
                );


            const name =
                document
                    .getElementById(
                        "customerName"
                    )
                    ?.value.trim();


            const phone =
                document
                    .getElementById(
                        "customerPhone"
                    )
                    ?.value.trim();


            const email =
                document
                    .getElementById(
                        "customerEmail"
                    )
                    ?.value.trim();


            const serviceId =
                bookingService?.value;


            const bookingDate =
                document
                    .getElementById(
                        "bookingDate"
                    )
                    ?.value;


            const bookingTime =
                document
                    .getElementById(
                        "bookingTime"
                    )
                    ?.value;


            const notes =
                document
                    .getElementById(
                        "bookingNotes"
                    )
                    ?.value.trim();


            if (
                !name ||
                !phone ||
                !serviceId ||
                !bookingDate ||
                !bookingTime
            ) {

                showToast(
                    "Please fill all required fields."
                );

                return;

            }


            if (
                phone.length < 10
            ) {

                showToast(
                    "Please enter a valid phone number."
                );

                return;

            }


            const originalText =
                submitButton
                    ? submitButton.innerHTML
                    : "Book Appointment";


            if (submitButton) {

                submitButton.disabled =
                    true;


                submitButton.innerHTML = `

                    <span
                        class="button-spinner"
                    ></span>

                    Booking...

                `;

            }


            try {

                const response =
                    await fetch(
                        `${API}/bookings`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name,

                                    phone,

                                    email,

                                    service_id:
                                        Number(
                                            serviceId
                                        ),

                                    booking_date:
                                        bookingDate,

                                    booking_time:
                                        bookingTime,

                                    notes

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Booking failed"
                    );

                }


                bookingForm.reset();

                closeBooking();


                openSuccess(
                    `Your booking #${data.booking_id} has been received. We will confirm your appointment shortly.`
                );


            } catch (error) {

                console.error(
                    error
                );


                showToast(
                    error.message ||
                    "Unable to book appointment."
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;


                    submitButton.innerHTML =
                        originalText;

                }

            }

        }
    );

}


/* =========================================================
   MINIMUM BOOKING DATE
   ========================================================= */

function setMinimumBookingDate() {

    const dateInput =
        document.getElementById(
            "bookingDate"
        );


    if (!dateInput) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.min =
        `${year}-${month}-${day}`;

}


/* =========================================================
   OWNER PANEL
   ========================================================= */

function openOwnerPanel() {

    if (!ownerModal) {
        return;
    }


    ownerModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    loadOwnerBookings();

}


/* =========================================================
   CLOSE OWNER PANEL
   ========================================================= */

function closeOwnerPanel() {

    if (!ownerModal) {
        return;
    }


    ownerModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   OWNER MODAL OUTSIDE CLICK
   ========================================================= */

if (ownerModal) {

    ownerModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                ownerModal
            ) {

                closeOwnerPanel();

            }

        }
    );

}


/* =========================================================
   OWNER BOOKINGS
   ========================================================= */

async function loadOwnerBookings() {

    const table =
        document.getElementById(
            "appointmentsTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `

        <tr>

            <td colspan="6">
                Loading appointments...
            </td>

        </tr>

    `;


    try {

        const response =
            await fetch(
                `${API}/bookings`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load bookings"
            );

        }


        const bookings =
            await response.json();


        updateOwnerStats(
            bookings
        );


        renderOwnerBookings(
            bookings
        );


    } catch (error) {

        console.error(
            error
        );


        table.innerHTML = `

            <tr>

                <td colspan="6">
                    Unable to load appointments.
                </td>

            </tr>

        `;

    }

}


/* =========================================================
   OWNER STATS
   ========================================================= */

function updateOwnerStats(
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


    const totalElement =
        document.getElementById(
            "totalBookings"
        );


    const pendingElement =
        document.getElementById(
            "pendingBookings"
        );


    const confirmedElement =
        document.getElementById(
            "confirmedBookings"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (confirmedElement) {

        confirmedElement.textContent =
            confirmed;

    }

}


/* =========================================================
   OWNER TABLE
   ========================================================= */

function renderOwnerBookings(
    bookings
) {

    const table =
        document.getElementById(
            "appointmentsTable"
        );


    if (!table) {
        return;
    }


    if (!bookings.length) {

        table.innerHTML = `

            <tr>

                <td colspan="6">
                    No appointments found.
                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        bookings.map(
            booking => {

                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    booking.customer_name
                                )}
                            </strong>

                            <br>

                            <small>
                                ${escapeHTML(
                                    booking.phone
                                )}
                            </small>

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
                                onchange="changeBookingStatus(
                                    ${booking.id},
                                    this.value
                                )"
                            >

                                <option value="">
                                    Change
                                </option>

                                <option value="pending">
                                    Pending
                                </option>

                                <option value="confirmed">
                                    Confirmed
                                </option>

                                <option value="completed">
                                    Completed
                                </option>

                                <option value="cancelled">
                                    Cancelled
                                </option>

                            </select>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   CHANGE BOOKING STATUS
   ========================================================= */

async function changeBookingStatus(
    bookingId,
    status
) {

    if (!status) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/bookings/${bookingId}/status`,
                {

                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status
                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Status update failed"
            );

        }


        showToast(
            "Booking status updated."
        );


        await loadOwnerBookings();


    } catch (error) {

        console.error(
            error
        );


        showToast(
            error.message ||
            "Unable to update status."
        );

    }

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message
) {

    if (
        !toast ||
        !toastMessage
    ) {

        return;

    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function setupRevealAnimations() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if (!elements.length) {
        return;
    }


    const observer =
        new IntersectionObserver(

            (entries, observer) => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },

            {
                threshold: 0.12
            }

        );


    elements.forEach(
        element => {

            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        closeBooking();

        closeSuccess();

        closeOwnerPanel();

    }
);


/* =========================================================
   HTML SAFETY
   ========================================================= */

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


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(
            dateValue +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}


/* =========================================================
   TIME FORMAT
   ========================================================= */

function formatTime(
    timeValue
) {

    if (!timeValue) {
        return "-";
    }


    const parts =
        String(
            timeValue
        ).split(":");


    let hour =
        Number(
            parts[0]
        );


    const minute =
        parts[1] ||
        "00";


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${period}`;

}


/* =========================================================
   GALLERY
   ========================================================= */


/* ================= LOAD GALLERY ================= */

async function loadGallery() {

    const galleryGrid =
        document.getElementById(
            "galleryGrid"
        );


    if (!galleryGrid) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/gallery`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load gallery"
            );

        }


        const gallery =
            await response.json();


        if (!gallery.length) {

            galleryGrid.innerHTML = `

                <div class="loading-card">

                    <p>
                        No gallery images available yet.
                    </p>

                </div>

            `;

            return;

        }


        galleryGrid.innerHTML =
            gallery.map(
                item => {

                    return `

                        <div
                            class="gallery-item reveal"
                            data-category="${escapeHTML(
                                item.category
                            )}"
                        >

                            <div
                                class="gallery-image"
                            >

                                <img
                                    src="${escapeHTML(
                                        getAssetUrl(
                                            item.image_url
                                        )
                                    )}"
                                    alt="${escapeHTML(
                                        item.title
                                    )}"
                                    loading="lazy"
                                >


                                <div
                                    class="gallery-overlay"
                                >

                                    <span>
                                        ${escapeHTML(
                                            item.category
                                        ).toUpperCase()}
                                    </span>


                                    <h3>
                                        ${escapeHTML(
                                            item.title
                                        )}
                                    </h3>

                                </div>

                            </div>

                        </div>

                    `;

                }
            ).join("");


        // Gallery filters
        setupGalleryFilters();


        // Reveal animation
        setupRevealAnimations();


    } catch (error) {

        console.error(
            "Gallery loading error:",
            error
        );


        galleryGrid.innerHTML = `

            <div class="loading-card">

                <p>
                    Unable to load gallery.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   GALLERY FILTERS
   ========================================================= */

function setupGalleryFilters() {

    const filters =
        document.querySelectorAll(
            ".gallery-filter"
        );


    const items =
        document.querySelectorAll(
            ".gallery-item"
        );


    if (!filters.length) {
        return;
    }


    filters.forEach(
        filter => {

            filter.addEventListener(
                "click",
                () => {

                    filters.forEach(
                        button => {

                            button.classList.remove(
                                "active"
                            );

                        }
                    );


                    filter.classList.add(
                        "active"
                    );


                    const selectedCategory =
                        filter.dataset.filter
                            .toLowerCase()
                            .trim();


                    items.forEach(
                        item => {

                            const category =
                                item.dataset.category
                                    .toLowerCase()
                                    .trim();


                            if (
                                selectedCategory ===
                                    "all" ||
                                category ===
                                    selectedCategory
                            ) {

                                item.classList.remove(
                                    "hidden"
                                );

                            } else {

                                item.classList.add(
                                    "hidden"
                                );

                            }

                        }
                    );

                }
            );

        }
    );

}
