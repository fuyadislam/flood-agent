"""All 64 districts of Bangladesh: names in English and Bengali, approximate
coordinates, division, and common alternative spellings.

Coordinates are near each district headquarters. Kurigram and Sirajganj use
points on the Brahmaputra-Jamuna main channel. GloFAS picks the largest river
within ~5 km, so you can nudge a point by 0.1 degrees to target a specific river.
"""

# key: (English, Bengali, lat, lon, division, aliases)
_RAW = [
    # Dhaka division
    ("dhaka", "Dhaka", "ঢাকা", 23.81, 90.41, "Dhaka", []),
    ("gazipur", "Gazipur", "গাজীপুর", 24.00, 90.42, "Dhaka", []),
    ("narayanganj", "Narayanganj", "নারায়ণগঞ্জ", 23.62, 90.50, "Dhaka", []),
    ("narsingdi", "Narsingdi", "নরসিংদী", 23.92, 90.72, "Dhaka", ["narshingdi"]),
    ("manikganj", "Manikganj", "মানিকগঞ্জ", 23.86, 90.00, "Dhaka", []),
    ("munshiganj", "Munshiganj", "মুন্সীগঞ্জ", 23.54, 90.53, "Dhaka", []),
    ("faridpur", "Faridpur", "ফরিদপুর", 23.61, 89.84, "Dhaka", []),
    ("rajbari", "Rajbari", "রাজবাড়ী", 23.76, 89.64, "Dhaka", []),
    ("gopalganj", "Gopalganj", "গোপালগঞ্জ", 23.01, 89.83, "Dhaka", []),
    ("madaripur", "Madaripur", "মাদারীপুর", 23.17, 90.20, "Dhaka", []),
    ("shariatpur", "Shariatpur", "শরীয়তপুর", 23.21, 90.35, "Dhaka", []),
    ("kishoreganj", "Kishoreganj", "কিশোরগঞ্জ", 24.43, 90.78, "Dhaka", []),
    ("tangail", "Tangail", "টাঙ্গাইল", 24.25, 89.92, "Dhaka", []),
    # Mymensingh division
    ("mymensingh", "Mymensingh", "ময়মনসিংহ", 24.75, 90.41, "Mymensingh", []),
    ("jamalpur", "Jamalpur", "জামালপুর", 24.92, 89.95, "Mymensingh", []),
    ("sherpur", "Sherpur", "শেরপুর", 25.02, 90.02, "Mymensingh", []),
    ("netrokona", "Netrokona", "নেত্রকোনা", 24.88, 90.73, "Mymensingh", ["netrakona"]),
    # Chattogram division
    ("chattogram", "Chattogram", "চট্টগ্রাম", 22.36, 91.78, "Chattogram", ["chittagong", "ctg"]),
    ("coxsbazar", "Cox's Bazar", "কক্সবাজার", 21.43, 92.01, "Chattogram", ["cox's bazar", "coxs bazar", "cox bazar"]),
    ("cumilla", "Cumilla", "কুমিল্লা", 23.46, 91.18, "Chattogram", ["comilla"]),
    ("feni", "Feni", "ফেনী", 23.02, 91.40, "Chattogram", []),
    ("noakhali", "Noakhali", "নোয়াখালী", 22.87, 91.10, "Chattogram", []),
    ("lakshmipur", "Lakshmipur", "লক্ষ্মীপুর", 22.94, 90.84, "Chattogram", ["laxmipur"]),
    ("chandpur", "Chandpur", "চাঁদপুর", 23.23, 90.67, "Chattogram", []),
    ("brahmanbaria", "Brahmanbaria", "ব্রাহ্মণবাড়িয়া", 23.96, 91.11, "Chattogram", []),
    ("rangamati", "Rangamati", "রাঙামাটি", 22.65, 92.18, "Chattogram", []),
    ("khagrachhari", "Khagrachhari", "খাগড়াছড়ি", 23.12, 91.98, "Chattogram", ["khagrachari"]),
    ("bandarban", "Bandarban", "বান্দরবান", 22.20, 92.22, "Chattogram", []),
    # Sylhet division
    ("sylhet", "Sylhet", "সিলেট", 24.89, 91.87, "Sylhet", []),
    ("moulvibazar", "Moulvibazar", "মৌলভীবাজার", 24.48, 91.78, "Sylhet", ["maulvibazar"]),
    ("habiganj", "Habiganj", "হবিগঞ্জ", 24.37, 91.42, "Sylhet", []),
    ("sunamganj", "Sunamganj", "সুনামগঞ্জ", 25.07, 91.40, "Sylhet", []),
    # Rajshahi division
    ("rajshahi", "Rajshahi", "রাজশাহী", 24.37, 88.60, "Rajshahi", []),
    ("chapainawabganj", "Chapainawabganj", "চাঁপাইনবাবগঞ্জ", 24.60, 88.27, "Rajshahi", ["nawabganj", "chapai nawabganj"]),
    ("naogaon", "Naogaon", "নওগাঁ", 24.81, 88.94, "Rajshahi", []),
    ("natore", "Natore", "নাটোর", 24.41, 88.98, "Rajshahi", []),
    ("pabna", "Pabna", "পাবনা", 24.01, 89.24, "Rajshahi", []),
    ("sirajganj", "Sirajganj", "সিরাজগঞ্জ", 24.45, 89.72, "Rajshahi", []),
    ("bogura", "Bogura", "বগুড়া", 24.85, 89.37, "Rajshahi", ["bogra"]),
    ("joypurhat", "Joypurhat", "জয়পুরহাট", 25.10, 89.02, "Rajshahi", []),
    # Rangpur division
    ("rangpur", "Rangpur", "রংপুর", 25.75, 89.25, "Rangpur", []),
    ("kurigram", "Kurigram", "কুড়িগ্রাম", 25.56, 89.68, "Rangpur", []),
    ("gaibandha", "Gaibandha", "গাইবান্ধা", 25.33, 89.53, "Rangpur", []),
    ("lalmonirhat", "Lalmonirhat", "লালমনিরহাট", 25.92, 89.45, "Rangpur", []),
    ("nilphamari", "Nilphamari", "নীলফামারী", 25.93, 88.86, "Rangpur", []),
    ("dinajpur", "Dinajpur", "দিনাজপুর", 25.63, 88.64, "Rangpur", []),
    ("thakurgaon", "Thakurgaon", "ঠাকুরগাঁও", 26.03, 88.46, "Rangpur", []),
    ("panchagarh", "Panchagarh", "পঞ্চগড়", 26.34, 88.55, "Rangpur", []),
    # Khulna division
    ("khulna", "Khulna", "খুলনা", 22.82, 89.55, "Khulna", []),
    ("bagerhat", "Bagerhat", "বাগেরহাট", 22.65, 89.79, "Khulna", []),
    ("satkhira", "Satkhira", "সাতক্ষীরা", 22.72, 89.07, "Khulna", []),
    ("jashore", "Jashore", "যশোর", 23.17, 89.21, "Khulna", ["jessore"]),
    ("narail", "Narail", "নড়াইল", 23.17, 89.51, "Khulna", []),
    ("magura", "Magura", "মাগুরা", 23.49, 89.42, "Khulna", []),
    ("jhenaidah", "Jhenaidah", "ঝিনাইদহ", 23.54, 89.15, "Khulna", []),
    ("kushtia", "Kushtia", "কুষ্টিয়া", 23.90, 89.12, "Khulna", []),
    ("chuadanga", "Chuadanga", "চুয়াডাঙ্গা", 23.64, 88.84, "Khulna", []),
    ("meherpur", "Meherpur", "মেহেরপুর", 23.76, 88.63, "Khulna", []),
    # Barishal division
    ("barishal", "Barishal", "বরিশাল", 22.70, 90.35, "Barishal", ["barisal"]),
    ("bhola", "Bhola", "ভোলা", 22.69, 90.65, "Barishal", []),
    ("patuakhali", "Patuakhali", "পটুয়াখালী", 22.36, 90.33, "Barishal", []),
    ("pirojpur", "Pirojpur", "পিরোজপুর", 22.58, 89.97, "Barishal", []),
    ("jhalokathi", "Jhalokathi", "ঝালকাঠি", 22.64, 90.20, "Barishal", ["jhalokati"]),
    ("barguna", "Barguna", "বরগুনা", 22.15, 90.11, "Barishal", []),
]

DISTRICTS = {
    key: {"en": en, "bn": bn, "lat": lat, "lon": lon, "division": div, "aliases": aliases}
    for key, en, bn, lat, lon, div, aliases in _RAW
}

# Common Bengali spelling variants people type
_BN_VARIANTS = {"কুরিগ্রাম": "kurigram", "বগুরা": "bogura", "চিটাগং": "chattogram",
                "সিরাজগঞ্জ": "sirajganj", "ব্রাহ্মনবাড়িয়া": "brahmanbaria"}


def normalise_district(text: str) -> str | None:
    """Find a district in free text (English, alternative spelling, or Bengali)."""
    t = text.strip().lower()
    candidates = []
    for key, d in DISTRICTS.items():
        names = [key, d["en"].lower(), d["bn"], *d["aliases"]]
        candidates += [(name, key) for name in names]
    candidates += list(_BN_VARIANTS.items())
    for name, key in sorted(candidates, key=lambda c: -len(c[0])):
        if name in t:
            return key
    return None


assert len(DISTRICTS) == 64, len(DISTRICTS)