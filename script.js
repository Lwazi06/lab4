const countryInfo = document.getElementById("country-info");
const borderingCountries = document.getElementById("bordering-countries");
const spinner = document.getElementById("loading-spinner");
const errorMessage = document.getElementById("error-message");

// Hide spinner and error on load
spinner.classList.add("hidden");
errorMessage.classList.add("hidden");

async function searchCountry(countryName) {
    // Clear previous content
    countryInfo.innerHTML = "";
    borderingCountries.innerHTML = "";
    errorMessage.classList.add("hidden");
    spinner.classList.remove("hidden");

    try {
        countryName = countryName.trim().toLowerCase();

        if (!countryName) {
            spinner.classList.add("hidden");
            alert('Please enter country name');
            return;
        }
        
        // Fetch country data
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);

        if (!response.ok) {
            throw new Error('Country not found');
        }

        const data = await response.json();
        
        // Filter out dependent territories and find exact match
        const sovereignCountries = data.filter(c => !c.independent || c.independent === true);
        
        // Check for exact match (case-insensitive)
        const country = sovereignCountries.find(c => 
            c.name.common.toLowerCase() === countryName || 
            c.name.official.toLowerCase() === countryName
        );
        
        if (!country) {
            throw new Error('Country not found');
        }

        // Display country info
        countryInfo.innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <img src="${country.flags.svg}" alt="${country.name.common} flag" style="width: 200px;">
        `;

        // Display bordering countries
        if (country.borders && country.borders.length > 0) {
            borderingCountries.innerHTML = "<h3>Bordering Countries:</h3>";
            
            for (const borderCode of country.borders) {
                const borderResponse = await fetch(`https://restcountries.com/v3.1/alpha/${borderCode}`);
                const borderData = await borderResponse.json();
                const borderCountry = borderData[0];
                
                const borderCard = document.createElement("div");
                borderCard.className = "country-card";
                borderCard.innerHTML = `
                    <p>${borderCountry.name.common}</p>
                    <img src="${borderCountry.flags.svg}" alt="${borderCountry.name.common} flag" style="width: 100px;">
                `;
                borderingCountries.appendChild(borderCard);
            }
        } else {
            borderingCountries.innerHTML = "<p>No bordering countries</p>";
        }

    } catch (error) {
        // Show error message
        errorMessage.textContent = error.message || "An error occurred";
        errorMessage.classList.remove("hidden");
    } finally {
        // Hide loading spinner
        spinner.classList.add("hidden");
    }
}

// Event listeners
document.getElementById('search-btn').addEventListener('click', () => {
    const country = document.getElementById("country-input").value;
    searchCountry(country);
});

// Allow pressing Enter key to search
document.getElementById("country-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const country = document.getElementById("country-input").value;
        searchCountry(country);
    }
});
