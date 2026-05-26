- A public URL with no auth means anyone on the internet can use it, not just employees
- also don't think we'd want everyone to see the HR polocy
- add an auth / don't keep potentially harmful stuff on HTML
- "confidently and directly" - potential issue - . An LLM will confidently make up details rather than admit uncertainty. / don't invent policy
- "if you don't know something, do your best to help anyway." - also a potential risk / hallucination
- what if the policies change? - Hardcoded policies in code — Policies change; you'd have to redeploy to update them.
- hr_helpdesk_export.json contains real employee PII - should probably be removed.





- with that in mind:

1.  prompt for claude - (tone + guardrails)
2. Dynamic Policy Context - Instead of hardcoding, load from files: i.e. Here are Paluza's current HR policies. Answer questions based solely on these documents. IMPORTANT: These are the source of truth. Do not add information from your training data.
3. 