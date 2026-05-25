<?php
/**
 * Twenty Twenty-Four Child Theme Functions for Dental Depot
 * 将此代码添加到 twentytwentyfour-child 目录下的 functions.php 文件末尾
 */

// 引入子主题样式
add_action( 'wp_enqueue_scripts', 'twentytwentyfour_child_enqueue_styles', 99 );
function twentytwentyfour_child_enqueue_styles() {
    wp_enqueue_style( 'twentytwentyfour-child-style', get_stylesheet_uri(), array( 'twentytwentyfour-style' ), wp_get_theme()->get( 'Version' ) );
}

/**
 * 注意：
 * Twenty Twenty-Four 是一个区块主题 (Block Theme)，没有像 Shoptimizer 那样的 shoptimizer_topbar_left 等传统 action hook。
 * 如果需要在顶部添加 Top bar (如 "DENTAL PROFESSIONAL CHOICE" 等)，请在 WordPress 后台的 外观 -> 编辑器 (Site Editor) 中直接编辑 Header 模板部分，添加相应的 Text 或 Custom HTML 区块即可。
 */

// 允许游客无头模式下支付订单
add_filter( 'user_has_cap', 'allow_headless_guest_pay_for_order', 10, 3 );
function allow_headless_guest_pay_for_order( $allcaps, $caps, $args ) {
    if ( isset( $caps[0] ) && 'pay_for_order' === $caps[0] ) {
        $order_id = isset( $args[2] ) ? $args[2] : null;
        
        // 检查当前 URL 是否是付款页面，并且包含了系统分配的安全 key
        if ( isset( $_GET['pay_for_order'] ) && isset( $_GET['key'] ) ) {
            $url_order_id = wc_get_order_id_by_order_key( wc_clean( $_GET['key'] ) );
            if ( $url_order_id && ( ! $order_id || $order_id == $url_order_id ) ) {
                // 放行验证：赋予当前访客支付该订单的临时权限
                $allcaps['pay_for_order'] = true;
            }
        }
    }
    return $allcaps;
}

// 自定义无头订单支付页面
add_action('template_redirect', 'custom_headless_order_pay_page');

function custom_headless_order_pay_page() {
    // Check if we are on the WooCommerce order-pay endpoint
    if (function_exists('is_wc_endpoint_url') && is_wc_endpoint_url('order-pay')) {
        // Output our custom HTML structure completely bypassing the theme
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta charset="<?php bloginfo( 'charset' ); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Secure Payment Gateway</title>
            <?php wp_head(); ?>
            <style>
                /* Completely custom styles for the payment gateway */
                body { 
                    background-color: #f8fafc; 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    display: flex; 
                    justify-content: center; 
                    align-items: flex-start; 
                    min-height: 100vh; 
                    margin: 0; 
                    padding: 40px 20px; 
                    box-sizing: border-box; 
                }
                #custom-pay-wrapper { 
                    background: white; 
                    padding: 40px; 
                    border-radius: 16px; 
                    box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); 
                    width: 100%; 
                    max-width: 550px; 
                    border: 1px solid #e2e8f0;
                }
                .logo-container {
                    text-align: center;
                    margin-bottom: 24px;
                }
                .logo-container svg {
                    width: 48px;
                    height: 48px;
                    color: #0ea5e9; /* Brand color */
                }
                h1.gateway-title { 
                    text-align: center; 
                    font-size: 24px; 
                    color: #0f172a; 
                    margin-top: 0; 
                    margin-bottom: 8px; 
                    font-weight: 700;
                }
                p.gateway-subtitle {
                    text-align: center;
                    color: #64748b;
                    margin-bottom: 30px;
                    font-size: 14px;
                }
                
                /* WooCommerce form overrides inside our wrapper */
                #custom-pay-wrapper .woocommerce { margin: 0; width: 100%; }
                #custom-pay-wrapper #order_review, #custom-pay-wrapper #order_review_heading { width: 100% !important; float: none !important; margin: 0 !important; }
                #custom-pay-wrapper .woocommerce-Message { display: none; } /* Hide default WC messages if desired */
                #custom-pay-wrapper ul.order_details { background: #f1f5f9; border-radius: 8px; padding: 20px; border: none; margin-bottom: 30px; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
                #custom-pay-wrapper ul.order_details li { border-right: none; border-bottom: 1px solid #e2e8f0; padding: 10px 0; margin: 0; float: none; width: 100%; display: flex; flex-direction: column; text-transform: uppercase; font-size: 11px; color: #64748b; font-weight: 700; }
                #custom-pay-wrapper ul.order_details li:last-child { border-bottom: none; }
                #custom-pay-wrapper ul.order_details li strong { text-transform: none; font-size: 14px; color: #0f172a; margin-top: 4px; }
                
                /* Order table styling */
                table.shop_table { width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: left; }
                table.shop_table th { padding: 12px 8px; border-bottom: 2px solid #e2e8f0; color: #0f172a; font-size: 14px; }
                table.shop_table td { padding: 12px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; color: #475569; font-size: 14px; }
                table.shop_table tfoot th, table.shop_table tfoot td { font-weight: bold; color: #0f172a; }
                
                /* Payment methods styling */
                #payment { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
                #payment ul.payment_methods { list-style: none; margin: 0; padding: 0; border-bottom: 1px solid #e2e8f0; }
                #payment ul.payment_methods li { padding: 16px; border-bottom: 1px solid #e2e8f0; }
                #payment ul.payment_methods li:last-child { border-bottom: none; }
                #payment ul.payment_methods li input { margin-right: 12px; }
                #payment ul.payment_methods li label { font-weight: 600; color: #0f172a; display: inline-flex; align-items: center; }
                #payment ul.payment_methods li label img { max-height: 24px; margin-left: 8px; }
                #payment div.payment_box { padding: 16px; background: #e2e8f0; border-radius: 4px; font-size: 13px; color: #475569; margin-top: 12px; }
                
                /* Submit button styling */
                #payment .form-row { padding: 20px; margin: 0; background: #fff; }
                #payment .button { width: 100%; background: #0ea5e9; color: #fff; border: none; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                #payment .button:hover { background: #0284c7; }
                
                .woocommerce-privacy-policy-text { font-size: 12px; color: #64748b; margin-bottom: 16px; line-height: 1.5; }
                
                /* Hide WordPress Admin Bar on this specific page */
                #wpadminbar { display: none !important; }
                html { margin-top: 0 !important; }
            </style>
        </head>
        <body <?php body_class(); ?>>
            <div id="custom-pay-wrapper">
                <div class="logo-container">
                    <!-- Example Logo (Lucide ShieldCheck) -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h1 class="gateway-title">Secure Checkout</h1>
                <p class="gateway-subtitle">Complete your payment below</p>
                
                <div class="woocommerce-custom-content">
                    <?php
                    // Render the WooCommerce checkout/pay shortcode content
                    while ( have_posts() ) :
                        the_post();
                        the_content();
                    endwhile;
                    ?>
                </div>
            </div>
            
            <?php wp_footer(); ?>
        </body>
        </html>
        <?php
        exit; // Stop WordPress from loading the normal theme layout (get_header/get_footer)
    }
}

// 1. Change the URL that payment gateways use to redirect the user:
add_filter('woocommerce_get_return_url', 'headless_woocommerce_get_return_url', 10, 2);

function headless_woocommerce_get_return_url($return_url, $order) {
    if ($order) {
        $frontend_url = 'https://agdentool.com'; // Replace with your actual frontend domain
        $return_url = $frontend_url . '/order/' . $order->get_id();
    }
    return $return_url;
}

// 2. Catch any direct visits to the order-received page and safely redirect:
add_action('template_redirect', 'headless_redirect_order_received_page');

function headless_redirect_order_received_page() {
    if (function_exists('is_wc_endpoint_url') && is_wc_endpoint_url('order-received')) {
        global $wp;
        $order_id = absint($wp->query_vars['order-received']);
        
        if ($order_id) {
            $frontend_url = 'https://agdentool.com/order/' . $order_id; // Replace with your frontend domain
            wp_safe_redirect($frontend_url);
            exit;
        }
    }
}
