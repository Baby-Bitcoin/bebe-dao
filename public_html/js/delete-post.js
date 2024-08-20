import { $, $$ } from '/js/selectors.js'
import { url, user } from '/js/solana.js'

export const deletePost = (id, user) => {
    // Fetches all data from posts.json
    const promptString = prompt('Are you sure you want to delete this post?', 'YES')
    if (promptString != null && promptString === 'YES') {
        //const correctPost = fetchedPosts.find(post => post.title === postTitle)
        let deleteID = JSON.stringify({ "id": id, "user": user })
        fetch(url + 'delete', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: deleteID
        })
            .then(response => {
                return response.json()
            })
            .then(data => {
                if (data.status === 200) {
                    const posts = $('#posts')
                    posts.style = 'display: block !important'
                    posts.innerHTML = '<h3 style="color: red">POST DELETED</h2><br><br><a href="/" style="text-decoration: none"><img src="/img/bebe-logo-transparent.png" class="small-icon"> <b>Homepage<b></a>'
                    $('.shortMessage').innerHTML = '<div class="quickText"><h2 style="color: red">POST DELETED</h2></div>'
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
}