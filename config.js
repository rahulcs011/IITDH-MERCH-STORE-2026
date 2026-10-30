// ============================================================
//  MERCH STORE - CONFIGURATION
//  Edit THIS file to customize your store (products, prices,
//  UPI ID, coupons, etc.). No need to touch index.html or app.js.
// ============================================================

const TEE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const HOODIE_SIZES = ["S", "M", "L", "XL", "XXL"];

const STORE_CONFIG = {

  // ---------- Store identity ----------
  storeName: "IIT DH MERCH STORE",
  tagline: "Your style, your way.",
  announcement: "Limited period offer - Order now!",   // scrolling red banner ("" to hide)

  // ---------- Payment ----------
  upiId: "9289886267@sbi",        // your UPI ID, shown at checkout
  qrImage: "images/qr.png",     // your UPI QR code image, put the file in the images folder

  // ---------- Order submission ----------
  // Paste the URL of your own deployed Google Apps Script Web App here.
  // Setup steps are written at the top of apps-script/Code.gs.
  scriptURL: "https://script.google.com/macros/s/AKfycbzu0xbEKMql5L4dOZAL56S_vVUwnm_MoUlC3BKV41DTt5VUCdecF0J4yL4dSKwPZgK0/exec",

  // ---------- Extra charges ----------
  customNameFee: 69,    // Rs. extra for a custom printed name
  xxlFee: 11,           // Rs. extra for XXL size

  // ---------- Contact (footer) ----------
  whatsapp: "919289886267",        // with country code, digits only

  // ---------- Coupon codes ----------
  // type: "flat" (fixed Rs. off) or "percent" (% off). minItems = minimum items in cart.
  coupons: [
    { code: "BUY2",   minItems: 2, type: "flat",    value: 50  },
    { code: "BUY3",   minItems: 3, type: "flat",    value: 100 },
  ],

  // ---------- Colors ----------
  colorMap: {
    "Black": "#000000",
    "Black1": "#000000",
    "Navy": "#000080",
    "White": "#FFFFFF",
    "Maroon": "#800000",
    "Grey": "#808080",
    "Olive": "#556b2f"
  },

  // ---------- Products ----------
  // sizes: "TEE_SIZES", "HOODIE_SIZES" or a custom array like ["Free Size"]
  // type "shirt"/"hoodie" shows the custom-name option; other types hide it.
  // Put your photo files in the images folder and update the paths here.
  products: [
    {
      id: 1, name: "Classic T-Shirt", price: 449, type: "shirt",
      sizes: "TEE_SIZES", colors: ["Black", "Navy", "Maroon"],
      images: {
        "Black": ["images/tshirt_black_front.jpg", "images/tshirt_black_back.jpg"],
        "Navy":  ["images/tshirt_navy_front.jpg",  "images/tshirt_navy_back.jpg"],
        "Maroon": ["images/tshirt_maroon_front.jpg", "images/tshirt_maroon_back.jpg"]
      }
    },
    {
      id: 2, name: "T-Shirt 2", price: 499, type: "shirt",
      optionLabel: "T-Shirt Design",
      optionNames: { "Black": "Design 1", "Black1": "Design 2" },
      sizes: "TEE_SIZES", colors: ["Black", "Black1"],
      images: {
        "Black": ["images/tshirt_black_front_premium.jpg", "images/tshirt_black_back_premium.jpg"],
        "Black1": ["images/tshirt_black_front_premium_2.jpg", "images/tshirt_black_back_premium_2.jpg"],
      }
    },
    {
      id: 3, name: "Polo T-Shirt", price: 499, type: "shirt",
      sizes: "TEE_SIZES", colors: ["Black", "Navy","Maroon"],
      images: {
        "Black": ["images/polo_black_front.jpg", "images/polo_black_back.jpg"],
        "Navy":  ["images/polo_navy_front.jpg",  "images/polo_navy_back.jpg"],
        "Maroon": ["images/polo_maroon_front.jpg", "images/polo_maroon_back.jpg"]
      }
    },
    {
      id: 4, name: "Hoodie", price: 949, type: "hoodie",
      optionLabel: "Hoodie Design",
      designs: {
        "Design 1": {
          "Black": ["images/hoodie_black_front.jpg", "images/hoodie_black_back.jpg"],
          "Navy": ["images/hoodie_navy_front.jpg", "images/hoodie_navy_back.jpg"]
        },
        "Design 2": {
          "Black": ["images/hoodie_black_design2_front.jpg", "images/hoodie_black_design2_back.jpg"],
          "Navy": ["images/hoodie_navy_design2_front.jpg", "images/hoodie_navy_design2_back.jpg"]
        }
      },
      sizes: "HOODIE_SIZES", colors: ["Black", "Navy"],
      // images: {
      //   "Black": ["images/hoodie_black_front.jpg", "images/hoodie_black_back.jpg"],
      //   "Navy": ["images/hoodie_navy_front.jpg", "images/hoodie_navy_back.jpg"]
      // }
    },
    {
      id: 5, name: "Zipper Hoodie", price: 999, type: "hoodie",
      optionLabel: "Hoodie Design",
      designs: {
        "Design 1": {
          "Black": ["images/zipper_hoodie_black_front.jpg", "images/zipper_hoodie_black_back.jpg"],
          "Navy": ["images/zipper_hoodie_navy_front.jpg", "images/zipper_hoodie_navy_back.jpg"]
        },
        "Design 2": {
          "Black": ["images/zipper_hoodie_black_design2_front.jpg", "images/zipper_hoodie_black_design2_back.jpg"],
          "Navy": ["images/zipper_hoodie_navy_design2_front.jpg", "images/zipper_hoodie_navy_design2_back.jpg"]
        }
      },
      sizes: "HOODIE_SIZES", colors: ["Black", "Navy"],
      //images: {
       // "Black": ["images/zipper_hoodie_black_front.jpg", "images/zipper_hoodie_black_back.jpg"],
        //"Navy": ["images/zipper_hoodie_navy_front.jpg", "images/zipper_hoodie_navy_back.jpg"]
     // }
    },
    {
      id: 6, name: "CS Hoodie", price: 989, type: "hoodie",
      sizes: "HOODIE_SIZES", colors: ["Black", "Navy"],
      images: {
        "Black": ["images/cs_hoodie_black_front.jpg", "images/cs_hoodie_black_back.jpg"],
        "Navy": ["images/cs_hoodie_navy_front.jpg", "images/cs_hoodie_navy_back.jpg"]
      }
    },
    {
      id: 7, name: "ME Hoodie", price: 989, type: "hoodie",
      sizes: "HOODIE_SIZES", colors: ["Black", "Navy"],
      images: {
        "Black": ["images/me_hoodie_black_front.jpg", "images/me_hoodie_black_back.jpg"],
        "Navy": ["images/me_hoodie_navy_front.jpg", "images/me_hoodie_navy_back.jpg"]
      }
    },
    {
      id: 8, name: "EEE Hoodie", price: 989, type: "hoodie",
      sizes: "HOODIE_SIZES", colors: ["Black", "Navy"],
      images: {
        "Black": ["images/eee_hoodie_black_front.jpg", "images/eee_hoodie_black_back.jpg"],
        "Navy": ["images/eee_hoodie_navy_front.jpg", "images/eee_hoodie_navy_back.jpg"]
      }
    },
    {
      id: 9, name: "ECE Hoodie", price: 989, type: "hoodie",
      sizes: "HOODIE_SIZES", colors: ["Black", "Navy"],
      images: {
        "Black": ["images/ece_hoodie_black_front.jpg", "images/ece_hoodie_black_back.jpg"],
        "Navy": ["images/ece_hoodie_navy_front.jpg", "images/ece_hoodie_navy_back.jpg"]
      }
    }
  ]
};
