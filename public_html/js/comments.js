import { $, $$ } from '/js/selectors.js'
import { url, user, login } from '/js/solana.js';
import { countdown } from '/js/countdown.js'

let closed
export const commentTemplate = (data) => {

    const counter = new countdown
    closed = counter.count(data.id, data.expires, false)

    // COMMENTS
    let commentTemplate = ''

    if (data.comments) {
        data.comments.forEach((item, index) => {
            let replies = ''

            if (item.replies.length > 0) {
                item.replies.forEach((el, i) => {
                    replies += `
                    <reply id="${'post-' + data.id + '-reply-' + el.id}">
                        <header class="flex-center">
                            <avatar><img src="/avatars/${el.user}.webp"></avatar>
                            <h3>${el.user}</h3>
                        </header>
                        <p>${el.text}</p>
                    </reply>`
                })
                replies = '<replies>' + replies + '</replies>'
            } else { replies = '' }

            commentTemplate += `
            <comment id="${'comment-' + item.id}">
                <header class="flex-center">
                    <avatar><img src="/avatars/${item.user}.webp"></avatar>
                    <h3>${item.user}</h3>
                </header>
                <p>${item.text}</p>
                ${replies}
            </comment>`
        })

        return commentTemplate
    }

}

export const commentEvents = (postID) => {
    // reply form
    const replyComment = $('.reply-comment')

    const replyAnimation = `
                        <div class="typing">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        `
    const replyForm = id => {
        return `<form id="reply-to-comment-${id}" class="reply-comment">
            <textarea minlength="2" maxlength="1000" required></textarea>
            <input type="submit" value="Reply" />
        </form>
        `
    }

    let commentData = {}


    // post comment
    const postComment = (data) => {
        if (!user) {
            login(false)
        } else {
            commentData.user = user

            fetch(url + 'comment', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commentData)
            }).then(response => {
                return response.json()
            }).then(returnedData => {
                console.log(returnedData)
                window.location.reload()
            }).catch(function (error) {
                console.log(error)
                ///if status code 401...
            });
        }
    }

    let lastCommentID = 0

    $('.main-comment-form').addEventListener("submit", (e) => {
        e.preventDefault()
        if (closed === 'Closed') {
            commentData.postid = postID
            commentData.commentid = parseInt(lastCommentID)
            commentData.type = 'comment'
            commentData.comment = e.currentTarget.querySelector('textarea').value
            postComment(commentData)
        } else { alert('Comments are only available when the voting period expires.') }
    })

    $$('comment').forEach((item, index) => {
        const id = item.id.replace(/\D/g, '');
        lastCommentID = id
        item.addEventListener("click", (event) => {
            if (!$('.reply-comment')) {
                item.innerHTML += replyForm(id)
            } else {
                if (!event.currentTarget.querySelector('.reply-comment')) {
                    $('.reply-comment').remove()
                    item.innerHTML += replyForm(id)
                }
            }
        })
        item.addEventListener("submit", (e) => {
            e.preventDefault()
            commentData.postid = postID
            commentData.commentid = parseInt(id)
            commentData.type = 'reply'
            commentData.comment = $('.reply-comment textarea').value
            postComment(commentData)
        })
    })
}