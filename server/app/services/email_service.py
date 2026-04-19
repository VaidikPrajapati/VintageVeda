"""
Email Service — Password Reset & Notifications
Uses SMTP via aiosmtplib for reliable email delivery.
"""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


async def send_password_reset_email(to_email: str, user_name: str, reset_token: str):
    """Send a password reset email with a link containing the reset token."""

    # Use path-based URL to avoid query param & encoding issues in email clients
    reset_url = f"{settings.frontend_url}/reset-password/{reset_token}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f0e8; margin: 0; padding: 0; }}
            .container {{ max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, #2D5016 0%, #0F2914 100%); padding: 32px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px; }}
            .header p {{ color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px; }}
            .body {{ padding: 36px 32px; }}
            .body h2 {{ color: #2C1D13; font-size: 20px; margin-bottom: 12px; }}
            .body p {{ color: #5C3D2E; font-size: 15px; line-height: 1.7; }}
            .btn {{ display: inline-block; background: #2D5016; color: #ffffff !important; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 24px 0; }}
            .btn:hover {{ background: #0F2914; }}
            .note {{ background: #faf8f5; border: 1px solid #ede7df; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 13px; color: #888; }}
            .footer {{ text-align: center; padding: 20px 32px; color: #aaa; font-size: 12px; border-top: 1px solid #f0ebe5; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌿 Vintage Veda</h1>
                <p>Ayurvedic Wellness Platform</p>
            </div>
            <div class="body">
                <h2>Password Reset Request</h2>
                <p>Hi {user_name},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="btn">Reset My Password</a>
                </p>
                <div class="note">
                    <strong>⏰ This link expires in 1 hour.</strong><br>
                    If you didn't request this reset, you can safely ignore this email. Your password will remain unchanged.
                </div>
            </div>
            <div class="footer">
                &copy; 2026 Vintage Veda. Built with 🌿 for holistic wellness.
            </div>
        </div>
    </body>
    </html>
    """

    text_body = f"""
Hi {user_name},

We received a request to reset your Vintage Veda password.

Click this link to reset your password:
{reset_url}

This link expires in 1 hour. If you didn't request this, please ignore this email.

— Vintage Veda Team
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "🌿 Reset Your Vintage Veda Password"
    msg["From"] = f"Vintage Veda <{settings.mail_from}>"
    msg["To"] = to_email

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    await aiosmtplib.send(
        msg,
        hostname=settings.mail_server,
        port=settings.mail_port,
        start_tls=True,
        username=settings.mail_username,
        password=settings.mail_password,
    )


async def send_password_reset_confirmation_email(to_email: str, user_name: str):
    """Send confirmation that password was successfully reset."""

    login_url = f"{settings.frontend_url}/auth"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f0e8; margin: 0; padding: 0; }}
            .container {{ max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, #2D5016 0%, #0F2914 100%); padding: 32px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; }}
            .header p {{ color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px; }}
            .body {{ padding: 36px 32px; }}
            .body h2 {{ color: #2C1D13; font-size: 20px; margin-bottom: 12px; }}
            .body p {{ color: #5C3D2E; font-size: 15px; line-height: 1.7; }}
            .btn {{ display: inline-block; background: #2D5016; color: #ffffff !important; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 24px 0; }}
            .note {{ background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 13px; color: #b91c1c; }}
            .footer {{ text-align: center; padding: 20px 32px; color: #aaa; font-size: 12px; border-top: 1px solid #f0ebe5; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌿 Vintage Veda</h1>
                <p>Ayurvedic Wellness Platform</p>
            </div>
            <div class="body">
                <h2>✅ Password Successfully Reset</h2>
                <p>Hi {user_name},</p>
                <p>Your password has been successfully changed. You can now log in with your new password.</p>
                <p style="text-align: center;">
                    <a href="{login_url}" class="btn">Back to Login</a>
                </p>
                <div class="note">
                    <strong>⚠️ Didn't make this change?</strong><br>
                    If you didn't reset your password, please contact us immediately at {settings.mail_from}
                </div>
            </div>
            <div class="footer">
                &copy; 2026 Vintage Veda. Built with 🌿 for holistic wellness.
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "✅ Your Vintage Veda Password Has Been Reset"
    msg["From"] = f"Vintage Veda <{settings.mail_from}>"
    msg["To"] = to_email

    msg.attach(MIMEText(f"Hi {user_name}, your Vintage Veda password has been successfully reset.", "plain"))
    msg.attach(MIMEText(html_body, "html"))

    await aiosmtplib.send(
        msg,
        hostname=settings.mail_server,
        port=settings.mail_port,
        start_tls=True,
        username=settings.mail_username,
        password=settings.mail_password,
    )
