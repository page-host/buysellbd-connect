import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Lang = "bn" | "en";

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  "nav.home": { bn: "হোম", en: "Home" },
  "nav.marketplace": { bn: "মার্কেটপ্লেস", en: "Marketplace" },
  "nav.how_it_works": { bn: "কিভাবে কাজ করে", en: "How It Works" },
  "nav.contact": { bn: "যোগাযোগ", en: "Contact" },
  "nav.login": { bn: "লগইন", en: "Login" },
  "nav.signup": { bn: "সাইন আপ", en: "Sign Up" },
  "nav.dashboard": { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  "nav.admin": { bn: "অ্যাডমিন", en: "Admin" },
  "nav.logout": { bn: "লগআউট", en: "Logout" },
  "nav.completed_orders": { bn: "সম্পন্ন অর্ডার", en: "Completed Orders" },
  "nav.active_orders": { bn: "চলমান অর্ডার", en: "Active Orders" },
  "nav.joined": { bn: "যোগদান", en: "Joined" },

  // Categories
  "cat.facebook_page": { bn: "ফেসবুক পেজ", en: "Facebook Page" },
  "cat.youtube_channel": { bn: "ইউটিউব চ্যানেল", en: "YouTube Channel" },
  "cat.instagram": { bn: "ইনস্টাগ্রাম", en: "Instagram" },
  "cat.twitter": { bn: "টুইটার/এক্স", en: "Twitter/X" },
  "cat.linkedin": { bn: "লিংকেডিন", en: "LinkedIn" },
  "cat.gaming_id": { bn: "গেমিং আইডি", en: "Gaming ID" },
  "cat.other": { bn: "অন্যান্য", en: "Other" },
  "cat.all": { bn: "সব ক্যাটাগরি", en: "All Categories" },

  // Hero
  "hero.badge": { bn: "১০০% নিরাপদ এসক্রো সিস্টেম", en: "100% Secure Escrow System" },
  "hero.title": { bn: "সোশ্যাল মিডিয়া অ্যাকাউন্ট কিনুন ও বিক্রি করুন", en: "Buy & Sell Social Media Accounts" },
  "hero.title_highlight": { bn: "নিরাপদে", en: "Safely" },
  "hero.subtitle": { bn: "বাংলাদেশের সবচেয়ে বিশ্বস্ত ডিজিটাল অ্যাসেট মার্কেটপ্লেস। ফেসবুক পেজ, ইউটিউব চ্যানেল, ইনস্টাগ্রাম অ্যাকাউন্ট এবং গেমিং আইডি — সব এক জায়গায়।", en: "Bangladesh's most trusted digital asset marketplace. Facebook Pages, YouTube Channels, Instagram Accounts and Gaming IDs — all in one place." },
  "hero.search_placeholder": { bn: "Monetized Channel, OG ID খুঁজুন...", en: "Search Monetized Channel, OG ID..." },
  "hero.search_btn": { bn: "খুঁজুন", en: "Search" },

  // Categories section
  "section.categories": { bn: "ক্যাটাগরি ব্রাউজ করুন", en: "Browse Categories" },
  "section.categories_sub": { bn: "আপনার পছন্দের ক্যাটাগরি থেকে সেরা অ্যাকাউন্ট খুঁজে নিন", en: "Find the best accounts from your preferred category" },

  // Trust section
  "section.trust": { bn: "কেন আমরা নিরাপদ?", en: "Why Are We Safe?" },
  "section.trust_sub": { bn: "আপনার প্রতিটি লেনদেন সুরক্ষিত", en: "Every transaction is protected" },
  "trust.escrow_title": { bn: "এসক্রো পেমেন্ট সুরক্ষা", en: "Escrow Payment Protection" },
  "trust.escrow_desc": { bn: "ক্রেতার টাকা অ্যাডমিনের কাছে নিরাপদ থাকে যতক্ষণ না ডেলিভারি কনফার্ম হয়।", en: "Buyer's money stays safe with admin until delivery is confirmed." },
  "trust.verified_title": { bn: "ভেরিফাইড সেলার", en: "Verified Sellers" },
  "trust.verified_desc": { bn: "প্রতিটি বিক্রেতা NID এবং ফোন নম্বর ভেরিফিকেশনের মাধ্যমে যাচাইকৃত।", en: "Every seller is verified through NID and phone verification." },
  "trust.payment_title": { bn: "নিরাপদ পেমেন্ট", en: "Secure Payment" },
  "trust.payment_desc": { bn: "বিকাশ, নগদ, রকেট এবং USDT/TRX পেমেন্ট মেথড সাপোর্ট।", en: "bKash, Nagad, Rocket and USDT/TRX payment methods supported." },

  // How it works section
  "section.how": { bn: "কিভাবে কাজ করে?", en: "How It Works?" },
  "section.how_sub": { bn: "মাত্র ৩ টি সহজ ধাপে আপনার লেনদেন সম্পন্ন করুন", en: "Complete your transaction in just 3 simple steps" },
  "how.step1_title": { bn: "অ্যাকাউন্ট নির্বাচন", en: "Select Account" },
  "how.step1_desc": { bn: "মার্কেটপ্লেস থেকে পছন্দের অ্যাকাউন্ট বেছে নিন এবং বিস্তারিত দেখুন।", en: "Choose your preferred account from the marketplace and view details." },
  "how.step2_title": { bn: "নিরাপদ পেমেন্ট", en: "Secure Payment" },
  "how.step2_desc": { bn: "এসক্রো সিস্টেমে টাকা জমা দিন — আপনার টাকা অ্যাডমিনের কাছে নিরাপদ।", en: "Deposit via escrow — your money is safe with admin." },
  "how.step3_title": { bn: "অ্যাকাউন্ট গ্রহণ", en: "Receive Account" },
  "how.step3_desc": { bn: "বিক্রেতা অ্যাকাউন্ট ট্রান্সফার করবে, কনফার্ম করলে বিক্রেতাকে টাকা রিলিজ।", en: "Seller transfers account, money released after your confirmation." },
  "how.learn_more": { bn: "বিস্তারিত জানুন", en: "Learn More" },

  // CTA section
  "cta.title": { bn: "আজই শুরু করুন — বিনামূল্যে রেজিস্ট্রেশন!", en: "Start Today — Free Registration!" },
  "cta.subtitle": { bn: "আপনার সোশ্যাল মিডিয়া অ্যাকাউন্ট বিক্রি করুন অথবা সেরা ডিল-এ কিনুন। নিরাপদ, দ্রুত এবং বিশ্বস্ত।", en: "Sell your social media accounts or buy at the best deals. Safe, fast and trusted." },
  "cta.seller_btn": { bn: "বিক্রেতা হিসেবে যোগ দিন", en: "Join as Seller" },
  "cta.browse_btn": { bn: "মার্কেটপ্লেস ব্রাউজ করুন", en: "Browse Marketplace" },

  // Marketplace page
  "mp.title": { bn: "মার্কেটপ্লেস", en: "Marketplace" },
  "mp.subtitle": { bn: "সেরা সোশ্যাল মিডিয়া অ্যাকাউন্ট খুঁজে নিন", en: "Find the best social media accounts" },
  "mp.search_placeholder": { bn: "অ্যাকাউন্ট খুঁজুন...", en: "Search accounts..." },
  "mp.sort_newest": { bn: "নতুন আগে", en: "Newest First" },
  "mp.sort_price_low": { bn: "কম দাম আগে", en: "Low Price First" },
  "mp.sort_price_high": { bn: "বেশি দাম আগে", en: "High Price First" },
  "mp.no_listings": { bn: "কোনো লিস্টিং পাওয়া যায়নি", en: "No listings found" },
  "mp.create_new": { bn: "নতুন লিস্টিং তৈরি করুন", en: "Create New Listing" },
  "mp.price": { bn: "মূল্য", en: "Price" },
  "mp.details": { bn: "বিস্তারিত", en: "Details" },
  "mp.stockout": { bn: "স্টকআউট", en: "Stock Out" },

  // Footer
  "footer.desc": { bn: "সোশ্যাল মিডিয়া অ্যাকাউন্ট ও ডিজিটাল অ্যাসেট কেনা-বেচার নিরাপদ মার্কেটপ্লেস।", en: "A secure marketplace for buying and selling social media accounts & digital assets." },
  "footer.marketplace": { bn: "মার্কেটপ্লেস", en: "Marketplace" },
  "footer.support": { bn: "সাপোর্ট", en: "Support" },
  "footer.escrow": { bn: "এসক্রো সিস্টেম", en: "Escrow System" },
  "footer.privacy": { bn: "প্রাইভেসি পলিসি", en: "Privacy Policy" },
  "footer.payment_methods": { bn: "পেমেন্ট মেথড", en: "Payment Methods" },
  "footer.copyright": { bn: "© 2026 SAEM - Social Account Exchange & Marketplace। সর্বস্বত্ব সংরক্ষিত।", en: "© 2026 SAEM - Social Account Exchange & Marketplace. All rights reserved." },

  // Login page
  "login.title": { bn: "আপনার অ্যাকাউন্টে লগইন করুন", en: "Login to Your Account" },
  "login.subtitle": { bn: "স্বাগতম! লগইন করতে নিচের ফর্ম পূরণ করুন।", en: "Welcome! Fill in the form below to login." },
  "login.email": { bn: "ইমেইল", en: "Email" },
  "login.password": { bn: "পাসওয়ার্ড", en: "Password" },
  "login.forgot": { bn: "পাসওয়ার্ড ভুলে গেছেন?", en: "Forgot Password?" },
  "login.btn": { bn: "লগইন", en: "Login" },
  "login.loading": { bn: "লগইন হচ্ছে...", en: "Logging in..." },
  "login.no_account": { bn: "অ্যাকাউন্ট নেই?", en: "No account?" },
  "login.signup_link": { bn: "সাইন আপ করুন", en: "Sign Up" },

  // Signup page
  "signup.title": { bn: "নতুন অ্যাকাউন্ট তৈরি করুন", en: "Create New Account" },
  "signup.subtitle": { bn: "বিনামূল্যে রেজিস্ট্রেশন করুন এবং শুরু করুন।", en: "Register for free and get started." },
  "signup.name": { bn: "পুরো নাম", en: "Full Name" },
  "signup.name_placeholder": { bn: "আপনার নাম", en: "Your name" },
  "signup.email": { bn: "ইমেইল", en: "Email" },
  "signup.password": { bn: "পাসওয়ার্ড", en: "Password" },
  "signup.password_placeholder": { bn: "কমপক্ষে ৬ অক্ষর", en: "At least 6 characters" },
  "signup.btn": { bn: "সাইন আপ করুন", en: "Sign Up" },
  "signup.loading": { bn: "সাইন আপ হচ্ছে...", en: "Signing up..." },
  "signup.has_account": { bn: "ইতোমধ্যে অ্যাকাউন্ট আছে?", en: "Already have an account?" },
  "signup.login_link": { bn: "লগইন করুন", en: "Login" },

  // Contact page
  "contact.title": { bn: "যোগাযোগ করুন", en: "Contact Us" },
  "contact.subtitle": { bn: "আমাদের সাথে যেকোনো প্রশ্নে যোগাযোগ করুন", en: "Contact us with any questions" },
  "contact.email": { bn: "ইমেইল", en: "Email" },
  "contact.phone": { bn: "ফোন", en: "Phone" },
  "contact.address": { bn: "ঠিকানা", en: "Address" },
  "contact.address_value": { bn: "ঢাকা, বাংলাদেশ", en: "Dhaka, Bangladesh" },
  "contact.send_title": { bn: "মেসেজ পাঠান", en: "Send Message" },
  "contact.name": { bn: "নাম", en: "Name" },
  "contact.name_placeholder": { bn: "আপনার নাম", en: "Your name" },
  "contact.subject": { bn: "বিষয়", en: "Subject" },
  "contact.subject_placeholder": { bn: "বিষয় লিখুন", en: "Enter subject" },
  "contact.message": { bn: "মেসেজ", en: "Message" },
  "contact.message_placeholder": { bn: "আপনার মেসেজ লিখুন...", en: "Write your message..." },
  "contact.send_btn": { bn: "মেসেজ পাঠান", en: "Send Message" },
  "contact.sending": { bn: "পাঠানো হচ্ছে...", en: "Sending..." },

  // How it works page (detailed)
  "hiw.title": { bn: "কিভাবে কাজ করে?", en: "How It Works?" },
  "hiw.subtitle": { bn: "মাত্র ৩ টি সহজ ধাপে আপনার লেনদেন নিরাপদে সম্পন্ন করুন", en: "Complete your transaction safely in just 3 simple steps" },
  "hiw.step1_title": { bn: "অ্যাকাউন্ট খুঁজুন ও নির্বাচন করুন", en: "Find & Select Account" },
  "hiw.step1_desc": { bn: "মার্কেটপ্লেস থেকে আপনার পছন্দের ফেসবুক পেজ, ইউটিউব চ্যানেল, ইনস্টাগ্রাম অ্যাকাউন্ট বা গেমিং আইডি খুঁজে নিন। প্রতিটি লিস্টিং-এ ফলোয়ার, বয়স, এবং রেটিং দেখতে পাবেন।", en: "Find your preferred Facebook Page, YouTube Channel, Instagram Account or Gaming ID from the marketplace. Each listing shows followers, age, and rating." },
  "hiw.step1_d1": { bn: "ক্যাটাগরি অনুযায়ী ফিল্টার করুন", en: "Filter by category" },
  "hiw.step1_d2": { bn: "মূল্য ও ফলোয়ার অনুযায়ী সর্ট করুন", en: "Sort by price and followers" },
  "hiw.step1_d3": { bn: "ভেরিফাইড সেলারদের অগ্রাধিকার দিন", en: "Prioritize verified sellers" },
  "hiw.step2_title": { bn: "নিরাপদে পেমেন্ট করুন", en: "Make Secure Payment" },
  "hiw.step2_desc": { bn: "বিকাশ, নগদ, রকেট অথবা USDT/TRX-এ পেমেন্ট করুন। আপনার টাকা এসক্রো সিস্টেমে অ্যাডমিনের কাছে নিরাপদ থাকবে। বিক্রেতা সরাসরি টাকা পাবে না।", en: "Pay via bKash, Nagad, Rocket or USDT/TRX. Your money stays safe in escrow with admin. Seller doesn't get direct payment." },
  "hiw.step2_d1": { bn: "বিকাশ / নগদ / রকেট সাপোর্ট", en: "bKash / Nagad / Rocket support" },
  "hiw.step2_d2": { bn: "USDT / TRX ক্রিপ্টো সাপোর্ট", en: "USDT / TRX crypto support" },
  "hiw.step2_d3": { bn: "এসক্রো সিস্টেমে ১০০% নিরাপদ", en: "100% safe in escrow" },
  "hiw.step3_title": { bn: "অ্যাকাউন্ট গ্রহণ করুন", en: "Receive Account" },
  "hiw.step3_desc": { bn: "পেমেন্ট ভেরিফাই হলে বিক্রেতা আপনাকে অ্যাকাউন্ট ট্রান্সফার করবে। আপনি কনফার্ম করলে বিক্রেতার কাছে টাকা রিলিজ হবে। সমস্যা হলে ডিসপিউট রেইজ করতে পারবেন।", en: "Once payment is verified, seller transfers the account. Money is released after your confirmation. You can raise disputes if any issues." },
  "hiw.step3_d1": { bn: "বিক্রেতা অ্যাকাউন্ট ক্রেডেনশিয়াল দেবে", en: "Seller provides account credentials" },
  "hiw.step3_d2": { bn: "আপনি ভেরিফাই করে কনফার্ম করবেন", en: "You verify and confirm" },
  "hiw.step3_d3": { bn: "সমস্যা হলে রিফান্ড পাবেন", en: "Get refund if issues arise" },
  "hiw.browse_btn": { bn: "মার্কেটপ্লেস ব্রাউজ করুন", en: "Browse Marketplace" },

  // Listing Detail
  "ld.back": { bn: "মার্কেটপ্লেসে ফিরে যান", en: "Back to Marketplace" },
  "ld.price": { bn: "মূল্য", en: "Price" },
  "ld.description": { bn: "বিবরণ", en: "Description" },
  "ld.escrow_title": { bn: "এসক্রো সুরক্ষা", en: "Escrow Protection" },
  "ld.escrow_desc": { bn: "আপনার পেমেন্ট অ্যাডমিনের কাছে নিরাপদ থাকবে যতক্ষণ না আপনি ডেলিভারি কনফার্ম করেন।", en: "Your payment stays safe with admin until you confirm delivery." },
  "ld.buy_now": { bn: "এখনই কিনুন", en: "Buy Now" },
  "ld.own_listing": { bn: "এটি আপনার নিজের লিস্টিং", en: "This is your own listing" },
  "ld.seller_profile": { bn: "বিক্রেতার প্রোফাইল দেখুন →", en: "View seller profile →" },
  "ld.seller": { bn: "বিক্রেতা", en: "Seller" },
  "ld.not_found": { bn: "লিস্টিং পাওয়া যায়নি", en: "Listing not found" },

  // Payment dialog
  "pay.title": { bn: "পেমেন্ট করুন", en: "Make Payment" },
  "pay.select_method": { bn: "পেমেন্ট মেথড নির্বাচন করুন", en: "Select payment method" },
  "pay.select_placeholder": { bn: "মেথড বেছে নিন", en: "Choose method" },
  "pay.send_to": { bn: "এই নম্বরে/অ্যাড্রেসে পাঠান:", en: "Send to this number/address:" },
  "pay.amount": { bn: "পরিমাণ", en: "Amount" },
  "pay.txid": { bn: "ট্রানজেকশন আইডি / TxHash", en: "Transaction ID / TxHash" },
  "pay.txid_placeholder": { bn: "যেমন: TxID123456789", en: "e.g.: TxID123456789" },
  "pay.notice": { bn: "পেমেন্ট পাঠানোর পর অ্যাডমিন ভেরিফাই করবে। কনফার্ম হলে সেলার অ্যাকাউন্ট ট্রান্সফার করবে।", en: "After sending payment, admin will verify. Once confirmed, seller will transfer the account." },
  "pay.cancel": { bn: "বাতিল", en: "Cancel" },
  "pay.submit": { bn: "পেমেন্ট সাবমিট করুন", en: "Submit Payment" },
  "pay.submitting": { bn: "সাবমিট হচ্ছে...", en: "Submitting..." },

  // Create listing
  "cl.back": { bn: "মার্কেটপ্লেসে ফিরে যান", en: "Back to Marketplace" },
  "cl.title": { bn: "নতুন লিস্টিং তৈরি করুন", en: "Create New Listing" },
  "cl.subtitle": { bn: "আপনার অ্যাকাউন্ট বিক্রি করতে তথ্য দিন", en: "Provide details to sell your account" },
  "cl.category": { bn: "ক্যাটাগরি", en: "Category" },
  "cl.category_placeholder": { bn: "ক্যাটাগরি নির্বাচন করুন", en: "Select category" },
  "cl.custom_cat": { bn: "ক্যাটাগরির নাম", en: "Category name" },
  "cl.custom_cat_placeholder": { bn: "যেমন: TikTok, Twitter, Domain", en: "e.g.: TikTok, Twitter, Domain" },
  "cl.listing_title": { bn: "শিরোনাম", en: "Title" },
  "cl.listing_title_placeholder": { bn: "যেমন: Tech News Bangladesh", en: "e.g.: Tech News Bangladesh" },
  "cl.description": { bn: "বিবরণ", en: "Description" },
  "cl.description_placeholder": { bn: "অ্যাকাউন্টের বিস্তারিত তথ্য লিখুন...", en: "Write detailed account info..." },
  "cl.platform_url": { bn: "প্ল্যাটফর্ম লিংক", en: "Platform Link" },
  "cl.price": { bn: "মূল্য (৳)", en: "Price (৳)" },
  "cl.price_placeholder": { bn: "যেমন: 45000", en: "e.g.: 45000" },
  "cl.payment_info": { bn: "পেমেন্ট তথ্য (গোপনীয়)", en: "Payment Info (Confidential)" },
  "cl.payment_info_placeholder": { bn: "আপনার পেমেন্ট তথ্য লিখুন (যেমন: বিকাশ নম্বর, নগদ নম্বর ইত্যাদি)। এটি শুধুমাত্র অ্যাডমিন দেখতে পারবে।", en: "Enter your payment details (e.g.: bKash number, Nagad number etc.). Only admin can see this." },
  "cl.payment_info_note": { bn: "🔒 এই তথ্য শুধুমাত্র অর্ডার হলে অ্যাডমিনের কাছে দৃশ্যমান হবে।", en: "🔒 This info is only visible to admin when an order is placed." },
  "cl.submit": { bn: "লিস্টিং প্রকাশ করুন", en: "Publish Listing" },
  "cl.submitting": { bn: "তৈরি হচ্ছে...", en: "Creating..." },
  "cl.login_required": { bn: "লগইন করুন", en: "Login Required" },
  "cl.login_msg": { bn: "লিস্টিং তৈরি করতে আপনাকে লগইন করতে হবে।", en: "You need to login to create a listing." },

  // Support chat
  "support.title": { bn: "লাইভ সাপোর্ট", en: "Live Support" },
  "support.subtitle": { bn: "সাধারণত কয়েক মিনিটে উত্তর দেওয়া হয়", en: "Usually replies in a few minutes" },
  "support.welcome": { bn: "স্বাগতম! 👋", en: "Welcome! 👋" },
  "support.welcome_msg": { bn: "আপনার সমস্যা লিখুন অথবা নিচের থেকে বেছে নিন।", en: "Write your issue or choose from below." },
  "support.login_msg": { bn: "লাইভ সাপোর্ট ব্যবহার করতে লগইন করুন।", en: "Login to use live support." },
  "support.input_placeholder": { bn: "মেসেজ লিখুন...", en: "Type a message..." },
  "support.quick1": { bn: "আমার অ্যাকাউন্ট রেস্ট্রিক্টেড হয়েছে", en: "My account is restricted" },
  "support.quick2": { bn: "পেমেন্ট সমস্যা হচ্ছে", en: "Payment issue" },
  "support.quick3": { bn: "অর্ডার নিয়ে সমস্যা", en: "Order issue" },
  "support.quick4": { bn: "অন্যান্য সমস্যা", en: "Other issue" },

  // General
  "general.verified": { bn: "ভেরিফাইড", en: "Verified" },
  "general.stockout": { bn: "স্টকআউট", en: "Stock Out" },

  // Notifications
  "notif.title": { bn: "নোটিফিকেশন", en: "Notifications" },
  "notif.mark_all_read": { bn: "সব পঠিত করো", en: "Mark all read" },
  "notif.empty": { bn: "কোনো নোটিফিকেশন নেই", en: "No notifications" },
  "notif.type_order": { bn: "অর্ডার", en: "Order" },
  "notif.type_restriction": { bn: "রেস্ট্রিকশন", en: "Restriction" },
  "notif.type_info": { bn: "তথ্য", en: "Info" },
  "notif.type_warning": { bn: "সতর্কতা", en: "Warning" },
  "notif.just_now": { bn: "এইমাত্র", en: "Just now" },
  "notif.mins_ago": { bn: "মিনিট আগে", en: "min ago" },
  "notif.hours_ago": { bn: "ঘণ্টা আগে", en: "hours ago" },
  "notif.days_ago": { bn: "দিন আগে", en: "days ago" },

  // User Dashboard
  "dash.total_spent": { bn: "মোট ব্যয়", en: "Total Spent" },
  "dash.total_earned": { bn: "মোট আয়", en: "Total Earned" },
  "dash.pending_orders": { bn: "পেন্ডিং অর্ডার", en: "Pending Orders" },
  "dash.completed_orders": { bn: "সম্পন্ন অর্ডার", en: "Completed Orders" },
  "dash.profile_tab": { bn: "প্রোফাইল", en: "Profile" },
  "dash.password_tab": { bn: "পাসওয়ার্ড", en: "Password" },
  "dash.my_listings_tab": { bn: "আমার লিস্টিং", en: "My Listings" },
  "dash.orders_tab": { bn: "অর্ডার", en: "Orders" },
  "dash.profile_info": { bn: "প্রোফাইল তথ্য", en: "Profile Info" },
  "dash.profile_pic": { bn: "প্রোফাইল ছবি", en: "Profile Picture" },
  "dash.upload": { bn: "আপলোড", en: "Upload" },
  "dash.delete": { bn: "মুছুন", en: "Delete" },
  "dash.email": { bn: "ইমেইল", en: "Email" },
  "dash.full_name": { bn: "পূর্ণ নাম", en: "Full Name" },
  "dash.name_placeholder": { bn: "আপনার নাম লিখুন", en: "Enter your name" },
  "dash.phone": { bn: "ফোন নম্বর", en: "Phone Number" },
  "dash.phone_placeholder": { bn: "যেমন: 01XXXXXXXXX", en: "e.g.: 01XXXXXXXXX" },
  "dash.save_profile": { bn: "প্রোফাইল সংরক্ষণ", en: "Save Profile" },
  "dash.saving": { bn: "সংরক্ষণ...", en: "Saving..." },
  "dash.change_password": { bn: "পাসওয়ার্ড পরিবর্তন", en: "Change Password" },
  "dash.new_password": { bn: "নতুন পাসওয়ার্ড", en: "New Password" },
  "dash.new_pw_placeholder": { bn: "নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)", en: "New password (min 6 chars)" },
  "dash.confirm_password": { bn: "পাসওয়ার্ড নিশ্চিত করুন", en: "Confirm Password" },
  "dash.confirm_pw_placeholder": { bn: "পাসওয়ার্ড আবার লিখুন", en: "Re-enter password" },
  "dash.pw_mismatch": { bn: "পাসওয়ার্ড মিলছে না", en: "Passwords don't match" },
  "dash.change_pw_btn": { bn: "পাসওয়ার্ড পরিবর্তন করুন", en: "Change Password" },
  "dash.changing_pw": { bn: "পরিবর্তন হচ্ছে...", en: "Changing..." },
  "dash.no_listings": { bn: "আপনার কোনো লিস্টিং নেই", en: "You have no listings" },
  "dash.create_listing": { bn: "নতুন লিস্টিং তৈরি করুন", en: "Create New Listing" },
  "dash.active": { bn: "সক্রিয়", en: "Active" },
  "dash.stockout": { bn: "স্টকআউট", en: "Stock Out" },
  "dash.removed": { bn: "মুছে ফেলা", en: "Removed" },
  "dash.activate": { bn: "সক্রিয় করুন", en: "Activate" },
  "dash.no_orders": { bn: "এখনো কোনো অর্ডার নেই", en: "No orders yet" },
  "dash.go_marketplace": { bn: "মার্কেটপ্লেসে যান", en: "Go to Marketplace" },
  "dash.buyer": { bn: "ক্রেতা", en: "Buyer" },
  "dash.seller": { bn: "বিক্রেতা", en: "Seller" },
  "dash.order_id": { bn: "অর্ডার", en: "Order" },
  "dash.reference": { bn: "রেফারেন্স", en: "Reference" },
  "dash.admin_note": { bn: "অ্যাডমিন নোট", en: "Admin Note" },
  "dash.status_pending": { bn: "পেন্ডিং", en: "Pending" },
  "dash.status_payment": { bn: "পেমেন্ট", en: "Payment" },
  "dash.status_confirmed": { bn: "নিশ্চিত", en: "Confirmed" },
  "dash.status_delivery": { bn: "ডেলিভারি", en: "Delivery" },
  "dash.status_completed": { bn: "সম্পন্ন", en: "Completed" },

  // Admin Dashboard
  "admin.title": { bn: "অ্যাডমিন ড্যাশবোর্ড", en: "Admin Dashboard" },
  "admin.total_orders": { bn: "মোট অর্ডার", en: "Total Orders" },
  "admin.pending_orders": { bn: "পেন্ডিং অর্ডার", en: "Pending Orders" },
  "admin.active_listings": { bn: "সক্রিয় লিস্টিং", en: "Active Listings" },
  "admin.total_revenue": { bn: "মোট রেভিনিউ", en: "Total Revenue" },
  "admin.open_reports": { bn: "ওপেন রিপোর্ট", en: "Open Reports" },
  "admin.orders_tab": { bn: "অর্ডার", en: "Orders" },
  "admin.listings_tab": { bn: "লিস্টিং", en: "Listings" },
  "admin.users_tab": { bn: "ইউজার", en: "Users" },
  "admin.reports_tab": { bn: "রিপোর্ট", en: "Reports" },
  "admin.support_tab": { bn: "সাপোর্ট", en: "Support" },
  "admin.messages_tab": { bn: "মেসেজ", en: "Messages" },
  "admin.all_orders": { bn: "সকল অর্ডার", en: "All Orders" },
  "admin.no_orders": { bn: "কোনো অর্ডার নেই", en: "No orders" },
  "admin.date": { bn: "তারিখ", en: "Date" },
  "admin.buyer": { bn: "ক্রেতা", en: "Buyer" },
  "admin.seller": { bn: "বিক্রেতা", en: "Seller" },
  "admin.amount": { bn: "পরিমাণ", en: "Amount" },
  "admin.payment": { bn: "পেমেন্ট", en: "Payment" },
  "admin.reference": { bn: "রেফারেন্স", en: "Reference" },
  "admin.status": { bn: "স্ট্যাটাস", en: "Status" },
  "admin.notes": { bn: "নোট", en: "Notes" },
  "admin.confirm_payment": { bn: "✓ পেমেন্ট কনফার্ম", en: "✓ Confirm Payment" },
  "admin.admin_notes": { bn: "অ্যাডমিন নোট...", en: "Admin notes..." },
  "admin.chat": { bn: "💬 চ্যাট", en: "💬 Chat" },
  "admin.seller_payment_info": { bn: "💳 সেলারের পেমেন্ট তথ্য", en: "💳 Seller Payment Info" },
  "admin.all_listings": { bn: "সকল লিস্টিং", en: "All Listings" },
  "admin.no_listings": { bn: "কোনো লিস্টিং নেই", en: "No listings" },
  "admin.title_col": { bn: "শিরোনাম", en: "Title" },
  "admin.category": { bn: "ক্যাটাগরি", en: "Category" },
  "admin.price": { bn: "মূল্য", en: "Price" },
  "admin.verified": { bn: "ভেরিফাইড", en: "Verified" },
  "admin.verify_btn": { bn: "ভেরিফাই করুন", en: "Verify" },
  "admin.verified_btn": { bn: "✓ ভেরিফাইড", en: "✓ Verified" },
  "admin.delete_btn": { bn: "ডিলিট", en: "Delete" },
  "admin.all_users": { bn: "সকল ইউজার", en: "All Users" },
  "admin.no_users": { bn: "কোনো ইউজার নেই", en: "No users" },
  "admin.name": { bn: "নাম", en: "Name" },
  "admin.phone": { bn: "ফোন", en: "Phone" },
  "admin.joined": { bn: "যোগদান", en: "Joined" },
  "admin.role": { bn: "রোল", en: "Role" },
  "admin.restricted": { bn: "সীমাবদ্ধ", en: "Restricted" },
  "admin.restricted_badge": { bn: "সীমাবদ্ধ", en: "Restricted" },
  "admin.restriction_reason": { bn: "কারণ", en: "Reason" },
  "admin.all_reports": { bn: "সকল রিপোর্ট", en: "All Reports" },
  "admin.no_reports": { bn: "কোনো রিপোর্ট নেই", en: "No reports" },
  "admin.report_open": { bn: "🔴 খোলা", en: "🔴 Open" },
  "admin.report_resolved": { bn: "✅ সমাধান", en: "✅ Resolved" },
  "admin.reporter": { bn: "রিপোর্টার", en: "Reporter" },
  "admin.admin_reply": { bn: "অ্যাডমিন উত্তর:", en: "Admin Reply:" },
  "admin.reply_placeholder": { bn: "উত্তর লিখুন...", en: "Write reply..." },
  "admin.reply_btn": { bn: "উত্তর দিন", en: "Reply" },
  "admin.resolve_btn": { bn: "সমাধান", en: "Resolve" },
  "admin.support_title": { bn: "লাইভ সাপোর্ট চ্যাট", en: "Live Support Chat" },
  "admin.no_support": { bn: "কোনো সাপোর্ট মেসেজ নেই", en: "No support messages" },
  "admin.unread": { bn: "অপঠিত", en: "unread" },
  "admin.admin_label": { bn: "অ্যাডমিন", en: "Admin" },
  "admin.support_reply_placeholder": { bn: "উত্তর লিখুন...", en: "Write reply..." },
  "admin.send_btn": { bn: "পাঠান", en: "Send" },
  "admin.contact_messages": { bn: "যোগাযোগ মেসেজ", en: "Contact Messages" },
  "admin.no_messages": { bn: "কোনো মেসেজ নেই", en: "No messages" },

  // Payment methods
  "payment.bkash": { bn: "বিকাশ", en: "bKash" },
  "payment.nagad": { bn: "নগদ", en: "Nagad" },
  "payment.rocket": { bn: "রকেট", en: "Rocket" },
  "payment.usdt": { bn: "USDT", en: "USDT" },
  "payment.trx": { bn: "TRX", en: "TRX" },

  // Order statuses
  "status.pending": { bn: "পেন্ডিং", en: "Pending" },
  "status.payment_submitted": { bn: "পেমেন্ট জমা দেওয়া হয়েছে", en: "Payment Submitted" },
  "status.payment_confirmed": { bn: "পেমেন্ট নিশ্চিত", en: "Payment Confirmed" },
  "status.delivering": { bn: "ডেলিভারি চলছে", en: "Delivering" },
  "status.delivered": { bn: "ডেলিভার্ড", en: "Delivered" },
  "status.completed": { bn: "সম্পন্ন", en: "Completed" },
  "status.disputed": { bn: "ডিসপিউট", en: "Disputed" },
  "status.refunded": { bn: "রিফান্ড হয়েছে", en: "Refunded" },
  "status.cancelled": { bn: "বাতিল", en: "Cancelled" },
  "status.active": { bn: "সক্রিয়", en: "Active" },
  "status.sold": { bn: "বিক্রিত", en: "Sold" },
  "status.removed": { bn: "মুছে ফেলা", en: "Removed" },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "bn",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("app_lang");
    return (saved === "en" ? "en" : "bn") as Lang;
  });

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    localStorage.setItem("app_lang", l);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
