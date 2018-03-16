require('../lib/DatePicker');

window.EXAMPLE = document.querySelector('date-picker');

EXAMPLE.addEventListener('change', function(e) {
    const {
        target,
        detail
    } = e;

    console.log(`date changed to ${target.value} (${detail})`);
})