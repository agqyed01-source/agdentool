jQuery(document).ready(function ($) {
    'use strict';
    let isSafari = false;
    if (/iPad/i.test(navigator.userAgent) || (/Safari/i.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor) && !/Mobi|Android/i.test(navigator.userAgent))) {
        isSafari = true;
    } else {
        $('.wcpr-enable-box-shadow').addClass('wcpr-fix-box-shadow');
    }
    let current = -1;
    let slides;
    let swipeBoxIndex = 0;


    function wcpr_enable_scroll() {
        let scrollTop = parseInt($('html').css('top'));
        $('html').removeClass('wcpr-noscroll');
        window.scrollTo({top: -scrollTop, behavior: 'instant'})
    }

    function wcpr_disable_scroll() {
        if ($(document).height() > $(window).height()) {
            let scrollTop = ($('html').scrollTop()) ? $('html').scrollTop() : $('body').scrollTop(); // Works for Chrome, Firefox, IE...
            $('html').addClass('wcpr-noscroll').css('top', -scrollTop);
        }
    }

    switch (woocommerce_photo_reviews_params.display) {
        case "5":
            slides = $('.wcpr-list-style-item');
            break;
        case "6":
            slides = $('.wcpr-list-layout-2-style-item');
            break;
        default:
            slides = $('.wcpr-grid-item');
            break;
    }
    $(document).on('click', '.wcpr-content .reviews-images-wrap, .wcpr-content .reviews-images-wrap-right', function (e){
        let $current_wrap  = $(this).closest('div[id*="comment-"]');
        switch (woocommerce_photo_reviews_params.masonry_popup){
            case 'image':
                let current_image = $(this).find('img'),
                    t_left = $current_wrap.find('.reviews-images-wrap-left');
                let data = [];
                t_left.find('a').map(function () {
                    let href = $(this).data('image_src') ||$(this).data('href')||$(this).find('.reviews-images').data('src') || current_image.attr('src');
                    let title = $(this).data('image_caption') ? $(this).data('image_caption') : ((parseInt($(this).data('image_index')) + 1) + '/' + t_left.find('.reviews-images-wrap').length);
                    data.push({href: href, title: title});
                });
                if (!data.length) {
                    data.push({
                        href: current_image.data('original_src') ? current_image.data('original_src') : current_image.attr('src'),
                        title: current_image.parent().find('.wcpr-review-image-caption').html()
                    });
                }
                $.swipebox(data, {hideBarsDelay: 100000, initialIndexOnArray: $(this).find('a').data('image_index')||0});
                return false;
                break;
        }
    });

    jQuery(document.body).on('click', '.wcpr-read-more', function (e) {
        e.stopPropagation();
        let $button = $(this);
        let $comment_content = $button.closest('.wcpr-review-content');
        let $comment_content_full = $comment_content.find('.wcpr-review-content-full');
        let comment_content_full = $comment_content_full.html();
        if (comment_content_full) {
            $comment_content.html(comment_content_full);
        }
        $comment_content.closest('.wcpr-grid-item').removeClass('wcpr-grid-item-init');
    });
    return false;
});
