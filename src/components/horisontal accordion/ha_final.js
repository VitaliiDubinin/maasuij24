$(document).ready(function () {
  var sectionButton = $('.section-button');
  var subSectionButton = $('.sub-section-button');

  function toggleAccordion() {
    var parentSection = $(this).closest('li.section');
    $('.section.active').not(parentSection).removeClass('active'); // Close other sections
    parentSection.toggleClass('active');
  }

  function toggleSubAccordion() {
    var parentSection = $(this).closest('li.section');
    if (parentSection.hasClass('active')) {
      // Handle the click event for subsection buttons here
      // You can add your desired behavior for subsection buttons
      // For now, let's simply alert a message
      alert('Subsection button clicked.');
    }
  }

  sectionButton.on('click', toggleAccordion);
  subSectionButton.on('click', toggleSubAccordion);
});
