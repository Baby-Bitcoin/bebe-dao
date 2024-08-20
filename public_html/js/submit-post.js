import { $, $$ } from '/js/selectors.js'
import { url, user } from '/js/solana.js'
import { membership, accountStatus, minBalance } from '/js/solana.js'
import { imageValid } from '/js/image-select.js'
import { checkFileProperties, handleUploadedFile } from '/js/image-select.js'
let postType
let pollOptions = []
let imageSelected = false

export const submitPost = () => {

    $('#post-form').addEventListener('submit', (event) => {
        event.preventDefault()
        if (membership === true) {

            // get the number of options added and push 0 for each of them to the votes array
            let votes = []
            const voteInputsNr = $$('.voteInput').length
            for (let i = 0; i < voteInputsNr; i++) {
                votes.push(0)
            }

            const formData = new FormData()

            formData.append("user", user)
            formData.append("title", $("#title").value)
            formData.append("duration", $("#duration").value)

            imageSelected && imageValid ? formData.append("image", $("#image").files[0]) : null;
            formData.append("description", $("#description").value)

            $$('.voteInput').forEach((option) =>
                formData.append("options[]", option.value)
            )

            let tags = $('#tags-input').value

            let punctuationless = tags.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trimStart().trimEnd()
            let finalTagsString = punctuationless.replace(/\s{2,}/g, " ")

            formData.append("tags", finalTagsString)
            formData.append("type", $('input[name="type"]:checked').value);
            (votes || []).forEach((option) =>
                formData.append("votes[]", parseInt(option))
            )

            // Sends post request to /post with all input information
            fetch(url + 'post', {
                method: "POST",
                body: formData
            }).then(response => {
                return response.json()
            }).then(returnedData => {
                console.log(returnedData)
                if (returnedData.status === 200) {
                    $('#post-form-container').style.display = 'none'
                    $('body').style.overflow = ''
                    $('.shortMessage').innerHTML = '<div class="quickText"><h2 style="color: green">POST SENT</h2></div>'

                    // const posts = $('#posts')
                    // posts.style = 'display: block !important'
                    // const newPostUrl = url + '?id='
                    // posts.innerHTML = `<h3 style="color: green">POST SENT</h2><br><br><a href="${}" style="text-decoration: none"><img src="/img/bebe-logo-transparent.png" class="small-icon"> <b>${$("#title").value}<b></a>`
                }
            })
        } else {
            let message = 'Only members can submit a post.\nAccount Membership Status:\n\n'
            if (accountStatus.balance >= minBalance) {
                message += `Hold ${minBalance} BEBE in the account: OK\n`
            } else { message += `Hold ${minBalance} BEBE in the account: NO\n` }

            if (accountStatus.kyc === true) {
                message += 'Pass the KYC process: OK'
            } else { message += 'Pass the KYC process: NO' }

            alert(message)
        }
    })


    $('#post-form').addEventListener('change', (event) => {
        postType = $('input[name="type"]:checked').value
        pollOptions = []
        $$('.voteInput').forEach((el, i) => {
            pollOptions.push(el.value)
        })

        const election = $('input[name="type"]:checked').value === 'election'

        if ($('input[name="type"]:checked').value === 'poll' || $('input[name="type"]:checked').value === 'election') {
            $('.options').style = ''
            $('#add-remove-inputs').style = 'display: block'
            $$('.voteInput').forEach((el, i) => {
                el.required = true
                election ? el.placeholder = 'Candidate' : el.placeholder = 'Option'
            })
        } else {
            $('.options').style = 'display: none'
            $('#add-remove-inputs').style = ''
            $$('.voteInput').forEach((el, i) => {
                el.required = false
            })
        }


        // check file selected
        let theFile
        if (event.target.files) {
            theFile = event.target.files[0]
            $('#error').classList.add('error')
            if (checkFileProperties(theFile)) {
                handleUploadedFile(theFile)
                imageSelected = true
            }
        }

    })
    $('#image').addEventListener('click', (event) => {
        $('#error').innerHTML = ''
        $('#error').classList.remove('error')
    })
}