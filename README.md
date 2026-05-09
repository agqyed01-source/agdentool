# WooCommerce Frontend Store

A modern, high-performance web storefront interacting with WooCommerce via the REST API. Built using React, Vite, Tailwind CSS, and powered by a custom Express backend for secure API proxying.

## Prerequisites

- **Node.js**: v18 or higher recommended.
- **WooCommerce Backend**: A WordPress site with the WooCommerce plugin installed.
- **WooCommerce API Keys**: You need to generate REST API keys (Read/Write permissions) in WordPress under **WooCommerce > Settings > Advanced > REST API**.

## Environment Configuration

This project requires environment variables to connect to your WooCommerce store securely. In a local environment, create a `.env` file in the root directory:

```env
VITE_WOO_API_URL=https://your-wordpress-site.com/wp-json/wc/v3
VITE_WOO_CONSUMER_KEY=ck_your_consumer_key_here
VITE_WOO_CONSUMER_SECRET=cs_your_consumer_secret_here
VITE_WOO_CF7_ID=your_contact_form_7_id
```

> **Security Note:** The Express server proxies requests to WooCommerce to ensure your `CONSUMER_KEY` and `CONSUMER_SECRET` do not leak to the client browser.

## Local Development

1. Install required dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

---

## Deployment Guide

### Option 1: CI/CD Pipeline (GitHub Actions)

This project has been configured with a GitHub Actions workflow for automated CI/CD deployments (located in `.github/workflows/deploy.yml`).

To configure the workflow to build successfully with your private keys:

1. Go to your GitHub Repository.
2. Navigate to **Settings > Secrets and variables > Actions**.
3. Click **New repository secret** and add each of the following keys with their respective values:
   - `VITE_WOO_API_URL`
   - `VITE_WOO_CONSUMER_KEY`
   - `VITE_WOO_CONSUMER_SECRET`
   - `VITE_WOO_CF7_ID`

When you push code to the `main` branch, the GitHub Action will automatically:
- Trigger the build workflow.
- Inject the secret variables into the production `.env` file.
- Build the Node.js application `npm run build`.
- Execute your deployment steps.

### Option 2: Manual VPS / Dedicated Server Deployment

If you are hosting this application manually on a Linux server using a process manager like **PM2**:

1. Clone your code onto the server:
   ```bash
   git clone <your-repo-url>
   cd <your-project-folder>
   ```

2. Create your `.env` file with your live store credentials:
   ```bash
   nano .env
   # Paste your WooCommerce credentials here and save
   ```

3. Install dependencies and build the project:
   ```bash
   npm install
   npm run build
   ```

4. Start the application using a process manager (like PM2):
   ```bash
   npm install -g pm2
   pm2 start npm --name "woo-frontend" -- start
   ```

## WooCommerce Auto-Login Integration (Payment Redirect)

To allow users to automatically log in when redirected to the WooCommerce payment page, you need to add a custom code snippet to your WordPress site (e.g., in your child theme's `functions.php` or a custom plugin). Since the frontend appends a JWT `token` parameter to the payment URL (`&token=...`), your WordPress site must intercept this token, validate it, and log the user in.

Add the following snippet to your WordPress site:

```php
add_action('init', 'auto_login_via_jwt_token_for_checkout');

function auto_login_via_jwt_token_for_checkout() {
    if (isset($_GET['token']) && isset($_GET['pay_for_order'])) {
        $token = sanitize_text_field($_GET['token']);
        
        // 1. Decode and validate the JWT token here
        // (You can use a library like firebase/php-jwt)
        // $decoded = JWT::decode($token, new Key('YOUR_SECRET_KEY', 'HS256'));
        // $user_id = $decoded->data->user->id;
        
        // Example user ID to log in (REPLACE THIS WITH ID FROM DECODED TOKEN)
        $user_id = 0; 
        
        if ($user_id > 0 && !is_user_logged_in()) {
            // Set the current user and authentication cookies
            wp_set_current_user($user_id);
            wp_set_auth_cookie($user_id);
            
            // Remove the token from the URL for security and redirect
            $redirect_url = remove_query_arg('token');
            wp_safe_redirect($redirect_url);
            exit;
        }
    }
}
```

> **Note:** Ensure you replace the token validation logic with your actual JWT verification process matching the plugin or method you use for headless authentication.

## Customizing the Order Pay Page Template (WordPress Side)

To create a truly custom, app-like "Cashier" (Payment) page without your WordPress theme's header, footer, or sidebars interfering, you can intercept the `order-pay` endpoint and load a completely custom HTML template. 

Add the following PHP snippet to your child theme's `functions.php` or a custom plugin:

```php
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
                #custom-pay-wrapper .woocommerce { margin: 0; }
                #custom-pay-wrapper .woocommerce-Message { display: none; } /* Hide default WC messages if desired */
                #custom-pay-wrapper ul.order_details { background: #f1f5f9; border-radius: 8px; padding: 20px; border: none; margin-bottom: 30px; }
                #custom-pay-wrapper ul.order_details li { border-right: none; border-bottom: 1px solid #e2e8f0; padding: 10px 0; margin: 0; float: none; width: 100%; display: flex; justify-content: space-between; text-transform: uppercase; font-size: 11px; color: #64748b; font-weight: 700; }
                #custom-pay-wrapper ul.order_details li:last-child { border-bottom: none; }
                #custom-pay-wrapper ul.order_details li strong { text-transform: none; font-size: 14px; color: #0f172a; }
                
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
```

This approach allows you to completely remodel the payment page structure and inject arbitrary CSS, giving the WooCommerce WordPress end the appearance of a clean, isolated Stripe-like payment portal.


- **Frontend**: React, React Router, Tailwind CSS, Framer Motion (for animations), Lucide React (Icons).
- **Backend**: Express.js (serves API proxy and static frontend files).
- **Tooling**: Vite, TypeScript, ESLint.
