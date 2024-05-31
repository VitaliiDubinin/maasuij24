$(document).ready(function () {
  var section = $('li.section');

  function toggleAccordion() {
    var clickedSection = $(this);

    // Check if the clicked section is already active
    if (!clickedSection.hasClass('active')) {
      // Close all sections to the predefined size except the clicked one
      section.removeClass('active');
      clickedSection.addClass('active');
    } else {
      // If clicked section is already active, collapse it to the predefined size
      clickedSection.removeClass('active');
    }
  }

  section.on('click', toggleAccordion);
});
