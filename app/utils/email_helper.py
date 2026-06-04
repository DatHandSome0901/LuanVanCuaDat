import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

def send_email_in_background(to_email: str, subject: str, body: str):
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        smtp_port = 587

    if not smtp_username or not smtp_password:
        print("[SMTP] Warning: SMTP_USERNAME or SMTP_PASSWORD is not set in .env. Email notification skipped.")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = f"Sử Việt AI <{smtp_username}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html', 'utf-8'))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, to_email, msg.as_string())
        server.quit()
        print(f"[SMTP] Email sent successfully to {to_email}")
    except Exception as e:
        print(f"[SMTP] Failed to send email to {to_email}: {e}")

def send_payment_report_emails(
    admin_email: str,
    user_email: str,
    payment_id: Optional[int],
    report_id: int,
    username: str,
    description: str,
    amount_vnd: Optional[int] = None,
    tokens: Optional[int] = None
):
    is_payment = payment_id is not None and payment_id > 0
    payment_id_str = f"#{payment_id}" if is_payment else "Không có (Lỗi hệ thống/Khác)"
    
    # 1. Email to Admin
    admin_subject = f"[Sử Việt AI] Báo cáo sự cố thanh toán - Hóa đơn #{payment_id} (Mã sớ: #{report_id})" if is_payment else f"[Sử Việt AI] Báo cáo lỗi / Góp ý hệ thống từ {username} (Mã sớ: #{report_id})"
    
    admin_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #800000; border-bottom: 2px solid #800000; padding-bottom: 8px;">
          { "Báo cáo sự cố thanh toán mới" if is_payment else "Báo cáo lỗi / Góp ý hệ thống mới" }
        </h2>
        <p>Hệ thống Sử Việt AI vừa nhận được báo cáo từ người dùng:</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 180px; background-color: #f9f9f9;">Mã sớ báo cáo:</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #800000;">#{report_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Loại báo cáo:</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #800000;">{ "Sự cố nạp tiền" if is_payment else "Sự cố hệ thống / Góp ý" }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Mã hóa đơn (Payment ID):</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{payment_id_str}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Tài khoản gửi:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{username}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Email liên hệ:</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:{user_email}">{user_email}</a></td>
          </tr>
          {f'''<tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Số tiền:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{amount_vnd:,} VND</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Tokens:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{tokens} tokens</td>
          </tr>''' if (is_payment and amount_vnd is not None) else ''}
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9; vertical-align: top;">Chi tiết báo cáo:</td>
            <td style="padding: 8px; border: 1px solid #ddd; white-space: pre-wrap;">{description}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Vui lòng kiểm tra và hỗ trợ thành viên kịp thời.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 11px; color: #888;">Thư điện tử tự động gửi từ hệ thống Sử Việt AI.</p>
      </body>
    </html>
    """
    
    # 2. Email to User
    user_subject = f"[Sử Việt AI] Đã nhận báo cáo sự cố của bạn #{report_id}" if is_payment else f"[Sử Việt AI] Xác nhận tiếp nhận báo cáo lỗi / Góp ý #{report_id}"
    
    user_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #800000; border-bottom: 2px solid #800000; padding-bottom: 8px;">
          Xác nhận tiếp nhận phản hồi từ bạn (Mã sớ: #{report_id})
        </h2>
        <p>Chào <strong>{username}</strong>,</p>
        <p>Sử Việt AI đã nhận được báo cáo sự cố của bạn.</p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #800000; padding: 15px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #800000;">Chi tiết phản hồi:</h4>
          <p style="margin: 0; white-space: pre-wrap; font-style: italic; color: #555;">{description}</p>
        </div>
        
        <p>Ban quản trị đang tiến hành kiểm tra và xử lý sự cố này. Chúng tôi sẽ phản hồi lại bạn sớm nhất có thể qua email này.</p>
        <p>Cảm ơn sự đóng góp của bạn để giúp hệ thống Sử Việt AI ngày một hoàn thiện hơn.</p>
        
        <p style="margin-top: 30px;">Trân trọng,<br/><strong>Ban quản trị Sử Việt AI</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 11px; color: #888;">Thư điện tử tự động gửi từ hệ thống Sử Việt AI. Vui lòng không trả lời thư này.</p>
      </body>
    </html>
    """

    # Send both
    send_email_in_background(admin_email, admin_subject, admin_body)
    send_email_in_background(user_email, user_subject, user_body)

def send_resolution_email(to_email: str, report_id: int, user_description: str, admin_reply: Optional[str] = None):
    subject = f"[Sử Việt AI] Phản hồi sớ báo cáo sự cố #{report_id} - ĐÃ XỬ LÝ THÀNH CÔNG"
    
    admin_reply_section = ""
    if admin_reply:
        admin_reply_section = f"""
        <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #d97706;">Bút phê / Phản hồi từ Ban Quản Trị:</h4>
          <p style="margin: 0; white-space: pre-wrap; color: #374151; font-weight: bold; font-size: 14px;">{admin_reply}</p>
        </div>
        """

    body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #008000; border-bottom: 2px solid #008000; padding-bottom: 8px;">
          Sớ Phúc Tra Đã Được Duyệt & Xử Lý Thành Công! (Mã sớ: #{report_id})
        </h2>
        <p>Chào bạn,</p>
        <p>Ban quản trị Sử Việt AI xin kính báo: Sớ khai báo sự cố/phúc tra của bạn (Mã sớ: <strong>#{report_id}</strong>) đã được ban quản trị rà soát và xử lý thành công.</p>
        
        {admin_reply_section}

        <div style="background-color: #f9f9f9; border-left: 4px solid #008000; padding: 15px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #008000;">Nội dung sự việc bạn đã báo cáo:</h4>
          <p style="margin: 0; white-space: pre-wrap; font-style: italic; color: #555;">{user_description}</p>
        </div>

        <p><strong>Kết quả xử lý:</strong> Trạng thái của sớ báo cáo đã được chuyển sang <span style="color: #008000; font-weight: bold;">ĐÃ GIẢI QUYẾT (Resolved)</span>. Vui lòng kiểm tra lại tài khoản của bạn (số dư tokens, trạng thái thanh toán hoặc chức năng hệ thống liên quan).</p>
        <p>Nếu bạn vẫn gặp khó khăn hoặc có thắc mắc khác, xin vui lòng gửi phản hồi tiếp tục hoặc liên hệ ban quản trị để được trợ giúp.</p>
        <p>Chân thành cảm ơn sự đóng góp của bạn.</p>
        
        <p style="margin-top: 30px;">Trân trọng,<br/><strong>Ban quản trị Sử Việt AI</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 11px; color: #888;">Thư điện tử tự động gửi từ hệ thống Sử Việt AI. Vui lòng không trả lời thư này.</p>
      </body>
    </html>
    """
    send_email_in_background(to_email, subject, body)

