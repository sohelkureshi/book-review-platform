function handler(id) {
    document.querySelector(".review-text").style.display = "none";
    document.getElementById("review" + id).setAttribute("hidden", true)
    document.getElementById("text" + id).removeAttribute("hidden")
    document.getElementById("isbn" + id).removeAttribute("hidden")
    document.getElementById("genre" + id).removeAttribute("hidden")
    document.getElementById("title" + id).removeAttribute("hidden")
    document.getElementById("author" + id).removeAttribute("hidden")
    document.getElementById("rating" + id).removeAttribute("hidden")
    document.querySelectorAll("label").forEach(function (label) {
        label.removeAttribute("hidden");
    });
    document.getElementById("button" + id).removeAttribute("hidden")
    document.querySelector("#fieldset").removeAttribute("hidden");
}

document.addEventListener("DOMContentLoaded", function () {
    // Select all rating containers
    const ratingContainers = document.querySelectorAll('.rating');

    ratingContainers.forEach(function (container) {
        const rating = parseInt(container.getAttribute('data-rating'), 10); // Get the rating from data-rating attribute
        const stars = container.querySelectorAll('.star'); // Get all stars within the container

        // Loop through the stars and color them based on the rating
        for (let i = 0; i < rating; i++) {
            stars[i].style.color = '#d15813';
        }
    });
});

function submitForm() {
    const genreSelect = document.getElementById("genre-select");
    const sortSelect = document.getElementById("sort-select");
    // Submit the form when the selection changes
    if (sortSelect.value) {
        document.getElementById("sort-form").submit();
    }

    if (genreSelect.value) {
        document.getElementById("genre-form").submit();
    }
}

function searchCheck(event) {
    const searchValue = document.getElementById("search-input").value.trim();

    if (searchValue === "") {
        document.getElementById("search-input").style.border="2px solid red"
        event.preventDefault();  // Prevent the form from submitting
        return false;
    }
    return true
}

// Wait for the DOM to fully load before adding event listeners
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("search-form");

    // Add the submit event listener to the form
    form.addEventListener("submit", function (event) {
        return searchCheck(event); // Pass the event to the searchCheck function
    });
});