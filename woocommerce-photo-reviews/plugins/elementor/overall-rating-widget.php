<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WCPR_Elementor_Overall_Rating_Widget extends Elementor\Widget_Base {
	public static $slug = 'wcpr-elementor-overall-rating-widget';

	public function get_name() {
		return 'woocommerce-photo-reviews-overall-rating';
	}

	public function get_title() {
		return esc_html__( 'Overall Rating', 'woocommerce-photo-reviews' );
	}

	public function get_icon() {
		return 'eicon-rating';
	}

	public function get_categories() {
		return [ 'woocommerce-elements' ];
	}

	protected function register_controls() {
		$reviews_settings = VI_WOOCOMMERCE_PHOTO_REVIEWS_DATA::get_instance();
		$this->start_controls_section(
			'general',
			[
				'label' => esc_html__( 'General', 'woocommerce-photo-reviews' ),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		if ( is_plugin_active( 'elementor-pro/elementor-pro.php' ) ) {
			$this->add_control(
				'products',
				[
					'label'        => esc_html__( 'Products', 'woocommerce-photo-reviews' ),
					'type'         => 'query',
					'description'  => esc_html__( 'Display overall rating of which products?', 'woocommerce-photo-reviews' ),
					'options'      => [],
					'label_block'  => true,
					'multiple'     => true,
					'autocomplete' => [
						'object' => 'post',
					],
				]
			);
		} else {
			$products = get_posts( array(
				'post_type'   => 'product',
				'post_status' => VI_WOOCOMMERCE_PHOTO_REVIEWS_DATA::search_product_statuses(),
				'numberposts' => - 1,
			) );

			$options = [];
			foreach ( $products as $product ) {
				$options[ $product->ID ] = $product->post_title;
			}
			$this->add_control(
				'products',
				[
					'label'       => esc_html__( 'Products', 'woocommerce-photo-reviews' ),
					'type'        => \Elementor\Controls_Manager::SELECT2,
					'description' => esc_html__( 'Display overall rating of which products?', 'woocommerce-photo-reviews' ),
					'options'     => $options,
					'label_block' => true,
					'multiple'    => true,
				]
			);
		}
		$this->add_control(
			'rating_count_enable',
			[
				'label' => esc_html__('Enable Rating Count', 'woocommerce-photo-reviews'),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'default' => 'on',
				'label_on' => esc_html__('Yes', 'woocommerce-photo-reviews'),
				'label_off' => esc_html__('No', 'woocommerce-photo-reviews'),
				'return_value' => 'on',
			]
		);
		$this->add_control(
			'overall_rating_enable',
			[
				'label' => esc_html__('Enable Overall Rating', 'woocommerce-photo-reviews'),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'default' => 'on',
				'label_on' => esc_html__('Yes', 'woocommerce-photo-reviews'),
				'label_off' => esc_html__('No', 'woocommerce-photo-reviews'),
				'return_value' => 'on',
			]
		);
		$this->add_control(
			'average_rating_style',
			[
				'label' => esc_html__('Style', 'woocommerce-photo-reviews'),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 1,
				'options' => [
					'' => esc_html__('Global setting', 'woocommerce-photo-reviews'),
					'1' => esc_html__('1', 'woocommerce-photo-reviews'),
					'2' => esc_html__('2', 'woocommerce-photo-reviews'),
					'3' => esc_html__('3', 'woocommerce-photo-reviews'),
				],
			]
		);
		if (class_exists('Polylang')) {
			$this->add_control(
				'pll_all_languages',
				[
					'label' => esc_html__('Show all language reviews', 'woocommerce-photo-reviews'),
					'type' => \Elementor\Controls_Manager::SWITCHER,
					'default' => 'off',
					'label_on' => esc_html__('Yes', 'woocommerce-photo-reviews'),
					'label_off' => esc_html__('No', 'woocommerce-photo-reviews'),
					'return_value' => 'on',
				]
			);
		}
		if (is_plugin_active('sitepress-multilingual-cms/sitepress.php')) {
			$this->add_control(
				'wpml_all_languages',
				[
					'label' => esc_html__('Show all language reviews', 'woocommerce-photo-reviews'),
					'type' => \Elementor\Controls_Manager::SWITCHER,
					'default' => 'off',
					'label_on' => esc_html__('Yes', 'woocommerce-photo-reviews'),
					'label_off' => esc_html__('No', 'woocommerce-photo-reviews'),
					'return_value' => 'on',
				]
			);
		}

		$this->end_controls_section();

	}

	public function get_shortcode_text() {
		$settings = $this->get_settings_for_display();
		$shortcode_attr='';
		if (is_array($settings) && !empty($settings)) {
			$exclude =[];
			$shortcode_attr=[];
			foreach ($settings as $k => $v){
				if (in_array($k, ['products'])){
					$k = 'product_id';
					$v =  is_array($v) ? implode(',', $v): $v;
				}
				if (!is_scalar($v) || in_array($k, $exclude)){
					continue;
				}
				$shortcode_attr[] = "{$k}='{$v}'";
			}
			$shortcode_attr = ' '.implode(' ', $shortcode_attr);
		}
		$shortcode = "[wc_photo_reviews_overall_rating_html{$shortcode_attr}]";
		return $shortcode;
	}

	protected function render() {
		echo do_shortcode( $this->get_shortcode_text() );
	}

	public function render_plain_content() {
		echo wp_kses_post( $this->get_shortcode_text() );
	}
}