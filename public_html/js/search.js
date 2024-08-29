import { $, $$ } from '/js/selectors.js';
import { postActions } from '/js/post-actions.js';

export const search = () => {
    $('#search').addEventListener('submit', (event) => {
        event.preventDefault();
        let queryURL = {}
        queryURL.type = 'search';
        queryURL.string = $('#search input[type=text]').value;
        $('body').classList.remove('postPage')
        // Boolean arguments are to call or not call functions inside postActions() - names of sub-functions below:
        // queryURL, clearItems, fetchy, looper, populatePosts, charts, voteBTNlisteners, deleteBTNs, removeLastItem
        postActions(queryURL, true, true, true, true, false, false, false, false);
        $('.welcome-info').style.display = 'none'
    });
}