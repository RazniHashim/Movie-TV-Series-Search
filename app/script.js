const searchForm = document.querySelector('.search-box input');
const searchButton = document.querySelector('#search-button');
const suggestionsList = document.querySelector('.suggestions');
const movieDetailsContainer = document.querySelector('.movie-details-container');

let selectedMovie = '';

const apiKey = 'xxxxxx';

searchForm.addEventListener('input', () => {
  const searchTerm = searchForm.value;
  if (searchTerm.length === 0) {
    suggestionsList.innerHTML = '';
  } else {
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}*`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.Response === 'True') {
          const movies = data.Search.map(movie => ({
            title: movie.Title,
            year: movie.Year,
            imdbID: movie.imdbID // Add IMDb ID to the movie object
          }));
          const promises = movies.map(movie => 
            fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`)
            .then(response => response.json())
          );
          Promise.all(promises).then((results) => {
            results.forEach((result, index) => {
              movies[index].language = result.Language;
            });
            const regex = new RegExp(`^${searchTerm}`, 'gi');
            const filteredMovies = movies.filter(movie => movie.title.match(regex));
            suggestionsList.innerHTML = filteredMovies
              .map(movie => `<li data-imdbid="${movie.imdbID}">${movie.title} (${movie.year}) - ${movie.language}</li>`) // Add data-imdbid attribute to each suggestion item
              .join('');
          });
        } else {
          suggestionsList.innerHTML = `<li>No results found</li>`;
        }
      })
      .catch(error => console.log(error));
  }
      });

      searchForm.addEventListener('focusout', () => {
  setTimeout(() => {
    suggestionsList.innerHTML = '';
  }, 300);
      });

      suggestionsList.addEventListener('click', event => {
  const clickedElement = event.target;
  if (clickedElement.tagName === 'LI') {
    selectedMovie = clickedElement.innerText.split(' (')[0];
    const imdbID = clickedElement.dataset.imdbid; // Retrieve IMDb ID from data-imdbid attribute
    searchForm.value = selectedMovie;
    suggestionsList.innerHTML = '';
    selectedMovie = imdbID; // Update selectedMovie with IMDb ID
  }
      });

      searchForm.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchButton.click();
  }
      });

      searchButton.addEventListener('click', () => {
  if (selectedMovie) {
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${selectedMovie}`; // Use IMDb ID instead of title in the URL
    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Display all movie details here
        const imdbID = data.imdbID;
        const movieTitle = data.Title;
        const moviePoster = data.Poster;

        const detailsUrl = `http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}&plot=full&tomatoes=true`;
        fetch(detailsUrl)
          .then(response => response.json())
          .then(data => {
            const movieDetailsHtml = `
              <div class="movie-details-wrapper">
                <h2>${movieTitle}</h2>
                <img src="${moviePoster}">
                <table>
                <tr><th>Year:</th> <td>${data.Year}</td></tr>
                <tr><th>Rated:</th> <td>${data.Rated}</td></tr>
                <tr><th>Released:</th> <td> ${data.Released}</td></tr>
                <tr><th>Runtime:</th> <td>${data.Runtime}</td></tr>
                <tr><th>Genre:</th> <td>${data.Genre}</td></tr>
                <tr><th>Director:</th> <td>${data.Director}</td></tr>
                <tr><th>Writer:</th> <td>${data.Writer}</td></tr>
                <tr><th>Actors:</th> <td>${data.Actors}</td></tr>
                <tr><th>Plot:</th> <td>${data.Plot}</td></tr>
                <tr><th>Language:</th> <td>${data.Language}</td></tr>
                <tr><th>Country:</th> <td>${data.Country}</td></tr>
                <tr><th>Awards:</th> <td>${data.Awards}</td></tr>
                <tr><th>IMDb Rating:</th> <td>${data.imdbRating}</td></tr>
                <tr><th>IMDb Votes:</th> <td>${data.imdbVotes}</td></tr>
                <tr><th>Type:</th> <td>${data.Type}</td></tr>
                <tr><th>DVD:</th> <td>${data.DVD}</td></tr>
                <tr><th>BoxOffice:</th> <td>${data.BoxOffice}</td></tr>
                </table>
              </div>
            `;
            movieDetailsContainer.innerHTML = movieDetailsHtml;
          })
          .catch(error => {
            console.error('Error fetching movie details:', error);
          });
      })
      .catch(error => {
        console.error('Error fetching movie data:', error);
      });
  }
      });