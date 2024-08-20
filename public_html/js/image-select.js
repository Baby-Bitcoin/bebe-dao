import { $, $$ } from '/js/selectors.js';

let imageValidation = '';
export let imageValid = false;

export const checkFileProperties = (theFile) => {
    if (
        theFile &&
        (theFile.type !== "image/png" && theFile.type !== "image/jpeg" && theFile.type !== "image/jpg" && theFile.type !== "image/gif" && theFile.type !== "image/webp" && theFile.type !== "image/svg")
    ) {
        imageValidation = '<b>Error:</b> Only - PNG, JPG, JPEG, GIF, WEBP and SVG file types are accepted.';
        $('#error').innerHTML = imageValidation;
        $("#image-label").innerHTML = "";
        $('#image').value = "";
        return false;
    } else { imageValid = true; }

    if (theFile) {
        if (theFile.size > 2355200) {
            imageValidation = '<b>Error:</b> ' + (theFile.size / 1024).toFixed(2) + ' KB - File size is too big. Max file size is: 500 KB';
            $('#error').innerHTML = imageValidation;
            //$("#image-label").innerHTML = "";
            $('#image').value = "";
            return false;
        } else { imageValid = true; }
    }

    return true;
}

export const handleUploadedFile = (theFile) => {
    $("#error").innerHTML = "";
    $("#image-label").innerHTML = "";
    var img = document.createElement("img");
    img.setAttribute("id", "theImageTag");
    img.file = theFile;
    $("#image-label").appendChild(img);

    var reader = new FileReader();
    reader.onload = (function (aImg) {
        return function (e) {
            if (theFile) {
                aImg.src = e.target.result;
                $("#post-form").add;
            } else {
                $("#image-label").innerHTML = "";
                $('#image').value = "";
            }
        };
    })(img);
    reader.readAsDataURL(theFile);
}