# Modern WooCommerce Frontend / 现代 WooCommerce 前端

[English](#english-documentation) | [中文说明](#中文使用手册)

---

## English Documentation

### Introduction
This is a modern, responsive frontend application built with React, Vite, and Tailwind CSS. It connects to a WooCommerce backend via the WooCommerce REST API, providing a seamless shopping experience for users, including variable products, cart management, and product reviews.

### Features
- 🛍 **WooCommerce Integration**: Fetches products, categories, reviews, and manages the shopping cart.
- 🎨 **Modern UI/UX**: Designed with Tailwind CSS for a fully responsive, mobile-first experience.
- 🛒 **Advanced Product Page**: Supports image galleries, variable products (attributes/SKUs) with specific variation imagery, and sticky "Add to Cart" on mobile devices.
- 📊 **Analytics Ready**: Built-in support for Google Analytics 4 (GA4) and Google Tag Manager (GTM).
- 💬 **WhatsApp Support**: Built-in floating WhatsApp chat widgets for quick customer support.

### Prerequisites
- Node.js (v18 or higher)
- A WordPress site with the WooCommerce plugin installed.
- WooCommerce REST API keys (Read/Write permissions).

### Environment Variables
Create a `.env` file in the root directory and configure the following variables (see `.env.example`):

```env
# WooCommerce Backend Configuration
VITE_WOO_API_URL=https://your-wordpress-site.com/wp-json/wc/v3
VITE_WOO_CONSUMER_KEY=ck_your_consumer_key
VITE_WOO_CONSUMER_SECRET=cs_your_consumer_secret

# Newsletter / Contact Form 7 integration (Optional)
VITE_WOO_CF7_ID=your_cf7_form_id

# Google Analytics & Tag Manager (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX
```

### Installation & Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run the development server**:
   ```bash
   npm run dev
   ```
3. **Build for production**:
   ```bash
   npm run build
   ```

### WooCommerce Setup Guide
1. Log in to your WordPress Admin dashboard.
2. Navigate to **WooCommerce > Settings > Advanced > REST API**.
3. Click **Add key**.
4. Provide a description, select the User, and set Permissions to **Read/Write**.
5. Generate the API key. Copy the Consumer Key and Consumer Secret to your `.env` file.

### WordPress `functions.php` Configuration
Because this frontend operates as a Headless application interacting with WooCommerce via the REST API, you may need to add specific code snippets to your active WordPress theme's `functions.php` (or use a Code Snippets plugin).

#### 1. Security: Prevent Draft Products in REST API
By default, authenticated REST API requests via Consumer Keys (with Read/Write permissions) will return products with a `draft` status. While the frontend explicitly filters for `status=publish`, you can enforce this strictly on the backend to prevent draft data leakage:
```php
add_filter( 'woocommerce_rest_product_object_query', function( $args, $request ) {
    $args['post_status'] = 'publish';
    return $args;
}, 10, 2 );
```

#### 2. CORS (Cross-Origin Resource Sharing)
Although our integrated Node.js proxy (`server.ts`) handles most requests, if you perform direct client-to-WordPress requests (like direct form submissions), you might encounter CORS blocks. To globally allow frontend domains:
```php
add_action( 'rest_api_init', function() {
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
    add_filter( 'rest_pre_serve_request', function( $value ) {
        header( 'Access-Control-Allow-Origin: *' ); // Replace * with your frontend domain for production
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE' );
        header( 'Access-Control-Allow-Credentials: true' );
        if ( 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
            exit();
        }
        return $value;
    });
}, 15 );
```

---

## 中文使用手册

### 简介
这是一个使用 React、Vite 和 Tailwind CSS 构建的现代响应式前端应用程序。它通过 WooCommerce REST API 连接到 WooCommerce 后端，为用户提供流畅的购物体验，支持变体商品、购物车管理和产品评论等完整流程。

### 功能特性
- 🛍 **WooCommerce 深度集成**：获取产品、分类、评论以及完整的购物车生命周期管理。
- 🎨 **现代 UI/UX**：使用 Tailwind CSS 进行定制化样式设计，完全响应式，移动端优先。
- 🛒 **高级产品详情页**：支持多图画廊、变体商品（多属性/SKU无缝切换及对应图片展示），以及移动端底部的吸顶“加入购物车”模块。
- 📊 **开箱即用的流量分析**：内置支持 Google Analytics 4 (GA4) 和 Google Tag Manager (GTM)，完美承接由于分离式部署而带来的追踪需求。
- 💬 **WhatsApp 客户支持**：内置 WhatsApp 悬浮聊天组件及客服专家卡片，极大提升转化留存率。

### 准备工作
- Node.js (推荐 v18 或更高版本)
- 一个已安装 WooCommerce 插件的 WordPress 网站。
- WooCommerce REST API 密钥（需要读/写权限）。

### 环境变量配置
在项目根目录创建一个 `.env` 文件，并参照 `.env.example` 配置以下变量：

```env
# WooCommerce 后端配置
VITE_WOO_API_URL=https://your-wordpress-site.com/wp-json/wc/v3
VITE_WOO_CONSUMER_KEY=ck_your_consumer_key
VITE_WOO_CONSUMER_SECRET=cs_your_consumer_secret

# 底部邮箱订阅 / 对应 Contact Form 7 的表单ID (可选)
VITE_WOO_CF7_ID=your_cf7_form_id

# Google Analytics 与 Tag Manager ID (可选)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX
```

### 安装与运行
1. **安装依赖**：
   ```bash
   npm install
   ```
2. **运行本地开发服务器**：
   ```bash
   npm run dev
   ```
3. **打包生产环境代码**：
   ```bash
   npm run build
   ```

### WooCommerce API 配置指南
1. 登录您的 WordPress 后台。
2. 进入 **WooCommerce > 设置 > 高级 > REST API**。
3. 点击 **添加密钥 (Add key)**。
4. 填写描述，选择对应具备权限的用户，并将权限设置为 **读/写 (Read/Write)**（由于使用了购物车和提交订单的功能，建议采用读写权限）。
5. 点击生成。将生成的消费者密钥（Consumer Key）和消费者机密（Consumer Secret）复制到您的前端项目 `.env` 文件中。

### 常见问题 (FAQ)

**Q: 原网站使用了 Google Site Kit 对接追踪代码，我现在做前后端分离，应该怎么处理？**
A: 旧网站部署的 Google Site Kit 会把追踪代码注入在 WordPress 的网页中，由于现在的应用为**独立的新前端架构 (React SPA 单页应用)**，追踪代码需要直接配置到本前端应用内。
操作方式很简单：
1. 找到你原来绑定的 GA4 追踪 ID（格式为 `G-XXXXXXXX`）以及 GTM 容器 ID（格式为 `GTM-XXXXX`）。
2. 将这两个值或者其中需要用到的值，填入前端根目录 `.env` 文件的 `VITE_GA_MEASUREMENT_ID` 和 `VITE_GTM_ID` 里。
3. 代码里的 `<Analytics />` 组件会自动把 gtag 等统计代码注入到网页内，并在用户进行路由切换时正确统计每一个页面的访问 (Page View)。

### WordPress `functions.php` 补充配置参数说明
由于该前端应用作为 Headless 架构与 WooCommerce 交互，为了确保数据的安全性和 API 的正常调用，建议您在 WordPress 当前主题的 `functions.php` 文件中（或者使用 Code Snippets 插件）加入以下配套代码说明：

#### 1. 拦截草稿商品 (Draft) 被 API 输出
由于使用了具备管理员权限的 REST API Keys，默认情况下 WooCommerce 会连同“草稿(Draft)”状态的商品一起返回（前端已经在请求中加了 `status=publish` 参数修复此问题）。但为了从源头防止内部数据泄露，您可以强制过滤：
```php
add_filter( 'woocommerce_rest_product_object_query', function( $args, $request ) {
    $args['post_status'] = 'publish';
    return $args;
}, 10, 2 );
```

#### 2. 处理跨域请求拦截 (CORS) 配置
前端已经自带了 Node.js （`server.ts`）做代理中转，大部分请求不会遇到跨域问题。但如果您在后续开发中需要前端页面直连请求 WordPress 某些 API（如提交一些不支持代理的表单），需要在后端开放跨域权限。将这里的 `*` 换成你最终的前端域名以保证安全性：
```php
add_action( 'rest_api_init', function() {
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
    add_filter( 'rest_pre_serve_request', function( $value ) {
        header( 'Access-Control-Allow-Origin: *' ); // 上线后建议替换为您前端的生产域名
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE' );
        header( 'Access-Control-Allow-Credentials: true' );
        if ( 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
            exit();
        }
        return $value;
    });
}, 15 );
```
