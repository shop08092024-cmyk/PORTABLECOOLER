// ============================================
//   BREEZEKART – DROPSHIPPING SCRIPT
//   ✅ Validate → Pay Online (Razorpay) / COD → WhatsApp Order Alert
// ============================================

// ─── CONFIGURATION ──────────────────────────────────────────────
// 👉 REPLACE THESE WITH YOUR ACTUAL VALUES:
var RAZORPAY_KEY    = "rzp_live_SWWyQlxsSLcyD0";   // e.g. rzp_live_xxxxx
var WHATSAPP_NUMBER = "919016453985";              // Country code + number (no + or spaces)
var PRICE_PER_UNIT  = 699;                         // Price in INR
// ────────────────────────────────────────────────────────────────

var quantity = 1;

// Quantity controls
function changeQty(delta) {
  quantity = Math.max(1, quantity + delta);
  document.getElementById("qtyDisplay").textContent = quantity;
  document.getElementById("totalPrice").textContent = "Total: ₹" + (PRICE_PER_UNIT * quantity).toLocaleString("en-IN");
}

// Thumbnail switcher
function switchImg(el) {
  document.getElementById("mainImg").src = el.src;
  document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
}

// ─── VALIDATION ─────────────────────────────────────────────────
function clearErrors() {
  document.querySelectorAll(".err").forEach(e => e.textContent = "");
  document.querySelectorAll("input, textarea").forEach(el => el.classList.remove("error"));
}

function setError(fieldId, msg) {
  var el = document.getElementById(fieldId);
  if (el) { el.classList.add("error"); }
  var err = document.getElementById("err-" + fieldId);
  if (err) { err.textContent = msg; }
}

function getCustomerDetails() {
  clearErrors();
  var name    = document.getElementById("name").value.trim();
  var phone   = document.getElementById("phone").value.trim();
  var address = document.getElementById("address").value.trim();
  var city    = document.getElementById("city").value.trim();
  var pincode = document.getElementById("pincode").value.trim();
  var email   = document.getElementById("email") ? document.getElementById("email").value.trim() : "";

  var valid = true;

  if (!name || name.length < 2) {
    setError("name", "Please enter your full name.");
    valid = false;
  }

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    setError("phone", "Enter a valid 10-digit Indian mobile number.");
    valid = false;
  }

  if (!address || address.length < 10) {
    setError("address", "Please enter your complete address.");
    valid = false;
  }

  if (!city || city.length < 2) {
    setError("city", "Please enter your city.");
    valid = false;
  }

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    setError("pincode", "Enter a valid 6-digit pincode.");
    valid = false;
  }

  if (!valid) {
    // Scroll to first error
    var firstError = document.querySelector(".error");
    if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    return null;
  }

  return { name: name, phone: phone, address: address, city: city, pincode: pincode, email: email };
}

// ─── ONLINE PAYMENT (RAZORPAY) ──────────────────────────────────
function payOnline() {
  var customer = getCustomerDetails();
  if (!customer) return;

  var totalAmount = PRICE_PER_UNIT * quantity * 100; // paise

  var options = {
    key:         RAZORPAY_KEY,
    amount:      totalAmount,
    currency:    "INR",
    name:        "BreezeKart",
    description: "Personal Mini Air Cooler Fan x" + quantity,
    image:       "https://m.media-amazon.com/images/I/61T1Kp9dYFL._SL1500_.jpg",
    prefill: {
      name:    customer.name,
      contact: customer.phone,
      email:   customer.email || ""
    },
    notes: {
      address: customer.address,
      city:    customer.city,
      pincode: customer.pincode
    },
    theme: { color: "#0ea5e9" },
    handler: function(response) {
      // Payment successful
      sendWhatsApp(customer, "PAID ONLINE", response.razorpay_payment_id);
      showModal("✅ Payment Successful! Your order is confirmed. You'll receive a WhatsApp confirmation shortly.", true);
    },
    modal: {
      ondismiss: function() {
        // User closed checkout without paying
        console.log("Razorpay checkout closed.");
      }
    }
  };

  try {
    var rzp = new Razorpay(options);
    rzp.on("payment.failed", function(response) {
      alert("⚠️ Payment failed: " + response.error.description + "\nPlease try again or choose COD.");
    });
    rzp.open();
  } catch (e) {
    alert("Razorpay is not loaded correctly. Please refresh and try again.\n\nError: " + e.message);
  }
}

// ─── CASH ON DELIVERY ───────────────────────────────────────────
function cashOnDelivery() {
  var customer = getCustomerDetails();
  if (!customer) return;

  sendWhatsApp(customer, "CASH ON DELIVERY", null);
  showModal("📦 COD Order Placed! Your order has been received. Check WhatsApp for confirmation. Delivery in 3-7 business days.", false);
}

// ─── WHATSAPP ORDER NOTIFICATION ────────────────────────────────
function sendWhatsApp(customer, paymentType, paymentId) {
  var total = "₹" + (PRICE_PER_UNIT * quantity).toLocaleString("en-IN");

  var msg = "🛒 *NEW ORDER – BreezeKart*%0A"
    + "━━━━━━━━━━━━━━━━━━━━━━%0A"
    + "📦 *Product:* Personal Mini Air Cooler Fan (7-Color LED + Timer)%0A"
    + "🔢 *Quantity:* " + quantity + "%0A"
    + "💰 *Total:* " + total + "%0A"
    + "💳 *Payment:* " + paymentType + (paymentId ? " (" + paymentId + ")" : "") + "%0A"
    + "━━━━━━━━━━━━━━━━━━━━━━%0A"
    + "👤 *Customer Details*%0A"
    + "Name: " + customer.name + "%0A"
    + "Phone: " + customer.phone + "%0A"
    + "Address: " + customer.address + "%0A"
    + "City: " + customer.city + "%0A"
    + "Pincode: " + customer.pincode
    + (customer.email ? "%0AEmail: " + customer.email : "") + "%0A"
    + "━━━━━━━━━━━━━━━━━━━━━━%0A"
    + "✅ Please confirm & ship ASAP!";

  var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + msg;
  window.open(url, "_blank");
}

// ─── SUCCESS MODAL ──────────────────────────────────────────────
function showModal(message, isPaid) {
  document.getElementById("modalMsg").textContent = message;
  document.querySelector(".modal-icon").textContent = isPaid ? "💳" : "📦";
  document.getElementById("successModal").style.display = "flex";
  // Reset form
  ["name","phone","address","city","pincode","email"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });
  quantity = 1;
  document.getElementById("qtyDisplay").textContent = "1";
  document.getElementById("totalPrice").textContent = "Total: ₹" + PRICE_PER_UNIT.toLocaleString("en-IN");
}

function closeModal() {
  document.getElementById("successModal").style.display = "none";
}

// Phone number: allow only digits
document.addEventListener("DOMContentLoaded", function() {
  var phoneEl = document.getElementById("phone");
  if (phoneEl) {
    phoneEl.addEventListener("input", function() {
      this.value = this.value.replace(/\D/g, "");
    });
  }
  var pincodeEl = document.getElementById("pincode");
  if (pincodeEl) {
    pincodeEl.addEventListener("input", function() {
      this.value = this.value.replace(/\D/g, "");
    });
  }
});
