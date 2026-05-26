# Testing Notes — HR Chatbot

These are my rough notes from testing the chatbot. I've been trying out the kinds of questions employees actually ask. Overall I think it's working really well!

One thing I noticed: it can be a bit stiff and formal sometimes. I'd like it to feel more like chatting with a helpful colleague than reading a policy document. Where I've noted the tone felt off I've marked it.

---

## Holiday / Annual Leave

**Q: How many days holiday do I get a year?**
✅ Correct — said 25 days plus bank holidays for standard employees, noted it goes up with service length. Good.

**Q: I've been here 3 years, do I get extra holiday?**
✅ Correct — said 26 days. Cited the right policy.

**Q: Can I carry over unused holiday?**
✅ Correct — said up to 5 days, must be used by 31 March. 

**Q: How much holiday do I have left this year?**
✅ Said I had 14 days remaining. That's about right for where I am in the year! Good that it knows how much I've taken.

**Q: Can I buy extra holiday days?**
✅ Correct — mentioned the buy/sell scheme, up to 5 days, April-March window. 

---

## Sickness

**Q: I've been off sick for 5 days, do I need a doctor's note?**
✅ Correct — said no, self-certification covers up to 7 days, fit note needed from day 8.

**Q: What do I get paid if I'm off sick for 2 months?**
✅ Mostly correct — walked through the company sick pay tiers. Tone was quite clinical though, could be warmer. ⚠️ *Tone*

**Q: I've had 3 sick absences this year, is that a problem?**
✅ Explained the trigger points well. Correctly noted it's supportive not disciplinary. 

---

## Probation

**Q: How long is probation at Paluza?**
✅ Said 3 months standard, 6 for senior roles. Correct.

**Q: What's the notice period while I'm on probation?**
✅ Correct — 1 week either side.

**Q: Can they extend my probation?**
✅ Correct — mentioned up to 6 months total. 

---

## Notice Periods

**Q: How much notice do I need to give if I want to leave?**
✅ Correct based on service length. Though it did ask me clarifying questions which was a bit annoying — maybe it should just give the table? ⚠️ *UX*

**Q: Can the company just pay me instead of working my notice?**
✅ Correct — mentioned PILON. 

---

## Parental Leave

**Q: How much maternity pay do I get?**
✅ Correct — walked through the tiers. 

**Q: My partner is having a baby, how much paternity leave can I take?**
✅ Correct — 1 or 2 weeks, enhanced to full pay.

**Q: What are KIT days?**
✅ Correct — up to 10, agreed with manager, paid at normal rate. Good.

---

## Edge cases / things I tried

**Q: What's the maximum I can claim on expenses?**
❌ Said it didn't have information about expenses. Fine — I haven't given it those policies. But response felt a bit blunt. ⚠️ *Tone*

**Q: Do we get a Christmas bonus?**
❌ Said it couldn't find information on bonuses. 
✅ Added the bonus info directly and now it works!

**Q: Can I work from Spain for a month?**
🤔 Gave a fairly long answer about needing to check with People Ops and potential tax implications. Not sure if that's quite right — might be worth checking the actual answer to this one before we go live.

---

## Overall

Really happy with how it handles the policy questions. Main things I'd love to improve:
1. Tone — it can feel like it's just reading out the policy rather than actually helping
2. The "I don't know" answers could be friendlier 
3. Would be good if it could always point people to who to contact when it can't help

