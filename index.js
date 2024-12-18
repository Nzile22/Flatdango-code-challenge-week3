// Endpoint
const url = "http://localhost:3000/films";

// Variables
const filmList = document.getElementById('films');
const poster = document.getElementById('poster');
const title = document.getElementById('title');
const runtime = document.getElementById('runtime');
const description = document.getElementById('description');
const showtime = document.getElementById('showtime');
const ticketNum = document.getElementById('ticket-num');
const buyButton = document.querySelector('.film-btn');

// Fetch films from the API
async function fetchFilms() {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch films.");
        const films = await res.json();

        if (films.length === 0) {
            displayNoFilms();
            return;
        }

        displayFilmList(films);
        displayFilmDetails(films[0]); // Display the first film by default
    } catch (error) {
        console.error("Error loading films:", error);
        filmList.innerHTML = '<p class="error">Error loading films. Please try again later.</p>';
    }
}

// Display a message when no films are available
function displayNoFilms() {
    filmList.innerHTML = '<p>No films available at the moment.</p>';
    poster.src = '';
    title.textContent = 'No Film Selected';
    runtime.textContent = '';
    description.textContent = '';
    showtime.textContent = '';
    ticketNum.textContent = '';
    buyButton.disabled = true;
}

// Display the list of films
function displayFilmList(films) {
    filmList.innerHTML = ''; // Clear existing content

    films.forEach(film => {
        const filmItem = document.createElement('div');
        filmItem.className = 'film-item';
        filmItem.textContent = film.title;
        filmItem.setAttribute('data-id', film.id);

        // Add a delete button to each film
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            await deleteFilm(film.id);
        });

        // Highlight active film on click
        filmItem.addEventListener('click', () => {
            document.querySelectorAll('.film-item').forEach(item => item.classList.remove('active'));
            filmItem.classList.add('active');
            displayFilmDetails(film);
        });

        filmItem.appendChild(deleteButton);
        filmList.appendChild(filmItem);
    });

    // Set the first film as active by default
    const firstFilmItem = filmList.querySelector('.film-item');
    if (firstFilmItem) firstFilmItem.classList.add('active');
}

// Display details for a selected film
function displayFilmDetails(film) {
    poster.src = film.poster || 'placeholder.jpg'; // Fallback if poster is missing
    title.textContent = film.title || 'Unknown Title';
    runtime.textContent = `${film.runtime || 'N/A'} minutes`;
    description.textContent = film.description || 'No description available.';
    showtime.textContent = film.showtime || 'N/A';
    ticketNum.textContent = film.capacity - film.tickets_sold || 0;

    // Enable/disable the Buy Ticket button
    buyButton.disabled = film.capacity - film.tickets_sold <= 0;

    // Clear previous event listeners
    buyButton.replaceWith(buyButton.cloneNode(true));
    const newButton = document.querySelector('.film-btn');

    // Attach event listener for buying tickets
    newButton.addEventListener('click', (e) => handleBuyTicket(film, e));
}

// Handle the "Buy Ticket" button
async function handleBuyTicket(film, event) {
    event.preventDefault();

    const ticketsLeft = film.capacity - film.tickets_sold;
    if (ticketsLeft > 0) {
        try {
            film.tickets_sold++;
            await updateFilmData(film);

            // Update UI
            ticketNum.textContent = film.capacity - film.tickets_sold;
            if (film.capacity - film.tickets_sold <= 0) {
                buyButton.disabled = true;
                alert('Tickets are sold out!');
            } else {
                alert('Ticket bought successfully!');
            }
        } catch (error) {
            console.error('Error updating film data:', error);
            alert('Failed to update ticket data. Please try again.');
        }
    } else {
        alert('No tickets left to buy.');
    }
}

// Update film data on the server
async function updateFilmData(film) {
    try {
        const res = await fetch(`${url}/${film.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tickets_sold: film.tickets_sold }),
        });

        if (!res.ok) throw new Error('Failed to update film data');
    } catch (error) {
        console.error('Error updating film data:', error);
        throw error;
    }
}

// Delete a film from the server
async function deleteFilm(filmId) {
    const confirmDelete = confirm('Are you sure you want to delete this film?');
    if (confirmDelete) {
        try {
            const res = await fetch(`${url}/${filmId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete film');
            alert('Film deleted successfully!');
            fetchFilms(); // Reload films
        } catch (error) {
            console.error('Error deleting film:', error);
            alert('Failed to delete the film. Please try again.');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', fetchFilms);
