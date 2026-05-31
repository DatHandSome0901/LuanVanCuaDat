import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'vi' | 'en';

export interface Translations {
  // Landing Nav
  nav_features: string;
  nav_eras: string;
  nav_stats: string;
  nav_play_game: string;
  nav_hello: string;
  nav_dashboard: string;
  nav_enter_chat: string;
  nav_start: string;

  // Hero
  hero_cta_admin: string;
  hero_cta_continue: string;
  hero_cta_explore: string;
  hero_users_label: string;
  hero_default_title: string;
  hero_default_subtitle: string;
  hero_default_words: string; // comma-separated

  // Process Section
  process_default_title: string;
  process_default_subtitle: string;
  process_step1_title: string;
  process_step1_desc: string;
  process_step2_title: string;
  process_step2_desc: string;
  process_step3_title: string;
  process_step3_desc: string;

  // Features Section
  features_default_title: string;
  features_tab1: string;
  features_tab1_title: string;
  features_tab1_p1: string;
  features_tab1_p2: string;
  features_tab1_p3: string;
  features_tab2: string;
  features_tab2_title: string;
  features_tab2_p1: string;
  features_tab2_p2: string;
  features_tab2_p3: string;
  features_tab3: string;
  features_tab3_title: string;
  features_tab3_p1: string;
  features_tab3_p2: string;
  features_tab3_p3: string;
  features_explore_btn: string;

  // Eras Section
  eras_default_title: string;
  eras_subtitle: string;
  eras_understood: string;

  // Stats Section
  stats_label: string;
  stats_default_title: string;
  stats_s1_label: string;
  stats_s2_label: string;
  stats_s3_label: string;
  stats_s4_label: string;
  stats_h1_title: string;
  stats_h1_desc: string;
  stats_h1_tag1: string;
  stats_h1_tag2: string;
  stats_h2_title: string;
  stats_h2_desc: string;
  stats_h2_li1: string;
  stats_h2_li2: string;
  stats_h3_title: string;
  stats_h3_desc: string;
  stats_h3_platforms: string;

  // CTA
  cta_continue: string;
  cta_heading_guest: string;
  cta_subtext: string;
  cta_btn_admin: string;
  cta_btn_chat: string;
  cta_btn_guest: string;
  cta_users_label: string;

  // Footer
  footer_quick_links: string;
  footer_about_link: string;
  footer_terms_link: string;
  footer_privacy_link: string;
  footer_connect: string;
  footer_address_label: string;
  footer_hotline_label: string;
  footer_contact_btn: string;
  footer_copyright: string;
  footer_company_desc: string;
  footer_mst: string;
  footer_rep: string;

  // Modals
  modal_about: string;
  modal_terms: string;
  modal_privacy: string;
  modal_contact: string;
  modal_about_subtitle: string;
  modal_about_company_info: string;
  modal_about_legal: string;
  modal_about_taxcode: string;
  modal_about_representative: string;
  modal_about_address: string;

  // Chat UI
  chat_loading: string;
  chat_placeholder: string;
  chat_disclaimer: string;
  chat_empty_title: string;
  chat_empty_subtitle: string;
  chat_suggest_label: string;
  chat_suggestions: string; // JSON stringified array of {text, category}
  chat_sources_docs: string;
  chat_sources_web: string;
  chat_sources_page: string;
  chat_sources_web_label: string;

  // Auth
  auth_greeting: string;

  // Language system prompt instruction
  llm_language_instruction: string;

  // Sidebar & Navigation
  sidebar_home: string;
  sidebar_chat: string;
  sidebar_history: string;
  sidebar_new_chat: string;
  sidebar_payment: string;
  sidebar_qa: string;
  sidebar_admin: string;
  sidebar_collapse: string;
  sidebar_expand: string;
  sidebar_history_title: string;
  sidebar_logout: string;
  sidebar_login_now: string;
  sidebar_start_now: string;
  sidebar_me: string;
  sidebar_login: string;
  sidebar_brand_subtext: string;

  // Chat History
  history_pinned: string;
  history_recent: string;
  history_empty: string;
  history_new_chat: string;
  history_toast_pinned: string;
  history_toast_unpinned: string;
  history_toast_pin_err: string;
  history_toast_renamed: string;
  history_toast_rename_err: string;
  history_toast_deleted: string;
  history_toast_delete_err: string;
  history_delete_confirm: string;
  history_menu_pin: string;
  history_menu_unpin: string;
  history_menu_rename: string;
  history_menu_delete: string;

  // Auth View
  auth_login_title: string;
  auth_register_title: string;
  auth_login_subtitle: string;
  auth_register_subtitle: string;
  auth_email_label: string;
  auth_username_label: string;
  auth_password_label: string;
  auth_btn_processing: string;
  auth_btn_login: string;
  auth_btn_register: string;
  auth_or: string;
  auth_google: string;
  auth_no_account: string;
  auth_has_account: string;
  auth_register_now: string;
  auth_login_now: string;
  auth_apk_title: string;
  auth_apk_btn: string;
  auth_err_fail: string;
  auth_err_google: string;

  // Profile View
  profile_title: string;
  profile_subtitle: string;
  profile_edit_btn: string;
  profile_joined_date: string;
  profile_username: string;
  profile_email: string;
  profile_role: string;
  profile_role_admin: string;
  profile_role_user: string;
  profile_acc_type: string;
  profile_acc_google: string;
  profile_acc_system: string;
  profile_change_pwd: string;
  profile_tokens: string;
  profile_admin_feature: string;
  profile_admin_btn: string;
  profile_logout_app: string;
  profile_history_title: string;
  profile_history_col_date: string;
  profile_history_col_type: string;
  profile_history_col_amount: string;
  profile_history_col_desc: string;
  profile_history_col_actions: string;
  profile_history_loading: string;
  profile_history_empty: string;
  profile_history_action_view: string;
  profile_history_type_in: string;
  profile_history_type_out: string;
  profile_tx_detail_title: string;
  profile_tx_detail_time: string;
  profile_tx_detail_status: string;
  profile_tx_detail_success: string;
  profile_tx_detail_type: string;
  profile_tx_detail_type_in: string;
  profile_tx_detail_type_out: string;
  profile_tx_detail_amount: string;
  profile_tx_detail_desc: string;
  profile_tx_detail_close: string;

  // Payment View
  pay_title: string;
  pay_subtitle: string;
  pay_loading: string;
  pay_success_toast: string;
  pay_refresh_err: string;
  pay_invoice_err: string;
  pay_trouble_btn: string;
  pay_popular: string;
  pay_currency: string;
  pay_feature_unlimited: string;
  pay_feature_priority: string;
  pay_vietqr: string;
  pay_checking_toast: string;
  pay_check_success_toast: string;
  pay_check_not_found_toast: string;
  pay_check_err: string;
  pay_invoice_title: string;
  pay_invoice_motto: string;
  pay_invoice_id: string;
  pay_invoice_amount: string;
  pay_invoice_note: string;
  pay_invoice_check_btn: string;
  pay_report_missing_info: string;
  pay_report_sending_toast: string;
  pay_report_success: string;
  pay_report_err: string;
  pay_report_title: string;
  pay_report_subtitle: string;
  pay_report_order_id: string;
  pay_report_placeholder_id: string;
  pay_report_desc: string;
  pay_report_placeholder_desc: string;
  pay_report_submit: string;

  // QA View
  qa_diff_easy: string;
  qa_diff_medium: string;
  qa_diff_hard: string;
  qa_load_board_err: string;
  qa_load_err: string;
  qa_checkin_success: string;
  qa_checkin_already: string;
  qa_checkin_fail: string;
  qa_correct: string;
  qa_incorrect: string;
  qa_milestone_reward: string;
  qa_answer_fail: string;
  qa_loading: string;
  qa_title: string;
  qa_subtitle1: string;
  qa_subtitle2: string;
  qa_balance: string;
  qa_checkin_today: string;
  qa_streak_count: string;
  qa_claiming: string;
  qa_claimed_today: string;
  qa_claim_btn: string;
  qa_progress_today: string;
  qa_correct_count: string;
  qa_answered_progress: string;
  qa_milestone_title: string;
  qa_milestone_today: string;
  qa_milestone_target: string;
  qa_milestone_claimed: string;
  qa_question_num: string;
  qa_agent_grading: string;
  qa_explanation_title: string;
  qa_next_btn: string;
  qa_empty_questions: string;
  qa_sidebar_title: string;
  qa_unanswered: string;
  qa_streak_reward_title: string;
  qa_streak_reward_desc: string;
  qa_leaderboard_title: string;
  qa_leaderboard_subtitle: string;
  qa_tab_this_week: string;
  qa_tab_last_week: string;
  qa_week_duration: string;
  qa_live_update: string;
  qa_empty_leaderboard: string;
  qa_col_rank: string;
  qa_col_user: string;
  qa_col_correct: string;
  qa_col_estimated_reward: string;
  qa_you: string;
  qa_question_unit: string;
  qa_prev_week_duration: string;
  qa_auto_rewarded: string;
  qa_empty_last_week: string;
  qa_col_reward_received: string;
  qa_leaderboard_loading: string;

  // Admin View
  admin_edit_name_title: string;
  admin_edit_pwd_title: string;
  admin_edit_name_label: string;
  admin_edit_pwd_label: string;
  admin_update_user_success: string;
  admin_adjust_bal_title: string;
  admin_adjust_bal_success: string;
  admin_delete_admin_err: string;
  admin_delete_user_title: string;
  admin_delete_user_desc: string;
  admin_delete_user_success: string;
  admin_self_demote_err: string;
  admin_demote_title: string;
  admin_promote_title: string;
  admin_demote_desc: string;
  admin_promote_desc: string;
  admin_demote_success: string;
  admin_promote_success: string;
  admin_create_pkg_title: string;
  admin_pkg_name_label: string;
  admin_pkg_tokens_label: string;
  admin_pkg_amount_label: string;
  admin_pkg_create_success: string;
  admin_pkg_delete_title: string;
  admin_pkg_delete_desc: string;
  admin_pkg_delete_success: string;
  admin_pkg_edit_title: string;
  admin_pkg_update_success: string;
  admin_settings_update_success: string;
  admin_settings_sync_loading: string;
  admin_settings_sync_success: string;
  admin_nav_dashboard: string;
  admin_nav_users: string;
  admin_nav_packages: string;
  admin_nav_history: string;
  admin_nav_payments: string;
  admin_nav_chatlogs: string;
  admin_nav_settings: string;
  admin_nav_logins: string;
  admin_nav_reports: string;
  admin_nav_knowledge: string;
  admin_nav_feedback: string;
  admin_sidebar_motto: string;
  admin_sidebar_collapse: string;
  admin_sidebar_expand: string;
  admin_back_to_chat: string;
  admin_logout: string;
  admin_header_title: string;
  admin_session_label: string;
  admin_role_label: string;
  admin_upload_logo_loading: string;
  admin_upload_logo_success: string;
  admin_upload_favicon_loading: string;
  admin_upload_favicon_success: string;
  admin_upload_bg_landing_success: string;
  admin_upload_bg_chat_success: string;

  // Swal Prompts & Toasts
  swal_update_name_title: string;
  swal_update_name_desc: string;
  swal_change_pwd_title: string;
  swal_change_pwd_current: string;
  swal_change_pwd_new: string;
  swal_profile_updated: string;
  swal_pwd_changed: string;

  // New Landing Page Era keys
  era1_title: string;
  era1_time: string;
  era1_summary: string;
  era2_title: string;
  era2_time: string;
  era2_summary: string;
  era3_title: string;
  era3_time: string;
  era3_summary: string;
  era4_title: string;
  era4_time: string;
  era4_summary: string;
  era5_title: string;
  era5_time: string;
  era5_summary: string;
  era6_title: string;
  era6_time: string;
  era6_summary: string;
  era7_title: string;
  era7_time: string;
  era7_summary: string;
  era8_title: string;
  era8_time: string;
  era8_summary: string;

  // New Landing Page Footer and Modal Details keys
  footer_company_name: string;
  footer_address_value: string;
  footer_representative_value: string;
  footer_about_us_value: string;
  footer_terms_value: string;
  footer_privacy_value: string;
  modal_about_title: string;
  modal_terms_title: string;
  modal_privacy_title: string;
  modal_contact_title: string;
  modal_about_platform: string;
  modal_about_info_title: string;
  modal_about_legal_name: string;
  modal_about_tax_code: string;
  modal_about_rep: string;
  modal_contact_btn_label: string;
  modal_contact_subtitle: string;
  modal_close_btn: string;

  // Mobile specific translations
  mobile_text1: string;
  mobile_text2: string;
  mobile_text3: string;
  mobile_hero_gialong: string;
  mobile_hero_quangtrung: string;
  mobile_hero_tranhungdao: string;
  mobile_hero_lythuongkiet: string;
  mobile_hero_haibatrung: string;
  mobile_hero_laclongquan: string;
  mobile_hero_auco: string;
  mobile_hero_ngoquyen: string;
  mobile_hero_dinhbolinh: string;
  mobile_hero_leloi: string;
  mobile_hero_batrieu: string;
  mobile_hero_phanboichau: string;
  mobile_tri_trieu_dai: string;
  mobile_hao_khi: string;
  mobile_tri_tue: string;
  mobile_game: string;
}

const VI: Translations = {
  nav_features: 'Tính năng',
  nav_eras: 'Triều đại',
  nav_stats: 'Thống kê',
  nav_play_game: 'Chơi Game ⚔️',
  nav_hello: 'Xin chào,',
  nav_dashboard: 'Dashboard',
  nav_enter_chat: 'Vào Chat',
  nav_start: 'Bắt đầu',

  hero_cta_admin: 'Vào Dashboard',
  hero_cta_continue: 'Tiếp tục trò chuyện',
  hero_cta_explore: 'Trải nghiệm ngay',
  hero_users_label: 'Hơn 10,000+ người đang sử dụng',
  hero_default_title: 'Khám phá tinh hoa',
  hero_default_subtitle: 'Hỏi đáp, tra cứu và tìm hiểu kiến thức lịch sử chính xác thông qua sức mạnh của Trí Tuệ Nhân Tạo. Nền tảng học tập toàn diện cho mọi thế hệ.',
  hero_default_words: 'Lịch Sử Việt Nam,Văn Hoá Dân Tộc,Trí Tuệ Cha Ông,Hào Khí Đông A',

  process_default_title: 'Một nền tảng vận hành xuyên suốt',
  process_default_subtitle: 'Tối ưu hóa hành trình khám phá và tiếp thu kiến thức lịch sử thông qua quy trình đơn giản, thông minh.',
  process_step1_title: 'Hỏi đáp AI',
  process_step1_desc: 'Tương tác tự nhiên với AI để tra cứu mọi thông tin lịch sử.',
  process_step2_title: 'Tìm kiếm thông minh',
  process_step2_desc: 'Trích xuất thông tin nhanh chóng từ kho tài liệu khổng lồ.',
  process_step3_title: 'Xác thực nguồn gốc',
  process_step3_desc: 'Mọi thông tin đều được tham chiếu rõ ràng từ sử liệu uy tín.',

  features_default_title: 'Giải pháp toàn diện cho hành trình học tập',
  features_tab1: 'Cho Học Sinh',
  features_tab1_title: 'Trợ thủ ôn tập thông minh',
  features_tab1_p1: 'Tóm tắt sự kiện lịch sử ngắn gọn, dễ hiểu.',
  features_tab1_p2: 'Giải đáp câu hỏi trắc nghiệm và tự luận.',
  features_tab1_p3: 'Hệ thống hóa kiến thức theo sơ đồ tư duy.',
  features_tab2: 'Cho Giáo Viên',
  features_tab2_title: 'Công cụ hỗ trợ giảng dạy',
  features_tab2_p1: 'Tạo giáo án và câu hỏi ôn tập tự động.',
  features_tab2_p2: 'Trích xuất tư liệu lịch sử làm phong phú bài giảng.',
  features_tab2_p3: 'So sánh, đối chiếu các nguồn sử liệu khác nhau.',
  features_tab3: 'Cho Nhà Nghiên Cứu',
  features_tab3_title: 'Tra cứu chuyên sâu',
  features_tab3_p1: 'Tiếp cận kho tàng văn bản cổ và phân tích chi tiết.',
  features_tab3_p2: 'Hỗ trợ đối chiếu dữ liệu lịch sử độ chính xác cao.',
  features_tab3_p3: 'Khám phá các góc khuất lịch sử ít người biết đến.',
  features_explore_btn: 'Khám phá ngay',

  eras_default_title: 'Nền tảng toàn diện đáp ứng mọi thời kỳ',
  eras_subtitle: 'Khám phá chiều dài lịch sử hàng ngàn năm của dân tộc thông qua các bộ dữ liệu được hệ thống hóa chuyên sâu.',
  eras_understood: 'Đã hiểu',

  stats_label: 'Thống kê ấn tượng',
  stats_default_title: 'Tại sao nên chọn Sử Việt AI?',
  stats_s1_label: 'Người dùng tin tưởng',
  stats_s2_label: 'Câu hỏi được giải đáp',
  stats_s3_label: 'Độ chính xác dữ liệu',
  stats_s4_label: 'Hỗ trợ tra cứu',
  stats_h1_title: 'Dữ liệu chuẩn xác',
  stats_h1_desc: 'Mọi câu trả lời được tham chiếu từ các bộ sử liệu chính thống như Đại Việt Sử Ký Toàn Thư, Khâm Định Việt Sử Thông Giám Cương Mục.',
  stats_h1_tag1: 'Chính thống',
  stats_h1_tag2: 'Cập nhật',
  stats_h2_title: 'AI Thông Minh',
  stats_h2_desc: 'Công nghệ RAG tiên tiến giúp hiểu chính xác ngữ cảnh văn hóa Việt, phản hồi ngay lập tức với ngôn từ trau chuốt, tinh tế.',
  stats_h2_li1: 'Phản hồi tức thì trong 1 giây',
  stats_h2_li2: 'Am hiểu ngôn ngữ cổ học',
  stats_h3_title: 'Đa thiết bị',
  stats_h3_desc: 'Thiết kế đáp ứng hoàn hảo cho cả Web, Android và iOS. Giao diện tối giản, tập trung tối đa vào trải nghiệm đọc và học.',
  stats_h3_platforms: 'Hỗ trợ Web • Mobile App • Tablet',

  cta_continue: 'Tiếp tục hành trình học sử,',
  cta_heading_guest: 'Hào khí dân tộc trong tầm tay của bạn',
  cta_subtext: 'Gia nhập cộng đồng 50,000+ người Việt đang khám phá cội nguồn dân tộc mỗi ngày cùng AI Chatbot Lịch sử.',
  cta_btn_admin: 'Vào Dashboard',
  cta_btn_chat: 'Vào Trò Chuyện',
  cta_btn_guest: 'Khám Phá Miễn Phí',
  cta_users_label: '+50k Users',

  footer_quick_links: 'Liên kết nhanh',
  footer_about_link: 'Về chúng tôi',
  footer_terms_link: 'Điều khoản dịch vụ',
  footer_privacy_link: 'Chính sách bảo mật',
  footer_connect: 'Kết nối với chúng tôi',
  footer_address_label: 'Địa chỉ:',
  footer_hotline_label: 'Hotline:',
  footer_contact_btn: 'Liên hệ hỗ trợ',
  footer_copyright: '© 2026 Bản quyền thuộc về AI Chatbot Lịch sử Việt Nam.',
  footer_company_desc: 'Chuyên cung cấp giải pháp công nghệ kỹ thuật cao và xuất nhập khẩu các mặt hàng công nghệ tiên tiến.',
  footer_mst: 'MST:',
  footer_rep: 'Đại diện:',

  modal_about: 'Về Chúng Tôi',
  modal_terms: 'Điều Khoản Dịch Vụ',
  modal_privacy: 'Chính Sách Bảo Mật',
  modal_contact: 'Thông Tin Liên Hệ',
  modal_about_subtitle: 'Nền tảng học tập Lịch Sử bằng AI tiên phong',
  modal_about_company_info: 'Thông tin công ty',
  modal_about_legal: 'Tên pháp lý:',
  modal_about_taxcode: 'Mã số thuế:',
  modal_about_representative: 'Người đại diện:',
  modal_about_address: 'Địa chỉ:',

  chat_loading: 'Đang tra cứu sử liệu',
  chat_placeholder: 'Tìm hiểu sử thi Việt Nam...',
  chat_disclaimer: 'Thông tin mang tính chất tham khảo sử học',
  chat_empty_title: 'Dân ta phải biết sử ta',
  chat_empty_subtitle: 'Khám phá hào khí ngàn năm và những vị anh hùng đã làm nên hồn thiêng sông núi Việt Nam.',
  chat_suggest_label: 'Khám phá ngay',
  chat_suggestions: JSON.stringify([
    { text: 'Trận Điện Biên Phủ', category: 'Chiến tranh' },
    { text: 'Sự tích Hồ Gươm', category: 'Huyền thoại' },
    { text: 'Trần Hưng Đạo', category: 'Anh hùng' },
    { text: 'Vua Gia Long', category: 'Triều đại' },
    { text: 'Hai Bà Trưng', category: 'Anh hùng' },
    { text: 'Tuyên ngôn Độc lập', category: 'Lịch sử hiện đại' },
  ]),
  chat_sources_docs: 'Nguồn sử liệu trích dẫn',
  chat_sources_web: 'Phần chính nguồn (Internet)',
  chat_sources_page: 'Trang {page}',
  chat_sources_web_label: 'Nguồn Web',

  auth_greeting: 'Xin chào',
  llm_language_instruction: 'Hãy trả lời hoàn toàn bằng tiếng Việt. Không dùng từ tiếng Anh.',

  sidebar_home: 'Trang chủ',
  sidebar_chat: 'Sử Việt',
  sidebar_history: 'Lịch sử',
  sidebar_new_chat: 'Đoạn chat mới',
  sidebar_payment: 'Nạp Tiền',
  sidebar_qa: 'Q&A Token',
  sidebar_admin: 'ADMIN',
  sidebar_collapse: 'Thu gọn',
  sidebar_expand: 'Mở rộng',
  sidebar_history_title: 'Lịch sử hội thoại',
  sidebar_logout: 'Đăng xuất',
  sidebar_login_now: 'Đăng nhập ngay',
  sidebar_start_now: 'Bắt đầu ngay',
  sidebar_me: 'Tôi',
  sidebar_login: 'Đăng nhập',
  sidebar_brand_subtext: 'Tri thức ngàn năm',

  // Chat History
  history_pinned: 'Đã ghim',
  history_recent: 'Gần đây',
  history_empty: 'Lịch sử trống',
  history_new_chat: 'Cuộc trò chuyện mới',
  history_toast_pinned: 'Đã ghim hội thoại',
  history_toast_unpinned: 'Đã bỏ ghim',
  history_toast_pin_err: 'Không thể thực hiện thao tác',
  history_toast_renamed: 'Đã đổi tên',
  history_toast_rename_err: 'Lỗi khi đổi tên',
  history_toast_deleted: 'Đã xóa hội thoại',
  history_toast_delete_err: 'Lỗi khi xóa',
  history_delete_confirm: 'Xóa vĩnh viễn cuộc hội thoại này?',
  history_menu_pin: 'Ghim hội thoại',
  history_menu_unpin: 'Bỏ ghim',
  history_menu_rename: 'Đổi tên',
  history_menu_delete: 'Xóa hội thoại',

  auth_login_title: 'Chào mừng bạn trở lại',
  auth_register_title: 'Khám phá Sử Việt',
  auth_login_subtitle: 'Hãy đăng nhập để tiếp tục hành trình tìm hiểu lịch sử.',
  auth_register_subtitle: 'Tạo tài khoản để lưu lại những kiến thức quý báu.',
  auth_email_label: 'Email',
  auth_username_label: 'Tên đăng nhập',
  auth_password_label: 'Mật khẩu',
  auth_btn_processing: 'Đang xử lý...',
  auth_btn_login: 'Đăng Nhập',
  auth_btn_register: 'Đăng Ký',
  auth_or: 'Hoặc',
  auth_google: 'Tiếp tục với Google',
  auth_no_account: 'Chưa có tài khoản?',
  auth_has_account: 'Đã có tài khoản?',
  auth_register_now: 'Đăng ký ngay',
  auth_login_now: 'Đăng nhập ngay',
  auth_apk_title: 'Trải nghiệm tốt hơn trên Android',
  auth_apk_btn: 'Tải xuống bản App (APK)',
  auth_err_fail: 'Thao tác thất bại',
  auth_err_google: 'Không thể kết nối với Google',

  profile_title: 'Hồ Sơ Cá Nhân',
  profile_subtitle: 'Thông tin tài khoản',
  profile_edit_btn: 'SỬA',
  profile_joined_date: 'Ngày gia nhập',
  profile_username: 'Tên đăng nhập / Username',
  profile_email: 'Địa chỉ Email',
  profile_role: 'Quyền hạn hệ thống',
  profile_role_admin: 'Quản trị viên (Admin)',
  profile_role_user: 'Người dùng (User)',
  profile_acc_type: 'Loại tài khoản',
  profile_acc_google: 'Liên kết Google',
  profile_acc_system: 'Tài khoản Hệ thống',
  profile_change_pwd: 'ĐỔI MẬT KHẨU',
  profile_tokens: 'Tokens đang có',
  profile_admin_feature: 'Tính năng & Tiện ích',
  profile_admin_btn: 'Quản trị',
  profile_logout_app: 'Đăng xuất khỏi App',
  profile_history_title: 'Lịch sử tu tập (Giao dịch)',
  profile_history_col_date: 'Ngày',
  profile_history_col_type: 'Loại',
  profile_history_col_amount: 'Số lượng',
  profile_history_col_desc: 'Nội dung',
  profile_history_col_actions: 'Thao tác',
  profile_history_loading: 'Đang tải lịch sử...',
  profile_history_empty: 'Chưa có giao dịch nào.',
  profile_history_action_view: 'Xem',
  profile_history_type_in: 'Nhận',
  profile_history_type_out: 'Chi',
  profile_tx_detail_title: 'Chi Tiết Giao Dịch',
  profile_tx_detail_time: 'Thời gian',
  profile_tx_detail_status: 'Trạng thái',
  profile_tx_detail_success: 'Thành công',
  profile_tx_detail_type: 'Loại hình',
  profile_tx_detail_type_in: 'Tăng Công Đức',
  profile_tx_detail_type_out: 'Khai Phóng Trí Tuệ',
  profile_tx_detail_amount: 'Số lượng',
  profile_tx_detail_desc: 'Nội dung chi tiết',
  profile_tx_detail_close: 'Đóng Cửa Sổ',

  pay_title: 'Nạp Token Sử Việt',
  pay_subtitle: 'Giao dịch an toàn',
  pay_loading: 'Đang tải danh sách gói nạp...',
  pay_success_toast: 'Chúc mừng! Bạn đã nạp thành công {tokens} tokens!',
  pay_refresh_err: 'Lỗi đồng bộ số dư sau khi nạp',
  pay_invoice_err: 'Lỗi tạo hóa đơn',
  pay_trouble_btn: 'Bạn gặp sự cố nạp tiền? Nhấn vào đây để báo cáo',
  pay_popular: 'Phổ biến nhất',
  pay_currency: 'Tệ',
  pay_feature_unlimited: 'Không giới hạn thời hạn sử dụng',
  pay_feature_priority: 'Tốc độ trả lời ưu tiên',
  pay_vietqr: 'Nạp ngay qua VietQR',
  pay_checking_toast: 'Đang kiểm tra giao dịch...',
  pay_check_success_toast: 'Hệ thống đã ghi nhận công đức!',
  pay_check_not_found_toast: 'Giao dịch chưa được tìm thấy hoặc đang xử lý.',
  pay_check_err: 'Lỗi khi kiểm tra thanh toán',
  pay_invoice_title: 'Thanh Toán',
  pay_invoice_motto: '“Gieo hạt lành, tâm an yên”',
  pay_invoice_id: 'Mã đơn hàng:',
  pay_invoice_amount: 'Số tiền:',
  pay_invoice_note: 'Nội dung:',
  pay_invoice_check_btn: 'Kiểm tra thanh toán',
  pay_report_missing_info: 'Vui lòng điền đầy đủ thông tin.',
  pay_report_sending_toast: 'Đang gửi tâm nguyện...',
  pay_report_success: 'Gửi thành công! Admin sẽ kiểm tra sớm.',
  pay_report_err: 'Không thể gửi báo cáo',
  pay_report_title: 'Báo Cáo Sự Cố',
  pay_report_subtitle: 'Tâm nguyện của bạn sẽ được giải quyết sớm',
  pay_report_order_id: 'Mã đơn hàng (ID)',
  pay_report_placeholder_id: 'Ví dụ: 7',
  pay_report_desc: 'Mô tả chi tiết',
  pay_report_placeholder_desc: 'Mô tả sự cố bạn gặp phải...',
  pay_report_submit: 'Gửi Báo Cáo',

  qa_diff_easy: 'Dễ',
  qa_diff_medium: 'Vừa',
  qa_diff_hard: 'Khó',
  qa_load_board_err: 'Lỗi khi tải bảng xếp hạng:',
  qa_load_err: 'Không thể tải Q&A',
  qa_checkin_success: 'Điểm danh thành công: +{total} token',
  qa_checkin_already: 'Bạn đã điểm danh hôm nay rồi.',
  qa_checkin_fail: 'Điểm danh thất bại',
  qa_correct: 'Chính xác!',
  qa_incorrect: 'Chưa đúng rồi.',
  qa_milestone_reward: 'Mốc thưởng Q&A: +{total} token',
  qa_answer_fail: 'Không thể gửi câu trả lời',
  qa_loading: 'Đang mở Sử Quán Q&A...',
  qa_title: 'Sử Quán Q&A',
  qa_subtitle1: 'Hỏi đáp lịch sử Việt Nam',
  qa_subtitle2: 'Nhận token miễn phí hằng ngày',
  qa_balance: 'Số dư tài khoản',
  qa_checkin_today: 'Điểm danh hôm nay',
  qa_streak_count: 'Chuỗi hiện tại: {streak} ngày',
  qa_claiming: 'Đang nhận...',
  qa_claimed_today: 'Đã nhận hôm nay',
  qa_claim_btn: 'Nhận điểm danh',
  qa_progress_today: 'Tiến độ Q&A hôm nay',
  qa_correct_count: 'Đúng',
  qa_answered_progress: 'Đã trả lời {answered} / {total} câu hỏi',
  qa_milestone_title: 'Mốc thưởng đặc biệt',
  qa_milestone_today: 'Hôm nay',
  qa_milestone_target: '{target} câu đúng',
  qa_milestone_claimed: 'Đã nhận',
  qa_question_num: 'Câu {num}/{total}',
  qa_agent_grading: 'Sử Quán Agent đang chấm đáp án...',
  qa_explanation_title: 'Giải thích lịch sử',
  qa_next_btn: 'Câu tiếp theo',
  qa_empty_questions: 'Chưa có câu hỏi hôm nay.',
  qa_sidebar_title: 'Bộ câu hỏi hôm nay',
  qa_unanswered: 'Chưa trả lời',
  qa_streak_reward_title: 'Thưởng chuỗi ngày',
  qa_streak_reward_desc: 'Điểm danh liên tục mỗi 7 ngày để nhận quà tặng đặc biệt +10 token!',
  qa_leaderboard_title: 'Bảng Xếp Hạng Đại Cát',
  qa_leaderboard_subtitle: 'Xếp hạng Q&A theo tuần • Thưởng lớn cho Top 3',
  qa_tab_this_week: 'Tuần này',
  qa_tab_last_week: 'Tuần trước (Vinh danh)',
  qa_week_duration: 'Tuần này: {start} đến {end}',
  qa_live_update: 'Cập nhật liên tục',
  qa_empty_leaderboard: 'Chưa có sử gia nào trả lời đúng câu hỏi trong tuần này. Hãy là người đầu tiên!',
  qa_col_rank: 'Hạng',
  qa_col_user: 'Sử gia',
  qa_col_correct: 'Đúng tuần này',
  qa_col_estimated_reward: 'Mức thưởng dự kiến',
  qa_you: '(Bạn)',
  qa_question_unit: 'câu',
  qa_prev_week_duration: 'Tuần trước: {start} đến {end}',
  qa_auto_rewarded: 'Đã phát thưởng tự động',
  qa_empty_last_week: 'Không có người chiến thắng tuần trước.',
  qa_col_reward_received: 'Phần thưởng đã nhận',
  qa_leaderboard_loading: 'Đang tải dữ liệu bảng xếp hạng...',

  admin_edit_name_title: 'Sửa Họ tên',
  admin_edit_pwd_title: 'Đổi Mật khẩu',
  admin_edit_name_label: 'Nhập họ tên mới:',
  admin_edit_pwd_label: 'Nhập mật khẩu mới (tối thiểu 6 ký tự):',
  admin_update_user_success: 'Cập nhật người dùng thành công.',
  admin_adjust_bal_title: 'Điều chỉnh số dư',
  admin_adjust_bal_success: 'Đã điều chỉnh số dư thành công.',
  admin_delete_admin_err: 'Không thể xóa tài khoản Admin.',
  admin_delete_user_title: 'Xóa người dùng',
  admin_delete_user_desc: 'Bạn có chắc muốn xóa người dùng này khỏi hệ thống?',
  admin_delete_user_success: 'Đã xóa người dùng khỏi hệ thống.',
  admin_self_demote_err: 'Bạn không thể tự hạ cấp quyền Admin của chính mình.',
  admin_demote_title: 'Hạ cấp Admin',
  admin_promote_title: 'Thăng cấp Admin',
  admin_demote_desc: 'Bạn có chắc muốn hạ cấp người dùng này?',
  admin_promote_desc: 'Bạn có chắc muốn thăng cấp người dùng này?',
  admin_demote_success: 'Đã hạ cấp thành công.',
  admin_promote_success: 'Đã thăng cấp thành công.',
  admin_create_pkg_title: 'Tạo gói nạp',
  admin_pkg_name_label: 'Tên gói:',
  admin_pkg_tokens_label: 'Số lượng tokens:',
  admin_pkg_amount_label: 'Số tiền (VNĐ):',
  admin_pkg_create_success: 'Gói nạp mới đã được tạo.',
  admin_pkg_delete_title: 'Xóa gói nạp',
  admin_pkg_delete_desc: 'Bạn có chắc muốn xóa gói nạp này?',
  admin_pkg_delete_success: 'Đã xóa gói nạp.',
  admin_pkg_edit_title: 'Sửa gói nạp',
  admin_pkg_update_success: 'Gói nạp đã được cập nhật.',
  admin_settings_update_success: 'Cấu hình hệ thống đã được cập nhật thành công.',
  admin_settings_sync_loading: 'Đang lấy dữ liệu từ file HTML...',
  admin_settings_sync_success: 'Đã tải SEO từ file HTML vào giao diện.',
  admin_nav_dashboard: 'Tổng quan',
  admin_nav_users: 'Người Dùng',
  admin_nav_packages: 'Gói Nạp',
  admin_nav_history: 'Tiền Tệ',
  admin_nav_payments: 'Hóa Đơn',
  admin_nav_chatlogs: 'Lịch Sử Chat',
  admin_nav_settings: 'Cấu Hình',
  admin_nav_logins: 'Truy Cập',
  admin_nav_reports: 'Báo Cáo',
  admin_nav_knowledge: 'Tri Thức AI',
  admin_nav_feedback: 'Phản Hồi',
  admin_sidebar_motto: 'Quan phòng sự vụ',
  admin_sidebar_collapse: 'Thu gọn',
  admin_sidebar_expand: 'Mở rộng',
  admin_back_to_chat: 'Quay lại Chat',
  admin_logout: 'Đăng xuất',
  admin_header_title: 'Hệ Thống Quản Trị Sử Việt',
  admin_session_label: 'Phiên làm việc quan phòng',
  admin_role_label: 'ADMIN: {name}',
  admin_upload_logo_loading: 'Đang tải lên logo...',
  admin_upload_logo_success: 'Đã tải hình ảnh lên thành công.',
  admin_upload_favicon_loading: 'Đang tải lên favicon...',
  admin_upload_favicon_success: 'Đã tải favicon lên thành công.',
  admin_upload_bg_landing_success: 'Upload background landing thành công',
  admin_upload_bg_chat_success: 'Upload background chat thành công',

  swal_update_name_title: 'Cập nhật Họ tên',
  swal_update_name_desc: 'Nhập họ tên mới của bạn:',
  swal_change_pwd_title: 'Đổi Mật Khẩu',
  swal_change_pwd_current: 'Nhập mật khẩu hiện tại (bỏ trống nếu dùng Google):',
  swal_change_pwd_new: 'Nhập mật khẩu mới (tối thiểu 6 ký tự):',
  swal_profile_updated: 'Hồ sơ đã được cập nhật.',
  swal_pwd_changed: 'Mật khẩu đã được thay đổi thành công.',

  // New Landing Page Era keys
  era1_title: "Hồng Bàng & Âu Lạc",
  era1_time: "2879 TCN - 207 TCN",
  era1_summary: "Thời kỳ bình minh của dân tộc với truyền thuyết con Rồng cháu Tiên, 18 đời Hùng Vương dựng nước và cuộc kháng chiến chống quân Tần của Thục Phán An Dương Vương. Nền văn hóa Đông Sơn rực rỡ với trống đồng là biểu tượng vĩ đại.",
  era2_title: "Bắc Thuộc",
  era2_time: "207 TCN - 938 SCN",
  era2_summary: "Kéo dài hơn 1000 năm đau thương nhưng vô cùng oanh liệt. Bắt đầu từ khi Triệu Đà thôn tính Âu Lạc đến chiến thắng Bạch Đằng lịch sử. Nổi bật với các cuộc khởi nghĩa bất khuất của Hai Bà Trưng, Bà Triệu, Lý Bí.",
  era3_title: "Ngô - Đinh - Tiền Lê",
  era3_time: "938 - 1009",
  era3_summary: "Giai đoạn đặt nền móng vững chắc cho kỷ nguyên độc lập tự chủ. Ngô Quyền xưng vương, Đinh Bộ Lĩnh dẹp loạn 12 sứ quân lập ra nước Đại Cồ Việt, Lê Hoàn đánh Tống bình Chiêm bảo vệ bờ cõi.",
  era4_title: "Lý - Trần - Hồ",
  era4_time: "1009 - 1407",
  era4_summary: "Kỷ nguyên phát triển rực rỡ nhất của nền văn minh Đại Việt. Đời Lý dời đô về Thăng Long. Đời Trần ba lần đánh tan đế quốc Mông Nguyên hùng mạnh nhất thế giới. Đời Hồ nổi bật với những cải cách táo bạo.",
  era5_title: "Lê Sơ & Phân Tranh",
  era5_time: "1428 - 1788",
  era5_summary: "Bắt đầu bằng chiến thắng quân Minh hiển hách của Lê Lợi. Thời Lê Thánh Tông chứng kiến sự phồn thịnh tột bậc. Sau đó là sự suy vi dẫn đến thời kỳ Trịnh - Nguyễn phân tranh dai dẳng.",
  era6_title: "Tây Sơn & Nhà Nguyễn",
  era6_time: "1788 - 1884",
  era6_summary: "Khởi nghĩa nông dân Tây Sơn như vũ bão dẹp thù trong giặc ngoài (đánh tan quân Xiêm, quân Thanh), vua Quang Trung lên ngôi. Sau đó Nguyễn Ánh thống nhất đất nước, lập ra triều Nguyễn đóng đô ở Huế.",
  era7_title: "Pháp Thuộc",
  era7_time: "1884 - 1945",
  era7_summary: "Thực dân Pháp xâm lược và biến Việt Nam thành thuộc địa. Thời kỳ đau thương nhưng cũng là lúc các phong trào yêu nước, các tư tưởng tiến bộ phương Tây du nhập dọn đường cho Cách mạng.",
  era8_title: "Hiện Đại",
  era8_time: "1945 - Nay",
  era8_summary: "Bắt đầu từ Cách mạng tháng Tám (1945), khai sinh nước Việt Nam Dân Chủ Cộng Hòa. Trải qua 2 cuộc kháng chiến chống Pháp và chống Mỹ gian khổ, Việt Nam hoàn toàn độc lập và bước vào kỷ nguyên đổi mới.",

  // New Landing Page Footer and Modal Details keys
  footer_company_name: "CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG",
  footer_address_value: "P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ",
  footer_representative_value: "NGÔ HỒ ANH KHÔI",
  footer_about_us_value: "Sử Việt AI được xây dựng và phát triển bởi CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG với sứ mệnh số hóa và bảo tồn các giá trị lịch sử dân tộc. Nền tảng ứng dụng công nghệ Trí tuệ nhân tạo (AI) hiện đại để tạo ra một chuyên gia lịch sử ảo, giúp học sinh, sinh viên và những người yêu thích lịch sử tiếp cận kiến thức một cách dễ dàng và sinh động.",
  footer_terms_value: "1. Chấp nhận điều khoản\nBằng việc truy cập và sử dụng Sử Việt AI, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.\n\n2. Quyền và trách nhiệm người dùng\nBạn cam kết sử dụng dịch vụ vào mục đích học tập, nghiên cứu hợp pháp. Không sử dụng AI để tạo ra, phát tán các nội dung xuyên tạc lịch sử, chống phá nhà nước hoặc vi phạm thuần phong mỹ tục Việt Nam.\n\n3. Giới hạn trách nhiệm\nMặc dù Sử Việt AI đã được huấn luyện bằng các nguồn sử liệu chính thống, nhưng vì bản chất của Trí tuệ nhân tạo, đôi khi hệ thống có thể cung cấp thông tin thiếu sót hoặc chưa hoàn toàn chính xác. Người dùng nên tham khảo và đối chiếu thông tin khi dùng cho các mục đích học thuật quan trọng.\n\n4. Bản quyền\nToàn bộ thiết kế, logo, mã nguồn và hệ thống thuộc bản quyền của CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG. Nghiêm cấm sao chép dưới mọi hình thức.",
  footer_privacy_value: "1. Thu thập thông tin\nChúng tôi chỉ thu thập các thông tin cơ bản khi bạn đăng nhập (Tên, Email) và nội dung các đoạn chat để phục vụ cho việc cải thiện chất lượng của AI cũng như lưu trữ lịch sử hội thoại cho cá nhân bạn.\n\n2. Bảo mật dữ liệu\nTất cả dữ liệu của bạn đều được mã hóa và lưu trữ an sau trên máy chủ của chúng tôi. Chúng tôi cam kết không bán, không trao đổi hoặc chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại.\n\n3. Quyền kiểm soát của người dùng\nBạn có toàn quyền xem lại, xóa lịch sử chat hoặc yêu cầu xóa toàn bộ tài khoản và dữ liệu cá nhân bất cứ lúc nào thông qua chức năng Quản lý tài khoản.",
  modal_about_title: "Về Chúng Tôi",
  modal_terms_title: "Điều Khoản Dịch Vụ",
  modal_privacy_title: "Chính Sách Bảo Mật",
  modal_contact_title: "Thông Tin Liên Hệ",
  modal_about_platform: "Nền tảng học tập Lịch Sử bằng AI tiên phong",
  modal_about_info_title: "Thông tin công ty",
  modal_about_legal_name: "Tên pháp lý:",
  modal_about_tax_code: "Mã số thuế:",
  modal_about_rep: "Người đại diện:",
  modal_contact_btn_label: "Liên hệ với chúng tôi",
  modal_contact_subtitle: "Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ qua các kênh dưới đây:",
  modal_close_btn: "Đã hiểu & Đóng",

  // Mobile specific translations
  mobile_text1: "Ngược dòng thời gian...",
  mobile_text2: "Khám phá hào khí dân tộc...",
  mobile_text3: "Tìm hiểu sử thi Việt Nam...",
  mobile_hero_gialong: "👑 Gia Long",
  mobile_hero_quangtrung: "⚔️ Quang Trung",
  mobile_hero_tranhungdao: "🏹 Trần Hưng Đạo",
  mobile_hero_lythuongkiet: "📜 Lý Thường Kiệt",
  mobile_hero_haibatrung: "🔥 Hai Bà Trưng",
  mobile_hero_laclongquan: "🐉 Lạc Long Quân",
  mobile_hero_auco: "🌊 Âu Cơ",
  mobile_hero_ngoquyen: "🛡️ Ngô Quyền",
  mobile_hero_dinhbolinh: "🏯 Đinh Bộ Lĩnh",
  mobile_hero_leloi: "📖 Lê Lợi",
  mobile_hero_batrieu: "🐘 Bà Triệu",
  mobile_hero_phanboichau: "⚡ Phan Bội Châu",
  mobile_tri_trieu_dai: "📜 TRIỀU ĐẠI VIỆT",
  mobile_hao_khi: "Hào Khí Ngàn Năm",
  mobile_tri_tue: "Tri Tuệ Nhân Tạo",
  mobile_game: "Chơi Game (Demo)",
};

const EN: Translations = {
  nav_features: 'Features',
  nav_eras: 'Dynasties',
  nav_stats: 'Statistics',
  nav_play_game: 'Play Game ⚔️',
  nav_hello: 'Hello,',
  nav_dashboard: 'Dashboard',
  nav_enter_chat: 'Go to Chat',
  nav_start: 'Get Started',

  hero_cta_admin: 'Go to Dashboard',
  hero_cta_continue: 'Continue Chatting',
  hero_cta_explore: 'Explore Now',
  hero_users_label: 'Over 10,000+ active users',
  hero_default_title: 'Discover the essence of',
  hero_default_subtitle: 'Ask questions, research, and explore accurate historical knowledge through the power of Artificial Intelligence. A comprehensive learning platform for all generations.',
  hero_default_words: 'Vietnamese History,National Culture,Ancestral Wisdom,Heroic Spirit',

  process_default_title: 'A platform that runs seamlessly',
  process_default_subtitle: 'Optimize your journey of exploring and absorbing historical knowledge through a simple, intelligent process.',
  process_step1_title: 'AI Q&A',
  process_step1_desc: 'Interact naturally with AI to look up any historical information.',
  process_step2_title: 'Smart Search',
  process_step2_desc: 'Quickly extract information from a vast document repository.',
  process_step3_title: 'Source Verification',
  process_step3_desc: 'All information is clearly referenced from reputable historical sources.',

  features_default_title: 'Comprehensive solutions for your learning journey',
  features_tab1: 'For Students',
  features_tab1_title: 'Smart Study Assistant',
  features_tab1_p1: 'Concise, easy-to-understand summaries of historical events.',
  features_tab1_p2: 'Answer multiple choice and essay questions.',
  features_tab1_p3: 'Organize knowledge into mind maps.',
  features_tab2: 'For Teachers',
  features_tab2_title: 'Teaching Support Tool',
  features_tab2_p1: 'Auto-generate lesson plans and review questions.',
  features_tab2_p2: 'Extract historical materials to enrich lectures.',
  features_tab2_p3: 'Compare and contrast different historical sources.',
  features_tab3: 'For Researchers',
  features_tab3_title: 'In-depth Research',
  features_tab3_p1: 'Access ancient text repositories and detailed analysis.',
  features_tab3_p2: 'Support high-accuracy historical data cross-referencing.',
  features_tab3_p3: 'Discover little-known corners of history.',
  features_explore_btn: 'Explore Now',

  eras_default_title: 'A comprehensive platform for every era',
  eras_subtitle: 'Explore thousands of years of national history through deeply systematized data sets.',
  eras_understood: 'Got it',

  stats_label: 'Impressive Statistics',
  stats_default_title: 'Why choose Vietnamese History AI?',
  stats_s1_label: 'Trusted Users',
  stats_s2_label: 'Questions Answered',
  stats_s3_label: 'Data Accuracy',
  stats_s4_label: 'Research Support',
  stats_h1_title: 'Accurate Data',
  stats_h1_desc: 'All answers are referenced from authoritative historical sources such as Đại Việt Sử Ký Toàn Thư and Khâm Định Việt Sử Thông Giám Cương Mục.',
  stats_h1_tag1: 'Authoritative',
  stats_h1_tag2: 'Updated',
  stats_h2_title: 'Intelligent AI',
  stats_h2_desc: 'Advanced RAG technology accurately understands Vietnamese cultural context, responding instantly with polished, nuanced language.',
  stats_h2_li1: 'Instant response within 1 second',
  stats_h2_li2: 'Expert in ancient linguistics',
  stats_h3_title: 'Multi-device',
  stats_h3_desc: 'Perfectly responsive design for Web, Android, and iOS. Minimalist interface focused entirely on reading and learning experience.',
  stats_h3_platforms: 'Supports Web • Mobile App • Tablet',

  cta_continue: 'Continue your history learning journey,',
  cta_heading_guest: 'The heroic spirit of our nation, at your fingertips',
  cta_subtext: 'Join 50,000+ Vietnamese people exploring their national roots every day with the History AI Chatbot.',
  cta_btn_admin: 'Go to Dashboard',
  cta_btn_chat: 'Start Chatting',
  cta_btn_guest: 'Explore for Free',
  cta_users_label: '+50k Users',

  footer_quick_links: 'Quick Links',
  footer_about_link: 'About Us',
  footer_terms_link: 'Terms of Service',
  footer_privacy_link: 'Privacy Policy',
  footer_connect: 'Connect With Us',
  footer_address_label: 'Address:',
  footer_hotline_label: 'Hotline:',
  footer_contact_btn: 'Contact Support',
  footer_copyright: '© 2026 Vietnamese History AI Chatbot. All rights reserved.',
  footer_company_desc: 'Specializing in providing high-tech solutions and import/export of advanced technology products.',
  footer_mst: 'Tax Code:',
  footer_rep: 'Representative:',

  modal_about: 'About Us',
  modal_terms: 'Terms of Service',
  modal_privacy: 'Privacy Policy',
  modal_contact: 'Contact Information',
  modal_about_subtitle: 'The pioneering AI-powered Vietnamese History learning platform',
  modal_about_company_info: 'Company Information',
  modal_about_legal: 'Legal Name:',
  modal_about_taxcode: 'Tax Code:',
  modal_about_representative: 'Representative:',
  modal_about_address: 'Address:',

  chat_loading: 'Researching historical records',
  chat_placeholder: 'Ask about Vietnamese history...',
  chat_disclaimer: 'Information is for historical reference purposes',
  chat_empty_title: 'Know your nation\'s history',
  chat_empty_subtitle: 'Explore thousands of years of heroic spirit and the heroes who shaped the soul of Vietnam.',
  chat_suggest_label: 'Explore now',
  chat_suggestions: JSON.stringify([
    { text: 'Battle of Dien Bien Phu', category: 'Warfare' },
    { text: 'Legend of Hoan Kiem Lake', category: 'Legend' },
    { text: 'Tran Hung Dao', category: 'Heroes' },
    { text: 'Emperor Gia Long', category: 'Dynasty' },
    { text: 'Trung Sisters', category: 'Heroes' },
    { text: 'Declaration of Independence', category: 'Modern History' },
  ]),
  chat_sources_docs: 'Cited Historical Sources',
  chat_sources_web: 'Web Sources (Internet)',
  chat_sources_page: 'Page {page}',
  chat_sources_web_label: 'Web Source',

  auth_greeting: 'Hello',
  llm_language_instruction: 'Please respond entirely in English. Do not use any Vietnamese words.',

  sidebar_home: 'Home',
  sidebar_chat: 'Viet History',
  sidebar_history: 'History',
  sidebar_new_chat: 'New Chat',
  sidebar_payment: 'Recharge',
  sidebar_qa: 'Q&A Token',
  sidebar_admin: 'ADMIN',
  sidebar_collapse: 'Collapse',
  sidebar_expand: 'Expand',
  sidebar_history_title: 'Chat History',
  sidebar_logout: 'Log Out',
  sidebar_login_now: 'Login Now',
  sidebar_start_now: 'Start Now',
  sidebar_me: 'Me',
  sidebar_login: 'Login',
  sidebar_brand_subtext: 'Millennial Knowledge',

  // Chat History
  history_pinned: 'Pinned',
  history_recent: 'Recent',
  history_empty: 'History is empty',
  history_new_chat: 'New conversation',
  history_toast_pinned: 'Conversation pinned',
  history_toast_unpinned: 'Unpinned',
  history_toast_pin_err: 'Unable to perform operation',
  history_toast_renamed: 'Renamed successfully',
  history_toast_rename_err: 'Failed to rename',
  history_toast_deleted: 'Conversation deleted',
  history_toast_delete_err: 'Failed to delete',
  history_delete_confirm: 'Delete this conversation permanently?',
  history_menu_pin: 'Pin conversation',
  history_menu_unpin: 'Unpin',
  history_menu_rename: 'Rename',
  history_menu_delete: 'Delete conversation',

  auth_login_title: 'Welcome back',
  auth_register_title: 'Explore Viet History',
  auth_login_subtitle: 'Please login to continue your historical journey.',
  auth_register_subtitle: 'Create an account to preserve precious knowledge.',
  auth_email_label: 'Email',
  auth_username_label: 'Username',
  auth_password_label: 'Password',
  auth_btn_processing: 'Processing...',
  auth_btn_login: 'Login',
  auth_btn_register: 'Register',
  auth_or: 'Or',
  auth_google: 'Continue with Google',
  auth_no_account: "Don't have an account?",
  auth_has_account: 'Already have an account?',
  auth_register_now: 'Register now',
  auth_login_now: 'Login now',
  auth_apk_title: 'Better experience on Android',
  auth_apk_btn: 'Download App (APK)',
  auth_err_fail: 'Operation failed',
  auth_err_google: 'Cannot connect to Google',

  profile_title: 'User Profile',
  profile_subtitle: 'Account Information',
  profile_edit_btn: 'EDIT',
  profile_joined_date: 'Joined Date',
  profile_username: 'Username',
  profile_email: 'Email Address',
  profile_role: 'System Role',
  profile_role_admin: 'Administrator (Admin)',
  profile_role_user: 'Standard User',
  profile_acc_type: 'Account Type',
  profile_acc_google: 'Google Account',
  profile_acc_system: 'System Account',
  profile_change_pwd: 'CHANGE PASSWORD',
  profile_tokens: 'Available Tokens',
  profile_admin_feature: 'Features & Utilities',
  profile_admin_btn: 'Admin Panel',
  profile_logout_app: 'Log Out of App',
  profile_history_title: 'Transaction History',
  profile_history_col_date: 'Date',
  profile_history_col_type: 'Type',
  profile_history_col_amount: 'Amount',
  profile_history_col_desc: 'Description',
  profile_history_col_actions: 'Action',
  profile_history_loading: 'Loading history...',
  profile_history_empty: 'No transactions found.',
  profile_history_action_view: 'View',
  profile_history_type_in: 'Receive',
  profile_history_type_out: 'Spend',
  profile_tx_detail_title: 'Transaction Details',
  profile_tx_detail_time: 'Time',
  profile_tx_detail_status: 'Status',
  profile_tx_detail_success: 'Success',
  profile_tx_detail_type: 'Type',
  profile_tx_detail_type_in: 'Token Recharge',
  profile_tx_detail_type_out: 'Query Incurred',
  profile_tx_detail_amount: 'Amount',
  profile_tx_detail_desc: 'Detailed content',
  profile_tx_detail_close: 'Close Window',

  pay_title: 'Recharge Sử Việt Token',
  pay_subtitle: 'Secure Transaction',
  pay_loading: 'Loading packages...',
  pay_success_toast: 'Congratulations! You have successfully recharged {tokens} tokens!',
  pay_refresh_err: 'Failed to refresh balance after recharge',
  pay_invoice_err: 'Error creating invoice',
  pay_trouble_btn: 'Having trouble? Click here to report an issue',
  pay_popular: 'Most Popular',
  pay_currency: 'Tokens',
  pay_feature_unlimited: 'No expiration date',
  pay_feature_priority: 'Priority response speed',
  pay_vietqr: 'Recharge via VietQR now',
  pay_checking_toast: 'Checking transaction status...',
  pay_check_success_toast: 'Transaction verified successfully!',
  pay_check_not_found_toast: 'Transaction not found or still processing.',
  pay_check_err: 'Error verifying payment',
  pay_invoice_title: 'Payment Invoice',
  pay_invoice_motto: '"Planting good seeds for peace of mind"',
  pay_invoice_id: 'Invoice ID:',
  pay_invoice_amount: 'Amount:',
  pay_invoice_note: 'Note / Memo:',
  pay_invoice_check_btn: 'Verify Payment',
  pay_report_missing_info: 'Please fill in all fields.',
  pay_report_sending_toast: 'Submitting report...',
  pay_report_success: 'Report submitted! Admin will check soon.',
  pay_report_err: 'Failed to submit report',
  pay_report_title: 'Report Payment Issue',
  pay_report_subtitle: 'Your issue will be resolved shortly',
  pay_report_order_id: 'Order ID',
  pay_report_placeholder_id: 'Example: 7',
  pay_report_desc: 'Detailed Description',
  pay_report_placeholder_desc: 'Describe the issue you encountered...',
  pay_report_submit: 'Submit Report',

  qa_diff_easy: 'Easy',
  qa_diff_medium: 'Medium',
  qa_diff_hard: 'Hard',
  qa_load_board_err: 'Error loading leaderboard:',
  qa_load_err: 'Failed to load Q&A',
  qa_checkin_success: 'Checked in successfully: +{total} tokens',
  qa_checkin_already: 'You have already checked in today.',
  qa_checkin_fail: 'Check-in failed',
  qa_correct: 'Correct!',
  qa_incorrect: 'Incorrect.',
  qa_milestone_reward: 'Q&A Milestone: +{total} tokens',
  qa_answer_fail: 'Failed to submit answer',
  qa_loading: 'Opening Q&A Hall...',
  qa_title: 'Q&A Hall',
  qa_subtitle1: 'Vietnamese History Quiz',
  qa_subtitle2: 'Get free tokens daily',
  qa_balance: 'Account Balance',
  qa_checkin_today: 'Daily Check-in',
  qa_streak_count: 'Current streak: {streak} days',
  qa_claiming: 'Claiming...',
  qa_claimed_today: 'Claimed today',
  qa_claim_btn: 'Check-in Now',
  qa_progress_today: "Today's Q&A Progress",
  qa_correct_count: 'Correct',
  qa_answered_progress: 'Answered {answered} / {total} questions',
  qa_milestone_title: 'Special Milestones',
  qa_milestone_today: 'Today',
  qa_milestone_target: '{target} correct answers',
  qa_milestone_claimed: 'Claimed',
  qa_question_num: 'Question {num}/{total}',
  qa_agent_grading: 'Q&A Agent grading...',
  qa_explanation_title: 'Historical Explanation',
  qa_next_btn: 'Next Question',
  qa_empty_questions: 'No questions available today.',
  qa_sidebar_title: "Today's Questions",
  qa_unanswered: 'Unanswered',
  qa_streak_reward_title: 'Streak Reward',
  qa_streak_reward_desc: 'Check in continuously for 7 days to get a special +10 tokens reward!',
  qa_leaderboard_title: 'Imperial Leaderboard',
  qa_leaderboard_subtitle: 'Weekly Q&A Rankings • Big Rewards for Top 3',
  qa_tab_this_week: 'This Week',
  qa_tab_last_week: 'Last Week (Hall of Fame)',
  qa_week_duration: 'This week: {start} to {end}',
  qa_live_update: 'Live Updates',
  qa_empty_leaderboard: 'No historians have answered correctly this week. Be the first!',
  qa_col_rank: 'Rank',
  qa_col_user: 'Historian',
  qa_col_correct: 'Correct this week',
  qa_col_estimated_reward: 'Estimated Reward',
  qa_you: '(You)',
  qa_question_unit: 'questions',
  qa_prev_week_duration: 'Last week: {start} to {end}',
  qa_auto_rewarded: 'Automatically rewarded',
  qa_empty_last_week: 'No winners last week.',
  qa_col_reward_received: 'Reward Received',
  qa_leaderboard_loading: 'Loading leaderboard...',

  admin_edit_name_title: 'Edit Full Name',
  admin_edit_pwd_title: 'Change Password',
  admin_edit_name_label: 'Enter new full name:',
  admin_edit_pwd_label: 'Enter new password (minimum 6 characters):',
  admin_update_user_success: 'User updated successfully.',
  admin_adjust_bal_title: 'Adjust Balance',
  admin_adjust_bal_success: 'Balance adjusted successfully.',
  admin_delete_admin_err: 'Cannot delete Admin account.',
  admin_delete_user_title: 'Delete User',
  admin_delete_user_desc: 'Are you sure you want to delete this user from the system?',
  admin_delete_user_success: 'User deleted from system successfully.',
  admin_self_demote_err: 'You cannot demote yourself from Admin status.',
  admin_demote_title: 'Demote Admin',
  admin_promote_title: 'Promote Admin',
  admin_demote_desc: 'Are you sure you want to demote this user?',
  admin_promote_desc: 'Are you sure you want to promote this user?',
  admin_demote_success: 'Demoted successfully.',
  admin_promote_success: 'Promoted successfully.',
  admin_create_pkg_title: 'Create Package',
  admin_pkg_name_label: 'Package name:',
  admin_pkg_tokens_label: 'Tokens amount:',
  admin_pkg_amount_label: 'Amount (VND):',
  admin_pkg_create_success: 'New package created successfully.',
  admin_pkg_delete_title: 'Delete Package',
  admin_pkg_delete_desc: 'Are you sure you want to delete this package?',
  admin_pkg_delete_success: 'Package deleted successfully.',
  admin_pkg_edit_title: 'Edit Package',
  admin_pkg_update_success: 'Package updated successfully.',
  admin_settings_update_success: 'System configuration updated successfully.',
  admin_settings_sync_loading: 'Retrieving data from HTML file...',
  admin_settings_sync_success: 'Loaded SEO from HTML file to interface.',
  admin_nav_dashboard: 'Dashboard',
  admin_nav_users: 'Users',
  admin_nav_packages: 'Packages',
  admin_nav_history: 'Currency Log',
  admin_nav_payments: 'Invoices',
  admin_nav_chatlogs: 'Chat History',
  admin_nav_settings: 'Configuration',
  admin_nav_logins: 'Access Logs',
  admin_nav_reports: 'Reports',
  admin_nav_knowledge: 'AI Knowledge',
  admin_nav_feedback: 'Feedback',
  admin_sidebar_motto: 'System Supervision',
  admin_sidebar_collapse: 'Collapse',
  admin_sidebar_expand: 'Expand',
  admin_back_to_chat: 'Back to Chat',
  admin_logout: 'Logout',
  admin_header_title: 'Vietnamese History Admin System',
  admin_session_label: 'Supervision Session',
  admin_role_label: 'ADMIN: {name}',
  admin_upload_logo_loading: 'Uploading logo...',
  admin_upload_logo_success: 'Logo uploaded successfully.',
  admin_upload_favicon_loading: 'Uploading favicon...',
  admin_upload_favicon_success: 'Favicon uploaded successfully.',
  admin_upload_bg_landing_success: 'Landing background uploaded successfully',
  admin_upload_bg_chat_success: 'Chat background uploaded successfully',

  swal_update_name_title: 'Update Full Name',
  swal_update_name_desc: 'Enter your new full name:',
  swal_change_pwd_title: 'Change Password',
  swal_change_pwd_current: 'Enter current password (leave blank if using Google):',
  swal_change_pwd_new: 'Enter new password (minimum 6 characters):',
  swal_profile_updated: 'Profile updated successfully.',
  swal_pwd_changed: 'Password changed successfully.',

  // New Landing Page Era keys
  era1_title: "Hong Bang & Au Lac",
  era1_time: "2879 BC - 207 BC",
  era1_summary: "The dawn of the nation with the legend of the Dragon and Fairy descendants, 18 generations of Hung Kings building the country, and the resistance against the Qin army by Thuc Phan An Duong Vuong. The brilliant Dong Son culture with bronze drums as its grand symbol.",
  era2_title: "Chinese Domination",
  era2_time: "207 BC - 938 AD",
  era2_summary: "Lasting over 1,000 years of suffering yet immense glory. Starting from Zhao Tuo's annexation of Au Lac to the historic Bach Dang victory. Highlighting the unyielding rebellions of the Trung Sisters, Lady Trieu, and Ly Bi.",
  era3_title: "Ngo - Dinh - Early Le",
  era3_time: "938 - 1009",
  era3_summary: "The phase laying a solid foundation for the era of independence and sovereignty. Ngo Quyen declared himself king, Dinh Bo Linh defeated the 12 warlords to establish Dai Co Viet, and Le Hoan defeated the Song and pacified Champa to protect the realm.",
  era4_title: "Ly - Tran - Ho",
  era4_time: "1009 - 1407",
  era4_summary: "The most brilliant era of the Dai Viet civilization. The Ly dynasty moved the capital to Thang Long. The Tran dynasty defeated the Mongol Empire—the world's most powerful force—three times. The Ho dynasty stood out with bold reforms.",
  era5_title: "Later Le & Division",
  era5_time: "1428 - 1788",
  era5_summary: "Beginning with Le Loi's glorious victory over the Ming. The reign of Le Thanh Tong witnessed peak prosperity, followed by decline leading to the persistent Trinh-Nguyen conflict.",
  era6_title: "Tay Son & Nguyen",
  era6_time: "1788 - 1884",
  era6_summary: "The Tây Sơn peasant rebellion swept like a storm to defeat internal enemies and foreign invaders (Siam and Qing), crowning King Quang Trung. Later, Nguyen Anh unified the country, establishing the Nguyen dynasty in Hue.",
  era7_title: "French Domination",
  era7_time: "1884 - 1945",
  era7_summary: "French colonial invasion converted Vietnam into a colony. A painful period, but also a time when patriotic movements and Western progressive ideas entered the country, paving the way for the Revolution.",
  era8_title: "Modern Era",
  era8_time: "1945 - Present",
  era8_summary: "Beginning with the August Revolution (1945), birthing the Democratic Republic of Vietnam. Through the arduous anti-French and anti-American wars, Vietnam achieved total independence and entered the era of renewal.",

  // New Landing Page Footer and Modal Details keys
  footer_company_name: "PIONEER TECHNOLOGY ENGINEERING ONE MEMBER CO., LTD",
  footer_address_value: "P16, Street 8, Lot 49 residential area, Nam Can Tho Urban Area, Cai Rang District, Can Tho City",
  footer_representative_value: "NGO HO ANH KHOI",
  footer_about_us_value: "Sử Việt AI was built and developed by PIONEER TECHNOLOGY ENGINEERING CO., LTD with the mission of digitizing and preserving national historical values. The platform applies modern Artificial Intelligence (AI) technology to create a virtual history expert, helping students and history enthusiasts access knowledge easily and vividly.",
  footer_terms_value: "1. Acceptance of Terms\nBy accessing and using Sử Việt AI, you agree to comply with the terms and conditions below. If you do not agree, please stop using the service.\n\n2. User Rights and Responsibilities\nYou commit to using the service for lawful learning and research purposes. Do not use AI to create or distribute content that distorts history, opposes the state, or violates Vietnamese fine customs.\n\n3. Limitation of Liability\nAlthough Sử Việt AI has been trained using official historical sources, due to the nature of Artificial Intelligence, sometimes the system may provide incomplete or not entirely accurate information. Users should refer to and cross-check information when using it for important academic purposes.\n\n4. Copyright\nAll design, logo, source code, and systems are copyrighted by PIONEER TECHNOLOGY ENGINEERING CO., LTD. Any form of copying is strictly prohibited.",
  footer_privacy_value: "1. Information Collection\nWe only collect basic information when you log in (Name, Email) and the content of chat logs to improve the quality of AI as well as store chat history for your convenience.\n\n2. Data Security\nAll your data is encrypted and securely stored on our servers. We commit not to sell, exchange, or share your personal information with any third party for commercial purposes.\n\n3. User Control\nYou have the full right to review, delete chat history, or request the deletion of your account and personal data at any time through the Account Management function.",
  modal_about_title: "About Us",
  modal_terms_title: "Terms of Service",
  modal_privacy_title: "Privacy Policy",
  modal_contact_title: "Contact Information",
  modal_about_platform: "Pioneering AI History Learning Platform",
  modal_about_info_title: "Company Information",
  modal_about_legal_name: "Legal Name:",
  modal_about_tax_code: "Tax Code:",
  modal_about_rep: "Representative:",
  modal_contact_btn_label: "Contact Us",
  modal_contact_subtitle: "We are always ready to support you. Please contact us through the channels below:",
  modal_close_btn: "Got it & Close",

  // Mobile specific translations
  mobile_text1: "Travel back in time...",
  mobile_text2: "Discover national heritage...",
  mobile_text3: "Explore Vietnamese epics...",
  mobile_hero_gialong: "👑 Gia Long",
  mobile_hero_quangtrung: "⚔️ Quang Trung",
  mobile_hero_tranhungdao: "🏹 Tran Hung Dao",
  mobile_hero_lythuongkiet: "📜 Ly Thuong Kiet",
  mobile_hero_haibatrung: "🔥 Hai Ba Trung",
  mobile_hero_laclongquan: "🐉 Lac Long Quan",
  mobile_hero_auco: "🌊 Au Co",
  mobile_hero_ngoquyen: "🛡️ Ngo Quyen",
  mobile_hero_dinhbolinh: "🏯 Dinh Bo Linh",
  mobile_hero_leloi: "📖 Le Loi",
  mobile_hero_batrieu: "🐘 Lady Trieu",
  mobile_hero_phanboichau: "⚡ Phan Boi Chau",
  mobile_tri_trieu_dai: "📜 VIETNAMESE DYNASTIES",
  mobile_hao_khi: "Thousand-Year Heroic Spirit",
  mobile_tri_tue: "Artificial Intelligence",
  mobile_game: "Play Game (Demo)",
};

export const TRANSLATIONS: Record<Language, Translations> = { vi: VI, en: EN };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  hasChosen: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'vi',
  setLanguage: () => {},
  t: VI,
  hasChosen: false,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const stored = localStorage.getItem('app_language') as Language | null;
  const [language, setLanguageState] = useState<Language>(stored || 'vi');
  const [hasChosen, setHasChosen] = useState<boolean>(!!stored);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('app_language', lang);
    setLanguageState(lang);
    setHasChosen(true);
  };

  useEffect(() => {
    const stored = localStorage.getItem('app_language') as Language | null;
    if (stored) {
      setLanguageState(stored);
      setHasChosen(true);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: TRANSLATIONS[language], hasChosen }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
