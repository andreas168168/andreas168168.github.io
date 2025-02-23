import { matchCategory } from './category_matcher.js';

// Load CO2 Emission Data
const co2Emissions = {
    "meat": 27.0,
    "butter": 23.8,
    "milk": 3.2,
    "vegetables": 2.0,
    "fruits": 1.8,
    "grains": 1.5,
    "default": 5.0
};

const maxEmission = Math.max(...Object.values(co2Emissions));
const minEmission = Math.min(...Object.values(co2Emissions));

// Define countries and their scores
const countryScores = {
    "+1": ["Italy", "Country2"],
    "+2": ["a", "Morocco"],
    "+3": ["Sweden", "Country6"]
};

// Function to Calculate Eco-Impact Score
function calculateEcoImpact(product) {
    console.log("Product Data:", product); // Debugging

    const { categories, packaging, origins, manufacturingPlace, ecoScoreGrade } = product;

    // Match the most relevant category
    const category = matchCategory(categories);

    // Get CO2 Emissions per Kilo
    const co2Emission = co2Emissions[category.toLowerCase()] || co2Emissions["default"];

    // Normalize CO2 emissions to a score between 1 and 7
    const co2Score = ((co2Emission - minEmission) / (maxEmission - minEmission)) * 6 + 1;

    // Determine country of production (fallback to manufacturingPlace if origins is missing)
    const country = origins || manufacturingPlace || "Unknown";

    console.log("Checking country:", country); // Debugging

    // Calculate the origin score
    let originScore = 0;
    for (const [score, countries] of Object.entries(countryScores)) {
        console.log(`Checking if ${country} is in`, countries); // Debugging
        if (countries.includes(country)) {
            originScore = parseInt(score.substring(1));
            break;
        }
    }

    // Calculate Total Eco-Impact Score
    const totalScore = co2Score + originScore;

    return totalScore;
}


export { calculateEcoImpact };