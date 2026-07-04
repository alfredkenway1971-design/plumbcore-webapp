def send_email(pdf_path, target_date):
    """Email the PDF report using msmtp + mutt with proper display name."""
    EMAIL_FROM_NAME = "Alfred Kenway"
    EMAIL_FROM = "alfredkenway1971@gmail.com"
    EMAIL_TO = "amer.niyonzima@gmail.com"
    
    subject = f"Daily API Cost Report — {target_date} (DeepSeek + OpenRouter)"
    body = f"""Hi Amer,

Here's your combined daily cost report for {target_date}.

This report includes BOTH DeepSeek AND OpenRouter API consumption:
• Token usage per model (input, output, cache)
• API call counts
• Estimated cost per model
• DeepSeek account balance
• OpenRouter remaining credits

Generated automatically by your PlumbCore AI cron job.

— Alfred 🤖"""

    cmd = f'echo "{body}" | mutt -e \'set from="{EMAIL_FROM_NAME} <{EMAIL_FROM}>"\' -s "{subject}" -a {pdf_path} -- {EMAIL_TO}'
    result = os.system(cmd)
    return result == 0