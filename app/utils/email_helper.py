import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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
    payment_id: int,
    username: str,
    description: str,
    amount_vnd: int = None,
    tokens: int = None
):
    # 1. Email to Admin
    admin_subject = f"[Sử Việt AI] Báo cáo sự cố nạp tiền - Hóa đơn #{payment_id}"
    admin_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #800000; border-bottom: 2px solid #800000; padding-bottom: 8px;">
          Báo cáo sự cố nạp tiền mới
        </h2>
        <p>Hệ thống Sử Việt AI vừa nhận được báo cáo từ người dùng:</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 180px; background-color: #f9f9f9;">Mã hóa đơn (Payment ID):</td>
            <td style="padding: 8px; border: 1px solid #ddd;">#{payment_id}</td>
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
          </tr>''' if amount_vnd is not None else ''}
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9; vertical-align: top;">Nội dung sự cố:</td>
            <td style="padding: 8px; border: 1px solid #ddd; white-space: pre-wrap;">{description}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Vui lòng kiểm tra đối soát trên cổng thanh toán SePay và cộng số dư thích hợp cho khách hàng.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 11px; color: #888;">Thư điện tử tự động gửi từ hệ thống Sử Việt AI.</p>
      </body>
    </html>
    """
    
    # 2. Email to User
    user_subject = f"[Sử Việt AI] Đã nhận báo cáo sự cố của bạn cho đơn hàng #{payment_id}"
    user_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #800000; border-bottom: 2px solid #800000; padding-bottom: 8px;">
          Xác nhận tiếp nhận báo cáo sự cố
        </h2>
        <p>Chào <strong>{username}</strong>,</p>
        <p>Sử Việt AI đã nhận được báo cáo sự cố nạp tiền của bạn đối với đơn hàng <strong>#{payment_id}</strong>.</p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #800000; padding: 15px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #800000;">Nội dung báo cáo:</h4>
          <p style="margin: 0; white-space: pre-wrap; font-style: italic; color: #555;">"{description}"</p>
        </div>
        
        <p>Ban quản trị đang tiến hành rà soát giao dịch này. Nếu có sai sót về việc cộng tokens, hệ thống sẽ thực hiện xử lý bổ sung ngay khi xác nhận.</p>
        <p>Cảm ơn bạn đã đóng góp thông tin để cải thiện hệ thống. Nếu có thắc mắc khác, vui lòng liên hệ lại với chúng tôi.</p>
        
        <p style="margin-top: 30px;">Trân trọng,<br/><strong>Ban quản trị Sử Việt AI</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 11px; color: #888;">Thư điện tử tự động gửi từ hệ thống Sử Việt AI. Vui lòng không trả lời thư này.</p>
      </body>
    </html>
    """

    # Send both
    send_email_in_background(admin_email, admin_subject, admin_body)
    send_email_in_background(user_email, user_subject, user_body)
