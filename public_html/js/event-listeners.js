import { $, $$ } from '/js/selectors.js';

export const addBTN = () => {
    $('#add').addEventListener('click', (event) => {
        $('#post-form-container').style.display = 'flex';
        $('post-form-container #close').style.display = 'block';
        $('body').style.overflow = 'hidden';
    });
}

export const closeBTN = () => {
    $('#close-form').addEventListener('click', (event) => {
        $('#post-form-container').style.display = 'none';
        $('body').style.overflow = '';
    });
    document.addEventListener('keydown', evt => {
        if (evt.key === 'Escape') {
            $('.form-container').style.display = 'none';
            $('body').style.overflow = '';
        }
    });
}

export const addOption = () => {
    $('#add_option').addEventListener('click', (event) => {
        event.preventDefault();
        let placeholder
        $('input[name="type"]:checked').value === 'poll' ? placeholder = 'Option' : placeholder = 'Candidate'
        if ($$('.voteInput').length < 23) {

            // Create the new input element
            const newInputElement = document.createElement('input');

            // Set the attributes for the new input element
            newInputElement.setAttribute('class', 'voteInput');
            newInputElement.setAttribute('type', 'text');
            newInputElement.setAttribute('maxlength', '96');
            newInputElement.setAttribute('placeholder', placeholder)
            newInputElement.required = true;

            $('.options').appendChild(newInputElement);
            $('#remove_option').style = 'display: inline-block !important';

            $$('.voteInput').forEach((el) => {
                el.setAttribute('placeholder', placeholder)
            })
        } else { alert('Maximum number of options is 23.') }
    });
}

export const removeOption = () => {
    $('#remove_option').addEventListener('click', (event) => {
        event.preventDefault();
        if ($$('.voteInput').length === 3) {
            $('.voteInput:last-of-type').remove();
            event.target.style = 'display: none !important';
        }
        if ($$('.voteInput').length > 2) {
            $('.voteInput:last-of-type').remove();
        }
    });
}