<?php
/**
 * Shoptimizer Child Theme Functions for Dental Depot
 */

// Enqueue child theme styles
add_action( 'wp_enqueue_scripts', 'shoptimizer_child_enqueue_styles', 99 );
function shoptimizer_child_enqueue_styles() {
    wp_enqueue_style( 'shoptimizer-child-style', get_stylesheet_uri(), array( 'shoptimizer-style' ), wp_get_theme()->get( 'Version' ) );
}

// Modify Top Bar Content to match Dental Professional Design
add_action( 'shoptimizer_topbar_left', 'dental_pro_topbar_left' );
function dental_pro_topbar_left() {
    echo '<div class="dental-topbar-left" style="display:flex; gap:15px; align-items:center;">';
    echo '<span>DENTAL PROFESSIONAL CHOICE</span>';
    echo '<span style="opacity:0.5;">|</span>';
    echo '<span>FREE SHIPPING OVER $150</span>';
    echo '</div>';
}

add_action( 'shoptimizer_topbar_right', 'dental_pro_topbar_right' );
function dental_pro_topbar_right() {
    echo '<div class="dental-topbar-right">';
    echo '<span>📞 +1 (800) DENTAL-PRO</span>';
    echo '</div>';
}

// Optional: Force remove default top bar texts if hook overwrites don't work
add_filter( 'theme_mod_shoptimizer_topbar_text', '__return_false' );
add_filter( 'theme_mod_shoptimizer_topbar_text_right', '__return_false' );
