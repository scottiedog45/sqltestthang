const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

function getDataFromApi(searchTerm, callback) {
	const query = {
		/*Authorization: Bearer oauth2-token*/
		part:'snippet',
		q: `${searchTerm} in:name`,
		per_page: 7,
		/*access_token: ?access_token= oauth2-token*/
		key:'AIzaSyDpf_xxsitiyjIiD7CSZ31WYgQ1T4iqzg'
	}
	$.getJSON(YOUTUBE_SEARCH_URL, query, callback);
}

function renderResut(result) {
	return `
		<div>
			<h2>
			<a class="js-result-name" href ="${result.html_url}" target="_blank">${result.name}</a>
			</h2>
		</div>
		`;
}

function displayYoutubeSearchData(data) {
	const results = YouTube.Search.list('id,snippet', {q: `${searchTerm}`, per_page: 7});
	$('.js-search-results').html(results);
}

function watchSubmit() {
	$('.js-search-form').submit(event => {
		event.preventDefault();
		const queryTarget = $(event.currentTarget).find('js.query');
		const query = queryTarget.val();
		queryTarget.val(" ");
		getDataFromApi(query, displayYoutubeSearchData);
	});
}

$(watchSubmit);
