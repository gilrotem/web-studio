# The one message to the client — template

Built from the gaps table in `docs/content/map/INDEX.md`, after the Art Director's yes to the
map. Save the filled draft as `docs/content/client-message-<date>.md`. The Art Director
approves the text and sends it himself. The agent never sends it.

## How to fill it

- One numbered item per "ask" row of the gaps table. Rows that ask for the same thing in two
  places (a phone number in the footer and on the contact page) are one item.
- Then one numbered item per line of "Awaiting the client's confirmation": facts known only
  from the previous site, offers and promises found in the client's own texts. Each must be
  answerable with yes or no. Quote the wording exactly as it appears.
- No "write" row becomes a question. They are covered by the one closing sentence.
- Plain words in the client's language. No marker words, no file names from the map, no area
  names, no studio terms.
- A wrong or duplicated file is named exactly: the file name received, the text it holds, the
  text that is needed.
- Drop a group that has no items. Keep the numbering continuous across groups, so an answer
  can be "3: ..., 5: yes".
- Short. If it does not fit one screen, the gaps table still holds rows the judgement pass
  should have closed.
- Replace every `{{...}}`. Nothing in braces may reach the client.

## The message (Hebrew, the default market)

```
שלום {{שם הלקוח}},

עברנו על כל החומרים שהעברתם ומיפינו את תוכן האתר, עמוד אחרי עמוד. רוב התוכן קיים.
כדי להשלים את התמונה חסרים לנו {{מספר}} דברים שרק אתם יכולים לתת.
אפשר לענות בהודעה חוזרת, מספר אחרי מספר.

פרטים
1. {{פרט חסר}}
2. {{פרט חסר}}

טקסטים וקבצים
3. {{טקסט חסר: שם העמוד, ומה בדיוק חסר בו}}
4. {{קובץ או תמונה חסרים}}

לאישור: כן או לא
הפרטים הבאים מופיעים באתר הקודם או בטקסטים שהעברתם. הם ייכנסו לאתר החדש רק אם תאשרו.
5. {{פרט לאישור, כפי שהוא מופיע}} - עדיין נכון?
6. "{{הצעה או הבטחה, בניסוח המקורי}}" - להשאיר?

מה שעדיין לא ידוע, כתבו לידו "בהמשך" ונתקדם בינתיים עם השאר.

את הטקסטים הקצרים של האתר ({{למשל: תפריט, כפתורים, הודעות הטופס, מדיניות פרטיות והצהרת נגישות}})
נכתוב אנחנו ונעביר לאישורכם.

תודה,
{{שם השולח}}
```

## Wording for common items

| Gap | Line |
|---|---|
| Email | `כתובת המייל שאליה יגיעו הפניות מהאתר.` |
| Address and hours | `כתובת המשרד ושעות הפעילות, כפי שתרצו שיופיעו באתר.` |
| Credentials | `מספר רישיון, שנות ניסיון, השכלה וחברות בארגונים מקצועיים. בטקסטים כתוב "ניסיון רב" בלי פירוט.` |
| A wrong file | `הטקסט של העמוד "{{שם העמוד}}". הקובץ שקיבלנו בשם הזה מכיל את הטקסט של "{{שם העמוד האחר}}".` |
| A photo | `תמונה של {{מי}}, באישור לשימוש באתר.` |
| Accessibility contact | `שם, טלפון ומייל של מי שמטפל בפניות בנושא נגישות (נדרש להצהרת הנגישות).` |
| A phone number to confirm | `מספר הטלפון {{המספר}}` |

## After it is sent

Write the send date under `## Notes` in `docs/content/map/INDEX.md`. When the answer arrives,
file it as the skill's "Filing the answers" section says: the answer verbatim into
`docs/content/source/answers/`, each item into its area, markers changed, indexes rebuilt.
