(function ($) {
    'use strict';
    let ajax_pagination_running = false;
    let wcpr_image = '', wcpr_verified = '', wcpr_rating = '';
    let slides, current_shortcode_id, window_size, is_safari='';
    let current = -1,swipeBoxIndex = 0;
    window.shortcode_wcpr_resize_masonry_items = function (force_resize = false){
        $('.shortcode-wcpr-grid-item.wcpr-grid-item-init').removeClass('wcpr-grid-item-init');
        let row_height = 1,row_gap = 20, reviews_shortcode ;
        $('.wcpr-grid-loadmore .shortcode-wcpr-grid-item:not(.wcpr-grid-item-init)').each(function () {
            if (!$(this).is(':visible')){
                return true;
            }
            reviews_shortcode = $(this).closest('.woocommerce-photo-reviews-shortcode').data('reviews_shortcode');
            if (reviews_shortcode?.cols_gap){
                row_gap = parseInt(reviews_shortcode.cols_gap);
            }else {
                if (reviews_shortcode?.is_elementor === 'yes') {
                    row_gap = 15;
                }
            }
            shortcode_wcpr_resize_masonry_item($(this),row_height, row_gap );
        });
    }
    window.shortcode_wcpr_resize_masonry_item = function (item,row_height, row_gap) {
        item = $(item);
        let item_img, img_height = 0;
        if (item.find('.shortcode-reviews-images-wrap-right .shortcode-reviews-images').length) {
            item_img = item.find('.shortcode-reviews-images-wrap-right .shortcode-reviews-images');
            img_height = item_img.outerHeight();
            if (img_height === 0) {
                let item_width = item.find('.shortcode-wcpr-content').outerWidth(),
                    img_width = item_img.attr('width') || 0,
                    img_height_t = item_img.attr('height') || 0;
                img_height = img_height_t !== 0 ? Math.round((item_width / img_width) * img_height_t) : item_width;
            }
        }
        let item_height = item.find('.shortcode-wcpr-content').outerHeight(),
            item_content_height = item.find('.shortcode-review-content-container').outerHeight();

        if (item_height < (item_content_height + img_height)) {
            item_height = item_content_height + img_height;
        }
        let row_item = Math.ceil((item_height + row_gap) / (row_height + row_gap));
        item.addClass('wcpr-grid-item-init').css('grid-row-end', 'span ' + row_item);
    }
    window.wcpr_enable_scroll = function () {
        'use strict';
        let scrollTop = parseInt($('html').css('top'));
        $('html').removeClass('shortcode-wcpr-noscroll');
        window.scrollTo({top:-scrollTop,behavior: 'instant'})
    }
    window.wcpr_disable_scroll = function () {
        'use strict';
        if ($(document).height() > $(window).height()) {
            let scrollTop = ($('html').scrollTop()) ? $('html').scrollTop() : $('body').scrollTop(); // Works for Chrome, Firefox, IE...
            $('html').addClass('shortcode-wcpr-noscroll').css('top', -scrollTop);
        }
    }
    $(window).on('resize', function () {
        let new_size = $('body').width();
        if (!window_size){
            window_size = new_size;
        }
        if (window_size == new_size) {
            return;
        }
        window_size = new_size;
        shortcode_wcpr_resize_masonry_items(true);
    });
    $(window).on('elementor/frontend/init', () => {
        elementorFrontend.hooks.addAction('frontend/element_ready/woocommerce-photo-reviews.default', function ($scope) {
            if (!window.elementor) {
                return;
            }
            $('.shortcode-wcpr-single-product-summary-meta-shop .variations_form').each(function () {
                $(this).addClass('shortcode-wcpr-variations_form').removeClass('variations_form');
            });
            fixBoxShadow();
        });
    });
    $(document).on('scroll', function (e) {
        setTimeout(function () {
            shortcode_wcpr_resize_masonry_items();
        }, 100);
    });
    $(document).on('click', 'a', function (e) {
        setTimeout(function () {
            shortcode_wcpr_resize_masonry_items();
        }, 100);
    });
    $(document).ready(function ($) {
        $('.shortcode-wcpr-single-product-summary-meta-shop .variations_form').each(function () {
            $(this).addClass('shortcode-wcpr-variations_form').removeClass('variations_form');
        });
        fixBoxShadow();
    });
    /*Ajax pagination*/
    $(document).on('click', '.shortcode-wcpr-load-more-reviews-button:not(.wcpr-loading)', function (e) {
        let $button = $(this);
        let $container = $button.closest('.woocommerce-photo-reviews-shortcode');
        wcpr_image = $container.data('wcpr_image');
        wcpr_verified = $container.data('wcpr_verified');
        wcpr_rating = $container.data('wcpr_rating');
        let reviews_shortcode = $container.data('reviews_shortcode');
        if (ajax_pagination_running) {
            return false;
        }
        ajax_pagination_running = true;
        e.preventDefault();
        $container.addClass('woocommerce-photo-reviews-shortcode-loading');
        $button.addClass('wcpr-loading');
        $.ajax({
            url: woocommerce_photo_reviews_shortcode_params.ajaxurl,
            type: 'get',
            data: {
                action: 'woocommerce_photo_reviews_shortcode_ajax_get_reviews',
                nonce: woocommerce_photo_reviews_shortcode_params.nonce,
                reviews_shortcode: JSON.stringify(reviews_shortcode),
                wcpr_page: $button.data('cpage'),
                wcpr_image: wcpr_image,
                wcpr_verified: wcpr_verified,
                wcpr_rating: wcpr_rating,
            },
            success: function (response) {
                let $html = $('<div class="woocommerce_photo_reviews_shortcode_ajax_get_reviews"></div>');
                $html.css('display', 'none').html(response.html);
                if (['masonry','grid','grid_layout_2'].includes(reviews_shortcode?.style )) {
                    $container.find('.shortcode-wcpr-grid').append($html.find('.shortcode-wcpr-grid').html());
                }else if (['list_1','list_2'].includes(reviews_shortcode?.style )) {
                    $container.find('.shortcode-wcpr-list').append($html.find('.shortcode-wcpr-list').html());
                } else {
                    $container.find('.commentlist').append($html.find('.commentlist').html());
                }
                $container.find('.wcpr-load-more-reviews-button-container').replaceWith($html.find('.wcpr-load-more-reviews-button-container'));
                $container.data('wcpr_image', wcpr_image);
                $container.data('wcpr_verified', wcpr_verified);
                $container.data('wcpr_rating', wcpr_rating);
            },
            complete: function () {
                if (reviews_shortcode.hasOwnProperty('style') && reviews_shortcode.style === 'masonry') {
                    // triggerReviewClick();
                    if (reviews_shortcode.hasOwnProperty('masonry_popup') && reviews_shortcode.masonry_popup === 'image') {
                        triggerReviewImageClick()
                    }
                }
                // wcpr_helpful_button();
                fixBoxShadow();
                $(document.body).trigger('woocommerce_photo_reviews_shortcode_ajax_get_reviews');
                ajax_pagination_running = false;
                $button.removeClass('wcpr-loading');
                $container.removeClass('woocommerce-photo-reviews-shortcode-loading');
            }
        });
    });
    $(document).on('click', 'a.wcpr-page-numbers.wcpr-page-numbers-nav', function (e) {
        let $container = $(this).closest('.woocommerce-photo-reviews-shortcode');
        let reviews_shortcode = $container.data('reviews_shortcode');
        if (!reviews_shortcode.hasOwnProperty('pagination_ajax') || reviews_shortcode.pagination_ajax !== 'on') {
            return true;
        }
        e.preventDefault();
        e.stopPropagation();
        let wrap = $(this).closest('.shortcode-wcpr-pagination');
        let i = wrap.find('.wcpr-page-numbers').index(wrap.find('.wcpr-page-numbers.wcpr-current'));
        if ($(this).hasClass('wcpr-page-numbers-next')) {
            i++;
        } else {
            i--;
        }
        if (i === 0 || i === wrap.find('.wcpr-page-numbers:not(.wcpr-page-numbers-nav)').length) {
            return false;
        }
        wrap.find('.wcpr-page-numbers').eq(i).trigger('click');
    });
    $(document).on('click', 'a.wcpr-page-numbers:not(.wcpr-page-numbers-nav)', function (e) {
        let $button = $(this);
        let $container = $button.closest('.woocommerce-photo-reviews-shortcode');
        wcpr_image = $container.data('wcpr_image');
        wcpr_verified = $container.data('wcpr_verified');
        wcpr_rating = $container.data('wcpr_rating');
        let reviews_shortcode = $container.data('reviews_shortcode');
        if (!reviews_shortcode.hasOwnProperty('pagination_ajax') || reviews_shortcode.pagination_ajax !== 'on') {
            return true;
        }
        if (ajax_pagination_running) {
            return false;
        }
        let scrollTop = parseInt($container.offset().top);
        window.scrollTo({top: scrollTop, behavior: 'smooth'});
        ajax_pagination_running = true;
        e.preventDefault();
        $container.addClass('woocommerce-photo-reviews-shortcode-loading');
        $.ajax({
            url: woocommerce_photo_reviews_shortcode_params.ajaxurl,
            type: 'get',
            data: {
                action: 'woocommerce_photo_reviews_shortcode_ajax_get_reviews',
                nonce: woocommerce_photo_reviews_shortcode_params.nonce,
                reviews_shortcode: JSON.stringify(reviews_shortcode),
                wcpr_page: parseInt($button.html()),
                wcpr_image: wcpr_image,
                wcpr_verified: wcpr_verified,
                wcpr_rating: wcpr_rating,
            },
            success: function (response) {
                $container.html(response.html);
                $container.data('wcpr_image', wcpr_image);
                $container.data('wcpr_verified', wcpr_verified);
                $container.data('wcpr_rating', wcpr_rating);
            },
            error: function (err) {

            },
            complete: function () {
                if (reviews_shortcode.hasOwnProperty('style') && reviews_shortcode.style === 'masonry') {
                    // triggerReviewClick();
                    if (reviews_shortcode.hasOwnProperty('masonry_popup') && reviews_shortcode.masonry_popup === 'image') {
                        triggerReviewImageClick()
                    }
                }
                // wcpr_helpful_button();
                fixBoxShadow();
                $(document.body).trigger('woocommerce_photo_reviews_shortcode_ajax_get_reviews');
                ajax_pagination_running = false;
                $container.removeClass('woocommerce-photo-reviews-shortcode-loading');
            }
        });
    });
    $(document).on('click', 'a.shortcode-wcpr-filter-button', function (e) {
        let $button = $(this);
        let $container = $button.closest('.woocommerce-photo-reviews-shortcode');
        let reviews_shortcode = $container.data('reviews_shortcode');
        if (!reviews_shortcode.hasOwnProperty('pagination_ajax') || reviews_shortcode.pagination_ajax !== 'on') {
            return;
        }
        if (ajax_pagination_running || (parseInt($button.find('.shortcode-wcpr-filter-button-count').html()) === 0 && !$button.hasClass('shortcode-wcpr-active'))) {
            return false;
        }
        wcpr_image = $container.data('wcpr_image');
        wcpr_verified = $container.data('wcpr_verified');
        wcpr_rating = $container.data('wcpr_rating');
        let filter_type = $button.data('filter_type');
        switch (filter_type) {
            case 'all':
                if ($button.hasClass('shortcode-wcpr-active')) {
                    return false;
                } else {
                    wcpr_rating = '';
                }
                break;
            case 'image':
                if ($button.hasClass('shortcode-wcpr-active')) {
                    wcpr_image = '';
                } else {
                    wcpr_image = 1;
                }

                break;
            case 'verified':
                if ($button.hasClass('shortcode-wcpr-active')) {
                    wcpr_verified = '';
                } else {
                    wcpr_verified = 1;
                }
                break;
            default:
                if ($button.hasClass('shortcode-wcpr-active')) {
                    return false;
                } else {
                    wcpr_rating = filter_type;
                }
        }
        let scrollTop = parseInt($container.offset().top);
        window.scrollTo({top: scrollTop, behavior: 'smooth'});
        ajax_pagination_running = true;
        e.preventDefault();
        $container.addClass('woocommerce-photo-reviews-shortcode-loading');
        $.ajax({
            url: woocommerce_photo_reviews_shortcode_params.ajaxurl,
            type: 'get',
            data: {
                action: 'woocommerce_photo_reviews_shortcode_ajax_get_reviews',
                nonce: woocommerce_photo_reviews_shortcode_params.nonce,
                reviews_shortcode: JSON.stringify(reviews_shortcode),
                wcpr_image: wcpr_image,
                wcpr_verified: wcpr_verified,
                wcpr_rating: wcpr_rating,
            },
            success: function (response) {
                $container.html(response.html);
                $container.data('wcpr_image', wcpr_image);
                $container.data('wcpr_verified', wcpr_verified);
                $container.data('wcpr_rating', wcpr_rating);
            },
            error: function (err) {

            },
            complete: function () {
                if (reviews_shortcode.hasOwnProperty('style') && reviews_shortcode.style === 'masonry') {
                    // triggerReviewClick();
                    if (reviews_shortcode.hasOwnProperty('masonry_popup') && reviews_shortcode.masonry_popup === 'image') {
                        triggerReviewImageClick()
                    }
                }
                // wcpr_helpful_button();
                fixBoxShadow();
                if ($container.hasClass('woocommerce-photo-reviews-slide-init')) {
                    $container.removeClass('woocommerce-photo-reviews-slide woocommerce-photo-reviews-slide-init woocommerce-photo-reviews-slide-none');
                    viwcpr_flexslider();
                }
                $(document.body).trigger('woocommerce_photo_reviews_shortcode_ajax_get_reviews');
                ajax_pagination_running = false;
                $container.removeClass('woocommerce-photo-reviews-shortcode-loading');
            }
        });
    });
    $(document).on('click', '.shortcode-wcpr-read-more', function (e) {
        e.stopPropagation();
        let $button = $(this);
        let $comment_content = $button.closest('.shortcode-wcpr-review-content');
        let $comment_content_full = $comment_content.find('.shortcode-wcpr-review-content-full');
        let comment_content_full = $comment_content_full.html();
        if (comment_content_full) {
            $comment_content.html(comment_content_full);
        }
        // $comment_content.closest('.shortcode-wcpr-grid').find('.shortcode-wcpr-grid-item').removeClass('wcpr-grid-item-init');
        $comment_content.closest('.shortcode-wcpr-grid-item').removeClass('wcpr-grid-item-init');
        shortcode_wcpr_resize_masonry_items(true);
    });
    $(document).on('click','.shortcode-wcpr-close', function () {
        closeReviewPopUp();
    });
    $(document).on('keydown', function (e) {
        let $modal = $('.shortcode-wcpr-modal-light-box');
        if ($('.woocommerce-photo-reviews-shortcode').length === 0) {
            return;
        }
        if ($.swipebox.isOpen) {
            return;
        }
        if ($modal.css('display') === 'none') {
            return;
        }
        if (e.keyCode === 27) {
            closeReviewPopUp();
        }
        if (current !== -1) {
            if (e.keyCode === 37) {
                showReview(current -= 1);
            }

            if (e.keyCode === 39) {
                showReview(current += 1);
            }
        }
    });
    $(document).on('click', '.shortcode-wcpr-next', function () {
        showReview(current += 1);
    });
    $(document).on('click', '.shortcode-wcpr-prev', function () {
        showReview(current -= 1);
    });
    $(document).on('click', '.shortcode-wcpr-modal-light-box .shortcode-wcpr-overlay',function () {
        closeReviewPopUp();
    });
    $(document).on('click', '#shortcode-reviews-content-left-main .shortcode-reviews-images', function () {
        let this_image = $(this);
        let data = [];
        $('#shortcode-reviews-content-left-modal').find('a').map(function () {
            let current_image = $(this).find('.shortcode-reviews-images');
            let href = $(this).data('image_src') ? $(this).data('image_src') : current_image.attr('src');
            let title = $(this).data('image_caption') ? $(this).data('image_caption') : ((parseInt($(this).data('image_index')) + 1) + '/' + $('#shortcode-reviews-content-left-modal').find('a').length);
            data.push({href: href, title: title});
        });
        if (data.length === 0) {
            data.push({
                href: this_image.data('original_src') ? this_image.data('original_src') : this_image.attr('src'),
                title: this_image.parent().find('.shortcode-wcpr-review-image-caption').html()
            });
        }
        $.swipebox(data, {hideBarsDelay: 100000, initialIndexOnArray: swipeBoxIndex})
    });
    $(document).on('click', '.shortcode-wcpr-grid-item,.shortcode-wcpr-grid-style-item,.shortcode-wcpr-grid-layout-2-style-item,.shortcode-wcpr-list-style-item', function (e) {
        e.preventDefault();
        e.stopPropagation();
        let $shortcode_container = $(this).closest('.woocommerce-photo-reviews-shortcode');
        let reviews_shortcode = $shortcode_container.data('reviews_shortcode');
        switch (reviews_shortcode?.masonry_popup){
            case 'review':
                if (reviews_shortcode.hasOwnProperty('full_screen_mobile') && reviews_shortcode.full_screen_mobile === 'on') {
                    $('.shortcode-wcpr-modal-light-box').addClass('shortcode-wcpr-full-screen-mobile');
                } else {
                    $('.shortcode-wcpr-modal-light-box').removeClass('shortcode-wcpr-full-screen-mobile');
                }
                switch (reviews_shortcode?.style){
                    case "grid":
                        slides = $shortcode_container.find('.shortcode-wcpr-grid-style-item');
                        break;
                    case "grid_layout_2":
                        slides = $shortcode_container.find('.shortcode-wcpr-grid-layout-2-style-item');
                        break;
                    case "list_1":
                    case "list_2":
                        slides = $shortcode_container.find('.shortcode-wcpr-list-style-item');
                        break;
                    default:
                        slides = $shortcode_container.find('.shortcode-wcpr-grid-item');
                        break;
                }
                let i = slides.index($(this));
                if (i >= 0) {
                    $('.shortcode-wcpr-modal-light-box').removeClass(current_shortcode_id + '-modal');
                    current_shortcode_id = $shortcode_container.attr('id');
                    $('.shortcode-wcpr-modal-light-box').addClass(current_shortcode_id + '-modal');
                    showReview(i);
                    wcpr_disable_scroll();
                }
                break;
            case 'image':
                let data = [], $container = $(this);
                $container.find('.shortcode-reviews-images-wrap-left').find('a').map(function () {
                    let current_image = $(this).find('.shortcode-reviews-images');
                    let href = $(this).data('image_src') || $(this).attr('href') || current_image.attr('src');
                    let title = $(this).data('image_caption') ? $(this).data('image_caption') : ((parseInt($(this).data('image_index')) + 1) + '/' + $container.find('.reviews-images-wrap-left').find('a').length);
                    data.push({href: href, title: title});
                });
                if (data.length){
                    $.swipebox(data, {hideBarsDelay: 100000, initialIndexOnArray: 0})
                }
                return false;
                break;
        }
    });
    function isSafari(){
        if (!is_safari !== ''){
            return is_safari;
        }
        if (/iPad/i.test(navigator.userAgent) || (/Safari/i.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor) && !/Mobi|Android/i.test(navigator.userAgent))) {
            return true;
        }
        return false;
    }
    function fixBoxShadow() {
        if (!isSafari()) {
            $('.shortcode-wcpr-enable-box-shadow').addClass('shortcode-wcpr-fix-box-shadow');
        }
        $('img.jetpack-lazy-image').next('img').remove();
        shortcode_wcpr_resize_masonry_items();
    }
    function closeReviewPopUp() {
        wcpr_enable_scroll();
        $('.shortcode-wcpr-modal-light-box').fadeOut(200);
        current = -1;
        current_shortcode_id='';
    }
    function showReview(n) {
        swipeBoxIndex = 0;
        current = n;
        if (n >= slides.length) {
            current = 0
        }
        if (n < 0) {
            current = slides.length - 1
        }
        let is_desktop = window.innerWidth > 600;
        let $left_modal = $('#shortcode-reviews-content-left-modal');
        let $left_main = $('#shortcode-reviews-content-left-main');
        $left_modal.html('');
        $left_main.html('');
        $('#shortcode-reviews-content-right .shortcode-wcpr-single-product-summary').html('');
        let $current = $(slides[current]);
        if ($current.find('.shortcode-reviews-images-container').length === 0) {
            $('.shortcode-wcpr-modal-light-box').addClass('shortcode-wcpr-no-images');
        } else {
            if ($current.find('.shortcode-reviews-images-wrap-left .shortcode-reviews-images').length > 1){
                $left_modal.html($current.find('.shortcode-reviews-images-wrap-left').html());
            }
            let img_data = $current.find('.shortcode-reviews-images-wrap-right').eq(0).html(), img_url;
            if (typeof img_data === 'undefined') {
                img_data = $current.find('.shortcode-reviews-images-wrap:first-child > a').html();
                img_url =  $current.find('.shortcode-reviews-images-wrap:first-child > a').attr('href');
            }
            if (img_data) {
                $('.shortcode-wcpr-modal-light-box').removeClass('shortcode-wcpr-no-images');
                $left_main.html(img_data);
                $left_main.find('img').attr('src',img_url || $left_main.find('img').data('original_src') || $left_main.find('img').attr('src'))
                    .css({width: 'auto', height: 'auto'});
                $left_main.find('.reviews-videos').css({'min-height': '400px'});
                $left_main.find('.reviews-videos.reviews-videos-youtube').css({width: '500px'});
            }
            $left_modal.find('.shortcode-reviews-images').map(function () {
                let lazy_load_src = $(this).data('src');
                if (lazy_load_src) {
                    $(this).attr('src', lazy_load_src)
                }
            });
            $left_modal.find('.shortcode-reviews-images').parent().on('click', function () {
                swipeBoxIndex = $(this).data('image_index');
                let temp = '', current_image_src = $(this).attr('href');
                if ($(this).hasClass('reviews-iframe') || $(this).find('.reviews-iframe').length) {
                    temp = $(`<iframe class="shortcode-reviews-images reviews-iframe" data-original_src="${current_image_src}" src="${current_image_src}" frameborder="0" allowfullscreen></iframe>`);
                } else if ($(this).hasClass('reviews-videos') || $(this).find('.reviews-videos').length) {
                    temp = $(`<video class="shortcode-reviews-images reviews-videos" data-original_src="${current_image_src}" src="${current_image_src}" controls></video>`);
                } else {
                    current_image_src = $(this).data('image_src') || current_image_src;
                    temp = $(`<img class="shortcode-reviews-images" data-original_src="${current_image_src}" src="${current_image_src}">`);
                    temp.attr('title', $left_main.find('.shortcode-reviews-images').attr('title'));
                }
                temp.css({
                    width: 'auto',
                    height: 'auto'
                });
                // temp.attr({width: $left_main.find('.shortcode-reviews-images').attr('width'), height: $left_main.find('.shortcode-reviews-images').attr('width')});
                $left_main.find('.shortcode-reviews-images').replaceWith(temp);
                $left_main.find('source').attr('srcset', current_image_src);
                $left_main.find('.shortcode-wcpr-review-image-caption').html($(this).data('image_caption'));
                if (is_desktop) {
                    $left_main.find('.shortcode-reviews-images').one('load', function () {
                        if (($('#shortcode-wcpr-modal-wrap').outerHeight() - $left_main.outerHeight()) > 100) {
                            $('#shortcode-reviews-content-left').css({position: 'unset'});
                            $left_modal.css({position: 'absolute', bottom: 0, left: 0, width: '500px'});
                        } else {
                            $('#shortcode-reviews-content-left').css({position: 'relative'});
                            $left_modal.css({position: 'unset'});
                        }
                    })
                }
                return false;
            });
        }
        let $right_meta = $('#shortcode-reviews-content-right .shortcode-reviews-content-right-meta');
        $right_meta.html($current.find('.shortcode-review-content-container').html());
        $('#shortcode-reviews-content-right .shortcode-wcpr-single-product-summary').html($current.find('.shortcode-wcpr-single-product-summary-content-wrapper').html());
        if (!$right_meta.find('.shortcode-wcpr-comment-author').length && $current.find('.shortcode-review-author-container').length){
            $right_meta.prepend('<div class="shortcode-review-author-container">'+$current.find('.shortcode-review-author-container').html()+'</div>') ;
            $right_meta.find('.wcpr-review-rating').remove();
            $right_meta.find('.shortcode-review-author-container .wcpr-review-date')
                .replaceWith('<div class="wcpr-comment-author-rating"><div class="wcpr-review-rating">'+$current.find('.wcpr-review-rating').html()+'</div><div class="wcpr-review-date">'+$current.find('.wcpr-review-date').html()+'</div></div>');
        }
        if (!$right_meta.find(' > .wcpr-wrap-review-helpfull').length && $right_meta.find('.shortcode-wcpr-wrap-review-helpfull').length ){
            let $tmp = $right_meta.find('.shortcode-wcpr-wrap-review-helpfull').clone();
            $right_meta.find('.shortcode-wcpr-wrap-review-helpfull').remove();
            $right_meta.append($tmp);
        }
        $('.shortcode-wcpr-modal-light-box').fadeIn(200);
        wcpr_variation_form($current);
        if ($('img.jetpack-lazy-image:not(.jetpack-lazy-image--handled)').length) {
            document.querySelector('body').dispatchEvent(new Event("jetpack-lazy-images-load"));
        }
        $('img.jetpack-lazy-image').next('img').remove();
        if (is_desktop) {
            if ($left_modal.find('.shortcode-reviews-images').length) {
                console.log('sdfe')
                $left_main.find('.shortcode-reviews-images').one('load', function () {
                    console.log('a',$('#shortcode-wcpr-modal-wrap').outerHeight())
                    console.log('$left_main.outerHeight()',$left_main.outerHeight())
                    if (($('#shortcode-wcpr-modal-wrap').outerHeight() - $left_main.outerHeight()) > 100) {
                        $('#shortcode-reviews-content-left').css({position: 'unset'});
                        $left_modal.css({position: 'absolute', bottom: 0, left: 0, width: '500px'});
                    } else {
                        $('#shortcode-reviews-content-left').css({position: 'relative'});
                        $left_modal.css({position: 'unset'});
                    }
                })
            } else {
                $('#shortcode-reviews-content-left').css({position: 'relative'});
                $left_modal.css({position: 'unset'});
            }
        }
    }
    function wcpr_variation_form($current) {
        let $product_summary = $('.shortcode-wcpr-single-product-summary'),
            $form_variation = $product_summary.find('.shortcode-wcpr-variations_form');
        $form_variation.each(function () {
            $(this).addClass('variations_form vi_wpvs_variation_form');
            $(this).find('select').each(function (k, v) {
                $(this).val($($current).find('select').eq(k).val()).trigger('change')
            });
            $(this).wc_variation_form();
            // WooCommerce Product Variations Swatches plugin of VillaTheme
            $(document.body).trigger('vi_wpvs_variation_form');
            // WooCommerce Price Based on Country (Basic) plugin of Oscar Gare v:2.0.15
            $(document.body).trigger('wc_price_based_country_ajax_geolocation');
        })
    }
}(jQuery));