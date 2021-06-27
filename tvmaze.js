/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */

async function searchShows(query) {
  // TODO: Make an ajax request to the searchShows api.  Remove
  // hard coded data.
  let response = await axios.get('http://api.tvmaze.com/search/shows', {params: {q: query}}) // get shows from API
  
  let shows = response.data.map(result => { // format the requested show data to get only what we need
    let show = result.show
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : 'https://tinyurl.com/tv-missing'
    }
  })
  return shows
}

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty(); // clear out shows list before populating

  for (let show of shows) { // add each show card
    let $item = $( // html for show card. Include id data for later use and a button to get episodes
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
         <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-primary get-episodes">Episodes</button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($item); // append html to the showsList div
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});


// Getting and returning episodes

async function getEpisodes(id) {
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`)

  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }))

  return episodes;
}

function populateEpisodes(episodes) {
  const $episodesList = $('#episodes-list')
  $episodesList.empty()

  for (let episode of episodes) {
    let $newLI = $(`<li>${episode.name} (season ${episode.season}, episode ${episode.number})</li>`);
    $episodesList.append($newLI)
  }
  $('#episodes-area').show()
}

// event listener for the Episodes button
$('#shows-list').on('click', '.get-episodes', async function handleEpisodeClick(e) {
  let showID = $(e.target).closest('.Show').data('show-id') // specify the show ID of the clicked event
  let episodes = await getEpisodes(showID) // get episodes of the show ID using the getEpisodes function
  populateEpisodes(episodes); // add the episodes to the DOM
})