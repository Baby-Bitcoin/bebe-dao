export const formatDate = (date) => {
    var currentDate = new Date(date);
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    return (day < 10 ? "0" + day : day) + "." + (month < 10 ? "0" + month : month) + "." + year;
}