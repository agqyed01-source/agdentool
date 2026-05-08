<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
} // Exit if accessed directly

class WCPR_Elementor_Review_Form_Widget extends Elementor\Widget_Base {

	public static $slug = 'wcpr-elementor-review-form-widget';

	public function get_name() {
		return 'woocommerce-photo-reviews-form';
	}

	public function get_title() {
		return esc_html__( 'Review Form', 'woocommerce-photo-reviews' );
	}

	public function get_icon() {
		return 'eicon-review';
	}

	public function get_categories() {
		return [ 'woocommerce-elements' ];
	}

	protected function register_controls() {
		$this->start_controls_section(
			'general',
			[
				'label' => esc_html__( 'Options', 'woocommerce-photo-reviews' ),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		if ( is_plugin_active( 'elementor-pro/elementor-pro.php' ) ) {
			$this->add_control(
				'product_id',
				[
					'label'        => esc_html__( 'Product', 'woocommerce-photo-reviews' ),
					'type'         => 'query',
					'options'      => [],
					'label_block'  => true,
					'multiple'     => false,
					'autocomplete' => [
						'object' => 'post',
					],
				]
			);
		} else {
			$products = get_posts( array(
				'post_type'      => 'product',
				'post_status'    => VI_WOOCOMMERCE_PHOTO_REVIEWS_DATA::search_product_statuses(),
				'posts_per_page' => - 1,
			) );

			$options = [];
			foreach ( $products as $product ) {
				$options[ $product->ID ] = $product->post_title;
			}
			$this->add_control(
				'product_id',
				[
					'label'       => esc_html__( 'Product', 'woocommerce-photo-reviews' ),
					'type'        => \Elementor\Controls_Manager::SELECT2,
					'options'     => $options,
					'label_block' => true,
					'multiple'    => false,
				]
			);
		}
		$this->add_control(
			'type',
			[
				'label'   => esc_html__( 'Type', 'woocommerce-photo-reviews' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					''      => esc_html__( 'Default', 'woocommerce-photo-reviews' ),
					'popup' => esc_html__( 'Popup', 'woocommerce-photo-reviews' ),
				],

			]
		);
		$this->add_control(
			'button_position',
			[
				'label'     => esc_html__( 'Button Review Position', 'woocommerce-photo-reviews' ),
				'type'      => \Elementor\Controls_Manager::SELECT,
				'default'   => 'right',
				'options'   => [
					'left'   => esc_html__( 'Left', 'woocommerce-photo-reviews' ),
					'center' => esc_html__( 'Center', 'woocommerce-photo-reviews' ),
					'right'  => esc_html__( 'Right', 'woocommerce-photo-reviews' ),
				],
				'condition' => [
					'type' => 'popup',
				],
				'selectors' => [
					"{{WRAPPER}} .woocommerce-photo-reviews-form-container.woocommerce-photo-reviews-form-popup .woocommerce-photo-reviews-form-button-add-review-container" => 'text-align: {{VALUE}} !important;',
				],
			]
		);
		$this->add_control(
			'upload_button_style',
			[
				'label'     => esc_html__( 'Upload button style', 'woocommerce-photo-reviews' ),
				'type'      => \Elementor\Controls_Manager::SELECT,
				'default'   => '2',
				'options'   => [
					'1'   => esc_html__( 'Show button', 'woocommerce-photo-reviews' ),
					'2' => esc_html__( 'Show text and icon', 'woocommerce-photo-reviews' ),
				],
			]
		);
		$this->add_control(
			'hide_product_details',
			[
				'label'        => esc_html__( 'Hide Product Details', 'woocommerce-photo-reviews' ),
				'type'         => \Elementor\Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Yes', 'woocommerce-photo-reviews' ),
				'label_off'    => esc_html__( 'No', 'woocommerce-photo-reviews' ),
				'return_value' => 'on',
			]
		);
		$this->add_control(
			'hide_product_price',
			[
				'label'        => esc_html__( 'Hide Product price', 'woocommerce-photo-reviews' ),
				'type'         => \Elementor\Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Yes', 'woocommerce-photo-reviews' ),
				'label_off'    => esc_html__( 'No', 'woocommerce-photo-reviews' ),
				'return_value' => 'on',
				'condition' => [
					'hide_product_details' => '',
				],
			]
		);
		$this->end_controls_section();
	}

	public function get_shortcode_text() {
		$settings   = $this->get_settings_for_display();
		$shortcode_attr='';
		if (is_array($settings) && !empty($settings)) {
			$product_id = $settings['product_id'];
			if (!$product_id){
				global $product;
				if ($product){
					$product_id = $product->get_id();
				}
			}
			if ( ! $product_id  ) {
				$products = get_posts( array(
					'post_type'   => 'product',
					'post_status' => VI_WOOCOMMERCE_PHOTO_REVIEWS_DATA::search_product_statuses(),
					'numberposts' => 1,
				) );
				if ( count( $products ) ) {
					$product_id = $products[0]->ID;
				}
			}
			$exclude =['product_id'];
			$shortcode_attr=["product_id='{$product_id}'"];
			foreach ($settings as $k => $v){
				if (!is_scalar($v) || in_array($k, $exclude)){
					continue;
				}
				$shortcode_attr[] = "{$k}='{$v}'";
			}
			$shortcode_attr = ' '.implode(' ', $shortcode_attr);
		}
		$shortcode = "[woocommerce_photo_reviews_form{$shortcode_attr}]";
		return $shortcode;
	}

	protected function render() {

		echo do_shortcode( $this->get_shortcode_text() );
	}

	public function render_plain_content() {
		echo wp_kses_post( $this->get_shortcode_text() );
	}
}