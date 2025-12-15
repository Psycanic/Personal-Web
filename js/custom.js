$(document).ready(function() {

    const wrapper = $('.wrapper');
    const img = $('.parallax-img');
    const strength = 30; // moivng strength in pixels
    

    wrapper.on('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        // mouse position relative to the wrapper
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;

        const offsetX = (relX - 0.5) * strength;//offset from center
        const offsetY = (relY - 0.5) * strength;

        $('.parallax-layer').css('transform',`translate(${ -offsetX * 0.5 }px, ${ -offsetY * 0.5 }px)`);

        img.css('transform', `translate(calc(-50% + ${-offsetX}px), calc(-50% + ${-offsetY}px))`);
    });

    $('.card').on('mouseenter', function() {
        $(this).css('transform', 'scale(1.05)');
    }).on('mouseleave', function() {
        $(this).css('transform', 'scale(1)');
    });


    // Chatbox
    $('.chat-trigger').on('click', function (e) {
        e.preventDefault();//for some reason I made the card links so wtf
        e.stopPropagation(); 
        const chatText = $(this).data('chatbox');
        $('#chatbox .chatbox-text').html(chatText);
        
        $('#chatbox').toggle();
        //shake effect
        const box = $('#chatbox');
        box.removeClass('shake');   // reseting the animation
        box.addClass('shake');
    });

    //click other place to close
    $('#chatbox').on('click', function (e) {
        e.stopPropagation();
    });

   
    $(document).on('click', function () {
        $('#chatbox').hide();
    });



});
