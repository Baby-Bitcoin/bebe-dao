import { $ } from '/js/selectors.js'
import { submitPost } from '/js/submit-post.js';
import { search } from '/js/search.js';
import { postActions } from '/js/post-actions.js';
import { addBTN, closeBTN, addOption, removeOption } from '/js/event-listeners.js';
addBTN(); closeBTN(); addOption(); removeOption();

search(); // search method
submitPost(); // listener for submit event

// page load - populate all posts
// Boolean arguments are to call or not call functions inside postActions() - names of sub-functions below:
// queryURL, clearItems, fetchy, looper, populatePosts, charts, voteBTNlisteners, deleteBTNs, removeLastItem
const urlString = window.location.search;
const urlSearch = new URLSearchParams(urlString);

let queryURL = {}


if (urlSearch.get('title') && urlSearch.get('id')) {
    queryURL.type = 'title';
    queryURL.id = urlSearch.get('id');
    queryURL.string = urlSearch.get('title');
    // generate post page
    postActions(queryURL, true, true, true, true, true, true, true, false);
}
else if (urlSearch.get('tag') !== null) {
    queryURL.type = 'tag';
    queryURL.string = urlSearch.get('tag');
    // generate post page
    postActions(queryURL, true, true, true, true, true, true, true, false);
}

else {
    // generate index page
    postActions('', true, true, true, true, false, false, false, false);
}

$('#bugs').addEventListener('click', (event) => {
    alert('Send bugs or feedback at:')
})

$('#select-type select').addEventListener('change', (e) => {
    localStorage.setItem('filter', $('#select-type select').value)
    location.reload()
})