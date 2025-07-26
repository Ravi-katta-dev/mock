// RRB Technician Grade-3 Signal Mock Test Application - Complete Version
// Created: 2025-07-26
// Author: Ravi-katta-dev

class MockTestApp {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('mockTestUsers')) || [];
        this.questions = JSON.parse(localStorage.getItem('mockTestQuestions')) || [];
        this.testResults = JSON.parse(localStorage.getItem('mockTestResults')) || [];
        this.uploadedPDFs = JSON.parse(localStorage.getItem('uploadedPDFs')) || [];
        this.currentTest = null;
        this.testSession = null;
        this.charts = {};
        this.currentPDF = null;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.tempExtractedQuestions = null;
        this.currentExtractedQuestions = null;
        this.currentReviewIndex = 0;
        this.currentPDFFile = null;
        this.currentPDFMetadata = null;
        
        // Initialize syllabus mapping for intelligent chapter detection
        this.initializeSyllabusMapping();
        
        // Initialize the application
        this.initializeApp();
    }

    initializeSyllabusMapping() {
        // Enhanced RRB Technician Grade-I Signal Syllabus Mapping with comprehensive PYQ patterns
        this.syllabusMapping = {
            "General Awareness": {
                chapters: [
                    "Current Affairs",
                    "Indian Geography", 
                    "Culture and History of India",
                    "Freedom Struggle",
                    "Indian Polity and Constitution",
                    "Indian Economy",
                    "Environmental Issues",
                    "India and World",
                    "Sports",
                    "General Scientific and Technological Developments"
                ],
                keywords: {
                    "Current Affairs": ["current", "recent", "2024", "2025", "2023", "2022", "news", "events", "government", "minister", "prime minister", "president", "chief minister", "policy", "scheme", "award", "summit", "treaty", "modi", "droupadi murmu", "ram nath kovind", "budget", "union", "state", "governor", "cabinet", "appointment", "resignation", "election", "covid", "vaccination", "mission", "yojana", "startup", "digital", "ranking", "index", "report"],
                    "Indian Geography": ["geography", "mountain", "river", "state", "capital", "plateau", "desert", "climate", "monsoon", "himalayas", "ganges", "deccan", "western ghats", "eastern ghats", "brahmaputra", "kaveri", "krishna", "narmada", "godavari", "indus", "arabian sea", "bay of bengal", "indian ocean", "thar", "vindhya", "satpura", "nilgiri", "aravalli", "andaman", "nicobar", "lakshadweep", "tropic", "equator", "latitude", "longitude", "delta", "estuary", "peninsula", "island", "strait", "gulf"],
                    "Culture and History of India": ["culture", "history", "ancient", "medieval", "modern", "mughal", "british", "independence", "freedom fighter", "civilization", "indus valley", "vedic", "gupta", "maurya", "chola", "pandya", "pallava", "vijayanagara", "delhi sultanate", "akbar", "shah jahan", "aurangzeb", "maratha", "shivaji", "rana pratap", "tipu sultan", "harappan", "mohenjo-daro", "harappa", "lothal", "dholavira", "buddhism", "jainism", "hinduism", "sikhism", "christianity", "islam", "temple", "mosque", "church", "gurudwara", "festival", "tradition", "art", "sculpture", "painting", "dance", "music"],
                    "Freedom Struggle": ["freedom", "independence", "1857", "rebellion", "quit india", "salt march", "non-cooperation", "civil disobedience", "gandhi", "nehru", "subhash", "bhagat singh", "chandrashekhar azad", "lala lajpat rai", "bal gangadhar tilak", "gopal krishna gokhale", "dadabhai naoroji", "sardar patel", "sarojini naidu", "rani laxmi bai", "tatya tope", "mangal pandey", "khudiram bose", "ashfaqullah khan", "ramprasad bismil", "revolutionary", "congress", "muslim league", "partition", "jallianwala bagh", "chauri chaura", "kakori", "simon commission"],
                    "Indian Polity and Constitution": ["constitution", "fundamental rights", "directive principles", "amendment", "parliament", "lok sabha", "rajya sabha", "president", "governor", "supreme court", "high court", "chief justice", "article", "preamble", "secular", "democratic", "republic", "federal", "unitary", "emergency", "ordinance", "bill", "act", "election commission", "upsc", "cag", "attorney general", "solicitor general", "central", "state", "union territory", "schedule", "list", "concurrent", "residual", "judiciary", "executive", "legislature"],
                    "Indian Economy": ["economy", "gdp", "budget", "fiscal", "monetary", "reserve bank", "inflation", "currency", "trade", "export", "import", "agriculture", "industry", "service sector", "rbi", "sebi", "nabard", "sidbi", "niti aayog", "planning commission", "five year plan", "poverty", "unemployment", "subsidy", "tax", "gst", "income tax", "corporate tax", "disinvestment", "privatisation", "liberalisation", "globalisation", "devaluation", "balance of payments", "current account", "capital account", "forex", "stock exchange", "sensex", "nifty", "mutual fund", "insurance", "banking", "credit", "loan"],
                    "Environmental Issues": ["environment", "pollution", "climate change", "global warming", "biodiversity", "conservation", "renewable energy", "sustainable", "ecology", "carbon", "ozone", "greenhouse", "deforestation", "afforestation", "wildlife", "national park", "sanctuary", "biosphere", "ecosystem", "endangered", "extinct", "tiger", "elephant", "rhino", "leopard", "solar", "wind", "hydro", "nuclear", "coal", "petroleum", "natural gas", "waste", "recycling", "plastic", "water", "air", "soil", "noise"],
                    "India and World": ["international", "united nations", "brics", "saarc", "asean", "g20", "world bank", "imf", "foreign policy", "diplomacy", "bilateral", "multilateral", "nato", "who", "unesco", "unicef", "wto", "security council", "general assembly", "neighbour", "china", "pakistan", "bangladesh", "sri lanka", "nepal", "bhutan", "myanmar", "afghanistan", "usa", "russia", "uk", "france", "germany", "japan", "australia", "canada", "border", "lac", "loc", "trade", "agreement", "treaty", "summit", "visit"],
                    "Sports": ["sports", "cricket", "football", "hockey", "olympics", "commonwealth", "asian games", "world cup", "tournament", "champion", "medal", "player", "athlete", "virat kohli", "ms dhoni", "rohit sharma", "mary kom", "sania mirza", "pv sindhu", "saina nehwal", "bajrang punia", "vinesh phogat", "neeraj chopra", "mirabai chanu", "lovlina borgohain", "wrestling", "badminton", "tennis", "boxing", "shooting", "archery", "weightlifting", "javelin", "discus", "hammer", "pole vault", "swimming", "athletics", "gymnastics"],
                    "General Scientific and Technological Developments": ["science", "technology", "research", "innovation", "space", "isro", "nasa", "satellite", "nuclear", "biotechnology", "artificial intelligence", "digital india", "chandrayaan", "mangalyaan", "gaganyaan", "aditya", "pslv", "gslv", "rocket", "mission", "mars", "moon", "venus", "sun", "covid", "vaccine", "vaccine", "genome", "dna", "rna", "gene", "protein", "cell", "virus", "bacteria", "antibiotic", "computer", "internet", "mobile", "smartphone", "app", "software", "hardware", "processor", "memory", "storage", "network", "5g", "4g", "3g", "wifi", "bluetooth"]
                }
            },
            "General Intelligence & Reasoning": {
                chapters: [
                    "Analogies",
                    "Alphabetical and Number Series",
                    "Coding and Decoding",
                    "Mathematical Operations",
                    "Relationships",
                    "Syllogism",
                    "Jumbling",
                    "Venn Diagram",
                    "Data Interpretation and Sufficiency",
                    "Conclusions and Decision Making",
                    "Similarities and Differences",
                    "Analytical Reasoning",
                    "Classification",
                    "Directions",
                    "Statement Arguments and Assumptions"
                ],
                keywords: {
                    "Analogies": ["analogies", "analogy", "relation", "similar", "likewise", "corresponds", "parallel", "related", "same way", "relationship", "pattern", "connection", "comparison", "equivalent", "proportional", "ratio", "matching", "corresponding"],
                    "Alphabetical and Number Series": ["series", "sequence", "pattern", "next", "missing", "alphabetical", "number series", "continuation", "progression", "following", "comes next", "arrange", "order", "ascending", "descending", "skip", "alternate", "consecutive", "fibonacci", "arithmetic", "geometric", "complete the series", "find the missing"],
                    "Coding and Decoding": ["coding", "decoding", "code", "cipher", "encrypted", "decode", "encode", "written as", "represented", "symbol", "letter", "number", "substitution", "shift", "reverse", "mirror", "opposite", "convert", "translate", "meaning", "secret", "hidden"],
                    "Mathematical Operations": ["mathematical operations", "operation", "calculate", "compute", "arithmetic", "addition", "subtraction", "multiplication", "division", "bodmas", "pemdas", "solve", "equation", "expression", "value", "result", "answer", "sum", "difference", "product", "quotient", "remainder", "simplify"],
                    "Relationships": ["relationship", "relation", "family", "father", "mother", "son", "daughter", "brother", "sister", "cousin", "uncle", "aunt", "grandfather", "grandmother", "nephew", "niece", "husband", "wife", "in-law", "generation", "blood relation", "family tree", "parent", "child", "sibling"],
                    "Syllogism": ["syllogism", "conclusion", "statement", "premise", "follows", "logical", "deduction", "inference", "given", "assume", "true", "false", "definitely", "possibly", "probably", "certainly", "all", "some", "no", "none", "every", "either", "neither", "both", "valid", "invalid"],
                    "Jumbling": ["jumbling", "arrangement", "rearrange", "sequence", "order", "alphabetical order", "meaningful", "word", "sentence", "letters", "position", "first", "last", "correct", "proper", "logical", "chronological", "arrange", "organize", "sort"],
                    "Venn Diagram": ["venn diagram", "circle", "intersection", "union", "overlap", "diagram", "set", "common", "both", "either", "neither", "only", "exclusive", "inclusive", "region", "area", "inside", "outside", "boundary"],
                    "Data Interpretation and Sufficiency": ["data interpretation", "sufficiency", "graph", "chart", "table", "sufficient", "insufficient", "data", "information", "given", "required", "enough", "adequate", "bar chart", "pie chart", "line graph", "histogram", "statistics", "percentage", "ratio", "proportion"],
                    "Conclusions and Decision Making": ["conclusion", "decision", "inference", "deduce", "reasoning", "logical thinking", "assumption", "hypothesis", "fact", "opinion", "evidence", "proof", "support", "contradict", "strengthen", "weaken", "most likely", "best", "worst", "probable", "feasible"],
                    "Similarities and Differences": ["similar", "difference", "common", "distinct", "alike", "unlike", "same", "different", "compare", "contrast", "feature", "characteristic", "property", "attribute", "quality", "nature", "type", "kind", "category", "group"],
                    "Analytical Reasoning": ["analytical", "analysis", "reasoning", "logical", "argument", "premise", "cause", "effect", "reason", "because", "therefore", "hence", "thus", "so", "if", "then", "unless", "although", "however", "but", "nevertheless", "moreover", "furthermore"],
                    "Classification": ["classification", "category", "group", "classify", "odd one out", "different", "exception", "does not belong", "type", "kind", "class", "set", "collection", "family", "species", "genus", "nature", "characteristic", "property"],
                    "Directions": ["direction", "north", "south", "east", "west", "left", "right", "distance", "movement", "towards", "away", "opposite", "turn", "face", "facing", "front", "back", "behind", "ahead", "clockwise", "anticlockwise", "northeast", "northwest", "southeast", "southwest", "straight", "diagonal"],
                    "Statement Arguments and Assumptions": ["statement", "argument", "assumption", "premise", "conclusion", "valid", "invalid", "strong", "weak", "support", "against", "favor", "oppose", "agrees", "disagrees", "implicit", "explicit", "given", "follows", "basis", "ground", "reason", "evidence"]
                }
            },
            "Basics of Computers and Applications": {
                chapters: [
                    "Computer Architecture",
                    "Input and Output Devices",
                    "Storage Devices",
                    "Networking",
                    "Operating Systems",
                    "MS Office Applications",
                    "Data Representation",
                    "Internet and Email",
                    "Computer Viruses",
                    "Basic Programming Concepts"
                ],
                keywords: {
                    "Computer Architecture": ["architecture", "cpu", "processor", "memory", "ram", "rom", "motherboard", "hardware", "components", "alu", "control unit", "registers", "cache", "bus", "address bus", "data bus", "control bus", "instruction", "fetch", "decode", "execute", "pipeline", "clock", "frequency", "ghz", "mhz", "bit", "byte", "word", "microprocessor"],
                    "Input and Output Devices": ["input", "output", "keyboard", "mouse", "monitor", "printer", "scanner", "speaker", "microphone", "joystick", "trackball", "touchpad", "touchscreen", "webcam", "digitizer", "plotter", "projector", "headphone", "earphone", "graphics tablet", "barcode reader", "optical mouse", "mechanical mouse", "laser printer", "inkjet printer", "dot matrix", "led", "lcd", "oled"],
                    "Storage Devices": ["storage", "hard disk", "ssd", "pendrive", "usb", "cd", "dvd", "blu-ray", "memory card", "external storage", "hdd", "solid state", "flash drive", "optical", "magnetic", "floppy", "tape", "cloud storage", "raid", "nas", "san", "primary", "secondary", "volatile", "non-volatile", "capacity", "gb", "tb", "mb", "kb"],
                    "Networking": ["network", "lan", "wan", "internet", "router", "switch", "hub", "protocol", "tcp/ip", "wifi", "ethernet", "bluetooth", "fiber optic", "coaxial", "twisted pair", "topology", "star", "ring", "bus", "mesh", "tree", "ip address", "subnet", "gateway", "dns", "dhcp", "firewall", "proxy", "vpn", "bandwidth", "latency", "packet"],
                    "Operating Systems": ["operating system", "windows", "linux", "unix", "dos", "mac os", "android", "ios", "kernel", "shell", "file system", "process", "thread", "scheduling", "memory management", "virtual memory", "paging", "segmentation", "device driver", "interrupt", "system call", "boot", "startup", "shutdown", "multitasking", "multiprocessing", "multiuser", "gui", "cli"],
                    "MS Office Applications": ["ms office", "word", "excel", "powerpoint", "outlook", "access", "microsoft office", "document", "spreadsheet", "presentation", "email", "database", "formula", "function", "chart", "graph", "table", "pivot", "macro", "template", "format", "font", "paragraph", "header", "footer", "page", "print", "save", "open", "edit", "insert"],
                    "Data Representation": ["data representation", "binary", "decimal", "hexadecimal", "octal", "ascii", "unicode", "bit", "byte", "nibble", "word", "character", "string", "integer", "float", "double", "boolean", "encoding", "decoding", "compression", "encryption", "parity", "checksum", "error detection", "error correction", "base", "radix", "conversion"],
                    "Internet and Email": ["internet", "email", "website", "browser", "search engine", "url", "domain", "html", "http", "https", "ftp", "www", "web page", "hyperlink", "bookmark", "download", "upload", "attachment", "inbox", "outbox", "spam", "virus", "phishing", "cookie", "cache", "history", "social media", "chat", "video call", "online", "offline"],
                    "Computer Viruses": ["virus", "malware", "antivirus", "security", "firewall", "trojan", "worm", "spyware", "adware", "ransomware", "rootkit", "keylogger", "backdoor", "bot", "zombie", "infection", "quarantine", "scan", "update", "patch", "vulnerability", "exploit", "hacker", "cracker", "cybersecurity", "threat", "attack", "defense", "protection"],
                    "Basic Programming Concepts": ["programming", "algorithm", "flowchart", "variable", "function", "loop", "condition", "if", "else", "while", "for", "array", "string", "input", "output", "syntax", "semantic", "compiler", "interpreter", "debugging", "testing", "code", "software", "application", "program", "language", "c", "java", "python", "basic", "pascal", "fortran"]
                }
            },
            "Mathematics": {
                chapters: [
                    "Number System",
                    "Rational and Irrational Numbers",
                    "BODMAS Rule",
                    "Quadratic Equations",
                    "Arithmetic Progression",
                    "Similar Triangles",
                    "Pythagoras Theorem",
                    "Co-ordinate Geometry",
                    "Trigonometric Ratios",
                    "Heights and Distances",
                    "Surface Area and Volume",
                    "Sets and Set Operations",
                    "Venn Diagrams",
                    "Union and Intersection of Sets",
                    "Difference of Sets",
                    "Complement of Sets",
                    "Properties of Complement",
                    "Statistics and Probability",
                    "Measures of Dispersion",
                    "Mean Deviation",
                    "Variance and Standard Deviation",
                    "Probability of Events",
                    "Exhaustive Events",
                    "Mutually Exclusive Events"
                ],
                keywords: {
                    "Number System": ["number system", "natural", "whole", "integer", "rational", "real", "prime", "composite", "even", "odd", "positive", "negative", "hcf", "lcm", "gcd", "factors", "multiples", "divisibility", "remainder", "quotient", "digit", "place value", "face value", "successor", "predecessor", "ascending", "descending"],
                    "Rational and Irrational Numbers": ["rational", "irrational", "fraction", "decimal", "recurring", "terminating", "non-terminating", "repeating", "non-repeating", "surd", "square root", "cube root", "radical", "p/q", "denominator", "numerator", "improper", "proper", "mixed", "equivalent"],
                    "BODMAS Rule": ["bodmas", "brackets", "order", "division", "multiplication", "addition", "subtraction", "pemdas", "solve", "simplify", "expression", "parentheses", "exponent", "power", "operation", "precedence", "sequence", "step"],
                    "Quadratic Equations": ["quadratic", "equation", "roots", "discriminant", "factorization", "quadratic formula", "ax²+bx+c", "parabola", "vertex", "axis", "symmetry", "maximum", "minimum", "nature of roots", "sum of roots", "product of roots", "completing square", "graph"],
                    "Arithmetic Progression": ["arithmetic progression", "ap", "common difference", "nth term", "sum", "first term", "last term", "sequence", "series", "arithmetic mean", "median", "geometric progression", "gp", "common ratio", "harmonic progression", "hp"],
                    "Similar Triangles": ["similar triangles", "similarity", "proportion", "corresponding sides", "corresponding angles", "aa", "sas", "sss", "congruent", "scale factor", "ratio", "equal angles", "proportional sides", "basic proportionality", "thales theorem"],
                    "Pythagoras Theorem": ["pythagoras", "right triangle", "hypotenuse", "right angle", "perpendicular", "base", "height", "90 degree", "square", "a²+b²=c²", "triplet", "pythagorean", "converse", "altitude", "median"],
                    "Co-ordinate Geometry": ["coordinate", "geometry", "cartesian", "axis", "quadrant", "origin", "abscissa", "ordinate", "distance", "midpoint", "section formula", "area of triangle", "collinear", "slope", "gradient", "intercept", "x-axis", "y-axis", "positive", "negative"],
                    "Trigonometric Ratios": ["trigonometry", "sin", "cos", "tan", "sine", "cosine", "tangent", "cot", "sec", "cosec", "angle", "ratio", "opposite", "adjacent", "hypotenuse", "identity", "complementary", "supplementary", "0°", "30°", "45°", "60°", "90°", "standard angles"],
                    "Heights and Distances": ["height", "distance", "angle of elevation", "angle of depression", "horizontal", "vertical", "tower", "building", "ladder", "observer", "line of sight", "trigonometry", "tangent", "sine", "cosine", "shadow", "pole", "tree", "cliff"],
                    "Surface Area and Volume": ["surface area", "volume", "cube", "cylinder", "sphere", "cone", "cuboid", "prism", "pyramid", "hemisphere", "curved surface", "total surface", "lateral surface", "capacity", "hollow", "solid", "radius", "diameter", "length", "breadth", "height", "slant height"],
                    "Sets and Set Operations": ["set", "subset", "superset", "element", "member", "belongs", "does not belong", "null set", "empty set", "universal set", "finite", "infinite", "cardinal number", "equal sets", "equivalent sets", "disjoint sets", "overlapping sets"],
                    "Venn Diagrams": ["venn diagram", "intersection", "union", "complement", "universal set", "circle", "region", "shaded", "unshaded", "inside", "outside", "overlap", "common", "exclusive", "inclusive"],
                    "Union and Intersection of Sets": ["union", "intersection", "A∪B", "A∩B", "common elements", "all elements", "either", "both", "or", "and", "combining", "overlapping", "separate", "together"],
                    "Difference of Sets": ["difference", "A-B", "B-A", "minus", "exclude", "except", "not in", "belongs to A but not B", "relative complement", "symmetric difference"],
                    "Complement of Sets": ["complement", "A'", "Ac", "universal set", "not in A", "outside", "everything except", "opposite", "reverse"],
                    "Properties of Complement": ["properties", "complement", "law", "de morgan", "distributive", "associative", "commutative", "identity", "involution", "rule"],
                    "Statistics and Probability": ["statistics", "data", "frequency", "mean", "median", "mode", "average", "central tendency", "raw data", "grouped data", "class", "interval", "tally", "histogram", "frequency distribution"],
                    "Measures of Dispersion": ["dispersion", "range", "variance", "standard deviation", "spread", "deviation", "scatter", "variability", "quartile", "percentile", "coefficient"],
                    "Mean Deviation": ["mean deviation", "average deviation", "absolute deviation", "deviation from mean", "deviation from median", "md"],
                    "Variance and Standard Deviation": ["variance", "standard deviation", "σ", "σ²", "population", "sample", "spread", "root mean square"],
                    "Probability of Events": ["probability", "event", "outcome", "sample space", "favorable", "unfavorable", "certain", "impossible", "likely", "unlikely", "chance", "random", "experiment", "trial"],
                    "Exhaustive Events": ["exhaustive", "complete", "all possible", "total", "sum equals 1", "covers all", "collectively"],
                    "Mutually Exclusive Events": ["mutually exclusive", "disjoint", "cannot occur together", "independent", "intersection is null", "either or", "not both"]
                }
            },
            "Basic Science & Engineering": {
                chapters: [
                    "Physics Fundamentals",
                    "Units and Measurements", 
                    "Mass Weight and Density",
                    "Work Power and Energy",
                    "Speed and Velocity",
                    "Heat and Temperature",
                    "Electricity and Magnetism",
                    "Electric Charge and Field",
                    "Electric Potential",
                    "Simple Electric Circuits",
                    "Conductors and Non-conductors",
                    "Ohm's Law and Limitations",
                    "Resistances in Series and Parallel",
                    "Relation between Electric Potential and Voltage",
                    "Ampere's Law",
                    "Magnetic Force on Moving Charged Particle",
                    "Long Straight Conductors",
                    "Electromagnetic Induction",
                    "Faraday's Law",
                    "Electromagnetic Flux",
                    "Magnetic Field and Induction",
                    "Electronics and Measurements",
                    "Basic Electronics",
                    "Digital Electronics",
                    "Electronic Devices and Circuits",
                    "Microcontroller and Microprocessor",
                    "Electronic Measurements",
                    "Measuring Systems and Principles",
                    "Range Extension Methods",
                    "Cathode Ray Oscilloscope",
                    "LCD and LED Panel",
                    "Electronic Transducers"
                ],
                keywords: {
                    "Physics Fundamentals": ["physics", "fundamental", "basic", "principle", "law", "motion", "force", "newton", "mass", "acceleration", "gravity", "friction", "momentum", "impulse", "energy conservation", "mechanical", "thermal", "kinetic", "potential"],
                    "Units and Measurements": ["unit", "measurement", "si", "metric", "scale", "dimension", "meter", "kilogram", "second", "ampere", "kelvin", "mole", "candela", "length", "time", "area", "volume", "accuracy", "precision", "error", "least count", "vernier", "screw gauge", "caliper"],
                    "Mass Weight and Density": ["mass", "weight", "density", "kilogram", "gram", "volume", "specific gravity", "relative density", "buoyancy", "archimedes", "floating", "sinking", "displacement", "upthrust", "kg/m³", "g/cm³"],
                    "Work Power and Energy": ["work", "power", "energy", "kinetic", "potential", "joule", "watt", "mechanical", "conservation", "transformation", "efficiency", "machine", "lever", "pulley", "inclined plane", "wedge", "screw", "wheel and axle", "force", "displacement", "time"],
                    "Speed and Velocity": ["speed", "velocity", "acceleration", "motion", "displacement", "distance", "time", "uniform", "non-uniform", "average", "instantaneous", "relative", "graphs", "v-t", "s-t", "equations of motion", "free fall"],
                    "Heat and Temperature": ["heat", "temperature", "thermal", "celsius", "fahrenheit", "kelvin", "thermometer", "expansion", "conduction", "convection", "radiation", "specific heat", "latent heat", "melting", "boiling", "evaporation", "condensation", "calorimeter", "calorimetry"],
                    "Electricity and Magnetism": ["electricity", "magnetism", "electric", "magnetic", "current", "voltage", "resistance", "power", "energy", "charge", "field", "force", "attraction", "repulsion", "north pole", "south pole", "compass", "electromagnet"],
                    "Electric Charge and Field": ["charge", "electric field", "coulomb", "positive", "negative", "electron", "proton", "ion", "electrostatic", "force", "attraction", "repulsion", "field lines", "intensity", "potential difference", "work done"],
                    "Electric Potential": ["potential", "voltage", "volt", "potential difference", "electric field", "work", "charge", "equipotential", "surface", "earth", "ground", "reference", "absolute", "relative"],
                    "Simple Electric Circuits": ["circuit", "series", "parallel", "resistor", "capacitor", "inductor", "battery", "cell", "switch", "ammeter", "voltmeter", "galvanometer", "rheostat", "potentiometer", "emf", "terminal voltage", "internal resistance"],
                    "Conductors and Non-conductors": ["conductor", "insulator", "non-conductor", "resistance", "resistivity", "conductivity", "copper", "aluminum", "silver", "gold", "carbon", "rubber", "plastic", "glass", "wood", "air", "free electrons", "bound electrons"],
                    "Ohm's Law and Limitations": ["ohm", "ohm's law", "resistance", "current", "voltage", "V=IR", "proportional", "linear", "non-linear", "temperature", "limitations", "constant", "variable", "semiconductor", "diode"],
                    "Resistances in Series and Parallel": ["resistance", "series", "parallel", "equivalent", "total", "combination", "current division", "voltage division", "same current", "same voltage", "addition", "reciprocal"],
                    "Relation between Electric Potential and Voltage": ["potential", "voltage", "relation", "difference", "electric field", "work", "charge", "gradient", "equipotential", "reference point"],
                    "Ampere's Law": ["ampere", "ampere's law", "magnetic field", "current", "circular", "loop", "solenoid", "toroid", "flux", "line integral", "right hand rule"],
                    "Magnetic Force on Moving Charged Particle": ["magnetic force", "charged particle", "motion", "lorentz force", "velocity", "magnetic field", "perpendicular", "circular path", "radius", "cyclotron", "deflection"],
                    "Long Straight Conductors": ["conductor", "straight", "magnetic field", "biot-savart", "right hand rule", "concentric circles", "distance", "current", "wire", "cable"],
                    "Electromagnetic Induction": ["electromagnetic", "induction", "induced", "emf", "current", "flux", "change", "faraday", "lenz", "eddy current", "transformer", "generator", "motor"],
                    "Faraday's Law": ["faraday", "faraday's law", "electromagnetic induction", "flux", "emf", "rate of change", "coil", "turns", "linking", "magnetic field"],
                    "Electromagnetic Flux": ["flux", "electromagnetic", "magnetic flux", "weber", "field lines", "area", "angle", "perpendicular", "parallel", "surface", "total flux"],
                    "Magnetic Field and Induction": ["magnetic field", "induction", "induced current", "self induction", "mutual induction", "inductance", "henry", "solenoid", "coil", "core", "air core", "iron core"],
                    "Electronics and Measurements": ["electronics", "measurement", "electronic", "instruments", "meters", "digital", "analog", "accuracy", "precision", "calibration", "range", "sensitivity"],
                    "Basic Electronics": ["electronics", "diode", "transistor", "semiconductor", "p-type", "n-type", "junction", "forward bias", "reverse bias", "rectifier", "amplifier", "oscillator", "filter", "regulator", "silicon", "germanium"],
                    "Digital Electronics": ["digital", "binary", "logic gate", "flip flop", "counter", "register", "decoder", "encoder", "multiplexer", "demultiplexer", "and", "or", "not", "nand", "nor", "xor", "truth table", "boolean algebra"],
                    "Electronic Devices and Circuits": ["electronic device", "circuit", "amplifier", "operational amplifier", "op-amp", "feedback", "gain", "input", "output", "impedance", "frequency response", "bandwidth", "distortion"],
                    "Microcontroller and Microprocessor": ["microcontroller", "microprocessor", "embedded", "cpu", "memory", "rom", "ram", "input/output", "port", "pin", "programming", "assembly", "c language", "interrupt", "timer"],
                    "Electronic Measurements": ["electronic measurement", "multimeter", "oscilloscope", "function generator", "power supply", "dc", "ac", "rms", "peak", "frequency", "period", "phase", "waveform"],
                    "Measuring Systems and Principles": ["measuring system", "principle", "accuracy", "precision", "resolution", "linearity", "hysteresis", "drift", "noise", "interference", "shielding", "grounding"],
                    "Range Extension Methods": ["range extension", "method", "scale", "multiplier", "shunt", "transformer", "attenuator", "amplifier", "current transformer", "potential transformer", "burden"],
                    "Cathode Ray Oscilloscope": ["cathode ray", "oscilloscope", "cro", "waveform", "time base", "vertical", "horizontal", "trigger", "sweep", "trace", "phosphor", "screen", "electron beam"],
                    "LCD and LED Panel": ["lcd", "led", "display", "panel", "liquid crystal", "light emitting diode", "seven segment", "dot matrix", "backlight", "contrast", "brightness", "pixel", "resolution"],
                    "Electronic Transducers": ["transducer", "sensor", "convert", "input", "output", "temperature", "pressure", "displacement", "force", "strain", "light", "sound", "active", "passive", "linear", "non-linear"]
                }
            },
            "Mixed/Practice Books": {
                chapters: [
                    "General Practice",
                    "Previous Year Questions",
                    "Mock Test Questions", 
                    "Combined Practice",
                    "Subject-wise Practice",
                    "Topic-wise Practice",
                    "Difficulty-wise Practice"
                ],
                keywords: {
                    "General Practice": ["practice", "general", "mixed", "various", "different", "multiple", "comprehensive", "all", "complete", "full", "total", "overall", "entire", "whole", "broad", "wide", "diverse", "assorted", "varied"],
                    "Previous Year Questions": ["previous year", "pyq", "past", "exam", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "old", "earlier", "before", "solved", "solution", "answer key", "explanation", "analysis", "trend", "pattern"],
                    "Mock Test Questions": ["mock test", "mock", "test", "simulation", "practice test", "sample", "model", "trial", "dummy", "fake", "rehearsal", "preparation", "training", "exercise", "drill", "warm-up"],
                    "Combined Practice": ["combined", "all subjects", "comprehensive", "complete", "integrated", "unified", "merged", "together", "collective", "joint", "mixed subjects", "multi-subject", "cross-subject", "inter-disciplinary"],
                    "Subject-wise Practice": ["subject wise", "mathematics", "reasoning", "awareness", "science", "computer", "maths", "math", "gk", "ga", "general knowledge", "logical", "analytical", "technical", "non-technical", "aptitude"],
                    "Topic-wise Practice": ["topic wise", "chapter wise", "specific topic", "particular", "individual", "separate", "distinct", "focused", "targeted", "specialized", "dedicated", "exclusive", "concentrated"],
                    "Difficulty-wise Practice": ["difficulty", "easy", "medium", "hard", "level", "beginner", "intermediate", "advanced", "simple", "moderate", "complex", "challenging", "tough", "basic", "standard", "high"]
                }
            }
        };
        
        // Add specialized PYQ patterns and common question indicators for better detection
        this.questionPatterns = {
            // Common question starters
            starters: [
                "which of the following", "what is", "who is", "where is", "when was", "how many", "how much",
                "if", "find", "calculate", "solve", "determine", "identify", "choose", "select", "pick",
                "the value of", "the result of", "the answer is", "the correct option", "most appropriate",
                "best describes", "according to", "as per", "in accordance with", "based on"
            ],
            
            // Question formats commonly found in RRB
            formats: [
                "choose the correct answer", "select the right option", "mark the correct", "tick the appropriate",
                "which one is correct", "which statement is true", "which is false", "odd one out",
                "complete the series", "find the missing", "next in sequence", "arrange in order",
                "arrange the following", "match the following", "assertion and reason", "statement and conclusion"
            ],
            
            // RRB specific terminology
            rrb_terms: [
                "rrb", "railway", "technician", "loco pilot", "assistant loco pilot", "group d", "ntpc",
                "je", "junior engineer", "sse", "senior section engineer", "station master", "goods guard",
                "track maintainer", "helper", "pointsman", "signal", "signalling", "telecommunication",
                "electrical", "mechanical", "civil", "electronic", "computer", "railway recruitment board"
            ],
            
            // Mathematical expressions and symbols
            math_expressions: [
                "=", "+", "-", "×", "÷", "√", "²", "³", "°", "%", "∞", "∠", "△", "□", "○",
                "sin", "cos", "tan", "log", "ln", "∑", "∏", "∫", "∂", "≤", "≥", "≠", "≈", "∝"
            ]
        };
    }

    initializeApp() {
        console.log('Initializing Mock Test App...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.startApp();
            });
        } else {
            this.startApp();
        }
    }

    startApp() {
        this.loadSampleData();
        this.fixExistingQuestions();
        this.loadPDFJS();
        this.setupEventListeners();
        this.checkExistingUser();
        console.log('App initialization complete');
    }

    async loadPDFJS() {
        // Load PDF.js library if not already loaded
        if (typeof pdfjsLib === 'undefined') {
            try {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.onload = () => {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    console.log('PDF.js loaded successfully');
                };
                script.onerror = () => {
                    console.error('Failed to load PDF.js');
                };
                document.head.appendChild(script);
            } catch (error) {
                console.error('Error loading PDF.js:', error);
            }
        }
    }

    loadSampleData() {
        // Load sample questions if none exist
        if (this.questions.length === 0) {
            const sampleQuestions = [
                {
                    id: "q1",
                    text: "If a train travels 60 km in 1 hour, what is its speed in m/s?",
                    options: ["16.67 m/s", "60 m/s", "3600 m/s", "1000 m/s"],
                    correctAnswer: 0,
                    explanation: "Speed = 60 km/h = 60 × 1000 ÷ 3600 = 16.67 m/s",
                    subject: "Mathematics",
                    chapter: "Speed and Time",
                    difficulty: "Easy",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q2", 
                    text: "What is 25% of 80?",
                    options: ["15", "20", "25", "30"],
                    correctAnswer: 1,
                    explanation: "25% of 80 = (25/100) × 80 = 20",
                    subject: "Mathematics",
                    chapter: "Percentages",
                    difficulty: "Easy",
                    isPYQ: false,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q3",
                    text: "In a certain code, 'MONITOR' is written as 'LNMHSNQ'. How will 'DISPLAY' be written?",
                    options: ["CHROKZX", "CHRPKZX", "CHROKYX", "CHRPLYX"],
                    correctAnswer: 0,
                    explanation: "Each letter is moved one position back in the alphabet. D→C, I→H, S→R, P→O, L→K, A→Z, Y→X",
                    subject: "General Intelligence & Reasoning",
                    chapter: "Coding and Decoding",
                    difficulty: "Medium",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q4",
                    text: "Which of the following is a conductor of electricity?",
                    options: ["Rubber", "Copper", "Glass", "Wood"],
                    correctAnswer: 1,
                    explanation: "Copper is a good conductor of electricity due to free electrons in its structure",
                    subject: "Basic Science & Engineering",
                    chapter: "Basic Electricity",
                    difficulty: "Easy",
                    isPYQ: false,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q5",
                    text: "Who is the current Prime Minister of India?",
                    options: ["Rahul Gandhi", "Narendra Modi", "Arvind Kejriwal", "Mamata Banerjee"],
                    correctAnswer: 1,
                    explanation: "Narendra Modi has been the Prime Minister of India since 2014",
                    subject: "General Awareness",
                    chapter: "Current Affairs",
                    difficulty: "Easy",
                    isPYQ: false,
                    source: "Manual",
                    needsReview: false
                },
                // Additional questions for better testing
                {
                    id: "q6",
                    text: "If the sum of two numbers is 20 and their difference is 6, find the larger number.",
                    options: ["13", "14", "15", "16"],
                    correctAnswer: 0,
                    explanation: "Let the numbers be x and y. x + y = 20, x - y = 6. Solving: x = 13, y = 7",
                    subject: "Mathematics",
                    chapter: "Linear Equations",
                    difficulty: "Medium",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q7",
                    text: "Find the next term in the series: 2, 6, 18, 54, ?",
                    options: ["162", "108", "126", "144"],
                    correctAnswer: 0,
                    explanation: "Each term is multiplied by 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162",
                    subject: "General Intelligence & Reasoning",
                    chapter: "Number Series",
                    difficulty: "Easy",
                    isPYQ: false,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q8",
                    text: "Which programming language is primarily used for web development?",
                    options: ["Python", "JavaScript", "C++", "Java"],
                    correctAnswer: 1,
                    explanation: "JavaScript is the primary language for client-side web development",
                    subject: "Computer Applications",
                    chapter: "Programming Languages",
                    difficulty: "Easy",
                    isPYQ: false,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q9",
                    text: "What is the unit of electrical resistance?",
                    options: ["Volt", "Ampere", "Ohm", "Watt"],
                    correctAnswer: 2,
                    explanation: "Ohm (Ω) is the unit of electrical resistance, named after Georg Ohm",
                    subject: "Basic Science & Engineering",
                    chapter: "Basic Electricity",
                    difficulty: "Easy",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q10",
                    text: "Which Indian state has the longest coastline?",
                    options: ["Tamil Nadu", "Gujarat", "Maharashtra", "Andhra Pradesh"],
                    correctAnswer: 1,
                    explanation: "Gujarat has the longest coastline in India, approximately 1,600 km",
                    subject: "General Awareness",
                    chapter: "Indian Geography",
                    difficulty: "Medium",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q11",
                    text: "What is the area of a circle with radius 7 cm? (Use π = 22/7)",
                    options: ["154 cm²", "144 cm²", "164 cm²", "174 cm²"],
                    correctAnswer: 0,
                    explanation: "Area = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm²",
                    subject: "Mathematics",
                    chapter: "Geometry",
                    difficulty: "Easy",
                    isPYQ: false,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q12",
                    text: "In Excel, which function is used to find the maximum value in a range?",
                    options: ["MAX()", "MAXIMUM()", "LARGE()", "HIGH()"],
                    correctAnswer: 0,
                    explanation: "MAX() function returns the largest value among the given values",
                    subject: "Computer Applications",
                    chapter: "MS Office",
                    difficulty: "Easy",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                }
            ];
            
            this.questions = sampleQuestions;
            this.saveQuestions();
            console.log(`Initialized with ${sampleQuestions.length} sample questions`);
        }
    }

    fixExistingQuestions() {
        let hasChanges = false;
        
        this.questions = this.questions.map(question => {
            const original = JSON.stringify(question);
            const validated = this.validateQuestionData(question);
            
            if (original !== JSON.stringify(validated)) {
                hasChanges = true;
                console.log('Fixed question:', question.id, 'from', question.subject, 'to', validated.subject);
            }
            
            return validated;
        });
        
        if (hasChanges) {
            this.saveQuestions();
            console.log('Fixed existing questions with undefined values');
        }
    }

    validateQuestionData(question) {
        // Ensure all required fields exist with proper defaults
        const validated = {
            id: question.id || 'q_' + Date.now(),
            text: question.text || 'No question text',
            options: question.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : 0,
            explanation: question.explanation || 'No explanation provided',
            subject: question.subject || 'General',
            chapter: question.chapter || 'Miscellaneous',
            difficulty: question.difficulty || 'Medium',
            isPYQ: question.isPYQ || false,
            source: question.source || 'Manual',
            needsReview: question.needsReview !== undefined ? question.needsReview : false,
            questionNumber: question.questionNumber || null,
            extractionSource: question.extractionSource || null
        };

        // If the question has undefined values, log it for debugging
        if (question.subject === undefined || question.chapter === undefined) {
            console.warn('Question had undefined values:', question.id, question.subject, question.chapter);
        }

        return validated;
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Welcome screen
        this.setupElementListener('createUserBtn', 'click', (e) => {
            e.preventDefault();
            this.showUserModal();
        });

        // User management
        this.setupElementListener('saveUserBtn', 'click', (e) => {
            e.preventDefault();
            this.createUser();
        });

        this.setupElementListener('cancelUserBtn', 'click', (e) => {
            e.preventDefault();
            this.hideUserModal();
        });

        this.setupElementListener('switchUserBtn', 'click', (e) => {
            e.preventDefault();
            this.showUserSelection();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
            });
        });

        // Question Bank
        this.setupElementListener('addQuestionBtn', 'click', (e) => {
            e.preventDefault();
            this.showAddQuestionModal();
        });

        this.setupElementListener('uploadQuestionsBtn', 'click', (e) => {
            e.preventDefault();
            this.showModal('pdfUploadModal');
        });

        this.setupElementListener('saveQuestion', 'click', (e) => {
            e.preventDefault();
            this.saveQuestion();
        });

        this.setupElementListener('cancelQuestion', 'click', (e) => {
            e.preventDefault();
            this.hideModal('questionModal');
        });

        // PDF Upload
        this.setupElementListener('uploadPdfBtn', 'click', (e) => {
            e.preventDefault();
            this.showModal('pdfUploadModal');
        });

        this.setupElementListener('pdfFileInput', 'change', (e) => {
            this.handlePDFFileSelect(e);
        });

        this.setupElementListener('uploadZone', 'click', (e) => {
            document.getElementById('pdfFileInput')?.click();
        });

        // Add chapter dropdown change handler
        document.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'pdfChapter') {
                this.handleChapterChange();
            }
        });

        this.setupElementListener('processPDF', 'click', (e) => {
            e.preventDefault();
            this.processPDFForQuestions();
        });

        this.setupElementListener('cancelPDFUpload', 'click', (e) => {
            e.preventDefault();
            this.hideModal('pdfUploadModal');
            this.resetPDFUpload();
        });

        // PDF Viewer
        this.setupElementListener('closePdfViewer', 'click', (e) => {
            e.preventDefault();
            this.closePDFViewer();
        });

        this.setupElementListener('prevPage', 'click', (e) => {
            e.preventDefault();
            this.prevPDFPage();
        });

        this.setupElementListener('nextPage', 'click', (e) => {
            e.preventDefault();
            this.nextPDFPage();
        });

        this.setupElementListener('zoomIn', 'click', (e) => {
            e.preventDefault();
            this.zoomPDF(1.2);
        });

        this.setupElementListener('zoomOut', 'click', (e) => {
            e.preventDefault();
            this.zoomPDF(0.8);
        });

        // Test Selection
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleQuickAction(card.dataset.action);
            });
        });

        document.querySelectorAll('.test-type-card button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const testType = e.target.closest('.test-type-card').dataset.test;
                this.startTest(testType);
            });
        });

        this.setupElementListener('configureCustomTest', 'click', (e) => {
            e.preventDefault();
            this.showModal('customTestModal');
        });

        this.setupElementListener('startCustomTest', 'click', (e) => {
            e.preventDefault();
            this.startCustomTest();
        });

        this.setupElementListener('cancelCustomTest', 'click', (e) => {
            e.preventDefault();
            this.hideModal('customTestModal');
        });

        // Test Interface
        this.setupElementListener('nextQuestion', 'click', (e) => {
            e.preventDefault();
            this.nextQuestion();
        });

        this.setupElementListener('previousQuestion', 'click', (e) => {
            e.preventDefault();
            this.previousQuestion();
        });

        this.setupElementListener('markForReview', 'click', (e) => {
            e.preventDefault();
            this.markForReview();
        });

        this.setupElementListener('clearResponse', 'click', (e) => {
            e.preventDefault();
            this.clearResponse();
        });

        this.setupElementListener('submitTest', 'click', (e) => {
            e.preventDefault();
            this.submitTest();
        });

        // Analytics tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchAnalyticsTab(btn.dataset.tab);
            });
        });

        // Review filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterReviewQuestions(btn.dataset.filter);
            });
        });

        // Drag and drop for PDF upload
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('drag-over');
            });

            uploadZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handlePDFFile(files[0]);
                }
            });
        }

        // Question Bank Search and Filtering
        this.setupElementListener('searchQuestions', 'input', (e) => {
            this.filterQuestions();
        });

        this.setupElementListener('subjectFilter', 'change', (e) => {
            this.filterQuestions();
        });

        this.setupElementListener('difficultyFilter', 'change', (e) => {
            this.filterQuestions();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        console.log('Event listeners setup complete');
    }

    setupElementListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            console.log(`Event listener added for ${elementId}`);
        } else {
            console.warn(`Element ${elementId} not found`);
        }
    }

    // PDF Handling Methods
    handlePDFFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handlePDFFile(file);
        }
    }

    handlePDFFile(file) {
        if (!file) {
            console.warn('No file provided');
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Please select a PDF file.');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            alert('File size too large. Please select a file smaller than 50MB.');
            return;
        }

        this.currentPDFFile = file;
        this.displayPDFInfo(file);
    }

    displayPDFInfo(file) {
        const infoDiv = document.getElementById('pdfInfo');
        if (infoDiv) {
            infoDiv.innerHTML = `
                <div class="pdf-file-info">
                    <h4>📄 ${file.name}</h4>
                    <p><strong>Size:</strong> ${this.formatFileSize(file.size)}</p>
                    <p><strong>Type:</strong> ${file.type}</p>
                    <div class="pdf-metadata">
                        <div class="form-group">
                            <label class="form-label">Subject: <span class="required">*</span></label>
                            <select id="pdfSubject" class="form-control" required onchange="app.updateChapterOptions()">
                                <option value="">-- Select Subject --</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="General Intelligence & Reasoning">General Intelligence & Reasoning</option>
                                <option value="Basic Science & Engineering">Basic Science & Engineering</option>
                                <option value="General Awareness">General Awareness</option>
                                <option value="Basics of Computers and Applications">Basics of Computers and Applications</option>
                                <option value="Mixed/Practice Books">📚 Mixed/Practice Books (All Subjects)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Chapter/Topic: <span class="required">*</span></label>
                            <select id="pdfChapter" class="form-control" required style="display: none;">
                                <option value="">-- Select Chapter --</option>
                            </select>
                            <input type="text" id="pdfChapterCustom" class="form-control" placeholder="Enter chapter or topic (e.g., Algebra, Logical Reasoning)" required>
                            <div class="chapter-suggestions" id="chapterSuggestions" style="display: none;"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <input type="checkbox" id="autoDetectChapter" checked> 
                                🤖 Auto-detect chapters from question content
                            </label>
                            <small class="form-help">When enabled, the system will analyze question content and suggest appropriate chapters based on the RRB syllabus.</small>
                        </div>
                        <div class="form-help">
                            <p><small>💡 These values will be applied to all extracted questions</small></p>
                        </div>
                    </div>
                </div>
            `;
            infoDiv.style.display = 'block';
            
            // Focus on the subject dropdown
            setTimeout(() => {
                const subjectSelect = document.getElementById('pdfSubject');
                if (subjectSelect) {
                    subjectSelect.focus();
                }
            }, 100);
        }
    }

    updateChapterOptions() {
        const subjectSelect = document.getElementById('pdfSubject');
        const chapterSelect = document.getElementById('pdfChapter');
        const chapterCustom = document.getElementById('pdfChapterCustom');
        
        if (!subjectSelect || !chapterSelect || !chapterCustom) return;
        
        const selectedSubject = subjectSelect.value;
        
        if (selectedSubject && this.syllabusMapping[selectedSubject]) {
            // Show dropdown for predefined subjects
            chapterSelect.style.display = 'block';
            chapterCustom.style.display = 'none';
            
            // Clear and populate chapter options
            chapterSelect.innerHTML = '<option value="">-- Select Chapter --</option>';
            
            this.syllabusMapping[selectedSubject].chapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter;
                option.textContent = chapter;
                chapterSelect.appendChild(option);
            });
            
            // Add custom option
            const customOption = document.createElement('option');
            customOption.value = 'custom';
            customOption.textContent = '✏️ Enter Custom Chapter/Topic';
            chapterSelect.appendChild(customOption);
            
        } else {
            // Show custom input for mixed/practice books or when no subject selected
            chapterSelect.style.display = 'none';
            chapterCustom.style.display = 'block';
            
            if (selectedSubject === 'Mixed/Practice Books') {
                chapterCustom.placeholder = 'e.g., "Previous Year Questions 2023", "Mock Test Set 1", "Combined Practice"';
            }
        }
    }

    // Handle chapter dropdown change
    handleChapterChange() {
        const chapterSelect = document.getElementById('pdfChapter');
        const chapterCustom = document.getElementById('pdfChapterCustom');
        
        if (chapterSelect && chapterCustom) {
            if (chapterSelect.value === 'custom') {
                chapterSelect.style.display = 'none';
                chapterCustom.style.display = 'block';
                chapterCustom.focus();
            }
        }
    }

    // Enhanced intelligent chapter detection based on question content
    detectChapterFromContent(questions, subject) {
        if (!questions || questions.length === 0 || !subject || subject === 'Mixed/Practice Books') {
            return null;
        }

        const subjectMapping = this.syllabusMapping[subject];
        if (!subjectMapping) {
            console.warn('No mapping found for subject:', subject);
            return { chapter: 'General', confidence: 0 };
        }

        // Enhanced analysis: combine all question content
        let combinedContent = '';
        questions.forEach(q => {
            if (q.text) combinedContent += q.text.toLowerCase() + ' ';
            if (q.options && Array.isArray(q.options)) {
                combinedContent += q.options.join(' ').toLowerCase() + ' ';
            }
            if (q.explanation) combinedContent += q.explanation.toLowerCase() + ' ';
        });

        // Remove common stop words and normalize
        const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'over', 'under', 'again', 'further', 'then', 'once'];
        
        const words = combinedContent.split(/\s+/).filter(word => 
            word.length > 2 && !stopWords.includes(word) && !/^\d+$/.test(word)
        );

        const chapterScores = {};
        const detailAnalysis = {};

        // Initialize scores for all chapters
        subjectMapping.chapters.forEach(chapter => {
            chapterScores[chapter] = 0;
            detailAnalysis[chapter] = {
                matches: [],
                score: 0,
                patterns: []
            };
        });

        // Advanced scoring algorithm
        Object.keys(subjectMapping.keywords).forEach(chapter => {
            const keywords = subjectMapping.keywords[chapter];
            let chapterScore = 0;
            let matches = [];
            let patterns = [];

            keywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                
                // Exact match (highest score)
                if (combinedContent.includes(keywordLower)) {
                    const occurrences = (combinedContent.match(new RegExp(keywordLower, 'g')) || []).length;
                    const baseScore = Math.min(occurrences * 10, 50); // Cap at 50 for single keyword
                    chapterScore += baseScore;
                    matches.push(`${keyword} (${occurrences}x)`);
                    
                    // Bonus for keyword prominence (appears in question text vs options)
                    questions.forEach(q => {
                        if (q.text && q.text.toLowerCase().includes(keywordLower)) {
                            chapterScore += 5; // Question text bonus
                            patterns.push(`"${keyword}" in question text`);
                        }
                    });
                }

                // Partial/fuzzy matching for technical terms
                if (keyword.length > 4) {
                    const partialMatches = words.filter(word => {
                        return word.includes(keywordLower) || keywordLower.includes(word);
                    });
                    
                    if (partialMatches.length > 0) {
                        chapterScore += partialMatches.length * 3;
                        matches.push(`~${keyword} (${partialMatches.length} partial)`);
                    }
                }

                // Contextual matching for compound terms
                if (keyword.includes(' ')) {
                    const keywordParts = keyword.split(' ');
                    const allPartsFound = keywordParts.every(part => 
                        part.length > 2 && combinedContent.includes(part.toLowerCase())
                    );
                    
                    if (allPartsFound) {
                        chapterScore += 15; // Bonus for compound term
                        patterns.push(`Compound: "${keyword}"`);
                    }
                }
            });

            // Subject-specific pattern analysis
            if (subject === "Mathematics") {
                // Look for mathematical symbols and expressions
                const mathSymbols = this.questionPatterns.math_expressions.filter(symbol => 
                    combinedContent.includes(symbol)
                );
                
                if (mathSymbols.length > 0) {
                    chapterScore += mathSymbols.length * 2;
                    patterns.push(`Math symbols: ${mathSymbols.join(', ')}`);
                }

                // Detect calculation patterns
                if (/\d+[\+\-\×\÷]\d+/.test(combinedContent) || /calculate|find|solve/.test(combinedContent)) {
                    chapterScore += 10;
                    patterns.push("Calculation pattern detected");
                }
            }

            if (subject === "General Intelligence & Reasoning") {
                // Look for reasoning patterns
                const reasoningPatterns = ['series', 'sequence', 'pattern', 'analogy', 'code', 'relation'];
                reasoningPatterns.forEach(pattern => {
                    if (combinedContent.includes(pattern)) {
                        chapterScore += 8;
                        patterns.push(`Reasoning pattern: ${pattern}`);
                    }
                });
            }

            if (subject === "Basic Science & Engineering") {
                // Look for technical terms and units
                const techTerms = ['ohm', 'volt', 'ampere', 'watt', 'newton', 'joule', 'meter', 'second'];
                techTerms.forEach(term => {
                    if (combinedContent.includes(term)) {
                        chapterScore += 12;
                        patterns.push(`Technical term: ${term}`);
                    }
                });
            }

            // Store detailed analysis
            detailAnalysis[chapter] = {
                matches: matches,
                score: chapterScore,
                patterns: patterns
            };

            chapterScores[chapter] = chapterScore;
        });

        // Find the best match
        const sortedChapters = Object.keys(chapterScores).sort((a, b) => chapterScores[b] - chapterScores[a]);
        const bestChapter = sortedChapters[0];
        const bestScore = chapterScores[bestChapter];
        const secondBestScore = chapterScores[sortedChapters[1]] || 0;

        // Calculate confidence based on score and gap
        let confidence = 0;
        if (bestScore > 0) {
            const scoreGap = bestScore - secondBestScore;
            const totalWords = words.length;
            
            // Base confidence from raw score
            confidence = Math.min((bestScore / Math.max(totalWords * 2, 10)) * 100, 90);
            
            // Boost confidence if there's a clear gap between first and second choice
            if (scoreGap > 10) {
                confidence += 10;
            }
            
            // Adjust for number of questions (more questions = higher confidence potential)
            if (questions.length > 5) {
                confidence += 5;
            }
            
            // Ensure minimum confidence for very strong matches
            if (bestScore > 30) {
                confidence = Math.max(confidence, 40);
            }
            
            // Cap confidence
            confidence = Math.min(confidence, 95);
        }

        const result = {
            chapter: bestChapter,
            confidence: Math.round(confidence),
            score: bestScore,
            alternatives: sortedChapters.slice(1, 4).map(ch => ({
                chapter: ch,
                score: chapterScores[ch],
                confidence: Math.round((chapterScores[ch] / Math.max(bestScore, 1)) * confidence)
            })),
            analysis: detailAnalysis[bestChapter],
            questionCount: questions.length,
            wordCount: words.length,
            allScores: chapterScores  // Keep for backward compatibility
        };

        console.log('Enhanced Chapter Detection Result:', {
            subject: subject,
            detected: bestChapter,
            confidence: confidence,
            score: bestScore,
            alternatives: result.alternatives.slice(0, 2),
            keyMatches: detailAnalysis[bestChapter].matches.slice(0, 5),
            patterns: detailAnalysis[bestChapter].patterns.slice(0, 3)
        });

        return result;
    }

    // NEW: Detect practice sets from PDF content (Enhanced for RRB 100-question sets)
    detectPracticeSets(text) {
        console.log('Detecting RRB practice sets from PDF content...');
        
        const practiceSets = [];
        
        // RRB-specific practice set patterns based on your PDF format
        const practiceSetPatterns = [
            /PRACTICE\s+SET\s*[-:\s]*(\d+)/gi,
            /Practice\s+Set\s*[-:\s]*(\d+)/gi,
            /SET\s*[-:\s]*(\d+)/gi,
            /Test\s*[-:\s]*(\d+)/gi,
            /Mock\s+Test\s*[-:\s]*(\d+)/gi,
            /Paper\s*[-:\s]*(\d+)/gi,
            /(?:^|\n)\s*(\d+)\s*\.\s*(?:Practice|Set|Test)/gi
        ];
        
        // Find all practice set headers
        let setMatches = [];
        practiceSetPatterns.forEach(pattern => {
            let match;
            pattern.lastIndex = 0; // Reset regex for each pattern
            while ((match = pattern.exec(text)) !== null) {
                const setNumber = parseInt(match[1]);
                if (setNumber >= 1 && setNumber <= 20) { // Reasonable range for practice sets
                    setMatches.push({
                        setNumber: setNumber,
                        index: match.index,
                        fullMatch: match[0],
                        endIndex: match.index + match[0].length
                    });
                }
            }
        });
        
        // Remove duplicates and sort by position
        setMatches = setMatches.filter((match, index, self) => 
            index === self.findIndex(m => 
                Math.abs(m.setNumber - match.setNumber) < 1 && 
                Math.abs(m.index - match.index) < 200
            )
        ).sort((a, b) => a.index - b.index);
        
        console.log('Found practice set headers:', setMatches.length, setMatches);
        
        // Extract questions for each set
        setMatches.forEach((setMatch, index) => {
            const startIndex = setMatch.endIndex;
            const endIndex = index < setMatches.length - 1 ? setMatches[index + 1].index : text.length;
            const setContent = text.substring(startIndex, endIndex);
            
            console.log(`Extracting questions for Practice Set ${setMatch.setNumber}...`);
            const questions = this.extractRRBQuestionsFromSection(setContent, setMatch.setNumber);
            
            if (questions.length >= 30) { // Accept sets with substantial questions
                // Generate solutions for extracted questions
                const questionsWithSolutions = questions.map(q => ({
                    ...q,
                    solution: q.solution || this.generateRRBSolution(q),
                    hasDetailedSolution: !!q.solution,
                    reviewData: {
                        timeSpent: 0,
                        attempts: 0,
                        lastAttempt: null,
                        isCorrect: null,
                        confidence: 0
                    }
                }));
                
                const setData = {
                    setNumber: setMatch.setNumber,
                    title: `RRB Practice Set ${setMatch.setNumber}`,
                    questions: questionsWithSolutions,
                    totalQuestions: questionsWithSolutions.length,
                    timeLimit: 90, // 90 minutes as per RRB exam pattern
                    difficulty: this.calculateSetDifficulty(questionsWithSolutions),
                    subject: 'RRB Technician',
                    extractedFrom: this.currentPDFMetadata?.filename || 'Practice Book PDF',
                    subjectDistribution: this.analyzeRRBSubjectDistribution(questionsWithSolutions),
                    examPattern: 'RRB Technician CBT',
                    maxMarks: questionsWithSolutions.length,
                    passingMarks: Math.ceil(questionsWithSolutions.length * 0.4), // 40% passing
                    questionsWithSolutions: questionsWithSolutions.filter(q => q.hasDetailedSolution).length,
                    estimatedTime: 90,
                    instructions: [
                        '90 minutes for 100 questions',
                        'Each question carries 1 mark',
                        'No negative marking',
                        '40% marks required to qualify'
                    ]
                };
                
                practiceSets.push(setData);
                console.log(`Practice Set ${setMatch.setNumber} extracted: ${questionsWithSolutions.length} questions`);
            } else {
                console.log(`Practice Set ${setMatch.setNumber} skipped: insufficient questions (${questions.length})`);
            }
        });
        
        console.log('Final detected practice sets:', practiceSets.length);
        return practiceSets;
    }

    // Extract questions specifically from RRB practice set sections
    extractRRBQuestionsFromSection(sectionText, setNumber) {
        console.log(`Extracting RRB questions from Practice Set ${setNumber}...`);
        
        // Multiple extraction strategies for RRB format
        let questions = [];
        
        // Strategy 1: Direct pattern matching for RRB format
        const rrbPatterns = [
            // Standard format: 1. Question text A) option1 B) option2 C) option3 D) option4
            /(\d+)\.\s*([^A-D]+?)\s*A\)\s*([^B]+?)\s*B\)\s*([^C]+?)\s*C\)\s*([^D]+?)\s*D\)\s*([^1-9]+?)(?=\s*\d+\.|$)/gi,
            // Format with parentheses: 1. Question text (A) option1 (B) option2 (C) option3 (D) option4
            /(\d+)\.\s*([^(]+?)\s*\(A\)\s*([^(]+?)\s*\(B\)\s*([^(]+?)\s*\(C\)\s*([^(]+?)\s*\(D\)\s*([^1-9]+?)(?=\s*\d+\.|$)/gi,
            // Compact format without clear separators
            /(\d+)\.\s*([^?!.]*[?!.])\s*A\)\s*([^B]+?)\s*B\)\s*([^C]+?)\s*C\)\s*([^D]+?)\s*D\)\s*([^1-9]+?)(?=\s*\d+\.|$)/gi
        ];
        
        rrbPatterns.forEach((pattern, patternIndex) => {
            let match;
            pattern.lastIndex = 0;
            while ((match = pattern.exec(sectionText)) !== null && questions.length < 150) {
                const questionNumber = parseInt(match[1]);
                const questionText = this.cleanQuestionText(match[2]);
                const options = [
                    this.cleanOptionText(match[3]),
                    this.cleanOptionText(match[4]),
                    this.cleanOptionText(match[5]),
                    this.cleanOptionText(match[6])
                ];
                
                if (this.isValidRRBQuestion(questionText, options, questionNumber)) {
                    const question = {
                        id: `rrb_set${setNumber}_q${questionNumber}_${Date.now()}`,
                        text: questionText,
                        options: options,
                        correctAnswer: 0, // Will be determined later
                        explanation: 'Extracted from RRB Practice Set - verify answer',
                        subject: this.detectRRBSubject(questionText),
                        chapter: this.detectChapterFromContent([{text: questionText, options}], this.detectRRBSubject(questionText))?.chapter || 'General',
                        difficulty: this.guessDifficulty(questionText),
                        isPYQ: false,
                        source: `RRB Practice Set ${setNumber}`,
                        needsReview: true,
                        questionNumber: questionNumber,
                        setNumber: setNumber,
                        extractionSource: `Pattern ${patternIndex + 1}`,
                        timeAllotted: 54 // 54 seconds per question in RRB CBT
                    };
                    
                    questions.push(question);
                }
            }
        });
        
        // Remove duplicates based on question number
        questions = questions.filter((q, index, self) => 
            index === self.findIndex(other => other.questionNumber === q.questionNumber)
        );
        
        // Sort by question number
        questions.sort((a, b) => a.questionNumber - b.questionNumber);
        
        console.log(`Extracted ${questions.length} questions from RRB Practice Set ${setNumber}`);
        return questions;
    }

    // Validate RRB-specific question format
    isValidRRBQuestion(questionText, options, questionNumber) {
        // Basic validation
        if (!questionText || questionText.length < 5 || questionText.length > 800) return false;
        if (!options || options.length !== 4) return false;
        if (!options.every(opt => opt && opt.trim().length > 0 && opt.trim().length < 300)) return false;
        if (!questionNumber || questionNumber < 1 || questionNumber > 150) return false;
        
        // RRB-specific validation
        const invalidPatterns = [
            /click here/i,
            /telegram/i,
            /join.*channel/i,
            /made with.*editor/i,
            /page \d+/i,
            /^\d+\.\d+%/,
            /^\d{1,2}\/\d{1,2}\/\d{4}/
        ];
        
        if (invalidPatterns.some(pattern => pattern.test(questionText))) return false;
        
        // Ensure reasonable content
        if (questionText.split(' ').length < 3) return false;
        
        return true;
    }

    // Detect subject for RRB questions
    detectRRBSubject(questionText) {
        const text = questionText.toLowerCase();
        
        // Subject classification based on RRB syllabus
        const subjects = {
            'General Awareness': [
                'current affairs', 'india', 'world', 'sports', 'politics', 'geography',
                'history', 'culture', 'economics', 'government', 'constitution', 'freedom'
            ],
            'General Intelligence': [
                'analogies', 'series', 'coding', 'decoding', 'relationships', 'syllogism',
                'venn', 'diagram', 'classification', 'directions', 'blood relations'
            ],
            'Basic Computers': [
                'computer', 'software', 'hardware', 'internet', 'email', 'ms office',
                'windows', 'linux', 'network', 'storage', 'input', 'output'
            ],
            'Mathematics': [
                'number', 'rational', 'irrational', 'quadratic', 'arithmetic', 'progression',
                'triangle', 'pythagoras', 'geometry', 'trigonometry', 'statistics', 'probability'
            ],
            'Basic Science': [
                'physics', 'chemistry', 'biology', 'force', 'energy', 'electricity',
                'magnetism', 'heat', 'light', 'sound', 'atom', 'element', 'cell'
            ]
        };
        
        for (const [subject, keywords] of Object.entries(subjects)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return subject;
            }
        }
        
        return 'General';
    }

    // Analyze subject distribution in practice set
    analyzeRRBSubjectDistribution(questions) {
        const distribution = {};
        questions.forEach(q => {
            const subject = q.subject || 'General';
            distribution[subject] = (distribution[subject] || 0) + 1;
        });
        return distribution;
    }

    // Generate RRB-specific solution
    generateRRBSolution(question) {
        if (!question || !question.text) {
            return 'Solution not available for this question.';
        }

        const subject = question.subject || 'General';
        let solution = `<div class="solution-container">
            <h4>Solution for ${subject} Question</h4>
            <p><strong>Question:</strong> ${question.text}</p>
            <div class="solution-steps">`;

        // Subject-specific solution templates
        switch (subject) {
            case 'Mathematics':
                solution += `
                    <p><strong>Step 1:</strong> Identify the type of mathematical problem</p>
                    <p><strong>Step 2:</strong> Apply relevant formula or concept</p>
                    <p><strong>Step 3:</strong> Calculate step by step</p>
                    <p><strong>Step 4:</strong> Verify the answer</p>`;
                break;
            case 'Basic Science':
                solution += `
                    <p><strong>Concept:</strong> This question tests basic scientific principles</p>
                    <p><strong>Key Points:</strong> Review the fundamental concepts related to this topic</p>
                    <p><strong>Application:</strong> Apply the scientific law or principle</p>`;
                break;
            case 'General Intelligence':
                solution += `
                    <p><strong>Pattern:</strong> Identify the logical pattern or relationship</p>
                    <p><strong>Method:</strong> Apply reasoning techniques</p>
                    <p><strong>Verification:</strong> Check if the logic holds for all cases</p>`;
                break;
            case 'Basic Computers':
                solution += `
                    <p><strong>Concept:</strong> Computer fundamentals and applications</p>
                    <p><strong>Key Point:</strong> Remember basic computer terminology and functions</p>`;
                break;
            default:
                solution += `
                    <p><strong>Analysis:</strong> Read the question carefully</p>
                    <p><strong>Elimination:</strong> Rule out obviously incorrect options</p>
                    <p><strong>Selection:</strong> Choose the most appropriate answer</p>`;
        }

        solution += `
            </div>
            <div class="answer-explanation">
                <p><strong>Correct Answer:</strong> Option ${String.fromCharCode(65 + (question.correctAnswer || 0))}</p>
                <p><em>Note: Please verify this answer with authentic sources.</em></p>
            </div>
        </div>`;

        return solution;
    }

    // Generate basic solution for questions without detailed solutions
    generateBasicSolution(question) {
        if (!question || !question.text || !question.options) {
            return 'Solution not available';
        }
        
        // Generate a basic solution template
        const correctAnswerText = question.options[question.correctAnswer] || question.options[0];
        
        return `
<div class="solution-content">
    <div class="correct-answer">
        <h4>✅ Correct Answer:</h4>
        <p><strong>${String.fromCharCode(65 + (question.correctAnswer || 0))}) ${correctAnswerText}</strong></p>
    </div>
    
    <div class="explanation">
        <h4>📝 Explanation:</h4>
        <p>${question.explanation || 'This question requires careful analysis of the given options. The correct answer can be determined through logical reasoning and application of relevant concepts.'}</p>
    </div>
    
    <div class="key-points">
        <h4>🔑 Key Points to Remember:</h4>
        <ul>
            <li>Review the fundamental concepts related to this topic</li>
            <li>Practice similar questions to strengthen understanding</li>
            <li>Time management is crucial in competitive exams</li>
        </ul>
    </div>
    
    <div class="difficulty-info">
        <p><strong>Difficulty:</strong> <span class="difficulty-badge difficulty-${question.difficulty?.toLowerCase() || 'medium'}">${question.difficulty || 'Medium'}</span></p>
        <p><strong>Subject:</strong> ${question.subject || 'General'}</p>
        <p><strong>Chapter:</strong> ${question.chapter || 'Mixed'}</p>
    </div>
</div>`.trim();
    }

    // Extract questions from a specific section
    extractQuestionsFromSection(sectionText, setNumber) {
        const questions = this.extractQuestionsWithMultipleStrategies(sectionText);
        
        // Add set-specific metadata
        return questions.map((q, index) => ({
            ...q,
            setNumber,
            setQuestionNumber: index + 1,
            id: `set_${setNumber}_q_${index + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        }));
    }

    // Calculate difficulty level for a practice set
    calculateSetDifficulty(questions) {
        if (!questions || questions.length === 0) return 'Medium';
        
        const difficultyScores = { Easy: 1, Medium: 2, Hard: 3 };
        const averageScore = questions.reduce((sum, q) => {
            return sum + (difficultyScores[q.difficulty] || 2);
        }, 0) / questions.length;
        
        if (averageScore <= 1.5) return 'Easy';
        if (averageScore >= 2.5) return 'Hard';
        return 'Medium';
    }

    // Show chapter suggestions to user
    showChapterSuggestions(detectionResult, questions) {
        const suggestionsDiv = document.getElementById('chapterSuggestions');
        if (!suggestionsDiv || !detectionResult) return;

        const { chapter, confidence, allScores } = detectionResult;
        
        // Get top 3 suggestions
        const sortedChapters = Object.keys(allScores)
            .sort((a, b) => allScores[b] - allScores[a])
            .filter(ch => allScores[ch] > 0)
            .slice(0, 3);

        if (sortedChapters.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        let suggestionsHTML = `
            <div class="chapter-suggestions-content">
                <h4>🤖 AI Chapter Suggestions</h4>
                <p>Based on ${questions.length} extracted questions:</p>
                <div class="suggestions-list">
        `;

        sortedChapters.forEach((ch, index) => {
            const score = allScores[ch];
            const conf = Math.round((score / questions.length) * 100);
            const isTop = index === 0;
            
            suggestionsHTML += `
                <div class="suggestion-item ${isTop ? 'top-suggestion' : ''}" onclick="app.selectSuggestedChapter('${ch}')">
                    <div class="suggestion-header">
                        <strong>${ch}</strong>
                        ${isTop ? '<span class="badge">🎯 Best Match</span>' : ''}
                    </div>
                    <div class="suggestion-details">
                        <span class="confidence">Confidence: ${conf}%</span>
                        <span class="matches">${score} keyword matches</span>
                    </div>
                </div>
            `;
        });

        suggestionsHTML += `
                </div>
                <div class="suggestions-actions">
                    <button class="btn btn--sm btn--outline" onclick="app.hideSuggestions()">Use Custom Chapter</button>
                </div>
            </div>
        `;

        suggestionsDiv.innerHTML = suggestionsHTML;
        suggestionsDiv.style.display = 'block';
    }

    selectSuggestedChapter(chapter) {
        const chapterSelect = document.getElementById('pdfChapter');
        const chapterCustom = document.getElementById('pdfChapterCustom');
        const suggestionsDiv = document.getElementById('chapterSuggestions');

        if (chapterSelect && chapterSelect.style.display !== 'none') {
            chapterSelect.value = chapter;
        } else if (chapterCustom) {
            chapterCustom.value = chapter;
        }

        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }

        // Show confirmation
        this.showToast(`✅ Selected chapter: "${chapter}"`, 'success');
    }

    hideSuggestions() {
        const suggestionsDiv = document.getElementById('chapterSuggestions');
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    resetPDFUpload() {
        this.currentPDFFile = null;
        this.currentPDFMetadata = null;
        this.tempExtractedQuestions = null;
        
        // Reset form elements
        const pdfInput = document.getElementById('pdfFileInput');
        if (pdfInput) pdfInput.value = '';
        
        const pdfInfo = document.getElementById('pdfInfo');
        if (pdfInfo) pdfInfo.style.display = 'none';
        
        const processingStatus = document.getElementById('processingStatus');
        if (processingStatus) processingStatus.style.display = 'none';
        
        const extractedQuestionsPreview = document.getElementById('extractedQuestionsPreview');
        if (extractedQuestionsPreview) extractedQuestionsPreview.style.display = 'none';
    }

    async processPDFForQuestions() {
        if (!this.currentPDFFile) {
            alert('Please select a PDF file first.');
            return;
        }

        // CRITICAL FIX: Capture form values IMMEDIATELY at the start
        const subjectElement = document.getElementById('pdfSubject');
        const chapterElement = document.getElementById('pdfChapter');
        const chapterCustomElement = document.getElementById('pdfChapterCustom');
        const autoDetectElement = document.getElementById('autoDetectChapter');
        
        console.log('Form elements found:', {
            subjectElement: !!subjectElement,
            chapterElement: !!chapterElement,
            chapterCustomElement: !!chapterCustomElement,
            subjectValue: subjectElement?.value,
            chapterValue: chapterElement?.value,
            chapterCustomValue: chapterCustomElement?.value
        });

        if (!subjectElement?.value || subjectElement.value === '') {
            alert('Please select a subject for the PDF questions.');
            subjectElement?.focus();
            return;
        }
        
        // Get chapter value from appropriate input
        let chapterValue = '';
        if (chapterElement && chapterElement.style.display !== 'none' && chapterElement.value) {
            chapterValue = chapterElement.value;
        } else if (chapterCustomElement && chapterCustomElement.value?.trim()) {
            chapterValue = chapterCustomElement.value.trim();
        }
        
        const isAutoDetectEnabled = autoDetectElement?.checked !== false;
        
        // For auto-detection or mixed subjects, we can proceed without chapter initially
        if (!chapterValue && !isAutoDetectEnabled && subjectElement.value !== 'Mixed/Practice Books') {
            alert('Please enter a chapter/topic for the PDF questions or enable auto-detection.');
            (chapterCustomElement || chapterElement)?.focus();
            return;
        }

        // STORE VALUES IMMEDIATELY - This is the critical fix
        this.currentPDFMetadata = {
            subject: subjectElement.value,
            chapter: chapterValue || 'Auto-detect',
            filename: this.currentPDFFile.name,
            autoDetect: isAutoDetectEnabled
        };

        console.log('Stored PDF metadata:', this.currentPDFMetadata);

        const processingDiv = document.getElementById('processingStatus');
        if (processingDiv) {
            processingDiv.innerHTML = `
                <div class="processing-indicator">
                    <div class="spinner"></div>
                    <p>Processing PDF: ${this.currentPDFFile.name}</p>
                    <p>Subject: <strong>${this.currentPDFMetadata.subject}</strong></p>
                    <p>Chapter: <strong>${this.currentPDFMetadata.chapter}</strong></p>
                    ${isAutoDetectEnabled ? '<p>🤖 AI Chapter Detection: <strong>Enabled</strong></p>' : ''}
                    <div class="progress-details">
                        <p id="processingStep">Initializing PDF processing...</p>
                    </div>
                </div>
            `;
            processingDiv.style.display = 'block';
        }

        try {
            this.updateProcessingStep('Loading PDF document...');
            
            const fileArrayBuffer = await this.currentPDFFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(fileArrayBuffer).promise;
            
            this.updateProcessingStep('Extracting text from pages...');
            
            let fullText = '';
            let pageTexts = [];
            
            // Extract text page by page for better processing
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                // Get text with position information for better parsing
                const pageItems = textContent.items.map(item => ({
                    text: item.str,
                    x: item.transform[4],
                    y: item.transform[5],
                    width: item.width,
                    height: item.height
                }));
                
                const pageText = this.reconstructPageText(pageItems);
                pageTexts.push(pageText);
                fullText += pageText + '\n\n--- PAGE_BREAK ---\n\n';
                
                this.updateProcessingStep(`Processing page ${i} of ${pdf.numPages}...`);
            }

            this.updateProcessingStep('Analyzing question structure...');
            
            // Enhanced text preprocessing
            const preprocessedText = this.preprocessPDFText(fullText);
            
            this.updateProcessingStep('Extracting questions using multiple strategies...');
            
            // Multiple extraction strategies
            const extractedQuestions = this.extractQuestionsWithMultipleStrategies(preprocessedText, pageTexts);
            
            this.updateProcessingStep('Validating extracted questions...');
            console.log('PDF metadata before validation:', this.currentPDFMetadata);
            
            // Filter and validate questions
            let validQuestions = this.validateAndFilterQuestions(extractedQuestions);
            
            // AI Chapter Detection
            if (isAutoDetectEnabled && validQuestions.length > 0 && this.currentPDFMetadata.subject !== 'Mixed/Practice Books') {
                this.updateProcessingStep('🤖 AI analyzing question content for chapter detection...');
                
                const detectionResult = this.detectChapterFromContent(validQuestions, this.currentPDFMetadata.subject);
                
                if (detectionResult && detectionResult.confidence > 30) {
                    // Update metadata with detected chapter
                    if (!chapterValue || chapterValue === 'Auto-detect') {
                        this.currentPDFMetadata.chapter = detectionResult.chapter;
                        this.currentPDFMetadata.detectionConfidence = detectionResult.confidence;
                        
                        // Re-process questions with detected chapter
                        validQuestions = validQuestions.map(q => ({
                            ...q,
                            chapter: detectionResult.chapter,
                            aiDetected: true
                        }));
                        
                        console.log(`AI detected chapter: ${detectionResult.chapter} (${detectionResult.confidence}% confidence)`);
                    }
                    
                    // Store detection result for showing suggestions
                    this.lastDetectionResult = detectionResult;
                }
            }
            
            // Handle Mixed/Practice Books - detect individual question subjects/chapters
            if (this.currentPDFMetadata.subject === 'Mixed/Practice Books' && validQuestions.length > 0) {
                this.updateProcessingStep('🔍 Analyzing mixed content for individual subjects...');
                
                // NEW: Check if this is a practice sets PDF
                this.updateProcessingStep('📚 Detecting practice sets structure...');
                const practiceSets = this.detectPracticeSets(preprocessedText);
                
                if (practiceSets.length > 1) {
                    // This is a practice sets PDF - handle differently
                    this.updateProcessingStep(`✅ Detected ${practiceSets.length} practice sets!`);
                    
                    // Store practice sets for later processing
                    this.tempExtractedPracticeSets = practiceSets;
                    this.tempExtractedQuestions = null; // Clear individual questions
                    
                    setTimeout(() => {
                        this.showPracticeSetsPreview(practiceSets);
                    }, 1000);
                    
                    return;
                } else {
                    // Regular mixed content processing
                    validQuestions = validQuestions.map((question, index) => {
                        // Try to detect subject for each question
                        let detectedSubject = 'General';
                        let detectedChapter = chapterValue || 'Mixed Practice';
                        
                        const questionText = (question.text || '').toLowerCase();
                        const optionsText = (question.options || []).join(' ').toLowerCase();
                        const fullQuestionText = questionText + ' ' + optionsText;
                        
                        // Subject detection logic
                        Object.keys(this.syllabusMapping).forEach(subject => {
                            if (subject === 'Mixed/Practice Books') return;
                            
                            const keywords = this.syllabusMapping[subject].keywords;
                            let subjectScore = 0;
                            
                            Object.keys(keywords).forEach(chapter => {
                                keywords[chapter].forEach(keyword => {
                                    if (fullQuestionText.includes(keyword.toLowerCase())) {
                                        subjectScore++;
                                    }
                                });
                            });
                            
                            if (subjectScore > 2) { // Threshold for subject detection
                                detectedSubject = subject;
                                
                                // Try to detect specific chapter within the subject
                                const chapterDetection = this.detectChapterFromContent([question], subject);
                                if (chapterDetection && chapterDetection.confidence > 20) {
                                    detectedChapter = chapterDetection.chapter;
                                }
                            }
                        });
                        
                        return {
                            ...question,
                            subject: detectedSubject,
                            chapter: detectedChapter,
                            originalSubject: 'Mixed/Practice Books',
                            aiDetected: true
                        };
                    });
                }
            }
            
            console.log('PDF metadata after validation:', this.currentPDFMetadata);
            console.log('Sample of finalized questions:', validQuestions.slice(0, 2));
            
            if (validQuestions.length > 0) {
                this.updateProcessingStep(`Successfully extracted ${validQuestions.length} questions!`);
                setTimeout(() => {
                    this.showExtractedQuestionsPreview(validQuestions);
                    
                    // Show chapter suggestions if AI detection was used
                    if (isAutoDetectEnabled && this.lastDetectionResult && this.currentPDFMetadata.subject !== 'Mixed/Practice Books') {
                        this.showChapterSuggestions(this.lastDetectionResult, validQuestions);
                    }
                }, 1000);
            } else {
                this.updateProcessingStep('No valid questions found.');
                setTimeout(() => {
                    alert('No valid questions found in the PDF. The format might not be supported or the questions need manual formatting.');
                    this.showExtractionTips();
                }, 1000);
            }

            // Store PDF information
            const pdfInfo = {
                id: 'pdf_' + Date.now(),
                name: this.currentPDFFile.name,
                size: this.currentPDFFile.size,
                subject: this.currentPDFMetadata.subject,
                chapter: this.currentPDFMetadata.chapter,
                uploadDate: new Date().toISOString(),
                questionsExtracted: validQuestions.length,
                totalPages: pdf.numPages,
                data: fileArrayBuffer,
                aiDetected: this.currentPDFMetadata.detectionConfidence || false
            };

            this.uploadedPDFs.push(pdfInfo);
            this.savePDFs();

        } catch (error) {
            console.error('Error processing PDF:', error);
            this.updateProcessingStep('Error processing PDF.');
            setTimeout(() => {
                alert(`Error processing PDF: ${error.message}. Please try again or use a different file.`);
            }, 1000);
        } finally {
            setTimeout(() => {
                if (processingDiv && !this.tempExtractedQuestions) {
                    processingDiv.style.display = 'none';
                }
            }, 2000);
        }
    }

    updateProcessingStep(step) {
        const stepElement = document.getElementById('processingStep');
        if (stepElement) {
            stepElement.textContent = step;
        }
        console.log('Processing:', step);
    }

    reconstructPageText(pageItems) {
        if (!pageItems || pageItems.length === 0) {
            return '';
        }

        // Sort items by Y position (top to bottom) then X position (left to right)
        pageItems.sort((a, b) => {
            const yDiff = Math.abs(a.y - b.y);
            if (yDiff < 5) { // Same line tolerance
                return a.x - b.x;
            }
            return b.y - a.y; // Top to bottom (PDF coordinates are bottom-up)
        });

        let reconstructedText = '';
        let currentY = null;
        
        pageItems.forEach(item => {
            if (item.text && item.text.trim()) {
                if (currentY !== null && Math.abs(item.y - currentY) > 5) {
                    reconstructedText += '\n';
                }
                reconstructedText += item.text + ' ';
                currentY = item.y;
            }
        });

        return reconstructedText.trim();
    }

    preprocessPDFText(text) {
        console.log('Preprocessing text of length:', text.length);
        
        if (!text || text.trim().length === 0) {
            console.warn('Empty text provided for preprocessing');
            return '';
        }
        
        let cleanedText = text
            // Remove page breaks
            .replace(/--- PAGE_BREAK ---/g, '\n')
            // Remove extra whitespace but preserve line structure
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            // Remove common PDF artifacts
            .replace(/\f/g, '')
            .replace(/\r/g, '')
            // Remove timestamps and percentages that don't belong to questions
            .replace(/\d{1,2}\/\d{1,2}\/\d{4}\s*-->\s*\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)/g, ' ')
            .replace(/\d+\.\d+%\s*(Attempted|Right|Wrong)/g, ' ')
            // Clean up question numbering variations
            .replace(/([Qq]uestion)\s*[:\-]?\s*(\d+)\s*[:\.\)]\s*/g, 'Q$2. ')
            .replace(/^(\d+)\s*[\.\)]\s*/gm, 'Q$1. ')
            // Normalize option formatting
            .replace(/\b([A-D])\s*[\)\.\]]\s*/g, '$1) ')
            .replace(/\(([a-d])\)\s*/g, (match, letter) => `${letter.toUpperCase()}) `)
            // Clean up multiple spaces
            .replace(/\s+/g, ' ')
            .trim();

        console.log('Cleaned text length:', cleanedText.length);
        return cleanedText;
    }

    extractQuestionsWithMultipleStrategies(text, pageTexts) {
        console.log('Starting question extraction with multiple strategies...');
        console.log('Current PDF metadata at extraction start:', this.currentPDFMetadata);
        
        const allQuestions = [];
        
        // Strategy 1: Line-by-line parsing
        try {
            const strategy1Questions = this.extractQuestionsLineByLine(text);
            console.log('Strategy 1 (Line-by-line) found:', strategy1Questions.length, 'questions');
            allQuestions.push(...strategy1Questions);
        } catch (error) {
            console.error('Strategy 1 failed:', error);
        }
        
        // Strategy 2: Pattern-based extraction
        try {
            const strategy2Questions = this.extractQuestionsWithPatterns(text);
            console.log('Strategy 2 (Pattern-based) found:', strategy2Questions.length, 'questions');
            allQuestions.push(...strategy2Questions);
        } catch (error) {
            console.error('Strategy 2 failed:', error);
        }
        
        // Strategy 3: Block-based extraction
        try {
            const strategy3Questions = this.extractQuestionsBlockBased(text);
            console.log('Strategy 3 (Block-based) found:', strategy3Questions.length, 'questions');
            allQuestions.push(...strategy3Questions);
        } catch (error) {
            console.error('Strategy 3 failed:', error);
        }
        
        console.log('Current PDF metadata before finalization:', this.currentPDFMetadata);
        
        // Remove duplicates based on question text similarity
        const uniqueQuestions = this.removeDuplicateQuestions(allQuestions);
        console.log('Final unique questions after deduplication:', uniqueQuestions.length);
        
        return uniqueQuestions;
    }

    extractQuestionsLineByLine(text) {
        const questions = [];
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        let currentQuestion = null;
        let optionCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if this line starts a new question
            const questionMatch = line.match(/^Q(\d+)\.\s*(.+)/);
            if (questionMatch) {
                // Save previous question if complete
                if (currentQuestion && this.isQuestionComplete(currentQuestion)) {
                    questions.push(this.finalizeQuestion(currentQuestion));
                }
                
                // Start new question
                const questionNumber = parseInt(questionMatch[1]);
                currentQuestion = {
                    number: questionNumber,
                    text: questionMatch[2].trim(),
                    options: [],
                    source: 'Line-by-line parsing'
                };
                optionCount = 0;
                continue;
            }
            
            // Check if this line is an option
            if (currentQuestion) {
                const optionMatch = line.match(/^([A-D])\)\s*(.+)/);
                if (optionMatch && optionCount < 4) {
                    const optionLetter = optionMatch[1];
                    const optionText = optionMatch[2].trim();
                    
                    // Verify option sequence
                    const expectedLetter = String.fromCharCode(65 + optionCount);
                    if (optionLetter === expectedLetter) {
                        currentQuestion.options.push(optionText);
                        optionCount++;
                    }
                } else if (!line.match(/^[A-D]\)/) && optionCount === 0) {
                    // This might be continuation of question text
                    if (currentQuestion.text.length < 300) {
                        currentQuestion.text += ' ' + line;
                    }
                }
            }
        }
        
        // Don't forget the last question
        if (currentQuestion && this.isQuestionComplete(currentQuestion)) {
            questions.push(this.finalizeQuestion(currentQuestion));
        }
        
        return questions;
    }

    extractQuestionsWithPatterns(text) {
        const questions = [];
        
        // Enhanced patterns for better RRB PYQ detection
        const patterns = [
            // Pattern 1: Q1. format with options
            {
                regex: /Q(\d+)\.\s*([^?!.]+[?!.])\s*(?:\([A-D]\))?\s*A\)\s*([^B]+?)\s*B\)\s*([^C]+?)\s*C\)\s*([^D]+?)\s*D\)\s*([^Q]+?)(?=\s*Q\d+\.|$)/gi,
                format: 'Q_format_enhanced'
            },
            // Pattern 2: Simple numbered format
            {
                regex: /(\d+)\.\s*([^?!.]+[?!.])\s*(?:\([A-D]\))?\s*A\)\s*([^B]+?)\s*B\)\s*([^C]+?)\s*C\)\s*([^D]+?)\s*D\)\s*([^1-9]+?)(?=\s*\d+\.|$)/gi,
                format: 'numbered_format_enhanced'
            },
            // Pattern 3: RRB specific patterns with parentheses options
            {
                regex: /(\d+)\.\s*([^?!.]+[?!.])\s*\(A\)\s*([^(]+?)\s*\(B\)\s*([^(]+?)\s*\(C\)\s*([^(]+?)\s*\(D\)\s*([^1-9]+?)(?=\s*\d+\.|$)/gi,
                format: 'parentheses_format'
            },
            // Pattern 4: Questions with colon after number
            {
                regex: /(\d+):\s*([^?!.]+[?!.])\s*A\)\s*([^B]+?)\s*B\)\s*([^C]+?)\s*C\)\s*([^D]+?)\s*D\)\s*([^1-9]+?)(?=\s*\d+:|$)/gi,
                format: 'colon_format'
            },
            // Pattern 5: Questions without punctuation at end
            {
                regex: /Q(\d+)\.\s*([^A-D]+?)\s*A\)\s*([^B]+?)\s*B\)\s*([^C]+?)\s*C\)\s*([^D]+?)\s*D\)\s*([^Q]+?)(?=\s*Q\d+\.|$)/gi,
                format: 'no_punctuation_Q_format'
            },
            // Pattern 6: Mathematics specific patterns with equations
            {
                regex: /(\d+)\.\s*([^=]+=[^?]+[?]?)\s*A\)\s*([^B]+?)\s*B\)\s*([^C]+?)\s*C\)\s*([^D]+?)\s*D\)\s*([^1-9]+?)(?=\s*\d+\.|$)/gi,
                format: 'equation_format'
            },
            // Pattern 7: Fill in the blanks pattern
            {
                regex: /(\d+)\.\s*([^_]*_{2,}[^?]*[?.]?)\s*A\)\s*([^B]+?)\s*B\)\s*([^C]+?)\s*C\)\s*([^D]+?)\s*D\)\s*([^1-9]+?)(?=\s*\d+\.|$)/gi,
                format: 'fill_blanks_format'
            },
            // Pattern 8: Technical diagram/figure references
            {
                regex: /(\d+)\.\s*([^?!.]*(?:figure|diagram|circuit|graph)[^?!.]*[?!.]?)\s*A\)\s*([^B]+?)\s*B\)\s*([^C]+?)\s*C\)\s*([^D]+?)\s*D\)\s*([^1-9]+?)(?=\s*\d+\.|$)/gi,
                format: 'diagram_format'
            }
        ];

        patterns.forEach((pattern, index) => {
            let match;
            const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
            
            while ((match = regex.exec(text)) !== null) {
                try {
                    const questionNumber = parseInt(match[1]);
                    const questionText = this.cleanQuestionText(match[2].trim());
                    const options = [
                        this.cleanOptionText(match[3].trim()),
                        this.cleanOptionText(match[4].trim()),
                        this.cleanOptionText(match[5].trim()),
                        this.cleanOptionText(match[6].trim())
                    ];

                    if (this.isValidQuestionData(questionText, options, questionNumber)) {
                        // Create a temporary question object for chapter detection
                        const tempQuestion = {
                            text: questionText,
                            options: options
                        };
                        const detectedChapter = this.detectChapterFromContent([tempQuestion], this.currentPDFMetadata?.subject || 'General');
                        
                        questions.push({
                            number: questionNumber,
                            text: questionText,
                            options: options,
                            chapter: detectedChapter?.chapter || 'General',
                            confidence: detectedChapter?.confidence || 0,
                            source: `Enhanced Pattern ${index + 1} (${pattern.format})`
                        });
                    }
                } catch (error) {
                    console.warn(`Error processing enhanced pattern match:`, error);
                }
            }
        });

        return questions;
    }

    extractQuestionsBlockBased(text) {
        const questions = [];
        
        // Split text into potential question blocks
        const blocks = text.split(/(?=Q\d+\.)|(?=^\d+\.)/m);
        
        blocks.forEach((block, blockIndex) => {
            block = block.trim();
            if (block.length < 30) return; // Skip very short blocks
            
            try {
                // Try to parse this block as a single question
                const questionMatch = block.match(/^(?:Q)?(\d+)\.\s*(.+?)(?:\s*A\)\s*(.+?)\s*B\)\s*(.+?)\s*C\)\s*(.+?)\s*D\)\s*(.+?))?$/s);
                
                if (questionMatch) {
                    const questionNumber = parseInt(questionMatch[1]);
                    let questionText = questionMatch[2];
                    
                    if (questionMatch[3] && questionMatch[4] && questionMatch[5] && questionMatch[6]) {
                        // Has all options in the match
                        const options = [
                            questionMatch[3].trim(),
                            questionMatch[4].trim(),
                            questionMatch[5].trim(),
                            questionMatch[6].trim()
                        ];
                        
                        // Clean question text (remove any option text that leaked in)
                        questionText = questionText.replace(/\s*[A-D]\).*$/s, '').trim();
                        
                        if (this.isValidQuestionData(questionText, options, questionNumber)) {
                            // Create a temporary question object for chapter detection
                            const tempQuestion = {
                                text: questionText,
                                options: options
                            };
                            const detectedChapter = this.detectChapterFromContent([tempQuestion], this.currentPDFMetadata?.subject || 'General');
                            
                            questions.push({
                                number: questionNumber,
                                text: questionText,
                                options: options,
                                chapter: detectedChapter?.chapter || 'General',
                                confidence: detectedChapter?.confidence || 0,
                                source: 'Enhanced Block parsing'
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn(`Error processing block ${blockIndex}:`, error);
            }
        });
        
        return questions;
    }

    isQuestionComplete(question) {
        return question && 
               question.text && 
               question.text.length > 10 && 
               question.options && 
               question.options.length === 4 &&
               question.options.every(opt => opt && opt.length > 0);
    }

    isValidQuestionData(questionText, options, questionNumber) {
        // Basic validation
        if (!questionText || questionText.length < 10 || questionText.length > 500) {
            return false;
        }
        
        if (!options || options.length !== 4) {
            return false;
        }
        
        // Check all options have content
        if (!options.every(opt => opt && opt.trim().length > 0 && opt.trim().length < 200)) {
            return false;
        }
        
        // Check for mixed content indicators
        const mixedIndicators = [
            /Q\d+\./,
            /\d+\.\d+%/,
            /\d{1,2}\/\d{1,2}\/\d{4}/,
            /Question\s+\d+/,
            /(Attempted|Right|Wrong)/,
            /\b(AM|PM)\b/
        ];
        
        if (mixedIndicators.some(indicator => indicator.test(questionText))) {
            return false;
        }
        
        // Check if question has reasonable content
        if (questionText.split(' ').length < 3) {
            return false;
        }
        
        return true;
    }

    cleanQuestionText(text) {
        return text
            .replace(/^\d+\.\s*/, '') // Remove leading question number
            .replace(/^Q\d+\.\s*/, '') // Remove Q1. format
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/([.!?])\s*$/, '$1') // Ensure proper punctuation
            .trim();
    }

    cleanOptionText(text) {
        return text
            .replace(/^[A-D]\)\s*/, '') // Remove option letter if present
            .replace(/^\([A-D]\)\s*/, '') // Remove (A) format if present
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\s*[.!?]*\s*$/, '') // Remove trailing punctuation
            .trim();
    }

    finalizeQuestion(questionData) {
        // Use intelligent chapter detection if not already detected
        let detectedChapter = null;
        let chapterConfidence = 0;
        
        if (questionData.chapter && questionData.confidence) {
            // Already has intelligent detection
            detectedChapter = questionData.chapter;
            chapterConfidence = questionData.confidence;
        } else {
            // Apply intelligent detection now
            const tempQuestion = {
                text: questionData.text,
                options: questionData.options
            };
            const detection = this.detectChapterFromContent([tempQuestion], this.currentPDFMetadata?.subject || 'General');
            detectedChapter = detection?.chapter || 'General';
            chapterConfidence = detection?.confidence || 0;
        }
        
        // Use stored metadata with intelligent chapter detection
        const subject = this.currentPDFMetadata?.subject || 'General';
        const finalChapter = detectedChapter || this.currentPDFMetadata?.chapter || 'PDF Extract';
        const filename = this.currentPDFMetadata?.filename || 'Unknown PDF';
        
        console.log('Finalizing question with enhanced metadata:', {
            subject,
            finalChapter,
            chapterConfidence,
            filename,
            storedMetadata: this.currentPDFMetadata
        });
        
        const finalizedQuestion = {
            id: 'pdf_q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: questionData.text.trim(),
            options: questionData.options.map(opt => opt.trim()),
            correctAnswer: 0, // Default, user will need to verify
            explanation: 'Extracted from PDF - please verify and add explanation',
            subject: subject,
            chapter: finalChapter,
            chapterConfidence: chapterConfidence,
            difficulty: this.guessDifficulty(questionData.text),
            isPYQ: false,
            source: `PDF: ${filename}`,
            needsReview: true,
            questionNumber: questionData.number,
            extractionSource: questionData.source || 'Unknown'
        };

        console.log('Enhanced finalized question:', finalizedQuestion);
        return finalizedQuestion;
    }

    removeDuplicateQuestions(questions) {
        const unique = [];
        const seenTexts = new Set();
        
        questions.forEach(question => {
            const normalizedText = question.text.toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/[^\w\s]/g, '')
                .trim();
            
            if (!seenTexts.has(normalizedText) && normalizedText.length > 10) {
                seenTexts.add(normalizedText);
                unique.push(question);
            }
        });
        
        return unique.sort((a, b) => (a.number || 0) - (b.number || 0));
    }

    validateAndFilterQuestions(questions) {
        console.log('Validating and filtering questions with metadata:', this.currentPDFMetadata);
        
        const validQuestions = questions.filter(question => {
            // Additional validation checks
            if (!question.text || question.text.length < 10) {
                console.warn(`Question ${question.number}: Text too short`);
                return false;
            }
            
            if (question.text.length > 400) {
                console.warn(`Question ${question.number}: Text too long, might contain mixed content`);
                return false;
            }
            
            if (!question.options || question.options.length !== 4) {
                console.warn(`Question ${question.number}: Invalid options count`);
                return false;
            }
            
            // Check if any option is too long (might indicate mixed content)
            if (question.options.some(opt => opt.length > 150)) {
                console.warn(`Question ${question.number}: Option too long`);
                return false;
            }
            
            // Check for duplicate options
            const uniqueOptions = new Set(question.options.map(opt => opt.toLowerCase().trim()));
            if (uniqueOptions.size < 4) {
                console.warn(`Question ${question.number}: Duplicate options found`);
                return false;
            }
            
            return true;
        });

        // CRITICAL FIX: Apply finalizeQuestion to each valid question to add metadata
        const finalizedQuestions = validQuestions.map(question => {
            console.log('Finalizing question:', question.number, 'with metadata:', this.currentPDFMetadata);
            return this.finalizeQuestion(question);
        });

        console.log('Finalized questions with metadata:', finalizedQuestions.length);
        return finalizedQuestions;
    }

    guessDifficulty(questionText) {
        if (!questionText || typeof questionText !== 'string') {
            return 'Medium'; // Default fallback
        }
        
        const text = questionText.toLowerCase();
        
        const hardIndicators = [
            'calculate', 'derive', 'prove', 'analyze', 'evaluate', 'synthesize',
            'algorithm', 'complex', 'advanced', 'sophisticated', 'implement',
            'compute', 'determine', 'solve for', 'find the value', 'mathematical',
            'integration', 'differentiation', 'optimization'
        ];
        
        const mediumIndicators = [
            'compare', 'explain', 'difference', 'why', 'how', 'relationship',
            'interpret', 'apply', 'understand', 'determine', 'describe',
            'distinguish', 'classify', 'reasoning', 'logic'
        ];
        
        const easyIndicators = [
            'what', 'which', 'who', 'when', 'where', 'define', 'list',
            'identify', 'recall', 'remember', 'name', 'state', 'select',
            'choose', 'pick', 'basic', 'simple'
        ];

        const hardCount = hardIndicators.filter(indicator => text.includes(indicator)).length;
        const mediumCount = mediumIndicators.filter(indicator => text.includes(indicator)).length;
        const easyCount = easyIndicators.filter(indicator => text.includes(indicator)).length;

        if (hardCount > 0) {
            return 'Hard';
        } else if (mediumCount > easyCount) {
            return 'Medium';
        } else if (easyCount > 0) {
            return 'Easy';
        } else {
            return 'Medium'; // Default
        }
    }

    showExtractionTips() {
        const tipsHtml = `
            <div class="extraction-tips">
                <h3>📋 PDF Question Extraction Tips</h3>
                <p>To improve question extraction success, please ensure your PDF has:</p>
                <ul>
                    <li>✅ Clear question numbering (Q1., Q2., etc. or 1., 2., etc.)</li>
                    <li>✅ Options clearly marked as A), B), C), D)</li>
                    <li>✅ Questions ending with question marks (?)</li>
                    <li>✅ Consistent formatting throughout the document</li>
                    <li>✅ Each question on a separate section or page</li>
                    <li>❌ Avoid mixed content (answers, explanations between questions)</li>
                </ul>
                <div class="tip-examples">
                    <h4>Good Format Example:</h4>
                    <pre>Q1. What is 2 + 2?
A) 3
B) 4
C) 5
D) 6</pre>
                </div>
                <p><strong>Alternative:</strong> You can add questions manually using the "Add Question" button.</p>
            </div>
        `;
        
        const previewDiv = document.getElementById('extractedQuestionsPreview');
        if (previewDiv) {
            previewDiv.innerHTML = tipsHtml;
            previewDiv.style.display = 'block';
        }
    }

    showExtractedQuestionsPreview(extractedQuestions) {
        const previewHtml = `
            <div class="extracted-questions-preview">
                <h3>✅ Questions Successfully Extracted!</h3>
                <div class="extraction-summary">
                    <p>Found <strong>${extractedQuestions.length}</strong> valid questions from your PDF</p>
                    <div class="extraction-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Questions:</span>
                            <span class="stat-value">${extractedQuestions.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Subject:</span>
                            <span class="stat-value">${this.currentPDFMetadata?.subject || 'General'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Chapter:</span>
                            <span class="stat-value">${this.currentPDFMetadata?.chapter || 'PDF Extract'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Need Review:</span>
                            <span class="stat-value">${extractedQuestions.filter(q => q.needsReview).length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="questions-preview-list">
                    ${extractedQuestions.slice(0, 3).map((q, index) => `
                        <div class="preview-question">
                            <div class="question-header">
                                <h4>Question ${q.questionNumber || index + 1}</h4>
                                <span class="extraction-method">${q.extractionSource || 'Auto'}</span>
                            </div>
                            <div class="question-content">
                                <p class="question-text"><strong>Q:</strong> ${q.text}</p>
                                <div class="preview-options">
                                    ${q.options.map((opt, i) => `
                                        <p class="option-item">
                                            <strong>${String.fromCharCode(65 + i)}:</strong> ${opt}
                                        </p>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="question-meta">
                                <span class="difficulty-badge difficulty-${q.difficulty}">${q.difficulty}</span>
                                <span class="subject-badge">${q.subject}</span>
                                ${q.needsReview ? '<span class="review-badge">Needs Review</span>' : ''}
                            </div>
                        </div>
                    `).join('')}
                    ${extractedQuestions.length > 3 ? `
                        <div class="more-questions">
                            <p>... and ${extractedQuestions.length - 3} more questions</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="preview-actions">
                    <button class="btn btn--primary" onclick="app.confirmExtractedQuestions()">
                        ✅ Add All Questions (${extractedQuestions.length})
                    </button>
                    <button class="btn btn--secondary" onclick="app.reviewExtractedQuestions()">
                        📝 Review Individual Questions
                    </button>
                    <button class="btn btn--outline" onclick="app.discardExtractedQuestions()">
                        ❌ Discard All
                    </button>
                </div>
            </div>
        `;

        const previewDiv = document.getElementById('extractedQuestionsPreview');
        if (previewDiv) {
            previewDiv.innerHTML = previewHtml;
            previewDiv.style.display = 'block';
        }

        // Hide processing status
        const processingDiv = document.getElementById('processingStatus');
        if (processingDiv) {
            processingDiv.style.display = 'none';
        }

        // Store extracted questions temporarily
        this.tempExtractedQuestions = extractedQuestions;
        console.log('Stored temp extracted questions:', extractedQuestions.length);
        console.log('Sample stored question metadata:', extractedQuestions.slice(0, 1).map(q => ({
            subject: q.subject,
            chapter: q.chapter,
            source: q.source,
            extractionSource: q.extractionSource
        })));
    }

    // NEW: Show practice sets preview
    showPracticeSetsPreview(practiceSets) {
        const previewHtml = `
            <div class="practice-sets-preview">
                <h3>📚 Practice Sets Detected!</h3>
                <div class="sets-summary">
                    <p>Found <strong>${practiceSets.length}</strong> practice sets with <strong>${practiceSets.reduce((total, set) => total + set.totalQuestions, 0)}</strong> total questions</p>
                    <div class="summary-stats">
                        <div class="stat-item">
                            <span class="stat-label">Practice Sets:</span>
                            <span class="stat-value">${practiceSets.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Questions:</span>
                            <span class="stat-value">${practiceSets.reduce((total, set) => total + set.totalQuestions, 0)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Subject:</span>
                            <span class="stat-value">${this.currentPDFMetadata?.subject || 'Mixed'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Avg Time/Set:</span>
                            <span class="stat-value">${Math.round(practiceSets.reduce((total, set) => total + set.estimatedTime, 0) / practiceSets.length)} min</span>
                        </div>
                    </div>
                </div>
                
                <div class="practice-sets-list">
                    <h4>Practice Sets Overview:</h4>
                    <div class="sets-grid">
                        ${practiceSets.map((set, index) => `
                            <div class="practice-set-card">
                                <div class="set-header">
                                    <h5>${set.title}</h5>
                                    <span class="difficulty-badge difficulty-${set.difficulty.toLowerCase()}">${set.difficulty}</span>
                                </div>
                                <div class="set-details">
                                    <p><strong>Questions:</strong> ${set.totalQuestions}</p>
                                    <p><strong>Time:</strong> ${set.estimatedTime} min</p>
                                    <p><strong>Subject:</strong> ${set.subject}</p>
                                </div>
                                <div class="set-preview">
                                    <p class="preview-question">
                                        <strong>Sample Q:</strong> ${set.questions[0]?.text?.substring(0, 80)}...
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="practice-sets-actions">
                    <button class="btn btn--primary" onclick="app.confirmPracticeSets()">
                        ✅ Create All Mock Tests (${practiceSets.length} Sets)
                    </button>
                    <button class="btn btn--secondary" onclick="app.previewPracticeSet(0)">
                        👁️ Preview First Set
                    </button>
                    <button class="btn btn--outline" onclick="app.discardPracticeSets()">
                        ❌ Discard All
                    </button>
                </div>
                
                <div class="practice-sets-info">
                    <p><strong>What happens next:</strong></p>
                    <ul>
                        <li>Each practice set will be converted to a separate mock test</li>
                        <li>Tests will appear in your dashboard under "Available Tests"</li>
                        <li>You can take them individually or create custom combinations</li>
                        <li>All questions will be properly categorized and subject-detected</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Hide processing status
        const processingDiv = document.getElementById('processingStatus');
        if (processingDiv) {
            processingDiv.style.display = 'none';
        }
        
        // Show preview
        const previewDiv = document.getElementById('extractedQuestionsPreview');
        if (previewDiv) {
            previewDiv.innerHTML = previewHtml;
            previewDiv.style.display = 'block';
        }
    }

    confirmExtractedQuestions() {
        if (this.tempExtractedQuestions && this.tempExtractedQuestions.length > 0) {
            // Remove "needsReview" flag from accepted questions
            const acceptedQuestions = this.tempExtractedQuestions.map(question => ({
                ...question,
                needsReview: false // Mark as no longer needing review since user accepted them
            }));
            
            // Add questions to the main question bank
            this.questions.push(...acceptedQuestions);
            this.saveQuestions();
            
            // Clean up and close modal
            this.hideModal('pdfUploadModal');
            this.resetPDFUpload();
            
            // Update UI
            this.renderQuestionBank();
            this.updateDashboard();
            
            // Show success message
            alert(`🎉 Successfully added ${acceptedQuestions.length} questions from PDF!\n\nYou can now use these questions in your tests.`);
            
            // Switch to question bank to show the new questions
            this.switchSection('questionBank');
        }
    }

    reviewExtractedQuestions() {
        if (this.tempExtractedQuestions && this.tempExtractedQuestions.length > 0) {
            this.showModal('questionReviewModal');
            this.currentExtractedQuestions = [...this.tempExtractedQuestions];
            this.currentReviewIndex = 0;
            this.showQuestionForReview();
        }
    }

    discardExtractedQuestions() {
        if (confirm('Are you sure you want to discard all extracted questions?')) {
            this.resetPDFUpload();
            this.hideModal('pdfUploadModal');
        }
    }

    // NEW: Handle practice sets confirmation
    confirmPracticeSets() {
        if (this.tempExtractedPracticeSets && this.tempExtractedPracticeSets.length > 0) {
            const practiceSets = this.tempExtractedPracticeSets;
            
            // Process each practice set
            const mockTests = [];
            
            practiceSets.forEach((set, index) => {
                // Create mock test configuration for each set
                const mockTest = {
                    id: `practice_set_${set.setNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    title: set.title,
                    description: `Auto-generated from PDF: ${this.currentPDFMetadata?.filename || 'Practice Sets'}`,
                    type: 'practice_set',
                    setNumber: set.setNumber,
                    totalQuestions: set.totalQuestions,
                    timeLimit: set.estimatedTime * 60, // Convert to seconds
                    difficulty: set.difficulty,
                    subject: set.subject,
                    source: 'PDF Practice Sets',
                    questions: set.questions.map(q => ({
                        ...q,
                        needsReview: false,
                        confirmedAt: new Date().toISOString(),
                        isPracticeSet: true,
                        practiceSetInfo: {
                            setNumber: set.setNumber,
                            setTitle: set.title
                        }
                    })),
                    createdAt: new Date().toISOString(),
                    isActive: true
                };
                
                mockTests.push(mockTest);
                
                // Also add questions to main question bank
                this.questions.push(...mockTest.questions);
            });
            
            // Store mock tests
            this.storeMockTests(mockTests);
            this.saveQuestions();
            
            console.log(`Created ${mockTests.length} mock tests from practice sets`);
            
            // Clear temporary storage
            this.tempExtractedPracticeSets = null;
            this.currentPDFFile = null;
            
            // Reset UI
            this.resetPDFUpload();
            this.hideModal('pdfUploadModal');
            
            // Show success message
            this.showToast(`Successfully created ${mockTests.length} mock tests! Check your dashboard.`, 'success');
            
            // Switch to dashboard to show new tests
            this.switchSection('dashboard');
            this.updateDashboard();
        }
    }

    // NEW: Preview a specific practice set
    previewPracticeSet(setIndex) {
        if (this.tempExtractedPracticeSets && this.tempExtractedPracticeSets[setIndex]) {
            const set = this.tempExtractedPracticeSets[setIndex];
            
            const previewHtml = `
                <div class="practice-set-detail-preview">
                    <h3>📖 ${set.title} - Detailed Preview</h3>
                    <div class="set-info">
                        <p><strong>Questions:</strong> ${set.totalQuestions} | <strong>Time:</strong> ${set.estimatedTime} min | <strong>Difficulty:</strong> ${set.difficulty}</p>
                    </div>
                    
                    <div class="questions-detailed-preview">
                        ${set.questions.slice(0, 5).map((q, index) => `
                            <div class="preview-question-detailed">
                                <div class="question-number">Question ${q.setQuestionNumber || index + 1}</div>
                                <div class="question-content">
                                    <p class="question-text"><strong>Q:</strong> ${q.text}</p>
                                    <div class="options-list">
                                        ${q.options.map((opt, i) => `
                                            <p class="option-item">
                                                <strong>${String.fromCharCode(65 + i)})</strong> ${opt}
                                            </p>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="question-meta">
                                    <span class="difficulty-badge difficulty-${q.difficulty}">${q.difficulty}</span>
                                    <span class="subject-badge">${q.subject}</span>
                                    <span class="chapter-badge">${q.chapter}</span>
                                </div>
                            </div>
                        `).join('')}
                        ${set.questions.length > 5 ? `
                            <div class="more-questions-note">
                                <p>... and ${set.questions.length - 5} more questions</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="preview-actions">
                        <button class="btn btn--primary" onclick="app.confirmPracticeSets()">
                            ✅ Create All Mock Tests
                        </button>
                        <button class="btn btn--secondary" onclick="app.showPracticeSetsPreview(app.tempExtractedPracticeSets)">
                            ← Back to Overview
                        </button>
                        ${setIndex < this.tempExtractedPracticeSets.length - 1 ? `
                            <button class="btn btn--outline" onclick="app.previewPracticeSet(${setIndex + 1})">
                                Next Set →
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            
            const previewDiv = document.getElementById('extractedQuestionsPreview');
            if (previewDiv) {
                previewDiv.innerHTML = previewHtml;
            }
        }
    }

    // NEW: Discard practice sets
    discardPracticeSets() {
        if (confirm('Are you sure you want to discard all detected practice sets?')) {
            this.tempExtractedPracticeSets = null;
            this.resetPDFUpload();
            this.hideModal('pdfUploadModal');
            this.showToast('Practice sets discarded.', 'info');
        }
    }

    // NEW: Store mock tests
    storeMockTests(mockTests) {
        // Get existing mock tests from localStorage
        let storedMockTests = JSON.parse(localStorage.getItem('mockTests')) || [];
        
        // Add new mock tests
        storedMockTests.push(...mockTests);
        
        // Save back to localStorage
        localStorage.setItem('mockTests', JSON.stringify(storedMockTests));
        
        console.log(`Stored ${mockTests.length} mock tests in localStorage`);
    }

    // NEW: Start a practice set test
    startPracticeSetTest(testId) {
        const storedMockTests = JSON.parse(localStorage.getItem('mockTests')) || [];
        const practiceTest = storedMockTests.find(test => test.id === testId);
        
        if (!practiceTest) {
            alert('Practice test not found!');
            return;
        }
        
        // Create test configuration
        const testConfig = {
            type: 'practice_set',
            practiceSetId: testId,
            title: practiceTest.title,
            questions: practiceTest.questions,
            timeLimit: practiceTest.timeLimit,
            difficulty: practiceTest.difficulty,
            subject: practiceTest.subject
        };
        
        console.log('Starting practice set test:', testConfig);
        
        // Start the test using existing test infrastructure
        this.currentTest = this.generateTest(testConfig);
        this.initializeTestInterface();
    }

    // NEW: Preview a practice set test
    previewPracticeSetTest(testId) {
        const storedMockTests = JSON.parse(localStorage.getItem('mockTests')) || [];
        const practiceTest = storedMockTests.find(test => test.id === testId);
        
        if (!practiceTest) {
            alert('Practice test not found!');
            return;
        }
        
        const previewHtml = `
            <div class="practice-test-preview-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${practiceTest.title} - Preview</h2>
                        <button class="close-btn" onclick="app.closePracticeTestPreview()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="test-info">
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">Total Questions:</span>
                                    <span class="info-value">${practiceTest.totalQuestions}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Time Limit:</span>
                                    <span class="info-value">${Math.round(practiceTest.timeLimit / 60)} minutes</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Difficulty:</span>
                                    <span class="info-value">${practiceTest.difficulty}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Subject:</span>
                                    <span class="info-value">${practiceTest.subject}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="sample-questions">
                            <h4>Sample Questions:</h4>
                            ${practiceTest.questions.slice(0, 3).map((q, index) => `
                                <div class="sample-question">
                                    <div class="question-header">
                                        <span class="question-number">Q${index + 1}.</span>
                                        <span class="question-difficulty difficulty-${q.difficulty}">${q.difficulty}</span>
                                    </div>
                                    <div class="question-text">${q.text}</div>
                                    <div class="question-options">
                                        ${q.options.map((opt, i) => `
                                            <div class="option-preview">
                                                <span class="option-letter">${String.fromCharCode(65 + i)}.</span>
                                                <span class="option-text">${opt}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                            ${practiceTest.questions.length > 3 ? `
                                <p class="more-questions">... and ${practiceTest.questions.length - 3} more questions</p>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn--primary" onclick="app.startPracticeSetTest('${testId}')">
                            🚀 Start Test Now
                        </button>
                        <button class="btn btn--secondary" onclick="app.closePracticeTestPreview()">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Create and show modal
        const modalContainer = document.createElement('div');
        modalContainer.id = 'practiceTestPreviewModal';
        modalContainer.className = 'modal-overlay';
        modalContainer.innerHTML = previewHtml;
        document.body.appendChild(modalContainer);
        modalContainer.style.display = 'flex';
    }

    // NEW: Close practice test preview
    closePracticeTestPreview() {
        const modal = document.getElementById('practiceTestPreviewModal');
        if (modal) {
            modal.remove();
        }
    }

    // NEW: Show all practice sets
    showAllPracticeSets() {
        const storedMockTests = JSON.parse(localStorage.getItem('mockTests')) || [];
        const practiceSetTests = storedMockTests.filter(test => test.type === 'practice_set');
        
        // Create a modal or section to show all practice sets
        const allSetsHtml = `
            <div class="all-practice-sets-modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2>📚 All Practice Sets (${practiceSetTests.length})</h2>
                        <button class="close-btn" onclick="app.closeAllPracticeSets()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="practice-sets-table">
                            <table class="sets-table">
                                <thead>
                                    <tr>
                                        <th>Set Name</th>
                                        <th>Questions</th>
                                        <th>Time</th>
                                        <th>Difficulty</th>
                                        <th>Subject</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${practiceSetTests.map(test => `
                                        <tr>
                                            <td><strong>${test.title}</strong></td>
                                            <td>${test.totalQuestions}</td>
                                            <td>${Math.round(test.timeLimit / 60)} min</td>
                                            <td><span class="difficulty-badge difficulty-${test.difficulty.toLowerCase()}">${test.difficulty}</span></td>
                                            <td>${test.subject}</td>
                                            <td>${new Date(test.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button class="btn btn--small btn--primary" onclick="app.startPracticeSetTest('${test.id}')">Start</button>
                                                <button class="btn btn--small btn--outline" onclick="app.previewPracticeSetTest('${test.id}')">Preview</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Create and show modal
        const modalContainer = document.createElement('div');
        modalContainer.id = 'allPracticeSetsModal';
        modalContainer.className = 'modal-overlay';
        modalContainer.innerHTML = allSetsHtml;
        document.body.appendChild(modalContainer);
        modalContainer.style.display = 'flex';
    }

    // NEW: Close all practice sets modal
    closeAllPracticeSets() {
        const modal = document.getElementById('allPracticeSetsModal');
        if (modal) {
            modal.remove();
        }
    }

    showQuestionForReview() {
        const question = this.currentExtractedQuestions[this.currentReviewIndex];
        const reviewContainer = document.getElementById('questionReviewContainer');
        
        if (reviewContainer && question) {
            reviewContainer.innerHTML = `
                <div class="question-review">
                    <div class="review-header">
                        <h3>📝 Review Question ${this.currentReviewIndex + 1} of ${this.currentExtractedQuestions.length}</h3>
                        <p>Please verify and edit the question details below:</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Question Text:</label>
                        <textarea class="form-control" id="reviewQuestionText" rows="3">${question.text}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Options:</label>
                        <div class="options-input">
                            <input type="text" class="form-control" id="reviewOption1" placeholder="Option A" value="${question.options[0]}">
                            <input type="text" class="form-control" id="reviewOption2" placeholder="Option B" value="${question.options[1]}">
                            <input type="text" class="form-control" id="reviewOption3" placeholder="Option C" value="${question.options[2]}">
                            <input type="text" class="form-control" id="reviewOption4" placeholder="Option D" value="${question.options[3]}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Correct Answer:</label>
                            <select class="form-control" id="reviewCorrectAnswer">
                                <option value="0" ${question.correctAnswer === 0 ? 'selected' : ''}>Option A</option>
                                <option value="1" ${question.correctAnswer === 1 ? 'selected' : ''}>Option B</option>
                                <option value="2" ${question.correctAnswer === 2 ? 'selected' : ''}>Option C</option>
                                <option value="3" ${question.correctAnswer === 3 ? 'selected' : ''}>Option D</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Difficulty:</label>
                            <select class="form-control" id="reviewDifficulty">
                                <option value="Easy" ${question.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
                                <option value="Medium" ${question.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
                                <option value="Hard" ${question.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Explanation:</label>
                        <textarea class="form-control" id="reviewExplanation" rows="2" placeholder="Add explanation for the correct answer">${question.explanation}</textarea>
                    </div>
                    <div class="review-actions">
                        <button class="btn btn--primary" onclick="app.saveReviewedQuestion()">💾 Save & Next</button>
                        <button class="btn btn--outline" onclick="app.skipQuestion()">⏭️ Skip</button>
                        <button class="btn btn--secondary" onclick="app.cancelReview()">❌ Cancel Review</button>
                    </div>
                </div>
            `;
        }
    }

    saveReviewedQuestion() {
        const reviewedQuestion = {
            ...this.currentExtractedQuestions[this.currentReviewIndex],
            text: document.getElementById('reviewQuestionText')?.value || '',
            options: [
                document.getElementById('reviewOption1')?.value || '',
                document.getElementById('reviewOption2')?.value || '',
                document.getElementById('reviewOption3')?.value || '',
                document.getElementById('reviewOption4')?.value || ''
            ],
            correctAnswer: parseInt(document.getElementById('reviewCorrectAnswer')?.value || '0'),
            difficulty: document.getElementById('reviewDifficulty')?.value || 'Medium',
            explanation: document.getElementById('reviewExplanation')?.value || '',
            needsReview: false
        };

        // Validate the reviewed question
        if (!reviewedQuestion.text.trim()) {
            alert('Please enter question text.');
            return;
        }

        if (reviewedQuestion.options.some(opt => !opt.trim())) {
            alert('Please fill in all option fields.');
            return;
        }

        // Add to main question bank
        this.questions.push(reviewedQuestion);
        this.currentReviewIndex++;

        if (this.currentReviewIndex >= this.currentExtractedQuestions.length) {
            // Review complete
            this.saveQuestions();
            this.hideModal('questionReviewModal');
            this.hideModal('pdfUploadModal');
            this.resetPDFUpload();
            this.renderQuestionBank();
            this.updateDashboard();
            alert(`🎉 Successfully reviewed and added ${this.currentReviewIndex} questions!`);
            this.switchSection('questionBank');
        } else {
            this.showQuestionForReview();
        }
    }

    skipQuestion() {
        this.currentReviewIndex++;
        if (this.currentReviewIndex >= this.currentExtractedQuestions.length) {
            this.hideModal('questionReviewModal');
            this.hideModal('pdfUploadModal');
            this.resetPDFUpload();
            this.saveQuestions();
            this.renderQuestionBank();
            this.updateDashboard();
            alert('Question review completed!');
        } else {
            this.showQuestionForReview();
        }
    }

    cancelReview() {
        if (confirm('Are you sure you want to cancel the review? All progress will be lost.')) {
            this.hideModal('questionReviewModal');
        }
    }

    // PDF Viewer Methods
    async openPDFViewer(pdfInfo) {
        this.currentPDF = pdfInfo;
        const viewer = document.getElementById('pdfViewer');
        if (viewer) {
            viewer.classList.remove('hidden');
            
            try {
                this.pdfDoc = await pdfjsLib.getDocument(pdfInfo.data).promise;
                this.currentPage = 1;
                this.renderPDFPage();
                this.updatePDFControls();
            } catch (error) {
                console.error('Error loading PDF:', error);
                alert('Error loading PDF for viewing');
            }
        }
    }

    async renderPDFPage() {
        if (!this.pdfDoc) return;

        try {
            const page = await this.pdfDoc.getPage(this.currentPage);
            const canvas = document.getElementById('pdfCanvas');
            const context = canvas.getContext('2d');
            
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

        } catch (error) {
            console.error('Error rendering PDF page:', error);
        }
    }

    updatePDFControls() {
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (pageInfo && this.pdfDoc) {
            pageInfo.textContent = `Page ${this.currentPage} of ${this.pdfDoc.numPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= (this.pdfDoc?.numPages || 1);
        }
    }

    prevPDFPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderPDFPage();
            this.updatePDFControls();
        }
    }

    nextPDFPage() {
        if (this.pdfDoc && this.currentPage < this.pdfDoc.numPages) {
            this.currentPage++;
            this.renderPDFPage();
            this.updatePDFControls();
        }
    }

    zoomPDF(factor) {
        const canvas = document.getElementById('pdfCanvas');
        if (canvas) {
            const currentScale = parseFloat(canvas.dataset.scale || '1.5');
            const newScale = Math.max(0.5, Math.min(3.0, currentScale * factor));
            canvas.dataset.scale = newScale.toString();
            this.renderPDFPageWithScale(newScale);
        }
    }

    async renderPDFPageWithScale(scale) {
        if (!this.pdfDoc) return;

        try {
            const page = await this.pdfDoc.getPage(this.currentPage);
            const canvas = document.getElementById('pdfCanvas');
            const context = canvas.getContext('2d');
            
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

        } catch (error) {
            console.error('Error rendering PDF page with scale:', error);
        }
    }

    closePDFViewer() {
        const viewer = document.getElementById('pdfViewer');
        if (viewer) {
            viewer.classList.add('hidden');
        }
        this.currentPDF = null;
        this.pdfDoc = null;
    }

    // Study Materials Management
    renderStudyMaterials() {
        const pdfList = document.getElementById('pdfList');
        if (!pdfList) return;

        if (this.uploadedPDFs.length === 0) {
            pdfList.innerHTML = `
                <div class="no-pdfs">
                    <div class="no-content-icon">📚</div>
                    <h3>No Study Materials Yet</h3>
                    <p>Upload PDF question banks to start building your question library.</p>
                    <button class="btn btn--primary" onclick="app.showModal('pdfUploadModal')">📤 Upload Your First PDF</button>
                </div>
            `;
            return;
        }

        pdfList.innerHTML = this.uploadedPDFs.map(pdf => `
            <div class="pdf-item">
                <div class="pdf-info">
                    <h4>📄 ${pdf.name}</h4>
                    <p><strong>Subject:</strong> ${pdf.subject} | <strong>Chapter:</strong> ${pdf.chapter}</p>
                    <div class="pdf-stats">
                        <span class="stat">📊 Size: ${this.formatFileSize(pdf.size)}</span>
                        <span class="stat">❓ Questions: ${pdf.questionsExtracted}</span>
                        <span class="stat">📅 Uploaded: ${new Date(pdf.uploadDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="pdf-actions">
                    <button class="btn btn--primary btn--sm" onclick="app.openPDFViewer(${JSON.stringify(pdf).replace(/"/g, '&quot;')})">👁️ View PDF</button>
                    <button class="btn btn--secondary btn--sm" onclick="app.deletePDF('${pdf.id}')">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    deletePDF(pdfId) {
        const pdf = this.uploadedPDFs.find(p => p.id === pdfId);
        if (!pdf) return;

        const confirmMessage = `Are you sure you want to delete "${pdf.name}"?\n\nThis will also remove all ${pdf.questionsExtracted} questions extracted from this PDF.`;
        
        if (confirm(confirmMessage)) {
            // Remove questions from this PDF
            this.questions = this.questions.filter(q => q.source !== `PDF: ${pdf.name}`);
            this.saveQuestions();

            // Remove PDF
            this.uploadedPDFs = this.uploadedPDFs.filter(p => p.id !== pdfId);
            this.savePDFs();

            // Update UI
            this.renderStudyMaterials();
            this.renderQuestionBank();
            this.updateDashboard();
            
            alert(`Successfully deleted "${pdf.name}" and its ${pdf.questionsExtracted} questions.`);
        }
    }

    // Question Bank Management
    // Question Bank Filtering and Search
    filterQuestions() {
        const searchText = document.getElementById('searchQuestions')?.value.toLowerCase() || '';
        const subjectFilter = document.getElementById('subjectFilter')?.value || '';
        const difficultyFilter = document.getElementById('difficultyFilter')?.value || '';

        let filteredQuestions = this.questions.filter(question => {
            const validatedQuestion = this.validateQuestionData(question);
            
            // Text search across question text, options, explanation, subject, and chapter
            const searchMatch = !searchText || 
                validatedQuestion.text.toLowerCase().includes(searchText) ||
                validatedQuestion.options.some(option => option.toLowerCase().includes(searchText)) ||
                validatedQuestion.explanation.toLowerCase().includes(searchText) ||
                validatedQuestion.subject.toLowerCase().includes(searchText) ||
                validatedQuestion.chapter.toLowerCase().includes(searchText);

            // Subject filter
            const subjectMatch = !subjectFilter || validatedQuestion.subject === subjectFilter;

            // Difficulty filter
            const difficultyMatch = !difficultyFilter || validatedQuestion.difficulty === difficultyFilter;

            return searchMatch && subjectMatch && difficultyMatch;
        });

        this.renderQuestionBankWithFilter(filteredQuestions);
    }

    renderQuestionBank() {
        // Reset filters and show all questions
        const searchInput = document.getElementById('searchQuestions');
        const subjectSelect = document.getElementById('subjectFilter');
        const difficultySelect = document.getElementById('difficultyFilter');
        
        if (searchInput) searchInput.value = '';
        if (subjectSelect) subjectSelect.value = '';
        if (difficultySelect) difficultySelect.value = '';
        
        this.renderQuestionBankWithFilter(this.questions);
    }

    renderQuestionBankWithFilter(questions) {
        const tbody = document.getElementById('questionsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (questions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-questions">
                        <div class="no-content">
                            <h3>${this.questions.length === 0 ? 'No Questions Available' : 'No Questions Match Filters'}</h3>
                            <p>${this.questions.length === 0 ? 
                                'Start by adding questions manually or uploading PDF question banks.' : 
                                'Try adjusting your search terms or filters to find more questions.'
                            }</p>
                            ${this.questions.length === 0 ? `
                                <div class="no-content-actions">
                                    <button class="btn btn--primary" onclick="app.showAddQuestionModal()">➕ Add Question</button>
                                    <button class="btn btn--secondary" onclick="app.showModal('pdfUploadModal')">📤 Upload PDF</button>
                                </div>
                            ` : `
                                <div class="no-content-actions">
                                    <button class="btn btn--secondary" onclick="app.renderQuestionBank()">🔄 Clear Filters</button>
                                </div>
                            `}
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        questions.forEach((question, index) => {
            // Validate question data before rendering
            const validatedQuestion = this.validateQuestionData(question);
            
            const row = document.createElement('tr');
            const sourceColor = validatedQuestion.source.startsWith('PDF:') ? '#f39c12' : '#27ae60';
            const needsReviewBadge = validatedQuestion.needsReview ? '<span class="review-badge">Needs Review</span>' : '';
            
            row.innerHTML = `
                <td>
                    <div class="question-preview">
                        <span class="question-number">${index + 1}.</span>
                        ${validatedQuestion.text.substring(0, 100)}${validatedQuestion.text.length > 100 ? '...' : ''}
                    </div>
                    ${needsReviewBadge}
                </td>
                <td><span class="subject-tag">${validatedQuestion.subject}</span></td>
                <td><span class="chapter-tag">${validatedQuestion.chapter}</span></td>
                <td>
                    <span class="difficulty-badge difficulty-${validatedQuestion.difficulty.toLowerCase()}">
                        ${validatedQuestion.difficulty}
                    </span>
                </td>
                <td>
                    ${validatedQuestion.isPYQ ? '<span class="pyq-badge">📝 PYQ</span>' : '<span class="regular-badge">Regular</span>'}
                </td>
                <td>
                    <span class="source-badge" style="color: ${sourceColor}; font-size: var(--font-size-xs);">
                        ${validatedQuestion.source}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn--sm btn--secondary" onclick="app.editQuestion('${validatedQuestion.id}')" title="Edit Question">✏️</button>
                        <button class="btn btn--sm btn--outline" onclick="app.deleteQuestion('${validatedQuestion.id}')" title="Delete Question">🗑️</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update filter status display
        this.updateFilterStatus(questions.length, this.questions.length);
    }

    updateFilterStatus(filteredCount, totalCount) {
        // Find or create filter status element
        let statusElement = document.querySelector('.filter-status');
        if (!statusElement) {
            // Create status element if it doesn't exist
            const filtersDiv = document.querySelector('.filters');
            if (filtersDiv) {
                statusElement = document.createElement('div');
                statusElement.className = 'filter-status';
                filtersDiv.appendChild(statusElement);
            }
        }

        if (statusElement) {
            if (filteredCount === totalCount) {
                statusElement.innerHTML = `<span class="status-text">Showing all ${totalCount} questions</span>`;
            } else {
                statusElement.innerHTML = `
                    <span class="status-text">Showing ${filteredCount} of ${totalCount} questions</span>
                    <button class="btn btn--sm btn--outline" onclick="app.renderQuestionBank()">Clear filters</button>
                `;
            }
        }
    }

    // User Management Methods
    checkExistingUser() {
        console.log('Checking existing user...', this.users.length);
        if (this.users.length > 0) {
            this.currentUser = this.users[0];
            console.log('Found existing user:', this.currentUser.name);
            this.showMainApp();
        } else {
            console.log('No existing user found, showing welcome screen');
            this.showWelcomeScreen();
        }
    }

    showWelcomeScreen() {
        console.log('Showing welcome screen');
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (welcomeScreen) {
            welcomeScreen.style.display = 'flex';
            welcomeScreen.classList.remove('hidden');
        }
        if (mainApp) {
            mainApp.style.display = 'none';
            mainApp.classList.add('hidden');
        }
    }

    showMainApp() {
        console.log('Showing main app for user:', this.currentUser?.name);
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
            welcomeScreen.classList.add('hidden');
        }
        if (mainApp) {
            mainApp.style.display = 'grid';
            mainApp.classList.remove('hidden');
        }
        
        const currentUserSpan = document.getElementById('currentUser');
        if (currentUserSpan && this.currentUser) {
            currentUserSpan.textContent = `Welcome, ${this.currentUser.name}! 👋`;
        }
        
        this.updateDashboard();
        this.renderQuestionBank();
        this.renderStudyMaterials();
    }

    showUserModal() {
        console.log('Showing user modal');
        const modal = document.getElementById('userModal');
        const nameInput = document.getElementById('userName');
        
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
        }
        
        if (nameInput) {
            nameInput.value = '';
            nameInput.focus();
        }
    }

    hideUserModal() {
        console.log('Hiding user modal');
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
    }

    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        });
    }

    createUser() {
        console.log('Creating user...');
        const nameInput = document.getElementById('userName');
        if (!nameInput) {
            console.error('Name input not found');
            alert('Error: Name input field not found');
            return;
        }
        
        const name = nameInput.value.trim();
        console.log('Name entered:', name);
        
        if (!name) {
            alert('Please enter a name');
            nameInput.focus();
            return;
        }

        if (name.length < 2) {
            alert('Name must be at least 2 characters long');
            nameInput.focus();
            return;
        }

        const user = {
            id: 'user_' + Date.now(),
            name: name,
            createdAt: new Date().toISOString(),
            totalTests: 0,
            averageScore: 0
        };

        console.log('Created user object:', user);
        
        this.users.push(user);
        this.currentUser = user;
        this.saveUsers();
        
        console.log('User saved successfully');
        
        // Hide modal first
        this.hideUserModal();
        
        // Clear the input
        nameInput.value = '';
        
        // Show main app after short delay
        setTimeout(() => {
            this.showMainApp();
        }, 200);
    }

    showUserSelection() {
        if (this.users.length === 0) {
            alert('No users found. Please create a user first.');
            return;
        }
        
        const userList = this.users.map((user, index) => 
            `${index + 1}. ${user.name} (${user.totalTests} tests taken)`
        ).join('\n');
        
        const selection = prompt(`Select user:\n${userList}\n\nEnter number:`);
        
        if (selection && !isNaN(selection)) {
            const index = parseInt(selection) - 1;
            if (index >= 0 && index < this.users.length) {
                this.currentUser = this.users[index];
                this.showMainApp();
            } else {
                alert('Invalid selection. Please try again.');
            }
        }
    }

    // Navigation Methods
    switchSection(sectionId) {
        console.log('Switching to section:', sectionId);
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Show section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Load section-specific data
        if (sectionId === 'analytics') {
            setTimeout(() => {
                this.loadAnalytics();
            }, 100);
        } else if (sectionId === 'studyMaterials') {
            this.renderStudyMaterials();
        } else if (sectionId === 'questionBank') {
            this.renderQuestionBank();
        } else if (sectionId === 'dashboard') {
            this.updateDashboard();
        }
    }

    updateDashboard() {
        if (!this.currentUser) return;
        
        const userResults = this.testResults.filter(result => result.userId === this.currentUser.id);
        
        // Get stored mock tests
        const storedMockTests = JSON.parse(localStorage.getItem('mockTests')) || [];
        
        const stats = {
            totalTests: userResults.length,
            totalQuestions: this.questions.length,
            availableMockTests: storedMockTests.length,
            practiceSetTests: storedMockTests.filter(test => test.type === 'practice_set').length,
            averageScore: userResults.length > 0 ? 
                Math.round(userResults.reduce((sum, result) => sum + result.score, 0) / userResults.length) : 0,
            bestScore: userResults.length > 0 ? 
                Math.max(...userResults.map(result => result.score)) : 0
        };
        
        const elements = {
            'totalTests': stats.totalTests,
            'totalQuestions': stats.totalQuestions,
            'averageScore': stats.averageScore + '%',
            'bestScore': stats.bestScore + '%'
        };
        
        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = elements[id];
            }
        });

        // Update practice sets section in dashboard
        this.updatePracticeSetsDashboard(storedMockTests);

        // Update user's average score
        this.currentUser.averageScore = stats.averageScore;
        this.currentUser.totalTests = stats.totalTests;
        this.saveUsers();
    }

    // NEW: Update practice sets dashboard section
    updatePracticeSetsDashboard(storedMockTests) {
        const practiceSetTests = storedMockTests.filter(test => test.type === 'practice_set');
        
        // Find or create practice sets container in dashboard
        let practiceContainer = document.getElementById('practiceSetsDashboard');
        
        if (!practiceContainer) {
            // Create the container if it doesn't exist
            const dashboardContent = document.querySelector('#dashboard .dashboard-content');
            if (dashboardContent) {
                practiceContainer = document.createElement('div');
                practiceContainer.id = 'practiceSetsDashboard';
                practiceContainer.className = 'dashboard-section';
                dashboardContent.appendChild(practiceContainer);
            }
        }
        
        if (practiceContainer) {
            if (practiceSetTests.length > 0) {
                practiceContainer.innerHTML = `
                    <div class="section-header">
                        <h3>📚 Practice Set Mock Tests</h3>
                        <p>Available practice sets extracted from PDFs</p>
                    </div>
                    <div class="practice-sets-grid">
                        ${practiceSetTests.map(test => `
                            <div class="practice-set-card">
                                <div class="set-header">
                                    <h4>${test.title}</h4>
                                    <span class="difficulty-badge difficulty-${test.difficulty.toLowerCase()}">${test.difficulty}</span>
                                </div>
                                <div class="set-details">
                                    <div class="detail-item">
                                        <span class="detail-label">Questions:</span>
                                        <span class="detail-value">${test.totalQuestions}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Time:</span>
                                        <span class="detail-value">${Math.round(test.timeLimit / 60)} min</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Subject:</span>
                                        <span class="detail-value">${test.subject}</span>
                                    </div>
                                </div>
                                <div class="set-actions">
                                    <button class="btn btn--primary btn--small" 
                                            onclick="app.startPracticeSetTest('${test.id}')">
                                        🚀 Start Test
                                    </button>
                                    <button class="btn btn--outline btn--small" 
                                            onclick="app.previewPracticeSetTest('${test.id}')">
                                        👁️ Preview
                                    </button>
                                </div>
                                <div class="set-meta">
                                    <small>Created: ${new Date(test.createdAt).toLocaleDateString()}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${practiceSetTests.length > 6 ? `
                        <div class="view-all-sets">
                            <button class="btn btn--secondary" onclick="app.showAllPracticeSets()">
                                View All ${practiceSetTests.length} Practice Sets
                            </button>
                        </div>
                    ` : ''}
                `;
            } else {
                practiceContainer.innerHTML = `
                    <div class="section-header">
                        <h3>📚 Practice Set Mock Tests</h3>
                        <p>No practice sets available yet</p>
                    </div>
                    <div class="empty-state">
                        <p>Upload a PDF with multiple practice sets to create mock tests automatically!</p>
                        <button class="btn btn--primary" onclick="app.switchSection('questionBank')">
                            📄 Upload Practice Sets PDF
                        </button>
                    </div>
                `;
            }
        }
    }

    // Question Management Methods
    showAddQuestionModal() {
        const titleEl = document.getElementById('questionModalTitle');
        const formEl = document.getElementById('questionForm');
        
        if (titleEl) titleEl.textContent = 'Add New Question';
        if (formEl) formEl.reset();
        
        // Clear any edit mode data
        const saveBtn = document.getElementById('saveQuestion');
        if (saveBtn) {
            delete saveBtn.dataset.editingId;
            saveBtn.textContent = 'Save Question';
        }
        
        this.showModal('questionModal');
    }

    editQuestion(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) {
            alert('Question not found');
            return;
        }

        const titleEl = document.getElementById('questionModalTitle');
        if (titleEl) titleEl.textContent = 'Edit Question';
        
        // Fill form fields
        const fields = {
            'questionTextInput': question.text,
            'option1': question.options[0] || '',
            'option2': question.options[1] || '',
            'option3': question.options[2] || '',
            'option4': question.options[3] || '',
            'correctAnswerSelect': question.correctAnswer,
            'explanationInput': question.explanation,
            'subjectSelect': question.subject,
            'chapterInput': question.chapter,
            'difficultySelect': question.difficulty
        };
        
        Object.keys(fields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = fields[fieldId];
        });
        
        const pyqCheckbox = document.getElementById('isPyqCheckbox');
        if (pyqCheckbox) pyqCheckbox.checked = question.isPYQ;

        const saveBtn = document.getElementById('saveQuestion');
        if (saveBtn) {
            saveBtn.dataset.editingId = questionId;
            saveBtn.textContent = 'Update Question';
        }
        
        this.showModal('questionModal');
    }

    saveQuestion() {
        const form = document.getElementById('questionForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        const saveBtn = document.getElementById('saveQuestion');
        const editingId = saveBtn?.dataset.editingId;
        
        const questionData = {
            id: editingId || 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: document.getElementById('questionTextInput')?.value.trim() || '',
            options: [
                document.getElementById('option1')?.value.trim() || '',
                document.getElementById('option2')?.value.trim() || '',
                document.getElementById('option3')?.value.trim() || '',
                document.getElementById('option4')?.value.trim() || ''
            ],
            correctAnswer: parseInt(document.getElementById('correctAnswerSelect')?.value || '0'),
            explanation: document.getElementById('explanationInput')?.value.trim() || '',
            subject: document.getElementById('subjectSelect')?.value || 'General',
            chapter: document.getElementById('chapterInput')?.value.trim() || 'Miscellaneous',
            difficulty: document.getElementById('difficultySelect')?.value || 'Medium',
            isPYQ: document.getElementById('isPyqCheckbox')?.checked || false,
            source: 'Manual',
            needsReview: false
        };

        // Validation
        if (!questionData.text) {
            alert('Please enter question text');
            return;
        }

        if (questionData.options.some(opt => !opt)) {
            alert('Please fill in all option fields');
            return;
        }

        if (!questionData.explanation) {
            alert('Please provide an explanation');
            return;
        }

        if (editingId) {
            const index = this.questions.findIndex(q => q.id === editingId);
            if (index !== -1) {
                this.questions[index] = questionData;
            }
        } else {
            this.questions.push(questionData);
        }

        this.saveQuestions();
        this.renderQuestionBank();
        this.updateDashboard();
        this.hideModal('questionModal');
        
        const action = editingId ? 'updated' : 'added';
        alert(`✅ Question ${action} successfully!`);
        
        // Clear edit mode
        if (saveBtn) {
            delete saveBtn.dataset.editingId;
            saveBtn.textContent = 'Save Question';
        }
    }

    deleteQuestion(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) {
            alert('Question not found');
            return;
        }

        const confirmMessage = `Are you sure you want to delete this question?\n\n"${question.text.substring(0, 100)}..."`;
        
        if (confirm(confirmMessage)) {
            this.questions = this.questions.filter(q => q.id !== questionId);
            this.saveQuestions();
            this.renderQuestionBank();
            this.updateDashboard();
            alert('🗑️ Question deleted successfully');
        }
    }

    // Test Management Methods
    handleQuickAction(action) {
        switch(action) {
            case 'fullMockTest':
                this.startTest('fullMock');
                break;
            case 'customTest':
                this.showModal('customTestModal');
                break;
            case 'pyqTest':
                this.startTest('pyq');
                break;
            default:
                console.warn('Unknown quick action:', action);
        }
    }

    startTest(testType) {
        if (this.questions.length === 0) {
            alert('No questions available. Please add questions to the question bank first.');
            return;
        }

        console.log(`Starting ${testType} test with ${this.questions.length} questions available`);
        
        let testConfig = {};
        
        switch(testType) {
            case 'fullMock':
                testConfig = this.generateAdaptiveFullMockConfig();
                break;
            case 'pyq':
                testConfig = this.generateAdaptivePYQConfig();
                break;
            case 'subjectWise':
                testConfig = this.generateSubjectWiseConfig();
                break;
            default:
                alert('Invalid test type');
                return;
        }

        if (!testConfig) {
            return; // Error already shown by the config generation method
        }

        console.log('Generated test config:', testConfig);
        this.generateTest(testConfig);
    }

    generateAdaptiveFullMockConfig() {
        // Get available questions by subject
        const availableBySubject = this.getQuestionCountBySubject();
        console.log('Available questions by subject:', availableBySubject);
        
        const totalAvailable = this.questions.length;
        
        if (totalAvailable < 5) {
            alert(`Not enough questions for a Full Mock Test. Available: ${totalAvailable}, Minimum required: 5\n\nPlease add more questions to the question bank.`);
            return null;
        }

        // Define ideal proportions for RRB test
        const idealProportions = {
            'Mathematics': 0.20,
            'General Intelligence & Reasoning': 0.15,
            'Basic Science & Engineering': 0.35,
            'General Awareness': 0.10,
            'Computer Applications': 0.20
        };

        // Calculate adaptive test size (aim for 25-100 questions based on availability)
        let targetQuestions = Math.min(100, Math.max(25, totalAvailable));
        if (totalAvailable < 25) {
            targetQuestions = Math.max(5, totalAvailable); // Use all available if less than 25
        }

        // Calculate distribution based on availability and ideal proportions
        const subjects = this.calculateAdaptiveDistribution(availableBySubject, idealProportions, targetQuestions);
        
        const actualTotal = Object.values(subjects).reduce((sum, count) => sum + count, 0);
        
        console.log(`Full Mock Test: Using ${actualTotal} questions out of ${totalAvailable} available`);
        console.log('Subject distribution:', subjects);

        return {
            title: `Full Mock Test (${actualTotal} Questions)`,
            duration: Math.max(30, Math.min(90, Math.ceil(actualTotal * 0.9))), // ~0.9 min per question
            subjects: subjects,
            totalQuestions: actualTotal,
            isAdaptive: true
        };
    }

    generateAdaptivePYQConfig() {
        const pyqQuestions = this.questions.filter(q => q.isPYQ);
        console.log(`PYQ questions available: ${pyqQuestions.length}`);
        
        if (pyqQuestions.length === 0) {
            alert('No Previous Year Questions available. Please add PYQ questions first.');
            return null;
        }

        const availableBySubject = this.getQuestionCountBySubject(pyqQuestions);
        console.log('Available PYQ questions by subject:', availableBySubject);

        const idealProportions = {
            'Mathematics': 0.25,
            'General Intelligence & Reasoning': 0.20,
            'Basic Science & Engineering': 0.30,
            'General Awareness': 0.15,
            'Computer Applications': 0.10
        };

        let targetQuestions = Math.min(50, Math.max(5, pyqQuestions.length));
        const subjects = this.calculateAdaptiveDistribution(availableBySubject, idealProportions, targetQuestions);
        
        const actualTotal = Object.values(subjects).reduce((sum, count) => sum + count, 0);

        return {
            title: `PYQ Test (${actualTotal} Questions)`,
            duration: Math.max(20, Math.min(60, Math.ceil(actualTotal * 0.8))), // ~0.8 min per question
            subjects: subjects,
            totalQuestions: actualTotal,
            pyqOnly: true,
            isAdaptive: true
        };
    }

    generateSubjectWiseConfig() {
        const subjectSelect = document.querySelector('.test-subject-select');
        const subject = subjectSelect ? subjectSelect.value : 'Mathematics';
        const subjectQuestions = this.questions.filter(q => q.subject === subject);
        
        console.log(`Subject-wise test for ${subject}: ${subjectQuestions.length} questions available`);
        
        if (subjectQuestions.length === 0) {
            alert(`No questions available for ${subject}. Please add questions for this subject first.`);
            return null;
        }

        const questionCount = Math.min(25, subjectQuestions.length);
        
        return {
            title: `${subject} Test (${questionCount} Questions)`,
            duration: Math.max(15, Math.min(30, Math.ceil(questionCount * 1.2))), // ~1.2 min per question
            subjects: { [subject]: questionCount },
            totalQuestions: questionCount,
            isAdaptive: true
        };
    }

    getQuestionCountBySubject(questionSet = null) {
        const questions = questionSet || this.questions;
        const counts = {};
        
        questions.forEach(q => {
            const subject = q.subject || 'Unknown';
            counts[subject] = (counts[subject] || 0) + 1;
        });
        
        return counts;
    }

    calculateAdaptiveDistribution(availableBySubject, idealProportions, targetQuestions) {
        const subjects = {};
        const subjectNames = Object.keys(idealProportions);
        
        // First pass: allocate based on ideal proportions, but limited by availability
        let allocated = 0;
        subjectNames.forEach(subject => {
            const available = availableBySubject[subject] || 0;
            if (available > 0) {
                const ideal = Math.floor(targetQuestions * idealProportions[subject]);
                const allocation = Math.min(ideal, available);
                subjects[subject] = allocation;
                allocated += allocation;
            }
        });

        // Second pass: distribute remaining questions proportionally among subjects with availability
        let remaining = targetQuestions - allocated;
        while (remaining > 0 && allocated < targetQuestions) {
            let distributed = false;
            
            for (const subject of subjectNames) {
                const available = availableBySubject[subject] || 0;
                const current = subjects[subject] || 0;
                
                if (current < available && remaining > 0) {
                    subjects[subject] = current + 1;
                    remaining--;
                    allocated++;
                    distributed = true;
                }
            }
            
            // If we can't distribute any more, break to avoid infinite loop
            if (!distributed) break;
        }

        // Remove subjects with 0 questions
        Object.keys(subjects).forEach(subject => {
            if (subjects[subject] === 0) {
                delete subjects[subject];
            }
        });

        return subjects;
    }

    startCustomTest() {
        const totalQuestionsInput = document.getElementById('totalQuestionsInput');
        const testDurationInput = document.getElementById('testDurationInput');
        
        const requestedQuestions = totalQuestionsInput ? parseInt(totalQuestionsInput.value) : 25;
        const duration = testDurationInput ? parseInt(testDurationInput.value) : 30;
        
        if (requestedQuestions < 1 || requestedQuestions > 100) {
            alert('Total questions must be between 1 and 100');
            return;
        }

        if (duration < 1 || duration > 180) {
            alert('Test duration must be between 1 and 180 minutes');
            return;
        }

        const requestedSubjects = {};
        let subjectTotal = 0;
        
        // Get user's requested distribution
        document.querySelectorAll('.subject-count').forEach(input => {
            const count = parseInt(input.value) || 0;
            if (count > 0) {
                requestedSubjects[input.dataset.subject] = count;
                subjectTotal += count;
            }
        });

        if (Object.keys(requestedSubjects).length === 0) {
            alert('Please select at least one subject with question count > 0');
            return;
        }

        if (subjectTotal !== requestedQuestions) {
            alert(`Subject distribution (${subjectTotal}) doesn't match total questions (${requestedQuestions})`);
            return;
        }

        // Check availability and adapt if necessary
        const availableBySubject = this.getQuestionCountBySubject();
        const adaptedSubjects = {};
        let totalAvailable = 0;
        let hasChanges = false;

        console.log('Custom test requested distribution:', requestedSubjects);
        console.log('Available questions by subject:', availableBySubject);

        // Validate and adapt the distribution
        for (const [subject, requested] of Object.entries(requestedSubjects)) {
            const available = availableBySubject[subject] || 0;
            const allocated = Math.min(requested, available);
            
            if (allocated > 0) {
                adaptedSubjects[subject] = allocated;
                totalAvailable += allocated;
            }
            
            if (allocated < requested) {
                hasChanges = true;
                console.log(`${subject}: requested ${requested}, allocated ${allocated}`);
            }
        }

        if (totalAvailable < 3) {
            alert(`Not enough questions available for custom test.\nRequested: ${requestedQuestions}\nAvailable: ${totalAvailable}\nMinimum required: 3\n\nPlease add more questions or adjust your selection.`);
            return;
        }

        // Show adaptation warning if needed
        if (hasChanges) {
            const changes = Object.entries(requestedSubjects).map(([subject, requested]) => {
                const allocated = adaptedSubjects[subject] || 0;
                const available = availableBySubject[subject] || 0;
                if (allocated < requested) {
                    return `${subject}: ${allocated}/${requested} (only ${available} available)`;
                }
                return null;
            }).filter(Boolean);

            const message = `Custom test adapted to available questions:\n\n${changes.join('\n')}\n\nTotal questions: ${totalAvailable}/${requestedQuestions}\n\nProceed with adapted test?`;
            
            if (!confirm(message)) {
                return;
            }
        }

        const testConfig = {
            title: `Custom Test (${totalAvailable} Questions)`,
            duration: Math.max(10, Math.min(duration, Math.ceil(totalAvailable * 1.5))), // Adjust duration if needed
            subjects: adaptedSubjects,
            totalQuestions: totalAvailable,
            isAdaptive: hasChanges,
            isCustom: true
        };

        console.log('Final custom test config:', testConfig);

        this.hideModal('customTestModal');
        this.generateTest(testConfig);
    }

    generateTest(config) {
        console.log('Generating test with config:', config);
        let selectedQuestions = [];
        
        // Handle practice set tests differently
        if (config.type === 'practice_set') {
            selectedQuestions = config.questions || [];
            
            if (selectedQuestions.length === 0) {
                alert('No questions found in this practice set.');
                return;
            }
            
            // Create test session for practice set
            this.testSession = {
                id: 'practice_test_' + Date.now(),
                config: {
                    ...config,
                    duration: Math.round(config.timeLimit / 60), // Convert seconds to minutes
                    title: config.title || 'Practice Set Test'
                },
                questions: selectedQuestions,
                answers: new Array(selectedQuestions.length).fill(-1),
                timeSpent: new Array(selectedQuestions.length).fill(0),
                marked: new Array(selectedQuestions.length).fill(false),
                currentQuestion: 0,
                startTime: Date.now(),
                duration: config.timeLimit * 1000, // timeLimit is already in seconds, convert to milliseconds
                questionStartTime: Date.now(),
                isPracticeSet: true,
                practiceSetId: config.practiceSetId
            };
            
            this.switchSection('testInterface');
            return this.testSession;
        }
        
        // Enhanced test generation logic with better error handling
        const questionSelection = this.selectQuestionsForTest(config);
        
        if (!questionSelection.success) {
            alert(questionSelection.message);
            return;
        }
        
        selectedQuestions = questionSelection.questions;
        console.log(`Selected ${selectedQuestions.length} questions for test`);

        // Log question distribution
        const distribution = this.getQuestionCountBySubject(selectedQuestions);
        console.log('Final question distribution:', distribution);

        // Shuffle final question order
        selectedQuestions = this.shuffleArray(selectedQuestions);

        if (selectedQuestions.length === 0) {
            alert('No questions available for the selected criteria. Please add questions to the question bank first.');
            return;
        }

        // Create test session
        this.testSession = {
            id: 'test_' + Date.now(),
            config: {
                ...config,
                actualQuestions: selectedQuestions.length,
                distribution: distribution
            },
            questions: selectedQuestions,
            answers: new Array(selectedQuestions.length).fill(-1),
            timeSpent: new Array(selectedQuestions.length).fill(0),
            marked: new Array(selectedQuestions.length).fill(false),
            currentQuestion: 0,
            startTime: Date.now(),
            duration: config.duration * 60 * 1000, // Convert to milliseconds
            questionStartTime: Date.now()
        };

        console.log('Test session created:', {
            id: this.testSession.id,
            questionCount: selectedQuestions.length,
            duration: config.duration,
            subjects: Object.keys(config.subjects)
        });

        this.switchSection('testInterface');
        setTimeout(() => {
            this.initializeTestInterface();
        }, 200);
        
        return this.testSession;
    }

    selectQuestionsForTest(config) {
        const result = {
            success: false,
            questions: [],
            message: '',
            warnings: []
        };

        const questionPool = config.pyqOnly ? 
            this.questions.filter(q => q.isPYQ) : 
            this.questions;

        console.log(`Question pool size: ${questionPool.length} (PYQ only: ${config.pyqOnly || false})`);

        if (questionPool.length === 0) {
            result.message = config.pyqOnly ? 
                'No PYQ questions available. Please add Previous Year Questions first.' :
                'No questions available. Please add questions to the question bank first.';
            return result;
        }

        const selectedQuestions = [];
        const actualDistribution = {};
        let totalSelected = 0;

        // Try to select questions for each subject
        for (const [subject, requiredCount] of Object.entries(config.subjects)) {
            const subjectQuestions = questionPool.filter(q => q.subject === subject);
            console.log(`${subject}: ${subjectQuestions.length} available, ${requiredCount} required`);
            
            if (subjectQuestions.length === 0) {
                result.warnings.push(`No questions available for ${subject}`);
                continue;
            }

            const availableCount = Math.min(requiredCount, subjectQuestions.length);
            
            if (availableCount < requiredCount) {
                result.warnings.push(`Only ${availableCount} questions available for ${subject} (requested ${requiredCount})`);
            }

            // Shuffle and select questions
            const shuffled = this.shuffleArray([...subjectQuestions]);
            const selected = shuffled.slice(0, availableCount);
            
            selectedQuestions.push(...selected);
            actualDistribution[subject] = availableCount;
            totalSelected += availableCount;
            
            console.log(`Selected ${availableCount} questions for ${subject}`);
        }

        // Check if we have minimum viable test
        if (totalSelected < 3) {
            result.message = `Not enough questions for a viable test. Available: ${totalSelected}, Minimum required: 3\n\nPlease add more questions to the question bank.`;
            return result;
        }

        // Add warnings to user if any
        if (result.warnings.length > 0 && config.isAdaptive) {
            const warningMessage = `Test adapted to available questions:\n\n${result.warnings.join('\n')}\n\nTotal questions: ${totalSelected}`;
            console.log('Test generation warnings:', warningMessage);
            
            // Show warning but continue (for adaptive tests)
            setTimeout(() => {
                alert(`ℹ️ ${warningMessage}\n\nThe test will proceed with the available questions.`);
            }, 500);
        }

        result.success = true;
        result.questions = selectedQuestions;
        result.message = `Successfully selected ${totalSelected} questions`;
        
        return result;
    }

    initializeTestInterface() {
        const testTitleEl = document.getElementById('testTitle');
        if (testTitleEl && this.testSession?.config) {
            let title = this.testSession.config.title;
            
            // Add distribution info for adaptive tests
            if (this.testSession.config.isAdaptive && this.testSession.config.distribution) {
                const distInfo = Object.entries(this.testSession.config.distribution)
                    .map(([subject, count]) => `${subject.substring(0, 4)}: ${count}`)
                    .join(' | ');
                title += ` [${distInfo}]`;
            }
            
            testTitleEl.textContent = title;
            console.log('Test interface initialized with title:', title);
        }
        
        // Log test session details for debugging
        if (this.testSession) {
            console.log('Test session details:', {
                questions: this.testSession.questions.length,
                duration: this.testSession.duration / 60000, // Convert to minutes
                subjects: Object.keys(this.testSession.config.subjects || {}),
                isAdaptive: this.testSession.config.isAdaptive
            });
        }
        
        this.startTimer();
        this.renderQuestion();
        this.renderQuestionPalette();
    }

    startTimer() {
        const endTime = this.testSession.startTime + this.testSession.duration;
        
        // Clear any existing timer
        if (this.testSession.timer) {
            clearInterval(this.testSession.timer);
        }
        
        this.testSession.timer = setInterval(() => {
            const remaining = endTime - Date.now();
            
            if (remaining <= 0) {
                this.submitTest();
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            const timeRemainingEl = document.getElementById('timeRemaining');
            if (timeRemainingEl) {
                timeRemainingEl.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Warning for last 5 minutes
                if (remaining <= 5 * 60 * 1000) {
                    timeRemainingEl.style.color = '#e74c3c';
                    timeRemainingEl.style.fontWeight = 'bold';
                }
            }
        }, 1000);
    }

    renderQuestion() {
        if (!this.testSession || !this.testSession.questions.length) return;
        
        const question = this.testSession.questions[this.testSession.currentQuestion];
        const questionNum = this.testSession.currentQuestion + 1;
        
        const elements = {
            'currentQuestionNum': questionNum,
            'testProgress': `Question ${questionNum} of ${this.testSession.questions.length}`,
            'questionText': question.text
        };
        
        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = elements[id];
        });
        
        const optionsHtml = question.options.map((option, index) => `
            <div class="option ${this.testSession.answers[this.testSession.currentQuestion] === index ? 'selected' : ''}" 
                 onclick="app.selectOption(${index})">
                <input type="radio" name="question_${this.testSession.currentQuestion}" 
                       value="${index}" ${this.testSession.answers[this.testSession.currentQuestion] === index ? 'checked' : ''}>
                <span class="option-label">${String.fromCharCode(65 + index)}.</span>
                <span class="option-text">${option}</span>
            </div>
        `).join('');
        
        const questionOptionsEl = document.getElementById('questionOptions');
        if (questionOptionsEl) {
            questionOptionsEl.innerHTML = optionsHtml;
        }
        
        // Update navigation buttons
        const prevBtn = document.getElementById('previousQuestion');
        const nextBtn = document.getElementById('nextQuestion');
        
        if (prevBtn) {
            prevBtn.disabled = this.testSession.currentQuestion === 0;
            prevBtn.textContent = this.testSession.currentQuestion === 0 ? '← Previous' : '← Previous';
        }
        
        if (nextBtn) {
            const isLast = this.testSession.currentQuestion === this.testSession.questions.length - 1;
            nextBtn.disabled = isLast;
            nextBtn.textContent = isLast ? 'Next →' : 'Next →';
        }
            
        // Update mark for review button
        const markBtn = document.getElementById('markForReview');
        if (markBtn) {
            const isMarked = this.testSession.marked[this.testSession.currentQuestion];
            markBtn.textContent = isMarked ? '🏷️ Unmark for Review' : '🏷️ Mark for Review';
            markBtn.className = `btn ${isMarked ? 'btn--warning' : 'btn--secondary'}`;
        }

        // Record question start time for analytics
        this.testSession.questionStartTime = Date.now();
    }

    selectOption(optionIndex) {
        if (this.testSession.currentQuestion >= 0 && this.testSession.currentQuestion < this.testSession.questions.length) {
            // Record time spent on this question
            const timeSpent = Date.now() - this.testSession.questionStartTime;
            this.testSession.timeSpent[this.testSession.currentQuestion] = timeSpent;
            
            this.testSession.answers[this.testSession.currentQuestion] = optionIndex;
            this.renderQuestion();
            this.renderQuestionPalette();
        }
    }

    clearResponse() {
        if (this.testSession.currentQuestion >= 0 && this.testSession.currentQuestion < this.testSession.questions.length) {
            this.testSession.answers[this.testSession.currentQuestion] = -1;
            this.renderQuestion();
            this.renderQuestionPalette();
        }
    }

    markForReview() {
        const currentIdx = this.testSession.currentQuestion;
        if (currentIdx >= 0 && currentIdx < this.testSession.questions.length) {
            this.testSession.marked[currentIdx] = !this.testSession.marked[currentIdx];
            this.renderQuestion();
            this.renderQuestionPalette();
        }
    }

    nextQuestion() {
        if (this.testSession.currentQuestion < this.testSession.questions.length - 1) {
            // Record time spent on current question
            const timeSpent = Date.now() - this.testSession.questionStartTime;
            this.testSession.timeSpent[this.testSession.currentQuestion] = timeSpent;
            
            this.testSession.currentQuestion++;
            this.renderQuestion();
            this.renderQuestionPalette();
        }
    }

    previousQuestion() {
        if (this.testSession.currentQuestion > 0) {
            // Record time spent on current question
            const timeSpent = Date.now() - this.testSession.questionStartTime;
            this.testSession.timeSpent[this.testSession.currentQuestion] = timeSpent;
            
            this.testSession.currentQuestion--;
            this.renderQuestion();
            this.renderQuestionPalette();
        }
    }

    renderQuestionPalette() {
        const palette = document.getElementById('questionPalette');
        if (!palette) return;
        
        palette.innerHTML = '';
        
        this.testSession.questions.forEach((_, index) => {
            const item = document.createElement('div');
            item.className = 'palette-item';
            item.textContent = index + 1;
            item.onclick = () => this.jumpToQuestion(index);
            item.title = `Question ${index + 1}`;
            
            // Determine status
            if (index === this.testSession.currentQuestion) {
                item.classList.add('current');
            } else if (this.testSession.answers[index] !== -1) {
                item.classList.add('answered');
            } else {
                item.classList.add('not-answered');
            }
            
            if (this.testSession.marked[index]) {
                item.classList.add('marked');
            }
            
            palette.appendChild(item);
        });
    }

    jumpToQuestion(index) {
        if (index >= 0 && index < this.testSession.questions.length) {
            // Record time spent on current question
            const timeSpent = Date.now() - this.testSession.questionStartTime;
            this.testSession.timeSpent[this.testSession.currentQuestion] = timeSpent;
            
            this.testSession.currentQuestion = index;
            this.renderQuestion();
            this.renderQuestionPalette();
        }
    }

    submitTest() {
        // Clear timer
        if (this.testSession.timer) {
            clearInterval(this.testSession.timer);
        }
        
        // Record final question time
        if (this.testSession.questionStartTime) {
            const timeSpent = Date.now() - this.testSession.questionStartTime;
            this.testSession.timeSpent[this.testSession.currentQuestion] = timeSpent;
        }
        
        const confirmMessage = `Are you sure you want to submit the test?\n\nAnswered: ${this.testSession.answers.filter(a => a !== -1).length}/${this.testSession.questions.length}`;
        
        if (!confirm(confirmMessage)) {
            // Restart timer if user cancels
            this.startTimer();
            return;
        }
        
        // Calculate results
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unattempted = 0;
        
        this.testSession.questions.forEach((question, index) => {
            const userAnswer = this.testSession.answers[index];
            if (userAnswer === -1) {
                unattempted++;
            } else if (userAnswer === question.correctAnswer) {
                correctAnswers++;
            } else {
                incorrectAnswers++;
            }
        });
        
        // Calculate score (with negative marking)
        const rawScore = correctAnswers - (incorrectAnswers * 0.33);
        const percentage = Math.round((rawScore / this.testSession.questions.length) * 100);
        
        // Save result
        const result = {
            id: this.testSession.id,
            userId: this.currentUser.id,
            testType: this.testSession.config.title,
            totalQuestions: this.testSession.questions.length,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers,
            unattempted: unattempted,
            score: Math.max(0, percentage),
            rawScore: Math.max(0, rawScore),
            timeSpent: Date.now() - this.testSession.startTime,
            completedAt: new Date().toISOString(),
            questions: this.testSession.questions,
            answers: this.testSession.answers,
            marked: this.testSession.marked,
            questionTimeSpent: this.testSession.timeSpent
        };
        
        this.testResults.push(result);
        this.saveTestResults();
        
        // Update user stats
        this.currentUser.totalTests++;
        const userResults = this.testResults.filter(r => r.userId === this.currentUser.id);
        this.currentUser.averageScore = Math.round(userResults.reduce((sum, r) => sum + r.score, 0) / userResults.length);
        this.saveUsers();
        
        this.currentTest = result;
        this.showTestReview();
    }

    showTestReview() {
        this.switchSection('testReview');
        setTimeout(() => {
            this.renderTestReview();
        }, 100);
    }

    renderTestReview() {
        const result = this.currentTest;
        if (!result) return;
        
        // Enhanced summary with detailed performance analysis
        const summaryHtml = `
            <div class="review-header">
                <h2>📋 Test Review & Solutions</h2>
                <p class="test-info">
                    <strong>${result.testType}</strong> • 
                    Completed on ${new Date(result.completedAt).toLocaleDateString()} at ${new Date(result.completedAt).toLocaleTimeString()}
                </p>
            </div>
            
            <div class="summary-grid">
                <div class="summary-item">
                    <h4>📊 Total Questions</h4>
                    <div class="summary-value">${result.totalQuestions}</div>
                </div>
                <div class="summary-item correct">
                    <h4>✅ Correct</h4>
                    <div class="summary-value">${result.correctAnswers}</div>
                    <div class="summary-percentage">${Math.round((result.correctAnswers/result.totalQuestions)*100)}%</div>
                </div>
                <div class="summary-item incorrect">
                    <h4>❌ Incorrect</h4>
                    <div class="summary-value">${result.incorrectAnswers}</div>
                    <div class="summary-percentage">${Math.round((result.incorrectAnswers/result.totalQuestions)*100)}%</div>
                </div>
                <div class="summary-item unattempted">
                    <h4>⏭️ Unattempted</h4>
                    <div class="summary-value">${result.unattempted}</div>
                    <div class="summary-percentage">${Math.round((result.unattempted/result.totalQuestions)*100)}%</div>
                </div>
                <div class="summary-item score">
                    <h4>🎯 Final Score</h4>
                    <div class="summary-value">${result.score}%</div>
                    <div class="summary-grade">${this.getGrade(result.score)}</div>
                </div>
                <div class="summary-item time">
                    <h4>⏱️ Time Taken</h4>
                    <div class="summary-value">${Math.round(result.timeSpent / 60000)} min</div>
                    <div class="summary-average">Avg: ${Math.round(result.timeSpent / (result.totalQuestions * 1000))}s/Q</div>
                </div>
            </div>
            
            <div class="performance-analysis">
                <div class="performance-message">
                    <h3>${this.getPerformanceMessage(result.score)}</h3>
                    <p>${this.getPerformanceAdvice(result)}</p>
                </div>
                
                <div class="detailed-analysis">
                    <h4>📈 Detailed Analysis</h4>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <span class="label">Accuracy Rate:</span>
                            <span class="value">${result.correctAnswers + result.incorrectAnswers > 0 ? Math.round((result.correctAnswers/(result.correctAnswers + result.incorrectAnswers))*100) : 0}%</span>
                        </div>
                        <div class="analysis-item">
                            <span class="label">Attempt Rate:</span>
                            <span class="value">${Math.round(((result.correctAnswers + result.incorrectAnswers)/result.totalQuestions)*100)}%</span>
                        </div>
                        <div class="analysis-item">
                            <span class="label">Raw Score:</span>
                            <span class="value">${result.rawScore.toFixed(2)}/${result.totalQuestions}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="label">Negative Marking:</span>
                            <span class="value">-${(result.incorrectAnswers * 0.33).toFixed(2)} marks</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="subject-wise-analysis">
                ${this.generateSubjectWiseAnalysis(result)}
            </div>
        `;
        
        const summaryEl = document.getElementById('reviewSummary');
        if (summaryEl) {
            summaryEl.innerHTML = summaryHtml;
        }
        
        // Render all questions with solutions by default
        this.renderReviewQuestions('all');
    }

    // Get grade based on score
    getGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'A-';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        if (score >= 55) return 'C';
        if (score >= 50) return 'C-';
        if (score >= 40) return 'D';
        return 'F';
    }

    // Generate subject-wise performance analysis
    generateSubjectWiseAnalysis(result) {
        const subjectStats = {};
        
        result.questions.forEach((question, index) => {
            const subject = question.subject || 'General';
            if (!subjectStats[subject]) {
                subjectStats[subject] = {
                    total: 0,
                    correct: 0,
                    incorrect: 0,
                    unattempted: 0
                };
            }
            
            subjectStats[subject].total++;
            const userAnswer = result.answers[index];
            
            if (userAnswer === -1) {
                subjectStats[subject].unattempted++;
            } else if (userAnswer === question.correctAnswer) {
                subjectStats[subject].correct++;
            } else {
                subjectStats[subject].incorrect++;
            }
        });
        
        const subjects = Object.keys(subjectStats);
        if (subjects.length <= 1) return '';
        
        const subjectHtml = subjects.map(subject => {
            const stats = subjectStats[subject];
            const accuracy = stats.correct + stats.incorrect > 0 ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100) : 0;
            
            return `
                <div class="subject-stat">
                    <h5>${subject}</h5>
                    <div class="subject-details">
                        <span class="stat">Total: ${stats.total}</span>
                        <span class="stat correct">Correct: ${stats.correct}</span>
                        <span class="stat incorrect">Wrong: ${stats.incorrect}</span>
                        <span class="stat accuracy">Accuracy: ${accuracy}%</span>
                    </div>
                    <div class="subject-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${accuracy}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <h4>📚 Subject-wise Performance</h4>
            <div class="subject-stats-grid">
                ${subjectHtml}
            </div>
        `;
    }

    getPerformanceMessage(score) {
        if (score >= 85) return "🎉 Excellent Performance!";
        if (score >= 70) return "👍 Good Job!";
        if (score >= 50) return "📈 Keep Improving!";
        return "💪 More Practice Needed!";
    }

    getPerformanceAdvice(result) {
        const accuracy = (result.correctAnswers / (result.correctAnswers + result.incorrectAnswers)) * 100;
        const attemptRate = ((result.correctAnswers + result.incorrectAnswers) / result.totalQuestions) * 100;
        
        let advice = [];
        
        if (accuracy < 60) {
            advice.push("Focus on understanding concepts better");
        }
        
        if (attemptRate < 80) {
            advice.push("Try to attempt more questions");
        }
        
        if (result.incorrectAnswers > result.correctAnswers) {
            advice.push("Review incorrect answers to avoid similar mistakes");
        }
        
        if (advice.length === 0) {
            advice.push("Great job! Keep practicing to maintain this performance");
        }
        
        return advice.join(". ") + ".";
    }

    filterReviewQuestions(filter) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.renderReviewQuestions(filter);
    }

    renderReviewQuestions(filter) {
        const result = this.currentTest;
        if (!result) return;
        
        const container = document.getElementById('reviewQuestions');
        if (!container) return;
        
        container.innerHTML = '';
        
        let filteredQuestions = [];
        
        result.questions.forEach((question, index) => {
            const userAnswer = result.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isUnattempted = userAnswer === -1;
            const isMarked = result.marked[index];
            
            // Apply filter
            if (filter === 'correct' && !isCorrect) return;
            if (filter === 'incorrect' && (isCorrect || isUnattempted)) return;
            if (filter === 'unattempted' && !isUnattempted) return;
            if (filter === 'marked' && !isMarked) return;
            
            filteredQuestions.push({ question, index, userAnswer, isCorrect, isUnattempted, isMarked });
        });
        
        if (filteredQuestions.length === 0) {
            container.innerHTML = `
                <div class="no-questions-filtered">
                    <h3>No questions match the selected filter</h3>
                    <p>Try selecting a different filter to view questions.</p>
                </div>
            `;
            return;
        }
        
        filteredQuestions.forEach(({ question, index, userAnswer, isCorrect, isUnattempted, isMarked }) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'review-question';
            
            const resultClass = isUnattempted ? 'unattempted' : (isCorrect ? 'correct' : 'incorrect');
            const resultText = isUnattempted ? '⏭️ Unattempted' : (isCorrect ? '✅ Correct' : '❌ Incorrect');
            const timeSpent = result.questionTimeSpent ? Math.round(result.questionTimeSpent[index] / 1000) : 0;
            
            questionDiv.innerHTML = `
                <div class="review-question-header">
                    <h4>Question ${index + 1}</h4>
                    <div class="question-stats">
                        <span class="question-result ${resultClass}">${resultText}</span>
                        <span class="question-source">📚 ${question.source}</span>
                        <span class="question-time">⏱️ ${timeSpent}s</span>
                        ${isMarked ? '<span class="marked-indicator">🏷️ Marked</span>' : ''}
                    </div>
                </div>
                <div class="question-text">${question.text}</div>
                <div class="answer-comparison">
                    <div class="answer-box user-answer ${resultClass}">
                        <h5>Your Answer:</h5>
                        <p>${userAnswer === -1 ? 'Not Attempted' : 
                            `${String.fromCharCode(65 + userAnswer)}. ${question.options[userAnswer]}`}</p>
                    </div>
                    <div class="answer-box correct-answer">
                        <h5>Correct Answer:</h5>
                        <p>${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}</p>
                    </div>
                </div>
                <div class="all-options">
                    <h5>All Options:</h5>
                    <div class="options-list">
                        ${question.options.map((option, optIndex) => `
                            <div class="option-review ${optIndex === question.correctAnswer ? 'correct-option' : ''} ${optIndex === userAnswer && userAnswer !== question.correctAnswer ? 'selected-wrong' : ''}">
                                <span class="option-label">${String.fromCharCode(65 + optIndex)}.</span>
                                <span class="option-text">${option}</span>
                                ${optIndex === question.correctAnswer ? '<span class="correct-mark">✓</span>' : ''}
                                ${optIndex === userAnswer && userAnswer !== question.correctAnswer ? '<span class="wrong-mark">✗</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="explanation">
                    <h5>💡 Explanation:</h5>
                    <p>${question.explanation}</p>
                </div>
                ${this.renderDetailedSolution(question, index, isCorrect, userAnswer)}
            `;
            
            container.appendChild(questionDiv);
        });
    }

    // Render detailed solution for practice set questions
    renderDetailedSolution(question, questionIndex, isCorrect, userAnswer) {
        // Check if this is from a practice set and has detailed solution
        const hasPracticeSetSolution = question.source && question.source.includes('Practice Set');
        const hasDetailedSolution = question.solution || question.hasDetailedSolution;
        
        if (!hasPracticeSetSolution && !hasDetailedSolution) {
            return ''; // No detailed solution available
        }

        let solutionHtml = `
            <div class="detailed-solution-section">
                <div class="solution-header">
                    <h5>📖 Detailed Solution</h5>
                    <div class="solution-badges">
                        ${question.subject ? `<span class="subject-badge">${question.subject}</span>` : ''}
                        ${question.difficulty ? `<span class="difficulty-badge difficulty-${question.difficulty.toLowerCase()}">${question.difficulty}</span>` : ''}
                    </div>
                </div>
                <div class="solution-content">`;

        // Generate or use existing solution
        let solutionContent = question.solution;
        if (!solutionContent) {
            solutionContent = this.generateRRBSolution(question);
        }

        solutionHtml += solutionContent;

        // Add performance analysis for this question
        solutionHtml += `
                </div>
                <div class="solution-analysis">
                    <h6>📊 Performance Analysis</h6>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <span class="analysis-label">Your Response:</span>
                            <span class="analysis-value ${isCorrect ? 'correct' : (userAnswer === -1 ? 'unattempted' : 'incorrect')}">
                                ${userAnswer === -1 ? 'Not Attempted' : `Option ${String.fromCharCode(65 + userAnswer)}`}
                            </span>
                        </div>
                        <div class="analysis-item">
                            <span class="analysis-label">Correct Answer:</span>
                            <span class="analysis-value correct">Option ${String.fromCharCode(65 + question.correctAnswer)}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="analysis-label">Time Spent:</span>
                            <span class="analysis-value">${this.currentTest.questionTimeSpent ? Math.round(this.currentTest.questionTimeSpent[questionIndex] / 1000) : 0}s</span>
                        </div>
                        <div class="analysis-item">
                            <span class="analysis-label">Recommended Time:</span>
                            <span class="analysis-value">54s (RRB Standard)</span>
                        </div>
                    </div>
                </div>
                
                <div class="solution-tips">
                    <h6>💡 Tips for Similar Questions</h6>
                    ${this.generateQuestionTips(question)}
                </div>
                
                <div class="solution-actions">
                    <button class="btn btn--secondary btn--small" onclick="app.markQuestionForReview('${question.id}')">
                        📌 Mark for Review
                    </button>
                    <button class="btn btn--secondary btn--small" onclick="app.addToFavorites('${question.id}')">
                        ⭐ Add to Favorites
                    </button>
                    <button class="btn btn--secondary btn--small" onclick="app.reportQuestion('${question.id}')">
                        🚩 Report Issue
                    </button>
                </div>
            </div>`;

        return solutionHtml;
    }

    // Generate subject-specific tips for questions
    generateQuestionTips(question) {
        const subject = question.subject || 'General';
        const difficulty = question.difficulty || 'Medium';
        
        const tips = {
            'Mathematics': [
                'Read the question carefully and identify what is being asked',
                'Write down the given information and what you need to find',
                'Choose the appropriate formula or method',
                'Show your work step by step',
                'Double-check your calculations'
            ],
            'Basic Science': [
                'Focus on fundamental concepts and principles',
                'Remember key formulas and their applications',
                'Visualize the problem if it involves diagrams',
                'Use process of elimination for difficult questions',
                'Practice with previous year questions regularly'
            ],
            'General Intelligence': [
                'Look for patterns and relationships',
                'Practice different types of reasoning questions',
                'Use systematic approaches for logical problems',
                'Eliminate obviously wrong options first',
                'Manage time effectively for this section'
            ],
            'Basic Computers': [
                'Stay updated with basic computer terminology',
                'Understand fundamental concepts of hardware and software',
                'Practice questions on MS Office and basic applications',
                'Remember key shortcuts and functions',
                'Focus on practical computer knowledge'
            ],
            'General Awareness': [
                'Stay updated with current affairs',
                'Read newspapers and current affairs magazines regularly',
                'Focus on India-related geography, history, and culture',
                'Practice questions from previous years',
                'Create short notes for quick revision'
            ]
        };

        const subjectTips = tips[subject] || tips['General Awareness'];
        const selectedTips = subjectTips.slice(0, 3); // Show 3 tips

        return `
            <ul class="tips-list">
                ${selectedTips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
            <p class="tips-note">
                <em>Difficulty Level: ${difficulty} - ${this.getDifficultyAdvice(difficulty)}</em>
            </p>`;
    }

    // Get difficulty-specific advice
    getDifficultyAdvice(difficulty) {
        const advice = {
            'Easy': 'Focus on accuracy and speed. These questions should be answered quickly to save time for harder ones.',
            'Medium': 'Take your time to think through the problem. Use elimination techniques if unsure.',
            'Hard': 'Don\'t spend too much time. If stuck, mark for review and move on. Come back if time permits.'
        };
        return advice[difficulty] || advice['Medium'];
    }

    // Mark question for review
    markQuestionForReview(questionId) {
        let reviewList = JSON.parse(localStorage.getItem('reviewQuestions') || '[]');
        if (!reviewList.includes(questionId)) {
            reviewList.push(questionId);
            localStorage.setItem('reviewQuestions', JSON.stringify(reviewList));
            this.showToast('Question marked for review', 'success');
        } else {
            this.showToast('Question already in review list', 'info');
        }
    }

    // Add question to favorites
    addToFavorites(questionId) {
        let favorites = JSON.parse(localStorage.getItem('favoriteQuestions') || '[]');
        if (!favorites.includes(questionId)) {
            favorites.push(questionId);
            localStorage.setItem('favoriteQuestions', JSON.stringify(favorites));
            this.showToast('Question added to favorites', 'success');
        } else {
            this.showToast('Question already in favorites', 'info');
        }
    }

    // Report question issue
    reportQuestion(questionId) {
        const reason = prompt('Please describe the issue with this question:');
        if (reason && reason.trim()) {
            let reports = JSON.parse(localStorage.getItem('questionReports') || '[]');
            reports.push({
                questionId: questionId,
                reason: reason.trim(),
                timestamp: new Date().toISOString(),
                userId: this.currentUser?.id || 'anonymous'
            });
            localStorage.setItem('questionReports', JSON.stringify(reports));
            this.showToast('Question reported. Thank you for your feedback!', 'success');
        }
    }

    // Analytics Methods
    loadAnalytics() {
        if (this.testResults.filter(r => r.userId === this.currentUser?.id).length === 0) {
            this.showNoAnalyticsMessage();
            return;
        }
        this.renderOverviewCharts();
    }

    showNoAnalyticsMessage() {
        const analyticsContent = document.querySelector('.analytics-content');
        if (analyticsContent) {
            analyticsContent.innerHTML = `
                <div class="no-analytics">
                    <div class="no-content-icon">📊</div>
                    <h3>No Test Data Available</h3>
                    <p>Take some tests to see your performance analytics here.</p>
                    <button class="btn btn--primary" onclick="app.switchSection('testSelection')">📝 Take a Test</button>
                </div>
            `;
        }
    }

    switchAnalyticsTab(tabId) {
        // Update tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Show content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const targetContent = document.getElementById(tabId + 'Tab');
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Load charts
        setTimeout(() => {
            const userResults = this.testResults.filter(result => result.userId === this.currentUser.id);
            if (userResults.length === 0) {
                this.showNoAnalyticsMessage();
                return;
            }
            
            switch(tabId) {
                case 'overview':
                    this.renderOverviewCharts();
                    break;
                case 'subjects':
                    this.renderSubjectCharts();
                    break;
                case 'progress':
                    this.renderProgressCharts();
                    break;
                case 'time':
                    this.renderTimeCharts();
                    break;
            }
        }, 100);
    }

    renderOverviewCharts() {
        const userResults = this.testResults.filter(result => result.userId === this.currentUser.id);
        
        if (userResults.length === 0) {
            return;
        }
        
        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            if (this.charts.performance) {
                this.charts.performance.destroy();
            }
            
            this.charts.performance = new Chart(performanceCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Correct', 'Incorrect', 'Unattempted'],
                    datasets: [{
                        data: [
                            userResults.reduce((sum, r) => sum + r.correctAnswers, 0),
                            userResults.reduce((sum, r) => sum + r.incorrectAnswers, 0),
                            userResults.reduce((sum, r) => sum + r.unattempted, 0)
                        ],
                        backgroundColor: ['#27ae60', '#e74c3c', '#95a5a6'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Subject Chart
        const subjectCtx = document.getElementById('subjectChart');
        if (subjectCtx) {
            if (this.charts.subject) {
                this.charts.subject.destroy();
            }
            
            const subjects = ['Mathematics', 'General Intelligence & Reasoning', 
                            'Basic Science & Engineering', 'General Awareness', 'Computer Applications'];
            const subjectScores = subjects.map(subject => {
                const subjectResults = userResults.map(result => {
                    const subjectQuestions = result.questions.filter(q => q.subject === subject);
                    const correctCount = subjectQuestions.reduce((count, q, idx) => {
                        const globalIdx = result.questions.indexOf(q);
                        return count + (result.answers[globalIdx] === q.correctAnswer ? 1 : 0);
                    }, 0);
                    return subjectQuestions.length > 0 ? (correctCount / subjectQuestions.length) * 100 : 0;
                });
                return subjectResults.length > 0 ? 
                    subjectResults.reduce((sum, score) => sum + score, 0) / subjectResults.length : 0;
            });
            
            this.charts.subject = new Chart(subjectCtx, {
                type: 'bar',
                data: {
                    labels: subjects.map(s => s.split(' ')[0]), // Shortened labels
                    datasets: [{
                        label: 'Average Score (%)',
                        data: subjectScores,
                        backgroundColor: ['#3498db', '#e67e22', '#e74c3c', '#f39c12', '#9b59b6'],
                        borderWidth: 1,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    renderSubjectCharts() {
        const userResults = this.testResults.filter(result => result.userId === this.currentUser.id);
        
        if (userResults.length === 0) return;
        
        const radarCtx = document.getElementById('radarChart');
        if (radarCtx) {
            if (this.charts.radar) {
                this.charts.radar.destroy();
            }
            
            const subjects = ['Mathematics', 'Reasoning', 'Basic Science', 'General Awareness', 'Computer Apps'];
            const fullSubjects = ['Mathematics', 'General Intelligence & Reasoning', 
                                'Basic Science & Engineering', 'General Awareness', 'Computer Applications'];
            
            const subjectScores = fullSubjects.map(subject => {
                const subjectResults = userResults.map(result => {
                    const subjectQuestions = result.questions.filter(q => q.subject === subject);
                    const correctCount = subjectQuestions.reduce((count, q, idx) => {
                        const globalIdx = result.questions.indexOf(q);
                        return count + (result.answers[globalIdx] === q.correctAnswer ? 1 : 0);
                    }, 0);
                    return subjectQuestions.length > 0 ? (correctCount / subjectQuestions.length) * 100 : 0;
                });
                return subjectResults.length > 0 ? 
                    subjectResults.reduce((sum, score) => sum + score, 0) / subjectResults.length : 0;
            });
            
            this.charts.radar = new Chart(radarCtx, {
                type: 'radar',
                data: {
                    labels: subjects,
                    datasets: [{
                        label: 'Performance (%)',
                        data: subjectScores,
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderColor: '#3498db',
                        pointBackgroundColor: '#3498db',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    renderProgressCharts() {
        const userResults = this.testResults.filter(result => result.userId === this.currentUser.id)
                                          .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
        
        if (userResults.length === 0) return;
        
        const progressCtx = document.getElementById('progressChart');
        if (progressCtx) {
            if (this.charts.progress) {
                this.charts.progress.destroy();
            }
            
            this.charts.progress = new Chart(progressCtx, {
                type: 'line',
                data: {
                    labels: userResults.map((result, index) => `Test ${index + 1}`),
                    datasets: [{
                        label: 'Score (%)',
                        data: userResults.map(result => result.score),
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderColor: '#3498db',
                        pointBackgroundColor: '#3498db',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    renderTimeCharts() {
        const userResults = this.testResults.filter(result => result.userId === this.currentUser.id);
        
        if (userResults.length === 0) return;
        
        const timeCtx = document.getElementById('timeChart');
        if (timeCtx) {
            if (this.charts.time) {
                this.charts.time.destroy();
            }
            
            const avgTimeSpent = userResults.reduce((sum, result) => sum + result.timeSpent, 0) / userResults.length;
            const avgTimeMinutes = Math.round(avgTimeSpent / 60000);
            
            this.charts.time = new Chart(timeCtx, {
                type: 'bar',
                data: {
                    labels: ['Average Time Spent'],
                    datasets: [{
                        label: 'Minutes',
                        data: [avgTimeMinutes],
                        backgroundColor: '#3498db',
                        borderWidth: 1,
                        borderColor: '#2980b9'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + ' min';
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    // Utility Methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log('Showing modal:', modalId);
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
            
            // Focus first input if available
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log('Hiding modal:', modalId);
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Data Persistence Methods
    saveUsers() {
        try {
            localStorage.setItem('mockTestUsers', JSON.stringify(this.users));
            console.log('Users saved successfully');
        } catch (error) {
            console.error('Error saving users:', error);
            alert('Error saving user data. Please try again.');
        }
    }

    saveQuestions() {
        try {
            localStorage.setItem('mockTestQuestions', JSON.stringify(this.questions));
            console.log('Questions saved successfully');
        } catch (error) {
            console.error('Error saving questions:', error);
            alert('Error saving questions. Please try again.');
        }
    }

    saveTestResults() {
        try {
            localStorage.setItem('mockTestResults', JSON.stringify(this.testResults));
            console.log('Test results saved successfully');
        } catch (error) {
            console.error('Error saving test results:', error);
            alert('Error saving test results. Please try again.');
        }
    }

    savePDFs() {
        try {
            // Note: In a real application, you'd want to store PDFs on a server
            // For this demo, we'll store basic info locally (without the large data for localStorage size limits)
            const pdfMetadata = this.uploadedPDFs.map(pdf => ({
                ...pdf,
                data: pdf.data ? '[PDF_DATA_STORED]' : null // Placeholder for actual PDF data
            }));
            localStorage.setItem('uploadedPDFs', JSON.stringify(pdfMetadata));
            console.log('PDF metadata saved successfully');
        } catch (error) {
            console.error('Error saving PDF metadata:', error);
            // Don't show alert for PDF save errors as the questions are still saved
        }
    }

    // Cleanup method
    cleanup() {
        // Clear any running timers
        if (this.testSession?.timer) {
            clearInterval(this.testSession.timer);
        }
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        console.log('App cleanup completed');
    }
}

// Initialize the application when the script loads
const app = new MockTestApp();

// Cleanup when page is unloaded
window.addEventListener('beforeunload', () => {
    if (app && typeof app.cleanup === 'function') {
        app.cleanup();
    }
});

// Handle errors gracefully
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    // You could show a user-friendly error message here
});

// Export for debugging (optional)
if (typeof window !== 'undefined') {
    window.mockTestApp = app;
}

console.log('🎯 RRB Mock Test App loaded successfully! - Version 2.0');
                
                
