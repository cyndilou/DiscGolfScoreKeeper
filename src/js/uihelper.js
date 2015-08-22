$(document).ready(function() {
    $('.nav a').on('click', function(){
        if ($("#navbarButton").attr("aria-expanded") == "true") {
            $("#navbarButton").click()
        }
    });
});