import re
from typing import Optional, Tuple

# Pre-compiled mapping for deterministic merchant and category recognition
KNOWN_MERCHANT_PATTERNS = [
    # Food Delivery & Dining
    (r"\b(swiggy\s*instamart)\b", "Swiggy Instamart", "Groceries"),
    (r"\b(swiggy|bundl\s*technologies)\b", "Swiggy", "Food"),
    (r"\b(zomato|eternal)\b", "Zomato", "Food"),
    (r"\b(mcdonald|hardcastle)\b", "McDonald's", "Food"),
    (r"\b(domino|jubilant\s*foodworks)\b", "Domino's", "Food"),
    (r"\b(starbucks|tata\s*starbucks)\b", "Starbucks", "Food"),
    (r"\b(kfc|devyani)\b", "KFC", "Food"),
    (r"\b(subway)\b", "Subway", "Food"),
    (r"\b(burger\s*king)\b", "Burger King", "Food"),
    # Groceries & Quick Commerce
    (r"\b(blinkit|grofers)\b", "Blinkit", "Groceries"),
    (r"\b(zepto|kirana)\b", "Zepto", "Groceries"),
    (r"\b(bigbasket|supermarket\s*grocery)\b", "BigBasket", "Groceries"),
    (r"\b(dmart|avenue\s*supermarts)\b", "DMart", "Groceries"),
    (r"\b(nature'?s\s*basket)\b", "Nature's Basket", "Groceries"),
    # Transportation & Travel
    (r"\b(uber)\b", "Uber", "Transportation"),
    (r"\b(ola|ani\s*technologies)\b", "Ola", "Transportation"),
    (r"\b(rapido|roppen)\b", "Rapido", "Transportation"),
    (r"\b(irctc|indian\s*railway)\b", "IRCTC", "Transportation"),
    (r"\b(metro|dmrc|bmrc|mmrcl)\b", "Metro Rail", "Transportation"),
    (r"\b(hpcl|bpcl|iocl|shell\s*fuel|petrol|fuel)\b", "Fuel Station", "Transportation"),
    (r"\b(makemytrip|cleartrip|goibibo)\b", "MakeMyTrip", "Travel"),
    (r"\b(indigo|air\s*india|vistara|spicejet)\b", "Airlines", "Travel"),
    # Shopping & E-Commerce
    (r"\b(amazon|amzn)\b", "Amazon", "Shopping"),
    (r"\b(flipkart)\b", "Flipkart", "Shopping"),
    (r"\b(myntra)\b", "Myntra", "Shopping"),
    (r"\b(nykaa|fsn\s*e-?commerce)\b", "Nykaa", "Shopping"),
    (r"\b(zara)\b", "Zara", "Shopping"),
    (r"\b(h&m|hm\s*india)\b", "H&M", "Shopping"),
    (r"\b(meesho)\b", "Meesho", "Shopping"),
    (r"\b(tata\s*cliq)\b", "Tata CLiQ", "Shopping"),
    # Subscriptions & Entertainment
    (r"\b(netflix)\b", "Netflix", "Subscriptions"),
    (r"\b(spotify)\b", "Spotify", "Subscriptions"),
    (r"\b(youtube|google\s*youtube)\b", "YouTube", "Subscriptions"),
    (r"\b(apple\.com/bill|itunes)\b", "Apple Services", "Subscriptions"),
    (r"\b(hotstar|disney\+?)\b", "Disney+ Hotstar", "Subscriptions"),
    (r"\b(prime\s*video|prime\s*member)\b", "Amazon Prime", "Subscriptions"),
    (r"\b(bookmyshow|bigtree)\b", "BookMyShow", "Entertainment"),
    (r"\b(pvr|inox)\b", "PVR Cinemas", "Entertainment"),
    # Bills & Utilities
    (r"\b(bescom|bses|tneb|mseb|electricity|power\s*corp)\b", "Electricity Utility", "Bills & Utilities"),
    (r"\b(airtel|bharti\s*airtel)\b", "Airtel", "Bills & Utilities"),
    (r"\b(jio|reliance\s*jio)\b", "Jio", "Bills & Utilities"),
    (r"\b(act\s*fibernet)\b", "ACT Fibernet", "Bills & Utilities"),
    (r"\b(water\s*board|jal\s*board)\b", "Water Utility", "Bills & Utilities"),
    (r"\b(indane|hp\s*gas|bharat\s*gas|piped\s*gas)\b", "Cooking Gas Utility", "Bills & Utilities"),
    # Healthcare & Personal Care
    (r"\b(apollo\s*pharmacy|apollo)\b", "Apollo Pharmacy", "Healthcare"),
    (r"\b(pharmeasy|api\s*holdings)\b", "PharmEasy", "Healthcare"),
    (r"\b(1mg|tata\s*1mg)\b", "Tata 1mg", "Healthcare"),
    (r"\b(cult\.fit|cultfit|curefit)\b", "Cult.fit", "Personal Care"),
    (r"\b(urban\s*company|urban\s*clap)\b", "Urban Company", "Personal Care"),
    # Income Sources
    (r"\b(salary|payroll|direct\s*dep|monthly\s*wages)\b", "Employer Payroll", "Salary"),
    (r"\b(int\.?\s*pd|interest\s*credit|sb\s*int|fd\s*int)\b", "Bank Interest", "Interest"),
]


class MerchantNormalizer:
    @staticmethod
    def clean_description(raw: str) -> str:
        """
        Strips banking noise, transaction codes, and UPI handles from description.
        """
        if not raw:
            return ""
        s = raw.strip()
        # Strip banking prefixes like UPI/, POS/, NEFT-, RTGS-, IMPS/, ACH/
        s = re.sub(r"^(?:UPI/|POS\s*|NEFT[/-]|RTGS[/-]|IMPS[/-]|ACH[/-]|BILLDESK[/-])+", "", s, flags=re.IGNORECASE)
        # Strip trailing reference IDs (e.g. *12345, /489274892/CR, @okaxis)
        s = re.sub(r"[*/@][A-Za-z0-9_.-]+$", "", s)
        # Clean multiple spaces
        s = re.sub(r"\s+", " ", s).strip()
        return s or raw.strip()

    @classmethod
    def match_known_merchant(cls, description: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Attempts fast, deterministic merchant and category extraction without calling an LLM.
        Returns (normalized_merchant, suggested_category) or (None, None).
        """
        if not description:
            return None, None

        lower_desc = description.lower()
        for pattern, merchant_name, default_cat in KNOWN_MERCHANT_PATTERNS:
            if re.search(pattern, lower_desc, flags=re.IGNORECASE):
                return merchant_name, default_cat

        return None, None
