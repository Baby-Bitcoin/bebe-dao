import { $, $$ } from '/js/selectors.js';

let imageValidation = '';
export let imageValid = false;

export const checkFileProperties = (theFile, formID) => {
    if (
        theFile &&
        (theFile.type !== "image/png" && theFile.type !== "image/jpeg" && theFile.type !== "image/jpg" && theFile.type !== "image/gif" && theFile.type !== "image/webp" && theFile.type !== "image/svg")
    ) {
        imageValidation = '<b>Error:</b> Only - PNG, JPG, JPEG, GIF, WEBP and SVG file types are accepted.';
        $('.form_error').innerHTML = imageValidation;
        $("#" + formID + " .image-label").innerHTML = "";
        $('#post-image').value = "";
        return false;
    } else { imageValid = true; }

    if (theFile) {
        if (theFile.size > 2355200) {
            imageValidation = '<b>Error:</b> ' + (theFile.size / 1024).toFixed(2) + ' KB - File size is too big. Max file size is: 500 KB';
            $('.form_error').innerHTML = imageValidation;
            //$("#post-form .image-label").innerHTML = "";
            $('#post-image').value = "";
            return false;
        } else { imageValid = true; }
    }

    return true;
}

export const handleUploadedFile = (theFile, formID) => {
    $(".form_error").innerHTML = "";
    $("#" + formID + " .image-label").innerHTML = "";
    var img = document.createElement("img");
    img.setAttribute("id", formID + "-image-tag");
    img.file = theFile;
    $("#" + formID + " .image-label").appendChild(img);

    var reader = new FileReader();
    reader.onload = (function (aImg) {
        return function (e) {
            if (theFile) {
                aImg.src = e.target.result;
                $("#" + formID).add;
            } else {
                $("#" + formID + " .image-label").innerHTML = "";
                $('#post-image').value = "";
            }
        };
    })(img);
    reader.readAsDataURL(theFile);
}