let knownCategories;

async function loadCategories() {
    const response = await fetch('./categories.json');
    knownCategories = await response.json();
}

// Function to Match Categories
function matchCategory(providedCategories) {
    if (!knownCategories) return "default";

    const categoriesArray = providedCategories.split(", ").map(cat => cat.toLowerCase());

    let matchedCategory = "default";
    let maxMatches = 0;

    // Iterate over known categories to find matches
    for (const [category, keywords] of Object.entries(knownCategories)) {
        let matches = 0;

        // Count keyword matches in provided categories
        keywords.forEach(keyword => {
            if (categoriesArray.includes(keyword.toLowerCase())) {
                matches++;
            }
        });

        // Update matched category if more matches are found
        if (matches > maxMatches) {
            maxMatches = matches;
            matchedCategory = category;
        }
    }

    return matchedCategory;
}

export { loadCategories, matchCategory };