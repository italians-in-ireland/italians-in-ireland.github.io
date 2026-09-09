
const DATA = window.__SITEDATA__.DATA;
const LOCATIONS = window.__SITEDATA__.LOCATIONS;
const PHOTOS = window.__SITEDATA__.PHOTOS;


const HIST_TILES = window.__SITEDATA__.HIST_TILES;

// ============================================================
// i18n: EN/ITA toggle. Site defaults to English; the underlying
// database text (people, places, event notes) is Italian, so the
// approach is: (1) static interface chrome is duplicated via
// data-en attributes on the elements themselves (see applyStaticI18n,
// run once near the end of this script); (2) short fixed labels
// generated in JS use TT(en, it); (3) the free-text event sentences
// baked into DATA ("Nascita, figlio di ... Informante: ...") are
// translated live by a phrase-substitution table (EVENT_EN_RULES
// below) applied inside renderText() -- this is a rule-based
// translator for a controlled, formulaic vocabulary (birth/death/
// marriage/census formulas), not a general-purpose translator: a
// small number of one-off free-form curator notes (rare unique
// biographical remarks) may remain partly in Italian after
// translation. Chosen language is kept in sessionStorage and the
// page reloads on toggle, so every part of the app (including the
// map, timeline and charts) is guaranteed to render consistently in
// one language rather than a stale mix of the two.
// ============================================================
let LANG = (function(){
  try { return sessionStorage.getItem("appLang") || "en"; } catch(e){ return "en"; }
})();
try { document.documentElement.lang = LANG; } catch(e){}
function TT(en, it){ return LANG==="en" ? en : it; }
function setLang(l){
  if(l===LANG) return;
  try { sessionStorage.setItem("appLang", l); } catch(e){}
  location.reload();
}
const EVENT_EN_RULES = [
["Nascita, figlio primogenito di ","Birth, firstborn son of "],
["Nascita, figlio/a di ","Birth, son/daughter of "],
["Nascita, figlio di ","Birth, son of "],
["Nascita, figlia di ","Birth, daughter of "],
["Nascita, ipotizzata figlia di ","Birth, hypothesized daughter of "],
["Nascita a Belfast, figlio di ","Birth in Belfast, son of "],
["Nascita a Belfast, figlia di ","Birth in Belfast, daughter of "],
["Nascita a Belfast","Birth in Belfast"],
["Nascita in Italia","Birth in Italy"],
["Nascita in Inghilterra","Birth in England"],
["Nascita del figlio ","Birth of the son "],
["Nascita della figlia ","Birth of the daughter "],
["Nascita; luogo esatto sconosciuto, età dichiarata di ","Birth; exact place unknown, stated age of "],
["Nascita di ","Birth of "],
["Nascita\\. Informante: ","Birth. Informant: "],
["Nascita$","Birth"],
["Nascita,","Birth,"],
["Nasce il figlio/la figlia ","Birth of the son/daughter, "],
["Nasce \\(probabilmente\\) il figlio ","Birth (probably) of the son "],
["Nasce il figlio ","Birth of the son "],
["Nasce la figlia ","Birth of the daughter "],
["poi chirurgo","later a surgeon"],
["non ancora profilat[oa]","not yet profiled"],
["morto? bambin[oa] nel ","died as a child in "],
["nata l'anno precedente","born the previous year"],
["morta infante","died as an infant"],
["\\(morta infante\\)","(died as an infant)"],
["identità non risolta — nessuna corrispondenza trovata nei censimenti","identity unresolved — no match found in the censuses"],
["possibile identità","possible identity"],
["poi deceduta come","later deceased as"],
["non registrato con questo nome alla nascita fra i risultati trovati","not recorded under this name at birth among the results found"],
["nato lo stesso anno","born the same year"],
["non confermata da atto di nascita","not confirmed by birth certificate"],
["\\(ipotesi, non confermata da atto di nascita\\)","(hypothesis, not confirmed by birth certificate)"],
["il padre è l'informante","the father is the informant"],
["Figlio di ","Son of "],
["Figlia di ","Daughter of "],
["Muore \\(probabilmente\\) un figlio neonato, ","Dies (probably) a newborn son, "],
["Muore in tenera età la figlia ","Dies in infancy the daughter "],
["Muore in tenera età","Dies in infancy"],
["Muore in infanzia la figlia ","Dies in infancy the daughter "],
["Muore in guerra il figlio ","Dies in the war, the son "],
["Muore il figlio/la figlia ","Death of the son/daughter "],
["Muore il figlio ","Death of the son "],
["Muore la figlia ","Death of the daughter "],
["Muore il marito ","Death of the husband "],
["Muore la moglie ","Death of the wife "],
["Muore il padre ","Death of the father "],
["Muore la madre ","Death of the mother "],
["Muore la madre$","Death of the mother"],
["Muore la sorella ","Death of the sister "],
["Muore, (\\d+) anni, poco dopo il censimento del (\\d+ \\w+)","Dies, age $1, shortly after the census of $2"],
["Muore a ([\\w\\s\\-]+?), vedovo, a (\\d+)","Dies at $1, widower, at age $2"],
["Muore a ([\\w\\s\\-]+?), a (\\d+)","Dies at $1, age $2"],
["Muore a ([\\w\\s\\-]+?), noto come","Dies at $1, known as"],
["Muore a ([\\w\\s\\-]+)$","Dies at $1"],
["Muore a (\\d+) anni per ","Dies at age $1 of "],
["Muore a (\\d+)[\\s\\-]+(\\d+) anni","Dies at age $1-$2"],
["Muore a (\\d+) anni","Dies at age $1"],
["informante la figlia","informant: the daughter"],
["Muore$","Dies"],
["Morte in infanzia","Death in infancy"],
["Matrimonio della figlia ","Marriage of the daughter "],
["Matrimonio del figlio ","Marriage of the son "],
["Matrimonio con ","Marriage to "],
["Matrimonio di ","Marriage of "],
["Matrimonio\\. Testimone: ","Marriage. Witness: "],
["Matrimonio$","Marriage"],
["Testimone alle nozze della sorella ","Witness at the wedding of the sister "],
["Testimoni: ","Witnesses: "],
["Testimone: ","Witness: "],
["testimoni ","witnesses "],
["seconde nozze di lui, dopo la presunta morte di ","his second marriage, after the presumed death of "],
["sposato con ","married to "],
["sposata con ","married to "],
["\\(coerente con il matrimonio del (\\d+)\\)","(consistent with the $1 marriage)"],
["sposati da (\\d+) anni al censimento","married for $1 years at the census"],
["\\(sposati da (\\d+) anni al censimento (\\d+)\\)","(married for $1 years at the $2 census)"],
["\\(data calcolata da \"Years Married: (\\d+)\" nel censimento (\\d+)\\)","(date calculated from \"Years Married: $1\" in the $2 census)"],
["\\(registrazione civile\\)","(civil registration)"],
["(\\d+) anni di matrimonio al censimento (\\d+)","$1 years of marriage at the $2 census"],
["(\\d+) anni di matrimonio nel (\\d+)","$1 years of marriage in $2"],
["(\\d+) anno di matrimonio dichiarato nel (\\d+)","$1 year of marriage declared in $2"],
["(\\d+) figli nati e viventi","$1 children born and living"],
["figli nati","children born"],
["figlio nato","child born"],
[", (\\d+) vivent[ei]",", $1 living"],
["/ (\\d+) viventi","/ $1 living"],
["Emigrazione in Irlanda dalla Basilicata; figlio di ","Emigration to Ireland from Basilicata; son of "],
["Emigrazione in Irlanda \\(Belfast\\), prima del matrimonio","Emigration to Ireland (Belfast), before the marriage"],
["Emigrazione in Irlanda","Emigration to Ireland"],
["Emigrazione a ([^,]+) con la famiglia","Emigration to $1 with the family"],
["Si trasferisce con il marito e la famiglia da Roma a Dublino","Moves with her husband and family from Rome to Dublin"],
["Si trasferisce con la famiglia da Roma a Dublino","Moves with the family from Rome to Dublin"],
["Trasferimento a ([^\\s]+(?: [^\\s,]+)?) con la famiglia","Move to $1 with the family"],
[", contadino",", farmer"],
["Battesimo presso ","Baptism at "],
["Censimento; (\\d+) and (\\d+) months anni","Census; $1 years $2 months old"],
["Censimento; (\\d+) and (\\d+) month anni","Census; $1 years $2 month old"],
["Censimento; (\\d+) months anni","Census; $1 months old"],
["Censimento; (\\d+) anni","Census; age $1"],
["Censimento (\\d+); domestico presso la famiglia ([^;]+); (\\d+) anni; celibe","Census $1; servant with the $2 family; age $3; unmarried"],
["Censimento (\\d+); domestico \\(servant\\) presso ([^;]+); (\\d+) anni; celibe; sa solo leggere","Census $1; servant with $2; age $3; unmarried; can only read"],
["Censimento (\\d+); domestico \\(servant\\) presso ","Census $1; servant with "],
["Censimento (\\d+); pensionante presso ([^;]+); (\\d+) anni; celibe; mosaicista","Census $1; lodger with $2; age $3; unmarried; mosaicist"],
["Censimento (\\d+); religiosa \\(Member of Community\\) in un convento internazionale; (\\d+) anni; nubile","Census $1; religious (Member of Community) in an international convent; age $2; unmarried"],
["Censimento (\\d+); figlio di ([^;]+) e ([^;]+); (\\d+) anni; celibe; scolaro","Census $1; son of $2 and $3; age $4; unmarried; schoolboy"],
["Censimento (\\d+); figlia di ([^;]+) e ([^;]+); (\\d+) anni; nubile; scolara","Census $1; daughter of $2 and $3; age $4; unmarried; schoolgirl"],
["Censimento (\\d+); figlio di ([^;]+) e ([^;]+); (\\d+) anni; celibe","Census $1; son of $2 and $3; age $4; unmarried"],
["Censimento (\\d+); figlia di ([^;]+) e ([^;]+); (\\d+) anni; nubile","Census $1; daughter of $2 and $3; age $4; unmarried"],
["Censimento (\\d+); figlia di ([^;]+) e ([^;]+); (\\d+) anno","Census $1; daughter of $2 and $3; age $4"],
["Censimento (\\d+); figlia di ([^;]+) e ([^;]+)","Census $1; daughter of $2 and $3"],
["Censimento (\\d+); figlio di ([^;]+) e ([^;]+)","Census $1; son of $2 and $3"],
["Censimento (\\d+); figlia; (\\d+) anni; scolara","Census $1; daughter; age $2; schoolgirl"],
["Censimento (\\d+); figlio; (\\d+) anni; scolaro","Census $1; son; age $2; schoolboy"],
["Censimento (\\d+); figlia; (\\d+) anni; sa leggere e scrivere","Census $1; daughter; age $2; can read and write"],
["Censimento (\\d+); figlio; (\\d+) anni; analfabeta","Census $1; son; age $2; illiterate"],
["Censimento (\\d+); figlia; (\\d+) anni","Census $1; daughter; age $2"],
["Censimento (\\d+); figlio; (\\d+) anni","Census $1; son; age $2"],
["Censimento (\\d+); figlio; ","Census $1; son; "],
["Censimento (\\d+); moglie di ([^;]+); (\\d+) anni; sposata da (\\d+) anni; (\\d+) figlio nato, (\\d+) vivente","Census $1; wife of $2; age $3; married for $4 years; $5 child born, $6 living"],
["Censimento (\\d+); moglie di ([^;]+); (\\d+) anni; sposata da (\\d+) anni; (\\d+) figli nati, (\\d+) viventi","Census $1; wife of $2; age $3; married for $4 years; $5 children born, $6 living"],
["Censimento (\\d+); moglie di ([^;]+); (\\d+) anni; analfabeta","Census $1; wife of $2; age $3; illiterate"],
["Censimento (\\d+); moglie del capofamiglia; (\\d+) anni; sposata \\((\\d+) anni\\); (\\d+) figli nati, (\\d+) viventi","Census $1; wife of the head of household; age $2; married ($3 years); $4 children born, $5 living"],
["Censimento (\\d+); moglie del capofamiglia; (\\d+) anni; sposata da (\\d+) anni \\(coerente con il matrimonio del (\\d+)\\), (\\d+) figli nati e viventi","Census $1; wife of the head of household; age $2; married for $3 years (consistent with the $4 marriage), $5 children born and living"],
["Censimento (\\d+); moglie del capofamiglia; (\\d+) anni; sposata","Census $1; wife of the head of household; age $2; married"],
["Censimento (\\d+); capofamiglia; (\\d+) anni; sposato","Census $1; head of household; age $2; married"],
["Censimento (\\d+); fratello del capofamiglia, lo assiste nell'attività; (\\d+) anni; celibe","Census $1; brother of the head of household, assists him in his work; age $2; unmarried"],
["Censimento (\\d+); detenuto al ([^;]+); (\\d+) anni; celibe","Census $1; detained at $2; age $3; unmarried"],
["Censimento (\\d+); nipote \\(nephew\\) nella casa dello zio ([^;]+); (\\d+) anni; celibe","Census $1; nephew (nephew) in the house of his uncle $2; age $3; unmarried"],
["Censimento (\\d+); servitore \\(Butler\\) nella casa di ([^;]+); (\\d+) anni; celibe","Census $1; servant (Butler) in the house of $2; age $3; unmarried"],
["Censimento (\\d+); unico residente registrato \\(Lodger\\); (\\d+) anni; celibe","Census $1; only recorded resident (Lodger); age $2; unmarried"],
["Censimento; (\\d+) anni, lodger nella casa di ([^,]+), \"Cannot Read\"","Census; age $1, lodger in the house of $2, \"Cannot Read\""],
["Censimento; (\\d+) anni, lodger nella casa di ([^,]+), sposato, \"Cannot Read\"","Census; age $1, lodger in the house of $2, married, \"Cannot Read\""],
["Censimento (\\d+); capofamiglia; (\\d+) anni; sposato con ([^;]+); figli (.+)$","Census $1; head of household; age $2; married to $3; children $4"],
["Censimento (\\d+); moglie del capofamiglia; (\\d+) anni; sposata da (\\d+) anni \\(coerente con il matrimonio del (\\d+)\\), (\\d+) figli nati e viventi","Census $1; wife of the head of household; age $2; married for $3 years (consistent with the $4 marriage), $5 children born and living"],
["Censimento; (\\d+) anni, moglie del capofamiglia, sposata","Census; age $1, wife of the head of household, married"],
["Censimento; (\\d+) and (\\d+) months anni, Married \\((\\d+) years and (\\d+) months\\), capofamiglia","Census; $1 years $2 months old, Married ($3 years $4 months), head of household"],
["Censimento; (\\d+) and (\\d+) month anni, Married \\((\\d+) years and (\\d+) months\\), capofamiglia","Census; $1 years $2 month old, Married ($3 years $4 months), head of household"],
["Censimento; (\\d+) anni, Married \\((\\d+) years and (\\d+) months\\), capofamiglia","Census; age $1, Married ($2 years $3 months), head of household"],
["Censimento; (\\d+) anni, Married \\((\\d+) Years\\), capofamiglia","Census; age $1, Married ($2 Years), head of household"],
["Censimento; (\\d+) anni, Married \\((\\d+) years\\), capofamiglia","Census; age $1, Married ($2 years), head of household"],
["Censimento; (\\d+) anni, Married \\((\\d+) year\\), capofamiglia","Census; age $1, Married ($2 year), head of household"],
["Censimento; (\\d+) and (\\d+) months anni, Married, capofamiglia","Census; $1 years $2 months old, Married, head of household"],
["Censimento; (\\d+) and (\\d+) months anni, Single, capofamiglia","Census; $1 years $2 months old, Single, head of household"],
["Censimento; (\\d+) and (\\d+) months anni, Widower, capofamiglia","Census; $1 years $2 months old, Widower, head of household"],
["Censimento; (\\d+) and (\\d+) months anni, Both Parents Alive, capofamiglia","Census; $1 years $2 months old, Both Parents Alive, head of household"],
["Censimento; (\\d+) and (\\d+) months anni, Both Parents Alive","Census; $1 years $2 months old, Both Parents Alive"],
["Censimento; (\\d+) months anni, Both Parents Alive, capofamiglia","Census; $1 months old, Both Parents Alive, head of household"],
["Censimento; (\\d+) anni, Married, capofamiglia","Census; age $1, Married, head of household"],
["Censimento; (\\d+) anni, Single, capofamiglia","Census; age $1, Single, head of household"],
["Censimento; (\\d+) anni, Not Married, capofamiglia","Census; age $1, Not Married, head of household"],
["Censimento; (\\d+) anni, Widow, capofamiglia","Census; age $1, Widow, head of household"],
["Censimento; (\\d+) anni, Widower, capofamiglia","Census; age $1, Widower, head of household"],
["Censimento; (\\d+) anni, Both Parents Alive, capofamiglia","Census; age $1, Both Parents Alive, head of household"],
["Censimento; (\\d+) anni, figlio del capofamiglia","Census; age $1, son of the head of household"],
["Censimento; (\\d+) anni, figlia del capofamiglia","Census; age $1, daughter of the head of household"],
["Censimento; (\\d+) anni, figlio, \"Deaf or Dumb\"","Census; age $1, son, \"Deaf or Dumb\""],
["Censimento; (\\d+) anni, sarta; capofamiglia il padre, vedovo","Census; age $1, seamstress; head of household is the father, widower"],
["Censimento; (\\d+) anni, Married$","Census; age $1, Married"],
["Censimento; (\\d+) anni, Single$","Census; age $1, Single"],
["Censimento; (\\d+) anni, Not Married$","Census; age $1, Not Married"],
["Censimento; (\\d+) anni, Widow$","Census; age $1, Widow"],
["Censimento; (\\d+) anni, Widower$","Census; age $1, Widower"],
["Censimento; (\\d+) anni$","Census; age $1"],
["Censimento; Married, capofamiglia","Census; Married, head of household"],
["Censimento$","Census"],
["Boarder presso ","Boarder with "],
["capofamiglia: ","head of household: "],
["capofamiglia","head of household"],
["Capofamiglia, (\\d+) anni; con la moglie ","Head of household, age $1; with the wife "],
["Con il padre ([^,]+), capofamiglia; (\\d+) anni","With the father $1, head of household; age $2"],
["Con il marito ([^,]+), capofamiglia; (\\d+) anni; (\\d+) anni di matrimonio; (\\d+) figli nati, (\\d+) viventi","With the husband $1, head of household; age $2; $3 years of marriage; $4 children born, $5 living"],
["Capofamiglia; con la moglie ([^;]+) e i figli (.+); (\\d+) anni","Head of household; with the wife $1 and children $2; age $3"],
["Moglie del capofamiglia ([^,]+), (\\d+) anni","Wife of the head of household $1, age $2"],
["Moglie del capofamiglia ([^;]+); (\\d+) anni, Married \\((\\d+) anni\\), (\\d+) figli nati / (\\d+) viventi","Wife of the head of household $1; age $2, Married ($3 years), $4 children born / $5 living"],
["Figlia; (\\d+) anni, Single, scolara","Daughter; age $1, Single, schoolgirl"],
["Sposa ","Marries "],
["padre ","father "],
["Stesso lotto del padre","Same plot as the father"],
["Ritratta come","Depicted as"],
["nell'opera del marito","in her husband's work"],
["registrato erroneamente come","incorrectly recorded as"],
["\\]\\] e \\[\\[","]] and [["],
["Informante: ","Informant: "],
["informante: ","informant: "],
["Presente in BSD — stessa sede confermata","Present in BSD — same location confirmed"],
["Censimento (\\d{4})","Census $1"],
["Censimento","Census"],
["nella casa n\\. (\\d+) di ","in house no. $1 of "],
["nella casa di ","in the house of "],
["nella casa dell[oa] ","in the house of the "],
["in una casa/comunità religiosa","in a religious house/community"],
["capofamiglia","head of household"],
["\\bpresso\\b","at"],
["\\bfigli[oa]/a\\b","son/daughter"],
["\\bfiglio di\\b","son of"],
["\\bfiglia di\\b","daughter of"],
["\\bfratello del\\b","brother of the"],
["\\bfratello\\b","brother"],
["\\bsorella\\b","sister"],
["\\bmoglie di\\b","wife of"],
["\\bmoglie non presente nel nucleo\\b","wife not present in the household"],
["\\bmoglie\\b","wife"],
["\\bmarito\\b","husband"],
["\\bnipote del\\b","grandchild/nephew of the"],
["\\bnipote della\\b","grandchild/niece of the"],
["\\bnipote\\b","grandchild/nephew/niece"],
["\\bnonni materni\\b","maternal grandparents"],
["\\bservitore\\b","servant"],
["\\bservitrice\\b","servant"],
["\\bdomestica\\b","maid"],
["\\bdomestico\\b","servant"],
["\\bpensionante\\b","lodger"],
["\\bospite\\b","guest"],
["\\bcelibe\\b","unmarried"],
["\\bnubile\\b","unmarried"],
["\\bsposat[oa]\\b","married"],
["\\bvedov[oa]\\b","widow(er)"],
["\\bsa leggere e scrivere\\b","can read and write"],
["\\bsa solo leggere\\b","can only read"],
["\\bnon sa leggere né scrivere\\b","cannot read or write"],
["\\banalfabeta\\b","illiterate"],
["\\bparla italiano\\b","speaks Italian"],
["\\breligione valdese\\b","Waldensian religion"],
/*EXTRA_RULES*/
["^(\\s*)e(\\s+)","$1and$2"],
["(\\s+)e(\\s*)$","$1and$2"],
["\\bCensimento\\b","Census"],
["\\bcensimento\\b","census"],
["\\bCapofamiglia\\b","Head of household"],
["\\(( *)(\\d+) anni\\)","($2 years)"],
["\\bda (\\d+) anni\\b","for $1 years"],
["(\\d+) anni e (\\d+) mes[ei]","$1 years and $2 months"],
["(\\d+) anni di matrimonio","$1 years of marriage"],
["\\betà non indicata\\b","age not stated"],
["\\betà non trascritta\\b","age not recorded"],
["\\bin tenera età\\b","at a very young age"],
["\\betà\\b","age"],
["\\bnon sa ancora leggere\\b","cannot read yet"],
["\\bnon ancora in grado di leggere\\b","not yet able to read"],
["\\bnon ancora scolarizzat[oa]\\b","not yet at school"],
["\\bnon sa leggere né scrivere\\b","cannot read or write"],
["\\bnon sa leggere\\b","cannot read"],
["\\bnon presente nel nucleo\\b","not present in the household"],
["\\bnon convivente\\b","not living in the household"],
["\\bnon trascritt[oa]\\b","not recorded"],
["\\bnon indicat[oa]\\b","not stated"],
["\\bnon identificat[oa]\\b","not identified"],
["\\bnessuna occupazione dichiarata\\b","no occupation declared"],
["\\bsecondo il census\\b","according to the census"],
["\\bsecondo il censimento\\b","according to the census"],
["\\bdichiarat[oaie]\\b","declared"],
["\\bregistrat[oa] come\\b","recorded as"],
["\\bregistrat[oa]\\b","recorded"],
["\\btrascritt[oa] come\\b","recorded as"],
["\\btrascritt[oa]\\b","recorded"],
["\\bi figli\\b","the children"],
["\\bcol figlio\\b","with the son"],
["\\bcol marito\\b","with the husband"],
["\\bcolla moglie\\b","with the wife"],
["\\bconvivente con\\b","living with"],
["\\bconvivente col\\b","living with the"],
["\\bconvivente\\b","living in the same household"],
["\\bfigli tutti viventi\\b","children all living"],
["\\btutti viventi\\b","all living"],
["\\bfigli\\b","children"],
["\\bfiglio\\b","son"],
["\\bfiglia\\b","daughter"],
["\\bfiglie\\b","daughters"],
["\\bmadre di\\b","mother of"],
["\\bmadre\\b","mother"],
["\\bil padre\\b","the father"],
["\\bpadre\\b","father"],
["\\bnuora\\b","daughter-in-law"],
["\\bgenero\\b","son-in-law"],
["\\bcognat[oa]\\b","in-law"],
["\\bparente\\b","relative"],
["\\bMadrina\\b","Godmother"],
["\\bPadrino\\b","Godfather"],
["\\bmatrimonio misto\\b","mixed marriage"],
["\\bmatrimonio\\b","marriage"],
["\\bnascita\\b","birth"],
["\\bmorte\\b","death"],
["\\bsepoltura\\b","burial"],
["\\bbattesimo\\b","baptism"],
["\\bresidenza\\b","residence"],
["\\btrasferimento\\b","move"],
["\\bnat[oa] a\\b","born in"],
["\\bnat[oa]\\b","born"],
["\\bnati\\b","born"],
["\\bscolar[oa]\\b","at school"],
["\\bstudente\\b","student"],
["\\bstudentessa\\b","student"],
["\\bsarta\\b","seamstress"],
["\\bmarmista\\b","marble worker"],
["\\bmosaicista\\b","mosaicist"],
["\\bfabbricante di statue\\b","statue maker"],
["\\bvenditore di gelati\\b","ice-cream vendor"],
["\\bgovernante\\b","governess"],
["\\bconsole reale d'Italia\\b","Royal Consul of Italy"],
["\\bchirurgo\\b","surgeon"],
["\\breligios[oa]\\b","member of a religious order"],
["\\breligione\\b","religion"],
["\\bconversione\\b","conversion"],
["\\bcomunità\\b","community"],
["\\bfondazione\\b","foundation"],
["\\bbilingue italiano-inglese\\b","bilingual Italian-English"],
["\\bcasa d'affitto\\b","lodging house"],
["\\bpensionanti\\b","lodgers"],
["\\bnumerosi altri\\b","numerous other"],
["\\bvisitatore\\b","visitor"],
["\\bgestito da\\b","run by"],
["\\bgestore\\b","manager"],
["\\bgrande albergo\\b","large hotel"],
["\\bin assenza del\\b","in the absence of the"],
["\\bin assenza di\\b","in the absence of"],
["\\bunico membro\\b","only member"],
["\\bnucleo\\b","household"],
["\\bla famiglia\\b","the family"],
["\\bfamiglia\\b","family"],
["\\blavoratrice in proprio\\b","self-employed"],
["\\bin proprio\\b","self-employed"],
["\\bmesi\\b","months"],
["\\bmese\\b","month"],
["\\bprima del\\b","before the"],
["\\bprima di\\b","before"],
["\\bdopo il\\b","after the"],
["\\bdopo la\\b","after the"],
["\\bdopo\\b","after"],
["\\bancora\\b","still"],
["\\bcirca\\b","about"],
["\\bprobabilmente\\b","probably"],
["\\bprobabile\\b","probable"],
["\\bsenza\\b","without"],
["\\bCon\\b","With"],
["\\bcon\\b","with"],
["\\bcol\\b","with the"],
["\\bnella\\b","in the"],
["\\bnello\\b","in the"],
["\\bnelle\\b","in the"],
["\\bnei\\b","in the"],
["\\bnel\\b","in the"],
["\\bdalla\\b","from the"],
["\\bdallo\\b","from the"],
["\\bdalle\\b","from the"],
["\\bdagli\\b","from the"],
["\\bdai\\b","from the"],
["\\bdei\\b","of the"],
["\\bdelle\\b","of the"],
["\\bdegli\\b","of the"],
["\\bdell'","of the "],
["\\ball'","at the "],
["\\bun[oa]?\\b","a"],
["\\bmа\\b","but"],
["\\bma\\b","but"],
["\\btre\\b","three"],
["\\bdue\\b","two"],
["\\bFiglia\\b","Daughter"],
["\\bFiglio\\b","Son"],
["\\bFigli\\b","Children"],
["\\bMorte della moglie\\b","Death of the wife"],
["\\bMorte del marito\\b","Death of the husband"],
["\\bMorte\\b","Death"],
["\\bNascita\\b","Birth"],
["\\bMatrimonio\\b","Marriage"],
["\\bTrasferimento\\b","Move"],
["\\bSepoltura\\b","Burial"],
["\\bBattesimo\\b","Baptism"],
["\\bResidenza\\b","Residence"],
["\\bDeceduт?[oa]\\b","Deceased"],
["\\bDeceduta\\b","Deceased"],
["\\bDeceduto\\b","Deceased"],
["\\bVedov[oa]\\b","Widow(er)"],
["\\bEmigrazione dall'Italia\\b","Emigration from Italy"],
["\\bEmigrazione\\b","Emigration"],
["\\bprima della\\b","before the"],
["\\bprima moglie\\b","first wife"],
["\\bprima\\b","before"],
["\\bnon è presente\\b","is not present"],
["\\bnon è\\b","is not"],
["\\bnon risulta\\b","is not recorded"],
["\\bnon nota\\b","not known"],
["\\bnon reperito\\b","not found"],
["\\bnessun atto reperito\\b","no record found"],
["\\bnon\\b","not"],
["\\bzio\\b","uncle"],
["\\bzia\\b","aunt"],
["\\bnonno\\b","grandfather"],
["\\bnonna\\b","grandmother"],
["\\bsua\\b","his/her"],
["\\bsuo\\b","his/her"],
["\\bloro\\b","their"],
["\\bluogo\\b","place"],
["\\bcoi\\b","with the"],
["\\balla\\b","at the"],
["\\ballo\\b","at the"],
["\\balle\\b","at the"],
["\\bagli\\b","to the"],
["\\bai\\b","to the"],
["\\bper\\b","for"],
["\\bfra\\b","among"],
["\\btra\\b","among"],
["\\bgià\\b","already"],
["\\bdove\\b","where"],
["\\bche\\b","that"],
["\\bconiugato\\b","married"],
["\\bconiugata\\b","married"],
["\\bsordomuto\\b","deaf-mute"],
["\\bistituto\\b","institution"],
["\\bragazzi\\b","boys"],
["\\balunno interno\\b","boarding pupil"],
["\\bAlunno interno\\b","Boarding pupil"],
["\\bDomestico\\b","Servant"],
["\\bcanta\\b","sings"],
["\\bfunerali\\b","funeral"],
["\\bdolenti\\b","mourners"],
["\\bpartenza\\b","departure"],
["\\bcolazione nuziale\\b","wedding breakfast"],
["\\bricoverata\\b","admitted"],
["\\bricoverato\\b","admitted"],
["\\bsuccursale\\b","branch"],
["\\bpatrimonio\\b","estate"],
["\\bconcesse\\b","granted"],
["\\bLettere di amministrazione\\b","Letters of administration"],
["\\bCaduto in combattimento\\b","Killed in action"],
["\\bbombardamento\\b","bombardment"],
["\\bcolpito in pieno\\b","struck directly"],
["\\bproiettile di artiglieria contraerea\\b","anti-aircraft shell"],
["\\bdecorato\\b","decorated"],
["\\bmedaglia d'oro al valor militare\\b","gold medal for military valour"],
["\\balla memoria\\b","posthumously"],
["\\bvecchiaia\\b","old age"],
["\\bcongestione polmonare\\b","pulmonary congestion"],
["\\bconvulsioni\\b","convulsions"],
["\\bdi mezzi indipendenti\\b","of independent means"],
["\\bnel sonno\\b","in his/her sleep"],
["\\bin the sonno\\b","in his/her sleep"],
["\\bmattino\\b","morning"],
["\\bgiorno\\b","day"],
["\\baver dato alla luce\\b","giving birth to"],
["\\bgemelli\\b","twins"],
["\\bpresumibilmente\\b","presumably"],
["\\bmista\\b","mixed"],
["\\bmisto\\b","mixed"],
["\\bfrancesi\\b","French"],
["\\balsaziani\\b","Alsatian"],
["\\btirolesi\\b","Tyrolean"],
["\\bpomeridiano\\b","afternoon"],
["\\bofferto\\b","given"],
["\\bcantanti\\b","singers"],
["\\bstabilimento a\\b","settlement in"],
["\\bpassando per\\b","by way of"],
["\\bcontea\\b","county"],
["\\bporta il nome\\b","is named after"],
["\\bstessa\\b","same"],
["\\bstesso\\b","same"],
["\\bcinque\\b","five"],
["\\bquattro\\b","four"],
["\\bsei\\b","six"],
["\\bPrima attestazione\\b","First attestation"],
["\\bSi sposa\\b","Marries"],
["\\btrasferimenti frequenti\\b","frequent moves"],
["\\bimpiegato\\b","employed"],
["\\bvisita\\b","visit"],
["\\britorno\\b","return"],
["\\bporta with sé\\b","brings with him"],
["\\bporta con sé\\b","brings with him"],
["\\battestazione\\b","attestation"],
["\\bal censimento\\b","at the census"],
["\\bal census\\b","at the census"],
["\\bnel censimento\\b","in the census"],
["\\bdel (\\d{4})\\b","of $1"],
["\\bnel (\\d{4})\\b","in $1"],
["\\bal (\\d{4})\\b","in $1"],
["\\bdal (\\d{4})\\b","from $1"],
["\\binformante\\b","informant"],
["\\bpoi\\b","then"],
["\\bil\\b","the"],
["\\bla\\b","the"],
["\\blo\\b","the"],
["\\bgli\\b","the"],
["\\bal\\b","at the"],
["\\bagli\\b","at the"],
["\\bdi matrimonio\\b","of marriage"],
["\\ble sorelle\\b","the sisters"],
["\\bsorelle\\b","sisters"],
["\\bfratelli\\b","brothers"],
["\\bnessuna professione\\b","no occupation"],
["\\bnessun[oa]?\\b","no"],
["\\bpiù giovane\\b","younger"],
["\\bpiù\\b","more"],
["\\bpresenti anche\\b","also present"],
["\\bpresenti\\b","present"],
["\\bpresente\\b","present"],
["\\bcollegiale\\b","boarder"],
["\\bconvitto/collegio femminile\\b","girls' boarding school"],
["\\bstudentesse\\b","students"],
["\\bunica italiana rilevata\\b","the only Italian recorded"],
["\\bunic[oa]\\b","only"],
["\\bin casa\\b","at home"],
["\\bHa ripreso\\b","Has resumed"],
["\\blezioni di canto\\b","singing lessons"],
["\\bproprio studio\\b","own studio"],
["\\bproprio\\b","own"],
["\\bsi esibisce\\b","performs"],
["\\bconcerto\\b","concert"],
["\\bvioloncellista\\b","cellist"],
["\\bvioloncello\\b","cello"],
["\\bgià attiva\\b","already active"],
["\\battiv[oa]\\b","active"],
["\\bquindi\\b","so"],
["\\bsi trasferisce\\b","moves"],
["\\bRiceve\\b","Receives"],
["\\blettere di amministrazione\\b","letters of administration"],
["\\bcerimonia in tutta semplicità\\b","a very simple ceremony"],
["\\bin tutta semplicità\\b","very simply"],
["\\bdamigelle\\b","bridesmaids"],
["\\bricevimento\\b","reception"],
["\\bné\\b","nor"],
["\\bdata all'altare\\b","given away at the altar"],
["\\bAccompagna all'altare\\b","Gives away at the altar"],
["\\bAccompagna\\b","Accompanies"],
["\\baltare\\b","altar"],
["\\ble\\b","the"],
["^Il\\b","The"],
["^La\\b","The"],
["^Le\\b","The"],
["^Lo\\b","The"],
["^Gli\\b","The"],
/*END EXTRA_RULES*/
["\\banni\\b","years old"],
["\\banno\\b","year"],
["\\bcon\\b","with"],
["\\bdi Citerna\\b","from Citerna"],
["\\bdi\\b(?=\\s+[A-Z])","from"],
["\\] e \\[","] and ["],
["\\be l\\'informante\\b","is the informant"],
["\\bè l\\'informante\\b","is the informant"],
["\\bVedova\\.","Widow."],
["\\bil figlio\\b","the son"],
["\\bla figlia\\b","the daughter"],
["Con il padre ","With the father "],
["Con il marito ","With the husband "],
["Con i nonni materni a ","With the maternal grandparents in "],
["Moglie del ","Wife of the "],
["\\bdel cognome\\b","of the surname"],
["\\bdel\\b","of the"],
["\\bdella\\b","of the"],
["\\bdal\\b","from the"],
["\\bcome\\b","as"],
["\\bquesta coppia\\b","this couple"],
["(?<=[a-zàèéìòùA-Z\\]0-9\\)]) e (?=[\\[A-ZÀ-Ú])"," and "],
];
const EVENT_EN_REGEX = EVENT_EN_RULES.map(function(pair){ return [new RegExp(pair[0],"g"), pair[1]]; });
function translateEventPhrase(s){
  if(LANG!=="en" || !s) return s;
  // I wikilink [[Cognome, Nome (date)]] non vanno tradotti: quel testo e' la
  // chiave con cui la persona viene cercata in DATA, e tradurlo romperebbe il
  // collegamento alla scheda.
  return String(s).split(/(\[\[[^\]]*\]\])/).map(function(part){
    if(part.slice(0,2) === "[[") return part;
    let out = part;
    for(let i=0;i<EVENT_EN_REGEX.length;i++){ out = out.replace(EVENT_EN_REGEX[i][0], EVENT_EN_REGEX[i][1]); }
    return out;
  }).join("");
}
// Historical OS Six-Inch, 2nd edition Ireland (1888-1915), National Library of Scotland (CC-BY).
// Downloaded once for the exact locations in this database (see HIST_TILES above) and embedded
// as small georeferenced JPEG overlays, so the map favours the period look Luca wanted without
// depending on a live connection to NLS's tile servers or covering areas we have no data for.
function buildHistOverlay(filterBounds){
  // filterBounds, if given, is [south,west,north,east]; only tiles intersecting it are
  // rendered. Used by the person mini-map so opening a profile doesn't have to instantiate
  // all ~6,600 historical tile overlays -- just the handful near that person's own places.
  const g = L.layerGroup();
  HIST_TILES.forEach(t=>{
    if(filterBounds){
      const [s,w,n,e]=t.b, [fs,fw,fn,fe]=filterBounds;
      if(n<fs || s>fn || e<fw || w>fe) return;
    }
    L.imageOverlay(t.u, [[t.b[0],t.b[1]],[t.b[2],t.b[3]]], {opacity:1}).addTo(g);
  });
  return g;
}
const TYPES = {
  nascita:{en:"birth",it:"nascita",c:"#294b70"}, battesimo:{en:"baptism",it:"battesimo",c:"#486183"},
  matrimonio:{en:"marriage",it:"matrimonio",c:"#896e1b"}, censimento:{en:"census",it:"censimento",c:"#543365"},
  trasferimento:{en:"migration",it:"trasferimento",c:"#1f5536"}, residenza:{en:"residence",it:"residenza",c:"#3b724e"},
  morte:{en:"death",it:"morte",c:"#323232"}, sepoltura:{en:"burial",it:"sepoltura",c:"#5e5e5e"}
};
function typeLabel(t){ return TT(t.en, t.it||t.en); }
const CHART_COLORS = {
  nascita:"#3d6ea5", battesimo:"#6a8fc0", matrimonio:"#c9a227", censimento:"#7b4b94",
  trasferimento:"#2e7d4f", residenza:"#57a773", morte:"#4a4a4a", sepoltura:"#8a8a8a"
};
const esc = s => (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const PLACES_BY_TYPE = {};
Object.keys(TYPES).forEach(t=>{ PLACES_BY_TYPE[t] = new Set(); });
Object.keys(DATA).forEach(k=>{
  DATA[k].events.forEach(e=>{
    if(e.lat!==null && e.pl && PLACES_BY_TYPE[e.t]) PLACES_BY_TYPE[e.t].add(e.pl);
  });
});
Object.keys(PLACES_BY_TYPE).forEach(t=>{ PLACES_BY_TYPE[t] = [...PLACES_BY_TYPE[t]].sort(); });
let TYPE_PLACE_WIDGETS = {};
const NAMES = Object.keys(DATA);
let DATA_YR_MIN=9999, DATA_YR_MAX=0;
NAMES.forEach(k=>DATA[k].events.forEach(e=>{ if(e.y){ if(e.y<DATA_YR_MIN) DATA_YR_MIN=e.y; if(e.y>DATA_YR_MAX) DATA_YR_MAX=e.y; } }));

// ---------------- movement paths (gradient arrows between a person's consecutive locations)
// Reuses the design from the family-map prototype: curved lines colored from light (early)
// to dark (late), with an arrowhead at the destination, so migrations/relocations read as
// directed movement rather than isolated dots.
let MOVE_YR_MIN = 1850, MOVE_YR_MAX = 2020;
const MOVE_STOPS = [[0,'#e8b04b'],[0.4,'#b3542e'],[0.75,'#5c1a1a'],[1,'#24090e']];
function moveHex2rgb(h){ return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]; }
function moveLerp(a,b,t){ return a+(b-a)*t; }
function moveYearColor(y){
  const t=Math.min(1,Math.max(0,((y==null?MOVE_YR_MAX:y)-MOVE_YR_MIN)/(MOVE_YR_MAX-MOVE_YR_MIN)));
  for(let i=0;i<MOVE_STOPS.length-1;i++){
    if(t>=MOVE_STOPS[i][0]&&t<=MOVE_STOPS[i+1][0]){
      const tt=(t-MOVE_STOPS[i][0])/(MOVE_STOPS[i+1][0]-MOVE_STOPS[i][0]);
      const a=moveHex2rgb(MOVE_STOPS[i][1]), b=moveHex2rgb(MOVE_STOPS[i+1][1]);
      return 'rgb('+Math.round(moveLerp(a[0],b[0],tt))+','+Math.round(moveLerp(a[1],b[1],tt))+','+Math.round(moveLerp(a[2],b[2],tt))+')';
    }
  }
  return MOVE_STOPS[MOVE_STOPS.length-1][1];
}
function moveBezier(from,to,curvature,n){
  n=n||36;
  const mx=(from[0]+to[0])/2, my=(from[1]+to[1])/2;
  const dx=to[0]-from[0], dy=to[1]-from[1];
  const cx=mx-dy*curvature, cy=my+dx*curvature;
  const pts=[];
  for(let i=0;i<=n;i++){
    const t=i/n;
    pts.push([(1-t)*(1-t)*from[0]+2*(1-t)*t*cx+t*t*to[0], (1-t)*(1-t)*from[1]+2*(1-t)*t*cy+t*t*to[1]]);
  }
  return pts;
}
function moveArrowIcon(pts,col,size){
  const p1=pts[pts.length-2], p2=pts[pts.length-1];
  const ang=Math.atan2(p2[1]-p1[1],-(p2[0]-p1[0]))*180/Math.PI+90;
  size=size||9;
  return L.marker(p2,{icon:L.divIcon({className:'',
    html:'<div style="width:0;height:0;border-left:'+(size*0.55)+'px solid transparent;border-right:'+(size*0.55)+'px solid transparent;border-bottom:'+size+'px solid '+col+';transform:rotate('+ang+'deg);transform-origin:50% 70%;"></div>',
    iconSize:[size,size], iconAnchor:[size/2,size*0.65]}),interactive:false});
}
// builds one arrow per pair of consecutive, distinct geolocated events for a person, sorted by date
function personMoves(p){
  const geo=p.events.filter(e=>e.lat!=null).slice().sort((a,b)=>a.k-b.k);
  const moves=[];
  for(let i=1;i<geo.length;i++){
    const a=geo[i-1], b=geo[i];
    if(a.lat===b.lat && a.lng===b.lng) continue;
    moves.push({from:[a.lat,a.lng], to:[b.lat,b.lng], fromEv:a, toEv:b, y:b.y});
  }
  return moves;
}

// wikilink -> link cliccabile se la persona esiste; in English mode the free-text
// portion is first passed through the phrase translator (see EVENT_EN_RULES above)
function renderText(s){
  return esc(translateEventPhrase(s)).replace(/\[\[([^\]|]+)\]\]/g, (m,name)=>{
    if(DATA[name]) return '<a class="pl" onclick="openPerson(\''+name.replace(/'/g,"\\'")+'\')">'+esc(DATA[name].name)+'</a>';
    return '<i>'+esc(name)+'</i>';
  });
}
function plink(name){
  if(!name) return "";
  if(DATA[name]) return '<a class="pl" onclick="openPerson(\''+name.replace(/'/g,"\\'")+'\')">'+esc(DATA[name].name)+' ('+esc(DATA[name].life||"?")+')</a>';
  return esc(name);
}

// ---------------- tabs
document.querySelectorAll("nav button").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    document.getElementById("tab-"+b.dataset.tab).classList.add("active");
    if(b.dataset.tab==="map") initBigMap();
    if(b.dataset.tab==="locations") initLocations();
    if(b.dataset.tab==="tree") initTree();
    if(b.dataset.tab==="timeline") initTimeline();
    if(b.dataset.tab==="stats") initStats();
    if(b.dataset.tab==="censuses") initCensuses();
    if(b.dataset.tab==="fonti") initFonti();
    if(b.dataset.tab==="elenchi"){ initElenchi(); elenchiRender(); }
  };
});

// ---------------- People tab
const famset = {};
NAMES.forEach(k=>{ famset[DATA[k].fam]=(famset[DATA[k].fam]||0)+1; });
const famnames = Object.keys(famset).sort();
const famsel=document.getElementById("famsel");
famnames.forEach(f=>{
  famsel.insertAdjacentHTML("beforeend",'<option value="'+esc(f)+'">'+esc(f)+' ('+famset[f]+')</option>');
});
function belongsTo(p, fam){ return p.fam===fam || (p.mfam||[]).includes(fam); }

// ---------------- generic searchable multi-select (used by the Map tab's Family/Person filters)
// A plain <select multiple> can't be typed into to filter options, so this is a small
// self-contained widget: a text box that filters a dropdown checklist as you type, with
// chosen items shown as removable chips above it.
function createMultiSelect(root, allOptions, opts){
  opts = opts || {};
  const label = v => opts.labelFor ? opts.labelFor(v) : v;
  const state = { selected: new Set(opts.preselected || []) };
  root.innerHTML = '<div class="mselSummary"></div><input type="text" class="mselInput" placeholder="'+esc(opts.placeholder||TT("Search...","Cerca..."))+'"><div class="mselDrop"></div>';
  const summaryEl = root.querySelector(".mselSummary");
  const inputEl = root.querySelector(".mselInput");
  const dropEl = root.querySelector(".mselDrop");
  function renderSummary(){
    if(opts.singleSelect){
      const sel=[...state.selected];
      summaryEl.textContent = sel.length ? label(sel[0]) : "";
      return;
    }
    const n = state.selected.size;
    summaryEl.textContent = n===0 ? "" : (n+(n===1?" selezionato":" selezionati"));
  }
  function renderDrop(filter){
    const f=(filter||"").toLowerCase();
    const matches = allOptions.filter(o=>label(o).toLowerCase().includes(f)).slice(0,300);
    let html = "";
    if(opts.allowClearAll){
      html += '<div class="mselOpt mselAction" data-action="clear">&times; Deseleziona tutto</div>';
    }
    html += matches.length ? matches.map(o=>'<label class="mselOpt'+(state.selected.has(o)?' sel':'')+'"><input type="checkbox" data-v="'+esc(o)+'"'+(state.selected.has(o)?' checked':'')+'>'+esc(label(o))+'</label>').join("")
      : '<div class="mselOpt" style="color:#776955;cursor:default">Nessun risultato</div>';
    dropEl.innerHTML = html;
    if(opts.allowClearAll){
      const clearEl = dropEl.querySelector('.mselAction[data-action="clear"]');
      if(clearEl) clearEl.onclick = (ev)=>{
        ev.stopPropagation();
        state.selected.clear();
        renderSummary();
        renderDrop(inputEl.value);
        if(opts.onChange) opts.onChange([]);
      };
    }
    dropEl.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
      cb.onclick = ev=>ev.stopPropagation();
      cb.onchange = ()=>{
        const v = cb.dataset.v;
        if(cb.checked){
          if(opts.singleSelect) state.selected.clear();
          state.selected.add(v);
        } else {
          state.selected.delete(v);
        }
        renderSummary();
        renderDrop(inputEl.value);
        if(opts.singleSelect) dropEl.style.display="none";
        if(opts.onChange) opts.onChange([...state.selected]);
      };
    });
  }
  inputEl.oninput = ()=>{ renderDrop(inputEl.value); dropEl.style.display="block"; };
  inputEl.onfocus = ()=>{ renderDrop(inputEl.value); dropEl.style.display="block"; };
  inputEl.onkeydown = (ev)=>{
    if(ev.key==="Enter"){
      ev.preventDefault();
      const f=(inputEl.value||"").toLowerCase();
      const matched = allOptions.filter(o=>label(o).toLowerCase().includes(f));
      if(opts.singleSelect){
        if(matched.length){ state.selected.clear(); state.selected.add(matched[0]); }
      } else {
        matched.forEach(o=>state.selected.add(o));
      }
      renderSummary(); renderDrop(inputEl.value);
      dropEl.style.display = opts.singleSelect ? "none" : "block";
      if(opts.onChange) opts.onChange([...state.selected]);
    }
  };
  document.addEventListener("click", (ev)=>{ if(!root.contains(ev.target)) dropEl.style.display="none"; });
  renderSummary(); renderDrop("");
  return {
    get selected(){ return [...state.selected]; },
    clear(){ state.selected.clear(); renderSummary(); renderDrop(inputEl.value); },
  };
}

// ---------------- Family Tree tab
// ---------------- Family Tree tab (logic only, for isolated testing)
const TREE_BOX_W=140, TREE_BOX_H=42, TREE_GEN_H=98, TREE_UNIT_W=176;
const TREE_MIN_BOX_W=140, TREE_MAX_BOX_W=200;
function estTextWidth(text, fontSize){ return String(text).length * fontSize * 0.54; }
function wrapTreeText(text, fontSize, maxWidth){
  const words = String(text).split(" ");
  const lines=[];
  let cur="";
  words.forEach(w=>{
    const test = cur ? cur+" "+w : w;
    if(estTextWidth(test, fontSize) > maxWidth && cur){
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  });
  if(cur) lines.push(cur);
  if(lines.length > 2) lines = [lines[0], lines.slice(1).join(" ")];
  return lines;
}
function computeBoxLayout(title, subtitle, big){
  const titleFont = big ? 13 : 12;
  const subFont = 10.5;
  const minW = big ? TREE_MIN_BOX_W*1.35 : TREE_MIN_BOX_W;
  const maxW = big ? TREE_MAX_BOX_W*1.35 : TREE_MAX_BOX_W;
  const pad = 18;
  const oneLineW = estTextWidth(title, titleFont)+pad;
  let lines, w;
  if(oneLineW <= maxW){
    lines = [title];
    w = Math.max(minW, oneLineW);
  } else {
    lines = wrapTreeText(title, titleFont, maxW-pad);
    w = Math.min(maxW, Math.max(minW, Math.max.apply(null, lines.map(l=>estTextWidth(l,titleFont)))+pad));
  }
  if(subtitle){
    const subW = estTextWidth(subtitle, subFont)+pad;
    w = Math.max(w, Math.min(maxW, subW));
  }
  const baseH = big ? TREE_BOX_H*1.2 : TREE_BOX_H;
  const h = baseH + (lines.length>1 ? 13 : 0);
  return {w:w, h:h, lines:lines};
}

function treeSexColor(k){
  const p=DATA[k];
  if(!p) return "#999";
  return p.sex==="M" ? "#3d6ea5" : (p.sex==="F" ? "#c15f8a" : "#8a8a8a");
}
function personLabelFor(k){
  const p=DATA[k];
  return {
    title: p?p.name:k,
    subtitle: p?(p.life||""):"",
    color: treeSexColor(k),
    onClick: "openPerson('"+k.replace(/'/g,"\\'")+"')"
  };
}

function buildAncestorLevels(key, maxGen){
  let level=[key];
  const levels=[level];
  for(let g=1; g<=maxGen; g++){
    const next=[];
    let any=false;
    level.forEach(k=>{
      const p = k && DATA[k] ? DATA[k] : null;
      const f = p ? (p.father||null) : null;
      const m = p ? (p.mother||null) : null;
      if(f) any=true;
      if(m) any=true;
      next.push(f, m);
    });
    if(!any) break;
    levels.push(next);
    level=next;
  }
  return levels;
}
function layoutAncestors(levels){
  const positions = {};
  const maxG = levels.length-1;
  const totalSlots = Math.pow(2, maxG);
  levels.forEach((level, g)=>{
    const slots = Math.pow(2, g);
    const slotWidth = totalSlots/slots;
    level.forEach((k, i)=>{
      if(!k) return;
      const x = (i+0.5)*slotWidth - totalSlots/2;
      positions[k] = { x: x, gen: -g };
    });
  });
  return positions;
}

function buildDescendantTree(key, maxGen, visited){
  visited = visited || new Set();
  if(visited.has(key)) return {key:key, children:[]};
  visited.add(key);
  const p = DATA[key];
  let kids = p ? (p.children||[]).slice() : [];
  kids.sort((a,b)=>{
    const ea=DATA[a]&&DATA[a].events&&DATA[a].events[0];
    const eb=DATA[b]&&DATA[b].events&&DATA[b].events[0];
    const ya=ea&&ea.y!=null?ea.y:9999, yb=eb&&eb.y!=null?eb.y:9999;
    return ya-yb;
  });
  if(maxGen<=0) kids=[];
  return {key:key, children: kids.map(ck=>buildDescendantTree(ck, maxGen-1, visited))};
}
function nodeSpouses(key){
  const p=DATA[key];
  return p ? (p.spouses||[]).filter(s=>DATA[s]) : [];
}
function nodeUnitWidth(key){
  return 1 + 0.85*nodeSpouses(key).length;
}
function layoutDescendants(node, xCursor, positions, edges, gen){
  const spouses = nodeSpouses(node.key);
  if(!node.children || node.children.length===0){
    const w = nodeUnitWidth(node.key);
    const x0=xCursor.val;
    positions[node.key] = {x: x0+0.5, gen: gen};
    spouses.forEach((sk,i)=>{
      positions[sk] = {x: x0+0.5+0.85*(i+1), gen: gen};
      edges.push({a:node.key, b:sk, type:"spouse"});
    });
    xCursor.val += w;
    return w;
  }
  const startX=xCursor.val;
  node.children.forEach(ch=>{
    layoutDescendants(ch, xCursor, positions, edges, gen+1);
    edges.push({a:node.key, b:ch.key, type:"parent"});
  });
  const cx = (positions[node.children[0].key].x + positions[node.children[node.children.length-1].key].x)/2;
  positions[node.key] = {x:cx, gen:gen};
  spouses.forEach((sk,i)=>{
    positions[sk] = {x: cx+0.85*(i+1), gen: gen};
    edges.push({a:node.key, b:sk, type:"spouse"});
  });
  return xCursor.val-startX;
}

function buildPersonTree(key){
  const ancestorLevels = buildAncestorLevels(key, 4);
  const descTree = buildDescendantTree(key, 5);
  const positions = {};
  const edges = [];
  layoutDescendants(descTree, {val:0}, positions, edges, 0);
  const anchorX = positions[key].x;
  const ancPositions = layoutAncestors(ancestorLevels);
  Object.keys(ancPositions).forEach(k=>{
    if(k===key) return;
    positions[k] = { x: ancPositions[k].x + anchorX, gen: ancPositions[k].gen };
  });
  for(let g=1; g<ancestorLevels.length; g++){
    const level=ancestorLevels[g];
    const childLevel=ancestorLevels[g-1];
    level.forEach((k,i)=>{
      if(!k) return;
      const childKey = childLevel[Math.floor(i/2)];
      if(childKey) edges.push({a:k, b:childKey, type:"parent"});
    });
    for(let i=0;i<level.length;i+=2){
      if(level[i] && level[i+1]) edges.push({a:level[i], b:level[i+1], type:"spouse"});
    }
  }
  return {nodes:positions, edges:edges};
}

function treeFamilyStatsText(nodesObj){
  const keys = Object.keys(nodesObj);
  let minBirth=null, maxDeath=null;
  keys.forEach(k=>{
    const p = DATA[k]; if(!p) return;
    const bEv = (p.events||[]).find(e=>e.t==="nascita" && e.y!=null);
    if(bEv && (minBirth===null || bEv.y<minBirth)) minBirth=bEv.y;
    const dEv = (p.events||[]).find(e=>e.t==="morte" && e.y!=null);
    if(dEv && (maxDeath===null || dEv.y>maxDeath)) maxDeath=dEv.y;
  });
  let s = keys.length+TT(" people"," persone");
  if(minBirth!==null) s += " \u00b7 "+TT("oldest known birth ","nascita nota pi\u00f9 antica ")+minBirth;
  if(maxDeath!==null) s += " \u00b7 "+TT("most recent known death ","morte nota pi\u00f9 recente ")+maxDeath;
  return s;
}
function buildFamilyTree(famName, maxGen){
  const members = new Set(NAMES.filter(k=>DATA[k].fam===famName));
  const roots = [...members].filter(k=>{
    const p=DATA[k];
    const f=p.father, m=p.mother;
    return !(f && members.has(f)) && !(m && members.has(m));
  });
  roots.sort((a,b)=>{
    const ea=DATA[a].events[0], eb=DATA[b].events[0];
    const ya=ea&&ea.y!=null?ea.y:9999, yb=eb&&eb.y!=null?eb.y:9999;
    return ya-yb;
  });
  const positions={};
  const edges=[];
  const xCursor={val:0};
  roots.forEach(rk=>{
    const tree = buildDescendantTree(rk, maxGen);
    layoutDescendants(tree, xCursor, positions, edges, 0);
    xCursor.val += 0.7;
  });
  return {nodes:positions, edges:edges, roots:roots, members:members};
}

function buildFamilyMap(){
  const famCount={};
  NAMES.forEach(k=>{ const f=DATA[k].fam; if(f) famCount[f]=(famCount[f]||0)+1; });
  const fams=Object.keys(famCount).sort((a,b)=>famCount[b]-famCount[a]);
  const edgeMap={};
  NAMES.forEach(k=>{
    const p=DATA[k];
    (p.spouses||[]).forEach(sk=>{
      const sp=DATA[sk]; if(!sp) return;
      if(sp.fam && p.fam && sp.fam!==p.fam){
        const pair=[p.fam,sp.fam].sort();
        const pk=pair[0]+"||"+pair[1];
        edgeMap[pk]=(edgeMap[pk]||0)+1;
      }
    });
  });
  const N=fams.length;
  const R = Math.max(260, N*15);
  const positions={};
  fams.forEach((f,i)=>{
    const ang = 2*Math.PI*i/N;
    positions[f] = { x:R*Math.cos(ang)/TREE_UNIT_W, gen:R*Math.sin(ang)/TREE_GEN_H, count:famCount[f] };
  });
  const edges = Object.keys(edgeMap).map(pk=>{
    const parts=pk.split("||");
    return {a:parts[0], b:parts[1], type:"marriage", weight:edgeMap[pk]};
  });
  return {positions:positions, edges:edges, fams:fams};
}

function buildFullGraph(){
  const famCount={};
  NAMES.forEach(k=>{ const f=DATA[k].fam; if(f) famCount[f]=(famCount[f]||0)+1; });
  const fams=Object.keys(famCount).sort((a,b)=>famCount[b]-famCount[a]);
  const MAX_ROW_UNITS=42;
  let rowX=0, rowY=0, rowMaxGen=0;
  const positions={};
  fams.forEach(famName=>{
    const built = buildFamilyTree(famName, 4);
    const localPos = built.nodes;
    const keys=Object.keys(localPos);
    if(!keys.length) return;
    const xs=keys.map(k=>localPos[k].x);
    const gens=keys.map(k=>localPos[k].gen);
    const minX=Math.min(...xs), maxX=Math.max(...xs), maxGen=Math.max(...gens);
    const clusterWidth=(maxX-minX)+2.4;
    if(rowX+clusterWidth>MAX_ROW_UNITS && rowX>0){
      rowY += (rowMaxGen+1)+1.3;
      rowX=0; rowMaxGen=0;
    }
    const offsetX = rowX - minX;
    keys.forEach(k=>{ positions[k] = {x: localPos[k].x+offsetX, gen: localPos[k].gen+rowY}; });
    rowX += clusterWidth;
    rowMaxGen = Math.max(rowMaxGen, maxGen);
  });
  const seen=new Set();
  const marriageEdges=[];
  NAMES.forEach(k=>{
    const p=DATA[k];
    (p.spouses||[]).forEach(sk=>{
      if(!DATA[sk] || DATA[sk].fam===p.fam) return;
      const pairKey=[k,sk].sort().join("||");
      if(seen.has(pairKey)) return;
      seen.add(pairKey);
      if(positions[k] && positions[sk]) marriageEdges.push({a:k,b:sk,type:"marriage"});
    });
  });
  return {positions:positions, edges:marriageEdges};
}

function renderGenericTree(containerEl, positions, edges, opts){
  opts = opts || {};
  const unitW = opts.unitW!=null ? opts.unitW : TREE_UNIT_W;
  const genH = opts.genH!=null ? opts.genH : TREE_GEN_H;
  const keys = Object.keys(positions);
  if(!keys.length){ containerEl.innerHTML = "<p style='padding:20px;font-size:13px;color:#776955'>Nessun dato da mostrare.</p>"; containerEl.style.width=""; containerEl.style.height=""; return; }
  const px = k=>positions[k].x*unitW;
  const py = k=>positions[k].gen*genH;
  const infoOf = {}, layoutOf = {};
  keys.forEach(k=>{
    const info = opts.labelFor ? opts.labelFor(k, positions[k]) : {title:k, subtitle:"", color:"#999"};
    infoOf[k] = info;
    layoutOf[k] = computeBoxLayout(info.title||"", info.subtitle||"", !!info.big);
  });
  const xs = keys.map(px), ys = keys.map(py);
  const maxBoxW = Math.max.apply(null, keys.map(k=>layoutOf[k].w));
  const maxBoxH = Math.max.apply(null, keys.map(k=>layoutOf[k].h));
  const pad = Math.max(maxBoxW,maxBoxH,TREE_BOX_H)/1;
  const minX=Math.min(...xs)-pad, maxX=Math.max(...xs)+pad;
  const minY=Math.min(...ys)-pad, maxY=Math.max(...ys)+pad;
  const W=maxX-minX, H=maxY-minY;
  let svg = '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">';
  edges.forEach(e=>{
    if(!positions[e.a] || !positions[e.b]) return;
    const ax=px(e.a)-minX, ay=py(e.a)-minY, bx=px(e.b)-minX, by=py(e.b)-minY;
    const ah=layoutOf[e.a].h, bh=layoutOf[e.b].h;
    if(e.type==="parent"){
      const midY=(ay+by)/2;
      svg += '<path class="treeEdge" d="M'+ax+' '+(ay+ah/2)+' V'+midY+' H'+bx+' V'+(by-bh/2)+'" fill="none"/>';
    } else {
      const wgt = e.weight?Math.min(4,1+Math.log(e.weight+1)):1.5;
      svg += '<line class="treeMarriage" x1="'+ax+'" y1="'+ay+'" x2="'+bx+'" y2="'+by+'" stroke-width="'+wgt+'"/>';
    }
  });
  keys.forEach(k=>{
    const x=px(k)-minX, y=py(k)-minY;
    const info = infoOf[k];
    const lay = layoutOf[k];
    const bw = lay.w, bh = lay.h;
    const lines = lay.lines;
    const titleY = lines.length>1 ? (bh/2-3-6) : (bh/2-3);
    svg += '<g class="treeBox" onclick="'+(info.onClick||"")+'" transform="translate('+(x-bw/2)+','+(y-bh/2)+')">'+
      '<rect width="'+bw+'" height="'+bh+'" rx="6" class="treeBoxRect" stroke="'+info.color+'"/>'+
      '<text x="'+(bw/2)+'" y="'+titleY+'" text-anchor="middle" class="treeBoxTitle">'+
      lines.map((ln,i)=>'<tspan x="'+(bw/2)+'" dy="'+(i===0?0:13)+'">'+esc(ln)+'</tspan>').join("")+
      '</text>'+
      (info.subtitle?'<text x="'+(bw/2)+'" y="'+(bh/2+11+(lines.length>1?6:0))+'" text-anchor="middle" class="treeBoxSub">'+esc(info.subtitle)+'</text>':'')+
      '</g>';
  });
  svg += '</svg>';
  containerEl.style.width = W+"px";
  containerEl.style.height = H+"px";
  containerEl.innerHTML = svg;
  updateTreeMinimap(svg, W, H);
}

let TREE_DIAGRAM_W=0, TREE_DIAGRAM_H=0;
function updateTreeMinimap(svg, W, H){
  const mm = document.getElementById("treeMinimap");
  if(!mm) return;
  TREE_DIAGRAM_W = W; TREE_DIAGRAM_H = H;
  const svgResp = svg.replace('width="'+W+'" height="'+H+'"', 'width="100%" height="100%"');
  mm.innerHTML = svgResp + '<div id="treeMiniViewport" style="position:absolute;border:2px solid var(--accent);background:rgba(122,31,42,.10)"></div>';
}
function updateTreeMiniViewport(tx,ty,scale){
  const mm = document.getElementById("treeMinimap");
  const rectEl = mm ? document.getElementById("treeMiniViewport") : null;
  if(!mm || !rectEl || !TREE_DIAGRAM_W) return;
  const wrapEl = document.getElementById("treeWrap");
  const wrapW = wrapEl.clientWidth, wrapH = wrapEl.clientHeight;
  const mmW = mm.clientWidth, mmH = mm.clientHeight;
  const fit = Math.min(mmW/TREE_DIAGRAM_W, mmH/TREE_DIAGRAM_H);
  const offX = (mmW - TREE_DIAGRAM_W*fit)/2, offY = (mmH - TREE_DIAGRAM_H*fit)/2;
  const lx0=(0-tx)/scale, lx1=(wrapW-tx)/scale, ly0=(0-ty)/scale, ly1=(wrapH-ty)/scale;
  rectEl.style.left = Math.max(0,offX + lx0*fit)+"px";
  rectEl.style.top = Math.max(0,offY + ly0*fit)+"px";
  rectEl.style.width = Math.max(4,(lx1-lx0)*fit)+"px";
  rectEl.style.height = Math.max(4,(ly1-ly0)*fit)+"px";
}

function initPanZoom(wrapEl, innerEl, onChange){
  let scale=1, tx=40, ty=40, dragging=false, lastX=0, lastY=0;
  function apply(){ innerEl.style.transform = "translate("+tx+"px,"+ty+"px) scale("+scale+")"; if(onChange) onChange(tx,ty,scale); }
  wrapEl.addEventListener("mousedown", e=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; wrapEl.style.cursor="grabbing"; });
  window.addEventListener("mousemove", e=>{
    if(!dragging) return;
    tx += e.clientX-lastX; ty += e.clientY-lastY;
    lastX=e.clientX; lastY=e.clientY;
    apply();
  });
  window.addEventListener("mouseup", ()=>{ dragging=false; wrapEl.style.cursor="grab"; });
  wrapEl.addEventListener("wheel", e=>{
    e.preventDefault();
    const delta = e.deltaY>0?0.9:1.11;
    scale=Math.max(0.15,Math.min(3,scale*delta));
    apply();
  }, {passive:false});
  apply();
  return { reset(){ scale=1; tx=40; ty=40; apply(); } };
}

let treeInitDone=false, treePersonWidget=null, treePanZoom=null;
function initTree(){
  if(treeInitDone) return; treeInitDone=true;
  document.getElementById("treeScopeSel").onchange=onTreeScopeChange;
  treePersonWidget = createMultiSelect(document.getElementById("treePersonMsel"), NAMES, {
    placeholder:TT("Search person...","Cerca persona..."),
    labelFor: k => (DATA[k]?DATA[k].name+(DATA[k].life?" ("+DATA[k].life+")":""):k),
    singleSelect: true,
    allowClearAll: true,
    onChange: renderTree,
  });
  const famSel=document.getElementById("treeFamilySel");
  famnames.forEach(f=>famSel.insertAdjacentHTML("beforeend",'<option value="'+esc(f)+'">'+esc(f)+'</option>'));
  famSel.onchange=renderTree;
  document.getElementById("treeCommunityModeSel").onchange=renderTree;
  treePanZoom = initPanZoom(document.getElementById("treeWrap"), document.getElementById("treeInner"), updateTreeMiniViewport);
  onTreeScopeChange();
}
function onTreeScopeChange(){
  const scope=document.getElementById("treeScopeSel").value;
  document.getElementById("treePersonCtl").style.display = scope==="person"?"":"none";
  document.getElementById("treeFamilyCtl").style.display = scope==="family"?"":"none";
  document.getElementById("treeCommunityCtl").style.display = scope==="community"?"":"none";
  renderTree();
}
window.treeGoToFamily=function(famName){
  document.getElementById("treeScopeSel").value="family";
  document.getElementById("treeFamilySel").value=famName;
  onTreeScopeChange();
};
function renderTree(){
  const scope=document.getElementById("treeScopeSel").value;
  const inner=document.getElementById("treeInner");
  if(scope==="person"){
    const sel = treePersonWidget ? treePersonWidget.selected : [];
    if(!sel.length){ inner.innerHTML="<p style='padding:20px;font-size:13px;color:#776955'>"+TT("Choose a person to see their tree.","Scegli una persona per vedere il suo albero.")+"</p>"; inner.style.width=""; inner.style.height=""; }
    else {
      const t = buildPersonTree(sel[0]);
      renderGenericTree(inner, t.nodes, t.edges, {labelFor:personLabelFor});
    }
  } else if(scope==="family"){
    const famName=document.getElementById("treeFamilySel").value;
    const statsEl = document.getElementById("treeFamilyStats");
    if(!famName){ inner.innerHTML="<p style='padding:20px;font-size:13px;color:#776955'>"+TT("Choose a family.","Scegli una famiglia.")+"</p>"; inner.style.width=""; inner.style.height=""; if(statsEl) statsEl.textContent=""; }
    else {
      const t = buildFamilyTree(famName, 6);
      renderGenericTree(inner, t.nodes, t.edges, {labelFor:personLabelFor});
      if(statsEl) statsEl.innerHTML = treeFamilyStatsText(t.nodes);
    }
  } else {
    const mode=document.getElementById("treeCommunityModeSel").value;
    if(mode==="familymap"){
      const t = buildFamilyMap();
      renderGenericTree(inner, t.positions, t.edges, {unitW:1, genH:1,
        labelFor:(k,pos)=>({title:k, subtitle:(pos.count)+" persone", color:"#7a5c33", big:true, onClick:"treeGoToFamily('"+k.replace(/'/g,"\\'")+"')"})
      });
    } else {
      const t = buildFullGraph();
      renderGenericTree(inner, t.positions, t.edges, {labelFor:personLabelFor});
    }
  }
  if(treePanZoom) treePanZoom.reset();
}

// ---------------- relatedness index: who does each person's own timeline mention, and who
// mentions them back -- covers kinship (already on the person object) plus "other reasons"
// like being named as a witness, informant, or census head of family in someone else's rows.
const MENTIONS_OF = {};
NAMES.forEach(k=>{ MENTIONS_OF[k] = new Set(); });
NAMES.forEach(k=>{
  DATA[k].events.forEach(e=>{
    const re=/\[\[([^\]|]+)/g; let m;
    while((m=re.exec(e.e||""))){
      const target = m[1].trim();
      if(MENTIONS_OF[target]) MENTIONS_OF[target].add(k);
    }
  });
});
function relatedKeys(k){
  const p = DATA[k]; const s = new Set();
  if(!p) return s;
  if(p.father) s.add(p.father);
  if(p.mother) s.add(p.mother);
  (p.spouses||[]).forEach(x=>s.add(x));
  (p.children||[]).forEach(x=>s.add(x));
  p.events.forEach(e=>{
    const re=/\[\[([^\]|]+)/g; let m;
    while((m=re.exec(e.e||""))){ const t=m[1].trim(); if(DATA[t]) s.add(t); }
  });
  (MENTIONS_OF[k]||new Set()).forEach(x=>s.add(x));
  return s;
}
// null return means "no filter active" (show everyone)
function computeAllowedKeys(fams, persons, includeRelated){
  if((!fams||!fams.length) && (!persons||!persons.length)) return null;
  const core = new Set();
  if(fams && fams.length) NAMES.forEach(k=>{ if(fams.some(f=>belongsTo(DATA[k],f))) core.add(k); });
  (persons||[]).forEach(k=>{ if(DATA[k]) core.add(k); });
  if(!includeRelated) return core;
  const expanded = new Set(core);
  core.forEach(k=>relatedKeys(k).forEach(x=>expanded.add(x)));
  return expanded;
}
function renderList(){
  const q=document.getElementById("q").value.toLowerCase();
  const fam=famsel.value, born=document.getElementById("bornsel").value;
  const keys=NAMES.filter(k=>{
    const p=DATA[k];
    if(q && !(k.toLowerCase().includes(q)||p.name.toLowerCase().includes(q))) return false;
    if(fam && !belongsTo(p,fam)) return false;
    if(born==="it" && !p.italian_born) return false;
    if(born==="other" && p.italian_born) return false;
    return true;
  }).sort();
  document.getElementById("pcount").textContent=keys.length+" people";
  document.getElementById("plist").innerHTML=keys.map(k=>{
    const p=DATA[k];
    const photoFn = p.photos && p.photos.length ? p.photos[0] : null;
    const photoSrc = photoFn ? PHOTOS[photoFn] : null;
    const thumb = photoSrc
      ? '<img src="'+photoSrc+'" alt="" loading="lazy" style="width:38px;height:38px;object-fit:cover;border-radius:3px;border:1px solid var(--line);flex:0 0 auto">'
      : '<div style="width:38px;height:38px;border-radius:3px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:19px;color:#fff;background:'+(p.sex==="M"?"#3d6ea5":(p.sex==="F"?"#c15f8a":"#8a8a8a"))+'">'+(p.sex==="M"?"&#9794;&#65039;":(p.sex==="F"?"&#9792;&#65039;":"?"))+'</div>';
    return '<div class="pcard" onclick="openPerson(\''+k.replace(/'/g,"\\'")+'\')" style="display:flex;align-items:center;gap:10px">'+thumb+'<div style="min-width:0"><b>'+esc(k)+'</b><div class="meta">'+
      (p.born?esc(p.born):"")+(p.events.length? " &middot; "+p.events.length+" events":"")+'</div></div></div>';
  }).join("");
}
["q","famsel","bornsel"].forEach(id=>document.getElementById(id).oninput=renderList);
renderList();

//LOCJS
// ---------------- Locations (una scheda per luogo, generata da Locations\*.md)
var LOCSEL = null, locMapInstance = null;
function locDA(){ return "Da classificare"; }
var LOC_CO_EN = { "Irlanda":"Ireland", "Italia":"Italy", "Inghilterra":"England", "Scozia":"Scotland",
  "Galles":"Wales", "Regno Unito":"United Kingdom", "Stati Uniti":"United States", "Francia":"France",
  "Spagna":"Spain", "Germania":"Germany", "Svizzera":"Switzerland", "Belgio":"Belgium", "Egitto":"Egypt",
  "Brasile":"Brazil", "Nuova Zelanda":"New Zealand", "Sudafrica":"South Africa", "Argentina":"Argentina",
  "Canada":"Canada", "Australia":"Australia", "Malta":"Malta" };
function locLabel(v){
  if (v === locDA()) return TT("Unclassified", "Da classificare");
  return TT(LOC_CO_EN[v] || v, v);
}
function locSortAlpha(a, b){ return a.localeCompare(b, "en"); }
function locOptions(sel, values, allLabel, current){
  var html = '<option value="">' + allLabel + '</option>';
  values.forEach(function(v){
    html += '<option value="' + esc(v) + '"' + (v === current ? ' selected' : '') + '>' + esc(locLabel(v)) + '</option>';
  });
  sel.innerHTML = html;
}
function locBase(){
  var co = document.getElementById("locCountry").value;
  var rg = document.getElementById("locRegion").value;
  var ci = document.getElementById("locCity").value;
  return LOCATIONS.filter(function(L){
    return (!co || L.co === co) && (!rg || L.rg === rg) && (!ci || L.ci === ci);
  });
}
function locFiltered(){
  var q = (document.getElementById("locQ").value || "").toLowerCase().trim();
  var miss = document.getElementById("locOnlyMissing").checked;
  return locBase().filter(function(L){
    if (miss && L.lat !== null) return false;
    if (q && L.title.toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
}
function locRefreshSelects(){
  var coSel = document.getElementById("locCountry"), rgSel = document.getElementById("locRegion"), ciSel = document.getElementById("locCity");
  var co = coSel.value, rg = rgSel.value, ci = ciSel.value;
  var countries = {}, regions = {}, cities = {};
  LOCATIONS.forEach(function(L){
    countries[L.co] = 1;
    if (!co || L.co === co) regions[L.rg] = 1;
    if ((!co || L.co === co) && (!rg || L.rg === rg)) cities[L.ci] = 1;
  });
  if (rg && !regions[rg]) { rg = ""; }
  if (ci && !cities[ci]) { ci = ""; }
  locOptions(coSel, Object.keys(countries).sort(locSortAlpha), TT("All countries", "Tutte le nazioni"), co);
  locOptions(rgSel, Object.keys(regions).sort(locSortAlpha), TT("All counties / regions", "Tutte le contee / regioni"), rg);
  locOptions(ciSel, Object.keys(cities).sort(locSortAlpha), TT("All towns", "Tutte le citta"), ci);
}
function locCard(L){
  var where = [L.ci, L.rg, L.co].filter(function(v){ return v && v !== locDA(); }).map(locLabel);
  var badge = L.lat === null
    ? '<span class="chip" style="background:#f3e2c7">' + TT("no coordinates", "senza coordinate") + '</span>'
    : (L.v ? '<span class="chip" style="background:#f3e2c7">' + TT("check coordinates", "coordinate da verificare") + '</span>' : '');
  return '<div class="pcard" onclick="openLoc(\'' + L.note.replace(/'/g, "\\'").replace(/"/g, '&quot;') + '\')">' +
    '<div style="min-width:0"><b>' + esc(L.title) + '</b>' +
    '<div class="meta">' + esc(where.join(" · ")) +
    (L.p.length ? " &middot; " + L.p.length + " " + TT("events", "eventi") : "") + '</div>' +
    (badge ? '<div style="margin-top:4px">' + badge + '</div>' : '') + '</div></div>';
}
function locRender(){
  locRefreshSelects();
  var rows = locFiltered();
  document.getElementById("locCount").textContent =
    rows.length + " " + TT("places", "luoghi") + " \u00b7 " +
    rows.reduce(function(a, L){ return a + L.p.length; }, 0) + " " + TT("events", "eventi");
  document.getElementById("locList").innerHTML = rows.length
    ? '<div class="plist">' + rows.map(locCard).join("") + '</div>'
    : '<p style="color:var(--ink-soft)">' + TT("No place matches these filters.", "Nessun luogo corrisponde a questi filtri.") + '</p>';
}
function locFamiliesHtml(L){
  var fams = L.f || [];
  if (!fams.length) return "";
  var CY = [1901, 1911, 1926];
  var dated = fams.filter(function(f){ return f.y0 !== null; });
  var lo = null, hi = null;
  dated.forEach(function(f){
    lo = (lo === null || f.y0 < lo) ? f.y0 : lo;
    hi = (hi === null || f.y1 > hi) ? f.y1 : hi;
  });
  if (lo !== null && hi === lo) { lo -= 1; hi += 1; }
  var span = (hi !== null && hi > lo) ? (hi - lo) : 1;
  function pos(y){ return ((y - lo) / span) * 100; }
  var lines = (lo === null) ? [] : CY.filter(function(y){ return y >= lo && y <= hi; });
  var grid = lines.map(function(y){
    return '<div class="locfamcen" style="left:' + pos(y) + '%"></div>';
  }).join("");
  var h = '<h3 class="sec">' + TT("Families at this address", "Famiglie a questo indirizzo") + '</h3>';
  h += '<p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 8px 0">' +
    TT("Each bar runs from the first to the last dated record of that family here; a woman is counted under her married surname, except for her own birth. Overlapping bars mean the two families were here in the same years. The dotted verticals are the census years: a diamond marks a family recorded here in that census, and a pale bar means the family is attested by censuses only \u2014 so it may have been here just on census night, with no other trace.",
       "Ogni barra va dalla prima all'ultima attestazione datata di quella famiglia qui; le donne sono contate sotto il cognome da sposate, tranne che per la propria nascita. Barre sovrapposte significano che le due famiglie erano qui negli stessi anni. Le verticali punteggiate sono gli anni censuari: il rombo segnala una famiglia registrata qui in quel censimento, e la barra chiara indica una famiglia attestata solo dai censimenti \u2014 potrebbe esservi stata solo la notte del censimento, senza altre tracce.") + '</p>';
  if (dated.length) {
    var ticks = "";
    lines.forEach(function(y){
      var x = pos(y);
      ticks += '<span class="tick" style="left:' + x + '%">' + y + '</span>' +
               '<i class="tickmark" style="left:' + x + '%"></i>';
    });
    var nearLeft = lines.some(function(y){ return pos(y) < 9; });
    var nearRight = lines.some(function(y){ return pos(y) > 91; });
    var edges = (nearLeft ? "" : '<span class="edge" style="left:0">' + lo + '</span>') +
                (nearRight ? "" : '<span class="edge" style="right:0">' + hi + '</span>');
    h += '<div class="locfams"><div class="locfamrow"><div></div>' +
         '<div class="locfamaxis">' + edges + ticks + '<div class="ax-line"></div></div>' +
         '<div></div></div>';
  } else {
    h += '<div class="locfams">';
  }
  fams.forEach(function(f){
    var label = f.y0 === null ? TT("undated", "senza data")
      : (f.y1 === f.y0 ? String(f.y0) : f.y0 + "\u2013" + f.y1);
    if (f.cen && f.cen.length) label += " \u00b7 " + TT("census", "cens.") + " " + f.cen.join(", ");
    var left = 0, w = 100;
    if (f.y0 !== null) {
      left = pos(f.y0);
      w = Math.max(pos(f.y1) - left, 1.5);
      if (left + w > 100) w = 100 - left;
    }
    var bar = (f.y0 === null)
      ? '<div class="locfamspan" style="left:0;width:100%;opacity:.2"></div>'
      : '<div class="locfamspan' + (f.only ? ' locfamonly' : '') + '" style="left:' + left + '%;width:' + w + '%"></div>';
    var dots = "";
    if (f.y0 !== null && f.cen) {
      f.cen.forEach(function(y){
        if (y >= lo && y <= hi) dots += '<div class="locfamdot" style="left:' + pos(y) + '%"></div>';
      });
    }
    h += '<div class="locfamrow">' +
      '<div class="locfamname"><b>' + esc(f.fam) + '</b> <span style="color:var(--ink-faint);font-size:11.5px">' +
        f.np + " " + (f.np === 1 ? TT("person", "persona") : TT("people", "persone")) + '</span></div>' +
      '<div class="locfambar">' + grid + bar + dots + '</div>' +
      '<div class="locfamyears">' + label + '</div></div>';
  });
  h += '</div>';
  if (L.ov && L.ov.length) {
    h += '<p style="font-size:12.5px;margin:6px 0 12px 0"><b>' + TT("Shared occupancy", "Compresenze") + ':</b> ' +
      L.ov.map(function(o){
        var years = (o.y1 === o.y0) ? String(o.y0) : o.y0 + "\u2013" + o.y1;
        return years + ": " + o.f.map(esc).join(", ");
      }).join("; ") + '.</p>';
  }
  return h;
}
window.openLoc = function(note){
  var L = null;
  for (var i = 0; i < LOCATIONS.length; i++) if (LOCATIONS[i].note === note) { L = LOCATIONS[i]; break; }
  if (!L) return;
  LOCSEL = L;
  document.getElementById("locControls").style.display = "none";
  document.getElementById("locList").style.display = "none";
  var d = document.getElementById("locDetail");
  var where = [L.ci, L.rg, L.co].filter(function(v){ return v && v !== locDA(); }).map(locLabel);
  var h = '<p><button class="small" onclick="closeLoc()">&larr; ' + TT("Back to the list", "Torna all'elenco") + '</button></p>';
  h += '<h2 style="margin:2px 0 6px 0">' + esc(L.title) + '</h2>';
  h += '<div style="margin-bottom:8px">' + where.map(function(w){ return '<span class="chip">' + esc(w) + '</span>'; }).join("") +
       '<span class="chip">' + L.p.length + ' ' + TT("events", "eventi") + '</span></div>';
  if (L.lat === null) {
    h += '<p style="color:var(--ink-soft);font-size:13px">' +
         TT("No coordinates in the note yet, so this place cannot be shown on the map.",
            "La nota non ha ancora le coordinate, quindi il luogo non si puo mostrare in mappa.") + '</p>';
  } else {
    if (L.v) h += '<p style="color:var(--ink-soft);font-size:13px">' +
      TT("These coordinates were reconciled from several different values and should be checked.",
         "Queste coordinate sono state unificate da valori diversi e andrebbero verificate.") + '</p>';
    h += '<div id="locmap" style="height:340px;margin-bottom:12px"></div>';
  }
  h += locFamiliesHtml(L);
  var seen = {}, persons = [];
  L.p.forEach(function(r){ if (!seen[r.k]) { seen[r.k] = 1; persons.push(r.k); } });
  h += '<div style="font-size:13px;margin-bottom:8px"><b>' + TT("People", "Persone") + ':</b> ' +
       persons.map(function(k){ return plink(k); }).join("; ") + '</div>';
  if (L.p.length) {
    h += '<table class="tl"><tr><th>' + TT("Date", "Data") + '</th><th>' + TT("Person", "Persona") + '</th><th>' +
         TT("Type", "Tipo") + '</th><th>' + TT("Event", "Evento") + '</th><th>' + TT("Occupation", "Professione") + '</th></tr>';
    L.p.forEach(function(r){
      var t = TYPES[r.t] || { en: r.t, c: "#999" };
      h += '<tr><td style="white-space:nowrap">' + esc(r.d) + '</td>' +
           '<td style="white-space:nowrap">' + plink(r.k) + '</td>' +
           '<td style="white-space:nowrap"><span class="tdot" style="background:' + t.c + '"></span>' + typeLabel(t) + '</td>' +
           '<td>' + renderText(r.e) + '</td><td>' + esc(r.pr) + '</td></tr>';
    });
    h += '</table>';
  }
  d.innerHTML = h;
  d.style.display = "block";
  window.scrollTo(0, 0);
  if (locMapInstance) { locMapInstance.remove(); locMapInstance = null; }
  if (L.lat !== null) {
    setTimeout(function(){
      locMapInstance = L2map(L);
    }, 60);
  }
};
function L2map(L){
  var m = window.L.map("locmap").setView([L.lat, L.lng], 16);
  window.L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    { attribution: "&copy; OSM &copy; CARTO", className: "histStyleTiles" }).addTo(m);
  try { buildHistOverlay([L.lat - 0.05, L.lng - 0.05, L.lat + 0.05, L.lng + 0.05]).addTo(m); } catch (e) {}
  window.L.marker([L.lat, L.lng]).addTo(m).bindPopup("<b>" + esc(L.title) + "</b>").openPopup();
  return m;
}
window.closeLoc = function(){
  LOCSEL = null;
  if (locMapInstance) { locMapInstance.remove(); locMapInstance = null; }
  document.getElementById("locDetail").style.display = "none";
  document.getElementById("locControls").style.display = "";
  document.getElementById("locList").style.display = "";
};
var locInited = false;
function initLocations(){
  if (locInited) { return; }
  locInited = true;
  document.getElementById("i18n-loc-intro").innerHTML = TT(
    "Every place mentioned in the profiles has its own record, generated from the Obsidian notes in <code>Locations\\</code>: coordinates live there and only there. Filter by country, county or town, then open a place to see it on the map with every person and event recorded at that address.",
    "Ogni luogo citato nei profili ha una sua scheda, generata dalle note Obsidian in <code>Locations\\</code>: le coordinate vivono li e solo li. Filtra per nazione, contea o citta, poi apri un luogo per vederlo in mappa con tutte le persone e gli eventi registrati a quell'indirizzo.");
  document.getElementById("locMissLbl").textContent = TT("only without coordinates", "solo senza coordinate");
  document.getElementById("locQ").placeholder = TT("Search for an address", "Cerca un indirizzo");
  ["locCountry", "locRegion", "locCity"].forEach(function(id){
    document.getElementById(id).onchange = function(){ if (id === "locCountry") { document.getElementById("locRegion").value = ""; document.getElementById("locCity").value = ""; } if (id === "locRegion") { document.getElementById("locCity").value = ""; } closeLoc(); locRender(); };
  });
  document.getElementById("locQ").oninput = function(){ locRender(); };
  document.getElementById("locOnlyMissing").onchange = function(){ locRender(); };
  locRender();
}
//END LOCJS

// ---------------- Person modal
let pmapInstance=null;
window.openPerson=function(key){
  const p=DATA[key]; if(!p) return;
  const el=document.getElementById("pmodal");
  let h='<button id="pmClose" onclick="closePerson()">&times;</button>';
  h+='<h2>'+esc(p.name)+(p.life?' <span style="font-weight:normal;color:#776955">('+esc(p.life)+')</span>':"")+'</h2>';
  h+='<div style="margin:4px 0 8px 0"><span class="chip">'+esc(p.fam)+'</span>'+(p.mfam||[]).map(f=>'<span class="chip">in '+esc(f)+'</span>').join("")+(p.sex?'<span class="chip">'+(p.sex==="M"?"male":"female")+'</span>':"")+'</div>';
  const rel=[];
  if(p.father) rel.push("<b>Father:</b> "+plink(p.father));
  if(p.mother) rel.push("<b>Mother:</b> "+plink(p.mother));
  if(p.spouses.length) rel.push("<b>Spouse"+(p.spouses.length>1?"s":"")+":</b> "+p.spouses.map(plink).join("; "));
  if(p.children.length) rel.push("<b>Children:</b> "+p.children.map(plink).join("; "));
  if(rel.length) h+='<div class="rel">'+rel.join("<br>")+'</div>';
  const recs=Object.entries(p.records||{});
  if(recs.length) h+='<div style="font-size:13px;margin-bottom:6px"><b>Records:</b> '+recs.map(([k,u])=>'<a class="pl" href="'+esc(u)+'" target="_blank">'+esc(k)+'</a>').join(" &middot; ")+'</div>';
  if(p.forte) h+='<div class="fortelink"><a class="pl" href="'+esc(p.forte)+'" target="_blank">'+TT("Forte Project","Progetto Forte")+' &#8599;</a></div>';
  if(p.photos && p.photos.length){
    h+='<h3 class="sec">'+TT("Photographs","Fotografie")+'</h3><div class="photogal">'+
      p.photos.map(fn=>{ const src=PHOTOS[fn]||""; return '<img src="'+src+'" alt="'+esc(TT("Photograph of ","Fotografia di ")+(p.name||""))+'" loading="lazy" onclick="openLightbox(\''+fn.replace(/'/g,"\\'")+'\')">'; }).join("")+
      '</div>';
  }
  if(p.events.some(e=>e.lat!==null)) h+='<div id="pmap"></div>';
  if(p.events.length){
    h+='<h3 class="sec">Timeline</h3><table class="tl"><tr><th>Date</th><th>Type</th><th>Event</th><th>Place</th><th>Occupation</th><th>Source</th></tr>';
    p.events.forEach(e=>{
      const t=TYPES[e.t]||{en:e.t,c:"#999"};
      h+='<tr><td style="white-space:nowrap">'+esc(e.d)+'</td><td style="white-space:nowrap"><span class="tdot" style="background:'+t.c+'"></span>'+typeLabel(t)+'</td><td>'+renderText(e.e)+'</td><td>'+esc(e.pl)+(e.ax?' <span class="approx">(approx.)</span>':"")+'</td><td>'+esc(e.pr)+'</td><td>'+
        (e.src||[]).map(s=>'<a class="pl" href="'+esc(s.url)+'" target="_blank">'+esc(s.label)+'</a>').join(" ")+'</td></tr>';
    });
    h+='</table>';
  }
  const cyears=Object.keys(p.census||{});
  if(cyears.length){
    h+='<h3 class="sec">Census returns</h3>';
    cyears.forEach(y=>{
      const c=p.census[y];
      h+='<details class="cbox"><summary>Census '+y+'</summary><div class="cgrid">'+
        Object.entries(c).map(([k,v])=>'<div class="k">'+esc(k)+'</div><div>'+(v.startsWith("http")?'<a class="pl" href="'+esc(v)+'" target="_blank">link</a>':renderText(v))+'</div>').join("")+'</div></details>';
    });
  }
  el.innerHTML=h;
  document.getElementById("overlay").style.display="block";
  el.style.display="block"; el.scrollTop=0;
  // mini-mappa
  if(pmapInstance){ pmapInstance.remove(); pmapInstance=null; }
  const geo=p.events.map((e,idx)=>({e,idx})).filter(o=>o.e.lat!==null);
  if(geo.length){
    setTimeout(()=>{
      pmapInstance=L.map("pmap");
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{attribution:"&copy; OSM &copy; CARTO",className:"histStyleTiles"}).addTo(pmapInstance);
      const geoLats=geo.map(o=>o.e.lat), geoLngs=geo.map(o=>o.e.lng);
      const pad=0.15;
      buildHistOverlay([Math.min(...geoLats)-pad, Math.min(...geoLngs)-pad, Math.max(...geoLats)+pad, Math.max(...geoLngs)+pad]).addTo(pmapInstance);
      personMoves(p).forEach(mv=>{
        const col=moveYearColor(mv.y);
        const pts=moveBezier(mv.from,mv.to,0.15);
        L.polyline(pts,{color:col,weight:2.5,opacity:.85})
          .bindPopup("<b>"+esc(mv.fromEv.pl)+"</b> &rarr; <b>"+esc(mv.toEv.pl)+"</b><br>"+esc(mv.toEv.d)).addTo(pmapInstance);
        moveArrowIcon(pts,col,10).addTo(pmapInstance);
      });
      function dotIcon(col,edited,approx){
        const border=approx?"2px dashed #241f16":"2px solid #241f16";
        const ring=edited?";box-shadow:0 0 0 2px #c9a227":"";
        return L.divIcon({className:"",iconSize:[14,14],iconAnchor:[7,7],
          html:'<div style="width:14px;height:14px;border-radius:50%;background:'+col+';border:'+border+ring+'"></div>'});
      }
      const eventMarkers=geo.map(o=>{
        const t=TYPES[o.e.t]||{c:"#999",en:o.e.t};
        const mk=L.marker([o.e.lat,o.e.lng],{icon:dotIcon(t.c,false,o.e.ax)});
        mk.bindPopup("<b>"+esc(o.e.d)+"</b> "+(TYPES[o.e.t]?typeLabel(TYPES[o.e.t]):o.e.t)+"<br>"+esc(o.e.pl));
        mk.addTo(pmapInstance);
        return mk;
      });
      pmapInstance.fitBounds(L.latLngBounds(geo.map(o=>[o.e.lat,o.e.lng])).pad(0.25));
    },60);
  }
};
window.openLightbox=function(fn){
  const src=PHOTOS[fn]; if(!src) return;
  document.getElementById("lightboxImg").src=src;
  /*LBALT*/
  try {
    var __g = [].slice.call(document.querySelectorAll(".photogal img"));
    var __m = __g.filter(function(x){ return (x.getAttribute("onclick")||"").indexOf(fn) >= 0; })[0];
    document.getElementById("lightboxImg").alt = __m ? (__m.getAttribute("alt")||"") : "";
  } catch(e){}
  /*END LBALT*/
  document.getElementById("lightbox").style.display="flex";
};
window.closePerson=function(){
  document.getElementById("pmodal").style.display="none";
  document.getElementById("overlay").style.display="none";
  if(pmapInstance){ pmapInstance.remove(); pmapInstance=null; }
};
document.getElementById("overlay").onclick=closePerson;
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closePerson(); });

// ---------------- Big map
let bigmap=null, cluster=null, allMarkers=[], allMoves=[], moveLayer=null, histOverlayGroup=null, histLayers=null, famMselWidget=null, personMselWidget=null;
function initBigMap(){
  if(bigmap){ setTimeout(()=>bigmap.invalidateSize(),80); return; }
  bigmap=L.map("bigmap").setView([53.2,-6.8],7);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{attribution:"&copy; OSM &copy; CARTO",className:"histStyleTiles"}).addTo(bigmap);
  cluster=L.markerClusterGroup({chunkedLoading:true, maxClusterRadius:46});
  bigmap.addLayer(cluster);
  moveLayer=L.layerGroup().addTo(bigmap);
  histOverlayGroup=L.layerGroup().addTo(bigmap);
  histLayers=new Array(HIST_TILES.length).fill(null);
  const HIST_MIN_ZOOM=13;
  function updateHistViewport(){
    if(!document.getElementById("showHist").checked || bigmap.getZoom()<HIST_MIN_ZOOM){
      histLayers.forEach((l,idx)=>{ if(l){ histOverlayGroup.removeLayer(l); histLayers[idx]=null; } });
      return;
    }
    const b=bigmap.getBounds().pad(0.25);
    const bs=b.getSouth(), bn=b.getNorth(), bw=b.getWest(), be=b.getEast();
    HIST_TILES.forEach((t,idx)=>{
      const ok = !(t.b[2]<bs || t.b[0]>bn || t.b[3]<bw || t.b[1]>be);
      const has = !!histLayers[idx];
      if(ok && !has){
        histLayers[idx]=L.imageOverlay(t.u, [[t.b[0],t.b[1]],[t.b[2],t.b[3]]], {opacity:1});
        histOverlayGroup.addLayer(histLayers[idx]);
      } else if(!ok && has){
        histOverlayGroup.removeLayer(histLayers[idx]);
        histLayers[idx]=null;
      }
    });
  }
  bigmap.on("moveend zoomend", updateHistViewport);
  setTimeout(updateHistViewport, 60);
  document.getElementById("showHist").onchange=updateHistViewport;
  document.getElementById("typectlToggle").onclick=function(){
    document.getElementById("typectl").classList.toggle("collapsed");
  };
  const tpc = document.getElementById("typePlaceCtl");
  tpc.innerHTML = "";
  Object.entries(TYPES).forEach(([tk,tv])=>{
    tpc.insertAdjacentHTML("beforeend",
      '<div style="margin-top:4px;display:flex;align-items:center;gap:8px"><label class="fchk" style="display:inline-flex;align-items:center;gap:5px;white-space:nowrap;flex:0 0 auto"><input type="checkbox" class="typeChk" data-type="'+tk+'" checked><span class="tdot" style="background:'+tv.c+'"></span>'+tv.en+'</label><div class="msel" id="placeMsel_'+tk+'" style="flex:1 1 auto;min-width:0"></div></div>');
  });
  TYPE_PLACE_WIDGETS = {};
  Object.keys(TYPES).forEach(tk=>{
    TYPE_PLACE_WIDGETS[tk] = createMultiSelect(document.getElementById("placeMsel_"+tk), PLACES_BY_TYPE[tk], {
      placeholder: TT("Search place...","Cerca luogo..."),
      allowClearAll: true,
      onChange: refreshMap,
    });
  });
  tpc.querySelectorAll(".typeChk").forEach(i=>{
    const mselDiv = document.getElementById("placeMsel_"+i.dataset.type);
    if(mselDiv) mselDiv.style.visibility = i.checked ? "visible" : "hidden";
    i.onchange=()=>{
      if(!i.checked && TYPE_PLACE_WIDGETS[i.dataset.type]) TYPE_PLACE_WIDGETS[i.dataset.type].clear();
      if(mselDiv) mselDiv.style.visibility = i.checked ? "visible" : "hidden";
      refreshMap();
    };
  });
  NAMES.forEach(k=>{
    DATA[k].events.forEach(e=>{
      if(e.lat===null) return;
      const t=TYPES[e.t]||{c:"#999",en:e.t};
      const m=L.circleMarker([e.lat,e.lng],{radius:7,fillColor:t.c,fillOpacity:.95,color:"#241f16",weight:1.8});
      m.bindPopup('<b>'+plink(k)+'</b><br>'+esc(e.d)+' &mdash; '+typeLabel(t)+(e.e?'<br>'+renderText(e.e):"")+'<br><i>'+esc(e.pl)+'</i>');
      allMarkers.push({m:m, t:e.t, y:e.y, key:k, pl:e.pl});
    });
    // one gradient arrow per move between this person's consecutive, distinct locations
    personMoves(DATA[k]).forEach(mv=>{
      const col=moveYearColor(mv.y);
      const pts=moveBezier(mv.from,mv.to,0.16);
      const group=L.layerGroup();
      L.polyline(pts,{color:col,weight:2.2,opacity:.8})
        .bindPopup('<b>'+plink(k)+'</b><br>'+esc(mv.fromEv.pl)+' &rarr; '+esc(mv.toEv.pl)+'<br>'+esc(mv.toEv.d))
        .addTo(group);
      moveArrowIcon(pts,col,9).addTo(group);
      allMoves.push({layer:group, y:mv.y, key:k});
    });
  });
  const yfrom=document.getElementById("yfrom"), yto=document.getElementById("yto"), ystep=document.getElementById("ystep");
  yfrom.min=yto.min=DATA_YR_MIN; yfrom.max=yto.max=DATA_YR_MAX;
  yfrom.value=DATA_YR_MIN; yto.value=DATA_YR_MAX;
  document.getElementById("yslider").value=DATA_YR_MAX;
  function applyStep(){ document.getElementById("yslider").step=+ystep.value; }
  function applyRange(){
    let a=+yfrom.value, b=+yto.value;
    if(isNaN(a)) a=DATA_YR_MIN;
    if(isNaN(b)) b=DATA_YR_MAX;
    if(a>b){ const t=a; a=b; b=t; }
    a=Math.max(DATA_YR_MIN,Math.min(DATA_YR_MAX,a));
    b=Math.max(DATA_YR_MIN,Math.min(DATA_YR_MAX,b));
    yfrom.value=a; yto.value=b;
    MOVE_YR_MIN=a; MOVE_YR_MAX=b;
    document.getElementById("legendFrom").textContent=a;
    document.getElementById("legendTo").textContent=b;
    const s=document.getElementById("yslider");
    s.min=a; s.max=b;
    if(+s.value<a) s.value=a;
    if(+s.value>b) s.value=b;
    applyStep();
    refreshMap();
  }
  yfrom.onchange=applyRange; yto.onchange=applyRange;
  ystep.onchange=()=>{ applyStep(); refreshMap(); };
  document.getElementById("yslider").oninput=refreshMap;
  famMselWidget = createMultiSelect(document.getElementById("famMsel"), famnames, {
    placeholder: TT("Search family...","Cerca famiglia..."),
    allowClearAll: true,
    onChange: refreshMap,
  });
  personMselWidget = createMultiSelect(document.getElementById("personMsel"), NAMES, {
    placeholder: TT("Search person...","Cerca persona..."),
    labelFor: k => (DATA[k] ? DATA[k].name + (DATA[k].life ? " (" + DATA[k].life + ")" : "") : k),
    allowClearAll: true,
    onChange: refreshMap,
  });
  document.getElementById("includeRelated").onchange=refreshMap;
  document.getElementById("showMoves").onchange=refreshMap;
  document.getElementById("play").onclick=function(){
    if(this._i){ clearInterval(this._i); this._i=null; this.innerHTML="&#9654; Play"; return; }
    const s=document.getElementById("yslider"); s.value=yfrom.value; refreshMap();
    this.innerHTML="&#9632; Stop";
    this._i=setInterval(()=>{
      const step=+ystep.value;
      if(+s.value>=+yto.value){ clearInterval(this._i); this._i=null; document.getElementById("play").innerHTML="&#9654; Play"; return; }
      s.value=Math.min(+yto.value,+s.value+step); refreshMap();
    },1000);
  };
  applyRange();
}
function refreshMap(){
  const y=+document.getElementById("yslider").value;
  document.getElementById("ylab").textContent=y;
  const fams = famMselWidget ? famMselWidget.selected : [];
  const persons = personMselWidget ? personMselWidget.selected : [];
  const includeRelated = document.getElementById("includeRelated").checked;
  const allowed = computeAllowedKeys(fams, persons, includeRelated);
  const showMoves=document.getElementById("showMoves").checked;
  const yFrom=+document.getElementById("yfrom").value, yTo=y;
  cluster.clearLayers();
  const typeOn = {};
  document.querySelectorAll(".typeChk").forEach(i=>{ typeOn[i.dataset.type] = i.checked; });
  cluster.addLayers(allMarkers.filter(o=>{
    if(!typeOn[o.t]) return false;
    if(o.y!=null && (o.y<yFrom || o.y>yTo)) return false;
    if(allowed && !allowed.has(o.key)) return false;
    const placeSel = TYPE_PLACE_WIDGETS[o.t] ? TYPE_PLACE_WIDGETS[o.t].selected : [];
    if(placeSel.length>0 && !placeSel.includes(o.pl)) return false;
    return true;
  }).map(o=>o.m));
  allMoves.forEach(o=>{
    const ok=showMoves && (o.y==null||(o.y>=yFrom && o.y<=yTo)) && (!allowed||allowed.has(o.key));
    const has=moveLayer.hasLayer(o.layer);
    if(ok && !has) moveLayer.addLayer(o.layer);
    else if(!ok && has) moveLayer.removeLayer(o.layer);
  });
}

// ---------------- Families tab
const FAMILY_NOTES = {"Anzani": "<b>Anzani, Gustavus (c. 1876)</b> married <b>Arcari (in Anzani), Elizabeth (c. 1883)</b><br>1) <b>Anzani, Bertha (c. 1900)</b><br>2) <b>Anzani, Peter (c. 1902)</b><br>3) <b>Anzani, Beatrice (c. 1906)</b><br>4) <b>Anzani, Mary (1906)</b><br>5) <b>Anzani, Albert (1909)</b><br>6) <b>Anzani, UNKOWN (1912)</b><br>7) <b>Anzani, Josephine (1914)</b><br><br>Bertha was born in September [1899](javascript:golink(\"/cgi/information.pl?scan=1&amp;r=102112410:7161&amp;d=bmd_1784770807%22)<br>Peter was born in September [1901](javascript:golink(\"/cgi/information.pl?scan=1&amp;r=106235336:7801&amp;d=bmd_1784770807%22))<br>Beatrice was born in September <a href=\"https://www.freebmd.org.uk/cgi/information.pl?r=114481055:7566&amp;d=bmd_1784770807&amp;scan=1\" target=\"_blank\" rel=\"noopener\">1905</a><br>Gustavus dies in <a href=\"https://www.freebmd.org.uk/cgi/information.pl?scan=1&amp;r=238635748:0627&amp;d=bmd_1784770807\" target=\"_blank\" rel=\"noopener\">1968</a><br>Elizabeth died in March <a href=\"https://www.freebmd.org.uk/cgi/information.pl?scan=1&amp;r=262614492:0252&amp;d=bmd_1784770807\" target=\"_blank\" rel=\"noopener\">1979</a>", "Augustino": "<b>Augustino, Michele (c. 1851-1935)</b> arrived in Ireland before 1876 and married <b>Jameson (in Augustino), Luisa (c. 1859-1931)</b> in 1877 and they had 2 children both alive in 1911.<br>1) <b>Augustino, Dominick (1876-1912)</b> married <b>Reid (in Augustino), Elizabeth</b> in 1897<br>&nbsp;&nbsp;1) <b>Augustino, Margaret (1900-1901)</b><br>&nbsp;&nbsp;2) <b>Augustino, John Joseph (c. 1900)</b><br>&nbsp;&nbsp;3) <b>Augustino, Anthony (1902)</b><br>2) <b>Augustino, John (1878-1929)</b> married <b>Nolan (in Augustino), Mary (c. 1879-1937)</b> in 1902<br>&nbsp;&nbsp;1) <b>Augustino, Patrick (1904-1904)</b><br>3) <b>Augustino, Angelina (1880)</b><br><br><b>Augustino, Michael (c. 1902-1902)</b> son of a musician, who is the father? <b>Augustino, Dominick (1876-1912)</b> or <b>Augustino, John (1878-1929)</b>?? <a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-4534770\" target=\"_blank\" rel=\"noopener\">https://www.irishgenealogy.ie/view/?record_id=cide-4534770</a> sembra mancare proprio quel volume perché non ci sono i nati di inizio 1902. è più probabile il primo visto che il secondo si sposa nel 1902 ma qualche mese dopo.<br><br><b>Augustino, Dominick (c. 1848-1925)</b> married <b>Augustina, Ellen (c. 1857)</b><br>1) <b>Augustino (in Demarco), Mary (c. 1877-1919)</b> married <b>De Marco, Gerardo</b> in 1912", "Bassi": "È una delle prime famiglie ad arrivare in Irlanda.<br><br><b>Bassi, Joseph (c. 1832)</b> e <b>Cassinello (in Bassi), Mary (c. 1845)</b> si sposano a Cork nel 1865.<br><b>Cassinello (in Bassi), Mary (c. 1845)</b> è nata in Inghilterra quindi la migrazione della sua famiglia partecipa a una fase precedente.<br><br><b>Bassi, Olivia Catherine (1865-1866)</b> prima figlia, morta infante<br><b>Bassi, Esther Mary (1868-1871)</b> seconda figlia<br><b>Bassi, Joseph Raphael (1870)</b>, terzo figlio, primo figlio maschio<br><b>Bassi, Louis (1872)</b>, quarto figlio, debole di mente<br><b>Bassi, Flora Veronica (1876)</b>, quinto figlio<br><b>Bassi, Bartholomew (1879-1881)</b>, sesto figlio<br><b>Bassi, Giovanni Francesco (1880)</b>, settimo figlio<br><b>Bassi, Edward (1885)</b> ottavo figlio<br><br>Nel Censimento 1901 hanno un laboratorio in cui lavora tutta la famiglia. <br><br><b>Bassi, Joseph (c. 1832)</b> padre, scultore<br><b>Bassi, Edward (1885)</b> e <b>Bassi, Giovanni Francesco (1880)</b> figli, decoratori di statue<br><b>Bassi, Louis (1872)</b> il figlio debole di mente, pittore di statue<br><b>Bassi, Flora Veronica (1876)</b>, la figlia e assistente di bottega<br><b>Cassinello (in Bassi), Mary (c. 1845)</b> la madre, fa da Business Manager.<br><br>Nel Censimento 1911 il matrimonio di 46 coincide, hanno 4 figli vivi e 7 morti ma ne hai trovati solo 3 confermati morti e 1 non morto. La famiglia è ancora composta dagli stessi membri.<br><br><b>Bassi, Joseph (c. 1832)</b> padre, scultore<br><b>Bassi, Edward (1885)</b> e <b>Bassi, Giovanni Francesco (1880)</b> figli, decoratori di statue<br><b>Bassi, Louis (1872)</b> il figlio debole di mente, pittore di statue<br><b>Bassi, Flora Veronica (1876)</b><br><b>Cassinello (in Bassi), Mary (c. 1845)</b> la madre", "Biagioni": "<b>Biagioni, Giuseppe (c. 1874)</b> married <b>Biagioni, Lucia (c. 1867)</b> around 1898<br>1) <b>Biagioni, Luciano (c. 1900)</b><br>2) <b>Biagioni, Victoria (c. 1902)</b><br>3) <b>Biagioni, Ada (c. 1906)</b>", "Borza": "<b>Borza, Ottavio 'George' (c. 1880)</b> married <b>O'Prey (in Borza), Kathleen (c. 1889)</b><br>1) <b>Borza, Maria Louisa (1908)</b><br>2) <b>Borza, Salvator Ettore (1910)</b><br>3) <b>Borza, Maria Lincher Christina (1913)</b><br>4) <b>Borza, Edoardo Benignus (1915)</b><br>5) <b>Borza, Catherine Pertischa (1918)</b><br>6) <b>Borza, Julia (1920)</b>", "Branzetti": "<b>Branzetti, Lorenzo</b> married <b>Pestilli (in Branzetti), Chiara</b><br>1) <b>Branzetti, Francisco Onofrio (1885-c. 1962)</b> married <b>Bothwell (in Branzetti), Martha Jane (c. 1887-1917)</b> in 1910.<br>&nbsp;&nbsp;1) <b>Branzetti, Lorenzo Francesco (1911-c. 1993)</b> married <b>Branzetti, Jean (1923-2010)</b><br>&nbsp;&nbsp;2) <b>Branzetti (in Nickerson), Doris Chiarina (1913-c. 2002)</b> married <b>Nickerson, William Joseph (1915-1991)</b> in 1939<br>and married <b>Branzetti, Esther A. (1894-1967)</b><br><br><b>Branzetti, Francisco Onofrio (1885-c. 1962)</b> had emigrated from Naples to Boston. Here he married the Irish-born <b>Bothwell (in Branzetti), Martha Jane (c. 1887-1917)</b><br><br>There is also this family, possibly a brother of a relative of Francisco Onofrio<br><br><a href=\"https://www.findagrave.com/memorial/104724729/joseph-ottavio-branzetti\" target=\"_blank\" rel=\"noopener\">Branzetti, Joseph Ottavio (1891-1969)</a> married <a href=\"https://www.findagrave.com/memorial/94510983/mary-pasquelina-branzetti\" target=\"_blank\" rel=\"noopener\">Alberini (in Branzetti), Mary Pasquelina (1896-1960)</a><br>1) <a href=\"https://www.findagrave.com/memorial/210284325/joseph-ottavio-branzetti\" target=\"_blank\" rel=\"noopener\">Branzetti, Joseph Ottavio (1928-2018)</a> married <a href=\"https://www.findagrave.com/memorial/166858754/lucy-marie-branzetti\" target=\"_blank\" rel=\"noopener\">Barbo (in Branzetti), Lucy Marie (1930-2002)</a> in 1949<br><br>&nbsp;&nbsp;<a href=\"https://www.findagrave.com/memorial/75515432/paul-l-branzetti\" target=\"_blank\" rel=\"noopener\">Branzetti, Paul L. (1932-2011)</a>married <a href=\"https://www.findagrave.com/memorial/205005216/marilyn-m-branzetti\" target=\"_blank\" rel=\"noopener\">Morse (in Branzetti), Marilyn M. (1933-2018)</a><br>&nbsp;&nbsp;1) <a href=\"https://www.findagrave.com/memorial/284514374/eric-franklin-branzetti\" target=\"_blank\" rel=\"noopener\">Branzetti, Eric Franklin (1962-2025)</a>", "Brunelli": "<b>Brunelli, Peter (c. 1843)</b> arrived in Ireland before 1881 and married <b>Brunelli, Mary (c. 1847)</b>.<br>1) <b>Brunelli (in Glynn), Mary (c. 1881)</b> married <b>Glynn, George</b> in 1903<br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2003493\" target=\"_blank\" rel=\"noopener\">Glynn, Christopher (1905)</a><br>&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1319999\" target=\"_blank\" rel=\"noopener\">Glynn, John (1911)</a>", "Brunicardi": "<b>Brunicardi, Sebastian Angelo (1842-1916)</b> was born in Dublin, married <b>Hogg (in Brunicardi), Maria Theresa (1842-1926)</b> in 1866.<br>1) <b>Brunicardi, Letitia Mary A. (c. 1879)</b><br>2) <b>Brunicardi, Maria Josephine (1873-1943)</b><br>3) <b>Brunicardi, Dominic Nicholas (c. 1876)</b><br>4) <b>Brunicardi, Sebastian Louis Luke (1880-1964)</b>", "Campana": "<b>Campana, John (c. 1859)</b> arrived in Ireland before , worked as a <b>barber</b> or <b>hair dresser</b> and married <b>Murtagh (in Campana), Margarett (c. 1866-1912)</b>. They had children moving from Dublin to Cork to Limerick.<br>1) <b>Campana, Mario (1886)</b> married <b>Campana, Lizeff</b> around 1909. She was from Scotland.<br>2) <b>Campana (in Dorgan), Anita (1889)</b> married <b>Dorgan, Michael</b> in 1906<br>3) <b>Campana, Leo (1890)</b><br>4) <b>Campana (in Mercer), Clara (1891)</b> married <b>Mercer, Keith</b> in 1909<br>5) <b>Campana, John (1893-1893)</b> died young<br>6) <b>Campana (in Odwyer), Margarett (1895)</b> married <b>Odwyer, Alfred</b> in 1915.", "Caprani": "Hai solo fatto le 4 schede dei censimenti 1901 e 1911 e cercato Caprani su Grave<br><br><b>Caprani, Giuseppe Fedele (1839-1920)</b> was a foreman stereotyper arrived in Ireland before 1878, married <b>Bennett (in Caprani), Hannah (c. 1842-1922)</b><br>1) <b>Caprani, Joseph Patrick (1870-1875)</b><br>2) <b>Caprani, John Alexander (1874-1875)</b><br>3) <b>Caprani, Joseph (c. 1878-c. 1928)</b> probably married <a href=\"https://www.findagrave.com/memorial/289250294/annie-caprani\" target=\"_blank\" rel=\"noopener\">Caprani, Annie (c. 1888-1941)</a><br>4) <b>Caprani, John Alexander (c. 1881-1963)</b> married <b>Caprani, Mary (c. 1886-1974)</b><br>&nbsp;&nbsp;1) <b>Caprari, John Alexander (c. 1918-1986)</b><br>&nbsp;&nbsp;2) <b>Caprani, Edward (-1995)</b><br>5) <b>Caprani, Louisa (c. 1883)</b><br>6) <b>Caprani, Rosalina (c. 1886)</b><br>7) <b>Caprani, Henry (1887)</b><br>sistema le religioni dei figli nei censimenti 1901 e 1911<br><br><b>Caprani, Menotti Giovanni (1866-1931)</b> was a printer compositer, married <b>O'Connor (in Caprani), Margaret Mary (c. 1873-1956)</b> in 1893<br>1) <b>Caprani, Elizabeth (c. 1896)</b><br>2) <b>Caprani, Joseph (1897-1980)</b> married <b>Wayte (in Caprani), Evelyn Maud (1898-1955)</b><br>&nbsp;&nbsp;1) <b>Caprani, Desmond John (c. 1839-1954)</b><br>3) <b>Caprani, John Anthony (1899-1918)</b><br>4) <b>Caprani, Hannah (c. 1902)</b><br>5) <b>Caprani, Henry F. (c. 1903)</b><br>6) <b>Caprani, Margaret M. (c. 1905)</b><br>7) <b>Caprani, Monotte V. (c. 1910)</b><br><br><a href=\"https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=caprani&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date\" target=\"_blank\" rel=\"noopener\">https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=caprani&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date</a><br><br><a href=\"https://www.findagrave.com/memorial/285459383/george-caprani\" target=\"_blank\" rel=\"noopener\">https://www.findagrave.com/memorial/285459383/george-caprani</a><br><a href=\"https://www.findagrave.com/memorial/285459390/margaret-caprani\" target=\"_blank\" rel=\"noopener\">https://www.findagrave.com/memorial/285459390/margaret-caprani</a><br><a href=\"https://www.findagrave.com/memorial/86056976/gerald-caprani\" target=\"_blank\" rel=\"noopener\">https://www.findagrave.com/memorial/86056976/gerald-caprani</a><br><a href=\"https://www.findagrave.com/memorial/98261318/patricia-caprani\" target=\"_blank\" rel=\"noopener\">https://www.findagrave.com/memorial/98261318/patricia-caprani</a>", "Corrieri": "<b>BOLD</b> Census 1901<br><i>Italic</i> Census 1911<br><i><b>both</b></i><br><br><i><b><b>Corrieri, Louis (c. 1838 or 1845-1916)</b></b></i> married <i><b><b>Lucchesi (in Corrieri), Margaret (c. 1848 or 1857-1920)</b></b></i> in 1866<br>1) <b><b>Corrieri, Francis (1868-1916)</b></b> married <b><b>O'Brian (in Corrieri), Mary Ann (c. 1873-1906)</b></b><br>&nbsp;&nbsp;1) <i><b><b>Correri, Louis (1896)</b></b></i> married <b>O'Leary (in Corrieri), Bridget (c. 1896-1955)</b> in 1917 <a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-2412774\" target=\"_blank\" rel=\"noopener\">her death</a><br>&nbsp;&nbsp;2) <b>Corrieri, Mary Margaret (1897-1897)</b><br>&nbsp;&nbsp;3) <b>Curraro, Rosanna (1898)</b><br>&nbsp;&nbsp;4) <b>Corrieri, Francis (1901)</b><br>&nbsp;&nbsp;5) <b>Corrieri (in Flynn), Elizabeth (1903)</b> married <b>Flynn, John</b> in 1938<br>&nbsp;&nbsp;6) <b>Corrieri, Peter 'Patrick' (1905-1906)</b><br>&nbsp;&nbsp;remarried <b>Falvey (in Corrieri), Mary</b> in 1909<br>2) <b>Correri, John Joseph (c. 1873-1875)</b><br>3) <b>Correri, Louis (1875)</b><br>4) <b>Coreri, Angelina (1877-1877)</b><br>5) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-4692329\" target=\"_blank\" rel=\"noopener\">Corrieri, Unkown (1882)</a> male, <i>could be Patrick</i><br>6) <i><b><b>Correri, Patrick (c. 1883)</b></b></i> married <i><b>O'Flynn (in Correri), Julia (c. 1877-1913)</b></i> in 1910 died in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-5286860\" target=\"_blank\" rel=\"noopener\">1913</a><br>7) <b>Correri, Michael (1884)</b><br>8) <b>Corrieri (in Cunnann), Rosanna</b> married <b>Cunneen, James</b> in 1898<br>&nbsp;&nbsp;1) <i><a href=\"https://www.census.nationalarchives.ie/pages/1911/Cork/Cork_No__7_Urban__part_of_/Ballard_s_Lane/396489/\" target=\"_blank\" rel=\"noopener\">Cunnann, Mary (c. 1900)</a></i><br>&nbsp;&nbsp;2) <i><a href=\"https://www.census.nationalarchives.ie/pages/1911/Cork/Cork_No__7_Urban__part_of_/Ballard_s_Lane/396489/\" target=\"_blank\" rel=\"noopener\">Cunnann, Elizabeth (1903)</a></i> <a href=\"https://www.irishgenealogy.ie/view?record_id=e768beed6b-2318846\" target=\"_blank\" rel=\"noopener\">birth</a><br>&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2105659\" target=\"_blank\" rel=\"noopener\">Cuneen, Thomas (1905)</a><br><br><b><b>Correri, Eliza (c. 1871)</b></b><br><br><b>Corrieri, Leo</b><br>1) <i><b>Corrieri, Leopoldo Manuel 'Hubert' (c. 1879)</b></i> married <b>Kennedy (in Correri), Mary</b> in 1923 who remarried in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-1411683\" target=\"_blank\" rel=\"noopener\">1937</a> with <b>Fox, John</b><br>&nbsp;&nbsp;1) <b>Correri (in Price), Doloris Maria Mafalda (1924)</b> married <b>Price, Richard</b> in 1944<br>2) <i><b>Correri, Guido (c. 1893)</b></i><br><b>Corrieri, Beatrice</b> probably a relative<br><br><mark><b>Currari, Maria (c. 1863-1883)</b></mark> could be the mother of <br><mark><b>Currari, Agustino (c. 1880-1880)</b> child of a servant</mark><br><br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-1658372\" target=\"_blank\" rel=\"noopener\">Corriere, Lionello (c. 1895-1940)</a> died in Workhouse Sea Internment Camp, Edinburgh <br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-4557638\" target=\"_blank\" rel=\"noopener\">Coneri, Michael (c. 1883-1902)</a> manca la pagina", "Corvini": "<b>Corvini, Gustavo (c. 1836-1905)</b> arrived in Ireland before. Married <b>Gleeson (in Corvini), Mary (c. 1834-1880)</b>.<br>1) <b>Corvini, Emily (c. 1856-1890)</b><br>2) <b>Corvini, Pacifico (c. 1859)</b><br>3) <b>Corvini, Alvila Maria (c. 1862)</b><br>Married <b>McCann (in Corvini), Mary Anne (c. 1871)</b> in 1887. Had 2 children. 1 alive in 1911.<br>4) <b>Corvini, Mary Catherina (1888)</b><br>5) <b>Corvini, Guastavus Dominick Peter (1891-1975)</b> married <b>Corvini, Mary (c. 1900-1974)</b>", "Curatolo": "<b>Curatolo, Dominick (c. 1874-1913)</b> son of <b>Curatolo, Gerald</b> arrives in Ireland before 1899 working as a <b>musician</b> when he married <b>Byrne (in Curatolo), Mary (c. 1877)</b>.<br>They have 4 children (as stated in the 1911 Census) 2 of which dying before the census<br>1) <b>Curatolo, Gerald (1900)</b><br>2) <b>Curatolo, Bridgit Mary (1902-1905)</b><br>3) <b>Curatolo, Rosanna (1904-1904)</b><br>4) <b>Curatolo, Philomena (1907)</b><br><br>You have not found any grandchildren nor grave.", "Delicato": "<b>Delicato, Benedetto (1872)</b> married <b>Forte (in Delicato), Maria Antonia (c. 1868)</b><br>1) <b>Delicato, Giuseppe Domenico (1894-1917)</b><br>2) <b>Delicato, Domenico (c. 1898-1947)</b> married <b>Matassa (in Delicato), Francesca (c. 1903-1995)</b><br>&nbsp;&nbsp;1) <b>Delicato (in Connolly), Benedetta Maria (1922)</b> married <b>Connolly, Patrick</b> in 1945<br>&nbsp;&nbsp;2) <b>Delicato (in Forte), Giuseppina Domenica (1923-2023)</b> married <b>Forte, Luigi Antonio (1919-2009)</b> in 1944<br>&nbsp;&nbsp;3) <b>Delicato, Benedetto (1925-1992)</b><br>&nbsp;&nbsp;4) <b>Delicato, Nicolino (1927-2019)</b><br>&nbsp;&nbsp;5) <b>Delicato, Rose Marie (c. 1938-1961)</b><br>&nbsp;&nbsp;6) ???<br>&nbsp;&nbsp;7) <b>Delicato, Stanislao (-2011)</b><br>&nbsp;&nbsp;8) ???<br>3) <b>Delicato, Maria Felice (1903)</b><br>4) <b>Delicato, Celeste (1905-1907)</b><br>5) <b>Delicato, Nicola Antonio (1908-1908)</b><br>6) <b>Delicato, Maria Alessandra (1909)</b>", "Desano": "<b>Desano, John</b><br>1) <b>Desano, James 'Sammy' Pasqualino (c. 1888-1951)</b> married <b>McLear (in Desano), Jean (c. 1890-1931)</b> in 1907<br>&nbsp;&nbsp;1) <b>Desano, Pasqualina (1909)</b><br>&nbsp;&nbsp;2) <b>Desano, William James (1913-1995)</b> probably married <a href=\"https://www.findagrave.com/memorial/181705280/elizabeth-desane\" target=\"_blank\" rel=\"noopener\">Desano, Elizabeth (-1972)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.findagrave.com/memorial/181705288/ronald-nelson-desano\" target=\"_blank\" rel=\"noopener\">Desano, Ronald Nelson (c. 1930-1998)</a><br>&nbsp;&nbsp;3) <b>Desano, Violet Rosetta (1917)</b><br>&nbsp;&nbsp;4) <b>Desano, Annie (1919)</b><br>&nbsp;&nbsp;5) <b>Desano, Blanche (1924-1925)</b><br>&nbsp;&nbsp;I think he remarried <b>Desano, Emily</b><br>&nbsp;&nbsp;6) <a href=\"https://www.findagrave.com/memorial/181705282/cecil-desano\" target=\"_blank\" rel=\"noopener\">Desano, Cecil (c. 1934-1983)</a> several <a href=\"https://www.britishnewspaperarchive.com/image-viewer?issue=BL%2F0002318%2F19831112&amp;page=2&amp;article=019&amp;stringtohighlight=desano\" target=\"_blank\" rel=\"noopener\">articles</a><br>&nbsp;&nbsp;7) <a href=\"https://www.findagrave.com/memorial/250994359/emily-desano\" target=\"_blank\" rel=\"noopener\">Desano, Emily (-2018)</a><br><br><a href=\"https://www.findagrave.com/memorial/181705286/pasqual-stanley-desano\" target=\"_blank\" rel=\"noopener\">Desano, Pasqual Stanley (c. 1927-1928)</a>", "Esposito": "<b>Esposito, Francesco (c. 1851-1912)</b> was an <b>ice cream vendor</b>, arrived in Ireland before 1886. Married <b>Tracy (in Esposito), Catherine (c. 1865-1896)</b> in 1881. <br>1) <b>Esposito, Angelina Mary (1887)</b> married <b>Kavanagh, Thomas</b> in 1912.<br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1152255\" target=\"_blank\" rel=\"noopener\">Kavanagh, Margaret (1913)</a><br>&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-936263\" target=\"_blank\" rel=\"noopener\">Kavanagh, Angelina (1915)</a><br>&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-241999\" target=\"_blank\" rel=\"noopener\">Kavanagh, Rachel (1922)</a><br>2) <b>Esposito, Francis (c. 1887-1932)</b> married <b>Lally (in Esposito), Rosanna (c. 1884-1962)</b> in 1912.<br>&nbsp;&nbsp;1) <b>Esposito, Rosanne Bridget (1914-1914)</b><br>&nbsp;&nbsp;2) <b>Esposito, Francis Joseph (1915)</b><br>&nbsp;&nbsp;3) <b>Esposito, Louis Edward (1916)</b> married <b>Forwood (in Esposito), Mary</b> in 1947<br>&nbsp;&nbsp;4) <b>Esposito, Edward (1919)</b><br>&nbsp;&nbsp;5) <b>Esposito (in Elliott), Catherine 'Maggie' Helen (1921)</b> married <b>Elliott, James</b> in 1943<br>&nbsp;&nbsp;6) <b>Esposito (in Watson), Angela Mary (1923)</b> married <b>Watson, Alfred</b> in 1948<br>&nbsp;&nbsp;7) <b>Esposito, Thomas Leo (1925)</b><br>&nbsp;&nbsp;8) <b>Esposito, Patrick (1927-1927)</b><br>&nbsp;&nbsp;9) <b>Esposito, Mary (1927-1927)</b><br>&nbsp;&nbsp;10) <b>Esposito, Unknown (1929-1929)</b><br>3) <b>Esposito, Thomas (1891)</b><br>4) <b>Esposito, Louis Antonio (1893-1915)</b><br>Married <b>Kenny (in Gorman in Esposito), Ellen (c. 1861)</b> in 1899.<br><br><i>Non sono molto sicuro dei matrimoni delle due figlie di Francis, c'e abbastanza casino con i nomi gia a partire dai Birth Record, Census etc</i><br><br><b>Esposito, Michele (1855-1929)</b> was a <b>professor of music</b>, arrived in Ireland before 1880. Married <b>Klebnicoff (in Esposito), Nathalie (c. 1858)</b><br>1) <b>Esposito, Bianca (c. 1880)</b><br>2) <b>Esposito, Vera (1883)</b><br>3) <b>Esposito, Mario (1887)</b><br>4) <b>Esposito, Nina (c. 1890)</b>", "Farina": "<b>Farina, Raphael (c. 1886-1944)</b> married <b>Farina, Rose (c. 1883-1968)</b><br>1) <b>Farina (in Dharmarajah), Kathleen (c. 1907)</b> married <b>Dharmarajah, Dubranamiam</b> in 1928<br>&nbsp;&nbsp;1) <a href=\"https://www.findagrave.com/memorial/289316264/ivan-s-dharmarajah\" target=\"_blank\" rel=\"noopener\">Dharmarajah, Ivan S. (c. 1930-1934)</a><br>2) <b>Farina, Angelamaria (c. 1909)</b><br>3) <b>Farina, Pietro (1910-1981)</b> married <b>Smyth (in Farina), Margaret (c. 1915-1988)</b> in 1943<br>4) <b>Farina, Raffaele (1912)</b><br>5) <b>Farina, Daniel</b> married <b>Ridgeway (in Farina), Teresa</b> in 1934", "Forgione": "<b>Forgione, Orazio</b><br>1) <b>Forgione, Antonio (c. 1867)</b> married <b>Cervi (in Forgione), Philomena (c. 1871)</b> in 1889<br>&nbsp;&nbsp;1) <b>Forgione, Mariantonia (1891-1894)</b><br>&nbsp;&nbsp;2) <b>Forgione, Augustine (1892)</b> married <b>Magee (in Forgione), Elizabeth</b><br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Forgione, Anthony (1913)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Forgione, Elizabeth (1914)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Forgione, Joseph (1916)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Forgione, James (1918-1918)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Forgione, Eileen (1919-1919)</b><br>&nbsp;&nbsp;3) <b>Forgione, Joseph (1894)</b> married <b>Rice (in Forgione), Mary</b> in 1918<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Forgione, John (1919)</b><br>&nbsp;&nbsp;4) <b>Forgione, John (1896)</b> married <b>Sinclair (in Forgione), Margaret</b> in 1918<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Forgione, Dorcas (1919)</b><br>&nbsp;&nbsp;5) <b>Forgione, Pasquale (1898)</b><br>&nbsp;&nbsp;6) <b>Forgione, Carlo (c. 1901)</b> <i>forse <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2738404\" target=\"_blank\" rel=\"noopener\">birth record</a> ma sarebbe contrario ai dati del Census</i><br>&nbsp;&nbsp;7) <b>Forgione, Peter (1901)</b><br>&nbsp;&nbsp;8) <b>Forgione, Loni (c. 1903)</b><br>&nbsp;&nbsp;9) <b>Forgione, Vincenzo (1904)</b><br>&nbsp;&nbsp;10) <b>Forgione, Leo (1907)</b><br>2) <b>Forgione, Dominick (c. 1870)</b> married <b>Reeves (in Forgione), Ellen (c. 1877)</b> in 1897<br>&nbsp;&nbsp;1) <b>Forgione, Raphael (1898)</b><br>&nbsp;&nbsp;2) <b>Forgione, Francis (c. 1900)</b><br>&nbsp;&nbsp;3) <b>Forgione, Mary Annie (1903-1903)</b><br><br><b>Forgione, John (c. 1879)</b> married <b>Robinson (in Forgione), Elizabeth (c. 1883)</b><br>1) <b>Forgione, Mary (1904)</b><br>2) <b>Forgione, Elina (1908)</b><br>3) <b>Forgione, Horace (1911-1911)</b><br>4) <b>Forgione, John (1915-1915)</b><br>5) <b>Forgione, Dorothy (1917)</b><br><br><b>Forgin, John (c. 1880)</b> <i>forse è</i> <b>Forgione, John (c. 1879)</b><br><br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-1831342\" target=\"_blank\" rel=\"noopener\">Matrimonio</a> tra un John Forgione, figlio di Orazio Forgione, che dovrebbe essere nato nel 1879 con Agnes McGrady<br>1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-412631\" target=\"_blank\" rel=\"noopener\">Forgione, Agnes (1920)</a> married <b>Gillan, Patrick</b> in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-1486204\" target=\"_blank\" rel=\"noopener\">1940</a>", "Gagliardi": "<b>Gagliardi, Ivan</b><br>1) <b>Gagliardi, Joseph (c. 1861-1929)</b> married <b>Bryan (in Gagliardi), Alice (c. 1858-1923)</b> around 1894<br>&nbsp;&nbsp;1) <b>Gagliardi, John (1895-1917)</b><br>&nbsp;&nbsp;2) <b>Gagliardi, Martin (1897-1907)</b><br>&nbsp;&nbsp;3) <b>Gagliardi, Joseph (1900-1900)</b><br>&nbsp;&nbsp;4) <b>Gagliardi, Mary (1901)</b><br><br><b>Gagliardi, Sarah (c. 1843-1893)</b> Wife of Organ Grinder", "Gargano": "<b>Gargano, Pietro (c. 1853)</b> married <b>Diplacito (in Gargano), Felicita (c. 1875)</b> daughter of <b>Capali, Alexandra (c. 1844)</b><br>1) <b>Gargano, Vincent (c. 1886)</b> married <b>Templeton (in Gargano), Mary Elizabeth</b><br>&nbsp;&nbsp;1) <b>Gargano, Vincenza (1912)</b><br>&nbsp;&nbsp;2) <b>Gargano, Vincenzo (1917)</b><br>2) <b>Gargano, Palmar (c. 1896)</b><br>3) <b>Gargano, Toney (c. 1901)</b><br>4) <b>Gargano, Vincenzina (1902)</b><br>5) <b>Gargano, Angelo (1904)</b><br>6) <b>Gargano, Maria Carmine (1906)</b><br>7) <b>Gargano, Nicola (1910)</b>", "Gasparro": "There are at least three Gasparro brothers, son of <b>Gasparro, Prospero</b>.<br><br><b>Gasparro, Francis (1853-1892)</b> was a <b>musician</b> and married <b>Doyle (in Gasparro), Catherine</b> in 1876.<br>They have children.<br>1) <b>Gasparro, Christina (1880-1881)</b><br>2) <b>Gasparro (in Savino), Mary Rose (1877-1955)</b> who married <b>Savino, Giuseppe (1878-1941)</b> (see <b>Savino</b>)<br><br><b>Gasparro, Antony</b> was a <b>musician</b> and married <b>Murphy (in Gasparro), Mary (c. 1864-1891)</b> in 1882.<br>They have at least 4 children:<br>1) <b>Gasparro, Mary Rose (1883-1933)</b> <br>2) <b>Gasparro, Francis Christopher (1884)</b><br>3) <b>Gasparro, Nicholas (1887-1957)</b> who became a <b>postman</b> (and later a <b>post office officer</b>) and married <b>Carey (in Gasparro), Catherine (c. 1887-1974)</b> in 1911.<br>They had children<br>&nbsp;&nbsp;1) <b>Gasparro, Anthony Edward (1912)</b> who became a <b>plumber</b> and married <b>Richardson (in Gasparro), Olive</b> in 1935.<br>&nbsp;&nbsp;2) <b>Gasparro, Nicholas (1913)</b> who became a <b>postman</b> and married <b>Blake (in Gasparro), Brigid (-1983)</b> in 1943.<br>&nbsp;&nbsp;3) <b>Gasparro, Francis Noel (1914-1990)</b> who married <b>Gasparro, Jeanette Helen (c. 1918-1975)</b><br>&nbsp;&nbsp;4) <b>Gasparro, Margaret Mary (1919-1920)</b><br>&nbsp;&nbsp;5) <b>Gasparro, Dermot Patrick (1921)</b> who became a <b>plumber</b> and married <b>Twohy (in Gasparro), Marie</b> in 1948.<br>&nbsp;&nbsp;6) <b>Gasparro, Brendan Christopher (1923-2010)</b> who married <b>Gasparrow, Anita (c. 1927-2019)</b>. They had a child<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Gasparro, Brendan Jr. (1953-2025)</b><br>4) <b>Gasparro, Prosper (1889-1889)</b><br>He later married <b>Redmond (in Gasparro), Anne</b> in 1892.<br><br><b>Gasparro, Nicholas</b> was a <b>musician</b> and married <b>Ritchie (in Gasparro), Mary (c. 1849-1888)</b> in 1887. <a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-6268121\" target=\"_blank\" rel=\"noopener\"></a><br>They have children<br>1) <b>Gasparro, John Joseph (1887)</b>", "Gillini": "<b>Gillini, Peter</b><br>1) <b>Gillini, John (c. 1852-1921)</b> was a builder labourer and arrived in Ireland before 1882 and married <b>Morton (in Gillini), Elizabeth (c. 1862-1920)</b>. They had 5 children. 1 Alive in 1911.<br>&nbsp;&nbsp;1) <b>Gillini (in Reardon), Teresa Caroline (c. 1882)</b> married <b>Reardon, Patrick</b> in 1911.<br>&nbsp;&nbsp;2)  <b>Gillini, Sarah Anne (c. 1886-1887)</b><br>&nbsp;&nbsp;3) <b>Gillini, William John (c. 1889-1896)</b><br>&nbsp;&nbsp;4) <b>Gillini, Lily (1895)</b>", "Knocker": "<b>Knocker, Francis (c. 1885)</b> married <b>Murphy (in Knocker), Elizabeth (c. 1890)</b> non ho trovato l'atto di matrimonio o gli atti di nascita dei primi figli<br>1) <b>Knocker, Mary (c. 1906)</b><br>2) <b>Knocker, Antony (c. 1909)</b><br>3) <b>Knocker, Angelina (1911)</b><br>4) <b>Knocker, Elizabeth (1913)</b><br>5) <b>Knocker, Bridget (1916)</b><br>6) <b>Knocker, Giovanni (1918)</b><br>7) <b>Knocker, Isabella (1921)</b>", "Lombardi": "<b>Lombardi, Agabito (c. 1856)</b> was a dealer, he arrived in Cork before 1884 and married <b>Lombardi, Mary Jane (c. 1864)</b> in 1883. In 1918 he is a soldier.<br>1) <b>Lombardi, Reynold 'Richard' (c. 1884-1956)</b> married <b>Driscoll (in Lombardi), Annie (c. 1886-1955)</b> in 1907<br>&nbsp;&nbsp;1) <b>Lombardi, Katherine (1907)</b><br>&nbsp;&nbsp;2) <b>Lombardi, Mary Jane (c. 1908-1908)</b><br>&nbsp;&nbsp;3) <b>Lombardi, Michael John (c. 1910)</b> married <b>Murphy (in Lombardi), Joan</b> in 1941.<br>&nbsp;&nbsp;4) <b>Lombardi, Lizzie (1912)</b><br>&nbsp;&nbsp;5) <b>Lombardi, Joseph (1914)</b><br>&nbsp;&nbsp;6) <b>Lombardi, Reynold (1916-1918)</b><br>&nbsp;&nbsp;7) <b>Lombardi, Reynold (1918)</b><br>2) <b>Lombardi, Michael Patrick (1885)</b><br>3) <b>Lombardi, Elizabeth (1891)</b><br>4) <b>Lombardi, Agabito Joseph (1894-1916)</b><br>5) <b>Lombardi (in Broughton), Anne Jane (c. 1898)</b> married <b>Broughton, William</b>] in 1920<br><br>I think that the <b>Lombardi, Ronald</b> son of <b>Lombardi, Roland</b> who married <b>Rice (in Lombardi), Mary</b> in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-1099807\" target=\"_blank\" rel=\"noopener\">1946</a> is actually <b>Lombardi, Reynold (1918)</b> but I have to check the graves.", "Lucchesi": "<b>Lucchesi, George</b> witness to wedding of <b>Rosato, Domenico</b><br><br><b>Lucchesi, Elizabeth</b> witness to birth and godmather of <b>Bassi, Olivia Catherine (1865-1866)</b><br><br><b>Lucchesi (in Corrieri), Margaret (c. 1848 or 1857-1920)</b> married <b>Corrieri, Louis (c. 1838 or 1845-1916)</b><br><br><b>Lucchesi, Gustavo</b><br>1) <b>Lucchesi, Giocondo (c. 1887-1955)</b> married <b>Halloway (in Lucchesi), Alice (c. 1891-1927)</b> in 1915<br>&nbsp;&nbsp;1) <b>Lucchesi (in Lynch), Teodora Monica (1916)</b> married <b>Lynch, James</b> in 1947<br>&nbsp;&nbsp;Remarried with <b>Riordan (in Oakey in Lucchesi), Anne Kate</b> in 1929<br>2) <b>Lucchesi, Enrico (c. 1875-1933)</b> married <b>Halloway (in Lucchesi), Hannah (c. 1886)</b> in 1918<br><br><b>Lucchesi, Nancy (c. 1891-1949)</b> <br><br><b>Lucchesi, Domenico</b><br>1) <b>Lucchesi (in Antwis), Elizabeth</b> married <b>Antwis, Robert</b> in 1884<br><br><b>Lucchesi, Casimiro</b> married <b>Savage (in Lucchesi), Rose</b> in <a href=\"https://www.irishgenealogy.ie/view/?record_id=1dd9f6479b-31112\" target=\"_blank\" rel=\"noopener\">1842</a><br>1) <b>Lucchesi, Matilda (c. 1838)</b> <a href=\"https://www.irishgenealogy.ie/view/?record_id=c963d01f6e-231\" target=\"_blank\" rel=\"noopener\">baptism</a><br>2) <b>Lucchesi, Margarita (c. 1845)</b> <a href=\"https://www.irishgenealogy.ie/view/?record_id=c963d01f6e-8593\" target=\"_blank\" rel=\"noopener\">baptism</a><br><br><b>Lucchesi, Bernardino</b> godfather in <a href=\"https://www.irishgenealogy.ie/view/?record_id=1dd9f6479b-31112\" target=\"_blank\" rel=\"noopener\">1830</a><br><br><b>Lucchesi, Clemente</b> married <b>Lucchesi, Elizabeth</b><br>1) <b>Lucchesi, Candida Trusolina (c. 1843)</b> <a href=\"https://www.irishgenealogy.ie/view/?record_id=c963d01f6e-5881\" target=\"_blank\" rel=\"noopener\">baptised</a><br>2) <b>Lucchesi, Elisabeth (c. 1850)</b> <a href=\"https://www.irishgenealogy.ie/view/?record_id=c963d01f6e-17270\" target=\"_blank\" rel=\"noopener\">baptised</a>", "Marchetti": "<b>Marchetti, Lorance (c. 1878)</b> married <b>Marchetti, Chelda (c. 1890)</b> around 1910.<br>1) <b>Marchetti, Emmey (c. 1911)</b><br><br><b>Marchetti, Louis (c. 1851)</b> married <b>Marchetti, Mary (c. 1861)</b> around 1885. 10 children 6 alive.<br>1) <b>Marchetti, Joseph (c. 1889)</b><br>2) <b>Marchetti, Maryan (c. 1891)</b><br>3) <b>Marchetti, Francis (c. 1893)</b><br>4) <b>Marchetti, Elizabeth (c. 1895)</b><br>5) <b>Marchetti, Philomena (c. 1897)</b><br>6) <b>Marchetti, Anthony (c. 1900)</b><br>7) <b>Marchetti (in Shortall), Kathleen (c. 1903)</b><br>8) <b>Marchetti, Gerrard (c. 1907)</b>", "Marchini": "<b>Marchini, Giuseppe</b><br>1) <b>Marchini, Armando (c. 1882)</b> married <b>Marchini, Jane (c. 1883)</b><br>&nbsp;&nbsp;1) <b>Marchini, Joseph (c. 1907)</b><br>&nbsp;&nbsp;2) <b>Marchini, Frederick (1915)</b>", "Marino": "<b>Marino, Domenico Antonio (c. 1856-1913)</b><br>1) <b>Marino, Michael James (c. 1880)</b> married <b>Scott (in Marino), Annie</b> in 1912<br>2) <b>Marino (in Nuttmen), Christina</b> married <b>Nuttman, George</b> in 1913<br><br><b>Marino, Michael</b> married <b>Marino, Mary (c. 1871)</b><br>1) <b>Marino, Catherine (c. 1893)</b><br>2) <b>Marino, Chrissie (c. 1896)</b><br>3) <b>Marino, Joseph (c. 1898)</b><br>4) <b>Marino, Ralphel (c. 1900)</b><br>5) <b>Marino, Dominick (c. 1903)</b><br>6) <b>Marino, Angelo (c. 1905)</b><br>7) <b>Marino, Francis (1907)</b>", "Meconi": "<b>Meconi, Louis</b> <br>1) <b>Meconi, Daniel (c. 1844-1909)</b> married <b>Bartley (in Meconi), Bridget (c. 1847-1881)</b>.<br>&nbsp;&nbsp;1) <b>Meconi (in Pappin), Mary Ellen (c. 1874)</b> married <b>Pappin, William M.</b> in 1899<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2202481\" target=\"_blank\" rel=\"noopener\">Pappin, Brigid (1904)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2013469\" target=\"_blank\" rel=\"noopener\">Pappin, Daniel (1905)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1817038\" target=\"_blank\" rel=\"noopener\">Pappin, Julia (1907)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1414987\" target=\"_blank\" rel=\"noopener\">Pappin, Mary (1910)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1173737\" target=\"_blank\" rel=\"noopener\">Pappin, Annie (1912)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;6) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1040680\" target=\"_blank\" rel=\"noopener\">Pappin, Dorothy (1914)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;7) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-857053\" target=\"_blank\" rel=\"noopener\">Pappin, Michael (1915)</a><br>&nbsp;&nbsp;2) <b>Meconi (in Williams), Elizabeth (c. 1876)</b> married <b>Williams, James</b> in 1917<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-481523\" target=\"_blank\" rel=\"noopener\">Williams, Bridget (1919)</a><br>&nbsp;&nbsp;3) <b>Meconi, Michael Luigi (1878)</b><br>&nbsp;&nbsp;4) <b>Meconi, Rosanna (1880-1881)</b><br>2) <b>Meconi, Denis (c. 1845-1906)</b> was a moulder and figure maker. He arrived in Ireland before 1879 and married <b>Devlin (in Meconi), Bridget (c. 1860-1900)</b> in 1877<br>&nbsp;&nbsp;1) <b>Meconi (in McKay), Lena (1877)</b> married <b>McKay, William</b> in 1907<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1922476\" target=\"_blank\" rel=\"noopener\">McKay, Denis (1906)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1270517\" target=\"_blank\" rel=\"noopener\">McKay, Benjamin (1912)</a> <br>&nbsp;&nbsp;2) <b>Meconi (in McLoughlin), Mary Ann (1879)</b> married <b>McLoughlin, Henry (c. 1882)</b> in 1899.<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>McLoughlin, Margaret (c. 1900)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2549089\" target=\"_blank\" rel=\"noopener\">McLoughlin, Eveline (1901</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1890532\" target=\"_blank\" rel=\"noopener\">McLauglin, Ruby (1906)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1661775\" target=\"_blank\" rel=\"noopener\">McLoughlin, Denis (1908)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1042967\" target=\"_blank\" rel=\"noopener\">McLaughlin, Robert (1914)</a><br>&nbsp;&nbsp;3) <b>Meconi, Jane (1880-1894)</b><br>&nbsp;&nbsp;4) <b>Meconi, Louis (1882)</b><br>&nbsp;&nbsp;5) <b>Meconi, Denis (c. 1886)</b><br>&nbsp;&nbsp;6) <b>Meconi, Daniel (1888)</b><br>&nbsp;&nbsp;7) <b>Meconi, Catherine (1893-1894)</b>", "Mongini": "<b>Mongini, Micheal (c. 1862-1902)</b> arrived in Ireland before 1881 and married <b>Lee (in Mongini), Abina 'Mary' (c. 1863)</b><br>1) <b>Mongini, Mary (c. 1881)</b><br>2) <b>Mongini, Louise (1883)</b><br>3) <b>Mongini, Kate (1884-1884)</b><br>4) <b>Mongini, Michael John (c. 1886-1888)</b><br>5) <b>Mongini, Abina (1887)</b><br>6) <b>Mongini, Rose (1888)</b><br>7) <b>Mongini, Albert (1891-1892)</b><br>8) <b>Mongini, Hannah Maria (1893)</b><br>9) <b>Mongini, Joseph Patrick (1895)</b><br>10) <b>Mongini, George (c. 1895)</b><br>11) <b>Mongini, Paul Joseph (c. 1897-1899)</b><br>12) <b>Mongini, Paul Joseph (1899)</b><br>13) <b>Mongini, James (1900-1967)</b><br><br><b>Mongini, Dominick (c. 1870)</b> arrived in Ireland before 1885 and married <b>O'Toole (in Mongini), Margaret (c. 1871)</b><br>1) <b>Mongini, Thomas (1884)</b> married <b>O'Brien (in Mongini), Catherine (c. 1888)</b> in 1908<br>&nbsp;&nbsp;a) <b>Mongini, Margaret (c. 1909-1913)</b><br>2) <b>Mongini, Margaret (1886-1888)</b><br>3) <b>Mongini, Joseph (1888)</b><br>4) <b>Mongini, Christopher (c. 1891)</b><br>5) <b>Mongini, John (1892)</b><br>6) <b>Mongini, Anthony (1893)</b><br>7) <b>Mongini, Stephen (1895-1898)</b><br>8) <b>Mongini, John (c. 1895)</b><br>9) <b>Mongini, Peter Anthony (1897-1900)</b><br>10) <b>Mongini, Mary (1900)</b><br>11) <b>Mongini, Rose (c. 1902-1903)</b><br>12) <b>Mongini, Michael (1904)</b><br>13) <b>Mongini, Margaret Pauline (1906)</b><br><br>Potrebbe essere Bongini?! Che è un cognome toscano", "Nannetti": "Cognome tosco-emiliano<br><br><a href=\"https://www.irishgenealogy.ie/view/?record_id=c72b4ccaf8-15700\" target=\"_blank\" rel=\"noopener\">Nannetti, Jacob</a> in 1843<br><b>Nannetti, Margaret</b><br><b>Nannetti, Stephen</b><br><b>Nannetti, Catherine</b><br><b>Nannetti, Anne</b><br><br>Nannetti Senior<br>1) <b>Nannetti, James</b> <a href=\"https://www.irishgenealogy.ie/view/?record_id=22e173d278-19\" target=\"_blank\" rel=\"noopener\">Already present in in 1834</a> married <b>Reddy (in Nannetti), Anne</b> in 1845<br>&nbsp;&nbsp;1) <b>Nannetti (in Keane), Monica (c. 1846)</b> married <b>Keane, Joseph</b> in 1884<br>&nbsp;&nbsp;2) <b>Nannetti, Letitia Sophia (c. 1848)</b><br>&nbsp;&nbsp;3) <b>Nannetti, Rosalea Agnes (c. 1849)</b><br>2) Nannetti, Father<br>&nbsp;&nbsp;1) <b>Nannetti, Joseph</b> married <b>Dempsey (in Nannetti), Bridget</b> in 1850<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Nannetti, Joseph William (c. 1850)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Nannetti, Joseph Patrick (1851-1915)</b> married <b>Egan (in Nannetti), Mary (c. 1857-1919)</b> in 1873<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Nannetti, Joseph Patrick (c. 1875-1942)</b> married <b>Clarke (in Nannetti), Maude (1877-1917)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Nannetti, Joseph Patrick (1901)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Nannetti, James (c. 1902-1902)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Nannetti, Frederick William (1903)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Nannetti, Edward Brendan (1905-1987)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Nannetti, Benedict (1908-1908)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;and married <b>Savage (in Nannetti), Mary (c. 1889)</b> in 1921<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6) <b>Nannetti, Mary Josephine (1921)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7) <b>Nannetti, James Ignatius (1925)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Nannetti, Mary (1878)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Nannetti, Louis Christopher (1880)</b> married <b>Barker (in Nannetti), Olivia (c. 1878-1926)</b> in 1923 <a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-2328779\" target=\"_blank\" rel=\"noopener\">(her death)</a> and <b>Hendrick (in Nannetti), Mary</b> in 1927 who I think dies in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-1353679\" target=\"_blank\" rel=\"noopener\">1941</a> at the age of 52, meaning she was born in 1889.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Nannetti (in Levey), Madeline Josephine (1882)</b> married <b>Levey, John</b> in 1918<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-491371\" target=\"_blank\" rel=\"noopener\">Levey, John (1919)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-376332\" target=\"_blank\" rel=\"noopener\">Levey, Mary (1920)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Nannetti, Bridget Mary (c. 1884-1884)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6) <b>Nannetti, Bernard Patrick (1885-1924)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Nannetti, James Joseph (c. 1852-1905)</b> married <b>Scully (in Nannetti), Maria (c. 1861-1919)</b> in 1883<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Nannetti, Joseph Thomas (1884-1884)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Nannetti, Bridget A. (1885-1918)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Nannetti, Maria Ellen (1887-1889)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Nannetti, Catherine (1889)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Nannetti, Rosanna (1891)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6) <b>Nannetti, James D. (1893-1932)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7) <b>Nannetti, Patrick (c. 1895-1916)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;8) <b>Nannetti, Anne (1897-1964)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;9) <b>Nannetti, John Joseph (1903-1964)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rimanendo vedova nel 1905, manda un paio di figli fuori casa<br>&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Nannetti, Rosanna Maria (c. 1854)</b><br><br>Da far fare a Claude: cerca nei censimenti tutti i Nannetti<br><br>Ci sono molte informazioni su Newspaper Archives, sarebbe da investigare di piu ma con calma. Ecco alcune info<br><br><a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0000819/18310601/006/0001\" target=\"_blank\" rel=\"noopener\">1831 06 01</a> Pubblicita d'arte di <b>Giacomo Nannetti</b><br><a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0000060/18531107/033/0007\" target=\"_blank\" rel=\"noopener\">1853 11 07</a> Pubblicita d'arte di <b>Gaspero Nannetti</b><br><a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0000060/18550416/027/0008\" target=\"_blank\" rel=\"noopener\">1855 04 16</a> La collezione di <b>Giacomo Nannetti</b>, morto, del Large Saloon, 241 Sauchiehall Street, viene venduta dal nipote e pupillo, <b>Giuseppe Nannetti</b>. <br><a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0004366/18551117/095/0014\" target=\"_blank\" rel=\"noopener\">1855 11 17</a> <b>Giuseppe Gaspero Nannetti (c. 1789-1855)</b>, di Bagnio di Lucca, muore l'11 novembre 1855 a 66 anni.<br><a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0000056/18570509/002/0002\" target=\"_blank\" rel=\"noopener\">1857 05 09</a> Pubblicita d'arte di <b>Giacomo Nannetti</b><br><a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0001057/18580416/050/0004\" target=\"_blank\" rel=\"noopener\">1858 04 16</a> <a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0001057/18580417/050/0004\" target=\"_blank\" rel=\"noopener\">1858 04 17</a> <a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0001057/18580419/032/0004\" target=\"_blank\" rel=\"noopener\">1858 04 19</a> <b>Giacomo Nannetti</b> vende la sua collezione.<br><a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0001112/18700630/034/0006\" target=\"_blank\" rel=\"noopener\">1870 06 30</a> <b>Gaspero James Nannetti</b> sposa Mary Elizabeth Fettes, figlia di Rev. Hames Fettes, di Douglas, Isle of Man.<br><a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0001960/18870108/051/0005\" target=\"_blank\" rel=\"noopener\">1887 01 08</a> <b>Gaspero James Nannetti</b> muore il 3 gennaio 1887 <a href=\"https://www.findagrave.com/memorial/280821086/gaspero_james-nannetti\" target=\"_blank\" rel=\"noopener\">Sepoltura</a><br><br><b>Giuseppe Gaspero Nannetti (c. 1789-1855)</b><br><b>Gaspero James Nannetti (c. 1842-1887)</b><br>Mary Finch Nannetti (1871-1946) <a href=\"https://www.findagrave.com/memorial/280829225/mary_finch-nannetti\" target=\"_blank\" rel=\"noopener\">Grave</a><br><div class=\"fnHeading\">FONTI UTILIZZATE</div><br><br>- Harald Beck, \"J.P. Nannetti and the Lord Mayor's antecedents,\" <i>James Joyce Online Notes</i> (December 2012): <a href=\"https://www.jjon.org/jioyce-s-people/nannetti\" target=\"_blank\" rel=\"noopener\">https://www.jjon.org/jioyce-s-people/nannetti</a><br><br>Nannetti’s Emporium of Fine Arts, No. 6 Great Brunswick Street. Henry Shaw's _Dublin Pictorial Guide &amp; Directory_ (1850)<br><br>- Marie Coleman, \"Nannetti, Joseph Patrick,\" <i>Dictionary of Irish Biography</i>: <a href=\"https://www.dib.ie/biography/nannetti-joseph-patrick-j-p-a6135\" target=\"_blank\" rel=\"noopener\">https://www.dib.ie/biography/nannetti-joseph-patrick-j-p-a6135</a><br>- Wikipedia: <a href=\"https://en.wikipedia.org/wiki/Joseph_Nannetti\" target=\"_blank\" rel=\"noopener\">https://en.wikipedia.org/wiki/Joseph_Nannetti</a><br>- Major Tweedy's Neighborhood: <a href=\"https://majortweedy.com/people-joseph-nannetti-200.html\" target=\"_blank\" rel=\"noopener\">https://majortweedy.com/people-joseph-nannetti-200.html</a><br>- Donal Fallon, \"Dublin's Little Italy,\" <i>Come Here To Me!</i> (2018): <a href=\"https://comeheretome.com/2018/04/30/dublins-little-italy/\" target=\"_blank\" rel=\"noopener\">https://comeheretome.com/2018/04/30/dublins-little-italy/</a><br>- FindAGrave: <a href=\"https://www.findagrave.com/memorial/62137921/joseph-patrick-nannetti\" target=\"_blank\" rel=\"noopener\">https://www.findagrave.com/memorial/62137921/joseph-patrick-nannetti</a><br>- Baptism record Joseph Wm Nannatti (1850): <a href=\"https://www.irishgenealogy.ie/view/?record_id=c963d01f6e-17656\" target=\"_blank\" rel=\"noopener\">https://www.irishgenealogy.ie/view/?record_id=c963d01f6e-17656</a><br>- Death record Joseph Nannette (1915): <a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-5442003\" target=\"_blank\" rel=\"noopener\">https://www.irishgenealogy.ie/view/?record_id=cide-5442003</a><br>- NLI Catalogue (condoglianze): <a href=\"https://catalogue.nli.ie/Record/vtls000745554\" target=\"_blank\" rel=\"noopener\">https://catalogue.nli.ie/Record/vtls000745554</a><br>- Ciaran Wallace, \"Joseph P. Nannetti, Lord Mayor 1906-08: 'a rather mild sort of rebel',\" in <i>Leaders of the City</i> (Four Courts, 2013)<br>- Mapping the Practice and Profession of Sculpture in Britain and Ireland 1851'1951 <a href=\"https://sculpture.gla.ac.uk/mapping/public/view/organization.php?id=msib3_1207746667\" target=\"_blank\" rel=\"noopener\">https://sculpture.gla.ac.uk/mapping/public/view/organization.php?id=msib3_1207746667</a>", "Notarantonio": "<b>Notarantonio, Vittorio</b> married Reale Nunciata<br>1) <b>Notarantonio, Antonio (c. 1881-1970)</b> married <b>Vergatti (in Notarantonio), Maria Grazia Rose (c. 1880-1903)</b> in 1898<br>&nbsp;&nbsp;1) <b>Notarantonio, Nemo Giovannino (1898)</b> married <b>McTeague (in Notarantonio), Sarah</b> in 1920<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Notarantonio, John (1920)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) Notarantonio Victor married O'Neill Anita (their grave are these, I think <a href=\"https://www.findagrave.com/memorial/198929599/victor-notaro\" target=\"_blank\" rel=\"noopener\">Victor (c. 1929-1991)</a> and <a href=\"https://www.findagrave.com/memorial/198929598/anne-notaro\" target=\"_blank\" rel=\"noopener\">Anne 'Nita' (c. 1928-2003)</a>)<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) Notarantonio Victor<br>&nbsp;&nbsp;2) <b>Notarantonio, Vittorio 'Antonio' (1900)</b> married <b>Donnelly (in Notarantonio), Margaret Anne</b><br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Notarantonio, Antonio (1919-1920)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Notarantonio, Mary (1920)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Notarantonio, Francisco (1922-1987)</b> married <b>Notarantonio, Edith (1929-2013)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Notarantonio, Charlie</b><br>&nbsp;&nbsp;3) <b>Notarantonio (in Magliocco), Luisetta 'Lenziatta' (1902-1980)</b> married <b>Magliocco, Domenico (1904-1977)</b> in 1925<br>&nbsp;&nbsp;and married <b>Montgomery (in Notarantonio), Minnie (c. 1886)</b> <b>only in 1917</b> but were together since 1906. Had <b>3 children</b>, only <b>1 alive</b> in 1911<br>&nbsp;&nbsp;4) <b>Notarantonio, Francesco Antonio (1907-1909)</b><br>&nbsp;&nbsp;5) <b>Notarantonio, Maria Grace (1908-1908)</b><br>&nbsp;&nbsp;6) <b>Notarantonio, Charles (c. 1911-1912)</b><br>&nbsp;&nbsp;7) <b>Notarantonio, Louis (1912-1912)</b><br>&nbsp;&nbsp;8) <b>Notarantonio (in Cullen), Rose (1913)</b> married <b>Cullen, Christopher</b> in 1941<br>&nbsp;&nbsp;9) <b>Notarantonio (in Hogan), Margaret (1914)</b> married <b>Hogan, Richard</b> in 1943<br>&nbsp;&nbsp;10) <b>Notarantonio, Serafino (1916-1917)</b><br>&nbsp;&nbsp;11) <b>Notarantonio, Maria (1918-1919)</b><br>&nbsp;&nbsp;12) <b>Notarantonio, Pietro (1919)</b><br>&nbsp;&nbsp;and married <b>Fitzgerald (in Notarantonio), Elizabeth (c. 1903-1979)</b> in 1924<br>2) <b>Notarantonio, Louis (c. 1890)</b> married <b>Rice (in Notarantonio), Susan (c. 1892-1912)</b> before 1911<br>&nbsp;&nbsp;1) <b>Notarantonio, Louis (1911)</b><br><br><b>Notarantonio, Carlo</b> married <b>Toner (in Notarantonio), Margaret</b> before 1920<br>1) <b>Notarantonio, Margaret (1920)</b><br><br><b>Notarantonio, Victor (c. 1929-1930)</b><br><br><a href=\"https://www.fortefamilyhistory.com/Family_Tree/Tree/11464.html\" target=\"_blank\" rel=\"noopener\">Notarantonio, Vincenzo (c. 1901)</a> married <b>Marsella, Angela (c. 1896)</b> <br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-1058571\" target=\"_blank\" rel=\"noopener\">Notarantonio, Thomas Joseph</a> , son of Notarantonio Antony, married Mahon, Harriet Lana, in 1947 <br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-1010990\" target=\"_blank\" rel=\"noopener\">Notarantonio, Anthony</a> son of Notarantonio, Anthony, married Waters, Mary, in 1949<br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-862325\" target=\"_blank\" rel=\"noopener\">Notarantonio, Martriccio</a> son of Notarantonio, Anthony, married Lunch Teresa in 1950<br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-2883336\" target=\"_blank\" rel=\"noopener\">Notarantonio, Palma (1963-1963)</a> died on the same day she was born, 09 April 1963. She was the child of a cook.<br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-309326\" target=\"_blank\" rel=\"noopener\">Notarantonio, Mark (c. 1929-1975)</a> had married Notarantonio Teresa and died on 2 January 1975<br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-5727007\" target=\"_blank\" rel=\"noopener\">Notarantonio, Mary (c. 1890-1919)</a> dies on 24 August 1919 and she is the wife of a Notarantonio A from 64 Baker Street. I am 90% sure she is <b>Montgomery (in Notarantonio), Minnie (c. 1886)</b> because the latter died before 1924 but the age would be wrong.<br><br><b>IrishGenealogy.ie</b><br>Notarantonio, <b>13 risultati</b>. 9 fatti mancano 4<br>Notaro <b>25 risultati</b><br><br><b>Notarantonio, Annie</b> present at birth of <b>Notarantonio, Pietro (1919)</b><br><br><b>Vergatti, Gesiio (c. 1842)</b><br>1) <b>Vergatti (in Notarantonio), Maria Grazia Rose (c. 1880-1903)</b><br>2) <b>Vergatti (in Traggenti), Mary (c. 1878-1903)</b><br><br><a href=\"https://www.theguardian.com/uk/2000/sep/25/northernireland.johnmullin\" target=\"_blank\" rel=\"noopener\">https://www.theguardian.com/uk/2000/sep/25/northernireland.johnmullin</a> <br><b>Notarantonio, Francisco (1922-1987)</b> killed by the Protestant in the Troubles<br><br><a href=\"https://www.belfastforum.co.uk/index.php?topic=64046.0\" target=\"_blank\" rel=\"noopener\">https://www.belfastforum.co.uk/index.php?topic=64046.0</a> useful information in this blog<br><br>originally from Isola Del Liri / Sora", "Origano": "<b>Origano, Savino (c. 1865-1953)</b> married <b>Pedretti (in Origano), Clelia (c. 1873-1943)</b><br>1) <b>Origano (in Agnoli), Emma (c. 1893)</b> married <b>Agnoli, Realdo</b> in 1915<br>&nbsp;&nbsp;1) <b>Agnoli, Eugene (1915)</b><br>&nbsp;&nbsp;2) <b>Agnoli, Alfredo (1920)</b><br>&nbsp;&nbsp;3) <b>Agnoli, Jolanda (1923)</b><br>2) <b>Origano, Garran (c. 1895)</b><br>3) <b>Origano, Fougherad (c. 1898)</b><br>4) <b>Origano, Raffaello Celeste Romeo (1900-1960)</b> married <b>Darling (in Origano), Kathleen (-1981)</b> in 1927<br>5) <b>Origano, Maria Francesca (1903-1903)</b><br>6) <b>Origano, Paolo Savino (1904-1945)</b> married <b>Cramer (in Origano), Julia</b> in 1928 (she probably died in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-271761\" target=\"_blank\" rel=\"noopener\">1975</a> at the age of 66)<br>7) <b>Origano, Clide (1906-1906)</b><br>8) <b>Origano, Vincenzo (1907)</b><br>9) <b>Origano, Anthony John (c. 1902-1973)</b> married <b>Kelly (in Origano), Rosanna (c. 1912-1929)</b> in 1929 and <b>O'Brien, Willimina (-1950)</b> in 1930<br><br><b>Andritta, Gaetano (c. 1879)</b> brother in law<br><br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-2190767\" target=\"_blank\" rel=\"noopener\">Organo, Minnie (c. 1908-1950)</a> wife of a butcher forse willimina<br><br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-445327\" target=\"_blank\" rel=\"noopener\">Origano, Sandra (c. 1921-1970)</a> wife of a cafe proprietor and mother of [Origano, Vanda], <a href=\"https://www.findagrave.com/memorial/257568969/sandra-oragano\" target=\"_blank\" rel=\"noopener\">grave</a>, probabilmente moglie di <a href=\"https://www.findagrave.com/memorial/257564487/ralph-oragano\" target=\"_blank\" rel=\"noopener\">Origano, Raplh (c. 1924-2010)</a>", "Orlandi": "<b>Orlandi, Gilles (c. 1857-1922)</b> married <b>Orlandi, Mary (c. 1858-1901)</b><br>1) <b>Orlandi (in Stein Kamm), Jeanne (c. 1879)</b> married <b>Stein Kamm), Raoul (c. 1874)</b><br>&nbsp;&nbsp;1) <b>Stein Kamm, Marguerite (c. 1899)</b><br>2) <b>Orlandi, Leonie (c. 1896)</b><br>remarried <b>Fitzgibbon (in Orlandi), Mary Josephine (c. 1880)</b> in 1904 who remarried <b>King, Michael</b> in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cimanf-1160454\" target=\"_blank\" rel=\"noopener\">1927</a><br>3) <b>Orlandi, Joseph (1920)</b>", "Pacelli": "<b>Pacelli, Vincenzo (c. 1839)</b> married <b>Pacelli, Mary Rose (c. 1841)</b>.<br>They had children<br>1) <b>Pacelli, Francesco Antonio (c. 1869-1939)</b> arrived in Ireland before <b>1892</b>, was a <b>musician</b>, became a <b>confectioner</b> before 1908 and married <b>Doyle (in Pacelli), Mary (c. 1873-1954)</b><br>They had children 10 children, all girls until finally a boy called as his grandad<br>&nbsp;&nbsp;1) <b>Pacelli, Mary Rosina (1892-1974)</b> never married<br>&nbsp;&nbsp;2) <b>Pacelli (in Timmons), Elizabeth Esther (1894)</b> married <b>Timmons, Peter</b> in 1912. They had children<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1104505\" target=\"_blank\" rel=\"noopener\">Timmons, Peter (1913)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-908217\" target=\"_blank\" rel=\"noopener\">Timmons, Mary (1915)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-92446\" target=\"_blank\" rel=\"noopener\">Timmons, Catherine (1924)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-20382\" target=\"_blank\" rel=\"noopener\">Timmons, Francis (1925)</a><br>&nbsp;&nbsp;3) <b>Pacelli, Christina Catherine (1895-1918)</b><br>&nbsp;&nbsp;4) <b>Pacelli, Catherine Frances (1898-1898)</b> died young<br>&nbsp;&nbsp;5) <b>Pacelli (in Boyle), Josephine (1899-1978)</b> married <b>Boyle, Patrick</b> in 1920. They had children.<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-312221\" target=\"_blank\" rel=\"noopener\">Boyle, Mary (1921)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-230191\" target=\"_blank\" rel=\"noopener\">Boyle, Christina (1922)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-89137\" target=\"_blank\" rel=\"noopener\">Boyle, Julia (1924)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-19532\" target=\"_blank\" rel=\"noopener\">Boyle, Mary (1925)</a><br>&nbsp;&nbsp;6) <b>Pacelli (in Laffan), Florence Agnes (1902-1970)</b> married <b>Laffan, Patrick</b> in 1924. They had children.<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-61213\" target=\"_blank\" rel=\"noopener\">Laffan, Francis (1924)</a><br>&nbsp;&nbsp;7) <b>Pacelli (in Rankin), Catherine (1904-1978)</b> married <b>Rankin, Henry</b> in 1927<br>&nbsp;&nbsp;8) <b>Pacelli, Philomena (1906-1907)</b> died young<br>&nbsp;&nbsp;9) <b>Pacelli, Teresa (1908-1977)</b> never married<br>&nbsp;&nbsp;10) <b>Pacelli, Vincent Christopher (1910-1989)</b> married <b>Whelan (in Pacelli), Elizabeth</b> in 1939.<br>&nbsp;&nbsp;11) <b>Pacelli, Francis Joseph Patrick (1914-1982)</b> married <b>Carroll (in Pacelli), Teresa (1919-2000)</b> in 1940<br>&nbsp;&nbsp;&nbsp;&nbsp;Probably one more who died before 1911 (See 1911 Census)<br>2) <b>Pacelli, Joseph (c. 1872-1912)</b> arrived in Ireland before <b>1894</b>, was a <b>musician</b> and married <b>Mahoney (in Pacelli), Mary (c. 1874-1898)</b>.<br>They had 3 children.<br>&nbsp;&nbsp;1) <b>Pacelli (in Heather), Mary Teresa (1893)</b> married <b>Heather, Patrick</b> in 1913. They had children.<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1060917\" target=\"_blank\" rel=\"noopener\">Heather, John (1913)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-855626\" target=\"_blank\" rel=\"noopener\">Heather, Mary (1915)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-428877\" target=\"_blank\" rel=\"noopener\">Heather, Nora (1920)</a><br>&nbsp;&nbsp;2) <b>Pacelli (in Clarke), Nora (c. 1896)</b> she married <b>Clarke, William</b> in 1920<br>&nbsp;&nbsp;3) <b>Pacelli, Philomena (1897-1899)</b><br>&nbsp;&nbsp;Later he married <b>Gough (in Pacelli), Mary (c. 1874-1916)</b>", "Pacini": "<b>Pacini, Sebastiano</b> was a soldier.<br>1) <b>Pacini, Marino (c. 1884)</b> was a statue maker and arrived in Ireland before 1908. He married <b>Marcantonio (in Pacini), Angelina (1891)</b> in 1908.<br>&nbsp;&nbsp;1) <b>Pacini, Louis (1909)</b><br>&nbsp;&nbsp;2) <b>Pacini, Cecilia (1914-1914)</b><br><br>potrebbe essere fratello di visto che il figlio Louis lavora per un Luigi con lo stesso lavoro e indirizzo.<br><b>Pacini, Luigi (c. 1867-1945)</b> married <b>Pacini, Irene (c. 1869-1945)</b><br>1) <b>Pacini, George (c. 1902-1967)</b><br>2) <b>Pacini, Emilio (c. 1904)</b><br><br><b>Pacini, Olindo (c. 1876)</b> was an image maker and arrived in Ireland before 1901. He married <b>Marcantonio (in Pacini), Sarah (c. 1880)</b>.<br>1) <b>Pacini, Sebastiano (c. 1898)</b><br>2) <b>Pacini, Lucy (c. 1899)</b><br>3) <b>Pacini, Rosina (1901)</b><br>4) <b>Pacini, Ersilia Maria (1904-2003)</b> married <b>Cafolla, Luigi Antonio (1900)</b><br><br><b>Pacini, Cecilia (c. 1903)</b> (forse sorella di <b>Pacini, Rosina (1901)</b>)<br><b>Pacini, Louis (c. 1899-1914)</b><br>potrebbero essere figli di uno dei 2<br><br><b>Pacino, George (c. 1906-1907)</b><br><br>There is also a <b>Gordon, Anne Maria (1923)</b> <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-179938\" target=\"_blank\" rel=\"noopener\">daughter</a> of <b>Gordon, Patrick</b> and <b>Pacini (in Gordon), Rose</b> and her mother could be <b>Pacini, Rosina (1901)</b> but you cannot find the wedding record", "Podesta": "Probabilmente <b>Podesta, Anthony (c. 1837-1917)</b><br>1) <b>Podesta, Anthony (c. 1871-1820)</b> married <b>Kelly (in Podestà), Elizabeth (c. 1879-1932)</b> in 1907<br>&nbsp;&nbsp;1) <b>Podestà, James Anthony (1907-1943)</b><br>&nbsp;&nbsp;2) <b>Podestà, Elizabeth (1911)</b><br>&nbsp;&nbsp;3) <b>Podestà, Joseph (1917)</b><br><br><b>Podestà, Anthony</b> <i>maybe</i> <b>Podesta, Anthony (c. 1837-1917)</b><br>1) <b>Podestà, Joseph (c. 1863)</b> married <b>Lynch (in Podestà), Bridget (c. 1867)</b> in 1880<br>&nbsp;&nbsp;1) <b>Podestà, Mary Ellen (1882-1882)</b><br>&nbsp;&nbsp;2) <b>Podestà, Bridget (1883-1883)</b><br><br><b>Podestà, Martha (c. 1879)</b> <b>Podestà, Catherine (c. 1866)</b> and <b>Podestà, Elizabeth (c. 1868)</b> lives together in 1901 and 1911 as sisters e sembrano essere sepolte vicino ma gli anni di nasciat non corrispondono, credo ci siano stati errori o falsi <a href=\"https://www.findagrave.com/memorial/search?fulltext=&amp;firstname=&amp;middlename=&amp;lastname=&amp;birthyear=&amp;birthyearfilter=&amp;deathyear=&amp;deathyearfilter=&amp;location=&amp;locationId=&amp;bio=&amp;linkedToName=&amp;plot=A041-00411&amp;memorialid=&amp;mcid=&amp;datefilter=&amp;orderby=r&amp;page=1#sr-289301856\" target=\"_blank\" rel=\"noopener\">https://www.findagrave.com/memorial/search?fulltext=&amp;firstname=&amp;middlename=&amp;lastname=&amp;birthyear=&amp;birthyearfilter=&amp;deathyear=&amp;deathyearfilter=&amp;location=&amp;locationId=&amp;bio=&amp;linkedToName=&amp;plot=A041-00411&amp;memorialid=&amp;mcid=&amp;datefilter=&amp;orderby=r&amp;page=1#sr-289301856</a><br><br><b>De Podestà, John Mathew (c. 1839-1914)</b> married <b>Boyce (in De Podestà, Anne) (c. 1847-1896)</b><br>1) <b>De Podestà, William Augustine (1865)</b> married <b>Swaine (in De Podestà), Eveline</b> in 1887<br>2) <b>De Podestà, John Robert (1867-1898)</b><br>3) <b>De Podestà, Elizabeth Anne (1868)</b> <i>potrebbe essere <b>Podestà, Elizabeth (c. 1868)</b></i><br>4) <b>De Podestà, Joseph Clarence (1871)</b> married <b>Whelan (in De Podestà), Clara Helena (c. 1881)</b> in 1905<br>&nbsp;&nbsp;1) <b>De Podestà, John George (1906-1906)</b><br>&nbsp;&nbsp;2) <b>De Podestà, Joseph Frederick (1907)</b><br>&nbsp;&nbsp;3) <b>De Podestà, Rosemond Constance (1910)</b><br>&nbsp;&nbsp;4) <b>De Podestà, Clare Helena (1913)</b><br>5) <b>De Podestà, Rosina (1872-1872)</b><br>6) <b>De Podestà (in Mason), Elizabeth Anna (c. 1873)</b> married <b>Mason, Joseph Henry (c. 1878)</b> in 1904 (he was Head Butler Trinity College in 1911)<br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1588019\" target=\"_blank\" rel=\"noopener\">Mason, Ivetta Victoria (1909)</a><br>7) <b>De Podestà, Louisa Katharine (1873-1874)</b><br>8) <b>De Podestà, Blanche Constance (c. 1875)</b><br>9) <b>De Podestà, Charles Angelo (1875)</b> married <b>Gorman (in De Podestà), Catherine (c. 1881)</b> in 1907<br>&nbsp;&nbsp;1) <b>De Podestà, Monica (1907)</b><br>&nbsp;&nbsp;2) <b>De Podestà, Mary Florence (1909)</b><br>&nbsp;&nbsp;3) <b>De Podestà, Augustina (1911)</b><br>&nbsp;&nbsp;4) <b>De Podestà, John Celestine (1914)</b><br>10) <b>De Podestà, Florence Mary (1877-1877)</b><br>11) <b>De Podestà, Albert Stephen (1879)</b> married <b>Wilson (in De Podestà), Ada (c. 1882)</b><br>&nbsp;&nbsp;1) <b>De Podestà, Patricia (1911)</b><br>&nbsp;&nbsp;2) <b>De Podestà, Ada Sheila (1914)</b><br>12) <b>De Podestà, Blanche (1882)</b><br><br><b>Podestà, Rosina (c. 1839-1906)</b> and <b>Podestà, Marianne (c. 1848)</b> lived together in 1901<br><br><b>Podestà, Giovanni</b><br>1) <b>Podestà, Dominick (c. 1870-1954)</b> married <b>Phillips (in Podestà), Mary (c. 1877)</b> daughter of <b>Philips, Peter</b> and <b>Phillips, Alice (c. 1854</b> in 1898<br>&nbsp;&nbsp;1) <b>Podestà, William (c. 1899)</b><br>&nbsp;&nbsp;2) <b>Podestà, George Edward (1899-1957)</b> married <b>McLeid (in Podestà), Elsie</b> in 1939<br>&nbsp;&nbsp;3) <b>Podestà, Richard Alfred (1902-1902)</b><br>&nbsp;&nbsp;4) <b>Podestà, Lillian (c. 1904)</b> married <b>Barrett, John</b> in 1930<br>&nbsp;&nbsp;5) <b>Podestà, James (1907)</b><br>&nbsp;&nbsp;6) <b>Podestà, Florence (c. 1909)</b><br><br><b>De Podestà, Augustus</b><br>1) <b>De Podestà (in Dawson Tate), Teresa (c. 1853-1905)</b> married <b>Dawson Tate, Thomas</b> in 1885<br><br><b>De Podestà, Annie (c. 1856-1930)</b> is buried next to Teresa Dawson Tate<br><br><b>De Podestà, John Francis</b> married <b>Griffin (in De Podestà), Christina</b><br>1) <b>De Podestà, Mary Ellen (1898-1898)</b><br><br><b>Podestà, Joseph</b> married <b>Murphy (in Podestà), Mary</b><br>1) <b>Podestà, Rosaline (1894)</b><br><br>1830 Baptism record for ROSINAM ELIZTH DEPODESTA in 1830<br>1831 Baptism record for AGOSTINO DEPODESTA in 1831<br>1847 Baptism record for MARTHA MARY DE PODESTA in 1847<br>1850 Baptism record for TERESA DEPONESTA in 1850<br>1859 Marriage record for George Seale and Frances De Podesta<br>1866 Birth record for Mary De Podesta<br>1874 Burial record for LOUISA KATE DE PODESTA ? of 19 CHAMBER ST on December 1874<br>1916 Death record for Martha De Podesta<br><br>Devi finire<br><a href=\"https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=podesta&amp;exact-matches-only=1&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date\" target=\"_blank\" rel=\"noopener\">https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=podesta&amp;exact-matches-only=1&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date</a><br><a href=\"https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=depodesta&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date\" target=\"_blank\" rel=\"noopener\">https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=depodesta&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date</a>", "Podestà": "Probabilmente <b>Podesta, Anthony (c. 1837-1917)</b><br>1) <b>Podesta, Anthony (c. 1871-1820)</b> married <b>Kelly (in Podestà), Elizabeth (c. 1879-1932)</b> in 1907<br>&nbsp;&nbsp;1) <b>Podestà, James Anthony (1907-1943)</b><br>&nbsp;&nbsp;2) <b>Podestà, Elizabeth (1911)</b><br>&nbsp;&nbsp;3) <b>Podestà, Joseph (1917)</b><br><br><b>Podestà, Anthony</b> <i>maybe</i> <b>Podesta, Anthony (c. 1837-1917)</b><br>1) <b>Podestà, Joseph (c. 1863)</b> married <b>Lynch (in Podestà), Bridget (c. 1867)</b> in 1880<br>&nbsp;&nbsp;1) <b>Podestà, Mary Ellen (1882-1882)</b><br>&nbsp;&nbsp;2) <b>Podestà, Bridget (1883-1883)</b><br><br><b>Podestà, Martha (c. 1879)</b> <b>Podestà, Catherine (c. 1866)</b> and <b>Podestà, Elizabeth (c. 1868)</b> lives together in 1901 and 1911 as sisters e sembrano essere sepolte vicino ma gli anni di nasciat non corrispondono, credo ci siano stati errori o falsi <a href=\"https://www.findagrave.com/memorial/search?fulltext=&amp;firstname=&amp;middlename=&amp;lastname=&amp;birthyear=&amp;birthyearfilter=&amp;deathyear=&amp;deathyearfilter=&amp;location=&amp;locationId=&amp;bio=&amp;linkedToName=&amp;plot=A041-00411&amp;memorialid=&amp;mcid=&amp;datefilter=&amp;orderby=r&amp;page=1#sr-289301856\" target=\"_blank\" rel=\"noopener\">https://www.findagrave.com/memorial/search?fulltext=&amp;firstname=&amp;middlename=&amp;lastname=&amp;birthyear=&amp;birthyearfilter=&amp;deathyear=&amp;deathyearfilter=&amp;location=&amp;locationId=&amp;bio=&amp;linkedToName=&amp;plot=A041-00411&amp;memorialid=&amp;mcid=&amp;datefilter=&amp;orderby=r&amp;page=1#sr-289301856</a><br><br><b>De Podestà, John Mathew (c. 1839-1914)</b> married <b>Boyce (in De Podestà, Anne) (c. 1847-1896)</b><br>1) <b>De Podestà, William Augustine (1865)</b> married <b>Swaine (in De Podestà), Eveline</b> in 1887<br>2) <b>De Podestà, John Robert (1867-1898)</b><br>3) <b>De Podestà, Elizabeth Anne (1868)</b> <i>potrebbe essere <b>Podestà, Elizabeth (c. 1868)</b></i><br>4) <b>De Podestà, Joseph Clarence (1871)</b> married <b>Whelan (in De Podestà), Clara Helena (c. 1881)</b> in 1905<br>&nbsp;&nbsp;1) <b>De Podestà, John George (1906-1906)</b><br>&nbsp;&nbsp;2) <b>De Podestà, Joseph Frederick (1907)</b><br>&nbsp;&nbsp;3) <b>De Podestà, Rosemond Constance (1910)</b><br>&nbsp;&nbsp;4) <b>De Podestà, Clare Helena (1913)</b><br>5) <b>De Podestà, Rosina (1872-1872)</b><br>6) <b>De Podestà (in Mason), Elizabeth Anna (c. 1873)</b> married <b>Mason, Joseph Henry (c. 1878)</b> in 1904 (he was Head Butler Trinity College in 1911)<br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1588019\" target=\"_blank\" rel=\"noopener\">Mason, Ivetta Victoria (1909)</a><br>7) <b>De Podestà, Louisa Katharine (1873-1874)</b><br>8) <b>De Podestà, Blanche Constance (c. 1875)</b><br>9) <b>De Podestà, Charles Angelo (1875)</b> married <b>Gorman (in De Podestà), Catherine (c. 1881)</b> in 1907<br>&nbsp;&nbsp;1) <b>De Podestà, Monica (1907)</b><br>&nbsp;&nbsp;2) <b>De Podestà, Mary Florence (1909)</b><br>&nbsp;&nbsp;3) <b>De Podestà, Augustina (1911)</b><br>&nbsp;&nbsp;4) <b>De Podestà, John Celestine (1914)</b><br>10) <b>De Podestà, Florence Mary (1877-1877)</b><br>11) <b>De Podestà, Albert Stephen (1879)</b> married <b>Wilson (in De Podestà), Ada (c. 1882)</b><br>&nbsp;&nbsp;1) <b>De Podestà, Patricia (1911)</b><br>&nbsp;&nbsp;2) <b>De Podestà, Ada Sheila (1914)</b><br>12) <b>De Podestà, Blanche (1882)</b><br><br><b>Podestà, Rosina (c. 1839-1906)</b> and <b>Podestà, Marianne (c. 1848)</b> lived together in 1901<br><br><b>Podestà, Giovanni</b><br>1) <b>Podestà, Dominick (c. 1870-1954)</b> married <b>Phillips (in Podestà), Mary (c. 1877)</b> daughter of <b>Philips, Peter</b> and <b>Phillips, Alice (c. 1854</b> in 1898<br>&nbsp;&nbsp;1) <b>Podestà, William (c. 1899)</b><br>&nbsp;&nbsp;2) <b>Podestà, George Edward (1899-1957)</b> married <b>McLeid (in Podestà), Elsie</b> in 1939<br>&nbsp;&nbsp;3) <b>Podestà, Richard Alfred (1902-1902)</b><br>&nbsp;&nbsp;4) <b>Podestà, Lillian (c. 1904)</b> married <b>Barrett, John</b> in 1930<br>&nbsp;&nbsp;5) <b>Podestà, James (1907)</b><br>&nbsp;&nbsp;6) <b>Podestà, Florence (c. 1909)</b><br><br><b>De Podestà, Augustus</b><br>1) <b>De Podestà (in Dawson Tate), Teresa (c. 1853-1905)</b> married <b>Dawson Tate, Thomas</b> in 1885<br><br><b>De Podestà, Annie (c. 1856-1930)</b> is buried next to Teresa Dawson Tate<br><br><b>De Podestà, John Francis</b> married <b>Griffin (in De Podestà), Christina</b><br>1) <b>De Podestà, Mary Ellen (1898-1898)</b><br><br><b>Podestà, Joseph</b> married <b>Murphy (in Podestà), Mary</b><br>1) <b>Podestà, Rosaline (1894)</b><br><br>1830 Baptism record for ROSINAM ELIZTH DEPODESTA in 1830<br>1831 Baptism record for AGOSTINO DEPODESTA in 1831<br>1847 Baptism record for MARTHA MARY DE PODESTA in 1847<br>1850 Baptism record for TERESA DEPONESTA in 1850<br>1859 Marriage record for George Seale and Frances De Podesta<br>1866 Birth record for Mary De Podesta<br>1874 Burial record for LOUISA KATE DE PODESTA ? of 19 CHAMBER ST on December 1874<br>1916 Death record for Martha De Podesta<br><br>Devi finire<br><a href=\"https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=podesta&amp;exact-matches-only=1&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date\" target=\"_blank\" rel=\"noopener\">https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=podesta&amp;exact-matches-only=1&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date</a><br><a href=\"https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=depodesta&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date\" target=\"_blank\" rel=\"noopener\">https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=depodesta&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date</a>", "De Podestà": "Probabilmente <b>Podesta, Anthony (c. 1837-1917)</b><br>1) <b>Podesta, Anthony (c. 1871-1820)</b> married <b>Kelly (in Podestà), Elizabeth (c. 1879-1932)</b> in 1907<br>&nbsp;&nbsp;1) <b>Podestà, James Anthony (1907-1943)</b><br>&nbsp;&nbsp;2) <b>Podestà, Elizabeth (1911)</b><br>&nbsp;&nbsp;3) <b>Podestà, Joseph (1917)</b><br><br><b>Podestà, Anthony</b> <i>maybe</i> <b>Podesta, Anthony (c. 1837-1917)</b><br>1) <b>Podestà, Joseph (c. 1863)</b> married <b>Lynch (in Podestà), Bridget (c. 1867)</b> in 1880<br>&nbsp;&nbsp;1) <b>Podestà, Mary Ellen (1882-1882)</b><br>&nbsp;&nbsp;2) <b>Podestà, Bridget (1883-1883)</b><br><br><b>Podestà, Martha (c. 1879)</b> <b>Podestà, Catherine (c. 1866)</b> and <b>Podestà, Elizabeth (c. 1868)</b> lives together in 1901 and 1911 as sisters e sembrano essere sepolte vicino ma gli anni di nasciat non corrispondono, credo ci siano stati errori o falsi <a href=\"https://www.findagrave.com/memorial/search?fulltext=&amp;firstname=&amp;middlename=&amp;lastname=&amp;birthyear=&amp;birthyearfilter=&amp;deathyear=&amp;deathyearfilter=&amp;location=&amp;locationId=&amp;bio=&amp;linkedToName=&amp;plot=A041-00411&amp;memorialid=&amp;mcid=&amp;datefilter=&amp;orderby=r&amp;page=1#sr-289301856\" target=\"_blank\" rel=\"noopener\">https://www.findagrave.com/memorial/search?fulltext=&amp;firstname=&amp;middlename=&amp;lastname=&amp;birthyear=&amp;birthyearfilter=&amp;deathyear=&amp;deathyearfilter=&amp;location=&amp;locationId=&amp;bio=&amp;linkedToName=&amp;plot=A041-00411&amp;memorialid=&amp;mcid=&amp;datefilter=&amp;orderby=r&amp;page=1#sr-289301856</a><br><br><b>De Podestà, John Mathew (c. 1839-1914)</b> married <b>Boyce (in De Podestà, Anne) (c. 1847-1896)</b><br>1) <b>De Podestà, William Augustine (1865)</b> married <b>Swaine (in De Podestà), Eveline</b> in 1887<br>2) <b>De Podestà, John Robert (1867-1898)</b><br>3) <b>De Podestà, Elizabeth Anne (1868)</b> <i>potrebbe essere <b>Podestà, Elizabeth (c. 1868)</b></i><br>4) <b>De Podestà, Joseph Clarence (1871)</b> married <b>Whelan (in De Podestà), Clara Helena (c. 1881)</b> in 1905<br>&nbsp;&nbsp;1) <b>De Podestà, John George (1906-1906)</b><br>&nbsp;&nbsp;2) <b>De Podestà, Joseph Frederick (1907)</b><br>&nbsp;&nbsp;3) <b>De Podestà, Rosemond Constance (1910)</b><br>&nbsp;&nbsp;4) <b>De Podestà, Clare Helena (1913)</b><br>5) <b>De Podestà, Rosina (1872-1872)</b><br>6) <b>De Podestà (in Mason), Elizabeth Anna (c. 1873)</b> married <b>Mason, Joseph Henry (c. 1878)</b> in 1904 (he was Head Butler Trinity College in 1911)<br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1588019\" target=\"_blank\" rel=\"noopener\">Mason, Ivetta Victoria (1909)</a><br>7) <b>De Podestà, Louisa Katharine (1873-1874)</b><br>8) <b>De Podestà, Blanche Constance (c. 1875)</b><br>9) <b>De Podestà, Charles Angelo (1875)</b> married <b>Gorman (in De Podestà), Catherine (c. 1881)</b> in 1907<br>&nbsp;&nbsp;1) <b>De Podestà, Monica (1907)</b><br>&nbsp;&nbsp;2) <b>De Podestà, Mary Florence (1909)</b><br>&nbsp;&nbsp;3) <b>De Podestà, Augustina (1911)</b><br>&nbsp;&nbsp;4) <b>De Podestà, John Celestine (1914)</b><br>10) <b>De Podestà, Florence Mary (1877-1877)</b><br>11) <b>De Podestà, Albert Stephen (1879)</b> married <b>Wilson (in De Podestà), Ada (c. 1882)</b><br>&nbsp;&nbsp;1) <b>De Podestà, Patricia (1911)</b><br>&nbsp;&nbsp;2) <b>De Podestà, Ada Sheila (1914)</b><br>12) <b>De Podestà, Blanche (1882)</b><br><br><b>Podestà, Rosina (c. 1839-1906)</b> and <b>Podestà, Marianne (c. 1848)</b> lived together in 1901<br><br><b>Podestà, Giovanni</b><br>1) <b>Podestà, Dominick (c. 1870-1954)</b> married <b>Phillips (in Podestà), Mary (c. 1877)</b> daughter of <b>Philips, Peter</b> and <b>Phillips, Alice (c. 1854</b> in 1898<br>&nbsp;&nbsp;1) <b>Podestà, William (c. 1899)</b><br>&nbsp;&nbsp;2) <b>Podestà, George Edward (1899-1957)</b> married <b>McLeid (in Podestà), Elsie</b> in 1939<br>&nbsp;&nbsp;3) <b>Podestà, Richard Alfred (1902-1902)</b><br>&nbsp;&nbsp;4) <b>Podestà, Lillian (c. 1904)</b> married <b>Barrett, John</b> in 1930<br>&nbsp;&nbsp;5) <b>Podestà, James (1907)</b><br>&nbsp;&nbsp;6) <b>Podestà, Florence (c. 1909)</b><br><br><b>De Podestà, Augustus</b><br>1) <b>De Podestà (in Dawson Tate), Teresa (c. 1853-1905)</b> married <b>Dawson Tate, Thomas</b> in 1885<br><br><b>De Podestà, Annie (c. 1856-1930)</b> is buried next to Teresa Dawson Tate<br><br><b>De Podestà, John Francis</b> married <b>Griffin (in De Podestà), Christina</b><br>1) <b>De Podestà, Mary Ellen (1898-1898)</b><br><br><b>Podestà, Joseph</b> married <b>Murphy (in Podestà), Mary</b><br>1) <b>Podestà, Rosaline (1894)</b><br><br>1830 Baptism record for ROSINAM ELIZTH DEPODESTA in 1830<br>1831 Baptism record for AGOSTINO DEPODESTA in 1831<br>1847 Baptism record for MARTHA MARY DE PODESTA in 1847<br>1850 Baptism record for TERESA DEPONESTA in 1850<br>1859 Marriage record for George Seale and Frances De Podesta<br>1866 Birth record for Mary De Podesta<br>1874 Burial record for LOUISA KATE DE PODESTA ? of 19 CHAMBER ST on December 1874<br>1916 Death record for Martha De Podesta<br><br>Devi finire<br><a href=\"https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=podesta&amp;exact-matches-only=1&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date\" target=\"_blank\" rel=\"noopener\">https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=podesta&amp;exact-matches-only=1&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date</a><br><a href=\"https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=depodesta&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date\" target=\"_blank\" rel=\"noopener\">https://www.irishgenealogy.ie/search/?church-or-civil=all&amp;firstname=&amp;lastname=depodesta&amp;location=&amp;yearStart=&amp;yearEnd=&amp;event-birth=1&amp;event-marriage=1&amp;event-death=1&amp;event-baptism=1&amp;event-burial=1&amp;_day=&amp;month=&amp;mothers-surname=&amp;age-at-death=&amp;relation-0=&amp;per_page=100&amp;sortby=date</a>", "Puleo": "<b>Puleo, Ferdinando</b><br>1) <b>Puleo, Frank (c. 1863)</b> <br>&nbsp;&nbsp;1) <b>Puleo, Frank (c. 1890)</b> married <b>McKenzie (in Puleo), Isabel</b> in 1914<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Puleo, Mary (1914)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Puleo, Isabel (1918)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Puleo, John Joseph (1920)</b><br>&nbsp;&nbsp;married <b>Allen (in Puleo), Hessie (c. 1875-1918)</b> in 1911<br>&nbsp;&nbsp;married <b>Fox (in Puleo), Mary</b> in 1919", "Rabaiotti": "Oggi la <a href=\"https://www.cognomix.it/mappe-dei-cognomi-italiani/RABAIOTTI/EMILIA-ROMAGNA\" target=\"_blank\" rel=\"noopener\">diffusione</a> del cognome (Lombardi e Emilia Romagna) sembra rafforzare l'idea che siano una delle famiglie di Parma visto che 12 nomi su vengono da Bardi.<br>Su 67 famiglie, 30 lombardi, 35 Emilia Romagna (25 Parma, 9 Piacenza)<br><br>Ricerca da <a href=\"https://flickr.com/photos/nlireland/9797044216/\" target=\"_blank\" rel=\"noopener\">Flickr</a><br>La gelateria Rabaiotti in 49 Amiens Street appare nella Thom's Directory nel 1910.<br>Un paio di anni prima Angelo Santi lavorava allo stesso civico.<br>I Rabatiotti vengono descritti come mercanti nel 1910 e 1911.<br>Nel 1914 si sono espansi al numero 50, sempre come confectioners.<br><br>Tra il <a href=\"https://census.nationalarchives.ie/pages/1901/Dublin/North_Dock/Amiens_Street/1274140/\" target=\"_blank\" rel=\"noopener\">Censimento 1901</a> e il <a href=\"https://census.nationalarchives.ie/pages/1911/Dublin/Mansion_House/Wexford_Street__East_Side/75199/\" target=\"_blank\" rel=\"noopener\">Censimento 1911</a><br><b>Rabaiotti, Antonio (c. 1879)</b> e sua moglie <b>Loffi (in Rabaiotti), Rosina (c. 1880)</b> si spostano da 15.1 Amiens Street a 4 Wexford Street, East Side.<br>Se nel 1901 sono descritti come Ice Cream Dealer, dopo sono Fish Merchants, probabile che facciano entrambi o si siano appunto convertiti.<br>Hanno anche avuto due figlie, <b>Rabaiotti, Vitttorina</b> e <b>Rabatiotti, Valentina</b>, stranamente la prima è nata a Dublino mentre la seconda in Italia, forse stavano tornando a casa.<br>Nel 1911 hanno anche ben 5 altri giovani ragazzi italiani che gli danno una mano nel negozio! Hanno tutti cognomi che non ho mai visto quindi mi sa che vengono da Parma anche loro.<br>Basini cognome di Parma concentrato a Bardi<br><b>Montelli</b> difficile da capire<br><b>Dadomo</b> cognome di Piacenza<br><b>Marenghi</b> cognome tra Piacenza e Parma<br><br>Nel <a href=\"https://census.nationalarchives.ie/pages/1901/Dublin/North_Dock/Amiens_Street/1274141/\" target=\"_blank\" rel=\"noopener\">Censimento 1901</a> si trova anche <b>Rabaiotti, Ludovico (c. 1874)</b> che vive con la moglie <b>Rabatiotti, Rosina (c. 1878)</b> e la figlia <b>Rabaiotti, Blandina (1900)</b>.<br>Vivono con loro anche altri 8 giovani ragazzi. Tutti sono gelatai.<br><br>Secondo questo <a href=\"https://www.walesonline.co.uk/news/local-news/proud-history-valleys-choir-2210225\" target=\"_blank\" rel=\"noopener\">articolo</a> i Rabaiotti vennero da Parma in Galles già nel 1907.<br><br>This is the alphabetical listing from the 1914 Thom's:<br>Rabaiotti, Antoni, 65 Talbot street<br>Rabaiotti Bros. fried fish saloon, 22 High st., 49 Amiens street<br>Rabioath(typo for Rabaiotti?), H.A. ice cream vendor, 10 Capel street<br>Rabiotti Bros. fried fish shop, 156 Parnell street<br>Rabiotti Bros. confectioners, 50 Amiens street<br><br><div class=\"fnHeading\">Arrivo in Irlanda</div><br>Nel 1901 c'è un piccolo nucleo attorno alla famiglia Rabaiotti, in particolare attorno a quelli che sembrano essere i due fratelli <b>Rabaiotti, Ludovico (c. 1874)</b> e <b>Rabaiotti, Antonio (c. 1879)</b> che vivono ai due numeri civici di 15 Amiens Street, Dublino. (Tra l'altro, coincidenza, le mogli si chiamano entrambe Rosina).<br>Nel 1901 son entrambi venditori di gelato e hanno 8 servitori, giovani ragazzi italiani, che vivono con Ludovico.<br>Nel 1911 è Antonio che vive con diversi altri giovani italiani che lo aiutano, ora nel suo negozio di pesce (probabilmente fish and chips).<br><br>Venivano da Bardi, in provincia di Parma, comune che è emigrato in massa soprattutto in Galles, dove ci sono diverse famiglie di Rabaiotti e da dove questo nucleo potrebbe essere partito.<br><br><b>Rabaiotti, Ludovico (c. 1874)</b> è stato 5 anni in Galles e poi è arrivato a Dublino nel 1896.<br><br>I Rabaiotti avevano diversi locali, tra cui Belfast, Limerick, e Cork.<br><br>A luglio 1903, il carro dei gelati di un Rabaiotti viene rotto dai turisti che arrivano a Portrush ubriachi.<br><a href=\"https://www.britishnewspaperarchive.co.uk/viewer/bl/0001283/19030718/094/0004\" target=\"_blank\" rel=\"noopener\">1903 07 18 Coleraine Chronicle</a>", "Repetto": "<b>Repetto, Angelo Giovanni (c. 1844-1922)</b> he was an <b>interpreter</b>, later the <b>Italian Vice-Consul</b> married <b>Murphy (in Repetto), Elizabeth (c. 1846-1922)</b><br>1) <b>Repetto (in Butler), Angela Mary (1876)</b> married <b>Butler, James</b> in 1900<br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2619278\" target=\"_blank\" rel=\"noopener\">Butler, James (1900)</a><br>&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2365553\" target=\"_blank\" rel=\"noopener\">Butler, Sylvester (1902)</a><br>&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2096798\" target=\"_blank\" rel=\"noopener\">Butler, Mary (1905)</a><br>&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1705234\" target=\"_blank\" rel=\"noopener\">Butler, Vera (1908)</a><br>2) <b>Repetto (in Byrne), Adelaide Ausonia (1878-1944)</b> married <b>Byrne, Thomas (1866-1944)</b> in 1911<br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1082093\" target=\"_blank\" rel=\"noopener\">Byrne, Arthur A. (1913-1968)</a><br>&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-983555\" target=\"_blank\" rel=\"noopener\">Byrne, Luigia (1914)</a><br>&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-724250\" target=\"_blank\" rel=\"noopener\">Byrne, Jennie Monica \"Jane\" (1917-1920)</a><br>&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-418559\" target=\"_blank\" rel=\"noopener\">Byrne, Edward (1920)</a><br>3) <b>Repetto, Eligio Marco (1882)</b><br>4) <b>Repetto, Silvio (1884-1965)</b> married <b>O'Donohoe (in Repetto), Elizabeth (c. 1875-1962)</b> in 1906<br>&nbsp;&nbsp;1) <b>Repetto, Angelo G. (1909)</b> married <b>Clery (in Repetto), Julia</b> in 1943<br>&nbsp;&nbsp;2) <b>Repetto, Adelaide (1916-1939)</b><br><br><b>Repetto, Andrea or Ambrogio</b> married <b>Repetto, Anne</b><br>1) <b>Repetto (in O'Neill, in Brennan), Margaret (c. 1836-1886)</b> remarried <b>Brennan, Patrick</b> in 1870<br><br>- <b>Repetto, Simon (c. 1826-1906)</b> married <b>Halpin (in Repetto), Mary (c. 1831-1921)</b> in 1851<br><br><b>Repetto, Agustino (c. 1855-1873)</b> probabilmente un figlio di Simon e fratello di Angelo Giovanni<br><br><b>Repetto (in Wright), Angela</b> married <b>Wright, George</b><br>1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-833980\" target=\"_blank\" rel=\"noopener\">Wright, Arthur (1915)</a>", "Riani": "<b>Riani, Pietro</b><br>1) <b>Riani, Carlo (c. 1882)</b> married <b>Sherlock (in Riani), Rosina (c. 1880)</b> around 1901<br>&nbsp;&nbsp;1) <b>Riani, Maria (c. 1902)</b> married <b>Connolly, James (England)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Connoly, Louie</b><br>&nbsp;&nbsp;2) <b>Riani, Luigi Talliami (1910-1980)</b> married <b>Riani, Mary (c. 1911-1980)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Riani, Brenda</b><br><br>Blog post by <b>Brenda Riani</b>, a descendant <a href=\"https://www.belfastforum.co.uk/index.php?topic=69152.0\" target=\"_blank\" rel=\"noopener\">https://www.belfastforum.co.uk/index.php?topic=69152.0</a><br>She stated that Italiano/Charles/Carlo Riani married Rosina/Rose Ann Sherlock and they had at least 3 children:<br>Assunta 'Susan' Riani (her great aunt)<br>Luigi (her grandfather)<br><br>Other post by her <a href=\"https://www.belfastforum.co.uk/index.php/topic,67154.0.html\" target=\"_blank\" rel=\"noopener\">https://www.belfastforum.co.uk/index.php/topic,67154.0.html</a><br>Charles Riani lived at 1 St. James' Crescent in 1943<br>Ida Riani died on 14 December 1960, aged 21, in a motor accident<br><br><b>Riani, Ida (c. 1939-1960)</b> <a href=\"https://civilrecords.irishgenealogy.ie/churchrecords/images/deaths_returns/deaths_1960/04335/4120584.pdf\" target=\"_blank\" rel=\"noopener\">died</a><br><br><b>Sherlock, Nicholas</b> (died before 1911) married <b>McKenna (in Sherlock), Catherine (c. 1843-1916)</b> in <a href=\"https://registers.nli.ie/registers/vtls000632894#page/86/mode/1up\" target=\"_blank\" rel=\"noopener\">1861</a> her <a href=\"https://civilrecords.irishgenealogy.ie/churchrecords/images/deaths_returns/deaths_1916/05254/4456992.pdf\" target=\"_blank\" rel=\"noopener\">death</a> <a href=\"https://nationalarchives.ie/collections/search-the-census/census-record/#census_year=1911&amp;surname__icontains=sherlock&amp;firstname__icontains=francis&amp;limit=30&amp;id=1262176\" target=\"_blank\" rel=\"noopener\">Census 1911</a><br>1) <b>Sherlock, Mary (c. 1864)</b><br>2) <b>Sherlock, James (c. 1869)</b><br>3) <b>Sherlock, Patrick (c. 1872)</b><br>4) <b>Sherlock, Francis (c. 1874)</b> <a href=\"https://nationalarchives.ie/collections/search-the-census/census-record/#census_year=1911&amp;surname__icontains=sherlock&amp;firstname__icontains=francis&amp;limit=30&amp;id=1262176\" target=\"_blank\" rel=\"noopener\">Census 1911</a> they live in the same house where Rosina married in 1920 Carlo<br>5) <b>Sherlock, Nicholas (c. 1877)</b><br>6) <b>Sherlock (in Riani), Rosina (c. 1880)</b><br><br>Article on Rosina moving Carlo's grave <a href=\"https://www.britishnewspaperarchive.com/image-viewer?issue=BL%2F0002318%2F19610515&amp;page=5&amp;article=086&amp;stringtohighlight=riani+rose\" target=\"_blank\" rel=\"noopener\"></a><br>Others <a href=\"https://www.britishnewspaperarchive.com/image-viewer?issue=BL%2F0001542%2F19580509&amp;page=6&amp;article=123&amp;stringtohighlight=riani\" target=\"_blank\" rel=\"noopener\">https://www.britishnewspaperarchive.com/image-viewer?issue=BL%2F0001542%2F19580509&amp;page=6&amp;article=123&amp;stringtohighlight=riani</a><br><a href=\"https://www.britishnewspaperarchive.com/image-viewer?issue=BL%2F0001542%2F19530703&amp;page=3&amp;article=039&amp;stringtohighlight=riani+rose\" target=\"_blank\" rel=\"noopener\">https://www.britishnewspaperarchive.com/image-viewer?issue=BL%2F0001542%2F19530703&amp;page=3&amp;article=039&amp;stringtohighlight=riani+rose</a>", "Rissone": "<b>Rissone, Eugenio (c. 1865)</b> married <b>Flynn (in Rissone), Philomena (c. 1872)</b> in 1893.<br>1) <b>Rissone, Maggie (c. 1886)</b><br>2) <b>Rissone, James (c. 1896)</b><br>3) <b>Rissone, Eugenio Patrizio (1897)</b><br>4) <b>Rissone, Caroline Mary (1903)</b><br>5) <b>Rissone, Eugenio (c. 1907)</b>", "Rolleri": "<b>Rolleri, Luigi (c. 1844-1926)</b> arrived in Ireland before 1883  <b>Norton (in Rolleri), Mary (c. 1856-1908)</b><br>1) <b>Rolleri, Mary (c. 1865)</b><br>2) <b>Rolleri, Francis (c. 1877)</b> married and had children<br>3) <b>Rolleri, Louis Joseph (1881-1886)</b><br>4) <b>Rolleri, Madeline Elizabeth (1883)</b> married <b>Witter, Thomas</b> in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-2056034\" target=\"_blank\" rel=\"noopener\">1906</a><br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1864665\" target=\"_blank\" rel=\"noopener\">Witter, Louis (1907)</a><br>&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1730648\" target=\"_blank\" rel=\"noopener\">Witter, Thomas (1908)</a><br>&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1385736\" target=\"_blank\" rel=\"noopener\">Witter, Francis (1911)</a><br>&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-952904\" target=\"_blank\" rel=\"noopener\">Witter, Mary (1914)</a><br>&nbsp;&nbsp;5) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-774046\" target=\"_blank\" rel=\"noopener\">Witter, John (1916)</a><br>&nbsp;&nbsp;6) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-584324\" target=\"_blank\" rel=\"noopener\">Witter, Joseph (1918)</a><br>&nbsp;&nbsp;7) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-409229\" target=\"_blank\" rel=\"noopener\">Witter, Madeline (1920)</a><br>5) <b>Rolleri, John Christopher (1885-1948)</b> was a <b>Taxi Driver</b> and married <b>Doran (in Rolleri), Johannah Philomena (c. 1885-1963)</b> in 1908<br>&nbsp;&nbsp;1) <b>Rolleri (in Elliott), Mary Johanna (c. 1911)</b> married <b>Elliott, Thomas</b> in 1937.<br>6) <b>Rolleri (in Lanigan), Elizabeth (1887)</b> married <b>Lanigan, Michael</b> in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-2035034\" target=\"_blank\" rel=\"noopener\">1907</a><br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1568253\" target=\"_blank\" rel=\"noopener\">Lanigan, Louis (1909)</a><br>&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1335657\" target=\"_blank\" rel=\"noopener\">Lanigan, Mary (1911)</a><br>&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1080395\" target=\"_blank\" rel=\"noopener\">Lanigan, Richard (1913)</a><br>&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-762190\" target=\"_blank\" rel=\"noopener\">Lanigan, Elizabeth (1916)</a><br>&nbsp;&nbsp;5) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-414305\" target=\"_blank\" rel=\"noopener\">Lanigan, Florence (1920)</a><br>&nbsp;&nbsp;6) <a href=\"https://www.irishgenealogy.ie/view/?record_id=cibinf-1859195\" target=\"_blank\" rel=\"noopener\">Lanigan, Madeline (1922)</a><br>&nbsp;&nbsp;7) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-43530\" target=\"_blank\" rel=\"noopener\">Lanigan, Elizabeth (1925)</a><br>7) <b>Rolleri, Florence (1889)</b> married <b>Dixon, James</b> in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-1760054\" target=\"_blank\" rel=\"noopener\">1913</a><br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1085102\" target=\"_blank\" rel=\"noopener\">Dixon, William (1913)</a><br>&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-829570\" target=\"_blank\" rel=\"noopener\">Dixon, Florence (1916)</a><br>&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-649052\" target=\"_blank\" rel=\"noopener\">Dixon, Maureen (1917)</a><br>&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-484922\" target=\"_blank\" rel=\"noopener\">Dixon, Leo (1919)</a><br>&nbsp;&nbsp;5) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-193227\" target=\"_blank\" rel=\"noopener\">Dixon, Eileen (1922)</a><br>8) <b>Rolleri, Angelina (1891)</b> married <b>Kiernan, William</b> in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-1789469\" target=\"_blank\" rel=\"noopener\">1918</a><br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-585161\" target=\"_blank\" rel=\"noopener\">Kiernan, Unkown (1918)</a><br>&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-386751\" target=\"_blank\" rel=\"noopener\">Kiernan, William (1920)</a><br>&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-243379\" target=\"_blank\" rel=\"noopener\">Kiernan, Florence (1922)</a><br>&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-165102\" target=\"_blank\" rel=\"noopener\">Kiernan, Louis (1923)</a><br>&nbsp;&nbsp;5) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2107921\" target=\"_blank\" rel=\"noopener\">Kiernan, Josephine Agnes (1925)</a><br>9) <b>Rolleri, Leo George (1894)</b><br>10) <b>Rolleri, Louis (1897-1969)</b>", "Rossi": "Ci sono pochi Rossi sul Progetto Forte e sono tutti molto distanti nel tempo quindi non dialogano con questo ramo.<br><br>Arrivano a metà 1800 e lavorano come carpentieri navali, sono una delle più antiche famiglie di italiani in Irlanda e si spostano a Dublino dove fanno tanti figli (soprattutto figlie, per questo poi sono pochi nelle generazioni successive).<br>Hai anche trovato un caso interessante <b>Rossi, Gaetano Edward (1869-1911)</b> che diventa Sergente nell'esercito britannico e muore nel 1911 ed è sepolto nel cimitero militare <b>Fort Pitt Military Cemetery, Rochester, Medway Unitary Authority, Kent, England</b>.<br><br>Ci sono dei Rossi gelatai a Belfast, controlla se sono imparentati, potrebbe trattarsi di una stessa famiglia che cambia mestiere tra una generazione e l'altra.<br><br><b>Rossi, Michael (c. 1901)</b> <b>da incastrare</b><br><br><b>Rossi, Francesco (c. 1863)</b> married <b>Caira (in Rossi), Philomena (c. 1883)</b><br>1) <b>Rossi (in Battisti), Carmela</b> married <b>Battisti, Thomas</b><br>2) <b>Rossi, John</b> married <b>Shaw (in Rossi), Eliza Ann (-1918)</b><br>&nbsp;&nbsp;1) <b>Rossi, Rosemary (1917-1917)</b><br>3) <b>Rossi, Rose (c. 1905)</b><br>4) <b>Rossi, Angelina (c. 1906)</b><br>5) <b>Rossi, Philip (c. 1908)</b><br>6) <b>Rossi, Angelina (1909)</b><br>7) <b>Rossi, Maria Teresa (1911)</b><br>8) <b>Rossi, Maria (1913)</b><br>9) <b>Rossi, Patricia (1915)</b><br><br><b>Rossi, Gaetano (c. 1829-1894)</b> married <b>Redding (in Rossi), Mary Jane (c. 1837-1890)</b><br>1) <b>Rossi (in Curran), Teresa</b> married <b>Curran, John</b><br>2) <b>Rossi, Gaetano Edward (1869-1911)</b> married <b>Flynn (in Rossi), Ellen (c. 1875-1951)</b><br>&nbsp;&nbsp;1) <b>Rossi, Ignatius (1902-1978)</b> married <b>Long (in Rossi), Esther</b><br>&nbsp;&nbsp;2) <b>Rossi, Edward Patrick (1907-1989)</b> married <b>Twohig (in Rossi), Sheila (c. 1913-1962)</b><br>3) <b>Rossi, Christopher (c. 1871-1940)</b> married <b>Flynn (in Rossi), Catherine (c. 1868-1908)</b><br>&nbsp;&nbsp;1) <b>Rossi (in McAree), Mary Jane (1894)</b><br>&nbsp;&nbsp;2) <b>Rossi, Lawrence (1894-1905)</b><br>&nbsp;&nbsp;3) <b>Rossi, Elizabeth (1895)</b><br>&nbsp;&nbsp;4) <b>Rossi, Edward Gaetano (1897-1899)</b><br>&nbsp;&nbsp;5) <b>Rossi, Catherine (c. 1899-1899)</b><br>&nbsp;&nbsp;6) <b>Rossi, Christopher John (1901-1902)</b><br>&nbsp;&nbsp;7) <b>Rossi, Eveline (1904)</b><br>&nbsp;&nbsp;8) <b>Rossi, Martha (1908-1912)</b><br>&nbsp;&nbsp;remarried <b>Woods (in Rossi), Mary Jane (c. 1875)</b><br>&nbsp;&nbsp;9) <b>Rossi, Martha (c. 1911)</b><br>&nbsp;&nbsp;10) <b>Rossi, Eveleen (c. 1911)</b><br>4) <b>Rossi, Mary Teresa (1872)</b><br>5) <b>Rossi, Mary (1873)</b><br>6) <b>Rossi, Winifred (1876)</b><br>7) <b>Rossi, Anne Louisa (1877-1962)</b><br><br><b>Rossi, Ignatius</b><br>1) <b>Rossi, Henry</b> married <b>Bollard (in Rossi), Anna</b><br><br><b>Rossi, Carmine</b> married <b>Di Pasquale (in Rossi), Margaretta</b><br>1) <b>Rossi, Annunziata Albina (1915)</b><br><br><b>Rossi, Raffaele (c. 1869)</b><br><br><b>Rossi, Benedetto (c. 1883)</b><br><br><b>Rossi, Antonio (c. 1882)</b>", "Santini": "<b>Santini, Carlo (c. 1864)</b> married <b>Burgin (in Santini), Annie (c. 1864)</b> around 1884. Had 9 children, 6 alive in 1911.<br>1) <b>Santini (in Campbell), Mary (c. 1884)</b> married <b>Campbell, Samuel</b> in 1906<br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1157936\" target=\"_blank\" rel=\"noopener\">Campbell, Louis (1913)</a><br>&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-829832\" target=\"_blank\" rel=\"noopener\">Campbell, Annie (1916)</a><br>&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-424132\" target=\"_blank\" rel=\"noopener\">Campbell, Samuel (1920)</a><br>2) <b>Santini (in Magee), Louisa (c. 1891)</b> married <b>Magee, William</b> in 1914<br>3) <b>Santini, Charles (c. 1892)</b><br>4) <b>Santini, Angelina (1896-1899)</b><br>5) <b>Santini, Anthony (c. 1898)</b><br>6) <b>Santini, Francis Patrick (1898)</b><br>7) <b>Santini, Sarah (c. 1900-1902)</b><br>8) <b>Santini, Annie (1902)</b><br>9) <b>Santini, Rose Frances (c. 1905)</b><br><br><b>Santini, Frances</b> married <b>Santini, Alicia</b><br>1) <b>Santini, Michael (c. 1854)</b><br><br><b>Santini, Joseph</b><br><b>Santini, Maryanne</b><br><br><b>Nuova ricerca</b><br><b>Santini, Joseph (c. 1904-1960)</b> married<br><br><b>Santini, Joseph (c. 1903-1962)</b> married<br><br>? married <b>Santini, Mary (c. 1881-1969)</b><br>1) <b>Santini, Thomas D.</b><br><br><a href=\"https://www.irishgenealogy.ie/view/?record_id=cidenf-408640\" target=\"_blank\" rel=\"noopener\">Santini, Frances (c. 1878-1971)</a>", "Savino": "According to [2022 09 24 Irish Times]() in 1898, <b>Savino, Giuseppe (1878-1941)</b> left Italy for the United States but, stopping in Cork, he disembarked and met a woman, <b>Gasparro (in Savino), Mary Rose (1877-1955)</b>. This seems the same story of <b>Cervi, Giuseppe (c. 1859-1927)</b><br><br>Started by <b>Savino, Giuseppe (1878-1941)</b>, son of <b>Savino, Giuseppe</b>, was a <b>musician</b>. He married <b>Gasparro (in Savino), Mary Rose (1877-1955)</b> who was born in Dublin, Ireland, and her father, <b>Gasparro, Francis (1853-1892)</b>, was also a musician.<br>They moved to Dublin where they lived in the Aungier Street area and had at least 4 children<br>1) <b>Savino, Francis Joseph (1901-1973)</b> who became a <b>confectioner</b> when his father was still a musician moved to Glasnevin and married <b>Savino, Josephine</b>.<br>They had two children.<br>&nbsp;&nbsp;1) <b>Savino (in Monaghan), Marie (1930-2015)</b> who married <b>Monaghan, Pat</b><br>&nbsp;&nbsp;2) <b>Savino, Vincent Francis (1927-2022)</b> who became a <b>soldier</b> and married <b>Page (in Savino), Catherine</b>.<br>&nbsp;&nbsp;They had 6 children: <b>Savino Gina</b>, <b>Savino Anna</b>, <b>Savino Rosa</b>, <b>Savino Caterina</b>,<b>Savino Elena</b>, and <b>Savino Franz</b>, and several grandchildren and great grandchildren still alive today.<br>2) <b>Savino, Joseph Aloysius (1903)</b> who remained a <b>confectioner</b> as his father and married <b>Page (in Savino), Catherine</b><br>3) <b>Savino, Vincent Bernard (1905-2001)</b> who became a <b>clerk</b> and married <b>Corway (in Savino), Agnes</b><br>4) <b>Savino, Michael (1907-1979)</b> who became an <b>engineer</b> and married <b>Ryan (in Savino), Mary</b>. The probably had a daughter<br>&nbsp;&nbsp;1) <b>Savino, Marie Louise (1954-1972)</b>", "Scantore": "<b>Scantore, Salvatore (c. 1851-1902)</b> arrived in Ireland before 1881 and married <b>Rainsford (in Scantore), Mary Jane</b>. They had children.<br>1) <b>Scantore, Mary Catherine (1884)</b><br>2) <b>Scandora, Dominick (1886-1886)</b><br><br>2) <b>Scantore, Peter Joseph (1880)</b><br><br>3) <b>Scantore, Francis (c. 1886-1948)</b> married <b>Lowry (in Scantore), Mary (c. 1887-1965)</b> in 1907. They had children.<br>&nbsp;&nbsp;1) <b>Scantore, Peter John (1919-1922)</b><br>&nbsp;&nbsp;2) <b>Scantore, Francis (1923)</b><br>&nbsp;&nbsp;3) <b>Scantore, John (1924)</b><br>&nbsp;&nbsp;4) <b>Scantore, Teresa (1925-1939)</b><br><br>married <b>Ellis (in Scantore), Anne (c. 1864)</b>. They had children.<br>2) <b>Scantore, Sarah (c. 1891-1949)</b><br>3) <b>Scantore (in Kemp), Anne (1894)</b> married <b>Kemp, Alfred</b> in 1930<br>4) <b>Scantore (in Tomkins), Margaret (c. 1896)</b> married <b>Tomkins, John</b> in 1920<br>Qui sembra esserci il terzo matrimonio<br>5) <b>Scantore (in Graham), Cecilia Josephine (1898)</b> married <b>Graham, James</b> in 1923.<br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-86802\" target=\"_blank\" rel=\"noopener\">Graham, Philomena (1924)</a><br>6) <b>Scantore, John Anthony (1900-1974)</b><br>7) <b>Scantore, Joseph (1901-1971)</b> who married <b>Keeler (in Scantore), Florence (c. 1901-1975)</b> in 1930<br><br>Non ci stai più capendo niente. Sembra che ci siano due sorelle omonime che sposano salvatore, nel <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-2565444\" target=\"_blank\" rel=\"noopener\">1891</a> e poi nel <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-23011700\" target=\"_blank\" rel=\"noopener\">1897</a> entrambe Anne Ellis figlie di John Ellis, la prima ha 26 anni nel 1891 quindi dovrebbe essere del 1865. Allo stesso tempo ormai non puoi nemmeno escludere che ci siano due Salvatore visto che il suo ultimo figlio nascerebbe nel 1901 anche se effettivamente lui muore nel 1902 quindi potrebbe avere senso.<br>La seconda moglie muore nel <a href=\"https://irishnewsarchive.com/?a=d&amp;d=EHD19290306.1.3&amp;srpos=6&amp;e=-------en-20--1-byDA-img-txIN-scantori---------1-1-1-1-1-1-community-------INA%2CRNA-mr-all---AND-0-0--&amp;coordinates=1190,1355,639,639\" target=\"_blank\" rel=\"noopener\">marzo 1929</a> ", "Sessarego": "Sessarego è anche una frazione del comune di Bogliasco, provincia di Genova, . Cognome diffuso tra Genova e Bogliasco.<br>Nel borgo ha anche sede l'associazione \"Sessarego nel Mondo\", che svolge ricerche storiche e riunisce tutti i discendenti degli emigranti dall'omonimo cognome che nei secoli scorsi emigrarono soprattutto nelle Americhe.<br><br><b>Sessarego, Joseph (c. 1836-1922)</b> was a draper, he arrived in Ireland before 1866, he married <b>Murphy (in Sessarego), Hannah (c. 1842-1925)</b> in 1866<br>1) <b>Sessarego, Mary Catherin (1867)</b><br>2) <b>Sessarego, Louis (1868)</b><br>3) <b>Sessarego, Hannah (1870)</b><br>4) <b>Sessarego, Helena (1872)</b><br>5) <b>Sessarego, Joseph (c. 1874-1893)</b><br>6) <b>Sessarego (in Melesi), Letizia (c. 1877)</b> married <b>Melesi, Gaetano</b> in 1901<br>7) <b>Sessarego, Rosina (1877-1937)</b><br>8) <b>Sessarego, Michael James (1878-1931)</b><br>9) <b>Sessarego (in Healy), Teresa (1880)</b> married <b>Healy, Joseph</b> in 1904<br>&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2045063\" target=\"_blank\" rel=\"noopener\">Healy, Joseph (1905)</a><br>&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1906215\" target=\"_blank\" rel=\"noopener\">Healy, Michael (1906)</a><br>&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1207231\" target=\"_blank\" rel=\"noopener\">Healy, Teresa (1912)</a><br>&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1091116\" target=\"_blank\" rel=\"noopener\">Healy, Ellen (1913)</a><br>&nbsp;&nbsp;5) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-974910\" target=\"_blank\" rel=\"noopener\">Healy, Patrick (1914)</a><br>&nbsp;&nbsp;6) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-687611\" target=\"_blank\" rel=\"noopener\">Healy, Louis (1917)</a>", "Traggenti": "<b>Traggenti, Domenico</b><br>1) <b>Traggenti, Pasquale (c. 1866)</b> married <b>Vergatti (in Traggenti), Mary (c. 1878-1903)</b>. Died before 1913.<br>&nbsp;&nbsp;1) <b>Traggenti, Joseph (c. 1893-1894)</b><br>&nbsp;&nbsp;2) <b>Traggenti, Antonio (1899-1900)</b><br>&nbsp;&nbsp;3) <b>Traggenti, Luigi (c. 1895)</b> married <b>Donnelly (in Traggenti), Mary Ann</b> in 1913.<br>&nbsp;&nbsp;4) <b>Traggenti, Michael (1897)</b><br>&nbsp;&nbsp;5) <b>Traggenti, Rose Leo (1901)</b><br>&nbsp;&nbsp;6) <b>Traggenti, Maria (1903)</b><br>&nbsp;&nbsp;and <b>Traggenti, Louisa (c. 1871)</b> in 1908", "Valente": "Nota: \"Valente\"/\"Valenti\" è un cognome molto comune, e questa pagina raccoglie <b>diversi nuclei familiari distinti e non imparentati fra loro</b> (per quanto emerso finora dalle fonti). La struttura è divisa per nucleo per evitare di confondere le linee.<br><br><div class=\"fnHeading\">Giacinto e Domenico Valente (non ancora collegati ad altri nuclei)</div><br><br><b>Valente, G. Giacinto (c. 1878)</b> was a musician. Arrived in Ireland before 1901 with his brother <b>Valente, Domenico (c. 1880)</b> and his cousins <b>Di Palma, Antonio (c. 1884)</b> and <b>D'Arcangelo, Francesco (c. 1875)</b>.<br><br><div class=\"fnHeading\">Discendenza di Antonio Valenti (morto prima del 1887)</div><br><br><b>Valenti, Antonio</b> (died before 1887)<br>1) <b>Valenti, Domenico (c. 1857)</b> was a musician and at least from was an Ice Cream Vendor. Arrived in Ireland before 1886 and married <b>Capitano (in Valenti), Theresa (c. 1865)</b> in 1887.<br>&nbsp;&nbsp;1) <b>Valenti, Antonia (1886)</b><br>&nbsp;&nbsp;2) <b>Valenti, Anthony (c. 1887)</b> married <b>McStravick (in Valenti), Annie (c. 1889)</b> in 1906<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Valenti, Dominick (1907)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Valenti, Madaleine Catherine (1908)</b><br>&nbsp;&nbsp;3) <b>Valenti, Carmine (c. 1888)</b> married <b>Cascarina (in Valenti), Theresa (c. 1891)</b> in 1907<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Valente, Matthew (1909-1910)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Valenti, Luigi Antonio (1911-1911)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Valente (in Murtagh), Minnie (1912)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Valente, Lena (c. 1914-1918)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Valente, Angelina (1916-1918)</b><br>&nbsp;&nbsp;4) <b>Valenti, Francesco (c. 1890)</b> married <b>Magee (in Valenti), Henrietta (c. 1892)</b> in 1910<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Valente, Francis Charles (c. 1911)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Valenti, Elizabeth (1912)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Valente, Teresa (1916)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Valente, James Matthew (1919-1919)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Valente, Mary Monica (1920)</b><br>&nbsp;&nbsp;5) <b>Valenti (in Tierney), Mary (c. 1892)</b> married <b>Tierney, James</b> in 1913<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1001731\" target=\"_blank\" rel=\"noopener\">Tierney, Robert (1914)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-816324\" target=\"_blank\" rel=\"noopener\">Tierney, Sarah (1916)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-423032\" target=\"_blank\" rel=\"noopener\">Tierney, James (1920)</a><br>&nbsp;&nbsp;6) <b>Valenti, Monica (1897)</b> married <b>O'Toole, Thomas James</b> in 1913<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-641518\" target=\"_blank\" rel=\"noopener\">O'Toole, Mary (1917)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-365515\" target=\"_blank\" rel=\"noopener\">O'Toole, Carmel (1920)</a><br>&nbsp;&nbsp;7) <b>Valenti, William Angelo (c. 1900-1902)</b><br>&nbsp;&nbsp;8) <b>Valenti, Angelina (c. 1900)</b><br><br><div class=\"fnHeading\">Discendenza di Andrea Valenti e Carolina Polina</div><br><br><b>Valenti, Andrea</b> married <b>Polina (in Valenti), Carolina</b>.<br>1) <b>Valenti, Pasquale (1887)</b><br>2) <b>Valenti, Joseph (1889)</b><br><br><div class=\"fnHeading\">Discendenza di Luigi Valente (c. 1838-1909) e Lucy Valenti (c. 1850)</div><br><br><b>Valente, Luigi (c. 1838-1909)</b> was a musician, married <b>Valenti, Lucy (c. 1850)</b>. Nel censimento 1901 risiedono al 64 di Little Patrick Street, Belfast, con tre dei figli.<br><br>1) <b>Valente, Maria Carmina (c. 1873-1913)</b> — Spinster, House Keeper. Non sposata, muore nel 1913 a Belfast.<br>2) <b>Valente (in Cirefice), Petronella (c. 1876-1961)</b> married <b>Cirefice, Vittorio (1872-c. 1955)</b> nel 1898<br>&nbsp;&nbsp;1) <b>Cirefice, Marco (1907)</b> married <b>Magliocco (in Cirefice), Maria Angelina (1912-2000)</b><br>&nbsp;&nbsp;2) <b>Cirefice, Maria Rachela (1909)</b><br>&nbsp;&nbsp;3) <b>Cirefice, Antonio (1911-1971)</b><br>&nbsp;&nbsp;4) <b>Cirefice, Dominic Anthony (1913-1983)</b><br>&nbsp;&nbsp;5) <b>Cirefice, Maria Luisa (1916-1993)</b><br>3) <b>Valente, Andrea (c. 1882-1890)</b> — muore bambino nel 1890<br>4) <b>Valente, Gerardo (c. 1890-1955)</b> — street musician a Belfast, poi Ice Cream Vendor, poi Fish Restaurant Owner a Dublino. Identità confermata dal censimento 1901 (registrato \"Gelards\", 12 anni, figlio di Luigi e Lucia) e dal censimento 1911 (stessa madre Lucy Valenti). Married <b>Nardella (in Valente), Benedetta (-1955)</b> — nel censimento 1911 trascritta erroneamente \"Bridget\".<br>&nbsp;&nbsp;1) <b>Valente, Maria (1909)</b> — nel censimento 1911 trascritta erroneamente \"Louisia\"<br>&nbsp;&nbsp;2) <b>Valente, Carmine (1912-1914)</b><br>&nbsp;&nbsp;3) <b>Valente, Maria (1915-1994)</b><br>&nbsp;&nbsp;4) <b>Valente, Biagio Andrea (1920-1994)</b><br>&nbsp;&nbsp;5) <b>Valente, Gerardo (1921)</b> married <b>Byrne (in Valente), Mary</b> in 1944<br>&nbsp;&nbsp;6) <b>Valente, Lena (-1992)</b><br>&nbsp;&nbsp;7) <b>Valente, Edward</b> married <b>Cornelia (in Valente), Anne</b> in 1942<br><br><div class=\"fnHeading\">Discendenza di Benedetto Valente e Giovanna De Felice</div><br><br><b>Valente, Benedetto</b> was a musician and married <b>De Felice (in Valente), Giovanna</b><br>1) <b>Valente, Maria (1898)</b><br><br><div class=\"fnHeading\">Discendenza di Silvestro Valente (c. 1869-1925) e Jean Manro</div><br><br><b>Valente, Silvestro (c. 1869-1925)</b> married <b>Manro (in Valente), Jean (c. 1886-1946)</b><br>1) <b>Valente, Silvestro (c. 1907-1928)</b><br>2) <b>Valente, Pio Patrick (c. 1910-1972)</b> married <b>Valente, Kathleen</b> in 1943<br>3) <b>Valente, Christina (1920)</b>", "Valenti": "Nota: \"Valente\"/\"Valenti\" è un cognome molto comune, e questa pagina raccoglie <b>diversi nuclei familiari distinti e non imparentati fra loro</b> (per quanto emerso finora dalle fonti). La struttura è divisa per nucleo per evitare di confondere le linee.<br><br><div class=\"fnHeading\">Giacinto e Domenico Valente (non ancora collegati ad altri nuclei)</div><br><br><b>Valente, G. Giacinto (c. 1878)</b> was a musician. Arrived in Ireland before 1901 with his brother <b>Valente, Domenico (c. 1880)</b> and his cousins <b>Di Palma, Antonio (c. 1884)</b> and <b>D'Arcangelo, Francesco (c. 1875)</b>.<br><br><div class=\"fnHeading\">Discendenza di Antonio Valenti (morto prima del 1887)</div><br><br><b>Valenti, Antonio</b> (died before 1887)<br>1) <b>Valenti, Domenico (c. 1857)</b> was a musician and at least from was an Ice Cream Vendor. Arrived in Ireland before 1886 and married <b>Capitano (in Valenti), Theresa (c. 1865)</b> in 1887.<br>&nbsp;&nbsp;1) <b>Valenti, Antonia (1886)</b><br>&nbsp;&nbsp;2) <b>Valenti, Anthony (c. 1887)</b> married <b>McStravick (in Valenti), Annie (c. 1889)</b> in 1906<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Valenti, Dominick (1907)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Valenti, Madaleine Catherine (1908)</b><br>&nbsp;&nbsp;3) <b>Valenti, Carmine (c. 1888)</b> married <b>Cascarina (in Valenti), Theresa (c. 1891)</b> in 1907<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Valente, Matthew (1909-1910)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Valenti, Luigi Antonio (1911-1911)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Valente (in Murtagh), Minnie (1912)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Valente, Lena (c. 1914-1918)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Valente, Angelina (1916-1918)</b><br>&nbsp;&nbsp;4) <b>Valenti, Francesco (c. 1890)</b> married <b>Magee (in Valenti), Henrietta (c. 1892)</b> in 1910<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Valente, Francis Charles (c. 1911)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Valenti, Elizabeth (1912)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Valente, Teresa (1916)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Valente, James Matthew (1919-1919)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Valente, Mary Monica (1920)</b><br>&nbsp;&nbsp;5) <b>Valenti (in Tierney), Mary (c. 1892)</b> married <b>Tierney, James</b> in 1913<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1001731\" target=\"_blank\" rel=\"noopener\">Tierney, Robert (1914)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-816324\" target=\"_blank\" rel=\"noopener\">Tierney, Sarah (1916)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-423032\" target=\"_blank\" rel=\"noopener\">Tierney, James (1920)</a><br>&nbsp;&nbsp;6) <b>Valenti, Monica (1897)</b> married <b>O'Toole, Thomas James</b> in 1913<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-641518\" target=\"_blank\" rel=\"noopener\">O'Toole, Mary (1917)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-365515\" target=\"_blank\" rel=\"noopener\">O'Toole, Carmel (1920)</a><br>&nbsp;&nbsp;7) <b>Valenti, William Angelo (c. 1900-1902)</b><br>&nbsp;&nbsp;8) <b>Valenti, Angelina (c. 1900)</b><br><br><div class=\"fnHeading\">Discendenza di Andrea Valenti e Carolina Polina</div><br><br><b>Valenti, Andrea</b> married <b>Polina (in Valenti), Carolina</b>.<br>1) <b>Valenti, Pasquale (1887)</b><br>2) <b>Valenti, Joseph (1889)</b><br><br><div class=\"fnHeading\">Discendenza di Luigi Valente (c. 1838-1909) e Lucy Valenti (c. 1850)</div><br><br><b>Valente, Luigi (c. 1838-1909)</b> was a musician, married <b>Valenti, Lucy (c. 1850)</b>. Nel censimento 1901 risiedono al 64 di Little Patrick Street, Belfast, con tre dei figli.<br><br>1) <b>Valente, Maria Carmina (c. 1873-1913)</b> — Spinster, House Keeper. Non sposata, muore nel 1913 a Belfast.<br>2) <b>Valente (in Cirefice), Petronella (c. 1876-1961)</b> married <b>Cirefice, Vittorio (1872-c. 1955)</b> nel 1898<br>&nbsp;&nbsp;1) <b>Cirefice, Marco (1907)</b> married <b>Magliocco (in Cirefice), Maria Angelina (1912-2000)</b><br>&nbsp;&nbsp;2) <b>Cirefice, Maria Rachela (1909)</b><br>&nbsp;&nbsp;3) <b>Cirefice, Antonio (1911-1971)</b><br>&nbsp;&nbsp;4) <b>Cirefice, Dominic Anthony (1913-1983)</b><br>&nbsp;&nbsp;5) <b>Cirefice, Maria Luisa (1916-1993)</b><br>3) <b>Valente, Andrea (c. 1882-1890)</b> — muore bambino nel 1890<br>4) <b>Valente, Gerardo (c. 1890-1955)</b> — street musician a Belfast, poi Ice Cream Vendor, poi Fish Restaurant Owner a Dublino. Identità confermata dal censimento 1901 (registrato \"Gelards\", 12 anni, figlio di Luigi e Lucia) e dal censimento 1911 (stessa madre Lucy Valenti). Married <b>Nardella (in Valente), Benedetta (-1955)</b> — nel censimento 1911 trascritta erroneamente \"Bridget\".<br>&nbsp;&nbsp;1) <b>Valente, Maria (1909)</b> — nel censimento 1911 trascritta erroneamente \"Louisia\"<br>&nbsp;&nbsp;2) <b>Valente, Carmine (1912-1914)</b><br>&nbsp;&nbsp;3) <b>Valente, Maria (1915-1994)</b><br>&nbsp;&nbsp;4) <b>Valente, Biagio Andrea (1920-1994)</b><br>&nbsp;&nbsp;5) <b>Valente, Gerardo (1921)</b> married <b>Byrne (in Valente), Mary</b> in 1944<br>&nbsp;&nbsp;6) <b>Valente, Lena (-1992)</b><br>&nbsp;&nbsp;7) <b>Valente, Edward</b> married <b>Cornelia (in Valente), Anne</b> in 1942<br><br><div class=\"fnHeading\">Discendenza di Benedetto Valente e Giovanna De Felice</div><br><br><b>Valente, Benedetto</b> was a musician and married <b>De Felice (in Valente), Giovanna</b><br>1) <b>Valente, Maria (1898)</b><br><br><div class=\"fnHeading\">Discendenza di Silvestro Valente (c. 1869-1925) e Jean Manro</div><br><br><b>Valente, Silvestro (c. 1869-1925)</b> married <b>Manro (in Valente), Jean (c. 1886-1946)</b><br>1) <b>Valente, Silvestro (c. 1907-1928)</b><br>2) <b>Valente, Pio Patrick (c. 1910-1972)</b> married <b>Valente, Kathleen</b> in 1943<br>3) <b>Valente, Christina (1920)</b>", "Valerio": "<b>Valerio, Vincenzo</b> had children.<br>1) <b>Valerio, Anthony (c. 1858-1925)</b> was a musician, he arrived in Ireland before 1876 and married <b>Morton (in Valerio), Catherine (c. 1860-1885)</b>. They had children<br>&nbsp;&nbsp;1) <b>Valerio, Vincent Patrick (c. 1881-1883)</b> <br>&nbsp;&nbsp;2) <b>Valerio, Rosanna (1883-1884)</b><br>&nbsp;&nbsp;He remarried <b>Grattan (in Lister, in Valerio), Elizabeth (c. 1856-1930)</b> in 1890. They had children.<br>&nbsp;&nbsp;3) <b>Valerio (in Owens), Christina Mary (1891)</b> married <b>Owens, Thomas</b> in 1919. They had children.<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-427575\" target=\"_blank\" rel=\"noopener\">Owens, Patrick (1920)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-314834\" target=\"_blank\" rel=\"noopener\">Owens, Maureen (1921)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-161572\" target=\"_blank\" rel=\"noopener\">Owens, Carmela (1923)</a><br>&nbsp;&nbsp;4) <b>Valerio, Sylvester (1895)</b> married <b>Williams (in Valerio), Elizabeth</b> in 1920. They had children.<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Valerio, Christina (1925-1926)</b><br>&nbsp;&nbsp;5) <b>Valerio (in Brennan), Elizabeth (1899)</b> married <b>Brennan, James</b> in 1924<br>2) <b>Valerio, Peter (c. 1846-1903)</b> was a <b>musician</b>, he arrived in Ireland before 1880 and married <b>McGovern (in Valerio), Ellen (c. 1863-1915)</b> in 1879. They had children.<br>&nbsp;&nbsp;1) <b>Valerio, Rachel (1880)</b> married <b>Delaney, Bernard</b> in 1897. They had children<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2380374\" target=\"_blank\" rel=\"noopener\">Delaney, Sylverster</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2160626\" target=\"_blank\" rel=\"noopener\">Delaney, Bernard</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1956032\" target=\"_blank\" rel=\"noopener\">Delaney, Esther</a><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1755443\" target=\"_blank\" rel=\"noopener\">Delaney, William (1908)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1497749\" target=\"_blank\" rel=\"noopener\">Delaney, Patrick (1910)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;6) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1280330\" target=\"_blank\" rel=\"noopener\">Delaney, Christina (1911)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;7) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-974022\" target=\"_blank\" rel=\"noopener\">Delaney, Anthony (1914)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;8) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-733483\" target=\"_blank\" rel=\"noopener\">Delaney, Rachel (1916)</a><br>&nbsp;&nbsp;2) <b>Valerio, Joseph Valerio (c. 1883-1884)</b><br>&nbsp;&nbsp;3) <b>Valerio, Francis Silvester (1884-1952)</b> became a <b>musician</b> and later a <b>soldier</b> and married <b>Connolly (in Valerio), Margaret (c. 1883-1905)</b> in 1903 They had children <br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Valerio, Francis (1903-1977)</b> married <b>McDonnell (in Valerio), Frances</b> in 1929. They have children<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Valerio, Francesco </b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Valerio, Gerard</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Valerio, Pat</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Valerio, Willie</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Valerio, Martin</b> who married <b>Valerio, Annie</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6) <b>Valerio, John</b> who married <b>Valerio, Kathleen</b>. They had children<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7) <b>Valerio, Chrissie</b> who married Paddy. They had children<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;8) <b>Valerio, Frances</b> who married Michael. They had children<br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Valerio, Mary Margaret (1905-1905)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;He also married <b>Flynn (in Valerio), Mary Kate (c. 1890-1956)</b> in 1907. They had children<br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Valerio, Ellen Mary (1909-1916)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Valerio, Peter (1910)</b> married <b>Morgan (in Valerio, Mary)</b> in 1941 <br>&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Valerio, Catherine (c. 1911-1912)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;6) <b>Valerio, Anna Maria (1912)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;7) <b>Valerio, Sylvester (1914-1915)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;8) <b>Valerio (in Nolan), Rachel (1916)</b> married <b>Nolan, James</b> in 1937<br>&nbsp;&nbsp;&nbsp;&nbsp;9) <b>Valerio, Mary Kate (1918)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;10) <b>Valerio, Emmeline (1920)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;11) <b>Valerio, Esther (1921-1993)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;12) <b>Valerio, Elizabeth Mary (1923-1941)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;13) <b>Valerio, Anthony (1924)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;14) <b>Valerio, Philomena (1925)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;15) <b>Valerio, Christina (c. 1929-1931)</b><br>&nbsp;&nbsp;4) <b>Valerio, Vincent (1887)</b><br>&nbsp;&nbsp;5) <b>Valerio (in Neale in Harding), Martha Mary (1889)</b> married <b>Neale, Frederick William</b> in 1911. They had children.<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-1248152\" target=\"_blank\" rel=\"noopener\">Neale, Florence (1912)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;She later married <b>Harding, William</b>. They had children.<br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-607348\" target=\"_blank\" rel=\"noopener\">Harding, Martha (1918)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-423623\" target=\"_blank\" rel=\"noopener\">Harding, William (1920)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-216383\" target=\"_blank\" rel=\"noopener\">Harding, Peter Christopher (1922)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-97184\" target=\"_blank\" rel=\"noopener\">Harding, Leonard (1924)</a><br>&nbsp;&nbsp;6) <b>Valerio, Peter (1891-1892)</b><br>&nbsp;&nbsp;7) <b>Valerio, Esther (1893)</b> married <b>Nolan, James</b> in 1915. They had children.<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-576992\" target=\"_blank\" rel=\"noopener\">Nolan, Ellen (1918)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-439673\" target=\"_blank\" rel=\"noopener\">Nolan, James (1920)</a><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-213876\" target=\"_blank\" rel=\"noopener\">Nolan, Christopher (1922)</a><br>&nbsp;&nbsp;8) <b>Valerio, Antonio (1896)</b> married <b>Carroll (in Valerio), Sarah</b> in 1918<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Valerio, Unknown (1922)</b><br>&nbsp;&nbsp;9) <b>Valerio, Peter (c. 1899)</b><br><br>Una figlia di <b>Valerio, Francis Silvester (1884-1952)</b> di nome Mary, quindi <b>Valerio, Anna Maria (1912)</b> o <b>Valerio, Mary Kate (1918)</b>, sposa <b>Moore, Micheal</b> nel <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-1423187\" target=\"_blank\" rel=\"noopener\">1940</a>.<br><br><b>There is a <b>Valerio, John Patrick (c. 1890-1917)</b> who died before 1972 and married <b>Valerio, Nellie (c. 1890-1972)</b> and they were living in Cork.</b><br><b>There is a <b>Valerio, Maurice (1914-1941)</b> son of <b>Valerio, John Patrick (c. 1890-1917)</b> from 150 Blarney Street.</b> It is possible they were from a different Valerio family.<br><br>There is a <b>Valerio (in Lambert), Ellen</b> daughter of <b>Valerio, Anthony</b> who married <b>Lambert, James</b> in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cima-2205814\" target=\"_blank\" rel=\"noopener\">1895</a><br><br>There is a <b>Valerio, Mary (1903)</b> daughter of <b>Valerio, Anthony</b> and <b>Racckio (in Valerio), Maria</b> born in <a href=\"https://www.irishgenealogy.ie/view/?record_id=e768beed6b-2265302\" target=\"_blank\" rel=\"noopener\">1903</a>. Weird surname of her mother<br><br>There is a <b>Valerio, Marie Ventorina (1906-1907)</b> daughter of <b>Robina (in Valerio), Marie</b>", "Vannucci": "1) <b>Vannucci, Peter (c. 1887)</b> married <b>Quigley (in Vannucci), Catherine (c. 1886)</b><br>&nbsp;&nbsp;1) <b>Vannucci, Serafina (1906-1908)</b><br>&nbsp;&nbsp;2) <b>Vannucci, Elizabeth (1907)</b><br>&nbsp;&nbsp;3) <b>Vannucci, Serafina (1909)</b><br>&nbsp;&nbsp;4) <b>Vannucci, Raffaello (1911)</b><br>2) <b>Vannicci, Pasqual (c. 1888)</b><br><br>There is also a <b>Vannucci, Giovanni</b> marrying <b>Quigley, Catherine</b> in Scotland in 1905 <a href=\"https://www.scotlandspeople.gov.uk/record-results/7301486006a71bf3d4c9a3\" target=\"_blank\" rel=\"noopener\">https://www.scotlandspeople.gov.uk/record-results/7301486006a71bf3d4c9a3</a>", "Vannicci": "1) <b>Vannucci, Peter (c. 1887)</b> married <b>Quigley (in Vannucci), Catherine (c. 1886)</b><br>&nbsp;&nbsp;1) <b>Vannucci, Serafina (1906-1908)</b><br>&nbsp;&nbsp;2) <b>Vannucci, Elizabeth (1907)</b><br>&nbsp;&nbsp;3) <b>Vannucci, Serafina (1909)</b><br>&nbsp;&nbsp;4) <b>Vannucci, Raffaello (1911)</b><br>2) <b>Vannicci, Pasqual (c. 1888)</b><br><br>There is also a <b>Vannucci, Giovanni</b> marrying <b>Quigley, Catherine</b> in Scotland in 1905 <a href=\"https://www.scotlandspeople.gov.uk/record-results/7301486006a71bf3d4c9a3\" target=\"_blank\" rel=\"noopener\">https://www.scotlandspeople.gov.uk/record-results/7301486006a71bf3d4c9a3</a>", "Vella": "<b>Vella, Thomas</b><br>1) <b>Vella, Felix (c. 1846-1924)</b> married <b>Woods (in Vella), Mary Ann (c. 1847-1902)</b> in 1865<br>&nbsp;&nbsp;1) <b>Vella (in Donovan), Mary Caroline (1869)</b> married <b>Donovan, Mark</b> in 1899<br>&nbsp;&nbsp;2) <b>Vella, Catherine Mary (1875)</b><br>&nbsp;&nbsp;3) <b>Vella, Thomas (1877)</b><br>&nbsp;&nbsp;4) <b>Vella, Thomas John (c. 1881)</b> married <b>O'Toole (in Vella), Kathleen</b> in 1911<br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Vella, Felix (1912-1934)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Vella, John (1914)</b> married <b>Taaffe (in Vella), Rosaleen</b> in 1944<br>&nbsp;&nbsp;and remarried <b>Smyth (in Vella), Mary Anne (c. 1866)</b> around 1903<br><br><b>Vella, Patrick</b> married <b>Kenny (in Vella), Bridget</b><br>1) <b>Vella, Bridget (1878)</b><br><br><b>Vella, Domenico (1798-1837)</b> married <b>Cirefice (in Vella), Rosaria (c. 1879-1859)</b> <br>1) <b>Vella, Maria Pasqua (1824)</b><br>2) <b>Vella, Francesco Antonio (1828)</b> married <b>Vella, Agata</b><br>&nbsp;&nbsp;1) <b>Vella, Domenico Antonio (1863)</b> married <b>Bianchi, Maria Domenica (1868)</b><br>&nbsp;&nbsp;remarried <b>Bianchi (in Vella), Maria Saveria (1864-1917)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Vella (in Mezza), Maria Rosaria (1891-1923)</b> married <b>Mezza, Giuseppe (1885-1922)</b> in 1909<br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>[[Vella, Francesco Luigi Antonio (1893)</b> married <b>Fusco (in Vella), Pace (1897)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Vella, Domenico (1924-1981)</b> married <b>Morelli (in Vella), Concetta (1919-1996)</b> in 1946<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Vella (in Scappaticci), Saveria (-1997)</b> married <b>Scappaticci, Ernest (c. 1922-1974)</b>]]<br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Vella, Agata L. (1895-1976)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Vella, Maria Filomena Carmela (1897-1976)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Vella, Antonia Concetta Emilia (1898-1977)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;6) <b>Vella, Luigia Angela Maria (1901-1938)</b> married <b>Du Gallani, Enea Leggia</b> in 1924<br>&nbsp;&nbsp;&nbsp;&nbsp;7) <b>Vella, Alexandrina (1905-1905)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;8) <b>Vella, Tommasina Antonia Domenica (1907-1908)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;remarried <b>Bianchi, Giovanna</b><br>&nbsp;&nbsp;&nbsp;&nbsp;9) <b>Vella, Saveria Maria Rosa Gilda (1920)</b><br>&nbsp;&nbsp;2) <b>Vella, Rosaria (1869)</b><br>&nbsp;&nbsp;3) <b>Vella, Giuseppe (1872)</b><br>&nbsp;&nbsp;4) <b>Vella, Rosaria (1875)</b><br>&nbsp;&nbsp;5) <b>Vella, Antonio (1877)</b><br><br><b>Vella, Tarquinio (c. 1706-c.1782)</b> married <b>Di Noccaro (in Vella), Camilla (c. 1715- c. 1794)</b><br>1) <b>Vella, Giovanni (c. 1745)</b><br>2) <b>Vella, Angelo (c. 1747)</b><br>3) <b>Vella, Pietrantonio (c. 1752-1828)</b> married <b>Lieghio (in Vella), Felice (c. 1749)</b><br>&nbsp;&nbsp;1) <b>Vella, Giovanni (c. 1778-1836)</b> married <b>Morelli (in Vella), Oliva (1788-1860)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Vella, Tarquinio (c. 1811-1816)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Vella, Camilla (1814)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Vella, Maria Giuseppa (1818)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Vella, Tarquinio (1821)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Vella, Pietrantonio (1824-1861)</b> married <b>Fusco (in Vella), Maria Giuseppa (1824)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Vella, Giovanni Antonio (1855)</b> married <b>Persichini (in Vella), Maria (1864)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Vella, Pietrantonio (1880-1944)</b> married <b>Fusciardi (in Cafolla, in Vella), Livia (1873)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Vella, Biagio (1882)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Vella, Orazio (1886-1969))</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Vella, Maria Giuseppa (1889)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Vella, Nicolas (1896)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6) <b>Vella, Giuseppe (1899-1973)</b> married <b>Cafolla (in Vella), Maria Pacifica Rosaria (1899-1956)</b> in 1922<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Vella, Maria Giuseppa (1923)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Vella, Giovanni (1925)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Vella, Angela (1855)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Vella, Nicolino (1858-1861)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Vella, Angela (1858)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Vella, Salvatore (1860)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6) <b>Vella (in Magliocco), Oliva (1862-1960)</b> married <b>Magliocco, Celestino (1856-1940)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;6) <b>Vella, Clementina (1827-1880)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;7) <b>Vella, Angelantonio (1831-1833)</b><br>&nbsp;&nbsp;3) <b>Vella, Celesta (c. 1780-1837)</b> <br>&nbsp;&nbsp;4) <b>Vella, Rosa (c. 1780-1837)</b><br>&nbsp;&nbsp;5) <b>Vella, Mariangela (c. 1782-1823)</b><br>&nbsp;&nbsp;6) <b>Vella, Tarquinio (c. 1789)</b><br>5) <b>Vella, Giovanni (c. 1755)</b> <br><br><b>Vella, Vincenzo (c. 1698-c. 1756)</b> married <b>Di Noccaro (in Vella), Felica (c. 1709)</b><br>1) <b>Vella, Giacomo (c. 1732-1794)</b><br>&nbsp;&nbsp;1) <b>Vella, Maria (c. 1761)</b><br>&nbsp;&nbsp;2) <b>Vella, Angela (c. 1766)</b><br>&nbsp;&nbsp;3) <b>Vella, Vincenzo (1771)</b><br>&nbsp;&nbsp;4) <b>Vella, Felice (1777-1846)</b> married <b>Antonelli (in Vella), Vincenza (c. 1780-1825)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Vella, Giacomo Donato (1809)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Vella, Donato Antonio (1815)</b> married <b>Crenca (in Vella), Anna Maria (1805)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Vella, Vincenzo (1831)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2) <b>Vella, Tommaso (1832-1840)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3) <b>Vella, Giacomo Luigi (1835)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4) <b>Vella, Angelo (1837)</b> married <b>Morelli (in Vella), Maria Celesta (1837)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Vella (in Magliocco), Maria Libera (1878-1942)</b> married <b>Magliocco, Giovanni Antonio (1874-1956)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5) <b>Vella, Tommaso Antonio (1841)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6) <b>Vella (in Fusciardi), Maria Celesta (1844)</b> married <b>Fusciardi, Tommaso Angelo (1838)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1) <b>Fusciardi (in Morelli), Maria Antonia (1886)</b><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7) <b>Vella, Maria Felice (1848)</b><br>&nbsp;&nbsp;5) <b>Vella, Santa (c. 1781)</b><br>2) <b>Vella, Maria (c. 1734)</b><br>3) <b>Vella, Francesca (c. 1736)</b><br>4) <b>Vella, Catarina (c. 1738)</b><br><br><b>Vella (in Morelli), Giuseppina (c. 1889-1962)</b> <i>devi trovare atto di nascita e matrimonio</i>", "Venencia": "<b>Venencia, Peter (c. 1841-1922)</b> was a frame maker, arrived in Ireland before 1883 and married <b>Ross (in Venencia), Catherine (c. 1851-1916)</b> in. They had children<br>1) <b>Venencia, Eliza (1874)</b><br>2) <b>Venencia, John Henry (c. 1877-1883)</b><br>3) <b>Venencia, Mary Ann (c. 1880)</b><br>4) <b>Venencia, Veronica (c. 1881-1882)</b><br>5) <b>Venencia, Lawrence Leo (c. 1883-1973)</b> married <b>Brennan (in Venencia), Mary (c. 1884-1937)</b> in 1903. They had children.<br>&nbsp;&nbsp;1) <b>Venencia, Mary Catherine (1904-1904)</b><br>&nbsp;&nbsp;2) <b>Venencia (in Doyle), Elizabetta (c. 1908)</b> married <b>Doyle, Martin</b> in 1938.<br>&nbsp;&nbsp;3) <b>Venencia, Peter (1910-1996)</b> married <b>Smith (in Venencia), Christina</b> in 1933.<br>&nbsp;&nbsp;4) <b>Venencia, Stephen (1912)</b><br>&nbsp;&nbsp;5) <b>Venencia, Laurence (1914)</b> married <b>Denny (in Venencia), Esther</b> in 1941<br>&nbsp;&nbsp;6) <b>Venencia, Ellen Mary (1916)</b> married <b>Kelly, Samuel</b> in 1938<br>&nbsp;&nbsp;7) <b>Venencia, Mary Catherine (1919)</b> married <b>Gaffney, James</b> in 1942<br>&nbsp;&nbsp;8) <b>Venencia, Eileen Josephine (1922-1951)</b><br>&nbsp;&nbsp;He married <b>Kiernan (in Russell in Venencia), Mary Jane (c. 1892-1961)</b> in 1938.<br>6) <b>Venencia, Peter Christopher (1886)</b><br>7) <b>Venencia, Andrew (1887-1971)</b> married <b>Pugolas (in Venencia), Susan (c. 1890-1973)</b> in 1915.<br>&nbsp;&nbsp;1) <b>Venencia, Peter (1916)</b><br>&nbsp;&nbsp;2) <b>Venencia, Kathleen (1916)</b> married <b>O'Connor, John</b> in 1945<br>&nbsp;&nbsp;3) <b>Venencia, Agnes (1918)</b><br>&nbsp;&nbsp;4) <b>Venencia, Andrew Michael Paul (1921)</b><br>8) <b>Venencia (in Moss), Agnes Teresa (1891)</b> married <b>Moss, William</b> in 1916 or <b>Moffett, Joseph</b> in 1929 (you can't fine another Agnes daughter of Peter)<br>9) <b>Venencia, Elizabeth Frances (1893-1894)</b><br><br>A Mary Venencia died in <a href=\"https://www.irishgenealogy.ie/view/?record_id=cide-2913601\" target=\"_blank\" rel=\"noopener\">1961</a> at the age of 69/", "Vergatti": "<b>Vergatti, Gesiio (c. 1842)</b> married <b>Vergatti, Mary (c. 1841-1906)</b><br>1) <b>Vergatti (in Traggenti), Mary (c. 1878-1903)</b> married <b>Traggenti, Pasquale (c. 1866)</b> in 1892.<br>2) <b>Vergatti (in Notarantonio), Maria Grazia Rose (c. 1880-1903)</b> married <b>Notarantonio, Antonio (c. 1881-1970)</b><br>&nbsp;&nbsp;1) <b>Notarantonio, Nemo Giovannino (1898)</b><br>&nbsp;&nbsp;2) <b>Notarantonio, Vittorio 'Antonio' (1900)</b><br>&nbsp;&nbsp;3) <b>Notarantonio (in Magliocco), Luisetta 'Lenziatta' (1902-1980)</b>", "Viacava": "<b>Viacava, Orlando (c. 1855)</b> married <b>Browne (in Viacava), Mary Josephine (c. 1856-1901)</b> in 1876. 12 children, 9 alive in 1911.<br>1) <b>Viacava, Maria (c. 1881)</b><br>2) <b>Viacava, Gerolama (c. 1882)</b><br>3) <b>Viacava, Emilia (c. 1883)</b><br>4) <b>Viacava, Rose (1884-1885)</b><br>5) <b>Viacava (in James), Nellie (1881)</b> married James Albert<br>6) <b>Viacava, Richard (c. 1894)</b><br>7) <b>Viacava, Maggie (c. 1892)</b><br>8) <b>Viacava, Rosa (c. 1899)</b><br>9) <b>Viacava, Christopher (1895)</b><br><br>Sarebbe bene rifare la ricerca Viacava che ha fatto Claude"};
function cmpNullableNum(a,b,mul){
  if(a===null && b===null) return 0;
  if(a===null) return 1;
  if(b===null) return -1;
  return mul*(a-b);
}
function famStats(){
  const rows=famnames.map(f=>{
    let min=null,max=null,n=0;
    NAMES.forEach(k=>{
      if(!belongsTo(DATA[k],f)) return;
      n++;
      DATA[k].events.forEach(e=>{ if(e.y){ if(min===null||e.y<min)min=e.y; if(max===null||e.y>max)max=e.y; } });
    });
    return {f:f, n:n, min:min, max:max};
  });
  return rows;
}
const FAMROWS=famStats();
let famSortState={key:"f", dir:"asc"};
function famSortedRows(){
  const {key,dir}=famSortState;
  const mul = dir==="asc"?1:-1;
  return FAMROWS.slice().sort((a,b)=>{
    if(key==="f") return mul*a.f.localeCompare(b.f,"it");
    return cmpNullableNum(a[key], b[key], mul);
  });
}
function famArrow(k){ return famSortState.key===k ? (famSortState.dir==="asc"?" \u25B2":" \u25BC") : ""; }
function renderFams(){
  const q=document.getElementById("famq").value.toLowerCase();
  document.querySelector("#famtable tbody").innerHTML=famSortedRows().filter(r=>!q||r.f.toLowerCase().includes(q))
    .map(r=>'<tr class="famrow" onclick="openFamily(\''+r.f.replace(/'/g,"\\'")+'\')"><td><b>'+esc(r.f)+'</b></td><td>'+r.n+'</td><td>'+(r.min===null?"":r.min)+'</td><td>'+(r.max===null?"":r.max)+'</td></tr>').join("");
  document.querySelectorAll("#famtable th[data-sortkey]").forEach(th=>{
    th.querySelector(".sortarrow").textContent = famArrow(th.dataset.sortkey);
  });
}
document.getElementById("famq").oninput=renderFams;
document.querySelectorAll("#famtable th[data-sortkey]").forEach(th=>{
  th.addEventListener("click", ()=>{
    const k=th.dataset.sortkey;
    if(famSortState.key===k) famSortState.dir = famSortState.dir==="asc"?"desc":"asc";
    else famSortState = {key:k, dir:(k==="f")?"asc":"desc"};
    renderFams();
  });
});
renderFams();
window.gotoFam=function(f){
  famsel.value=f; renderList();
  document.querySelector('nav button[data-tab="people"]').click();
};

// ---------------- Family modal: short history (from FAMILY_NOTES, once written) + a
// sortable member table, reusing the person modal's #overlay/#pmodal/closePerson().
let famModalSortState={key:"cognome", dir:"asc"};
function famMemberRows(f){
  const rows=[];
  NAMES.forEach(k=>{
    const p=DATA[k]; if(!belongsTo(p,f)) return;
    const m = /^(.+?)\s*\(([^()]*)\)\s*$/.exec(k);
    const surnameGiven = m ? m[1] : k;
    const ci = surnameGiven.indexOf(", ");
    const cognome = ci>=0 ? surnameGiven.slice(0,ci) : surnameGiven;
    const nome = ci>=0 ? surnameGiven.slice(ci+2) : "";
    const bEv = (p.events||[]).find(e=>e.t==="nascita");
    const dEv = (p.events||[]).find(e=>e.t==="morte");
    rows.push({
      key:k, cognome, nome,
      byear: (bEv && bEv.y!=null) ? bEv.y : null,
      bplace: (bEv && bEv.pl) ? bEv.pl : "",
      dyear: (dEv && dEv.y!=null) ? dEv.y : null,
      dplace: (dEv && dEv.pl) ? dEv.pl : "",
    });
  });
  return rows;
}
function famModalSortedRows(rows){
  const {key,dir}=famModalSortState;
  const mul = dir==="asc"?1:-1;
  return rows.slice().sort((a,b)=>{
    if(key==="cognome"||key==="nome"||key==="bplace"||key==="dplace") return mul*String(a[key]).localeCompare(String(b[key]),"it");
    return cmpNullableNum(a[key], b[key], mul);
  });
}
function famModalArrow(k){ return famModalSortState.key===k ? (famModalSortState.dir==="asc"?" \u25B2":" \u25BC") : ""; }
window.openFamily=function(f){
  const el=document.getElementById("pmodal");
  const rows = famMemberRows(f);
  famModalSortState = {key:"cognome", dir:"asc"};
  const noteHtml = FAMILY_NOTES[f];
  let h='<button id="pmClose" onclick="closePerson()">&times;</button>';
  h+='<h2>'+esc(f)+' <span style="font-weight:normal;color:#776955">('+rows.length+' '+TT("people","persone")+')</span></h2>';
  h+='<div style="margin:4px 0 8px 0"><a class="pl" onclick="gotoFam(\''+f.replace(/'/g,"\\'")+'\')">'+TT("View members in the People tab","Vedi i membri nella scheda Persone")+' &rarr;</a></div>';
  if(noteHtml){
    h+='<h3 class="sec">'+TT("Family history","Storia della famiglia")+'</h3><div class="fnote">'+noteHtml+'</div>';
  }
  h+='<h3 class="sec">'+TT("Members","Membri")+'</h3><div style="max-width:100%;overflow-x:auto"><table class="tl" id="famMemberTable"><thead><tr>'+
    '<th data-sortkey="cognome" style="cursor:pointer">'+TT("Surname","Cognome")+'<span class="sortarrow"></span></th>'+
    '<th data-sortkey="nome" style="cursor:pointer">'+TT("Given name","Nome")+'<span class="sortarrow"></span></th>'+
    '<th data-sortkey="byear" style="cursor:pointer">'+TT("Birth year","Anno di nascita")+'<span class="sortarrow"></span></th>'+
    '<th data-sortkey="bplace" style="cursor:pointer">'+TT("Birthplace","Luogo di nascita")+'<span class="sortarrow"></span></th>'+
    '<th data-sortkey="dyear" style="cursor:pointer">'+TT("Death year","Anno di morte")+'<span class="sortarrow"></span></th>'+
    '<th data-sortkey="dplace" style="cursor:pointer">'+TT("Deathplace","Luogo di morte")+'<span class="sortarrow"></span></th>'+
    '</tr></thead><tbody></tbody></table></div>';
  el.innerHTML=h;
  document.getElementById("overlay").style.display="block";
  el.style.display="block"; el.scrollTop=0;
  function renderMemberRows(){
    const sorted = famModalSortedRows(rows);
    document.querySelector("#famMemberTable tbody").innerHTML = sorted.map(r=>
      '<tr class="famrow" onclick="closePerson();openPerson(\''+r.key.replace(/'/g,"\\'")+'\')"><td>'+esc(r.cognome)+'</td><td>'+esc(r.nome)+'</td><td>'+(r.byear===null?"":r.byear)+'</td><td>'+esc(r.bplace)+'</td><td>'+(r.dyear===null?"":r.dyear)+'</td><td>'+esc(r.dplace)+'</td></tr>'
    ).join("");
    document.querySelectorAll("#famMemberTable th[data-sortkey]").forEach(th=>{
      th.querySelector(".sortarrow").textContent = famModalArrow(th.dataset.sortkey);
    });
  }
  document.querySelectorAll("#famMemberTable th[data-sortkey]").forEach(th=>{
    th.addEventListener("click", ()=>{
      const k=th.dataset.sortkey;
      if(famModalSortState.key===k) famModalSortState.dir = famModalSortState.dir==="asc"?"desc":"asc";
      else famModalSortState = {key:k, dir:(k==="byear"||k==="dyear")?"desc":"asc"};
      renderMemberRows();
    });
  });
  renderMemberRows();
};

// ---------------- Timeline tab
let tlChart=null, TL_TYPE_PLACE_WIDGETS={}, tlBucketSize=10;
function buildTimelineFilterPanel(){
  const tpc = document.getElementById("tlTypePlaceCtl");
  tpc.innerHTML = "";
  Object.entries(TYPES).forEach(([tk,tv])=>{
    tpc.insertAdjacentHTML("beforeend",
      '<div style="margin-top:8px;display:flex;align-items:center;gap:8px"><label class="fchk" style="display:inline-flex;align-items:center;gap:5px;white-space:nowrap;flex:0 0 auto"><input type="checkbox" class="tlTypeChk" data-type="'+tk+'"><span class="tdot" style="background:'+(CHART_COLORS[tk]||tv.c)+'"></span>'+tv.en+'</label><div class="msel" id="tlPlaceMsel_'+tk+'" style="flex:1 1 auto;min-width:0"></div></div>');
  });
  TL_TYPE_PLACE_WIDGETS = {};
  Object.keys(TYPES).forEach(tk=>{
    TL_TYPE_PLACE_WIDGETS[tk] = createMultiSelect(document.getElementById("tlPlaceMsel_"+tk), PLACES_BY_TYPE[tk], {
      placeholder: TT("Search place...","Cerca luogo..."),
      allowClearAll: true,
      onChange: refreshTimeline,
    });
  });
  tpc.querySelectorAll(".tlTypeChk").forEach(i=>{
    const mselDiv = document.getElementById("tlPlaceMsel_"+i.dataset.type);
    if(mselDiv) mselDiv.style.visibility = i.checked ? "visible" : "hidden";
    i.onchange=()=>{
      if(!i.checked && TL_TYPE_PLACE_WIDGETS[i.dataset.type]) TL_TYPE_PLACE_WIDGETS[i.dataset.type].clear();
      if(mselDiv) mselDiv.style.visibility = i.checked ? "visible" : "hidden";
      refreshTimeline();
    };
  });
}
function tlTypeOn(){
  const typeOn = {};
  document.querySelectorAll(".tlTypeChk").forEach(i=>{ typeOn[i.dataset.type] = i.checked; });
  return typeOn;
}
function tlLabel(d){
  return tlBucketSize===1 ? String(d) : (d+"\u2013"+(d+tlBucketSize-1));
}
function computeBucketData(){
  const buckets={};
  const typeOn = tlTypeOn();
  NAMES.forEach(k=>DATA[k].events.forEach(e=>{
    if(!e.y||e.y<1840||e.y>2029) return;
    if(!typeOn[e.t]) return;
    const placeSel = TL_TYPE_PLACE_WIDGETS[e.t] ? TL_TYPE_PLACE_WIDGETS[e.t].selected : [];
    if(placeSel.length>0 && !placeSel.includes(e.pl)) return;
    const d=Math.floor(e.y/tlBucketSize)*tlBucketSize;
    buckets[d]=buckets[d]||{};
    buckets[d][e.t]=(buckets[d][e.t]||0)+1;
  }));
  return buckets;
}
const TL_MONTH_NAMES = LANG==="en"
  ? ["January","February","March","April","May","June","July","August","September","October","November","December"]
  : ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
function renderOnThisDay(){
  const today = new Date();
  const mm = String(today.getMonth()+1).padStart(2,"0");
  const dd = String(today.getDate()).padStart(2,"0");
  const matches=[];
  NAMES.forEach(k=>DATA[k].events.forEach(e=>{
    const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(e.d||"");
    if(!m) return;
    if(m[2]===mm && m[3]===dd) matches.push({k:k,e:e,year:+m[1]});
  }));
  matches.sort((a,b)=>a.year-b.year);
  const heading="<div class='count'>"+TT(matches.length+" event(s) recorded on "+(+dd)+" "+TL_MONTH_NAMES[(+mm)-1]+", across the years", matches.length+" evento/i registrato/i il "+(+dd)+" "+TL_MONTH_NAMES[(+mm)-1]+", nel corso degli anni")+"</div>";
  document.getElementById("tlevents").innerHTML = heading + (matches.length ? matches.slice(0,250).map(o=>{
    const t=TYPES[o.e.t]||{c:"#999",en:o.e.t};
    const col=CHART_COLORS[o.e.t]||t.c;
    return '<div class="ev" style="border-left-color:'+col+'"><b>'+o.year+'</b> &mdash; '+typeLabel(t)+' &mdash; '+plink(o.k)+(o.e.e?': '+renderText(o.e.e):"")+(o.e.pl?' <i>('+esc(o.e.pl)+')</i>':"")+'</div>';
  }).join("") : "<p style='font-size:13px;color:#776955'>"+TT("No precisely dated event is recorded on this day.","Nessun evento datato con precisione risulta registrato in questo giorno.")+"</p>");
}
function initTimeline(){
  if(tlChart) return;
  buildTimelineFilterPanel();
  document.getElementById("tlBucketSel").onchange=function(){ tlBucketSize=+this.value; refreshTimeline(); };
  const tset=Object.keys(TYPES);
  const buckets=computeBucketData();
  const labels=Object.keys(buckets).map(Number).sort((a,b)=>a-b);
  tlChart=new Chart(document.getElementById("tlchart"),{
    type:"bar",
    data:{labels:labels.map(tlLabel),
      datasets:tset.map(t=>({label:typeLabel(TYPES[t]), backgroundColor:CHART_COLORS[t]||TYPES[t].c,
        data:labels.map(d=>(buckets[d]&&buckets[d][t])||0)}))},
    options:{responsive:true, scales:{x:{stacked:true},y:{stacked:true}},
      plugins:{legend:{labels:{font:{family:"Georgia"}}}}}
  });
  renderOnThisDay();
}
window.refreshTimeline=function(){
  if(!tlChart) return;
  const tset=Object.keys(TYPES);
  const buckets=computeBucketData();
  const labels=Object.keys(buckets).map(Number).sort((a,b)=>a-b);
  tlChart.data.labels=labels.map(tlLabel);
  tlChart.data.datasets.forEach((ds,i)=>{ const t=tset[i]; ds.data=labels.map(d=>(buckets[d]&&buckets[d][t])||0); });
  tlChart.update();
};

// ---------------- Stats tab
let statsDone=false;
let occChart=null, bornChart=null, censChart=null, typeChart=null;
const CENSUS_YEARS=["1901","1911","1926"];
const YEAR_COLORS={"1901":"#3d6ea5","1911":"#7b4b94","1926":"#c9a227"};
function getSexFilter(){
  const el=document.getElementById("statsSexSel");
  return el?el.value:"all";
}
function statsNames(){
  const sf=getSexFilter();
  return sf==="all"?NAMES:NAMES.filter(k=>DATA[k].sex===sf);
}
function censusPeople(year, names){
  return (names||statsNames()).filter(k=>DATA[k].census && DATA[k].census[year]);
}
function ageBucket(ageStr){
  const n=parseInt(ageStr,10);
  if(isNaN(n)||n<0) return null;
  if(n>=70) return "70+";
  const lo=Math.floor(n/10)*10;
  return lo+"-"+(lo+9);
}
function censusMetricData(metric){
  const names=statsNames();
  if(metric==="persone"){
    return {labels:CENSUS_YEARS, datasets:[{label:TT("People","Persone"),
      data:CENSUS_YEARS.map(y=>censusPeople(y,names).length),
      backgroundColor:CENSUS_YEARS.map(y=>YEAR_COLORS[y])}]};
  }
  if(metric==="sesso"){
    return {labels:CENSUS_YEARS, datasets:[
      {label:"M", backgroundColor:"#3d6ea5", data:CENSUS_YEARS.map(y=>censusPeople(y,names).filter(k=>DATA[k].sex==="M").length)},
      {label:"F", backgroundColor:"#c9a227", data:CENSUS_YEARS.map(y=>censusPeople(y,names).filter(k=>DATA[k].sex==="F").length)}
    ]};
  }
  if(metric==="contea"){
    const totals={};
    CENSUS_YEARS.forEach(y=>censusPeople(y,names).forEach(k=>{
      const c=DATA[k].census[y].County; if(!c) return;
      totals[c]=(totals[c]||0)+1;
    }));
    const top=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0]);
    return {labels:top, datasets:CENSUS_YEARS.map(y=>({
      label:y, backgroundColor:YEAR_COLORS[y],
      data:top.map(c=>censusPeople(y,names).filter(k=>DATA[k].census[y].County===c).length)
    }))};
  }
  if(metric==="lavoro"){
    const totals={};
    CENSUS_YEARS.forEach(y=>censusPeople(y,names).forEach(k=>{
      const o=DATA[k].census[y].Occupation; if(!o) return;
      const ol=o.toLowerCase();
      totals[ol]=(totals[ol]||0)+1;
    }));
    const top=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0]);
    return {labels:top, datasets:CENSUS_YEARS.map(y=>({
      label:y, backgroundColor:YEAR_COLORS[y],
      data:top.map(o=>censusPeople(y,names).filter(k=>(DATA[k].census[y].Occupation||"").toLowerCase()===o).length)
    }))};
  }
  if(metric==="eta"){
    const buckets=["0-9","10-19","20-29","30-39","40-49","50-59","60-69","70+"];
    return {labels:buckets, datasets:CENSUS_YEARS.map(y=>({
      label:y, backgroundColor:YEAR_COLORS[y],
      data:buckets.map(b=>censusPeople(y,names).filter(k=>ageBucket(DATA[k].census[y].Age)===b).length)
    }))};
  }
  return {labels:[], datasets:[]};
}
function renderCensusSummary(){
  const year=document.getElementById("censYearSel").value;
  const box=document.getElementById("censusSummary");
  if(year==="all"){ box.innerHTML=""; return; }
  const names=statsNames();
  const people=censusPeople(year,names);
  const mCount=people.filter(k=>DATA[k].sex==="M").length;
  const fCount=people.filter(k=>DATA[k].sex==="F").length;
  const occCounts={};
  people.forEach(k=>{ const o=DATA[k].census[year].Occupation; if(o) occCounts[o.toLowerCase()]=(occCounts[o.toLowerCase()]||0)+1; });
  const topOcc=Object.entries(occCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const countyCounts={};
  people.forEach(k=>{ const c=DATA[k].census[year].County; if(c) countyCounts[c]=(countyCounts[c]||0)+1; });
  const topCounty=Object.entries(countyCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  box.innerHTML=
    "<div class='count'>"+TT(people.length+" people recorded in the "+year+" census ("+mCount+" M, "+fCount+" F)", people.length+" persone registrate nel censimento "+year+" ("+mCount+" M, "+fCount+" F)")+"</div>"+
    (topOcc.length?"<div style='font-size:13px;margin-top:4px'><b>"+TT("Most common occupations:","Occupazioni piu comuni:")+"</b> "+topOcc.map(([o,n])=>esc(o)+" ("+n+")").join(", ")+"</div>":"")+
    (topCounty.length?"<div style='font-size:13px;margin-top:4px'><b>"+TT("Most common counties:","Contee piu comuni:")+"</b> "+topCounty.map(([c,n])=>esc(c)+" ("+n+")").join(", ")+"</div>":"");
}
function renderCensusChart(){
  const metric=document.getElementById("censMetricSel").value;
  const d=censusMetricData(metric);
  const indexAxis = (metric==="contea"||metric==="lavoro") ? "y" : "x";
  if(censChart) censChart.destroy();
  censChart=new Chart(document.getElementById("censchart"),{type:"bar",
    data:{labels:d.labels, datasets:d.datasets},
    options:{indexAxis:indexAxis, plugins:{legend:{display:d.datasets.length>1, labels:{font:{family:"Georgia"}}}},
      scales:{x:{ticks:{font:{family:"Georgia"}}}, y:{ticks:{font:{family:"Georgia"}}}}}});
}
function initStats(){
  if(statsDone) return; statsDone=true;
  document.getElementById("statsSexSel").onchange=refreshStats;
  document.getElementById("censYearSel").onchange=renderCensusSummary;
  document.getElementById("censMetricSel").onchange=renderCensusChart;
  refreshStats();
}
function refreshStats(){
  const font={family:"Georgia"};
  const names=statsNames();
  // occupazioni: persone distinte per professione
  const occ={};
  names.forEach(k=>{
    const seen=new Set();
    DATA[k].events.forEach(e=>{ if(e.pr) seen.add(e.pr.toLowerCase()); });
    seen.forEach(o=>occ[o]=(occ[o]||0)+1);
  });
  const topOcc=Object.entries(occ).sort((a,b)=>b[1]-a[1]).slice(0,15);
  if(occChart) occChart.destroy();
  occChart=new Chart(document.getElementById("occchart"),{type:"bar",
    data:{labels:topOcc.map(x=>x[0]),datasets:[{label:"people",data:topOcc.map(x=>x[1]),backgroundColor:"#7a5c33"}]},
    options:{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{ticks:{font:font}},y:{ticks:{font:font}}}}});
  // nascite
  const born={};
  names.forEach(k=>{ const b=DATA[k].born; if(b) born[b]=(born[b]||0)+1; });
  const topBorn=Object.entries(born).sort((a,b)=>b[1]-a[1]).slice(0,15);
  if(bornChart) bornChart.destroy();
  bornChart=new Chart(document.getElementById("bornchart"),{type:"bar",
    data:{labels:topBorn.map(x=>x[0]),datasets:[{label:"people",data:topBorn.map(x=>x[1]),backgroundColor:"#3d6ea5"}]},
    options:{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{ticks:{font:font}},y:{ticks:{font:font}}}}});
  // censimenti: summary card + comparison chart
  renderCensusSummary();
  renderCensusChart();
  // tipi evento
  const tc={};
  names.forEach(k=>DATA[k].events.forEach(e=>tc[e.t]=(tc[e.t]||0)+1));
  const tkeys=Object.keys(tc);
  if(typeChart) typeChart.destroy();
  typeChart=new Chart(document.getElementById("typechart"),{type:"doughnut",
    data:{labels:tkeys.map(t=>TYPES[t]?typeLabel(TYPES[t]):t),datasets:[{data:tkeys.map(t=>tc[t]),
      backgroundColor:tkeys.map(t=>CHART_COLORS[t]||(TYPES[t]?TYPES[t].c:"#999"))}]},
    options:{plugins:{legend:{position:"right",labels:{font:font}}}}});
  // Arandora Star
  const ar=[];
  names.forEach(k=>{
    if(DATA[k].events.some(e=>e.t==="morte"&&/arandora/i.test(e.pl)&&!/muore/i.test(e.e))) ar.push(k);
  });
  document.getElementById("arandora").innerHTML=ar.length?
    "<p style='font-size:13.5px'>"+ar.length+" people in the database died in the sinking of the <i>Arandora Star</i>:</p>"+
    ar.map(k=>'<div class="ev" style="border-left-color:#4a4a4a">'+plink(k)+'</div>').join(""):
    "<p>No victims recorded.</p>";
}

const CENSUS_YEARS_G = ["1891","1901","1911"];
const CENSUS_GEO = {"counties":["Antrim","Armagh","Carlow","Cavan","Clare","Cork","Donegal","Down","Dublin","Fermanagh","Galway","Kerry","Kildare","Kilkenny","Laois","Leitrim","Limerick","Londonderry","Longford","Louth","Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo","Tipperary","Tyrone","Waterford","Westmeath","Wexford","Wicklow"],"cities":{"Dublin City":{"label":"Dublino (città)","county":"Dublin","fx":0.55,"fy":0.35},"Cork City":{"label":"Cork (città)","county":"Cork","fx":0.62,"fy":0.62},"Belfast City":{"label":"Belfast (città)","county":"Antrim","fx":0.95,"fy":0.9},"Waterford City":{"label":"Waterford (città)","county":"Waterford","fx":0.45,"fy":0.75},"Limerick City":{"label":"Limerick (città)","county":"Limerick","fx":0.35,"fy":0.08},"Kilkenny City":{"label":"Kilkenny (città)","county":"Kilkenny","fx":0.35,"fy":0.4},"Derry City":{"label":"Derry/Londonderry (città)","county":"Londonderry","fx":0.25,"fy":0.15},"Galway Town":{"label":"Galway (città)","county":"Galway","fx":0.12,"fy":0.35},"Drogheda Town":{"label":"Drogheda (città)","county":"Louth","fx":0.55,"fy":0.92}},"data":{"1891":{"counties":{"Antrim":42,"Armagh":2,"Carlow":1,"Cavan":1,"Clare":1,"Cork":24,"Donegal":1,"Down":5,"Dublin":31,"Fermanagh":0,"Galway":3,"Kerry":7,"Kildare":6,"Kilkenny":1,"Laois":6,"Leitrim":0,"Limerick":1,"Londonderry":3,"Longford":1,"Louth":4,"Mayo":4,"Meath":1,"Monaghan":5,"Offaly":3,"Roscommon":0,"Sligo":0,"Tipperary":4,"Tyrone":1,"Waterford":0,"Westmeath":1,"Wexford":1,"Wicklow":3},"cities":{"Dublin City":79,"Cork City":13,"Belfast City":0,"Waterford City":3,"Limerick City":3,"Kilkenny City":1,"Derry City":0,"Galway Town":1,"Drogheda Town":0},"notRecorded":["Belfast City","Derry City"],"total":263},"1901":{"counties":{"Antrim":2,"Armagh":1,"Carlow":0,"Cavan":1,"Clare":1,"Cork":29,"Donegal":1,"Down":3,"Dublin":31,"Fermanagh":0,"Galway":1,"Kerry":0,"Kildare":4,"Kilkenny":2,"Laois":0,"Leitrim":0,"Limerick":0,"Londonderry":1,"Longford":2,"Louth":4,"Mayo":0,"Meath":4,"Monaghan":0,"Offaly":2,"Roscommon":1,"Sligo":0,"Tipperary":2,"Tyrone":0,"Waterford":1,"Westmeath":1,"Wexford":4,"Wicklow":7},"cities":{"Dublin City":99,"Cork City":18,"Belfast City":70,"Waterford City":3,"Limerick City":0,"Kilkenny City":1,"Derry City":0,"Galway Town":1,"Drogheda Town":0},"notRecorded":["Limerick City","Derry City","Drogheda Town"],"total":297},"1911":{"counties":{"Antrim":8,"Armagh":5,"Carlow":0,"Cavan":0,"Clare":0,"Cork":9,"Donegal":2,"Down":21,"Dublin":41,"Fermanagh":2,"Galway":0,"Kerry":3,"Kildare":3,"Kilkenny":1,"Laois":2,"Leitrim":0,"Limerick":0,"Londonderry":6,"Longford":1,"Louth":2,"Mayo":0,"Meath":4,"Monaghan":0,"Offaly":0,"Roscommon":4,"Sligo":1,"Tipperary":4,"Tyrone":10,"Waterford":0,"Westmeath":0,"Wexford":4,"Wicklow":3},"cities":{"Dublin City":105,"Cork City":8,"Belfast City":149,"Waterford City":3,"Limerick City":4,"Kilkenny City":3,"Derry City":9,"Galway Town":0,"Drogheda Town":0},"notRecorded":["Drogheda Town"],"total":417}}};
const AGE_BRACKETS = ["<10","10-20","20-40","40-60","60-80",">80"];
// Age x sex breakdown per county/city for 1891, 1901 and 1911, transcribed by Luca from
// the original census tables (same underlying source as CENSUS_GEO above). Every
// county/city's bracket total matches the corresponding CENSUS_GEO number exactly
// (cross-checked programmatically against CENSUS_GEO.data before this was embedded).
const CENSUS_AGESEX = {"1891":{"Antrim":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":6},"20-40":{"M":12,"F":8},"40-60":{"M":7,"F":3},"60-80":{"M":3,"F":0},">80":{"M":1,"F":1}},"Armagh":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Carlow":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":1},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Cavan":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Cork City":{"<10":{"M":1,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":4,"F":1},"40-60":{"M":6,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Dublin City":{"<10":{"M":2,"F":0},"10-20":{"M":6,"F":0},"20-40":{"M":31,"F":4},"40-60":{"M":24,"F":6},"60-80":{"M":5,"F":1},">80":{"M":0,"F":0}},"Kilkenny City":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Limerick City":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Waterford City":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":3,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Clare":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Cork":{"<10":{"M":1,"F":0},"10-20":{"M":2,"F":0},"20-40":{"M":10,"F":2},"40-60":{"M":5,"F":1},"60-80":{"M":1,"F":2},">80":{"M":0,"F":0}},"Donegal":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":1},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Down":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":2,"F":1},"40-60":{"M":0,"F":1},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Dublin":{"<10":{"M":0,"F":1},"10-20":{"M":0,"F":3},"20-40":{"M":8,"F":5},"40-60":{"M":8,"F":0},"60-80":{"M":1,"F":5},">80":{"M":0,"F":0}},"Fermanagh":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Galway":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":1,"F":2},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Kerry":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":2,"F":3},"60-80":{"M":0,"F":1},">80":{"M":0,"F":0}},"Kildare":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":2,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":3,"F":0},">80":{"M":0,"F":0}},"Kilkenny":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Offaly":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":1},"20-40":{"M":0,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Leitrim":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Limerick":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Londonderry":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":2},"20-40":{"M":0,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Longford":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Louth":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":1},"20-40":{"M":0,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":2,"F":0},">80":{"M":0,"F":0}},"Mayo":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":1},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":1},">80":{"M":1,"F":0}},"Meath":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Monaghan":{"<10":{"M":1,"F":1},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":1,"F":1},">80":{"M":0,"F":0}},"Laois":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":4},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":1}},"Roscommon":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Sligo":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Tipperary":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":1},"40-60":{"M":2,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Galway Town":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Tyrone":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":1},">80":{"M":0,"F":0}},"Waterford":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Westmeath":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Wexford":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Wicklow":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":1},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Drogheda Town":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}}},"1901":{"Antrim":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":1},"20-40":{"M":0,"F":1},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Armagh":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Carlow":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Cavan":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Belfast City":{"<10":{"M":5,"F":1},"10-20":{"M":3,"F":2},"20-40":{"M":34,"F":12},"40-60":{"M":5,"F":3},"60-80":{"M":4,"F":1},">80":{"M":0,"F":0}},"Cork City":{"<10":{"M":2,"F":2},"10-20":{"M":1,"F":1},"20-40":{"M":7,"F":1},"40-60":{"M":3,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Dublin City":{"<10":{"M":1,"F":1},"10-20":{"M":14,"F":1},"20-40":{"M":35,"F":7},"40-60":{"M":29,"F":4},"60-80":{"M":6,"F":0},">80":{"M":1,"F":0}},"Waterford City":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":1},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Clare":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Cork":{"<10":{"M":0,"F":1},"10-20":{"M":4,"F":0},"20-40":{"M":9,"F":3},"40-60":{"M":5,"F":5},"60-80":{"M":1,"F":0},">80":{"M":0,"F":1}},"Donegal":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Down":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Dublin":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":3},"20-40":{"M":8,"F":2},"40-60":{"M":8,"F":4},"60-80":{"M":3,"F":2},">80":{"M":0,"F":0}},"Fermanagh":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Galway":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Galway Town":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":1,"F":0}},"Kerry":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Kildare":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":2,"F":0},"40-60":{"M":1,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Kilkenny":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":2},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Kilkenny City":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Offaly":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":2},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Leitrim":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Londonderry":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":1},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Longford":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Louth":{"<10":{"M":0,"F":0},"10-20":{"M":2,"F":0},"20-40":{"M":0,"F":1},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Mayo":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Meath":{"<10":{"M":1,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":2,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Monaghan":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Laois":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Roscommon":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":1},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Sligo":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Tipperary":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Tyrone":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Waterford":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Westmeath":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":1},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Wexford":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":0},"20-40":{"M":2,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Wicklow":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":0},"20-40":{"M":0,"F":2},"40-60":{"M":1,"F":2},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}}},"1911":{"Antrim":{"<10":{"M":0,"F":0},"10-20":{"M":3,"F":0},"20-40":{"M":2,"F":2},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Armagh":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":2,"F":1},"40-60":{"M":1,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Carlow":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Limerick":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Limerick City":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":4,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Cork":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":0},"20-40":{"M":1,"F":2},"40-60":{"M":1,"F":1},"60-80":{"M":3,"F":0},">80":{"M":0,"F":0}},"Cork City":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":2,"F":0},"40-60":{"M":3,"F":2},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Clare":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Dublin City":{"<10":{"M":2,"F":2},"10-20":{"M":8,"F":6},"20-40":{"M":35,"F":11},"40-60":{"M":20,"F":6},"60-80":{"M":12,"F":3},">80":{"M":0,"F":0}},"Belfast City":{"<10":{"M":3,"F":2},"10-20":{"M":11,"F":2},"20-40":{"M":56,"F":33},"40-60":{"M":28,"F":7},"60-80":{"M":4,"F":3},">80":{"M":0,"F":0}},"Cavan":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Londonderry":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":4,"F":1},"40-60":{"M":0,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Derry City":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":0},"20-40":{"M":4,"F":2},"40-60":{"M":2,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Kerry":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":2,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Kildare":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":0},"20-40":{"M":0,"F":1},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Kilkenny":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":1},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Kilkenny City":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":1},"40-60":{"M":1,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Offaly":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Fermanagh":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":2,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Galway":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Galway Town":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Dublin":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":3},"20-40":{"M":9,"F":5},"40-60":{"M":10,"F":5},"60-80":{"M":2,"F":6},">80":{"M":0,"F":0}},"Leitrim":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Down":{"<10":{"M":0,"F":0},"10-20":{"M":1,"F":1},"20-40":{"M":12,"F":5},"40-60":{"M":1,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Donegal":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":1},">80":{"M":0,"F":0}},"Longford":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Louth":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":2},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Mayo":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Meath":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":2,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Monaghan":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Laois":{"<10":{"M":1,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":1,"F":0},">80":{"M":0,"F":0}},"Roscommon":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":2},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Sligo":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Tipperary":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":0,"F":1},"60-80":{"M":2,"F":0},">80":{"M":0,"F":0}},"Tyrone":{"<10":{"M":1,"F":0},"10-20":{"M":1,"F":0},"20-40":{"M":6,"F":1},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Waterford":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Westmeath":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":0,"F":0},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}},"Wexford":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":1},"20-40":{"M":1,"F":1},"40-60":{"M":0,"F":0},"60-80":{"M":0,"F":1},">80":{"M":0,"F":0}},"Wicklow":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":1,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":1},">80":{"M":0,"F":0}},"Waterford City":{"<10":{"M":0,"F":0},"10-20":{"M":0,"F":0},"20-40":{"M":2,"F":0},"40-60":{"M":1,"F":0},"60-80":{"M":0,"F":0},">80":{"M":0,"F":0}}}};

// Post-partition data: Irish Free State only (26 counties), 1926/1936/1946, transcribed
// from the General Report volumes (Table 1A/1B/1C, "Birthplace = Italy"). Published only
// at this coarse regional level - NOT county by county as in 1891-1911 - so every
// county/city inside the same region is shaded identically on the map: see
// REGION_MEMBERS below. The six Northern Ireland counties are outside the Free State
// census entirely (Northern Ireland ran its own, separate census under UK
// administration) and are shown hatched/grey rather than left uncovered.
const CENSUS_YEARS_POST = ["1926","1936","1946"];
const CENSUS_POST = {"1926":{"dublinBoro":{"M":99,"F":58},"restLeinster":{"M":21,"F":7},"corkLimerickWaterfordBoro":{"M":12,"F":10},"restMunster":{"M":10,"F":3},"connacht":{"M":6,"F":5},"ulsterPart":{"M":4,"F":3}},"1936":{"dublinBoro":{"M":115,"F":88},"restLeinster":{"M":21,"F":17},"corkLimerickWaterfordBoro":{"M":13,"F":8},"restMunster":{"M":17,"F":9},"connacht":{"M":11,"F":8},"ulsterPart":{"M":13,"F":5}},"1946":{"dublinBoro":{"M":102,"F":79},"restLeinster":{"M":34,"F":21},"corkLimerickWaterfordBoro":{"M":9,"F":9},"restMunster":{"M":12,"F":6},"connacht":{"M":10,"F":6},"ulsterPart":{"M":7,"F":3}}};
const REGION_KEYS = ["dublinBoro","restLeinster","corkLimerickWaterfordBoro","restMunster","connacht","ulsterPart"];
const REGION_LABELS_EN = {
  dublinBoro: "Dublin (Co. Borough + D\u00fan Laoghaire Borough)",
  restLeinster: "Rest of Leinster",
  corkLimerickWaterfordBoro: "Cork, Limerick and Waterford (County Boroughs)",
  restMunster: "Rest of Munster",
  connacht: "Connacht",
  ulsterPart: "Ulster, Free State counties (Cavan, Donegal, Monaghan)"
};
const REGION_LABELS_IT = {
  dublinBoro: "Dublino (Co. Borough + D\u00fan Laoghaire Borough)",
  restLeinster: "Resto del Leinster",
  corkLimerickWaterfordBoro: "Cork, Limerick e Waterford (County Boroughs)",
  restMunster: "Resto del Munster",
  connacht: "Connacht",
  ulsterPart: "Ulster, contee del Free State (Cavan, Donegal, Monaghan)"
};
const REGION_LABELS = LANG==="en" ? REGION_LABELS_EN : REGION_LABELS_IT;
const REGION_MEMBERS = {
  dublinBoro: {counties:[], cities:["Dublin City"]},
  restLeinster: {counties:["Carlow","Dublin","Kildare","Kilkenny","Laois","Longford","Louth","Meath","Offaly","Westmeath","Wexford","Wicklow"], cities:["Kilkenny City","Drogheda Town"]},
  corkLimerickWaterfordBoro: {counties:[], cities:["Cork City","Limerick City","Waterford City"]},
  restMunster: {counties:["Clare","Cork","Kerry","Limerick","Tipperary","Waterford"], cities:[]},
  connacht: {counties:["Galway","Leitrim","Mayo","Roscommon","Sligo"], cities:["Galway Town"]},
  ulsterPart: {counties:["Cavan","Donegal","Monaghan"], cities:[]}
};
const KEY_TO_REGION = {};
REGION_KEYS.forEach(r=>{
  REGION_MEMBERS[r].counties.forEach(c=>{ KEY_TO_REGION[c]=r; });
  REGION_MEMBERS[r].cities.forEach(c=>{ KEY_TO_REGION[c]=r; });
});
// Single shared green, identical to CENSUS_PALETTE_DEFAULT used by the 1891-1911 maps
// (per Luca's request: one color for the whole Free State row, not six).
const REGION_COLORS = {
  dublinBoro: {c1:[221,237,214], c2:[9,64,29]},
  restLeinster: {c1:[221,237,214], c2:[9,64,29]},
  corkLimerickWaterfordBoro: {c1:[221,237,214], c2:[9,64,29]},
  restMunster: {c1:[221,237,214], c2:[9,64,29]},
  connacht: {c1:[221,237,214], c2:[9,64,29]},
  ulsterPart: {c1:[221,237,214], c2:[9,64,29]}
};
// Outside the Irish Free State: the six Northern Ireland counties/cities, left white on
// the 1926-1946 maps since the Saorstat Eireann census simply does not cover them (a
// thin outline keeps their coastline/border visible even though unfilled).
const NI_OUTSIDE_FILL = "#c2c2c2";
const NI_OUTSIDE_STROKE = "#c7bda4";
// Of the nine cities/towns tracked for 1891-1911, the 1926-1946 General Reports name
// only Dublin (with Dun Laoghaire) and the combined Cork/Limerick/Waterford County
// Boroughs as separate entities; Kilkenny City, Galway Town and Drogheda Town are not
// broken out and are simply folded into their county's/region's total. So only these
// four get a dot on the 1926-1946 maps - the rest show up only via their region's
// county-level fill, with no dot at all.
const CENSUS_POST_CITIES = ["Dublin City","Cork City","Limerick City","Waterford City"];

let censusSexFilter = "both";   // "both" | "M" | "F"
let censusAgeFilter = new Set(AGE_BRACKETS);
let censusFocusPost = null;
let censusFocusRawPost = null;
let censusGeoMode = "county";
let censusFocus = null;
let censusFocusRaw = null;
let censusInited = false;
let censusMarkersBuilt = false;
let censusProvinceLabelsBuilt = false;

const CENSUS_COUNTY_TO_CITY = {};
Object.keys(CENSUS_GEO.cities).forEach(ck=>{
  CENSUS_COUNTY_TO_CITY[CENSUS_GEO.cities[ck].county] = ck;
});

// Traditional four provinces of Ireland (verified against Wikipedia's "Provinces of
// Ireland" article) and their constituent traditional counties, matching exactly the
// 32 counties already present in CENSUS_GEO.counties.
const PROVINCES = ["Leinster","Munster","Connacht","Ulster"];
const PROVINCE_COUNTIES = {
  "Leinster": ["Carlow","Dublin","Kildare","Kilkenny","Laois","Longford","Louth","Meath","Offaly","Westmeath","Wexford","Wicklow"],
  "Munster": ["Clare","Cork","Kerry","Limerick","Tipperary","Waterford"],
  "Connacht": ["Galway","Leitrim","Mayo","Roscommon","Sligo"],
  "Ulster": ["Antrim","Armagh","Cavan","Donegal","Down","Fermanagh","Londonderry","Monaghan","Tyrone"]
};
const COUNTY_TO_PROVINCE = {};
PROVINCES.forEach(p=>{ PROVINCE_COUNTIES[p].forEach(c=>{ COUNTY_TO_PROVINCE[c] = p; }); });

// One base hue per province. Munster is yellow/gold per Luca's request (rather than
// the blue of its historic three-crowns flag, which stays as the small flag icon in
// the legend); the others are drawn from their own flag colors: Leinster = green
// (gold harp on green), Connacht = slate blue-grey (per-pale silver/blue shield with a
// black eagle), Ulster = red (red cross and Red Hand). Each entry is a light->dark
// pair used by censusColor() the same way the original single green scale worked, so
// shading within a province still tracks a county's own magnitude, while hue
// distinguishes the four provinces from each other.
const PROVINCE_COLORS = {
  "Leinster": {c1:[212,236,217], c2:[11,74,35]},
  "Munster": {c1:[252,241,196], c2:[143,102,0]},
  "Connacht": {c1:[214,220,225], c2:[35,48,58]},
  "Ulster": {c1:[240,210,203], c2:[122,20,15]}
};
const CENSUS_PALETTE_DEFAULT = {c1:[221,237,214], c2:[9,64,29]};

// Small, schematic redrawings (not exact heraldic reproductions) of each province's
// traditional flag, used purely as a visual key next to the province color legend.
const PROVINCE_FLAG_SVG = {
  "Leinster": '<svg width="30" height="20" viewBox="0 0 30 20" style="vertical-align:middle;border:1px solid rgba(0,0,0,0.35);border-radius:2px">'+
    '<rect width="30" height="20" fill="#1a7a3c"/>'+
    '<path d="M11 4.5 C8.5 5 7.3 9 8.5 12.5 C9.5 15 12.5 16 15.5 15.7" fill="none" stroke="#e6c200" stroke-width="1.3"/>'+
    '<path d="M15.5 4 L15.5 16" fill="none" stroke="#e6c200" stroke-width="1.3"/>'+
    '<path d="M11 6 L15.5 6M10.4 8.3 L15.5 8.3M10.3 10.6 L15.5 10.6M11 12.8 L15.5 12.8" stroke="#e6c200" stroke-width="0.7"/>'+
    '</svg>',
  "Munster": '<svg width="30" height="20" viewBox="0 0 30 20" style="vertical-align:middle;border:1px solid rgba(0,0,0,0.35);border-radius:2px">'+
    '<rect width="30" height="20" fill="#0b1d5c"/>'+
    '<g fill="#e6c200">'+
    '<path d="M5.5 13.5 L6.4 8.6 L7.6 11.2 L8.7 7.6 L9.8 11.2 L11 8.6 L11.9 13.5 Z"/>'+
    '<path d="M12.6 12.2 L13.5 7.3 L14.7 9.9 L15.8 6.3 L16.9 9.9 L18.1 7.3 L19 12.2 Z"/>'+
    '<path d="M19.7 13.5 L20.6 8.6 L21.8 11.2 L22.9 7.6 L24 11.2 L25.2 8.6 L26.1 13.5 Z"/>'+
    '</g></svg>',
  "Connacht": '<svg width="30" height="20" viewBox="0 0 30 20" style="vertical-align:middle;border:1px solid rgba(0,0,0,0.35);border-radius:2px">'+
    '<rect width="15" height="20" fill="#e9e9ea"/>'+
    '<rect x="15" width="15" height="20" fill="#12275c"/>'+
    '<path d="M8 5.5 C6 6 4.5 8 4.3 10.3 C5.6 9.4 6.6 9.3 7.2 9.7 C6 10.7 5.7 12.2 6.3 13.7 C7.3 12.3 8.2 11.6 8.9 11.7 C8.6 13 9 14.2 10 14.9 C10.1 13.4 10.5 12.2 11.2 11.6 C12.2 12 13 11.7 13.4 10.9 C12.1 10.8 11.2 10.2 10.9 9.2 C11.9 9 12.5 8.3 12.5 7.3 C11.4 7.9 10.4 7.9 9.7 7.2 C9.9 6.1 9.4 5.3 8 5.5 Z" fill="#151515"/>'+
    '<line x1="20.5" y1="15" x2="24.3" y2="5.5" stroke="#e9e9ea" stroke-width="1.5"/>'+
    '<path d="M23 6.6 L25.6 4.4 M24.3 5.5 L26.3 6.7" stroke="#e9e9ea" stroke-width="1.3"/>'+
    '</svg>',
  "Ulster": '<svg width="30" height="20" viewBox="0 0 30 20" style="vertical-align:middle;border:1px solid rgba(0,0,0,0.35);border-radius:2px">'+
    '<rect width="30" height="20" fill="#e6c200"/>'+
    '<path d="M13 0 H17 V8 H30 V12 H17 V20 H13 V12 H0 V8 H13 Z" fill="#c8281e"/>'+
    '<rect x="10.5" y="5.5" width="9" height="9" fill="#fff" stroke="#c8281e" stroke-width="0.6"/>'+
    '<path d="M15 8 c-1.1 -1 -2.8 -0.1 -2.5 1.4 c0.3 1 1.3 1.7 2.5 2.9 c1.2 -1.2 2.2 -1.9 2.5 -2.9 c0.3 -1.5 -1.4 -2.4 -2.5 -1.4z" fill="#c8281e"/>'+
    '</svg>'
};

// Fixed spots in the blank "sea" margin around the island (in the *visible* 0..400 x
// 0..500 y viewBox space) used for the per-province total/percentage labels, one per
// province, positioned toward that province's real-world compass direction: Ulster to
// the north, Leinster to the east, Munster to the south, Connacht to the west. Derived
// from the actual traced county path geometry so they land in genuinely blank space
// rather than overlapping any county.
const PROVINCE_LABEL_POS = {
  "Ulster": {x:266, y:15, anchor:"middle"},
  "Leinster": {x:349, y:288, anchor:"start"},
  "Munster": {x:154, y:492, anchor:"middle"},
  "Connacht": {x:47, y:216, anchor:"end"}
};

function censusIsPost(year){ return CENSUS_YEARS_POST.indexOf(year)>=0; }
// Filtered raw count for one county/city in a pre-partition year (1891/1901/1911),
// summing only the checked age brackets and the selected sex.
function censusAgeSexRawFiltered(year, key, sexFilter, ageFilterSet){
  const table = CENSUS_AGESEX[year] && CENSUS_AGESEX[year][key];
  if(!table) return 0;
  const brackets = (ageFilterSet && ageFilterSet.size) ? ageFilterSet : new Set(AGE_BRACKETS);
  let sum = 0;
  AGE_BRACKETS.forEach(b=>{
    if(!brackets.has(b)) return;
    const cell = table[b]; if(!cell) return;
    sum += sexFilter==="both" ? (cell.M+cell.F) : (cell[sexFilter]||0);
  });
  return sum;
}
function censusAgeSexRaw(year, key){
  return censusAgeSexRawFiltered(year, key, censusSexFilter, censusAgeFilter);
}
// Filtered raw count for one of the six 1926/1936/1946 regions (sex only - the Free
// State reports do not break the Italy figure down by age).
function censusPostRegionRawFiltered(year, regionKey, sexFilter){
  const d = CENSUS_POST[year]; const cell = d && d[regionKey];
  if(!cell) return 0;
  return sexFilter==="both" ? (cell.M+cell.F) : (cell[sexFilter]||0);
}
function censusPostRegionRaw(year, regionKey){
  return censusPostRegionRawFiltered(year, regionKey, censusSexFilter);
}
function censusPostTotal(year){
  let sum = 0;
  REGION_KEYS.forEach(r=>{ sum += censusPostRegionRaw(year, r); });
  return sum;
}
// raw, filter-aware, national total for any year (pre- or post-partition) - the
// denominator used for every percentage in this section.
function censusNationalTotal(year){
  if(censusIsPost(year)) return censusPostTotal(year);
  let sum = 0;
  CENSUS_GEO.counties.forEach(c=>{ sum += censusAgeSexRaw(year,c); });
  Object.keys(CENSUS_GEO.cities).forEach(ck=>{ sum += censusAgeSexRaw(year,ck); });
  return sum;
}
function censusRaw(year, kind, key){
  if(censusIsPost(year)){
    if(kind==="region") return censusPostRegionRaw(year, key);
    const region = KEY_TO_REGION[key];
    return region ? censusPostRegionRaw(year, region) : null; // null: outside the Free State (Northern Ireland)
  }
  if(kind==="province") return censusProvinceRaw(year, key);
  return censusAgeSexRaw(year, key);
}
function censusProvinceRaw(year, provKey){
  let sum = 0;
  (PROVINCE_COUNTIES[provKey]||[]).forEach(c=>{ sum += censusAgeSexRaw(year,c); });
  Object.keys(CENSUS_GEO.cities).forEach(ck=>{
    if(COUNTY_TO_PROVINCE[CENSUS_GEO.cities[ck].county]===provKey) sum += censusAgeSexRaw(year,ck);
  });
  return sum;
}
function censusCityRecorded(year, cityKey){
  const d = CENSUS_GEO.data[year];
  if(!d) return true;
  return !(d.notRecorded && d.notRecorded.indexOf(cityKey)>=0);
}
function censusValue(year, kind, key){
  const raw = censusRaw(year, kind, key);
  if(raw===null) return null;
  const total = censusNationalTotal(year);
  return total ? raw/total*100 : 0;
}
function censusGlobalMax(){
  let mx = 0;
  CENSUS_YEARS_G.forEach(y=>{
    CENSUS_GEO.counties.forEach(c=>{ const v=censusValue(y,"county",c); if(v!==null) mx = Math.max(mx, v); });
    Object.keys(CENSUS_GEO.cities).forEach(c=>{ const v=censusValue(y,"city",c); if(v!==null) mx = Math.max(mx, v); });
  });
  return mx || 1;
}
function censusGlobalMaxPost(){
  let mx = 0;
  CENSUS_YEARS_POST.forEach(y=>{
    REGION_KEYS.forEach(r=>{ mx = Math.max(mx, censusValue(y,"region",r)); });
  });
  return mx || 1;
}
function censusColor(v, mx, palette){
  if(v<=0) return "#ffffff";
  const p = palette || CENSUS_PALETTE_DEFAULT;
  const t = Math.min(1, Math.sqrt(v/mx));
  const rgb = p.c1.map((c0,i)=>Math.round(c0+(p.c2[i]-c0)*t));
  return "rgb("+rgb.join(",")+")";
}
// Fixed-width percentage bands used for the main choropleth colouring/legends (as
// opposed to censusColor's continuous sqrt scale, still used by the "local scale"
// zoomed-in view - see censusApplyLocalScale/Post): every county/region is bucketed
// into a band STEP points wide (5 for 1891-1911, 10 for 1926-1946), so a given shade
// always means the same range of values everywhere, rather than a scale that silently
// stretches or compresses depending on the current maximum. The top band is open-ended
// ("over N%") and sized so it actually contains the real observed maximum.
function censusBinEdges(step, mx){
  const nBins = Math.max(1, Math.floor(mx/step) + 1); // colored (non-white) bands
  const edges = [];
  for(let i=1;i<nBins;i++) edges.push(i*step);
  return edges; // e.g. step=5 -> [5,10,15,20,25,30]; open top band is "over 30%"
}
// Fixed, hard-coded bands for 1891-1911 (not derived from the observed maximum, unlike
// the 1926-1946 bands below): 0, 0-5, 5-10, 10-15, 15-20, 20-25, 25-30, over 30%.
function censusBinEdges5(){
  return [5,10,15,20,25,30];
}
let _censusBinEdgesPost = null;
function censusBinEdgesPost(){
  if(!_censusBinEdgesPost) _censusBinEdgesPost = censusBinEdges(10, censusGlobalMaxPost());
  return _censusBinEdgesPost;
}
function censusBinIndex(v, edges){
  for(let i=0;i<edges.length;i++){ if(v<=edges[i]) return i; }
  return edges.length;
}
function censusColorBinned(v, edges, palette){
  if(v===null || v===undefined || v<=0) return "#ffffff";
  const p = palette || CENSUS_PALETTE_DEFAULT;
  const nBins = edges.length+1;
  const t = (censusBinIndex(v, edges)+1)/nBins;
  const rgb = p.c1.map((c0,i)=>Math.round(c0+(p.c2[i]-c0)*t));
  return "rgb("+rgb.join(",")+")";
}
// Discrete legend matching censusColorBinned exactly: one swatch per band (plus a
// leading white swatch for 0%), each labelled with its own range.
function censusBinnedLegendHtml(edges, palette, height){
  height = height || 30;
  const p = palette || CENSUS_PALETTE_DEFAULT;
  const nBins = edges.length+1;
  function cell(bg, label){
    return '<div style="flex:1;min-width:0;text-align:center">'+
      '<div style="height:'+height+'px;background:'+bg+';border:1px solid var(--line);border-radius:3px"></div>'+
      '<div style="font-size:9.5px;color:#776955;margin-top:2px;white-space:nowrap">'+label+'</div></div>';
  }
  let html = cell("#ffffff", "0%");
  for(let i=0;i<nBins;i++){
    const t = (i+1)/nBins;
    const rgb = p.c1.map((c0,j)=>Math.round(c0+(p.c2[j]-c0)*t));
    const lo = i===0 ? 0 : edges[i-1];
    const hi = edges[i];
    const label = hi!==undefined ? (lo+'&ndash;'+hi+'%') : (TT("over ","oltre ")+lo+'%');
    html += cell("rgb("+rgb.join(",")+")", label);
  }
  return '<div style="display:flex;gap:3px;max-width:520px;margin:0 auto">'+html+'</div>';
}
// An earlier compact "strip" variant (a solid gradient bar with boundary ticks
// underneath) was replaced below by reusing censusBinnedLegendHtml directly for the
// per-province chips too: the boundary ticks did not align cleanly with the blocks
// they were meant to label, which visually read as "white = 0-5%" instead of "white =
// 0%, first colour = 0-5%" - the same one-swatch-one-label style used by the main
// per-county legend removes that ambiguity.
// Resolves whatever the user actually clicked (a county path or a city marker, always
// identified by its true, stable id) to the entity a CLICK should focus in the current
// view mode: itself in "per contea" mode, or its parent province in "per provincia"
// mode. (Hovering, unlike clicking, always shows the literal hovered entity's own
// value - see the mouseover handler in initCensuses - since in province mode the map
// now shades each county by its own count, not by the province total.)
function censusResolveEntity(kind, key){
  if(censusGeoMode!=="province") return {kind, key};
  const county = kind==="county" ? key : CENSUS_GEO.cities[key].county;
  return {kind:"province", key: COUNTY_TO_PROVINCE[county]};
}
// The 32 counties (and the city markers, appended as siblings of the same group) live
// inside a <g transform="translate(0,-500)">, so their own getBBox() is expressed in a
// coordinate space offset by exactly 500 units on the Y axis from the space the root
// <svg viewBox="0 0 400 500"> actually shows. Correcting for that fixed, known offset is
// what makes the zoom viewBox line up with what's actually drawn.
function censusViewportBBox(el){
  const b = el.getBBox();
  return {x: b.x, y: b.y - 500, width: b.width, height: b.height};
}
function censusUnionBBox(elements){
  let x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;
  elements.forEach(el=>{
    const b = censusViewportBBox(el);
    x1=Math.min(x1,b.x); y1=Math.min(y1,b.y);
    x2=Math.max(x2,b.x+b.width); y2=Math.max(y2,b.y+b.height);
  });
  return {x:x1, y:y1, width:x2-x1, height:y2-y1};
}
function censusBuildMarkers(){
  if(censusMarkersBuilt) return; censusMarkersBuilt=true;
  CENSUS_YEARS_G.concat(CENSUS_YEARS_POST).forEach(year=>{
    const prefix = "y"+year+"_";
    const isPost = censusIsPost(year);
    const cityKeys = isPost ? CENSUS_POST_CITIES : Object.keys(CENSUS_GEO.cities);
    cityKeys.forEach(key=>{
      const meta = CENSUS_GEO.cities[key];
      const countyEl = document.getElementById(prefix+meta.county);
      if(!countyEl) return;
      const b = countyEl.getBBox();
      const cx = b.x + meta.fx*b.width, cy = b.y + meta.fy*b.height;
      const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
      circle.setAttribute("cx", cx); circle.setAttribute("cy", cy); circle.setAttribute("r", 6);
      circle.setAttribute("stroke", "#4a3a22"); circle.setAttribute("stroke-width","0.8");
      circle.dataset.key = key; circle.dataset.kind = "city";
      circle.style.cursor = "pointer";
      countyEl.parentNode.appendChild(circle);
    });
  });
}
// Builds the four per-province "total (percentage)" text labels, once, positioned in
// the blank sea margin around the island (see PROVINCE_LABEL_POS). They live in the
// untransformed "layer6" group that already exists as an empty sibling of the county
// layer in each embedded map, so no coordinate offset correction is needed here.
function censusBuildProvinceLabels(){
  if(censusProvinceLabelsBuilt) return; censusProvinceLabelsBuilt = true;
  CENSUS_YEARS_G.forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    const svg = wrap.querySelector("svg");
    const layer6 = document.getElementById("y"+year+"_layer6") || svg;
    PROVINCES.forEach(p=>{
      const pos = PROVINCE_LABEL_POS[p];
      const t = document.createElementNS("http://www.w3.org/2000/svg","text");
      t.setAttribute("x", pos.x); t.setAttribute("y", pos.y);
      t.setAttribute("text-anchor", pos.anchor);
      t.setAttribute("font-size", "9.5");
      t.setAttribute("font-weight", "600");
      t.setAttribute("fill", "#3a3226");
      t.dataset.province = p;
      t.style.display = "none";
      t.style.pointerEvents = "none";
      layer6.appendChild(t);
    });
  });
}
function censusUpdateProvinceLabels(){
  CENSUS_YEARS_G.forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    const d = CENSUS_GEO.data[year];
    PROVINCES.forEach(p=>{
      const t = wrap.querySelector('text[data-province="'+p+'"]');
      if(!t) return;
      const raw = censusProvinceRaw(year, p);
      const pct = d.total ? (raw/d.total*100) : 0;
      t.textContent = Math.round(raw)+" ("+pct.toFixed(1)+"%)";
      t.style.display = "";
    });
  });
}
function censusHideProvinceLabels(){
  CENSUS_YEARS_G.forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    wrap.querySelectorAll('text[data-province]').forEach(t=>{ t.style.display = "none"; });
  });
}
// Nudges city markers apart from each other, but ONLY the ones that would actually
// overlap - checked against the largest radius a marker can ever reach (see the "4 +
// 6*sqrt(v/mx)" formula in censusRecolor/censusRecolorProvince), so the adjustment is
// stable across every mode/year combination rather than jittering the dots around
// every time the data or the abs/pct toggle changes. Markers that are already clear of
// each other are left exactly where their county fx/fy placed them.
function censusResolveCityOverlaps(){
  const MAX_R = 10, BUFFER = 2;
  const minDist = MAX_R*2 + BUFFER;
  const keys = Object.keys(CENSUS_GEO.cities);
  const wrap0 = document.querySelector('.censusMapSvgWrap[data-year="1891"]');
  const pts = {};
  keys.forEach(k=>{
    const c = wrap0.querySelector('circle[data-key="'+k+'"]');
    if(c) pts[k] = {x: parseFloat(c.getAttribute("cx")), y: parseFloat(c.getAttribute("cy"))};
  });
  for(let pass=0; pass<8; pass++){
    let moved = false;
    for(let i=0;i<keys.length;i++){
      for(let j=i+1;j<keys.length;j++){
        const a = pts[keys[i]], b = pts[keys[j]];
        if(!a || !b) continue;
        const dx = b.x-a.x, dy = b.y-a.y;
        let dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < minDist){
          moved = true;
          if(dist < 0.01) dist = 0.01;
          const push = (minDist - dist)/2;
          const ux = dx/dist, uy = dy/dist;
          a.x -= ux*push; a.y -= uy*push;
          b.x += ux*push; b.y += uy*push;
        }
      }
    }
    if(!moved) break;
  }
  CENSUS_YEARS_G.concat(CENSUS_YEARS_POST).forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    keys.forEach(k=>{
      const c = wrap.querySelector('circle[data-key="'+k+'"]');
      if(c && pts[k]){ c.setAttribute("cx", pts[k].x.toFixed(2)); c.setAttribute("cy", pts[k].y.toFixed(2)); }
    });
  });
}
function censusRecolor(){
  if(censusGeoMode==="province"){ censusRecolorProvince(); return; }
  censusHideProvinceLabels();
  const mx = censusGlobalMax();
  const edges = censusBinEdges5();
  CENSUS_YEARS_G.forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    const prefix = "y"+year+"_";
    CENSUS_GEO.counties.forEach(c=>{
      const el = document.getElementById(prefix+c);
      if(!el) return;
      if(el.dataset.origStroke===undefined) el.dataset.origStroke = el.style.stroke||"";
      const v = censusValue(year,"county",c);
      el.style.fill = censusColorBinned(v, edges);
      el.dataset.key = c; el.dataset.kind = "county";
    });
    Object.keys(CENSUS_GEO.cities).forEach(key=>{
      const circle = wrap.querySelector('circle[data-key="'+key+'"]');
      if(!circle) return;
      if(circle.dataset.origStroke===undefined) circle.dataset.origStroke = circle.getAttribute("stroke")||"";
      const v = censusValue(year,"city",key);
      circle.setAttribute("fill", censusColorBinned(v, edges));
      const rr = 4 + 6*Math.sqrt((v||0)/mx);
      circle.setAttribute("r", rr.toFixed(1));
    });
  });
  censusRenderLegend(edges);
  if(censusFocus) censusApplyLocalScale();
  censusRenderDeltaBadges();
}
// Province-mode recoloring: every county path (and its city markers) takes the hue of
// the PROVINCE it belongs to, but the shade is still driven by that COUNTY's (or
// city's) own value - on the exact same global scale used in county mode, so a
// county's darkness means the same thing in either view. This is what makes "ci siano
// le contee del colore rispettivo in proporzione a quanti italiani ci sono" true: each
// county still shows its own number, just tinted per province. The per-province
// total/percentage labels in the sea margin (see censusUpdateProvinceLabels) are what
// convey the province-wide aggregate.
function censusRecolorProvince(){
  const mx = censusGlobalMax();
  const edges = censusBinEdges5();
  CENSUS_YEARS_G.forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    const prefix = "y"+year+"_";
    CENSUS_GEO.counties.forEach(c=>{
      const el = document.getElementById(prefix+c);
      if(!el) return;
      if(el.dataset.origStroke===undefined) el.dataset.origStroke = el.style.stroke||"";
      el.dataset.key = c; el.dataset.kind = "county";
      const prov = COUNTY_TO_PROVINCE[c];
      const v = censusValue(year, "county", c);
      el.style.fill = censusColorBinned(v, edges, PROVINCE_COLORS[prov]);
    });
    Object.keys(CENSUS_GEO.cities).forEach(key=>{
      const circle = wrap.querySelector('circle[data-key="'+key+'"]');
      if(!circle) return;
      if(circle.dataset.origStroke===undefined) circle.dataset.origStroke = circle.getAttribute("stroke")||"";
      const meta = CENSUS_GEO.cities[key];
      const prov = COUNTY_TO_PROVINCE[meta.county];
      const v = censusValue(year, "city", key);
      circle.setAttribute("fill", censusColorBinned(v, edges, PROVINCE_COLORS[prov]));
      const rr = 4 + 6*Math.sqrt((v||0)/mx);
      circle.setAttribute("r", rr.toFixed(1));
    });
  });
  censusBuildProvinceLabels();
  censusUpdateProvinceLabels();
  censusRenderLegendProvince(edges);
  if(censusFocus) censusApplyLocalScale();
  censusRenderDeltaBadges();
}
// Colors the second row of maps (1926/1936/1946): every county/city belonging to one of
// the six REGION_MEMBERS groups takes that region's own hue and its shared, region-wide
// value (see REGION_MEMBERS/CENSUS_POST above - the source has no finer breakdown). The
// six Northern Ireland counties/cities, which are not covered by this census at all, are
// painted a neutral grey and tagged data-kind="outside" so they are not clickable and
// get a distinct tooltip instead of a number.
// County paths belonging to the same region get IDENTICAL fill (same shared value) and
// no stroke between them, so same-region counties visually fuse into one solid blob;
// only Northern Ireland counties keep a thin outline (so the coastline stays visible
// even though unfilled). Since restLeinster/restMunster/connacht/ulsterPart are each a
// single, spatially-contiguous block of counties, this reads as a plain four-province
// map (plus a blank Ulster remainder) without needing separate province-only geometry.
function censusRecolorPost(){
  const mx = censusGlobalMaxPost();
  const edges = censusBinEdgesPost();
  CENSUS_YEARS_POST.forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    const prefix = "y"+year+"_";
    CENSUS_GEO.counties.forEach(c=>{
      const el = document.getElementById(prefix+c);
      if(!el) return;
      if(el.dataset.origStroke===undefined) el.dataset.origStroke = el.style.stroke||"";
      const region = KEY_TO_REGION[c];
      el.dataset.key = c;
      if(!region){
        el.style.fill = NI_OUTSIDE_FILL;
        el.style.stroke = NI_OUTSIDE_STROKE;
        el.style.strokeWidth = "1px";
        el.dataset.kind = "outside";
        return;
      }
      const v = censusValue(year,"region",region);
      el.style.fill = censusColorBinned(v, edges, REGION_COLORS[region]);
      el.style.stroke = "none";
      el.dataset.kind = "county";
    });
    CENSUS_POST_CITIES.forEach(key=>{
      const circle = wrap.querySelector('circle[data-key="'+key+'"]');
      if(!circle) return;
      if(circle.dataset.origStroke===undefined) circle.dataset.origStroke = circle.getAttribute("stroke")||"";
      const region = KEY_TO_REGION[key];
      const v = censusValue(year,"region",region);
      circle.setAttribute("fill", censusColorBinned(v, edges, REGION_COLORS[region]));
      const rr = 4 + 6*Math.sqrt((v||0)/mx);
      circle.setAttribute("r", rr.toFixed(1));
      circle.dataset.kind = "city";
    });
  });
  censusRenderLegendPost(edges);
  if(censusFocusPost) censusApplyLocalScalePost();
  censusRenderDeltaBadgesPost();
}
function censusApplyLocalScalePost(){
  if(!censusFocusPost) return;
  const region = censusFocusPost.key;
  const palette = REGION_COLORS[region];
  const members = REGION_MEMBERS[region];
  let localMax = 0.0001;
  CENSUS_YEARS_POST.forEach(y=>{ localMax = Math.max(localMax, censusValue(y,"region",region)); });
  CENSUS_YEARS_POST.forEach(year=>{
    const prefix = "y"+year+"_";
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    const col = censusColor(censusValue(year,"region",region), localMax, palette);
    members.counties.forEach(c=>{
      const el = document.getElementById(prefix+c);
      if(el) el.style.fill = col;
    });
    members.cities.forEach(ck=>{
      const circle = wrap.querySelector('circle[data-key="'+ck+'"]');
      if(circle) circle.setAttribute("fill", col);
    });
  });
}
function censusRenderDeltaBadgesPost(){
  CENSUS_YEARS_POST.forEach((year, idx)=>{
    const elBadge = document.getElementById("censusDelta_"+year);
    if(!elBadge) return;
    if(idx===0){ elBadge.innerHTML = ""; return; }
    const prevYear = CENSUS_YEARS_POST[idx-1];
    let oldV, newV;
    if(censusFocusPost){
      oldV = censusRaw(prevYear, "region", censusFocusPost.key);
      newV = censusRaw(year, "region", censusFocusPost.key);
    } else {
      oldV = censusPostTotal(prevYear);
      newV = censusPostTotal(year);
    }
    elBadge.innerHTML = TT("since ","dal ")+prevYear+": "+censusDeltaHtml(oldV,newV);
  });
}
// Finds the element that was actually clicked/hovered for one specific year's map -
// either a <use> instantiating a shared county shape, or a dynamically-built <circle>
// city marker - given the entity's stable kind/key (as stored in its data-kind/data-key
// attributes).
function censusInMapLabelTarget(year, kind, key){
  if(kind==="city"){
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    return wrap ? wrap.querySelector('circle[data-key="'+key+'"]') : null;
  }
  return document.getElementById("y"+year+"_"+key);
}
// Places (or updates) a small text label, in-map, centered on the entity that was
// actually clicked (a county or a city), on every map of the given row of years - each
// showing that same entity's own value for its own year. Lives in each map's "layer6"
// overlay group (the same untransformed, non-interactive layer used for the per-province
// sea-margin totals - see censusBuildProvinceLabels), so it sits on top of the county
// fills and never intercepts clicks. isPost selects whether the value shown is the
// entity's own figure (pre-partition county/city) or its region's shared aggregate
// (1926-1946, since those reports only publish per-macro-area, not per-county).
function censusPlaceInMapLabels(years, kind, key, isPost){
  years.forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    if(!wrap) return;
    const target = censusInMapLabelTarget(year, kind, key);
    if(!target) return;
    let cx, cy;
    if(kind==="city"){
      cx = parseFloat(target.getAttribute("cx"));
      cy = parseFloat(target.getAttribute("cy")) - 500;
    } else {
      const b = censusViewportBBox(target);
      cx = b.x + b.width/2; cy = b.y + b.height/2;
    }
    const svg = wrap.querySelector("svg");
    const layer6 = document.getElementById("y"+year+"_layer6") || svg;
    let title, sub;
    if(isPost){
      const region = KEY_TO_REGION[key];
      title = censusLabel(kind, key);
      if(!region){ sub = TT("outside the Free State census","fuori dal censimento del Free State"); }
      else {
        const raw = censusRaw(year, "region", region);
        const pct = censusValue(year, "region", region);
        sub = Math.round(raw)+" ("+pct.toFixed(1)+"%)";
      }
    } else {
      const raw = censusRaw(year, kind, key);
      const pct = censusValue(year, kind, key);
      title = censusLabel(kind, key);
      sub = Math.round(raw)+" ("+pct.toFixed(1)+"%)";
    }
    let g = layer6.querySelector(".censusClickLabel");
    if(!g){
      g = document.createElementNS("http://www.w3.org/2000/svg","g");
      g.setAttribute("class","censusClickLabel");
      g.style.pointerEvents = "none";
      layer6.appendChild(g);
    }
    const line1 = esc(title), line2 = esc(sub);
    const textW = Math.max(line1.length, line2.length)*5.6 + 14;
    g.innerHTML =
      '<rect x="'+(cx-textW/2).toFixed(1)+'" y="'+(cy-16).toFixed(1)+'" width="'+textW.toFixed(1)+'" height="30" rx="3" '+
        'fill="rgba(251,247,238,.96)" stroke="#7a1f2a" stroke-width="1.1"></rect>'+
      '<text x="'+cx.toFixed(1)+'" y="'+(cy-3.5).toFixed(1)+'" font-size="9.5" font-weight="700" text-anchor="middle" fill="#241b12">'+line1+'</text>'+
      '<text x="'+cx.toFixed(1)+'" y="'+(cy+9.5).toFixed(1)+'" font-size="9.5" text-anchor="middle" fill="#5c4d38">'+line2+'</text>';
  });
}
function censusClearInMapLabels(years){
  years.forEach(year=>{
    const layer6 = document.getElementById("y"+year+"_layer6");
    const g = layer6 && layer6.querySelector(".censusClickLabel");
    if(g) g.remove();
  });
}
function censusResetViewPost(){
  censusFocusPost = null;
  censusFocusRawPost = null;
  censusApplyZoom(null, CENSUS_YEARS_POST);
  censusClearSelection(CENSUS_YEARS_POST);
  censusClearInMapLabels(CENSUS_YEARS_POST);
  censusRecolorPost();
  censusRenderNationalDetailPost();
}
function censusFocusOnPost(kind, key){
  const region = KEY_TO_REGION[key];
  if(!region){
    // clicked a Northern Ireland county/city: no data, but still worth a label
    // explaining why, right where the user clicked.
    censusPlaceInMapLabels(CENSUS_YEARS_POST, kind, key, true);
    return;
  }
  if(censusFocusPost && censusFocusPost.key===region){
    censusResetViewPost();
    return;
  }
  censusFocusPost = {kind:"region", key: region};
  censusFocusRawPost = {kind, key};
  const prefix0 = "y1926_";
  const wrap0 = document.querySelector('.censusMapSvgWrap[data-year="1926"]');
  const members = REGION_MEMBERS[region];
  const els = members.counties.map(c=>document.getElementById(prefix0+c))
    .concat(members.cities.map(ck=>wrap0.querySelector('circle[data-key="'+ck+'"]')))
    .filter(Boolean);
  const bbox = censusUnionBBox(els);
  const cx = bbox.x + bbox.width/2, cy = bbox.y + bbox.height/2;
  const half = Math.max(bbox.width, bbox.height) * 0.5 * 1.5 + 10;
  censusApplyZoom({x: cx-half, y: cy-half, width: half*2, height: half*2}, CENSUS_YEARS_POST);
  censusClearSelection(CENSUS_YEARS_POST);
  CENSUS_YEARS_POST.forEach(year=>{
    const prefix = "y"+year+"_";
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    members.counties.forEach(c=>{
      const t = document.getElementById(prefix+c);
      if(t){ t.style.stroke = "#a05a2c"; t.style.strokeWidth = "2.2px"; }
    });
    members.cities.forEach(ck=>{
      const t = wrap.querySelector('circle[data-key="'+ck+'"]');
      if(t){ t.style.stroke = "#a05a2c"; t.style.strokeWidth = "2.2px"; }
    });
  });
  censusApplyLocalScalePost();
  censusRenderLegendPost(censusBinEdgesPost());
  censusRenderDeltaBadgesPost();
  censusRenderDetailPost(region);
  censusPlaceInMapLabels(CENSUS_YEARS_POST, kind, key, true);
}
// Shared method for turning a max value `mx` and a light->dark palette into a legend
// gradient bar with percentage tick labels: used, unchanged, by every choropleth legend
// on the page (per-contea, per-provincia chips, and the unified 1926-1946 legend) so a
// given shade always means the same percentage everywhere it appears. `stops` strips are
// drawn (each colored at its own boundary value, via censusColor - the exact function
// that colors the maps themselves), with a tick label under every boundary.
function censusLegendGradientHtml(mx, palette, height, stops){
  stops = stops || 6;
  let bar = "";
  for(let i=0;i<=stops;i++){
    const v = mx*(i/stops);
    bar += '<div style="flex:1;height:'+height+'px;background:'+censusColor(v,mx,palette)+'"></div>';
  }
  let ticks = "";
  for(let i=0;i<=stops;i++){
    const v = mx*(i/stops);
    ticks += '<span>'+v.toFixed(1)+'%</span>';
  }
  return '<div style="display:flex;border:1px solid var(--line);border-radius:4px;overflow:hidden">'+bar+'</div>'+
    '<div style="display:flex;justify-content:space-between;font-size:10px;color:#776955;margin-top:2px;gap:2px">'+ticks+'</div>';
}
// 1926-1946 legend: a single shared gradient (the six macro-areas all use the same
// palette - see REGION_COLORS - so six identical chips said nothing six separate times).
function censusRenderLegendPost(edges){
  const el = document.getElementById("censusLegendPost");
  if(!el) return;
  let html = '<div>'+censusBinnedLegendHtml(edges, REGION_COLORS.dublinBoro)+'</div>';
  if(censusFocusPost){
    html += '<div style="font-size:11px;color:#776955;margin-top:4px">'+TT("The selected area uses its own colour scale (light&rarr;dark only between 1926, 1936 and 1946).","L&rsquo;area selezionata usa una propria scala di colore (chiaro&rarr;scuro solo tra 1926, 1936 e 1946).")+'</div>';
  }
  el.innerHTML = html;
}
function censusRenderLegend(edges){
  const el = document.getElementById("censusLegend");
  let html = '<div>'+censusBinnedLegendHtml(edges, null)+'</div>';
  if(censusFocus){
    html += '<div style="font-size:11px;color:#776955;margin-top:4px;max-width:420px">'+TT("The selected section uses its own colour scale (light&rarr;dark only between its three censuses), to better show how it changed over time.","La sezione selezionata usa una propria scala di colore (chiaro&rarr;scuro solo tra i suoi tre censimenti), per mostrare meglio come è cambiata nel tempo.")+'</div>';
  }
  el.innerHTML = html;
}
// Analogous legend for province mode: one color-key chip per province (with its
// schematic flag), each showing its own light->dark gradient. It shares the exact same
// numeric scale as county mode (censusGlobalMax()) since a county's shade means the
// same magnitude in both views, and the exact same censusLegendGradientHtml method as
// every other legend on the page - just with fewer tick labels (3 instead of 7) since
// each chip is much narrower than the full-width bars.
function censusRenderLegendProvince(edges){
  const el = document.getElementById("censusLegend");
  const chips = PROVINCES.map(p=>{
    return '<div style="min-width:280px;max-width:320px">'+
      '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:3px">'+PROVINCE_FLAG_SVG[p]+'<b style="font-size:12px">'+esc(p)+'</b></div>'+
      censusBinnedLegendHtml(edges, PROVINCE_COLORS[p], 14)+'</div>';
  }).join("");
  let html = '<div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;margin-bottom:2px">'+chips+'</div>'+
    '<div style="font-size:11px;color:#776955">'+TT("Each county is coloured in proportion to its own share of Italians in the national total (the same percentage scale used in the county view, see the legend above); the numbers on the map (in the sea, near each province) show the total and the share of that year&rsquo;s national total for the whole province.","Ogni contea &egrave; colorata in proporzione alla propria percentuale di italiani sul totale nazionale (stessa scala percentuale usata nella vista per contea, vedi la legenda sopra); i numeri sulla mappa (nel mare, vicino a ciascuna provincia) mostrano il totale e la percentuale sul totale nazionale di quell&rsquo;anno per l&rsquo;intera provincia.")+'</div>';
  if(censusFocus && censusFocus.kind==="province"){
    html += '<div style="font-size:11px;color:#776955;margin-top:4px">'+TT("The counties of the selected province use a colour scale local to the province (light&rarr;dark only between its three censuses).","Le contee della provincia selezionata usano una scala di colore locale alla provincia (chiaro&rarr;scuro solo tra i suoi tre censimenti).")+'</div>';
  }
  el.innerHTML = html;
}
// Recolors just the focused entity (a county, a city, or - in province mode - every
// county and city belonging to the focused province) across all three maps, using a
// scale local to its own yearly values (rather than the global one used everywhere
// else), so the shift from light to dark reflects only its own change over time. For a
// focused province, the local scale is shared by all its member counties/cities (the
// peak individual value any of them ever reaches across the three censuses), so each
// still shows its own magnitude, just rescaled to make contrast visible within the
// smaller range of that one province.
function censusApplyLocalScale(){
  if(!censusFocus) return;
  const {kind, key} = censusFocus;
  if(kind==="province"){
    const palette = PROVINCE_COLORS[key];
    const memberCounties = PROVINCE_COUNTIES[key]||[];
    const memberCities = Object.keys(CENSUS_GEO.cities).filter(ck=>COUNTY_TO_PROVINCE[CENSUS_GEO.cities[ck].county]===key);
    let localMax = 0.0001;
    CENSUS_YEARS_G.forEach(y=>{
      memberCounties.forEach(c=>{ localMax = Math.max(localMax, censusValue(y,"county",c)); });
      memberCities.forEach(ck=>{ localMax = Math.max(localMax, censusValue(y,"city",ck)); });
    });
    CENSUS_YEARS_G.forEach(year=>{
      const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
      const prefix = "y"+year+"_";
      memberCounties.forEach(c=>{
        const el = document.getElementById(prefix+c);
        if(el) el.style.fill = censusColor(censusValue(year,"county",c), localMax, palette);
      });
      memberCities.forEach(ck=>{
        const circle = wrap.querySelector('circle[data-key="'+ck+'"]');
        if(circle) circle.setAttribute("fill", censusColor(censusValue(year,"city",ck), localMax, palette));
      });
    });
    return;
  }
  const series = CENSUS_YEARS_G.map(y=>censusValue(y, kind, key));
  const localMax = Math.max(...series, 0.0001);
  CENSUS_YEARS_G.forEach((year, idx)=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    const prefix = "y"+year+"_";
    const target = kind==="county" ? document.getElementById(prefix+key) : wrap.querySelector('circle[data-key="'+key+'"]');
    if(!target) return;
    const col = censusColor(series[idx], localMax);
    if(kind==="county") target.style.fill = col; else target.setAttribute("fill", col);
  });
}
function censusApplyZoom(bboxOrNull, years){
  (years||CENSUS_YEARS_G).forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    const svg = wrap.querySelector("svg");
    if(!bboxOrNull){ svg.setAttribute("viewBox","0 0 400 500"); return; }
    svg.setAttribute("viewBox", bboxOrNull.x+" "+bboxOrNull.y+" "+bboxOrNull.width+" "+bboxOrNull.height);
  });
}
function censusClearSelection(years){
  (years||CENSUS_YEARS_G).forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    wrap.querySelectorAll("path[data-kind], circle[data-kind]").forEach(el=>{
      el.style.stroke = el.dataset.origStroke || "";
      el.style.strokeWidth = "";
    });
  });
}
// Rendered below the maps whenever nothing is selected, in either view mode: the
// national totals over the three censuses, so the detail area is never just an empty
// placeholder.
// Small dependency-free inline-SVG line chart ("sparkline") showing one or more
// series across the three censuses, used next to every detail table so the trend is
// visible at a glance alongside the numbers. Takes an array of {label, values, color}
// (values.length === CENSUS_YEARS_G.length); draws a shared y-scale across all series.
function censusSparklineMulti(seriesList, years){
  years = years || CENSUS_YEARS_G;
  // Wide, responsive aspect ratio: the outer <svg> has no fixed pixel width/height,
  // only a viewBox, and is styled width:100%;height:auto - so it fills whatever
  // container it's placed in (the full page width in the national/detail views) while
  // keeping a sane, non-squashed height, with a real Y axis (gridlines + numeric
  // labels) and the exact value printed above every point.
  const w = 900, h = 230;
  const padL = 50, padR = 24, padTop = 36, padBottom = 30;
  const plotW = w - padL - padR;
  const plotH = h - padTop - padBottom;
  const allVals = seriesList.reduce((acc,s)=>acc.concat(s.values), []);
  let dataMax = Math.max(...allVals, 0.0001);
  let dataMin = Math.min(...allVals, 0);
  if(dataMin > 0) dataMin = 0;
  if(dataMax <= dataMin) dataMax = dataMin + 1;
  const rawRange = dataMax - dataMin;
  const n = years.length;
  const inset = 22; // keeps the first/last points clear of the Y axis and right edge
  const effW = Math.max(plotW - inset*2, 1);
  const stepX = n>1 ? effW/(n-1) : 0;
  const xFor = i => padL + inset + i*stepX;

  // "Nice" Y-axis tick step (about 4 divisions of the raw data range), then the axis
  // top/bottom are snapped OUTWARD to the next tick multiple - and, critically, if the
  // snapped top ever lands exactly on the highest data value (rather than past it),
  // it is pushed one more tick further out. This guarantees the drawn axis is always
  // strictly longer/taller than every value in the chart, so no point or its value
  // label can ever be plotted above the topmost gridline.
  const tickCount = 4;
  const rawStep = rawRange/tickCount;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep||1)));
  const norm = (rawStep/mag) || 1;
  const niceNorm = norm<1.5?1:(norm<3?2:(norm<7?5:10));
  const tickStep = (niceNorm*mag) || 1;
  let axisMin = Math.floor(dataMin/tickStep)*tickStep;
  let axisMax = Math.ceil(dataMax/tickStep)*tickStep;
  if(axisMax <= dataMax) axisMax += tickStep;
  if(axisMin > dataMin) axisMin -= tickStep;
  const range = (axisMax - axisMin) || 1;
  const yFor = v => padTop + plotH - ((v-axisMin)/range)*plotH;

  const ticks = [];
  for(let t=axisMin; t<=axisMax+1e-6; t+=tickStep){ ticks.push(Math.round(t*100)/100); }
  if(ticks.length===0) ticks.push(0);

  const gridlines = ticks.map(t=>{
    const y = yFor(t);
    const label = String(Math.round(t));
    return '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(w-padR)+'" y2="'+y.toFixed(1)+'" stroke="#e6e0cd" stroke-width="1"/>'+
      '<text x="'+(padL-8)+'" y="'+(y+3.2).toFixed(1)+'" font-size="10" text-anchor="end" fill="#776955">'+label+'</text>';
  }).join('');

  const axisLines = '<line x1="'+padL+'" y1="'+padTop+'" x2="'+padL+'" y2="'+(padTop+plotH)+'" stroke="#b8ac91" stroke-width="1"/>'+
    '<line x1="'+padL+'" y1="'+(padTop+plotH)+'" x2="'+(w-padR)+'" y2="'+(padTop+plotH)+'" stroke="#b8ac91" stroke-width="1"/>';

  const lines = seriesList.map((s, si)=>{
    const pts = s.values.map((v,i)=>[xFor(i), yFor(v)]);
    const path = pts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
    const dots = pts.map((p,i)=>{
      const yr = years[i];
      return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3.4" data-base-r="3.4" fill="'+s.color+'" stroke="#fff" stroke-width="1.2" style="cursor:pointer;transition:r .15s" onmouseenter="censusChartPointHover(this,\''+yr+'\',true)" onmouseleave="censusChartPointHover(this,\''+yr+'\',false)" onclick="censusChartPointClick(\''+yr+'\')"><title>Vai alle tabelle originali del '+yr+'</title></circle>';
    }).join('');
    // Value label above each point. When there are two series, stagger the labels
    // vertically (10px vs 22px above the dot) so they do not collide with each other
    // when both series have similar values at the same year.
    const extraUp = si===0 ? 11 : 23;
    const valueLabels = pts.map((p,i)=>{
      const val = s.values[i];
      const txt = String(Math.round(val));
      return '<text x="'+p[0].toFixed(1)+'" y="'+(p[1]-extraUp).toFixed(1)+'" font-size="11" font-weight="700" text-anchor="middle" fill="'+s.color+'">'+txt+'</text>';
    }).join('');
    return '<path d="'+path+'" fill="none" stroke="'+s.color+'" stroke-width="2.2"/>'+dots+valueLabels;
  }).join('');

  const xLabels = years.map((y,i)=>'<text x="'+xFor(i).toFixed(1)+'" y="'+(h-8)+'" font-size="11" text-anchor="middle" fill="#5a4a35">'+y+'</text>').join('');

  const legend = seriesList.length>1 ? '<div style="margin-top:4px">'+seriesList.map(s=>
    '<span style="display:inline-flex;align-items:center;gap:4px;margin-right:12px;font-size:11px;color:#5a4a35">'+
    '<span style="width:10px;height:10px;border-radius:2px;background:'+s.color+';display:inline-block"></span>'+esc(s.label)+'</span>'
  ).join('')+'</div>' : '';

  return '<div style="width:100%">'+
    '<svg viewBox="0 0 '+w+' '+h+'" style="display:block;width:100%;height:auto">'+gridlines+axisLines+lines+xLabels+'</svg>'+
    legend+
    '</div>';
}

// Hovering a chart point enlarges it slightly and highlights the map for that same
// census year (see .censusMapHighlight in the stylesheet), so it's obvious which of
// the three maps the point corresponds to. Clicking jumps straight to the Fonti tab
// with that year pre-selected, i.e. "vedi le tabelle originali" for that census.
function censusChartPointHover(circleEl, year, on){
  const baseR = parseFloat(circleEl.dataset.baseR || circleEl.getAttribute("r"));
  circleEl.setAttribute("r", (on ? baseR*1.55 : baseR).toFixed(1));
  const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
  if(wrap) wrap.classList.toggle("censusMapHighlight", !!on);
  const cell = document.getElementById("natCell_"+year) || document.getElementById("natCellPost_"+year);
  if(cell){ cell.style.background = on ? "#f1e0b8" : ""; cell.style.fontWeight = on ? "bold" : ""; }
}
function censusChartPointClick(year){
  const radio = document.querySelector('input[name="fontiYear"][value="'+year+'"]');
  if(radio) radio.checked = true;
  fontiYear = year;
  fontiSort = {key:"name", dir:"asc"};
  showFontiTab();
}
// Horizontal population pyramid (age brackets x sex) for one pre-partition census year,
// national totals across every county/city, respecting the checked age brackets (but
// always showing both sexes, regardless of the M/F/Entrambi filter, since a pyramid
// with one side missing would not be a pyramid).
function censusPyramidSvg(year){
  const w = 300, h = 224;
  const padTop = 28, padBottom = 22;
  const bracketsChecked = AGE_BRACKETS.filter(b=>censusAgeFilter.has(b));
  const useBrackets = bracketsChecked.length ? bracketsChecked : AGE_BRACKETS;
  const rowH = (h - padTop - padBottom) / useBrackets.length;
  const table = CENSUS_AGESEX[year] || {};
  const allKeys = CENSUS_GEO.counties.concat(Object.keys(CENSUS_GEO.cities));
  const totals = useBrackets.map(b=>{
    let M=0,F=0;
    allKeys.forEach(k=>{
      const e = table[k] && table[k][b];
      if(e){ M+=e.M; F+=e.F; }
    });
    return {b, M, F};
  });
  const mx = Math.max(1, ...totals.map(t=>Math.max(t.M,t.F)));
  const midX = w/2;
  const barMax = w/2 - 38;
  const rows = totals.map((t,i)=>{
    const y = padTop + i*rowH;
    const wM = (t.M/mx)*barMax, wF = (t.F/mx)*barMax;
    return '<rect x="'+(midX-wM).toFixed(1)+'" y="'+(y+2).toFixed(1)+'" width="'+wM.toFixed(1)+'" height="'+(rowH-4).toFixed(1)+'" fill="#8ecae6"/>'+
      '<rect x="'+midX+'" y="'+(y+2).toFixed(1)+'" width="'+wF.toFixed(1)+'" height="'+(rowH-4).toFixed(1)+'" fill="#f2a6c6"/>'+
      '<text x="'+(midX-wM-5).toFixed(1)+'" y="'+(y+rowH/2+4.5).toFixed(1)+'" font-size="13" font-weight="600" text-anchor="end" fill="#3d7fa0">'+(t.M||"")+'</text>'+
      '<text x="'+(midX+wF+5).toFixed(1)+'" y="'+(y+rowH/2+4.5).toFixed(1)+'" font-size="13" font-weight="600" text-anchor="start" fill="#c15f8a">'+(t.F||"")+'</text>'+
      '<text x="'+midX+'" y="'+(y+rowH/2+4.5).toFixed(1)+'" font-size="11" text-anchor="middle" fill="#5a4a35">'+esc(t.b)+'</text>';
  }).join("");
  return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" style="display:block;margin:0 auto;width:100%;height:auto">'+
    '<text x="'+(midX-28)+'" y="18" font-size="16" font-weight="700" text-anchor="middle" fill="#3d7fa0">♂</text>'+
    '<text x="'+midX+'" y="17" font-size="13.5" font-weight="700" text-anchor="middle" fill="#3a3226">'+year+'</text>'+
    '<text x="'+(midX+28)+'" y="18" font-size="16" font-weight="700" text-anchor="middle" fill="#c15f8a">♀</text>'+
    '<line x1="'+midX+'" y1="'+padTop+'" x2="'+midX+'" y2="'+(h-padBottom)+'" stroke="#d8cfc0" stroke-width="1"/>'+
    rows+
    '</svg>';
}
// The 1926-1946 age/sex pyramid (previously shown alongside the national total) has
// been removed: the underlying per-macro-area sex breakdown it relied on proved
// unreliable, so censusRenderNationalDetailPost no longer renders one.
function censusRenderPyramidsHtml(){
  const svgs = CENSUS_YEARS_G.map(y=>'<div>'+censusPyramidSvg(y)+'</div>').join("");
  const filtered = censusAgeFilter.size && censusAgeFilter.size<AGE_BRACKETS.length;
  return '<div style="margin-top:18px">'+
    '<h4 style="margin:0 0 6px 0;font-size:13.5px">'+TT("Age and sex pyramid","Piramide di et&agrave; e sesso")+(filtered?' <span style="font-weight:normal;color:#776955">'+TT("(selected brackets)","(fasce selezionate)")+'</span>':'')+'</h4>'+
    '<div style="display:flex;gap:14px;flex-wrap:wrap">'+svgs+'</div>'+
    '<p style="font-size:11px;color:#776955;margin-top:4px">'+TT("Always shows both sexes, regardless of the Sex filter above (it does respect the selected age brackets). Not available for 1926-1946: the Free State reports do not publish the breakdown by age.","Mostra sempre entrambi i sessi, indipendentemente dal filtro Sesso qui sopra (rispetta invece le fasce d&rsquo;et&agrave; selezionate). Non disponibile per il 1926-1946: i rapporti del Free State non pubblicano il dettaglio per et&agrave;.")+'</p>'+
    '</div>';
}
// National ("Totale nazionale") view: a compact two-row table - one column per census,
// values as the row - sized to the same width as the three maps above (it lives below
// them now, full width, not in a side column), the trend chart, and, in its own row of
// three columns aligned with the three maps, that census's age/sex pyramid.
// National ("Totale nazionale") view: the value row and the pyramid row both reuse the
// exact same .censusMapsRow/.censusMapCol markup as the maps themselves (same flex
// column count, same gaps, same width rules), which is what actually keeps everything
// on the same vertical lines as the maps above - a plain wide table doesn't share that
// layout, which is why the value row is now three small per-year tables instead.
function censusRenderNationalDetail(){
  const el = document.getElementById("censusDetail");
  const rows = CENSUS_YEARS_G.map(y=>({y, raw: censusNationalTotal(y)}));
  const valueCols = rows.map((r,i)=>{
    const prevRaw = i>0 ? rows[i-1].raw : null;
    return '<div class="censusMapCol"><table class="tl" style="text-align:center"><tbody>'+
      '<tr><th>'+TT("Census","Censimento")+'</th><td>'+r.y+'</td></tr>'+
      '<tr><th>'+TT("Italians","Italiani")+'</th><td id="natCell_'+r.y+'">'+censusCell(r.raw, prevRaw)+'</td></tr>'+
      '</tbody></table></div>';
  }).join("");
  const hint = censusGeoMode==="province" ? TT("a province","una provincia") : TT("a county or city","una contea o citt\u00e0");
  const filtered = censusAgeFilter.size && censusAgeFilter.size<AGE_BRACKETS.length;
  const pyramidCols = CENSUS_YEARS_G.map(y=>'<div class="censusMapCol">'+censusPyramidSvg(y)+'</div>').join("");
  el.innerHTML = '<h3 class="sec">'+TT("National total","Totale nazionale")+'</h3>'+
    '<div class="censusMapsRow">'+valueCols+'</div>'+
    '<p style="font-size:12px;color:#776955;margin-top:6px">'+TT("Click "+hint+" on one of the three maps to see the detail for that section.","Clicca "+hint+" su una delle tre mappe per vedere il dettaglio di quella sezione.")+'</p>'+
    '<h4 style="margin:20px 0 6px 0;font-size:13.5px">'+TT("Age and sex pyramid","Piramide di et\u00e0 e sesso")+(filtered?' <span style="font-weight:normal;color:#776955">'+TT("(selected brackets)","(fasce selezionate)")+'</span>':'')+TT(", by census",", per censimento")+'</h4>'+
    '<div class="censusMapsRow">'+pyramidCols+'</div>'+
    '<p style="font-size:11px;color:#776955;margin-top:4px">'+TT("Each pyramid lines up with the map for the same year above. It always shows both sexes, regardless of the Sex filter (it does respect the selected age brackets). Not available for 1926-1946: the Free State reports do not publish the breakdown by age.","Ogni piramide \u00e8 in linea con la mappa dello stesso anno qui sopra. Mostra sempre entrambi i sessi, indipendentemente dal filtro Sesso (rispetta invece le fasce d&rsquo;et\u00e0 selezionate). Non disponibile per il 1926-1946: i rapporti del Free State non pubblicano il dettaglio per et\u00e0.")+'</p>';
}
// Mirrors censusRenderNationalDetail's layout exactly (same .censusMapsRow/.censusMapCol
// per-year tables, same trend chart, same pyramid-row pattern below) so the two "Totale"
// sections read as one consistent design rather than two different ones.
function censusRenderNationalDetailPost(){
  const el = document.getElementById("censusDetailPost");
  if(!el) return;
  const rows = CENSUS_YEARS_POST.map(y=>({y, raw: censusPostTotal(y)}));
  const valueCols = rows.map((r,i)=>{
    const prevRaw = i>0 ? rows[i-1].raw : null;
    return '<div class="censusMapCol"><table class="tl" style="text-align:center"><tbody>'+
      '<tr><th>'+TT("Census","Censimento")+'</th><td>'+r.y+'</td></tr>'+
      '<tr><th>'+TT("Italians","Italiani")+'</th><td id="natCellPost_'+r.y+'">'+censusCell(r.raw, prevRaw)+'</td></tr>'+
      '</tbody></table></div>';
  }).join("");
  el.innerHTML = '<h3 class="sec">'+TT("Total Irish Free State","Totale Irish Free State")+'</h3>'+
    '<div class="censusMapsRow">'+valueCols+'</div>';
}
function censusRenderDetailPost(regionKey){
  const el = document.getElementById("censusDetailPost");
  if(!el) return;
  const rows = CENSUS_YEARS_POST.map(y=>{
    const raw = censusRaw(y,"region",regionKey);
    const total = censusNationalTotal(y);
    const pct = total ? (raw/total*100) : 0;
    return {y, raw, pct};
  });
  const body = rows.map((r,i)=>{
    const prevRaw = i>0 ? rows[i-1].raw : null;
    return '<tr><td>'+r.y+'</td><td>'+censusCell(r.raw, prevRaw)+'</td><td>'+r.pct.toFixed(1)+'%</td></tr>';
  }).join("");
  const chartColor = 'rgb('+REGION_COLORS[regionKey].c2.join(',')+')';
  const chart = censusSparklineMulti([{label: REGION_LABELS[regionKey], values: rows.map(r=>r.raw), color: chartColor}], CENSUS_YEARS_POST);
  const membersTxt = [].concat(
    REGION_MEMBERS[regionKey].counties,
    REGION_MEMBERS[regionKey].cities.map(ck=>censusLabel("city",ck))
  ).join(", ");
  el.innerHTML = '<h3 class="sec">'+esc(REGION_LABELS[regionKey])+'</h3>'+
    '<p style="font-size:11.5px;color:#776955;margin:-4px 0 8px 0">'+TT("Single figure reported by the census for the whole area: ","Dato unico riportato dal censimento per l&rsquo;intera area: ")+esc(membersTxt)+'.</p>'+
    '<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">'+
    '<div style="max-width:100%;overflow-x:auto"><table class="tl" style="max-width:480px"><thead><tr><th>'+TT("Census","Censimento")+'</th><th>'+TT("Italians","Italiani")+'</th><th>'+TT("% of Free State total","% sul totale Free State")+'</th></tr></thead><tbody>'+
    body+
    "</tbody></table></div>"+
    chart+
    "</div>";
}
function censusResetView(){
  censusFocus = null;
  censusFocusRaw = null;
  censusApplyZoom(null);
  censusClearSelection();
  censusClearInMapLabels(CENSUS_YEARS_G);
  censusRecolor();
  censusRenderNationalDetail();
}
function censusFocusOn(kind, key, rawKind, rawKey){
  if(censusFocus && censusFocus.kind===kind && censusFocus.key===key){
    // clicking the already-selected county/city/province again returns to the national view
    censusResetView();
    return;
  }
  censusFocus = {kind, key};
  censusFocusRaw = {kind: rawKind||kind, key: rawKey||key};
  const prefix0 = "y1891_";
  let bbox;
  if(kind==="county"){
    bbox = censusViewportBBox(document.getElementById(prefix0+key));
  } else if(kind==="city"){
    const wrap0 = document.querySelector('.censusMapSvgWrap[data-year="1891"]');
    bbox = censusViewportBBox(wrap0.querySelector('circle[data-key="'+key+'"]'));
  } else {
    const els = (PROVINCE_COUNTIES[key]||[]).map(c=>document.getElementById(prefix0+c)).filter(Boolean);
    bbox = censusUnionBBox(els);
  }
  const cx = bbox.x + bbox.width/2, cy = bbox.y + bbox.height/2;
  const half = Math.max(bbox.width, bbox.height) * 0.5 * 1.5 + 10;
  censusApplyZoom({x: cx-half, y: cy-half, width: half*2, height: half*2});
  censusClearSelection();
  CENSUS_YEARS_G.forEach(year=>{
    const wrap = document.querySelector('.censusMapSvgWrap[data-year="'+year+'"]');
    const prefix = "y"+year+"_";
    if(kind==="province"){
      (PROVINCE_COUNTIES[key]||[]).forEach(c=>{
        const t = document.getElementById(prefix+c);
        if(t){ t.style.stroke = "#a05a2c"; t.style.strokeWidth = "2.2px"; }
      });
      return;
    }
    let target = kind==="county" ? document.getElementById(prefix+key) : wrap.querySelector('circle[data-key="'+key+'"]');
    if(target){ target.style.stroke = "#a05a2c"; target.style.strokeWidth = "2.2px"; }
  });
  censusApplyLocalScale();
  if(censusGeoMode==="province") censusRenderLegendProvince(censusBinEdges5());
  else censusRenderLegend(censusBinEdges5());
  censusRenderDeltaBadges();
  censusRenderDetail(kind, key);
  censusPlaceInMapLabels(CENSUS_YEARS_G, censusFocusRaw.kind, censusFocusRaw.key, false);
}
function censusLabel(kind, key){
  if(kind==="county") return key;
  if(kind==="province") return key;
  return CENSUS_GEO.cities[key] ? CENSUS_GEO.cities[key].label : key;
}
// "+5 / +21%" style fragment, colored green for growth and brick-red for decline.
function censusDeltaParen(oldV, newV){
  const diff = newV - oldV;
  const sign = diff>0 ? "+" : "";
  let pctStr;
  if(oldV===0){ pctStr = newV>0 ? TT("new","nuovo") : TT("unchanged","invariato"); }
  else { const pct = diff/oldV*100; pctStr = (pct>0?"+":"")+pct.toFixed(0)+"%"; }
  const color = diff>0 ? "#1f6b33" : (diff<0 ? "#a03a2c" : "#776955");
  return ' <span style="color:'+color+';font-size:11.5px;white-space:nowrap">('+sign+diff+' / '+pctStr+')</span>';
}
// Renders a table cell for `raw` at year index idx, with an inline (+delta / +pct%)
// next to it when a previous year's raw value is available.
function censusCell(raw, prevRaw){
  if(prevRaw===null || prevRaw===undefined) return String(raw);
  return raw + censusDeltaParen(prevRaw, raw);
}
function censusDeltaHtml(oldV, newV){
  const diff = newV - oldV;
  const sign = diff>0 ? "+" : "";
  let pctStr;
  if(oldV===0){ pctStr = newV>0 ? TT("new","nuovo") : TT("unchanged","invariato"); }
  else { const pct = diff/oldV*100; pctStr = (pct>0?"+":"")+pct.toFixed(0)+"%"; }
  const color = diff>0 ? "#1f6b33" : (diff<0 ? "#a03a2c" : "#776955");
  return '<span style="color:'+color+';font-weight:bold">'+sign+diff+'</span> <span style="color:'+color+'">('+pctStr+')</span>';
}
function censusRenderDeltaBadges(){
  CENSUS_YEARS_G.forEach((year, idx)=>{
    const elBadge = document.getElementById("censusDelta_"+year);
    if(!elBadge) return;
    if(idx===0){ elBadge.innerHTML = ""; return; }
    const prevYear = CENSUS_YEARS_G[idx-1];
    let oldV, newV;
    if(censusFocus){
      oldV = censusRaw(prevYear, censusFocus.kind, censusFocus.key);
      newV = censusRaw(year, censusFocus.kind, censusFocus.key);
    } else {
      oldV = CENSUS_GEO.data[prevYear].total;
      newV = CENSUS_GEO.data[year].total;
    }
    elBadge.innerHTML = TT("since ","dal ")+prevYear+": "+censusDeltaHtml(oldV,newV);
  });
}
function censusRenderDetail(kind, key){
  const el = document.getElementById("censusDetail");
  const cityKey = kind==="county" ? CENSUS_COUNTY_TO_CITY[key] : null;
  if(cityKey){
    const rows = CENSUS_YEARS_G.map(y=>({
      y,
      countyRaw: censusRaw(y,"county",key),
      cityRaw: censusRaw(y,"city",cityKey),
      recorded: censusCityRecorded(y, cityKey),
    }));
    const body = rows.map((r,i)=>{
      const prev = i>0 ? rows[i-1] : null;
      const combRaw = r.countyRaw + r.cityRaw;
      const combPrev = (prev && prev.recorded && r.recorded) ? (prev.countyRaw+prev.cityRaw) : null;
      return '<tr><td>'+r.y+'</td>'+
        '<td>'+censusCell(r.countyRaw, prev?prev.countyRaw:null)+'</td>'+
        '<td>'+censusCell(r.cityRaw, prev?prev.cityRaw:null)+(r.recorded?'':' <span title="'+TT("not recorded separately this year","non rilevata separatamente questo anno")+'" style="color:#a05a2c">*</span>')+'</td>'+
        '<td>'+(r.recorded ? censusCell(combRaw, combPrev) : '&#8211;')+'</td></tr>';
    }).join("");
    const chart = censusSparklineMulti([
      {label: key, values: rows.map(r=>r.countyRaw), color:"#0b4a1d"},
      {label: censusLabel("city",cityKey), values: rows.map(r=>r.cityRaw), color:"#a0522c"}
    ]);
    el.innerHTML = '<h3 class="sec">'+esc(key)+TT(" and "," e ")+esc(censusLabel("city",cityKey))+'</h3>'+
      '<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">'+
      '<div style="max-width:100%;overflow-x:auto"><table class="tl" style="max-width:640px"><thead><tr><th>'+TT("Census","Censimento")+'</th><th>'+TT("County","Contea")+'</th><th>'+esc(censusLabel("city",cityKey))+'</th><th>'+TT("County + city","Contea + citt&agrave;")+'</th></tr></thead><tbody>'+
      body+
      "</tbody></table></div>"+
      chart+
      "</div>"+
      (rows.some(r=>!r.recorded) ? '<p style="font-size:11px;color:#776955;margin-top:4px">'+TT("* that year "+esc(censusLabel("city",cityKey))+" does not appear as a separate entry in the census: its Italians are already counted within the county total, so the &ldquo;county + city&rdquo; value is not shown to avoid double-counting them. The chart still reports the raw figure recorded that year for the city.", "* quell'anno "+esc(censusLabel("city",cityKey))+" non risulta come voce separata nel censimento: i suoi italiani sono gi&agrave; conteggiati dentro il totale della contea, quindi il valore &ldquo;contea + citt&agrave;&rdquo; non &egrave; mostrato per non contarli due volte. Il grafico riporta comunque il dato numerico grezzo registrato quell'anno per la citt&agrave;.")+'</p>' : '');
  } else {
    const rows = CENSUS_YEARS_G.map(y=>{
      const raw = censusRaw(y, kind, key);
      const total = censusNationalTotal(y);
      const pct = total? (raw/total*100) : 0;
      return {y, raw, pct};
    });
    const body = rows.map((r,i)=>{
      const prevRaw = i>0 ? rows[i-1].raw : null;
      return '<tr><td>'+r.y+'</td><td>'+censusCell(r.raw, prevRaw)+'</td><td>'+r.pct.toFixed(1)+'%</td></tr>';
    }).join("");
    const chartColor = kind==="province" ? 'rgb('+PROVINCE_COLORS[key].c2.join(',')+')' : "#0b4a1d";
    const chart = censusSparklineMulti([{label: censusLabel(kind,key), values: rows.map(r=>r.raw), color: chartColor}]);
    el.innerHTML = '<h3 class="sec">'+esc(censusLabel(kind,key))+'</h3>'+
      '<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">'+
      '<div style="max-width:100%;overflow-x:auto"><table class="tl" style="max-width:480px"><thead><tr><th>'+TT("Census","Censimento")+'</th><th>'+TT("Italians","Italiani")+'</th><th>'+TT("% of national total","% sul totale nazionale")+'</th></tr></thead><tbody>'+
      body+
      "</tbody></table></div>"+
      chart+
      "</div>";
  }
  const elenchiCty = kind==="county" ? key : (kind==="city" && CENSUS_GEO.cities[key] ? CENSUS_GEO.cities[key].county : null);
  if(elenchiCty){
    el.innerHTML += '<p style="margin-top:10px"><button class="small" onclick="elenchiOpenFor(\'1911\',\''+elenchiCty.replace(/'/g,"\\'")+'\')">'+TT("See the nominal list for this county &rarr;","Vedi l'elenco nominativo di questa contea &rarr;")+'</button></p>';
  }
}
function censusTooltipShow(evt, kind, key){
  const tip = document.getElementById("censusTooltip");
  if(!tip) return;
  const year = evt.currentTarget.closest(".censusMapSvgWrap").dataset.year;
  if(kind==="outside"){
    tip.innerHTML = '<b>'+esc(key)+'</b> &mdash; '+TT("outside the Saorst&aacute;t &Eacute;ireann: separate census of Northern Ireland, not included here.","fuori dal Saorst&aacute;t &Eacute;ireann: censimento separato dell&rsquo;Irlanda del Nord, non incluso qui.");
    tip.style.display = "block";
    censusTooltipMove(evt);
    return;
  }
  const raw = censusRaw(year, kind, key);
  const pct = censusValue(year, kind, key);
  const labelEsc = esc(censusLabel(kind, key));
  if(censusIsPost(year)){
    const region = KEY_TO_REGION[key];
    tip.innerHTML = '<b>'+labelEsc+' <span style="opacity:.8">&mdash; '+esc(REGION_LABELS[region])+'</span></b><br>'+esc(year)+': '+Math.round(raw)+' persone ('+pct.toFixed(1)+'%) nell&rsquo;intera area';
  } else {
    tip.innerHTML = '<b>'+labelEsc+'</b> &mdash; '+esc(year)+': '+Math.round(raw)+' persone ('+pct.toFixed(1)+'%)';
  }
  tip.style.display = "block";
  censusTooltipMove(evt);
}
function censusTooltipMove(evt){
  const tip = document.getElementById("censusTooltip");
  if(!tip || tip.style.display==="none") return;
  tip.style.left = (evt.clientX+14)+"px";
  tip.style.top = (evt.clientY+12)+"px";
}
function censusTooltipHide(){
  const tip = document.getElementById("censusTooltip");
  if(tip) tip.style.display = "none";
}
// Re-applies the current sex/age filter everywhere in the census tab: both map rows,
// their legends and delta badges (all handled inside censusRecolor/censusRecolorPost),
// and whichever detail panel (national or a focused county/city/province/region) is
// currently showing in each row.
function censusApplyFilters(){
  censusRecolor();
  if(censusFocus){
    censusRenderDetail(censusFocus.kind, censusFocus.key);
    if(censusFocusRaw) censusPlaceInMapLabels(CENSUS_YEARS_G, censusFocusRaw.kind, censusFocusRaw.key, false);
  } else censusRenderNationalDetail();
  censusRecolorPost();
  if(censusFocusPost){
    censusRenderDetailPost(censusFocusPost.key);
    if(censusFocusRawPost) censusPlaceInMapLabels(CENSUS_YEARS_POST, censusFocusRawPost.kind, censusFocusRawPost.key, true);
  } else censusRenderNationalDetailPost();
  censusRenderCombinedChart();
}
// Single combined trend chart across all six censuses (1891-1946), replacing the two
// separate "national total" charts that used to live inside censusRenderNationalDetail
// and censusRenderNationalDetailPost. Unlike those, and unlike the per-entity charts in
// censusRenderDetail/DetailPost, this one deliberately does NOT react to clicking a
// county/province/macro-area on the maps - it always shows the whole-country total, so
// it stays put as a single fixed reference at the bottom of the page. It does still
// respect the Sex/Age filters above (censusNationalTotal already folds those in), so it
// stays consistent with the tables and pyramids above it.
function censusRenderCombinedChart(){
  const el = document.getElementById("censusCombinedChart");
  if(!el) return;
  const years = CENSUS_YEARS_G.concat(CENSUS_YEARS_POST);
  const values = years.map(y=>censusNationalTotal(y));
  el.innerHTML = censusSparklineMulti([{label:TT("Italy","Italia"), values, color:"#0b4a1d"}], years);
}
function initCensuses(){
  if(censusInited) return; censusInited = true;
  censusBuildMarkers();
  censusResolveCityOverlaps();
  censusRecolor();
  censusRenderNationalDetail();
  censusRecolorPost();
  censusRenderNationalDetailPost();
  censusRenderCombinedChart();
  document.querySelectorAll('input[name="censusGeoMode"]').forEach(r=>{
    r.addEventListener("change", ()=>{
      censusGeoMode = r.value;
      censusResetView();
    });
  });
  document.querySelectorAll('input[name="censusSex"]').forEach(r=>{
    r.addEventListener("change", ()=>{ censusSexFilter = r.value; censusApplyFilters(); });
  });
  document.querySelectorAll('.censusAgeChk').forEach(c=>{
    c.addEventListener("change", ()=>{
      censusAgeFilter = new Set(Array.from(document.querySelectorAll('.censusAgeChk:checked')).map(x=>x.value));
      censusApplyFilters();
    });
  });
  document.querySelectorAll(".censusMapSvgWrap svg").forEach(svg=>{
    svg.addEventListener("click", (e)=>{
      const t = e.target;
      if(!t || !t.dataset) return;
      const year = svg.closest(".censusMapSvgWrap").dataset.year;
      if(censusIsPost(year)){
        if(t.dataset.kind==="county" || t.dataset.kind==="city") censusFocusOnPost(t.dataset.kind, t.dataset.key);
        return;
      }
      if(t.dataset.kind==="county" || t.dataset.kind==="city"){
        const r = censusResolveEntity(t.dataset.kind, t.dataset.key);
        censusFocusOn(r.kind, r.key, t.dataset.kind, t.dataset.key);
      }
    });
    svg.addEventListener("mouseover", (e)=>{
      const t = e.target;
      if(t && t.dataset && t.dataset.kind){ censusTooltipShow(e, t.dataset.kind, t.dataset.key); }
    });
    svg.addEventListener("mousemove", censusTooltipMove);
    svg.addEventListener("mouseout", (e)=>{
      const t = e.target;
      if(t && t.dataset && t.dataset.kind) censusTooltipHide();
    });
  });
}

// ---------------- "Fonti" tab: the raw source tables (one per census year), with a
// year selector and click-to-sort column headers (name / absolute number /
// percentage) - built from the same CENSUS_GEO data already embedded and reconciled
// for the censuses map (32 counties + 9 cities, totals verified against the original
// CSVs Luca provided).
let fontiInited = false;
let fontiYear = "1891";
let fontiSort = {key:"name", dir:"asc"};
let fontiSexFilter = "both";
let fontiAgeFilter = new Set(AGE_BRACKETS);
function fontiNationalTotal(year){
  if(CENSUS_AGESEX[year]){
    let sum = 0;
    CENSUS_GEO.counties.forEach(c=>{ sum += censusAgeSexRawFiltered(year,c,fontiSexFilter,fontiAgeFilter); });
    Object.keys(CENSUS_GEO.cities).forEach(ck=>{ sum += censusAgeSexRawFiltered(year,ck,fontiSexFilter,fontiAgeFilter); });
    return sum;
  }
  let sum = 0;
  REGION_KEYS.forEach(r=>{ sum += censusPostRegionRawFiltered(year,r,fontiSexFilter); });
  return sum;
}
const FONTI_COUNTY_PREFIX = "County ";
const FONTI_CITY_LABELS = {
  "Dublin City": "City of Dublin",
  "Cork City": "City of Cork",
  "Belfast City": "City of Belfast",
  "Waterford City": "City of Waterford",
  "Limerick City": "City of Limerick",
  "Kilkenny City": "City of Kilkenny",
  "Derry City": "City of Londonderry",
  "Galway Town": "Town of Galway",
  "Drogheda Town": "Town of Drogheda"
};
function fontiPlaceName(kind, key){
  if(kind==="county") return FONTI_COUNTY_PREFIX+key;
  return FONTI_CITY_LABELS[key] || (CENSUS_GEO.cities[key] ? CENSUS_GEO.cities[key].label : key);
}
function fontiRows(year){
  const d = CENSUS_GEO.data[year];
  const rows = [];
  CENSUS_GEO.counties.forEach(c=>{
    rows.push({name: fontiPlaceName("county",c), raw: censusAgeSexRawFiltered(year,c,fontiSexFilter,fontiAgeFilter), notRecorded:false});
  });
  Object.keys(CENSUS_GEO.cities).forEach(ck=>{
    const nr = !!(d.notRecorded && d.notRecorded.indexOf(ck)>=0);
    rows.push({name: fontiPlaceName("city",ck), raw: censusAgeSexRawFiltered(year,ck,fontiSexFilter,fontiAgeFilter), notRecorded: nr});
  });
  const total = fontiNationalTotal(year);
  rows.forEach(r=>{ r.pct = total ? (r.raw/total*100) : 0; });
  return rows;
}
// "Tutti" view: one row per place, with a column for each census year (merged
// absolute+percentage, as in the single-year view) and, BETWEEN each pair of census
// years, the change from one census to the next (both absolute and percentage terms,
// reusing the same green/red convention as the rest of the site). The rightmost
// column is the overall change across the full span, 1891 to 1911.
let fontiSortAll1 = {key:"name", dir:"asc"};
let fontiCmp1 = {a:"1891", b:"1911"};
// Places never recorded as a separate entity in at least one of the three
// pre-partition censuses (their Italians are folded into the county total that
// year rather than shown on their own line) are left out of this comparison
// table, since a row with a gap wouldn't give a fair three-census comparison.
const FONTI_NOTRECORDED_ANY = new Set();
CENSUS_YEARS_G.forEach(y=>{
  const nr = CENSUS_GEO.data[y] && CENSUS_GEO.data[y].notRecorded;
  if(nr) nr.forEach(k=>FONTI_NOTRECORDED_ANY.add(k));
});
function fontiRowsAll(){
  const rows = [];
  CENSUS_GEO.counties.forEach(c=>{ if(!FONTI_NOTRECORDED_ANY.has(c)) rows.push({name: fontiPlaceName("county",c), kind:"county", key:c}); });
  Object.keys(CENSUS_GEO.cities).forEach(ck=>{ if(!FONTI_NOTRECORDED_ANY.has(ck)) rows.push({name: fontiPlaceName("city",ck), kind:"city", key:ck}); });
  rows.forEach(r=>{
    r.byYear = {};
    CENSUS_YEARS_G.forEach(y=>{
      const total = fontiNationalTotal(y);
      const raw = censusAgeSexRawFiltered(y, r.key, fontiSexFilter, fontiAgeFilter);
      r.byYear[y] = {raw, pct: total?(raw/total*100):0};
    });
  });
  return rows;
}
// Post-partition (1926/1936/1946) Fonti data follows the published report's own
// grouping into six macro-areas plus the two provincial subtotals (Leinster,
// Munster) and the Free State grand total -- the shape of the source table itself,
// rather than spread out artificially across all 26 counties.
const FONTI_POST_ROWS = [
  {key:"dublinBoro", kind:"region"},
  {key:"restLeinster", kind:"region"},
  {key:"totalLeinster", kind:"subtotal", parts:["dublinBoro","restLeinster"], label:TT("Total Leinster","Totale Leinster")},
  {key:"corkLimerickWaterfordBoro", kind:"region"},
  {key:"restMunster", kind:"region"},
  {key:"totalMunster", kind:"subtotal", parts:["corkLimerickWaterfordBoro","restMunster"], label:TT("Total Munster","Totale Munster")},
  {key:"connacht", kind:"region"},
  {key:"ulsterPart", kind:"region"},
  {key:"total", kind:"total", parts:["totalLeinster","totalMunster","connacht","ulsterPart"], label:TT("Total Irish Free State","Totale Irish Free State")},
];
function fontiPostRowLabel(row){ return row.label || REGION_LABELS[row.key]; }
function fontiPostRowValue(year, row){
  if(row.kind==="region"){
    const cell = CENSUS_POST[year] && CENSUS_POST[year][row.key];
    const M = cell ? cell.M : 0, F = cell ? cell.F : 0;
    return {M, F, T:M+F};
  }
  let M=0, F=0;
  row.parts.forEach(pk=>{
    const pr = FONTI_POST_ROWS.find(x=>x.key===pk);
    const v = fontiPostRowValue(year, pr);
    M += v.M; F += v.F;
  });
  return {M, F, T:M+F};
}
let fontiCmp2 = {a:"1926", b:"1946"};
function fontiRenderPostAllTable(wrapId){
  const wrap = document.getElementById(wrapId);
  if(!wrap) return;
  const yearHead = CENSUS_YEARS_POST.map(y=>'<th colspan="3" style="text-align:center">'+y+'</th>').join("");
  const subHead = CENSUS_YEARS_POST.map(()=>'<th style="text-align:center">M</th><th style="text-align:center">F</th><th style="text-align:center">Tot.</th>').join("");
  const yearOptsA = CENSUS_YEARS_POST.map(y=>'<option value="'+y+'"'+(y===fontiCmp2.a?' selected':'')+'>'+y+'</option>').join('');
  const yearOptsB = CENSUS_YEARS_POST.map(y=>'<option value="'+y+'"'+(y===fontiCmp2.b?' selected':'')+'>'+y+'</option>').join('');
  const body = FONTI_POST_ROWS.map(row=>{
    const bold = row.kind!=="region";
    let tds = '<td'+(bold?' style="font-weight:bold"':'')+'>'+esc(fontiPostRowLabel(row))+'</td>';
    CENSUS_YEARS_POST.forEach(y=>{
      const v = fontiPostRowValue(y, row);
      const st = 'text-align:center'+(bold?';font-weight:bold':'');
      tds += '<td style="'+st+'">'+v.M+'</td><td style="'+st+'">'+v.F+'</td><td style="'+st+'">'+v.T+'</td>';
    });
    const va = fontiPostRowValue(fontiCmp2.a, row), vb = fontiPostRowValue(fontiCmp2.b, row);
    tds += '<td style="text-align:center">'+censusDeltaHtml(va.T, vb.T)+'</td>';
    return '<tr'+(row.kind==="total"?' style="border-top:2px solid var(--line)"':'')+'>'+tds+'</tr>';
  }).join("");
  wrap.innerHTML =
    '<h4 style="margin:18px 0 6px 0;font-size:14px">1926 &ndash; 1946 (Irish Free State)</h4>'+
    '<div style="max-width:100%;overflow-x:auto"><table class="tl" style="min-width:640px">'+
    '<thead><tr><th rowspan="2">'+TT("Macro-area","Macro-area")+'</th>'+yearHead+'<th rowspan="2">'+TT("Compare:","Confronta:")+' <select class="fontiCmpASelY" style="font-size:12px">'+yearOptsA+'</select> &rarr; <select class="fontiCmpBSelY" style="font-size:12px">'+yearOptsB+'</select></th></tr><tr>'+subHead+'</tr></thead>'+
    '<tbody>'+body+'</tbody></table></div>'+
    '<p style="font-size:11.5px;color:#776955;margin-top:6px">'+TT("Figure published only by macro-area, not county by county: Dublin = Dublin Co. Borough and D\u00fan Laoghaire Borough; Cork/Limerick/Waterford = the three County Boroughs; the Ulster counties in the Free State are Cavan, Donegal and Monaghan. Northern Ireland is not included: it had its own separate census.","Dato pubblicato solo per macro-area, non contea per contea: Dublino = Co. Borough di Dublino e Borough di D\u00fan Laoghaire; Cork/Limerick/Waterford = i tre County Borough; le contee dell&rsquo;Ulster nel Free State sono Cavan, Donegal e Monaghan. L&rsquo;Irlanda del Nord non \u00e8 compresa: aveva un proprio censimento separato.")+'</p>';
  const selA = wrap.querySelector(".fontiCmpASelY"), selB = wrap.querySelector(".fontiCmpBSelY");
  if(selA) selA.addEventListener("change", ()=>{ fontiCmp2.a = selA.value; fontiRenderAll(); });
  if(selB) selB.addEventListener("change", ()=>{ fontiCmp2.b = selB.value; fontiRenderAll(); });
}
function fontiRenderPostYear(year){
  const wrap = document.getElementById("fontiTableWrap");
  if(!wrap) return;
  const totalRow = FONTI_POST_ROWS[FONTI_POST_ROWS.length-1];
  const total = fontiPostRowValue(year, totalRow).T;
  const body = FONTI_POST_ROWS.map(row=>{
    const bold = row.kind!=="region";
    const v = fontiPostRowValue(year, row);
    const st = 'text-align:center'+(bold?';font-weight:bold':'');
    return '<tr'+(row.kind==="total"?' style="border-top:2px solid var(--line)"':'')+'>'+
      '<td'+(bold?' style="font-weight:bold"':'')+'>'+esc(fontiPostRowLabel(row))+'</td>'+
      '<td style="'+st+'">'+v.M+'</td><td style="'+st+'">'+v.F+'</td><td style="'+st+'">'+v.T+'</td></tr>';
  }).join("");
  wrap.innerHTML =
    '<table class="tl" style="max-width:480px">'+
    '<thead><tr><th>'+TT("Macro-area","Macro-area")+'</th><th style="text-align:center">M</th><th style="text-align:center">F</th><th style="text-align:center">'+TT("Total","Totale")+'</th></tr></thead>'+
    '<tbody>'+body+'</tbody></table>'+
    '<p style="font-size:12px;color:#776955;margin-top:8px">'+TT("Total Irish Free State "+esc(year)+": "+total+" Italians. Figure published only by macro-area, not county by county. Northern Ireland is not included: it had its own separate census.","Totale Irish Free State "+esc(year)+": "+total+" italiani. Dato pubblicato solo per macro-area, non contea per contea. L&rsquo;Irlanda del Nord non \u00e8 compresa: aveva un proprio censimento separato.")+'</p>';
}
const FONTI_DELTA_SPANS = {
  "d1891_1901": ["1891","1901"],
  "d1901_1911": ["1901","1911"],
  "d1911_1926": ["1911","1926"],
  "d1926_1936": ["1926","1936"],
  "d1936_1946": ["1936","1946"],
};
const FONTI_DELTA_LABELS = {
  "d1891_1901": "1891&rarr;1901",
  "d1901_1911": "1901&rarr;1911",
  "d1911_1926": "1911&rarr;1926",
  "d1926_1936": "1926&rarr;1936",
  "d1936_1946": "1936&rarr;1946",
};
// A single cell showing raw+pct, or an asterisk (with title tooltip) when this
// place has no data at all for that census (the six Northern Ireland counties/cities
// in 1926-1946, which were outside the Free State census).
function fontiCellHtml(v){
  if(v.raw===null) return '<span style="color:#a05a2c" title="'+TT("Outside the Free State census: Northern Ireland had its own separate census","Fuori dal censimento del Free State: l\u2019Irlanda del Nord aveva un proprio censimento separato")+'">*</span>';
  return Math.round(v.raw)+' ('+v.pct.toFixed(1)+'%)';
}
function fontiDeltaCellHtml(a, b){
  if(a.raw===null || b.raw===null) return '<span style="color:#776955">n/d</span>';
  return censusDeltaHtml(a.raw, b.raw);
}
function fontiSortRowsAllGeneric(rows, years, sortState, cmpState){
  const {key, dir} = sortState;
  const mul = dir==="asc" ? 1 : -1;
  return rows.slice().sort((a,b)=>{
    if(key==="name") return mul*a.name.localeCompare(b.name, "it");
    if(key==="cmp"){
      const da = (a.byYear[cmpState.b].raw||0) - (a.byYear[cmpState.a].raw||0);
      const db = (b.byYear[cmpState.b].raw||0) - (b.byYear[cmpState.a].raw||0);
      return mul*(da - db);
    }
    if(years.indexOf(key)>=0) return mul*((a.byYear[key].raw||0) - (b.byYear[key].raw||0));
    return 0;
  });
}
// Renders one of the two "Tutti" tables (either 1891-1911 or 1926-1946) into its own
// container, with its own sort state and its own "Confronta" pair of censuses. Kept as
// two separate tables (rather than one with all six years) because the two eras aren't
// really comparable side by side: 1891-1911 is per-county, 1926-1946 is only per
// macro-area.
function fontiRenderOneAllTable(years, sortState, cmpState, wrapId, heading){
  const rows = fontiSortRowsAllGeneric(fontiRowsAll(), years, sortState, cmpState);
  const arrow = k => sortState.key===k ? (sortState.dir==="asc"?" \u25B2":" \u25BC") : "";
  const body = rows.map(r=>{
    let tds = '<td>'+esc(r.name)+'</td>';
    years.forEach(y=>{ tds += '<td>'+fontiCellHtml(r.byYear[y])+'</td>'; });
    tds += '<td>'+fontiDeltaCellHtml(r.byYear[cmpState.a], r.byYear[cmpState.b])+'</td>';
    return '<tr>'+tds+'</tr>';
  }).join("");
  const yearOptsA = years.map(y=>'<option value="'+y+'"'+(y===cmpState.a?' selected':'')+'>'+y+'</option>').join('');
  const yearOptsB = years.map(y=>'<option value="'+y+'"'+(y===cmpState.b?' selected':'')+'>'+y+'</option>').join('');
  let headCells = '<th style="cursor:pointer" data-sortkey="name">'+TT("Place","Luogo")+arrow("name")+'</th>';
  years.forEach(y=>{ headCells += '<th style="cursor:pointer" data-sortkey="'+y+'">'+y+arrow(y)+'</th>'; });
  headCells += '<th style="cursor:pointer" data-sortkey="cmp">'+TT("Compare:","Confronta:")+' <select class="fontiCmpASelX" style="font-size:12px" onclick="event.stopPropagation()">'+yearOptsA+'</select> &rarr; <select class="fontiCmpBSelX" style="font-size:12px" onclick="event.stopPropagation()">'+yearOptsB+'</select>'+arrow("cmp")+'</th>';
  const wrap = document.getElementById(wrapId);
  if(!wrap) return;
  wrap.innerHTML =
    '<h4 style="margin:18px 0 6px 0;font-size:14px">'+heading+'</h4>'+
    '<div style="max-width:100%;overflow-x:auto"><table class="tl" style="min-width:600px">'+
    '<thead><tr>'+headCells+'</tr></thead><tbody>'+body+'</tbody></table></div>';
  wrap.querySelectorAll("th[data-sortkey]").forEach(th=>{
    th.addEventListener("click", ()=>{
      const k = th.dataset.sortkey;
      if(sortState.key===k) sortState.dir = sortState.dir==="asc" ? "desc" : "asc";
      else { sortState.key = k; sortState.dir = (k==="name") ? "asc" : "desc"; }
      fontiRenderAll();
    });
  });
  const selA = wrap.querySelector(".fontiCmpASelX"), selB = wrap.querySelector(".fontiCmpBSelX");
  if(selA) selA.addEventListener("change", ()=>{ cmpState.a = selA.value; fontiRenderAll(); });
  if(selB) selB.addEventListener("change", ()=>{ cmpState.b = selB.value; fontiRenderAll(); });
}
function fontiRenderAll(){
  const wrap = document.getElementById("fontiTableWrap");
  if(!wrap) return;
  wrap.innerHTML = '<div id="fontiAllWrap1"></div><div id="fontiAllWrap2"></div>'+
    '<p style="font-size:12px;color:#776955;margin-top:8px">'+TT("Click a column header to sort (again to reverse) in the first table. Choose two censuses in the last column of each table to see the change between them. The two tables remain separate because 1891-1911 has the figure for each county/city, while 1926-1946 has only the aggregate figure by macro-area: comparing them on the same row would be misleading. Cities not recorded as a separate entry in at least one of the three 1891-1911 censuses (their Italians remain counted within the county that year) do not appear in the first table.","Clicca un&rsquo;intestazione di colonna per ordinare (di nuovo per invertire) nella prima tabella. Scegli due censimenti nell&rsquo;ultima colonna di ciascuna tabella per vederne la variazione. Le due tabelle restano separate perch&eacute; il 1891-1911 ha il dato per singola contea/citt&agrave;, mentre il 1926-1946 ha solo il dato aggregato per macro-area: confrontarli sulla stessa riga sarebbe fuorviante. Le citt&agrave; non rilevate come voce separata in almeno uno dei tre censimenti 1891-1911 (i loro italiani restano conteggiati nella contea quell&rsquo;anno) non compaiono nella prima tabella.")+'</p>';
  fontiRenderOneAllTable(CENSUS_YEARS_G, fontiSortAll1, fontiCmp1, "fontiAllWrap1", "1891 &ndash; 1911");
  fontiRenderPostAllTable("fontiAllWrap2");
}
function fontiSortRows(rows){
  const {key, dir} = fontiSort;
  const mul = dir==="asc" ? 1 : -1;
  return rows.slice().sort((a,b)=>{
    if(key==="name") return mul*a.name.localeCompare(b.name, "it");
    if(key==="raw") return mul*(a.raw-b.raw); // ties broken by name for a stable, readable order
    return 0;
  });
}
function fontiArrow(key){
  if(fontiSort.key!==key) return "";
  return fontiSort.dir==="asc" ? " \u25B2" : " \u25BC";
}
function fontiRender(){
  if(fontiYear==="all"){ fontiRenderAll(); return; }
  const isPost = CENSUS_YEARS_POST.indexOf(fontiYear)>=0;
  if(isPost){ fontiRenderPostYear(fontiYear); return; }
  const rows = fontiSortRows(fontiRows(fontiYear));
  const total = fontiNationalTotal(fontiYear);
  const body = rows.map(r=>{
    return '<tr><td>'+esc(r.name)+(r.notRecorded?' <span title="'+TT("not recorded separately this year: its Italians are already counted in the county total","non rilevata separatamente questo anno: i suoi italiani sono gi\u00e0 conteggiati nel totale della contea")+'" style="color:#a05a2c">*</span>':'')+'</td>'+
      '<td>'+Math.round(r.raw)+' ('+r.pct.toFixed(1)+'%)</td></tr>';
  }).join("");
  const wrap = document.getElementById("fontiTableWrap");
  if(!wrap) return;
  const note = '<p style="font-size:12px;color:#776955;margin-top:8px">'+TT("Total "+esc(fontiYear)+": "+Math.round(total)+" Italians across all of Ireland. Click a column header to sort (again to reverse).","Totale "+esc(fontiYear)+": "+Math.round(total)+" italiani su tutta l&rsquo;Irlanda. Clicca un&rsquo;intestazione di colonna per ordinare (di nuovo per invertire).")+
    (rows.some(r=>r.notRecorded) ? ' <br>'+TT("* city not recorded as a separate entry that year in the original census.","* citt\u00e0 non rilevata come voce separata quell&rsquo;anno nel censimento originale.") : '')+
    "</p>";
  wrap.innerHTML =
    '<table class="tl" style="max-width:380px">'+
    '<thead><tr>'+
    '<th style="cursor:pointer" data-sortkey="name">'+TT("Place","Luogo")+fontiArrow("name")+'</th>'+
    '<th style="cursor:pointer" data-sortkey="raw">'+TT("Italians (absolute and %)","Italiani (assoluto e %)")+fontiArrow("raw")+'</th>'+
    "</tr></thead><tbody>"+body+"</tbody></table>"+note;
  wrap.querySelectorAll("th[data-sortkey]").forEach(th=>{
    th.addEventListener("click", ()=>{
      const k = th.dataset.sortkey;
      if(fontiSort.key===k) fontiSort.dir = fontiSort.dir==="asc" ? "desc" : "asc";
      else { fontiSort.key = k; fontiSort.dir = (k==="name") ? "asc" : "desc"; }
      fontiRender();
    });
  });
}
function initFonti(){
  if(fontiInited) return; fontiInited = true;
  document.querySelectorAll('input[name="fontiYear"]').forEach(r=>{
    r.addEventListener("change", ()=>{ fontiYear = r.value; fontiSort = {key:"name", dir:"asc"}; fontiRender(); });
  });
  document.querySelectorAll('input[name="fontiSex"]').forEach(r=>{
    r.addEventListener("change", ()=>{ fontiSexFilter = r.value; fontiRender(); });
  });
  document.querySelectorAll('.fontiAgeChk').forEach(c=>{
    c.addEventListener("change", ()=>{
      fontiAgeFilter = new Set(Array.from(document.querySelectorAll('.fontiAgeChk:checked')).map(x=>x.value));
      fontiRender();
    });
  });
  fontiRender();
}
// "Fonti" is not a permanent top-nav tab; it is only reachable via a button on the
// "Italiani nei Censimenti" page, which calls this instead of a nav-button click.
// ---------------- "Elenchi": nominal per-person census lists (1901/1911/1926 only -
// the years with searchable individual-level returns; see explanatory text in the
// tab itself for why 1891/1936/1946 are excluded). Precomputed offline from the
// "Birthplace = Italy" source tables (1901/1911) and from profiled People notes
// (1926), cross-checked against the official aggregate totals used by the maps
// above (CENSUS_AGESEX / CENSUS_POST).
const CENSUS_LISTS = {"1901":{"officialNational":297,"officialByCounty":{"Antrim":72,"Armagh":1,"Carlow":0,"Cavan":1,"Clare":1,"Cork":47,"Donegal":1,"Down":3,"Dublin":130,"Fermanagh":0,"Galway":2,"Kerry":0,"Kildare":4,"Kilkenny":3,"Laois":0,"Leitrim":0,"Limerick":0,"Londonderry":1,"Longford":2,"Louth":4,"Mayo":0,"Meath":4,"Monaghan":0,"Offaly":2,"Roscommon":1,"Sligo":0,"Tipperary":2,"Tyrone":0,"Waterford":4,"Westmeath":1,"Wexford":4,"Wicklow":7},"rawTotal":267,"verifiedTotal":207,"falseTotal":60,"uncertainTotal":0,"people":[{"key":"Bosisio, Attilio (c. 1882)","name":"Attilio Bosisio","life":"c. 1882","county":"Dublin"},{"key":"Agostini, Domenick (c. 1841)","name":"Domenick Agostini","life":"c. 1841","county":"Dublin"},{"key":"Cicone, Archangel (c. 1875)","name":"Archangel Cicone","life":"c. 1875","county":"Dublin"},{"key":"Amata, Enrico (c. 1876)","name":"Enrico Amata","life":"c. 1876","county":"Dublin"},{"key":"Antino, Carlos (c. 1864)","name":"Carlos Antino","life":"c. 1864","county":"Antrim"},{"key":"Balbiani, Maddalena (c. 1872)","name":"Maddalena Balbiani","life":"c. 1872","county":"Cork"},{"key":"Bartolomucci, P (c. 1869)","name":"P Bartolomucci","life":"c. 1869","county":"Wexford"},{"key":"Bassi, Aurelio (c. 1853)","name":"Aurelio Bassi","life":"c. 1853","county":"Dublin"},{"key":"Bauer, Hermine (c. 1869)","name":"Hermine Bauer","life":"c. 1869","county":"Cork"},{"key":"Berretti, Louisa (c. 1863)","name":"Louisa Berretti","life":"c. 1863","county":"Dublin"},{"key":"Bianchi, Salvatore (c. 1875)","name":"Salvatore Bianchi","life":"c. 1875","county":"Cork"},{"key":"Borall, Louis (c. 1871)","name":"Louis Borall","life":"c. 1871","county":"Antrim"},{"key":"Borlenghi, Pietro (c. 1876)","name":"Pietro Borlenghi","life":"c. 1876","county":"Dublin"},{"key":"Brunelli, Peter (c. 1843)","name":"Peter Brunelli","life":"c. 1843","county":"Dublin"},{"key":"Buccini, Eduardo (c. 1853)","name":"Eduardo Buccini","life":"c. 1853","county":"Wicklow"},{"key":"Burgatti, John (c. 1837)","name":"John Burgatti","life":"c. 1837","county":"Dublin"},{"key":"Butterella, Senshey (c. 1876)","name":"Senshey Butterella","life":"c. 1876","county":"Cork"},{"key":"Campana, John (c. 1859)","name":"John Campana","life":"c. 1859","county":"Limerick"},{"key":"Canelli, Natale (c. 1883)","name":"Natale Canelli","life":"c. 1883","county":"Dublin"},{"key":"Caprani, Giuseppe Fedele (1839-1920)","name":"Giuseppe Fedele Caprani","life":"1839-1920","county":"Dublin"},{"key":"Captain, Dominick (c. 1871)","name":"Dominick Captain","life":"c. 1871","county":"Antrim"},{"key":"Captain, Irene J (c. 1865)","name":"Irene J Captain","life":"c. 1865","county":"Antrim"},{"key":"Captain, Christoper (c. 1855)","name":"Christoper Captain","life":"c. 1855","county":"Dublin"},{"key":"Captinio, Antonio (c. 1858)","name":"Antonio Captinio","life":"c. 1858","county":"Antrim"},{"key":"Caricanti, Raffaello (c. 1876)","name":"Raffaello Caricanti","life":"c. 1876","county":"Dublin"},{"key":"Capaldi, Giuseppe (c. 1860-1943)","name":"Giuseppe Capaldi","life":"c. 1860-1943","county":"Louth"},{"key":"Capaldi, Giovanni (c. 1888)","name":"Giovanni Capaldi","life":"c. 1888","county":"Louth"},{"key":"Capaldi, Lorenzo Orazio (c. 1886)","name":"Lorenzo Orazio Capaldi","life":"c. 1886","county":"Louth"},{"key":"Castello, Joseph (c. 1817)","name":"Joseph Castello","life":"c. 1817","county":"Dublin"},{"key":"Celesto, Borola (c. 1878)","name":"Borola Celesto","life":"c. 1878","county":"Dublin"},{"key":"Cerefice, Antonio 'Vittorio' (c. 1873)","name":"Antonio 'Vittorio' Cerefice","life":"c. 1873","county":null},{"key":"Valente (in Cirefice), Petrenilla 'Maggie' (c. 1877)","name":"Petrenilla 'Maggie' Valente","life":"c. 1877","county":null},{"key":"Cervi, Giuseppe (c. 1859-1927)","name":"Giuseppe Cervi","life":"c. 1859-1927","county":"Dublin"},{"key":"Cervi, Lorenzo (1883-1937)","name":"Lorenzo Cervi","life":"1883-1937","county":"Dublin"},{"key":"Marcantonio (in Cervi), Palma (c. 1859)","name":"Palma Marcantonio","life":"c. 1859","county":"Dublin"},{"key":"Cervi, Pietro (c. 1865-1932)","name":"Pietro Cervi","life":"c. 1865-1932","county":"Dublin"},{"key":"Cervi, Serafina (c. 1875-1936)","name":"Serafina Cervi","life":"c. 1875-1936","county":"Dublin"},{"key":"Ciappei, Pietro (c. 1857)","name":"Pietro Ciappei","life":"c. 1857","county":"Dublin"},{"key":"Ciari, Clorinda (c. 1871)","name":"Clorinda Ciari","life":"c. 1871","county":"Kilkenny"},{"key":"Colise, Vingen (c. 1865)","name":"Vingen Colise","life":"c. 1865","county":"Dublin"},{"key":"Compellia, Joseph (c. 1853)","name":"Joseph Compellia","life":"c. 1853","county":"Dublin"},{"key":"Corvini, Gustavo (c. 1836-1905)","name":"Gustavo Corvini","life":"c. 1836-1905","county":"Dublin"},{"key":"Curatolo, Dominick (c. 1874-1913)","name":"Dominick Curatolo","life":"c. 1874-1913","county":"Dublin"},{"key":"Corrieri, Louis (c. 1838 or 1845-1916)","name":"Louis Corrieri","life":"c. 1838 or 1845-1916","county":"Cork"},{"key":"D'Angelis, Leonardo (c. 1876)","name":"Leonardo D'Angelis","life":"c. 1876","county":"Dublin"},{"key":"D'Arcangelo, Francesco (c. 1875)","name":"Francesco D'Arcangelo","life":"c. 1875","county":"Dublin"},{"key":"Deghini, John (c. 1842)","name":"John Deghini","life":"c. 1842","county":"Dublin"},{"key":"Delgino, Ernea (c. 1869)","name":"Ernea Delgino","life":"c. 1869","county":"Offaly"},{"key":"De Luca, Francesco (c. 1856)","name":"Francesco De Luca","life":"c. 1856","county":"Antrim"},{"key":"Fusco (in De Luca), Giuseppina (c. 1851)","name":"Giuseppina Fusco","life":"c. 1851","county":"Antrim"},{"key":"Esposito, Francesco (c. 1851-1912)","name":"Francesco Esposito","life":"c. 1851-1912","county":"Dublin"},{"key":"Lieghio (in Di Lucia), Maria Francesca (1873)","name":"Maria Francesca Lieghio","life":"1873","county":"Antrim"},{"key":"Di Lucia, Pietro (1876)","name":"Pietro Di Lucia","life":"1876","county":"Antrim"},{"key":"Ermini, Enrico (c. 1870)","name":"Enrico Ermini","life":"c. 1870","county":"Dublin"},{"key":"Ernest, Angeli (c. 1874)","name":"Angeli Ernest","life":"c. 1874","county":"Dublin"},{"key":"Esposito, Michele (1855-1929)","name":"Michele Esposito","life":"1855-1929","county":"Dublin"},{"key":"Fargion, Domnick (c. 1867)","name":"Domnick Fargion","life":"c. 1867","county":"Antrim"},{"key":"Fautappie, Graziella (c. 1856)","name":"Graziella Fautappie","life":"c. 1856","county":"Galway"},{"key":"Forgin, John (c. 1880)","name":"John Forgin","life":"c. 1880","county":"Antrim"},{"key":"Forgione, Antonio (c. 1867)","name":"Antonio Forgione","life":"c. 1867","county":"Antrim"},{"key":"Cervi (in Forgione), Philomena (c. 1871)","name":"Philomena Cervi","life":"c. 1871","county":"Antrim"},{"key":"Forgione, Pasquale (1898)","name":"Pasquale Forgione","life":"1898","county":"Antrim"},{"key":"Forgione, John (1896)","name":"John Forgione","life":"1896","county":"Antrim"},{"key":"Forgione, Joseph (1894)","name":"Joseph Forgione","life":"1894","county":"Antrim"},{"key":"Forgione, Augustine (1892)","name":"Augustine Forgione","life":"1892","county":"Antrim"},{"key":"Forgione, Carlo (c. 1901)","name":"Carlo Forgione","life":"c. 1901","county":"Antrim"},{"key":"Forte, Alfonso Crescenzo (1864-1945)","name":"Alfonso Crescenzo Forte","life":"1864-1945","county":"Antrim"},{"key":"Forte, Domenico Giovanni Antonio (1873-1947)","name":"Domenico Giovanni Antonio Forte","life":"1873-1947","county":"Antrim"},{"key":"Forte, Angelo (1866-1934)","name":"Angelo Forte","life":"1866-1934","county":"Antrim"},{"key":"Macari (in Forte), Maria (1879)","name":"Maria Macari","life":"1879","county":"Antrim"},{"key":"Forte, Antonia (c. 1874)","name":"Antonia Forte","life":"c. 1874","county":"Antrim"},{"key":"Foster, Dominick (c. 1863)","name":"Dominick Foster","life":"c. 1863","county":"Antrim"},{"key":"Franzoni, Pietro (c. 1869)","name":"Pietro Franzoni","life":"c. 1869","county":"Dublin"},{"key":"Fusco, Dominick (c. 1856)","name":"Dominick Fusco","life":"c. 1856","county":"Antrim"},{"key":"Fusco, Raphael (c. 1851)","name":"Raphael Fusco","life":"c. 1851","county":"Dublin"},{"key":"Gagliardi, John (1895-1917)","name":"John Gagliardi","life":"1895-1917","county":"Dublin"},{"key":"Gazzi, Giacomo (c. 1882)","name":"Giacomo Gazzi","life":"c. 1882","county":"Dublin"},{"key":"Gazzi, Stefano (c. 1884)","name":"Stefano Gazzi","life":"c. 1884","county":"Dublin"},{"key":"Gerobli, Francis (c. 1871)","name":"Francis Gerobli","life":"c. 1871","county":"Dublin"},{"key":"Gillini, John (c. 1852-1921)","name":"John Gillini","life":"c. 1852-1921","county":"Dublin"},{"key":"Giulio, P De (c. 1876)","name":"P De Giulio","life":"c. 1876","county":"Wexford"},{"key":"Haag, Rosa (c. 1881)","name":"Rosa Haag","life":"c. 1881","county":"Kilkenny"},{"key":"Iaccavetti, Ganuano (c. 1879)","name":"Ganuano Iaccavetti","life":"c. 1879","county":"Antrim"},{"key":"Augustino, Michele (c. 1851-1935)","name":"Michele Augustino","life":"c. 1851-1935","county":"Dublin"},{"key":"Lonards, Joseph (c. 1876)","name":"Joseph Lonards","life":"c. 1876","county":"Antrim"},{"key":"Louro, Anthony (c. 1836)","name":"Anthony Louro","life":"c. 1836","county":"Cork"},{"key":"Cassoni (in Macari), Maria Giulia (1875)","name":"Maria Giulia Cassoni","life":"1875","county":"Antrim"},{"key":"Macari, Benedetto Alfonso (1841)","name":"Benedetto Alfonso Macari","life":"1841","county":"Antrim"},{"key":"Macari, Tommaso (1876-1962)","name":"Tommaso Macari","life":"1876-1962","county":"Antrim"},{"key":"Zuorro (in Macari), Maddalena (1846)","name":"Maddalena Zuorro","life":"1846","county":"Antrim"},{"key":"Macari, Anastasia (c. 1895)","name":"Anastasia Macari","life":"c. 1895","county":"Antrim"},{"key":"Macari, Celeste (c. 1870)","name":"Celeste Macari","life":"c. 1870","county":"Antrim"},{"key":"Macari, Marietta (c. 1874)","name":"Marietta Macari","life":"c. 1874","county":"Antrim"},{"key":"Marcantonio, Pietro (c. 1867)","name":"Pietro Marcantonio","life":"c. 1867","county":"Antrim"},{"key":"Marcella, Joseph (c. 1871)","name":"Joseph Marcella","life":"c. 1871","county":"Antrim"},{"key":"Marcello, Frank (c. 1876)","name":"Frank Marcello","life":"c. 1876","county":"Antrim"},{"key":"Marcello, Veadriga (c. 1880)","name":"Veadriga Marcello","life":"c. 1880","county":"Antrim"},{"key":"Marcennaro, Attilio (c. 1882)","name":"Attilio Marcennaro","life":"c. 1882","county":"Antrim"},{"key":"Marenghi, Antonio (c. 1885)","name":"Antonio Marenghi","life":"c. 1885","county":"Dublin"},{"key":"Marino, Domenico Antonio (c. 1856-1913)","name":"Domenico Antonio Marino","life":"c. 1856-1913","county":"Dublin"},{"key":"Marra, Lorenzo (c. 1816-1901)","name":"Lorenzo Marra","life":"c. 1816-1901","county":"Galway"},{"key":"Marsella, Carlo (c. 1881-1966)","name":"Carlo Marsella","life":"c. 1881-1966","county":"Antrim"},{"key":"Marzella, Giovanni (c. 1869)","name":"Giovanni Marzella","life":"c. 1869","county":"Antrim"},{"key":"Marzella, Vitoria (c. 1881)","name":"Vitoria Marzella","life":"c. 1881","county":"Antrim"},{"key":"Ermini (in Masson), Rosina (c. 1869)","name":"Rosina Ermini","life":"c. 1869","county":"Offaly"},{"key":"Mezza, Valentino Alfonso (c. 1857-1930)","name":"Valentino Alfonso Mezza","life":"c. 1857-1930","county":"Antrim"},{"key":"Mezza, Giuseppe (1885-1922)","name":"Giuseppe Mezza","life":"1885-1922","county":"Antrim"},{"key":"Lieghio (in Mezza), Lucia Antonia (1856-1940)","name":"Lucia Antonia Lieghio","life":"1856-1940","county":"Antrim"},{"key":"Mazzanti, Romolo (c. 1868)","name":"Romolo Mazzanti","life":"c. 1868","county":"Dublin"},{"key":"McArdy, John (c. 1873)","name":"John McArdy","life":"c. 1873","county":"Antrim"},{"key":"Meardy, Anthony (c. 1876)","name":"Anthony Meardy","life":"c. 1876","county":"Antrim"},{"key":"Meconi, Denis (c. 1845-1906)","name":"Denis Meconi","life":"c. 1845-1906","county":"Antrim"},{"key":"Meconi, Daniel (c. 1844-1909)","name":"Daniel Meconi","life":"c. 1844-1909","county":"Dublin"},{"key":"Mezza, Domenico (1860)","name":"Domenico Mezza","life":"1860","county":"Antrim"},{"key":"Forte (in Mezza), Maria Civita (1861-1911)","name":"Maria Civita Forte","life":"1861-1911","county":"Antrim"},{"key":"Morangi, John (c. 1841)","name":"John Morangi","life":"c. 1841","county":"Cork"},{"key":"Morelli, Fioredelisa (c. 1886)","name":"Fioredelisa Morelli","life":"c. 1886","county":"Dublin"},{"key":"Morelli, Luigi (c. 1877)","name":"Luigi Morelli","life":"c. 1877","county":"Dublin"},{"key":"Morrell, John (c. 1866)","name":"John Morrell","life":"c. 1866","county":"Antrim"},{"key":"Morrell, Mary (c. 1864)","name":"Mary Morrell","life":"c. 1864","county":"Antrim"},{"key":"Mosconi, Joseph (c. 1846)","name":"Joseph Mosconi","life":"c. 1846","county":"Dublin"},{"key":"Mulgraw, Josephine (c. 1881)","name":"Josephine Mulgraw","life":"c. 1881","county":"Dublin"},{"key":"Murro, Luigi (c. 1882)","name":"Luigi Murro","life":"c. 1882","county":"Antrim"},{"key":"Nicoletti, Celestino (c. 1883)","name":"Celestino Nicoletti","life":"c. 1883","county":"Dublin"},{"key":"Nicoletti, Giulio (c. 1880)","name":"Giulio Nicoletti","life":"c. 1880","county":"Dublin"},{"key":"Nicoletti, Abramo (c. 1852)","name":"Abramo Nicoletti","life":"c. 1852","county":"Dublin"},{"key":"Nockera, Francis (c. 1880)","name":"Francis Nockera","life":"c. 1880","county":"Antrim"},{"key":"Notarantonio, Antonio (c. 1881-1970)","name":"Antonio Notarantonio","life":"c. 1881-1970","county":"Antrim"},{"key":"Origano, Savino (c. 1865-1953)","name":"Savino Origano","life":"c. 1865-1953","county":"Cork"},{"key":"Pedretti (in Origano), Clelia (c. 1873-1943)","name":"Clelia Pedretti","life":"c. 1873-1943","county":"Cork"},{"key":"Origano (in Agnoli), Emma (c. 1893)","name":"Emma Origano","life":"c. 1893","county":"Cork"},{"key":"Origano, Garran (c. 1895)","name":"Garran Origano","life":"c. 1895","county":"Cork"},{"key":"Origano, Fougherad (c. 1898)","name":"Fougherad Origano","life":"c. 1898","county":"Cork"},{"key":"Origano, Raffaello Celeste Romeo (1900-1960)","name":"Raffaello Celeste Romeo Origano","life":"1900-1960","county":"Cork"},{"key":"Andritta, Gaetano (c. 1879)","name":"Gaetano Andritta","life":"c. 1879","county":"Cork"},{"key":"Orlandi, Gilles (c. 1851)","name":"Gilles Orlandi","life":"c. 1851","county":"Dublin"},{"key":"Pacelli, Francesco Antonio (c. 1869-1939)","name":"Francesco Antonio Pacelli","life":"c. 1869-1939","county":"Dublin"},{"key":"Pacelli, Vincenzo (c. 1839)","name":"Vincenzo Pacelli","life":"c. 1839","county":"Dublin"},{"key":"Pacelli, Joseph (c. 1872-1912)","name":"Joseph Pacelli","life":"c. 1872-1912","county":"Dublin"},{"key":"Pacelli, Mary Rose (c. 1841)","name":"Mary Rose Pacelli","life":"c. 1841","county":"Dublin"},{"key":"Pacini, Olindo (c. 1876)","name":"Olindo Pacini","life":"c. 1876","county":"Dublin"},{"key":"Pacini, Lucy (c. 1899)","name":"Lucy Pacini","life":"c. 1899","county":"Dublin"},{"key":"Palmieri, Benedetto (c. 1864)","name":"Benedetto Palmieri","life":"c. 1864","county":"Dublin"},{"key":"Paltrinieri, Arturs (c. 1872)","name":"Arturs Paltrinieri","life":"c. 1872","county":"Dublin"},{"key":"Di Palma, Antonio (c. 1884)","name":"Antonio Di Palma","life":"c. 1884","county":"Dublin"},{"key":"Pauls, Pslean (c. 1877)","name":"Pslean Pauls","life":"c. 1877","county":"Dublin"},{"key":"Pelosi, L (c. 1885)","name":"L Pelosi","life":"c. 1885","county":"Wexford"},{"key":"Perioli, Paul (c. 1841)","name":"Paul Perioli","life":"c. 1841","county":"Antrim"},{"key":"Peroch, Angelo (c. 1875)","name":"Angelo Peroch","life":"c. 1875","county":"Antrim"},{"key":"Pisani, Dominic (c. 1843)","name":"Dominic Pisani","life":"c. 1843","county":"Dublin"},{"key":"Pizzini, Enrico (c. 1869)","name":"Enrico Pizzini","life":"c. 1869","county":"Antrim"},{"key":"Podesta, Anthony (c. 1837-1917)","name":"Anthony Podesta","life":"c. 1837-1917","county":"Dublin"},{"key":"Polone, Giuseppe (c. 1875)","name":"Giuseppe Polone","life":"c. 1875","county":"Dublin"},{"key":"Pissale, Filline (c. 1876)","name":"Filline Pissale","life":"c. 1876","county":"Cork"},{"key":"Pinotti, Enrico (c. 1874)","name":"Enrico Pinotti","life":"c. 1874","county":"Meath"},{"key":"Quirico, Giovanni (c. 1887)","name":"Giovanni Quirico","life":"c. 1887","county":"Antrim"},{"key":"Rabaiotti, Antonio (c. 1879)","name":"Antonio Rabaiotti","life":"c. 1879","county":"Dublin"},{"key":"Loffi (in Rabaiotti), Rosina (c. 1880)","name":"Rosina Loffi","life":"c. 1880","county":"Dublin"},{"key":"Rabaiotti, Ludovico (c. 1874)","name":"Ludovico Rabaiotti","life":"c. 1874","county":"Dublin"},{"key":"Rabarath, Antoma (c. 1878)","name":"Antoma Rabarath","life":"c. 1878","county":"Dublin"},{"key":"Repetto, Angelo Giovanni (c. 1844-1922)","name":"Angelo Giovanni Repetto","life":"c. 1844-1922","county":"Dublin"},{"key":"Rissone, Eugenio (c. 1865)","name":"Eugenio Rissone","life":"c. 1865","county":"Antrim"},{"key":"Rolleri, Luigi (c. 1844-1926)","name":"Luigi Rolleri","life":"c. 1844-1926","county":"Dublin"},{"key":"Rosato, Antonio (c. 1876)","name":"Antonio Rosato","life":"c. 1876","county":"Antrim"},{"key":"Rossi, Antonio (c. 1882)","name":"Antonio Rossi","life":"c. 1882","county":"Dublin"},{"key":"Rossi, Benedetto (c. 1883)","name":"Benedetto Rossi","life":"c. 1883","county":"Dublin"},{"key":"Sacho, Alexr (c. 1874)","name":"Alexr Sacho","life":"c. 1874","county":"Antrim"},{"key":"Sacho, Mary (c. 1881)","name":"Mary Sacho","life":"c. 1881","county":"Antrim"},{"key":"Santi, Gaetano (c. 1880)","name":"Gaetano Santi","life":"c. 1880","county":"Dublin"},{"key":"Santi, Angelo (c. 1876)","name":"Angelo Santi","life":"c. 1876","county":"Dublin"},{"key":"Sargente, Filippo (c. 1875)","name":"Filippo Sargente","life":"c. 1875","county":"Dublin"},{"key":"Sargente, Luigi (c. 1873)","name":"Luigi Sargente","life":"c. 1873","county":"Dublin"},{"key":"Savino, Giuseppe (1878-1941)","name":"Giuseppe Savino","life":"1878-1941","county":"Dublin"},{"key":"Sayona, Camilla (c. 1882)","name":"Camilla Sayona","life":"c. 1882","county":"Antrim"},{"key":"Scantore, Salvatore (c. 1851-1902)","name":"Salvatore Scantore","life":"c. 1851-1902","county":"Dublin"},{"key":"Sciascia, Charles (c. 1849)","name":"Charles Sciascia","life":"c. 1849","county":"Limerick"},{"key":"Seavanni, Fulgaria (c. 1880)","name":"Fulgaria Seavanni","life":"c. 1880","county":"Dublin"},{"key":"Sessarego, Joseph (c. 1836-1922)","name":"Joseph Sessarego","life":"c. 1836-1922","county":"Cork"},{"key":"Sidoli, Lingi (c. 1883)","name":"Lingi Sidoli","life":"c. 1883","county":"Dublin"},{"key":"Silo, John (c. 1837)","name":"John Silo","life":"c. 1837","county":"Down"},{"key":"Sortore, Antamo (c. 1882)","name":"Antamo Sortore","life":"c. 1882","county":"Dublin"},{"key":"Sualtiers, Emilia (c. 1866)","name":"Emilia Sualtiers","life":"c. 1866","county":"Dublin"},{"key":"Tedesco, Rosina (c. 1864)","name":"Rosina Tedesco","life":"c. 1864","county":"Dublin"},{"key":"Tedesco, Giuseppe (c. 1857)","name":"Giuseppe Tedesco","life":"c. 1857","county":"Dublin"},{"key":"Traggenti, Pasquale (c. 1866)","name":"Pasquale Traggenti","life":"c. 1866","county":null},{"key":"Vergatti (in Traggenti), Mary (c. 1878-1903)","name":"Mary Vergatti","life":"c. 1878-1903","county":null},{"key":"Valente, Domenico (c. 1880)","name":"Domenico Valente","life":"c. 1880","county":"Dublin"},{"key":"Valente, G. Giacinto (c. 1878)","name":"G. Giacinto Valente","life":"c. 1878","county":"Dublin"},{"key":"Valente, Maria Carmina (c. 1873-1913)","name":"Maria Carmina Valente","life":"c. 1873-1913","county":"Antrim"},{"key":"Valente, Luigi (c. 1838-1909)","name":"Luigi Valente","life":"c. 1838-1909","county":"Antrim"},{"key":"Valenti, Lucy (c. 1850)","name":"Lucy Valenti","life":"c. 1850","county":"Antrim"},{"key":"Valerio, Anthony (c. 1858-1925)","name":"Anthony Valerio","life":"c. 1858-1925","county":"Dublin"},{"key":"Valerio, Peter (c. 1846-1903)","name":"Peter Valerio","life":"c. 1846-1903","county":"Dublin"},{"key":"Valenti, Domenico (c. 1857)","name":"Domenico Valenti","life":"c. 1857","county":"Antrim"},{"key":"Capitano (in Valenti), Theresa (c. 1865)","name":"Theresa Capitano","life":"c. 1865","county":"Antrim"},{"key":"Venencia, Peter (c. 1841-1922)","name":"Peter Venencia","life":"c. 1841-1922","county":"Dublin"},{"key":"Venosi, Francesco (c. 1875)","name":"Francesco Venosi","life":"c. 1875","county":"Dublin"},{"key":"Viacava, Orlando (c. 1855)","name":"Orlando Viacava","life":"c. 1855","county":"Cork"},{"key":"Viviano, Attilio (c. 1846)","name":"Attilio Viviano","life":"c. 1846","county":"Dublin"}],"notYetProfiled":[{"name":"Bassi, Louis"},{"name":"Bassi, Virglow"},{"name":"Bassi, Joseph"},{"name":"Cervi, Mary"},{"name":"Fulignati, Querino"},{"name":"Marchetti, Louie"},{"name":"Rosata, Carmina"},{"name":"Rosata, Maria"}],"falseList":[{"name":"Arday Von, Louise","note":"Governess of the family de Poher de la Poer","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Waterford/Gurteen/Gurteen_Lower/1769489/","censusYear":"1901"},{"name":"Armstrong, Margaret","note":"Church of Ireland","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Armagh/Armagh_Rural/Corporation/1009381/","censusYear":"1901"},{"name":"B. M.","note":"Solo iniziali (\"B. M.\") nel registro del Richmond Asylum/Grangegorman Annex Asylum; Church of Ireland; occupazione Ladies Maid ma nessuna relazione familiare registrata (probabile ricoverata). Impossibile identificare cognome e verificare origine italiana con certezza.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"B. A.","note":"Solo iniziali (\"B. A.\"), Housekeeper a Shanganagh, Killiney; nessuna relazione familiare registrata. Nonostante la religione cattolica, impossibile verificare l'identità e l'origine italiana con certezza senza il nome completo.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Barton, Agnes A. T.","note":"Church of Ireland, Land Owner and labour Employer","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Wicklow/Glendalough/Drummin/1812581/","censusYear":"1901"},{"name":"Bouvier, Annetta","note":"Cognome Bouvier; probabilmente collegata alla famiglia Bouvier già esclusa altrove nella tabella (cfr. nota su Smyth, Virginie P. e Bouvier, Michael, vine grower, già segnati F come francesi non italiani). Matron and Housekeeper non sposata a Bray, chiesa Valdese.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Braddell, Minnie","note":"Cognome Braddell, inglese; Church of Ireland; moglie, nessuna occupazione propria; nata in Italia probabilmente per soggiorno/residenza della famiglia; non sembra italiana.","birthPlace":"Italia probabilmente per soggio","censusUrl":null,"censusYear":"1901"},{"name":"Butler, Issabella","note":"Cognome Butler, famiglia anglo-normanna/irlandese storica; moglie, nessuna occupazione propria; cattolica ma non sembra italiana nonostante la nascita in Italia.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Coppinger, Thomas S.","note":"Non sembra sia italiano","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Cotter, Mary Susanna","note":"Church of Ireland, School Teacher","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Dublin/South_Dock/Clanwilliam_Place/1350524/","censusYear":"1901"},{"name":"Cotter, Joseph R.","note":"Church of Ireland, studente al Trinity College; non sembra italiano nonostante la nascita in Italia.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Cotter, S. M. Josephine","note":"Church of Ireland, insegnante; non sembra italiana nonostante la nascita in Italia.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Cusack, James William Henry Claud","note":"Major in Army","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Dublin/Kinsealy/Abbeyville/1266173/","censusYear":"1901"},{"name":"Dolmage, Cecil G.","note":"Church of Ireland, nato a Napoli (\"Haples\"); barrister; fratello di Dolmage, John S. (riga 72); famiglia anglo-irlandese, non sembra italiana.","birthPlace":"Napoli","censusUrl":null,"censusYear":"1901"},{"name":"Dolmage, John S.","note":"Church of Ireland, nato a Sorrento; disoccupato; fratello di Dolmage, Cecil G. (riga 71); famiglia anglo-irlandese, non sembra italiana.","birthPlace":"Sorrento","censusUrl":null,"censusYear":"1901"},{"name":"Doyne, Annette","note":"Church of Ireland, sorella (del capofamiglia), nessuna occupazione; non sembra italiana nonostante la nascita in Italia.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Du Part, Paul","note":"Coachman, Domestic Servant. The surname is French.","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Cavan/Castlerahan/Enagh/1051724/","censusYear":"1901"},{"name":"Edgeworth, Andrew E.","note":"probably a noble descendant from [Richard Lovell Edgeworth](https://en.wikipedia.org/wiki/Richard_Lovell_Edgeworth)","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Longford/Edgeworthstown/Edgeworthstown/1551421/","censusYear":"1901"},{"name":"Festu, Ellen","note":"Vedi 1911","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Gardon, Evelyn Mary","note":"Church of England, Governess.","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Cork/Kinsale_Urban/Fisher_Street/1122381/","censusYear":"1901"},{"name":"Ginnary, Persid","note":"French Governess, French Protestant Church; non sembra italiana, nata in Italia probabilmente per il servizio come governante presso una famiglia (cfr. altre governanti già escluse: Arday Von, Louise; Gardon, Evelyn Mary).","birthPlace":"Italia probabilmente per il ser","censusUrl":null,"censusYear":"1901"},{"name":"Goold Whitta, Barbara","note":"Church of Ireland, \"Gentlewoman\", Visitor (ospite) a Quinville North, Clare; non sembra italiana.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Greene, Alfred","note":"Church of Ireland, laureato del Trinity College Dublin, boarder; non sembra italiano.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Griffith, Agnes","note":"Sono tutti nati in giro e sono pure protestanti","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Dublin/Glasnevin/Bengal_Terrace/1272954/","censusYear":"1901"},{"name":"Guy, Gaston Gallins","note":"Nome Gaston (francese), Butler Domestic Servant; verosimilmente domestico francese nato in Italia per caso, come già notato per Du Part, Paul.","birthPlace":"Italia per caso","censusUrl":null,"censusYear":"1901"},{"name":"Hamilton Temple-Blackwood, Frederick Temple","note":"[Irish nobility](https://en.wikipedia.org/wiki/Frederick_Hamilton-Temple-Blackwood,_1st_Marquess_of_Dufferin_and_Ava)","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Down/Bangor/Ballyleedy/1252122/","censusYear":"1901"},{"name":"Heard, K. Fierenza V. Serbath","note":"Church of Ireland and daughter of Richarrd Charles Pratt","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Cork/Kinsale_Urban/Fisher_Street/1122381/","censusYear":"1901"},{"name":"Heaton-Armstrong, Charles","note":"land agent, church of Ireland","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Limerick/Dock_Limerick_Urban_No__4/Georges_Street/1501608/","censusYear":"1901"},{"name":"Hopkins, Isbella S. R.","note":"church of Ireland, house wife","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Louth/Westgate__Drogheda_No__3_/John_Street/1569330/","censusYear":"1901"},{"name":"Hurford, Mabel","note":"Church of England, moglie, nessuna occupazione propria; non sembra italiana.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Jackson, C. Roma Sadlier","note":"Church of England, nata a Roma (nome \"C. Roma Sadlier\" verosimilmente in ricordo del luogo di nascita); famiglia anglo-irlandese, non sembra italiana.","birthPlace":"Roma","censusUrl":null,"censusYear":"1901"},{"name":"Jones, Gilbert","note":"Church of Ireland, landowner/ex ufficiale dell'esercito, capofamiglia; non sembra italiano.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"King Harman, Wentworth Henry","note":"Church of Ireland, \"Landed Proprietor Colonel Retired\"; famiglia aristocratica anglo-irlandese (King Harman); non sembra italiano.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Knox, C. T. Florence","note":"Church of England","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Dublin/Glasthule/Glenegeary_Road/1321480/","censusYear":"1901"},{"name":"Lambin, John","note":"difficile sia italiano ma non sai nulla","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Waterford/Waterford_No__1_Urban/Ballybricken_Green/1761118/","censusYear":"1901"},{"name":"Loughrey, Fanny","note":"figlia di [Hughes, Edward](https://www.irishgenealogy.ie/view/?record_id=cima-2706276) un contadino che sembra irlandese","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Donegal/Straid/Binnion/1183910/","censusYear":"1901"},{"name":"Marken, John","note":"St Anne Church of Ireland, confectioner, capofamiglia; cognome non chiaramente italiano; non sembra italiano nonostante l'occupazione compatibile con il commercio dolciario italiano.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Mitchell, Thomas","note":"Non sembra italiano","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Monahan, Margaret Agnes","note":"Church of Ireland, \"Income Derived\" (rendita), capofamiglia; non sembra italiana.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Moneypenny, Rudolf ?","note":"figlio di [[Moneypenny, John]] nessuno è italiano e sono pure lavoratori semplici.","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Dublin/Mountjoy/Ballybough_Road/1322733/","censusYear":"1901"},{"name":"Moore, Jane","note":"difficile da capire perché è nata a Genova ma è protestante","birthPlace":"Genova ma è protestante","censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Cork/Kilworth/Ballyderown/1145757/","censusYear":"1901"},{"name":"Murray, Eliza","note":"Cognome Murray (scozzese/irlandese), moglie, nessuna occupazione propria, Down; figliastra Tarney-Archer, Vera Constance (riga 245) nella stessa casa; non sembra italiana nonostante la religione cattolica.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Murray, Wm Craig","note":"Church of Ireland, stock broker, capofamiglia a Kingstown; nucleo familiare distinto dagli altri Murray della tabella; non sembra italiano.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"O'Kelly, Bernard","note":"Cognome O'Kelly, chiaramente gaelico irlandese; scholar, figlio; non sembra italiano nonostante la nascita in Italia e la religione cattolica (verosimile soggiorno familiare, es. educazione a Roma).","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"O'Mahony, Nino","note":"Cognome O'Mahony, gaelico irlandese; medical student, figlio. Nome proprio \"Nino\" è italiano — possibile legame italiano (madre?) da verificare in futuro con ricerche esterne; per ora non abbastanza per considerarlo italiano.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Power, Margaret","note":"Cognome Power (le Poer), famiglia anglo-normanna storica di Waterford (cfr. governante della famiglia de Poher de la Poer già esclusa altrove); general servant, figlia; non sembra italiana.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Power Lalor, George","note":"Cognome Power Lalor, famiglia fondiaria anglo-irlandese del Tipperary; non sembra italiana nonostante la religione cattolica.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Ribton, Roselia","note":"Difficile da capire, ma è presbiteriana","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Wicklow/Bray/Brighton_Terrace/1811743/","censusYear":"1901"},{"name":"Rise, Pepipins","note":"Chiesa Greca (Greco-Ortodossa); verosimilmente famiglia greca residente in Italia; non sembra italiana.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Roden, William Henry","note":"Church of Ireland, \"Retd Capt R.N.\", capofamiglia; famiglia aristocratica anglo-irlandese (Roden); non sembra italiano.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Rules, Alexander","note":"Church of Ireland, Chimney Sweep","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Antrim/Court_Ward/Conlon_Street/964178/","censusYear":"1901"},{"name":"Smyth, Virginie P.","note":"figlia di [[Bouvier, Michael]], vine grower. Nata probabilmente in Italia per caso. Si sposa con [[Smyth, Isaac]] nel [1881](https://www.irishgenealogy.ie/view/?record_id=cima-2694920) hai anche [l'atto religioso](https://www.irishgenealogy.ie/view/?record_id=25f2196b3b-1983). Non sembra italiana","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Dublin/New_Kilmainham/Alpine_Terrace/1289580/","censusYear":"1901"},{"name":"St Leger Carter, Harrietta","note":"improbabile sia italiana","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Cork/Aghinagh/Carrigadrohid/1125163/","censusYear":"1901"},{"name":"Tarney-Archer, Vera Constance","note":"Figliastra di Murray, Eliza (riga 171); cognome Tarney-Archer, inglese; non sembra italiana.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Thomhill, Leonard","note":"Church of England, \"Private Means Dividends Etc\", capofamiglia; cognome inglese (Thornhill); non sembra italiano.","birthPlace":null,"censusUrl":null,"censusYear":"1901"},{"name":"Thorold, Mary","note":"Church of Ireland, Income from Land and Investment, [grave](https://www.findagrave.com/memorial/193624241/mary-elizabeth-thorold)","birthPlace":null,"censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Kildare/Donaghcumper/Donaghcumper/1436659/","censusYear":"1901"},{"name":"Tremayne, William Francis","note":"Captain R.O.O. born in Italy","birthPlace":"Italy","censusUrl":"https://www.census.nationalarchives.ie/pages/1901/Kildare/Ballymore_Eustace/Briencan/1439311/","censusYear":"1901"},{"name":"Wallace, Donald C.","note":"Presbyterian born in Italy and what seems to be his father is also Presbyterian and a clergyman born in Belfast","birthPlace":"Italy and what seems to be his","censusUrl":"https://census.nationalarchives.ie/pages/1901/Antrim/Cromac/Rugby_Avenue/971121/","censusYear":"1901"},{"name":"Webber-Gardiner,  John Theodare","note":"not Italian","birthPlace":null,"censusUrl":"https://census.nationalarchives.ie/pages/1901/Wicklow/Ballycullen/Tiglin_South/1812337/","censusYear":"1901"},{"name":"Wilbraham, Marian","note":"not italian","birthPlace":null,"censusUrl":"https://census.nationalarchives.ie/pages/1901/Mayo/Westport_Urban/Westport_Demesne/1608147/","censusYear":"1901"}]},"1911":{"officialNational":417,"officialByCounty":{"Antrim":157,"Armagh":5,"Carlow":0,"Cavan":0,"Clare":0,"Cork":17,"Donegal":2,"Down":21,"Dublin":146,"Fermanagh":2,"Galway":0,"Kerry":3,"Kildare":3,"Kilkenny":4,"Laois":2,"Leitrim":0,"Limerick":4,"Londonderry":15,"Longford":1,"Louth":2,"Mayo":0,"Meath":4,"Monaghan":0,"Offaly":0,"Roscommon":4,"Sligo":1,"Tipperary":4,"Tyrone":10,"Waterford":3,"Westmeath":0,"Wexford":4,"Wicklow":3},"rawTotal":386,"verifiedTotal":345,"falseTotal":39,"uncertainTotal":2,"people":[{"key":"XXX (c. 1891)","name":"XXX","life":"c. 1891","county":"Dublin"},{"key":"Pizzorno, Josephine (c. 1861)","name":"Josephine Pizzorno","life":"c. 1861","county":"Dublin"},{"key":"Agostina, Dominick (c. 1845)","name":"Dominick Agostina","life":"c. 1845","county":"Dublin"},{"key":"Augustino, Michele (c. 1851-1935)","name":"Michele Augustino","life":"c. 1851-1935","county":"Dublin"},{"key":"Ambruzzi, Luigi (c. 1882)","name":"Luigi Ambruzzi","life":"c. 1882","county":"Dublin"},{"key":"Ammonette, Ernest (c. 1884)","name":"Ernest Ammonette","life":"c. 1884","county":"Kerry"},{"key":"Anthony, Louis (c. 1867)","name":"Louis Anthony","life":"c. 1867","county":"Kerry"},{"key":"Antonio, James (c. 1848)","name":"James Antonio","life":"c. 1848","county":"Meath"},{"key":"Anzani, Gustavus (c. 1876)","name":"Gustavus Anzani","life":"c. 1876","county":"Dublin"},{"key":"Armadori, Stefano (c. 1893)","name":"Stefano Armadori","life":"c. 1893","county":"Antrim"},{"key":"Avaldi, Luigi (c. 1896)","name":"Luigi Avaldi","life":"c. 1896","county":"Dublin"},{"key":"Bachini, Altidoro (c. 1886)","name":"Altidoro Bachini","life":"c. 1886","county":"Dublin"},{"key":"Balma, Michele (c. 1892)","name":"Michele Balma","life":"c. 1892","county":"Dublin"},{"key":"Bardini, Angelo (c. 1886)","name":"Angelo Bardini","life":"c. 1886","county":"Fermanagh"},{"key":"Basini, Albino (c. 1879)","name":"Albino Basini","life":"c. 1879","county":"Dublin"},{"key":"Bassi, Aurelio (c. 1853)","name":"Aurelio Bassi","life":"c. 1853","county":"Dublin"},{"key":"Bastardi, Lorenzo (c. 1879)","name":"Lorenzo Bastardi","life":"c. 1879","county":"Antrim"},{"key":"Bastogi, Peter (c. 1879)","name":"Peter Bastogi","life":"c. 1879","county":"Wicklow"},{"key":"Prenchette, John (c. 1887)","name":"John Prenchette","life":"c. 1887","county":"Down"},{"key":"Bertarelli, Pietro (c. 1892)","name":"Pietro Bertarelli","life":"c. 1892","county":"Dublin"},{"key":"Biagioni, Giuseppe (c. 1874)","name":"Giuseppe Biagioni","life":"c. 1874","county":"Down"},{"key":"Biagioni, Lucia (c. 1867)","name":"Lucia Biagioni","life":"c. 1867","county":"Down"},{"key":"Bonsfred, Bertrem Sydney (c. 1883)","name":"Bertrem Sydney Bonsfred","life":"c. 1883","county":"Tyrone"},{"key":"Bonugli, Nicholas (c. 1892)","name":"Nicholas Bonugli","life":"c. 1892","county":"Antrim"},{"key":"Bonugli, Fedeli (c. 1877)","name":"Fedeli Bonugli","life":"c. 1877","county":"Londonderry"},{"key":"Bonutto, John (c. 1856)","name":"John Bonutto","life":"c. 1856","county":"Antrim"},{"key":"Borelli, Juliet (c. 1890)","name":"Juliet Borelli","life":"c. 1890","county":"Dublin"},{"key":"Borza, Pasquale (1846)","name":"Pasquale Borza","life":"1846","county":"Antrim"},{"key":"Borza, Luigi (1882-1969)","name":"Luigi Borza","life":"1882-1969","county":"Antrim"},{"key":"Borza, Ottavio (c. 1880)","name":"Ottavio Borza","life":"c. 1880","county":"Down"},{"key":"Borza, Domenico (c. 1889)","name":"Domenico Borza","life":"c. 1889","county":"Antrim"},{"key":"Borza, Donato (c. 1884)","name":"Donato Borza","life":"c. 1884","county":"Antrim"},{"key":"Bosco, Achille (c. 1860)","name":"Achille Bosco","life":"c. 1860","county":"Dublin"},{"key":"Brenni, Giovanni (c. 1891)","name":"Giovanni Brenni","life":"c. 1891","county":"Londonderry"},{"key":"C., L. (c. 1883)","name":"L. C.","life":"c. 1883","county":"Dublin"},{"key":"Caffolio, Joseph (c. 1892)","name":"Joseph Caffolio","life":"c. 1892","county":"Down"},{"key":"Cafolla, Tommaso (1878)","name":"Tommaso Cafolla","life":"1878","county":"Armagh"},{"key":"Colella (in Cafolla), Benedetta (1883)","name":"Benedetta Colella","life":"1883","county":"Armagh"},{"key":"Campana, John (c. 1859)","name":"John Campana","life":"c. 1859","county":"Cork"},{"key":"Campelli, Joseph (c. 1852)","name":"Joseph Campelli","life":"c. 1852","county":"Armagh"},{"key":"Campi, Esther (c. 1876)","name":"Esther Campi","life":"c. 1876","county":"Cork"},{"key":"Capaldi, Giuseppe (c. 1860-1943)","name":"Giuseppe Capaldi","life":"c. 1860-1943","county":"Dublin"},{"key":"Tedesco (in Capaldi), Maria Giuseppa (c. 1862-1931)","name":"Maria Giuseppa Tedesco","life":"c. 1862-1931","county":"Dublin"},{"key":"Capaldi, Lorenzo Orazio (c. 1886)","name":"Lorenzo Orazio Capaldi","life":"c. 1886","county":"Dublin"},{"key":"Capaldi, Giovanni (c. 1888)","name":"Giovanni Capaldi","life":"c. 1888","county":"Dublin"},{"key":"Capaldi (in Macari), Michelina Angela (1896-1982)","name":"Michelina Angela Capaldi","life":"1896-1982","county":"Dublin"},{"key":"Capaldi, Antonetta (c. 1892)","name":"Antonetta Capaldi","life":"c. 1892","county":"Dublin"},{"key":"Capali, Alexandra (c. 1844)","name":"Alexandra Capali","life":"c. 1844","county":"Antrim"},{"key":"Capatain, Antony (c. 1857)","name":"Antony Capatain","life":"c. 1857","county":"Antrim"},{"key":"Capitanio, Dominick (c. 1860-1913)","name":"Dominick Capitanio","life":"c. 1860-1913","county":"Antrim"},{"key":"Capitanio, Eirena (c. 1850)","name":"Eirena Capitanio","life":"c. 1850","county":"Antrim"},{"key":"Caprani, Giuseppe Fedele (1839-1920)","name":"Giuseppe Fedele Caprani","life":"1839-1920","county":"Dublin"},{"key":"Caproni, Enrico (c. 1869)","name":"Enrico Caproni","life":"c. 1869","county":"Down"},{"key":"Caproni, Mary (c. 1893)","name":"Mary Caproni","life":"c. 1893","county":"Down"},{"key":"Carri, John (c. 1832)","name":"John Carri","life":"c. 1832","county":"Tipperary"},{"key":"Casele, Orazio (c. 1891)","name":"Orazio Casele","life":"c. 1891","county":"Dublin"},{"key":"Cassine, Louis (c. 1847)","name":"Louis Cassine","life":"c. 1847","county":"Tipperary"},{"key":"Caulfield, Antonio (c. 1883)","name":"Antonio Caulfield","life":"c. 1883","county":"Antrim"},{"key":"Caulfield, Maggie (c. 1885)","name":"Maggie Caulfield","life":"c. 1885","county":"Antrim"},{"key":"Caulfield, Charles (c. 1894)","name":"Charles Caulfield","life":"c. 1894","county":"Antrim"},{"key":"Causewell, Peter (c. 1841)","name":"Peter Causewell","life":"c. 1841","county":"Dublin"},{"key":"Cerefice, Antonio 'Vittorio' (c. 1873)","name":"Antonio 'Vittorio' Cerefice","life":"c. 1873","county":null},{"key":"Valente (in Cirefice), Petrenilla 'Maggie' (c. 1877)","name":"Petrenilla 'Maggie' Valente","life":"c. 1877","county":null},{"key":"Ceuseppe, Vella (c. 1865)","name":"Vella Ceuseppe","life":"c. 1865","county":"Tyrone"},{"key":"Chauvie, Leony (c. 1891)","name":"Leony Chauvie","life":"c. 1891","county":"Dublin"},{"key":"Cervi, Pietro (c. 1865-1932)","name":"Pietro Cervi","life":"c. 1865-1932","county":"Dublin"},{"key":"Cervi, Serafina (c. 1875-1936)","name":"Serafina Cervi","life":"c. 1875-1936","county":"Dublin"},{"key":"Cervi, Giuseppe (c. 1859-1927)","name":"Giuseppe Cervi","life":"c. 1859-1927","county":"Dublin"},{"key":"Marcantonio (in Cervi), Palma (c. 1859)","name":"Palma Marcantonio","life":"c. 1859","county":"Dublin"},{"key":"Cervi, Lorenzo (1883-1937)","name":"Lorenzo Cervi","life":"1883-1937","county":"Dublin"},{"key":"Cervi, Mary (1889-1971)","name":"Mary Cervi","life":"1889-1971","county":null},{"key":"Chevers, Margaret Louisa (c. 1845)","name":"Margaret Louisa Chevers","life":"c. 1845","county":"Dublin"},{"key":"Chichiel, Joseph (c. 1873)","name":"Joseph Chichiel","life":"c. 1873","county":"Antrim"},{"key":"Ciari, Clorinda (c. 1871)","name":"Clorinda Ciari","life":"c. 1871","county":"Kilkenny"},{"key":"Clerico, Francisco (c. 1885)","name":"Francisco Clerico","life":"c. 1885","county":"Dublin"},{"key":"Cobia, Maria M (c. 1876)","name":"Maria M Cobia","life":"c. 1876","county":"Roscommon"},{"key":"Colaluca, Francesco (c. 1865)","name":"Francesco Colaluca","life":"c. 1865","county":"Antrim"},{"key":"Colleto, Vincenzo (c. 1884)","name":"Vincenzo Colleto","life":"c. 1884","county":"Antrim"},{"key":"Compodonnico, Giovanni (c. 1844)","name":"Giovanni Compodonnico","life":"c. 1844","county":"Laois"},{"key":"Concourde, Adelina (c. 1887)","name":"Adelina Concourde","life":"c. 1887","county":"Dublin"},{"key":"Consolozione, Maria (c. 1868)","name":"Maria Consolozione","life":"c. 1868","county":"Roscommon"},{"key":"Coppola, Savadonia (c. 1856)","name":"Savadonia Coppola","life":"c. 1856","county":"Dublin"},{"key":"Corbella, Luigi (c. 1881)","name":"Luigi Corbella","life":"c. 1881","county":"Waterford"},{"key":"Corrieri, Leopoldo Manuel 'Hubert' (c. 1879)","name":"Leopoldo Manuel 'Hubert' Corrieri","life":"c. 1879","county":"Dublin"},{"key":"Correri, Guido (c. 1893)","name":"Guido Correri","life":"c. 1893","county":"Dublin"},{"key":"Cropera, Alberto (c. 1882)","name":"Alberto Cropera","life":"c. 1882","county":"Limerick"},{"key":"Cuatrella, Guatano (c. 1879)","name":"Guatano Cuatrella","life":"c. 1879","county":"Antrim"},{"key":"Cumins, Aldmira (c. 1894)","name":"Aldmira Cumins","life":"c. 1894","county":"Dublin"},{"key":"D., A. (c. 1853)","name":"A. D.","life":"c. 1853","county":"Dublin"},{"key":"Dadomo, Dante (c. 1891)","name":"Dante Dadomo","life":"c. 1891","county":"Dublin"},{"key":"Deghini, John Di (c. 1843)","name":"John Di Deghini","life":"c. 1843","county":"Dublin"},{"key":"Delicato, Benedetto (1872)","name":"Benedetto Delicato","life":"1872","county":"Antrim"},{"key":"Forte (in Delicato), Maria Antonia (c. 1868)","name":"Maria Antonia Forte","life":"c. 1868","county":"Antrim"},{"key":"Delicato, Giuseppe Domenico (1894-1917)","name":"Giuseppe Domenico Delicato","life":"1894-1917","county":"Antrim"},{"key":"Delicato, Domenico (c. 1898-1947)","name":"Domenico Delicato","life":"c. 1898-1947","county":"Antrim"},{"key":"De Luca, Francesco (c. 1856)","name":"Francesco De Luca","life":"c. 1856","county":"Antrim"},{"key":"Fusco (in De Luca), Giuseppina (c. 1851)","name":"Giuseppina Fusco","life":"c. 1851","county":"Antrim"},{"key":"Dennierco, John (c. 1886)","name":"John Dennierco","life":"c. 1886","county":"Down"},{"key":"Desano, James 'Sammy' Pasqualino (c. 1888-1951)","name":"James 'Sammy' Pasqualino Desano","life":"c. 1888-1951","county":"Antrim"},{"key":"Despeosito, Franck (c. 1852)","name":"Franck Despeosito","life":"c. 1852","county":null},{"key":"Devito, Peter (c. 1873)","name":"Peter Devito","life":"c. 1873","county":"Antrim"},{"key":"Devito, Mary (c. 1871)","name":"Mary Devito","life":"c. 1871","county":"Antrim"},{"key":"Du Prat, Paul (c. 1865)","name":"Paul Du Prat","life":"c. 1865","county":"Kildare"},{"key":"Ceresa, Battista (c. 1879)","name":"Battista Ceresa","life":"c. 1879","county":"Meath"},{"key":"Esposito, Michele (1855-1929)","name":"Michele Esposito","life":"1855-1929","county":"Dublin"},{"key":"Bianchi, Etilglio (c. 1887)","name":"Etilglio Bianchi","life":"c. 1887","county":"Dublin"},{"key":"Ferrari, Evaristo (c. 1891)","name":"Evaristo Ferrari","life":"c. 1891","county":"Dublin"},{"key":"Fantappie, Graziella (c. 1866-1920)","name":"Graziella Fantappie","life":"c. 1866-1920","county":"Galway"},{"key":"Fantone, Berta (c. 1877)","name":"Berta Fantone","life":"c. 1877","county":"Louth"},{"key":"Farina, Raphael (c. 1886-1944)","name":"Raphael Farina","life":"c. 1886-1944","county":"Dublin"},{"key":"Ferrari, Pietro (c. 1883)","name":"Pietro Ferrari","life":"c. 1883","county":"Dublin"},{"key":"Filose, Miriam (c. 1893)","name":"Miriam Filose","life":"c. 1893","county":"Dublin"},{"key":"Forgione, John (c. 1879)","name":"John Forgione","life":"c. 1879","county":"Antrim"},{"key":"Forgione, Antonio (c. 1867)","name":"Antonio Forgione","life":"c. 1867","county":"Antrim"},{"key":"Cervi (in Forgione), Philomena (c. 1871)","name":"Philomena Cervi","life":"c. 1871","county":"Antrim"},{"key":"Forgione, Dominick (c. 1870)","name":"Dominick Forgione","life":"c. 1870","county":"Antrim"},{"key":"Forte, Angelo (1866-1934)","name":"Angelo Forte","life":"1866-1934","county":"Antrim"},{"key":"Macari (in Forte), Maria (1879)","name":"Maria Macari","life":"1879","county":"Antrim"},{"key":"Forte, Domenico Antonio (1870)","name":"Domenico Antonio Forte","life":"1870","county":"Antrim"},{"key":"Forte, Domenico Giovanni Antonio (1873-1947)","name":"Domenico Giovanni Antonio Forte","life":"1873-1947","county":"Antrim"},{"key":"Forte, Pancrazio (1851-1940)","name":"Pancrazio Forte","life":"1851-1940","county":"Antrim"},{"key":"Cecchini (in Forte), Maria Maddalena (1858-1941)","name":"Maria Maddalena Cecchini","life":"1858-1941","county":"Antrim"},{"key":"Forte (in Forte), Pasqualina (1890-1930)","name":"Pasqualina Forte","life":"1890-1930","county":"Antrim"},{"key":"Forte, Alfonso (1863-1938)","name":"Alfonso Forte","life":"1863-1938","county":"Down"},{"key":"Forte (in Forte), Rosa (1869-1939)","name":"Rosa Forte","life":"1869-1939","county":"Down"},{"key":"Forte, Thomas (c. 1889)","name":"Thomas Forte","life":"c. 1889","county":"Down"},{"key":"Forte, Pietro (1853-1928)","name":"Pietro Forte","life":"1853-1928","county":"Antrim"},{"key":"Forte (in Forte), Maria Filomena (1864-1935)","name":"Maria Filomena Forte","life":"1864-1935","county":"Antrim"},{"key":"Forte, Antonio (1882-1936)","name":"Antonio Forte","life":"1882-1936","county":"Antrim"},{"key":"Forte, Antonio (1876-1938)","name":"Antonio Forte","life":"1876-1938","county":"Antrim"},{"key":"Forte, Carmine (1884-1963)","name":"Carmine Forte","life":"1884-1963","county":"Antrim"},{"key":"Forte, Libero (1885-1942)","name":"Libero Forte","life":"1885-1942","county":"Antrim"},{"key":"Forte, Orazio (1893-1925)","name":"Orazio Forte","life":"1893-1925","county":"Antrim"},{"key":"Forte, Peter (c. 1889)","name":"Peter Forte","life":"c. 1889","county":"Antrim"},{"key":"Forte, Carmel (c. 1889)","name":"Carmel Forte","life":"c. 1889","county":"Antrim"},{"key":"Forth, Forte (c. 1887)","name":"Forte Forth","life":"c. 1887","county":"Antrim"},{"key":"Fulignati, Querino (c. 1876)","name":"Querino Fulignati","life":"c. 1876","county":"Cork"},{"key":"Fusciardi, Giuseppe (1874-1939)","name":"Giuseppe Fusciardi","life":"1874-1939","county":"Antrim"},{"key":"Magliocco (in Fusciardi), Emilia (1879-1927)","name":"Emilia Magliocco","life":"1879-1927","county":"Antrim"},{"key":"Fusciardi, Ovidio Armando (1900-1962)","name":"Ovidio Armando Fusciardi","life":"1900-1962","county":"Antrim"},{"key":"Fusciardi, Pace (c. 1903)","name":"Pace Fusciardi","life":"c. 1903","county":"Antrim"},{"key":"Macari (in Fusco), Filomena (1881)","name":"Filomena Macari","life":"1881","county":"Antrim"},{"key":"Fusco, Gerardo (1882-1960)","name":"Gerardo Fusco","life":"1882-1960","county":"Antrim"},{"key":"Borza (in Fusco, in Marsella), Caterina (1884-1960)","name":"Caterina Borza","life":"1884-1960","county":"Antrim"},{"key":"Fusco, Dominick (c. 1856)","name":"Dominick Fusco","life":"c. 1856","county":"Antrim"},{"key":"Fusco, Pasquale (1882-1918)","name":"Pasquale Fusco","life":"1882-1918","county":"Antrim"},{"key":"Magliocco (in Fusco in Lodola), Maria Pasqualina (1884-1947)","name":"Maria Pasqualina Magliocco","life":"1884-1947","county":"Antrim"},{"key":"Fusco, Gaetano Fortunato (1872)","name":"Gaetano Fortunato Fusco","life":"1872","county":"Down"},{"key":"Fusco, Vittorio Alberto (1874-1948)","name":"Vittorio Alberto Fusco","life":"1874-1948","county":"Antrim"},{"key":"Fusco, Giuseppe (1879)","name":"Giuseppe Fusco","life":"1879","county":"Antrim"},{"key":"Forte (in Fusco), Maria Civita (1879-1963)","name":"Maria Civita Forte","life":"1879-1963","county":"Antrim"},{"key":"Fusco, Pietro (1877-1947)","name":"Pietro Fusco","life":"1877-1947","county":"Antrim"},{"key":"Forte (in Fusco), Alessandra (1879-1960)","name":"Alessandra Forte","life":"1879-1960","county":"Antrim"},{"key":"Gagliardi, Joseph (c. 1861-1929)","name":"Joseph Gagliardi","life":"c. 1861-1929","county":"Dublin"},{"key":"Gallo, Etienne (c. 1878)","name":"Etienne Gallo","life":"c. 1878","county":"Kildare"},{"key":"Gargano, Pietro (c. 1853)","name":"Pietro Gargano","life":"c. 1853","county":"Antrim"},{"key":"Diplacito (in Gargano), Felicita (c. 1875)","name":"Felicita Diplacito","life":"c. 1875","county":"Antrim"},{"key":"Gargano, Vincent (c. 1886)","name":"Vincent Gargano","life":"c. 1886","county":"Antrim"},{"key":"Gargano, Palmar (c. 1896)","name":"Palmar Gargano","life":"c. 1896","county":"Antrim"},{"key":"Gasitar, Angelo (c. 1879)","name":"Angelo Gasitar","life":"c. 1879","county":"Dublin"},{"key":"Cervi, Michael (c. 1866)","name":"Michael Cervi","life":"c. 1866","county":"Antrim"},{"key":"Macari (in Cervi), Amelia (c. 1873)","name":"Amelia Macari","life":"c. 1873","county":"Antrim"},{"key":"Gillini, John (c. 1852-1921)","name":"John Gillini","life":"c. 1852-1921","county":"Dublin"},{"key":"Bergamaschi , Giovanni (c. 1892)","name":"Giovanni Bergamaschi","life":"c. 1892","county":"Dublin"},{"key":"Groziana, Maria (c. 1886)","name":"Maria Groziana","life":"c. 1886","county":"Roscommon"},{"key":"Guidisi, Antonio (c. 1886)","name":"Antonio Guidisi","life":"c. 1886","county":"Kerry"},{"key":"Guridoilo, Dannick (c. 1873)","name":"Dannick Guridoilo","life":"c. 1873","county":"Dublin"},{"key":"Innarelli, Alfred (c. 1881)","name":"Alfred Innarelli","life":"c. 1881","county":"Londonderry"},{"key":"Innarelli, Rosey (c. 1886)","name":"Rosey Innarelli","life":"c. 1886","county":"Londonderry"},{"key":"Innocenzo, Canati (c. 1875)","name":"Canati Innocenzo","life":"c. 1875","county":"Waterford"},{"key":"Jennetta, Miscetta (c. 1891)","name":"Miscetta Jennetta","life":"c. 1891","county":"Antrim"},{"key":"Jicaielly, Saliatore (c. 1873)","name":"Saliatore Jicaielly","life":"c. 1873","county":"Antrim"},{"key":"Jicaielly, Angeliea (c. 1877)","name":"Angeliea Jicaielly","life":"c. 1877","county":"Antrim"},{"key":"Jicaielly, Binna (c. 1900)","name":"Binna Jicaielly","life":"c. 1900","county":"Antrim"},{"key":"Knocker, Francis (c. 1885)","name":"Francis Knocker","life":"c. 1885","county":"Antrim"},{"key":"L., A. (c. 1845)","name":"A. L.","life":"c. 1845","county":"Cork"},{"key":"Leonards, Joseph (c. 1875)","name":"Joseph Leonards","life":"c. 1875","county":"Down"},{"key":"Liuzzi, Paolo Guglielmo (c. 1881)","name":"Paolo Guglielmo Liuzzi","life":"c. 1881","county":"Dublin"},{"key":"Lodovier, Corradi (c. 1880)","name":"Corradi Lodovier","life":"c. 1880","county":"Waterford"},{"key":"Loenzi, Pietro (c. 1875)","name":"Pietro Loenzi","life":"c. 1875","county":"Antrim"},{"key":"Lombardi, Agabito (c. 1856)","name":"Agabito Lombardi","life":"c. 1856","county":"Cork"},{"key":"Lombardi, Mary Jane (c. 1864)","name":"Mary Jane Lombardi","life":"c. 1864","county":"Cork"},{"key":"Lucchesi, Enerico (c. 1875)","name":"Enerico Lucchesi","life":"c. 1875","county":"Cork"},{"key":"Ma (illeggibile), Choesey (c. 1882)","name":"Choesey Ma (illeggibile)","life":"c. 1882","county":"Dublin"},{"key":"Macari, Domenico (1876-1936)","name":"Domenico Macari","life":"1876-1936","county":"Antrim"},{"key":"Rosato (in Macari), Elisabetta (1877-1949)","name":"Elisabetta Rosato","life":"1877-1949","county":"Antrim"},{"key":"Macari, Eugenio Pasquale (1901-1960)","name":"Eugenio Pasquale Macari","life":"1901-1960","county":"Antrim"},{"key":"Macari, Maria Lorita Carmela (1899)","name":"Maria Lorita Carmela Macari","life":"1899","county":null},{"key":"Macari, Luigi (c. 1870-1945)","name":"Luigi Macari","life":"c. 1870-1945","county":"Antrim"},{"key":"Macario, Egidio (c. 1878)","name":"Egidio Macario","life":"c. 1878","county":"Meath"},{"key":"Magliocca, Benedetto (1865-1936)","name":"Benedetto Magliocca","life":"1865-1936","county":"Antrim"},{"key":"Magliocco, Giovanni Antonio (1874-1956)","name":"Giovanni Antonio Magliocco","life":"1874-1956","county":"Antrim"},{"key":"Vella (in Magliocco), Maria Libera (1878-1942)","name":"Maria Libera Vella","life":"1878-1942","county":"Antrim"},{"key":"Magliocco, Giovanni (1840-1924)","name":"Giovanni Magliocco","life":"1840-1924","county":"Antrim"},{"key":"Magliocco, Antonio (1878-1918)","name":"Antonio Magliocco","life":"1878-1918","county":"Antrim"},{"key":"Taddei (in Magliocco), Maria (1886-1962)","name":"Maria Taddei","life":"1886-1962","county":"Antrim"},{"key":"Magliocco, Michele (1875-1957)","name":"Michele Magliocco","life":"1875-1957","county":"Antrim"},{"key":"Crenca (in Magliocco), Angela (1876)","name":"Angela Crenca","life":"1876","county":"Antrim"},{"key":"Malloth, Ada (c. 1891)","name":"Ada Malloth","life":"c. 1891","county":"Down"},{"key":"Marande, Edward (c. 1861)","name":"Edward Marande","life":"c. 1861","county":"Dublin"},{"key":"Marcantonio, Luigi (c. 1853)","name":"Luigi Marcantonio","life":"c. 1853","county":"Dublin"},{"key":"Marcella, Benata (c. 1868)","name":"Benata Marcella","life":"c. 1868","county":"Antrim"},{"key":"Marcelli, Antonio (c. 1876)","name":"Antonio Marcelli","life":"c. 1876","county":"Antrim"},{"key":"Marcelli, Rose (c. 1884)","name":"Rose Marcelli","life":"c. 1884","county":"Antrim"},{"key":"Marcello, Francis (c. 1861)","name":"Francis Marcello","life":"c. 1861","county":"Dublin"},{"key":"Marchetti, Lorance (c. 1878)","name":"Lorance Marchetti","life":"c. 1878","county":"Dublin"},{"key":"Marchetti, Chelda (c. 1890)","name":"Chelda Marchetti","life":"c. 1890","county":"Dublin"},{"key":"Marchetti, Louis (c. 1851)","name":"Louis Marchetti","life":"c. 1851","county":"Kilkenny"},{"key":"Marenghi, Carlo (c. 1892)","name":"Carlo Marenghi","life":"c. 1892","county":"Dublin"},{"key":"Marcantonio, Pietro (c. 1867)","name":"Pietro Marcantonio","life":"c. 1867","county":"Antrim"},{"key":"Martinoli, Ettore (c. 1895)","name":"Ettore Martinoli","life":"c. 1895","county":"Kildare"},{"key":"Martorana, Emmanuel (c. 1881)","name":"Emmanuel Martorana","life":"c. 1881","county":"Dublin"},{"key":"Ermini (in Masson), Rosina (c. 1869)","name":"Rosina Ermini","life":"c. 1869","county":"Dublin"},{"key":"Matassa, Giuseppe Crescenzo (1856-1918)","name":"Giuseppe Crescenzo Matassa","life":"1856-1918","county":"Dublin"},{"key":"Salveta (in Matassa), Maria Giuseppa (1854-1932)","name":"Maria Giuseppa Salveta","life":"1854-1932","county":"Antrim"},{"key":"Matassa (in Cervi), Cristina (1893-1962)","name":"Cristina Matassa","life":"1893-1962","county":"Dublin"},{"key":"Matassa, Pio (1866-1920)","name":"Pio Matassa","life":"1866-1920","county":"Antrim"},{"key":"Forte (in Matassa), Carolina (1870)","name":"Carolina Forte","life":"1870","county":"Antrim"},{"key":"Matassa, Barbato (1894)","name":"Barbato Matassa","life":"1894","county":"Antrim"},{"key":"Matassa, Giovanni (1896-1914)","name":"Giovanni Matassa","life":"1896-1914","county":"Antrim"},{"key":"Mazzanti, Peter Romolo (c. 1868)","name":"Peter Romolo Mazzanti","life":"c. 1868","county":"Dublin"},{"key":"Mc Nally, Fany (c. 1873)","name":"Fany Mc Nally","life":"c. 1873","county":"Dublin"},{"key":"Giannotti (in McLorinan), Anita (c. 1891)","name":"Anita Giannotti","life":"c. 1891","county":"Down"},{"key":"Meazza, Alie (c. 1879)","name":"Alie Meazza","life":"c. 1879","county":"Limerick"},{"key":"Mezza, Valentino Alfonso (c. 1857-1930)","name":"Valentino Alfonso Mezza","life":"c. 1857-1930","county":"Antrim"},{"key":"Lieghio (in Mezza), Lucia Antonia (1856-1940)","name":"Lucia Antonia Lieghio","life":"1856-1940","county":"Antrim"},{"key":"Mezza, Giuseppe (1885-1922)","name":"Giuseppe Mezza","life":"1885-1922","county":"Antrim"},{"key":"Mezza, Rosaria (c. 1891)","name":"Rosaria Mezza","life":"c. 1891","county":"Antrim"},{"key":"Monelli, Arturo (c. 1893)","name":"Arturo Monelli","life":"c. 1893","county":"Dublin"},{"key":"Mongini, Dominick (c. 1870)","name":"Dominick Mongini","life":"c. 1870","county":"Cork"},{"key":"Montelli, Cesare (c. 1891)","name":"Cesare Montelli","life":"c. 1891","county":"Dublin"},{"key":"Morelli, Luigi (c. 1877)","name":"Luigi Morelli","life":"c. 1877","county":"Dublin"},{"key":"Morelli (in Morelli), Maria (c. 1884)","name":"Maria Morelli","life":"c. 1884","county":"Dublin"},{"key":"Morelli, Giovanni Antonio (1867-1927)","name":"Giovanni Antonio Morelli","life":"1867-1927","county":"Antrim"},{"key":"Marcantonio (in Morelli), Maria Grazia (1865-1941)","name":"Maria Grazia Marcantonio","life":"1865-1941","county":"Antrim"},{"key":"Morelli, Giuseppe (1876-1954)","name":"Giuseppe Morelli","life":"1876-1954","county":"Antrim"},{"key":"Morelli, Antonia (c. 1886)","name":"Antonia Morelli","life":"c. 1886","county":"Antrim"},{"key":"Morelli, Romano (1906)","name":"Romano Morelli","life":"1906","county":"Antrim"},{"key":"Morosini, Violetta H. (c. 1888)","name":"Violetta H. Morosini","life":"c. 1888","county":"Dublin"},{"key":"Mortan, Marie (c. 1887)","name":"Marie Mortan","life":"c. 1887","county":"Wexford"},{"key":"Moruni, Giovanni (c. 1888)","name":"Giovanni Moruni","life":"c. 1888","county":"Dublin"},{"key":"Nardini, Carlo (c. 1884)","name":"Carlo Nardini","life":"c. 1884","county":"Down"},{"key":"Nardini, Anita (c. 1886)","name":"Anita Nardini","life":"c. 1886","county":"Down"},{"key":"Nardone, Gaetano (c. 1886)","name":"Gaetano Nardone","life":"c. 1886","county":"Antrim"},{"key":"Nocche, Lewis (c. 1878)","name":"Lewis Nocche","life":"c. 1878","county":"Antrim"},{"key":"Nardona, Carmine (1882-1958)","name":"Carmine Nardona","life":"1882-1958","county":null},{"key":"Notarantonio, Antonio (c. 1881-1970)","name":"Antonio Notarantonio","life":"c. 1881-1970","county":"Antrim"},{"key":"Notario, Loin (c. 1890)","name":"Loin Notario","life":"c. 1890","county":"Antrim"},{"key":"Orlandi, Gilles (c. 1857)","name":"Gilles Orlandi","life":"c. 1857","county":"Dublin"},{"key":"P., A. (c. 1873)","name":"A. P.","life":"c. 1873","county":"Dublin"},{"key":"Pacelli, Francesco Antonio (c. 1869-1939)","name":"Francesco Antonio Pacelli","life":"c. 1869-1939","county":"Dublin"},{"key":"Pacelli, Joseph (c. 1872-1912)","name":"Joseph Pacelli","life":"c. 1872-1912","county":"Dublin"},{"key":"Pacelli, Vincenzo (c. 1839)","name":"Vincenzo Pacelli","life":"c. 1839","county":"Dublin"},{"key":"Pacelli, Mary Rose (c. 1841)","name":"Mary Rose Pacelli","life":"c. 1841","county":"Dublin"},{"key":"Pacini, Marino (c. 1884)","name":"Marino Pacini","life":"c. 1884","county":"Dublin"},{"key":"Palmieri, Benedetto (c. 1864)","name":"Benedetto Palmieri","life":"c. 1864","county":"Dublin"},{"key":"Paulinelli, Arturo (c. 1891)","name":"Arturo Paulinelli","life":"c. 1891","county":"Dublin"},{"key":"Papalim, Francesor (c. 1892)","name":"Francesor Papalim","life":"c. 1892","county":"Antrim"},{"key":"Pedretti, Guy (c. 1878)","name":"Guy Pedretti","life":"c. 1878","county":"Dublin"},{"key":"Peline, Patrick (c. 1864)","name":"Patrick Peline","life":"c. 1864","county":"Kilkenny"},{"key":"Peline, Phelemine (c. 1876)","name":"Phelemine Peline","life":"c. 1876","county":"Kilkenny"},{"key":"Perando, John (c. 1852)","name":"John Perando","life":"c. 1852","county":"Dublin"},{"key":"Perando, Elisabeth (c. 1845)","name":"Elisabeth Perando","life":"c. 1845","county":"Dublin"},{"key":"Perioli, Paul (c. 1841)","name":"Paul Perioli","life":"c. 1841","county":"Antrim"},{"key":"Podesta, Anthony (c. 1837-1917)","name":"Anthony Podesta","life":"c. 1837-1917","county":"Dublin"},{"key":"Polk, Frank (c. 1879)","name":"Frank Polk","life":"c. 1879","county":"Tyrone"},{"key":"Puleo, Frank (c. 1863)","name":"Frank Puleo","life":"c. 1863","county":"Antrim"},{"key":"Rabaiotti, Antonio (c. 1879)","name":"Antonio Rabaiotti","life":"c. 1879","county":"Dublin"},{"key":"Loffi (in Rabaiotti), Rosina (c. 1880)","name":"Rosina Loffi","life":"c. 1880","county":"Dublin"},{"key":"Rabaiotti, Valentina (c. 1909)","name":"Valentina Rabaiotti","life":"c. 1909","county":"Dublin"},{"key":"Raffo, Joseph (c. 1888)","name":"Joseph Raffo","life":"c. 1888","county":"Antrim"},{"key":"Raffo, Francesca (c. 1893)","name":"Francesca Raffo","life":"c. 1893","county":"Antrim"},{"key":"Ralta, Louis (c. 1859)","name":"Louis Ralta","life":"c. 1859","county":"Dublin"},{"key":"Rea, Orazio (c. 1876)","name":"Orazio Rea","life":"c. 1876","county":"Antrim"},{"key":"Rea, Liberato (c. 1886)","name":"Liberato Rea","life":"c. 1886","county":"Antrim"},{"key":"Rea, Margaret (c. 1903)","name":"Margaret Rea","life":"c. 1903","county":"Antrim"},{"key":"Rea, Loreto (c. 1892)","name":"Loreto Rea","life":"c. 1892","county":"Antrim"},{"key":"Rella, Luke (c. 1893)","name":"Luke Rella","life":"c. 1893","county":"Dublin"},{"key":"Repetto, Angelo Giovanni (c. 1844-1922)","name":"Angelo Giovanni Repetto","life":"c. 1844-1922","county":"Dublin"},{"key":"Riani, Carlo (c. 1882)","name":"Carlo Riani","life":"c. 1882","county":"Antrim"},{"key":"Sherlock (in Riani), Rosina (c. 1880)","name":"Rosina Sherlock","life":"c. 1880","county":"Antrim"},{"key":"Riviere, Yules (c. 1877)","name":"Yules Riviere","life":"c. 1877","county":"Dublin"},{"key":"Rolleri, Luigi (c. 1844-1926)","name":"Luigi Rolleri","life":"c. 1844-1926","county":"Dublin"},{"key":"Rooney, Mary A (c. 1843-1914)","name":"Mary A Rooney","life":"c. 1843-1914","county":"Dublin"},{"key":"Rosato, Carmine (1873-1929)","name":"Carmine Rosato","life":"1873-1929","county":"Antrim"},{"key":"Fusco (in Rosato), Maria Benedetta (1882-1918)","name":"Maria Benedetta Fusco","life":"1882-1918","county":"Antrim"},{"key":"Rosato, Giuseppe Antonio (1874-1939)","name":"Giuseppe Antonio Rosato","life":"1874-1939","county":"Antrim"},{"key":"Rosse, Adam (c. 1888)","name":"Adam Rosse","life":"c. 1888","county":"Limerick"},{"key":"Rossi, Raffaele (c. 1869)","name":"Raffaele Rossi","life":"c. 1869","county":"Down"},{"key":"Rossi, Francesco (c. 1863)","name":"Francesco Rossi","life":"c. 1863","county":"Antrim"},{"key":"Rota, Francis F. (c. 1882)","name":"Francis F. Rota","life":"c. 1882","county":"Dublin"},{"key":"Rouge-Granas, Stella (c. 1890)","name":"Stella Rouge-Granas","life":"c. 1890","county":"Dublin"},{"key":"Salazar, Lorenzo (c. 1858)","name":"Lorenzo Salazar","life":"c. 1858","county":"Dublin"},{"key":"Salazar, Emma (c. 1861)","name":"Emma Salazar","life":"c. 1861","county":"Dublin"},{"key":"Salazar, Demetrio (c. 1884)","name":"Demetrio Salazar","life":"c. 1884","county":"Dublin"},{"key":"Santini, Carlo (c. 1864)","name":"Carlo Santini","life":"c. 1864","county":"Antrim"},{"key":"Santi, Angelo (c. 1876)","name":"Angelo Santi","life":"c. 1876","county":"Dublin"},{"key":"Santi, Eda (c. 1881)","name":"Eda Santi","life":"c. 1881","county":"Dublin"},{"key":"Santi, Gaitono (c. 1882)","name":"Gaitono Santi","life":"c. 1882","county":"Dublin"},{"key":"Santi, Biagio (c. 1885)","name":"Biagio Santi","life":"c. 1885","county":"Dublin"},{"key":"Sartorioe, Achille (c. 1893)","name":"Achille Sartorioe","life":"c. 1893","county":"Antrim"},{"key":"Origano, Savino (c. 1865-1953)","name":"Savino Origano","life":"c. 1865-1953","county":null},{"key":"Pedretti (in Origano), Clelia (c. 1873-1943)","name":"Clelia Pedretti","life":"c. 1873-1943","county":null},{"key":"Origano (in Agnoli), Emma (c. 1893)","name":"Emma Origano","life":"c. 1893","county":"Dublin"},{"key":"Origano, Garran (c. 1895)","name":"Garran Origano","life":"c. 1895","county":"Dublin"},{"key":"Origano, Fougherad (c. 1898)","name":"Fougherad Origano","life":"c. 1898","county":"Dublin"},{"key":"Savino, Giuseppe (1878-1941)","name":"Giuseppe Savino","life":"1878-1941","county":"Dublin"},{"key":"Scappaticci, Bernardo (1884)","name":"Bernardo Scappaticci","life":"1884","county":"Londonderry"},{"key":"Sessarego, Joseph (c. 1836-1922)","name":"Joseph Sessarego","life":"c. 1836-1922","county":"Cork"},{"key":"Bouvier (in Smyth), Virginia Pauline (c. 1856)","name":"Virginia Pauline Bouvier","life":"c. 1856","county":"Dublin"},{"key":"Stratta, Antonio (c. 1885)","name":"Antonio Stratta","life":"c. 1885","county":"Dublin"},{"key":"Stuphor, August (c. 1877)","name":"August Stuphor","life":"c. 1877","county":"Dublin"},{"key":"Steffinato, Angelo (c. 1885)","name":"Angelo Steffinato","life":"c. 1885","county":"Down"},{"key":"Ferrari, Luigi (c. 1890)","name":"Luigi Ferrari","life":"c. 1890","county":"Dublin"},{"key":"Tragonette, Pasquale (c. 1866)","name":"Pasquale Tragonette","life":"c. 1866","county":"Antrim"},{"key":"Trisoni, Rego (c. 1884)","name":"Rego Trisoni","life":"c. 1884","county":"Tyrone"},{"key":"Trosone, Rego (c. 1886)","name":"Rego Trosone","life":"c. 1886","county":"Antrim"},{"key":"Valante, Frank (c. 1888)","name":"Frank Valante","life":"c. 1888","county":"Down"},{"key":"Valante, Win (c. 1891)","name":"Win Valante","life":"c. 1891","county":"Down"},{"key":"Valante, Peppino (c. 1893)","name":"Peppino Valante","life":"c. 1893","county":"Down"},{"key":"Valente, Silvestro (c. 1869-1925)","name":"Silvestro Valente","life":"c. 1869-1925","county":"Down"},{"key":"Nardella (in Valente), Benedetta (c. 1889-1955)","name":"Benedetta Nardella","life":"c. 1889-1955","county":"Antrim"},{"key":"Valenti, Lucy (c. 1850)","name":"Lucy Valenti","life":"c. 1850","county":"Antrim"},{"key":"Valenti, Domenico (c. 1857)","name":"Domenico Valenti","life":"c. 1857","county":"Antrim"},{"key":"Capitano (in Valenti), Theresa (c. 1865)","name":"Theresa Capitano","life":"c. 1865","county":"Antrim"},{"key":"Cascarina (in Valenti), Theresa (c. 1891)","name":"Theresa Cascarina","life":"c. 1891","county":"Antrim"},{"key":"Balzanelli, Francesco (c. 1874-1930)","name":"Francesco Balzanelli","life":"c. 1874-1930","county":"Antrim"},{"key":"Vannucci, Peter (c. 1887)","name":"Peter Vannucci","life":"c. 1887","county":"Down"},{"key":"Vannicci, Pasqual (c. 1888)","name":"Pasqual Vannicci","life":"c. 1888","county":"Down"},{"key":"Velardo, Stella (c. 1883)","name":"Stella Velardo","life":"c. 1883","county":"Antrim"},{"key":"Velgatti, Chesier (c. 1842)","name":"Chesier Velgatti","life":"c. 1842","county":"Antrim"},{"key":"Venencia, Peter (c. 1841-1922)","name":"Peter Venencia","life":"c. 1841-1922","county":"Dublin"},{"key":"Ventitta, Giuseppe (c. 1856)","name":"Giuseppe Ventitta","life":"c. 1856","county":"Antrim"},{"key":"Viacava, Orlando (c. 1855)","name":"Orlando Viacava","life":"c. 1855","county":"Cork"},{"key":"Von Sutter, Elise M S (c. 1891)","name":"Elise M S Von Sutter","life":"c. 1891","county":"Louth"},{"key":"While, Paul (c. 1887)","name":"Paul While","life":"c. 1887","county":"Limerick"},{"key":"Zanin, Pietro (c. 1870)","name":"Pietro Zanin","life":"c. 1870","county":"Dublin"},{"key":"Zuorro, George (c. 1882)","name":"George Zuorro","life":"c. 1882","county":"Antrim"},{"key":"Macari, John (c. 1872-1911)","name":"John Macari","life":"c. 1872-1911","county":"Down"},{"key":"Pizzorno, Josephine (c. 1861)","name":"Josephine Pizzorno","life":"c. 1861","county":"Dublin"}],"notYetProfiled":[{"name":"Bassi, Joseph"},{"name":"Bassi, Virgilio"},{"name":"Bussole, Amerigo"},{"name":"Macari, Andrea"},{"name":"Nicalson, Alexandr"}],"falseList":[{"name":"Armstrong, Margaret","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"B, G. W.","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Carrie, Florence","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Coppinger, Thomas S","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Cotter, Joseph Rogerson","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Cotter, Mary Susannah","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Cryan, Edith","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Cryan, Harold","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Cryan, Cyril","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Cusack, Henry G","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Davidson, Helen Winifred","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Dempsey, Phyllis","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Doyne, Annetta","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Edgeworth, Antonio Eroles","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Fester, Ellen","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Gallick, Frank","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Gould, George","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Greene, Alfred B","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Hogan, Elizabeth","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Hurford, Mabel A G","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Kavanagh, James","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Kidney, Mary Eleanor","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"King Harman, Wentworth Henry","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Koessler, Thomelta","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"MacSwiney, John Charles","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Monahan, Margaret Agnus","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Moneypenny, Rudolph","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Morton-Jackson, Cherry Roma","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"O' Mahony, John Joseph","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"O'Kelly, Bernard D","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"O'Neill, William H S","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Plunkett Earl of Fingall, Arthur James","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"S, G N","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Scannell, Josephine","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Thacker, Joseph W","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Thorold, Elizabeth Mary","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Townshend, Beatrice","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Wallace, Donald Cameron","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"},{"name":"Rules, Alexander","note":"SISTEMATO","birthPlace":null,"censusUrl":null,"censusYear":"1911"}]},"1926":{"officialNational":238,"people":[{"key":"Bardini, Amedeo (c. 1893-1937)","name":"Amedeo Bardini","life":"c. 1893-1937","county":"Sligo"},{"key":"Bardini, Angelo (c. 1886)","name":"Angelo Bardini","life":"c. 1886","county":"Mayo"},{"key":"Berdeni, Joanna (c. 1919)","name":"Joanna Berdeni","life":"c. 1919","county":"Mayo"},{"key":"Cafolla, Angelo (1888-1964)","name":"Angelo Cafolla","life":"1888-1964","county":"Waterford"},{"key":"Cervi, Giuseppe (c. 1859-1927)","name":"Giuseppe Cervi","life":"c. 1859-1927","county":"Dublin"},{"key":"Cervi, Lorenzo (1883-1937)","name":"Lorenzo Cervi","life":"1883-1937","county":"Dublin"},{"key":"Cervi, Maria (c. 1892-1971)","name":"Maria Cervi","life":"c. 1892-1971","county":"Dublin"},{"key":"De Angelis (in Macari), Luisa Carolina (c. 1904)","name":"Luisa Carolina De Angelis","life":"c. 1904","county":"Louth"},{"key":"Esposito, Michele (1855-1929)","name":"Michele Esposito","life":"1855-1929","county":"Dublin"},{"key":"Forte (in Forte), Giovanna (1903-1979)","name":"Giovanna Forte","life":"1903-1979","county":"Dublin"},{"key":"Forte (in Forte), Rosa (1869-1939)","name":"Rosa Forte","life":"1869-1939","county":"Limerick"},{"key":"Forte, Alfonso (1863-1938)","name":"Alfonso Forte","life":"1863-1938","county":"Limerick"},{"key":"Forte, Angelo (c. 1876)","name":"Angelo Forte","life":"c. 1876","county":"Kilkenny"},{"key":"Forte, Benedetto (1900-1987)","name":"Benedetto Forte","life":"1900-1987","county":"Dublin"},{"key":"Forte, Carmine (1889)","name":"Carmine Forte","life":"1889","county":"Dublin"},{"key":"Forte, Eric (c. 1902)","name":"Eric Forte","life":"c. 1902","county":"Dublin"},{"key":"Forte, Gaetano (1894-1952)","name":"Gaetano Forte","life":"1894-1952","county":"Dublin"},{"key":"Forte, Gerardo (1891)","name":"Gerardo Forte","life":"1891","county":"Sligo"},{"key":"Forte, Raffaele (c. 1899-1974)","name":"Raffaele Forte","life":"c. 1899-1974","county":"Dublin"},{"key":"Fusco (in Macari), Mary (c. 1871)","name":"Mary Fusco","life":"c. 1871","county":"Cork"},{"key":"Fusco, Laura (c. 1877)","name":"Laura Fusco","life":"c. 1877","county":"Cork"},{"key":"Fusco, Pacifico (c. 1899-1979)","name":"Pacifico Fusco","life":"c. 1899-1979","county":"Dublin"},{"key":"Lieghio (in Rosato), Maria (1884-1959)","name":"Maria Lieghio","life":"1884-1959","county":"Dublin"},{"key":"Lodola, Romeo Anselmo (c. 1904)","name":"Romeo Anselmo Lodola","life":"c. 1904","county":"Dublin"},{"key":"Macari (in Forte), Mariagrazia (1902)","name":"Mariagrazia Macari","life":"1902","county":"Dublin"},{"key":"Macari, Charles (c. 1875)","name":"Charles Macari","life":"c. 1875","county":"Cork"},{"key":"Macari, Domenico (1876-1936)","name":"Domenico Macari","life":"1876-1936","county":"Dublin"},{"key":"Macari, Eugenio Pasquale (1901-1960)","name":"Eugenio Pasquale Macari","life":"1901-1960","county":"Dublin"},{"key":"Macari, Luigi (c. 1870-1945)","name":"Luigi Macari","life":"c. 1870-1945","county":"Louth"},{"key":"Marcantonio, Giovanni (c. 1863)","name":"Giovanni Marcantonio","life":"c. 1863","county":"Dublin"},{"key":"Marcantonio, Louis (c. 1855)","name":"Louis Marcantonio","life":"c. 1855","county":"Dublin"},{"key":"Marchetti, Louis (c. 1851)","name":"Louis Marchetti","life":"c. 1851","county":"Kilkenny"},{"key":"Marini (in Nardone), Nascenza (1893)","name":"Nascenza Marini","life":"1893","county":"Dublin"},{"key":"Matassa (in Cervi), Cristina (1893-1962)","name":"Cristina Matassa","life":"1893-1962","county":"Dublin"},{"key":"Matassa (in Nardone), Angelina (1897-1982)","name":"Angelina Matassa","life":"1897-1982","county":"Dublin"},{"key":"Matassa, Antonio (c. 1869-1957)","name":"Antonio Matassa","life":"c. 1869-1957","county":"Dublin"},{"key":"Matassa, Francesca (c. 1876-1959)","name":"Francesca Matassa","life":"c. 1876-1959","county":"Dublin"},{"key":"Matassa, Jennie (c. 1912)","name":"Jennie Matassa","life":"c. 1912","county":"Dublin"},{"key":"Morelli (in Morelli), Maria (c. 1884)","name":"Maria Morelli","life":"c. 1884","county":"Dublin"},{"key":"Morelli, Anna (c. 1876)","name":"Anna Morelli","life":"c. 1876","county":"Dublin"},{"key":"Morelli, Luigi (c. 1877)","name":"Luigi Morelli","life":"c. 1877","county":"Dublin"},{"key":"Morelli, Vincenzo Antonio Leonardo (1889-1937)","name":"Vincenzo Antonio Leonardo Morelli","life":"1889-1937","county":"Dublin"},{"key":"Nardona, Carmine (1882-1958)","name":"Carmine Nardona","life":"1882-1958","county":"Louth"},{"key":"Nardone (in Cafolla), Nicolina (1903-1954)","name":"Nicolina Nardone","life":"1903-1954","county":"Dublin"},{"key":"Nardone, Carmine (1875-1936)","name":"Carmine Nardone","life":"1875-1936","county":"Dublin"},{"key":"Nardone, Guy (c. 1887)","name":"Guy Nardone","life":"c. 1887","county":"Donegal"},{"key":"Nardone, O. (c. 1913)","name":"O. Nardone","life":"c. 1913","county":"Dublin"},{"key":"Nardone, Olimpio (c. 1896)","name":"Olimpio Nardone","life":"c. 1896","county":"Dublin"},{"key":"Pacini, Irene (c. 1869-1945)","name":"Irene Pacini","life":"c. 1869-1945","county":"Dublin"},{"key":"Pacini, Luigi (c. 1867-1945)","name":"Luigi Pacini","life":"c. 1867-1945","county":"Dublin"},{"key":"Ramoni, Joseph (c. 1880)","name":"Joseph Ramoni","life":"c. 1880","county":"Dublin"},{"key":"Rosato (in Macari), Elisabetta (1877-1949)","name":"Elisabetta Rosato","life":"1877-1949","county":"Dublin"},{"key":"Rosato, Carmine (1873-1929)","name":"Carmine Rosato","life":"1873-1929","county":"Dublin"},{"key":"Salveta (in Matassa), Maria Giuseppa (1854-1932)","name":"Maria Giuseppa Salveta","life":"1854-1932","county":"Dublin"}]}};
let elenchiInited = false;
let elenchiYear = "1911";
let elenchiScope = "national";
let elenchiCounty = "";
function showElenchiTab(){
  document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.getElementById("tab-elenchi").classList.add("active");
  initElenchi();
  elenchiRender();
}
function elenchiOpenFor(year, county){
  showElenchiTab();
  elenchiYear = year;
  document.querySelectorAll('input[name="elenchiYear"]').forEach(r=>{ r.checked = (r.value===year); });
  const sel = document.getElementById("elenchiCountySel");
  if(county){
    elenchiScope = "county"; elenchiCounty = county;
    document.querySelectorAll('input[name="elenchiScope"]').forEach(r=>{ r.checked = (r.value==="county"); });
    sel.disabled = false; sel.value = county;
  } else {
    elenchiScope = "national";
    document.querySelectorAll('input[name="elenchiScope"]').forEach(r=>{ r.checked = (r.value==="national"); });
    sel.disabled = true;
  }
  elenchiRender();
  document.getElementById("tab-elenchi").scrollIntoView({behavior:"smooth", block:"start"});
}
function initElenchi(){
  if(elenchiInited) return; elenchiInited = true;
  const sel = document.getElementById("elenchiCountySel");
  sel.innerHTML = CENSUS_GEO.counties.slice().sort().map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join("");
  elenchiCounty = CENSUS_GEO.counties.slice().sort()[0];
  sel.value = elenchiCounty;
  document.querySelectorAll('input[name="elenchiYear"]').forEach(r=>{
    r.addEventListener("change", ()=>{ elenchiYear = r.value; elenchiRender(); });
  });
  document.querySelectorAll('input[name="elenchiScope"]').forEach(r=>{
    r.addEventListener("change", ()=>{
      elenchiScope = r.value;
      sel.disabled = (elenchiScope!=="county");
      elenchiRender();
    });
  });
  sel.addEventListener("change", ()=>{ elenchiCounty = sel.value; if(elenchiScope==="county") elenchiRender(); });
}
function elenchiRender(){
  const data = CENSUS_LISTS[elenchiYear];
  const summaryEl = document.getElementById("elenchiSummary");
  const listEl = document.getElementById("elenchiList");
  const falseEl = document.getElementById("elenchiFalse");
  if(!data){ summaryEl.innerHTML=""; listEl.innerHTML=""; falseEl.innerHTML=""; return; }
  const isCounty = elenchiScope==="county" && elenchiCounty;
  const people = isCounty ? data.people.filter(p=>p.county===elenchiCounty) : data.people;
  const scopeLabel = isCounty ? elenchiCounty : TT("all of Ireland","tutta l'Irlanda");
  const notYet = isCounty ? [] : (data.notYetProfiled||[]);
  const hasRaw = !isCounty && data.rawTotal!==undefined;
  let rows = '<div class="k">'+TT("Census","Censimento")+'</div><div>'+esc(elenchiYear)+' &mdash; '+esc(scopeLabel)+'</div>';
  if(hasRaw){
    // 1901/1911, national scale: total found in the census -> false -> true -> profiled (% of TRUE)
    const raw = data.rawTotal, falseN = data.falseTotal, trueN = data.verifiedTotal;
    const falsePct = raw ? Math.round(falseN/raw*100) : 0;
    const truePct = raw ? Math.round(trueN/raw*100) : 0;
    const profPct = trueN ? Math.round(people.length/trueN*100) : null;
    rows += '<div class="k">'+TT("Total found in the census (search by place of birth)","Totale trovato nel censimento (ricerca per luogo di nascita)")+'</div><div>'+raw+'</div>';
    rows += '<div class="k">&nbsp;&nbsp;&mdash; '+TT("of which false Italians","di cui falsi italiani")+'</div><div>'+falseN+' <span style="color:#776955">('+falsePct+'% '+TT("of total","del totale")+')</span></div>';
    rows += '<div class="k">&nbsp;&nbsp;&mdash; '+TT("of which true Italians","di cui veri italiani")+'</div><div>'+trueN+' <span style="color:#776955">('+truePct+'% '+TT("of total","del totale")+')</span></div>';
    rows += '<div class="k">'+TT("Profiles created","Profili creati")+'</div><div>'+people.length+(profPct!==null?' <span style="color:#776955">('+profPct+'% '+TT("of true Italians","dei veri italiani")+')</span>':'')+'</div>';
    if(notYet.length) rows += '<div class="k">'+TT("Identified as true Italians but without a profile yet","Identificati come veri italiani ma senza ancora una scheda")+'</div><div>'+notYet.length+'</div>';
    if(data.officialNational!==undefined){
      rows += '<div class="k" style="padding-top:6px;border-top:1px solid var(--line);margin-top:4px">'+TT("For comparison: official total published by the census","Per confronto: totale ufficiale pubblicato dal censimento")+'</div>'+
        '<div style="padding-top:6px;border-top:1px solid var(--line);margin-top:4px">'+data.officialNational+
        ' <span style="color:#776955">'+TT("(the difference from the true Italians found is probably due to transcription errors or entries not picked up by the search)","(la differenza rispetto ai veri italiani trovati &egrave; probabilmente dovuta a refusi di trascrizione o voci non recuperate dalla ricerca)")+'</span></div>';
    }
  } else {
    // 1926, or county view: simple comparison of official vs profiled
    const official = isCounty ? (data.officialByCounty ? data.officialByCounty[elenchiCounty] : null) : data.officialNational;
    const pct = (official!==null && official!==undefined && official>0) ? Math.round(people.length/official*100) : null;
    if(official!==null && official!==undefined){
      rows += '<div class="k">'+TT("Italians according to the official census","Italiani secondo il censimento ufficiale")+'</div><div>'+official+'</div>';
    } else if(isCounty && elenchiYear==="1926"){
      rows += '<div class="k">'+TT("Italians according to the official census","Italiani secondo il censimento ufficiale")+'</div><div style="color:#776955">'+TT("not published for individual counties in 1926 (macro-area only)","non pubblicato per singola contea nel 1926 (solo per macro-area)")+'</div>';
    }
    rows += '<div class="k">'+TT("People identified and profiled","Persone identificate e profilate")+'</div><div>'+people.length+(pct!==null?' <span style="color:#776955">('+pct+'% '+TT("of official total","del totale ufficiale")+')</span>':'')+'</div>';
    if(!isCounty && elenchiYear==="1926"){
      rows += '<div class="k" style="font-size:11.5px;color:#776955">'+TT("For 1926 a systematic review like the one for 1901 and 1911 has not yet been carried out: there is therefore no (yet) list of false Italians to exclude.","Per il 1926 non &egrave; ancora stata fatta una revisione sistematica come per il 1901 e il 1911: non c&rsquo;&egrave; quindi (ancora) un elenco di falsi italiani da escludere.")+'</div>';
    }
  }
  summaryEl.innerHTML = '<div class="cgrid" style="grid-template-columns:340px 1fr;max-width:760px">'+rows+'</div>';
  const sorted = people.slice().sort((a,b)=>a.key.localeCompare(b.key));
  let html = '<div class="elenchiPeople">'+sorted.map(p=>
    '<div class="pcard" onclick="openPerson(\''+p.key.replace(/'/g,"\\'")+'\')"><b>'+esc(p.name)+'</b>'+
    (p.life?' <span class="meta">('+esc(p.life)+')</span>':'')+
    (p.county && !isCounty ? '<div class="meta">'+esc(p.county)+'</div>':'')+
    '</div>'
  ).join("")+'</div>';
  if(!people.length){
    html = '<p style="font-size:13px;color:#776955">'+TT("No one profiled for this selection yet.","Nessuna persona profilata per questa selezione, per ora.")+'</p>' + html;
  }
  if(notYet.length){
    html += '<h4 style="margin:18px 0 6px 0;font-size:13px">'+TT("Identified as Italian in the census but without a profile yet ("+notYet.length+")","Identificate come italiane nel censimento ma senza ancora una scheda propria ("+notYet.length+")")+'</h4>'+
      '<p style="font-size:12.5px;color:#776955">'+notYet.map(n=>esc(n.name)).join(", ")+'</p>';
  }
  listEl.innerHTML = html;
  if(!isCounty && data.falseList && data.falseList.length){
    const rowsHtml = data.falseList.map(f=>{
      const bd = f.birthDate ? esc(f.birthDate) : '&#8211;';
      const bp = f.birthPlace ? esc(f.birthPlace) : '&#8211;';
      const cens = f.censusUrl ? '<a class="pl" onclick="window.open(\''+f.censusUrl.replace(/'/g,"\\'")+'\',\'_blank\')">'+esc(f.censusYear)+'</a>' : esc(f.censusYear)+' <span style="color:#776955">'+TT("(link not available)","(link non disponibile)")+'</span>';
      return '<tr><td>'+esc(f.name)+'</td><td>'+bd+'</td><td>'+bp+'</td><td>'+cens+'</td><td>'+(f.note?esc(f.note):'&#8211;')+'</td></tr>';
    }).join("");
    falseEl.innerHTML = '<details class="cbox"><summary>'+TT("False Italians excluded from the count ("+data.falseList.length+")","Falsi italiani esclusi dal conteggio ("+data.falseList.length+")")+'</summary>'+
      '<p style="font-size:12px;color:#776955;margin:6px 0 10px 0">'+TT("People born in Italy but not belonging to the Italian community &mdash; children of officials, governesses, clergy or British military personnel born in Italy for reasons of service, and similar cases: they appear in the search by place of birth but have been excluded from the count. Date of birth and place of birth are reported only where already noted; the link in Census opens the original profile where available.","Persone nate in Italia ma non appartenenti alla comunit\u00e0 italiana &mdash; figli di funzionari, governanti, ecclesiastici o militari britannici nati in Italia per motivi di servizio, e simili: compaiono nella ricerca per luogo di nascita ma sono state escluse dal conteggio. Data di nascita e luogo di nascita sono riportati solo dove gi\u00e0 annotati; il collegamento in Censimento apre la scheda originale quando disponibile.")+'</p>'+
      '<div style="max-width:100%;overflow-x:auto"><table class="tl"><thead><tr><th>'+TT("Name (as in the census)","Nome (come nel censimento)")+'</th><th>'+TT("Date of birth","Data di nascita")+'</th><th>'+TT("Place of birth","Luogo di nascita")+'</th><th>'+TT("Census","Censimento")+'</th><th>'+TT("Notes","Note")+'</th></tr></thead><tbody>'+
      rowsHtml+
      '</tbody></table></div></details>';
  } else {
    falseEl.innerHTML = "";
  }
}
function showFontiTab(){
  document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.getElementById("tab-fonti").classList.add("active");
  initFonti();
}
const STATIC_I18N = {
  /*COLOPHON*/
  "i18n-colo-h3": "How to cite, reuse and correct this site",
  "i18n-colo-cite": "<b>Citation</b> &mdash; Luca Bertolani Azeredo, <i>Italians in Ireland: A Prosopographical Database, 1850&ndash;2026</i>, https://italians-in-ireland.github.io (accessed <span class=\"colDate\"></span>).",
  "i18n-colo-living": "<b>Living people</b> &mdash; The database is above all a record of lives that have ended, but some profiles reach into recent decades and may concern people who are still alive or who died recently. The information comes from public sources: censuses open to consultation, civil registration records, obituaries and gravestones. If you appear in a profile, or a relative of yours does, and you would like something corrected or removed, <a href=\"https://irishhistorians.ie/members/lucaba/\" target=\"_blank\" rel=\"noopener\">write to me</a> and I will see to it.",
  "i18n-colo-tiles": "<b>Maps and external connections</b> &mdash; The maps on this site draw places and historical tiles over a base map supplied by the CARTO service, built on OpenStreetMap data. When you open a map your browser connects to that service, which receives your IP address: it is the only third-party connection consulting this site involves. Everything else &mdash; text, photographs, historical tiles, typefaces, code &mdash; is served from this site. There are no analytics, no trackers and no cookies.",
  "i18n-colo-lic": "<b>Licence</b> &mdash; The texts and genealogical reconstructions on this site are released under a <a href=\"https://creativecommons.org/licenses/by-nc/4.0/\" target=\"_blank\" rel=\"noopener\">Creative Commons BY-NC 4.0</a> licence: you may reuse them for non-commercial purposes, citing the author and the site. The photographs are excluded from the licence and remain with their owners: reproducing them requires permission. The original records cited (censuses, civil registration) are in the public domain and remain available at the sources linked from every profile.",
  /*END COLOPHON*/
  "i18n-home-h2": "Welcome",
  "i18n-home-intro": "This site collects the prosopographical research on Italians in Ireland, 1850&ndash;2026: individual profiles, family ties, geographic movements and archival sources, reconstructed from the Irish censuses and civil registration records.",
  "i18n-home-nav-h3": "Finding your way around the site",
  "i18n-home-people": "Search for a person by name, filter by family or place of birth: the list shows a photo where one is available in the database, or a male or female icon otherwise; open their profile to see the full timeline of events and sources.",
  "i18n-home-map": "Interactive map of each person&rsquo;s movements (arrows colour-coded by period), filterable by event type, family or person, with adjustable year range and playback speed, and the historical Ordnance Survey map from the early 1900s overlaid (zoom 16, available by zooming in on known locations).",
  "i18n-home-families": "Alphabetical list of families with the number of members and the earliest and latest known record: every column can be sorted ascending or descending. Click a family to open a card with its history (where already written) and a sortable list of its members.",
  "i18n-home-locations": "A record for every place mentioned in the profiles, generated from the Obsidian notes: filter by country, county or town, then open an address to see it on the map, with the list of the families who lived there (from their first to their last attested year, so shared occupancy and handovers are visible) and the full chronology of events, each person linking to their own profile.",
  "i18n-home-timeline": "Distribution over time of every dated event, grouped into 1-, 5- or 10-year buckets and filterable by event type or place; below the chart, the &ldquo;On this day&rdquo; section shows events that happened on this same date across the years.",
  "i18n-home-stats": "Aggregate statistics for the whole database: the most attested occupations, places of birth, a census comparison by sex, county, occupation or age, the frequency of the different event types, and a dedicated section on the victims of the Arandora Star (2 July 1940).",
  "i18n-home-censuses-b": "Italians in Ireland",
  "i18n-home-censuses": "Six maps of Ireland (1891, 1901, 1911 censuses, then 1926, 1936, 1946) showing the number of Italians by county or province, filterable by sex and age; click a county or city to see its trend over time and age&ndash;sex population pyramids.",
  "i18n-byline": "edited by <a href=\"https://irishhistorians.ie/members/lucaba/\" target=\"_blank\" rel=\"noopener\">Luca Bertolani Azeredo, PhD</a>",
  "i18n-home-tree-b": "Family Tree",
  "i18n-home-tree-p": "Explore kinship relations by person, family, or the whole community in an interactive graphic visualisation; for larger families, the number of people and the earliest known birth and most recent known death appear at the top, and a minimap at the bottom helps you find your way around the tree.",
  "i18n-home-fonti-b": "Sources",
  "i18n-home-fonti-p": "The original Irish census tables, 1891&ndash;1946, county by county: sortable, filterable by sex and age, and comparable between any two chosen years.",
  "i18n-home-elenchi-b": "Italians in the Censuses",
  "i18n-home-elenchi-p": "The nominal list of people identified as Italian in the 1901, 1911 and 1926 censuses (the only ones whose original returns can be consulted name by name), filterable by county, linked to each individual&rsquo;s profile, with a list of the so-called false Italians excluded from the count.",
  "i18n-includeRelated": "Also include family/related people",
  "i18n-tree-view-label": "View:",
  "i18n-tree-opt-person": "Person",
  "i18n-tree-opt-family": "Family",
  "i18n-tree-opt-community": "Community",
  "i18n-tree-person-label": "Person:",
  "i18n-tree-family-label": "Family:",
  "i18n-tree-choose": "Choose...",
  "i18n-tree-mode-label": "Mode:",
  "i18n-tree-opt-familymap": "Family map",
  "i18n-tree-opt-fullgraph": "Full graph",
  "i18n-tree-hint": "Drag to pan, mouse wheel to zoom. Click a box to open that person&rsquo;s profile (or a family to explore it in detail).",
  "i18n-tl-group-label": "Group by:",
  "i18n-tl-opt-1": "1 year",
  "i18n-tl-opt-5": "5 years",
  "i18n-tl-opt-10": "10 years",
  "i18n-tl-onthisday-h3": "On this day",
  "i18n-stats-sex-label": "Sex:",
  "i18n-stats-sex-all": "All",
  "i18n-stats-year-label": "Year:",
  "i18n-stats-year-none": "None (comparison only)",
  "i18n-stats-compare-label": "Compare:",
  "i18n-stats-metric-persone": "Number of people",
  "i18n-stats-metric-sesso": "Sex",
  "i18n-stats-metric-contea": "County",
  "i18n-stats-metric-lavoro": "Occupation",
  "i18n-stats-metric-eta": "Age",
  "i18n-census-intro": "Although the first complete data available is from the 1891 census, the presence of Italians in Ireland predates even the birth of the Italian state in 1861: by 1848 <a class=\"pl\" onclick=\"openPerson('Bevignani (in Hogan), Cornelia (1815-1899)')\">Cornelia Bevignani</a> (1815&ndash;1899), wife of the sculptor John Hogan, had already moved to Dublin with him &mdash; the earliest Italian identified so far in the database.<br><br>Distribution of Italians resident in Ireland in the 1891, 1901 and 1911 censuses, by historical county and by city (cities with separate administrative status, such as Dublin, Cork, Belfast, Waterford, Limerick, Kilkenny, Derry/Londonderry, Galway and Drogheda, are counted separately from the county they belong to and shown as dots).<br>The colour scale is shared across the three maps so as to compare the years directly.<br>Click on a county or a city to see the detail and its trend over time across all three maps together.<br>These figures include only those recorded in the census as born in Italy: this necessarily excludes the children of Italian families who were themselves born in Ireland or elsewhere, while at the same time including people born in Italy who did not belong to the Italian community (for instance the children of foreign officials, clergy, or military personnel posted there). The list of these so-called false Italians, with all known information about each of them and the reason for their exclusion from the count, appears on the page <a class=\"pl\" onclick=\"showElenchiTab()\">Italians in the Censuses</a>.",
  "i18n-census-percounty": "By county",
  "i18n-census-perprovince": "By province",
  "i18n-census-sex-b": "Sex:",
  "i18n-census-both": "Both",
  "i18n-census-men": "Men",
  "i18n-census-women": "Women",
  "i18n-census-age-b": "Age:",
  "i18n-census-age-filter-hint": "The age filter only applies to the 1891-1911 maps and to the pyramid below: the Free State reports (1926-1946) publish Italians only by sex, not by age.",
  "i18n-census-detail-hint": "Click a county or city on one of the three maps to see the detail.",
  "i18n-census-post-h3": "The Free State after partition: 1926, 1936, 1946",
  "i18n-census-trend-h3": "Italian population trend in Ireland, 1891&ndash;1946",
  "i18n-census-post-intro": "From 1926 the census covers only the 26 counties of the Irish Free State: the six counties of Northern Ireland (shown here in grey) had their own separate census, under British administration, which does not fall within these figures. The official reports, moreover, no longer publish the figure county by county as in 1891-1911, but only by six macro-areas (see legend below): every county or city in the same area therefore shows the same aggregate value, not an individual figure. The age filter above has no effect on these three maps: these reports distinguish only by sex.",
  "i18n-census-detail-hint-post": "Click a county or city on one of the three maps to see the detail for that macro-area.",
  "i18n-census-boundaries-a": "Traditional county boundaries: derived from",
  "i18n-census-boundaries-b": "Wikimedia Commons (CC BY-SA 3.0), based on Ordnance Survey Ireland / Ordnance Survey Northern Ireland open data.",
  "i18n-census-btn-fonti": "See the original census tables (Sources)",
  "i18n-census-btn-elenchi": "Nominal lists of Italians in the censuses (by name)",
  "i18n-fonti-intro": "Original tables of the Irish censuses of 1891, 1901 and 1911: number of Italians recorded for each historical county and for the cities with separate administrative status. These are the source of the data used on the page <a class=\"pl\" onclick=\"document.querySelector('nav button[data-tab=&quot;censuses&quot;]').click()\">Italians in Ireland</a>.",
  "i18n-fonti-all": "All (with changes, 1891-1911)",
  "i18n-fonti-sex-b": "Sex:",
  "i18n-fonti-both": "Both",
  "i18n-fonti-men": "Men",
  "i18n-fonti-women": "Women",
  "i18n-fonti-age-b": "Age:",
  "i18n-fonti-age-hint": "The age filter only applies to 1891, 1901, 1911 and to &ldquo;All&rdquo;: the 1926-1946 reports distinguish only by sex, and at macro-area level (not county by county).",
  "i18n-elenchi-intro": "Nominal list of the people identified as Italian in the Irish censuses, with a link to each one&rsquo;s profile where one already exists in the database. The published official total (the maps above) and the number of people actually identified one by one rarely coincide: profiling an entire census name by name is a long task, still ongoing.",
  "i18n-elenchi-census-b": "Census:",
  "i18n-elenchi-whyyears": "Why only these three years? The originals of the 19th-century Irish censuses are almost all lost: the 1821-1851 forms were sent to be pulped during the First World War for lack of paper, those from 1861 and 1871 were destroyed by government order shortly after tabulation, and those from 1881 and 1891 were destroyed in the fire at the Public Record Office of Ireland during the Battle of the Four Courts, in June 1922: only the printed aggregate tables survive (used for the 1891 map above), not the nominal forms. 1901 and 1911, by contrast, are the two Irish censuses whose original forms have survived intact and are today digitised and searchable name by name on the National Archives of Ireland website. 1926 is the first census of the new Irish Free State (the 26 southern counties; the six counties of Northern Ireland had their own separate census, under British administration, not included here), and its nominal forms have recently been made public. 1936 and 1946, although present in the maps above with only the aggregate figure, remain instead covered by the hundred-year statistical secrecy provided for by Irish law: they will open in 2036 and 2046 respectively, so for now it is not possible to build a nominal list of them.",
  "i18n-elenchi-national": "All of Ireland",
  "i18n-elenchi-percounty": "By county:",
};

function applyStaticI18n(){
  /*ARIALABELS*/
  document.querySelectorAll("[data-i18n-aria]").forEach(function(el){
    if(!el.dataset.ariaEn) el.dataset.ariaEn = el.getAttribute("aria-label") || "";
    el.setAttribute("aria-label", LANG === "en" ? el.dataset.ariaEn : el.dataset.i18nAria);
  });
  /*END ARIALABELS*/
  for(const id in STATIC_I18N){
    const el = document.getElementById(id);
    if(!el) continue;
    if(el.dataset.itHtml===undefined) el.dataset.itHtml = el.innerHTML;
    el.innerHTML = LANG==="en" ? STATIC_I18N[id] : el.dataset.itHtml;
  }
  /*COLOPHON*/
  var __cd = document.querySelectorAll(".colDate");
  if(__cd.length){
    var __s = new Date().toLocaleDateString(LANG==="en"?"en-IE":"it-IT",{day:"numeric",month:"long",year:"numeric"});
    __cd.forEach(function(x){ x.textContent = __s; });
  }
  /*END COLOPHON*/
  document.documentElement.lang = LANG;
  const toggle = document.getElementById("langToggle");
  if(toggle) toggle.textContent = LANG==="en" ? "ITA" : "EN";
}


// ---------------- Guided tour (spotlight on the header menu)
const TOUR_STEPS = [
  {tab:null, icon:"\u{1F44B}", title:TT("Welcome","Benvenuto"), text:TT(
    "This database brings together more than 150 years of Italian presence in Ireland: individual profiles, family ties and verifiable archival sources. A one-minute tour of the main pages — skip any time.",
    "Questo database raccoglie oltre 150 anni di presenza italiana in Irlanda: profili individuali, legami familiari e fonti d’archivio verificabili. Un minuto per orientarti tra le pagine principali — puoi saltare quando vuoi."
  )},
  {tab:"censuses", icon:"\u{1F4DC}", title:"Italians in Ireland", text:TT(
    "The starting point: six maps of the Irish censuses (1891–1946) with the number of Italians by county, filterable by sex and age. The data comes from the official tables of the National Archives of Ireland.",
    "Il punto di partenza: sei mappe dei censimenti irlandesi (1891–1946) con il numero di italiani per contea, filtrabili per sesso ed età. I dati vengono dalle tabelle ufficiali del National Archives of Ireland."
  )},
  {tab:"map", icon:"\u{1F5FA}\u{FE0F}", title:"Map", text:TT(
    "Every person’s movements over time, reconstructed event by event and placed on the historical Ordnance Survey map from the early 1900s.",
    "Gli spostamenti di ogni persona nel tempo, ricostruiti evento per evento e collocati sulla mappa storica Ordnance Survey di inizio ’900."
  )},
  {tab:"people", icon:"\u{1F464}", title:"People", text:TT(
    "The site’s biographical index: search by name or family and open each person’s profile, with a full timeline of events and the source cited for every fact.",
    "L’indice biografico del sito: cerca per nome o famiglia e apri la scheda di ciascuna persona, con cronologia completa degli eventi e la fonte citata per ogni dato."
  )},
  {tab:"fonti", icon:"\u{1F4DA}", title:"Sources", text:TT(
    "The documentary foundation of the site: the original census tables, as published, county by county — so you can verify every number shown elsewhere on the site yourself.",
    "La base documentaria del sito: le tabelle originali dei censimenti, così come pubblicate, contea per contea — per verificare tu stesso ogni numero mostrato altrove nel sito."
  )},
  {tab:null, icon:"✅", title:TT("Ready to explore","Pronto per iniziare"), text:TT(
    "The other pages — Families, Family Tree, Timeline, Statistics, Italians in the Censuses — are in the same menu. The “Tutorial” button above reopens this guide any time.",
    "Le altre pagine — Families, Family Tree, Timeline, Statistics, Italians in the Censuses — si trovano nello stesso menù. Il pulsante “Tutorial” qui sopra riapre questa guida in qualsiasi momento."
  ), cta:TT("Start exploring","Inizia a esplorare")},
];
let tourIdx = 0, tourActive = false;
function tourSeenGet(){ try { return localStorage.getItem("tourSeen")==="1"; } catch(e){ return true; } }
function tourSeenSet(){ try { localStorage.setItem("tourSeen","1"); } catch(e){} }
function tourPlace(){
  const step = TOUR_STEPS[tourIdx];
  const hole = document.getElementById("tourHole"), card = document.getElementById("tourCard");
  if(step.tab){
    document.querySelector('nav button[data-tab="'+step.tab+'"]').click();
    const btn = document.querySelector('nav button[data-tab="'+step.tab+'"]');
    const r = btn.getBoundingClientRect();
    hole.style.left = (r.left-4)+"px"; hole.style.top = (r.top-4)+"px";
    hole.style.width = (r.width+8)+"px"; hole.style.height = (r.height+8)+"px";
    hole.style.opacity = 1;
    card.classList.remove("centered");
    let left = r.left + r.width/2 - 150;
    left = Math.max(12, Math.min(left, window.innerWidth - 312));
    card.style.left = left+"px";
    card.style.top = (r.bottom + 14)+"px";
  } else {
    document.querySelector('nav button[data-tab="home"]').click();
    hole.style.opacity = 0;
    card.classList.add("centered");
    card.style.left = ""; card.style.top = "";
  }
  document.getElementById("tourIcon").textContent = step.icon;
  document.getElementById("tourTitle").textContent = step.title;
  document.getElementById("tourText").textContent = step.text;
  card.classList.add("show");
  document.getElementById("tourDots").innerHTML = TOUR_STEPS.map((_,j)=>'<span class="tourDot'+(j===tourIdx?' on':'')+'"></span>').join("");
  document.getElementById("tourCount").textContent = TT("Step ","Passo ")+(tourIdx+1)+TT(" of "," di ")+TOUR_STEPS.length;
  document.getElementById("tourSkip").textContent = TT("Skip tutorial","Salta il tutorial");
  document.getElementById("tourPrev").textContent = TT("Back","Indietro");
  document.getElementById("tourPrev").disabled = tourIdx===0;
  document.getElementById("tourNext").textContent = step.cta || (tourIdx===TOUR_STEPS.length-1 ? TT("Done","Fine") : TT("Next","Avanti"));
}
function tourNext(){ if(tourIdx<TOUR_STEPS.length-1){ tourIdx++; tourPlace(); } else tourEnd(); }
function tourPrev(){ if(tourIdx>0){ tourIdx--; tourPlace(); } }
function tourEnd(){
  tourActive = false;
  document.getElementById("tourHole").style.opacity = 0;
  document.getElementById("tourCard").classList.remove("show");
}
window.startTour = function(fromHelp){
  tourIdx = 0; tourActive = true; tourPlace();
  if(!fromHelp) tourSeenSet();
};
document.getElementById("tourNext").onclick = tourNext;
document.getElementById("tourPrev").onclick = tourPrev;
document.getElementById("tourSkip").onclick = tourEnd;
document.addEventListener("keydown", (e)=>{
  if(!tourActive) return;
  if(e.key==="ArrowRight" || e.key==="Enter"){ e.preventDefault(); tourNext(); }
  else if(e.key==="ArrowLeft"){ e.preventDefault(); tourPrev(); }
  else if(e.key==="Escape"){ e.preventDefault(); tourEnd(); }
});

// ---------------- FAQ (reuses the #overlay/#pmodal shell)
const FAQ_ITEMS = [
  {q:TT("What is this site?","Cos’è questo sito?"), a:TT(
    "A prosopographical database of Italians in Ireland, from 1850 to 2026: individual profiles, family ties, geographic movements and archival sources, reconstructed from the Irish censuses and civil registration records.",
    "È un database prosopografico degli italiani in Irlanda, dal 1850 al 2026: profili individuali, legami familiari, spostamenti geografici e fonti d’archivio, ricostruiti a partire dai censimenti irlandesi e dai registri di stato civile."
  )},
  {q:TT("Where does the data come from?","Da dove vengono i dati?"), a:TT(
    "Mainly from the Irish censuses (1891–1946) and from birth, marriage and death records available on irishgenealogy.ie and the National Archives of Ireland; some profiles also draw on supplementary sources such as FindAGrave or the historical Thom’s Directories. Each event on a person’s profile links to its original source where available.",
    "Principalmente dai censimenti irlandesi (1891–1946) e dai registri di nascita, matrimonio e morte consultabili su irishgenealogy.ie e sul National Archives of Ireland; alcune schede includono anche fonti complementari come FindAGrave o le Thom’s Directories storiche. Ogni evento nella scheda di una persona riporta, quando disponibile, il collegamento alla fonte originale."
  )},
  {q:TT("Why doesn’t the official census total match the number of people listed in “Italians in the Censuses”?","Perché il totale ufficiale dei censimenti non coincide con il numero di persone elencate in “Italians in the Censuses”?"), a:TT(
    "The published official total comes from the aggregate census tables, while the nominal list requires identifying every person individually in the original returns — a long task, still in progress, so the two numbers rarely match exactly.",
    "Il totale ufficiale pubblicato viene dalle tabelle aggregate dei censimenti, mentre l’elenco nominativo richiede identificare una per una tutte le persone nei moduli originali: è un lavoro lungo, ancora in corso, per cui i due numeri raramente coincidono."
  )},
  {q:TT("Who are the “false Italians” excluded from the count?","Chi sono i “falsi italiani” esclusi dal conteggio?"), a:TT(
    "People born in Italy but not part of the Italian community in Ireland — for example children of foreign officials, clergy or military personnel stationed in the country. The censuses record them as “born in Italy”, but they are not part of the Italian migration this site documents.",
    "Sono le persone nate in Italia ma non appartenenti alla comunità italiana d’Irlanda, ad esempio figli di funzionari, ecclesiastici o militari stranieri di stanza nel paese: i censimenti le contano come “nate in Italia”, ma non fanno parte della migrazione italiana che il sito documenta."
  )},
  {q:TT("Why is there no nominal list for 1891, 1936 and 1946?","Perché non c’è un elenco nominativo per il 1891, il 1936 e il 1946?"), a:TT(
    "The original 1891 census returns were destroyed in the fire at the Public Record Office during the Battle of the Four Courts (June 1922): only the printed aggregate tables survive. 1936 and 1946 remain covered by the hundred-year statistical secrecy rule under Irish law, and will open in 2036 and 2046 respectively.",
    "I moduli originali del censimento del 1891 sono andati distrutti nell’incendio del Public Record Office durante la battaglia delle Four Courts (giugno 1922): sopravvivono solo le tabelle aggregate a stampa. Il 1936 e il 1946 restano invece coperti dal segreto statistico dei cento anni previsto dalla legge irlandese, e apriranno rispettivamente nel 2036 e nel 2046."
  )},
  {q:TT("What does “c.” before a date mean (e.g. “c. 1876”)?","Cosa significa “c.” prima di una data (es. “c. 1876”)?"), a:TT(
    "It’s the abbreviation for “circa”: it means the year isn’t known with certainty from the available sources, but has been estimated — for example from an age declared in a census.",
    "È l’abbreviazione di “circa”: indica che l’anno non è noto con certezza dalle fonti disponibili, ma è stato stimato — ad esempio dall’età dichiarata in un censimento."
  )},
  {q:TT("Why does a person appear in more than one family?","Perché una persona compare in più di una famiglia?"), a:TT(
    "This happens for married women: the profile shows both the family of birth and the one acquired through marriage (shown as “in Surname”). In the family list and the family tree, this person will therefore appear under both households.",
    "Accade per le donne sposate: la scheda mostra sia la famiglia di nascita sia quella acquisita con il matrimonio (indicata come “in Cognome”). Nell’elenco delle famiglie e nell’albero genealogico questa persona comparirà quindi in entrambi i nuclei."
  )},
  {q:TT("Is the data complete and final?","I dati sono completi e definitivi?"), a:TT(
    "No — this is an ongoing research project. Some profiles are more detailed than others, some families don’t yet have a written history, and new censuses or sources may add or correct information over time.",
    "No: è un progetto di ricerca in corso. Alcune schede sono più dettagliate di altre, alcune famiglie non hanno ancora una storia scritta, e nuovi censimenti o fonti possono aggiungere o correggere informazioni nel tempo."
  )},
  {q:TT("How do I see the source for a single event in someone’s life?","Come faccio a vedere la fonte di un singolo evento nella vita di una persona?"), a:TT(
    "Open the person’s profile (from the People page, the map, or the family tree): each event in their timeline links directly to its source, where available (a census return, a civil record, and so on).",
    "Apri la scheda della persona (dalla pagina People, dalla mappa o dall’albero genealogico): ogni evento nella sua cronologia riporta, quando disponibile, un collegamento diretto alla fonte (atto di censimento, di stato civile, ecc.)."
  )},
  {q:TT("How does the historical map overlay work?","Come funziona la mappa storica in sovrimpressione?"), a:TT(
    "On the Map page you can turn on the early-1900s Ordnance Survey map (1888–1915): it becomes visible once you zoom in (from level 16) on an area with known locations, so you can see what the area looked like at the time of the movements you’re viewing.",
    "Nella pagina Map puoi attivare la mappa Ordnance Survey di inizio ’900 (1888–1915): diventa visibile quando fai zoom (dal livello 16) su una zona con località note, per vedere come appariva il territorio all’epoca degli spostamenti che stai osservando."
  )},
  {q:TT("Why don’t some people have a photo?","Perché alcune persone non hanno una foto?"), a:TT(
    "Photos are added when they survive in the project’s archive; for most people who lived more than a century ago, none has survived — or none has been found yet.",
    "Le foto vengono aggiunte quando sono conservate nell’archivio del progetto; per la maggior parte delle persone vissute più di un secolo fa non ne è sopravvissuta nessuna, o non è ancora stata reperita."
  )},
  {q:TT("Is the site available in English?","Il sito è disponibile anche in inglese?"), a:TT(
    "Yes: the button in the top right (ITA/EN) switches the language of the entire site, including maps and charts.",
    "Sì: il pulsante in alto a destra (ITA/EN) cambia la lingua dell’intero sito, mappe e grafici compresi."
  )},
  {q:TT("I’ve found an error, or I have information about a missing person or family — how do I get in touch?","Ho trovato un errore, o ho informazioni su una persona o famiglia mancante: come ti contatto?"), a:TT(
    "Write to me — you’ll find my email address by clicking my name <a class=\"pl\" href=\"https://irishhistorians.ie/members/lucaba/\" target=\"_blank\" rel=\"noopener\">here</a>.",
    "Scrivimi pure: trovi il mio indirizzo email cliccando sul mio nome <a class=\"pl\" href=\"https://irishhistorians.ie/members/lucaba/\" target=\"_blank\" rel=\"noopener\">qui</a>."
  )},
  {q:TT("Can I reuse this data for my own research?","Posso riutilizzare questi dati per la mia ricerca?"), a:TT(
    "The public data — censuses and civil records — is in the public domain, and you’re free to consult it at the original sources linked on every profile. The genealogical reconstructions, notes and connections between sources gathered here are released under a Creative Commons BY-NC 4.0 licence: you may reuse them for non-commercial purposes, citing the author and this site. The photographs are excluded from the licence and remain with their owners: please get in touch before reproducing them.",
    "I dati pubblici — censimenti e atti di stato civile — sono di dominio pubblico, e puoi consultarli liberamente alle fonti originali collegate a ogni scheda. Le ricostruzioni genealogiche, le note e i collegamenti tra fonti raccolti qui sono distribuiti con licenza Creative Commons BY-NC 4.0: puoi riutilizzarli per scopi non commerciali citando l’autore e il sito. Le fotografie sono escluse dalla licenza e restano dei rispettivi proprietari: per riprodurle scrivimi."
  )},
  {q:TT("Who curates this site, and why?","Chi cura questo sito, e perché?"), a:TT(
    "The site is curated by <a class=\"pl\" href=\"https://irishhistorians.ie/members/lucaba/\" target=\"_blank\" rel=\"noopener\">Luca Bertolani Azeredo, PhD</a>, a historian. It is part of a research project to write a new history of the Italians in Ireland between the late nineteenth century and 1926, built on the systematic cross-referencing of censuses, civil records and other archival sources.",
    "Il sito è curato da <a class=\"pl\" href=\"https://irishhistorians.ie/members/lucaba/\" target=\"_blank\" rel=\"noopener\">Luca Bertolani Azeredo, PhD</a>, storico. Fa parte di un progetto di ricerca per scrivere una nuova storia degli italiani in Irlanda tra la fine dell’Ottocento e il 1926, basata sull’incrocio sistematico di censimenti, atti di stato civile e altre fonti d’archivio."
  )},
];
window.openFaq = function(){
  const el = document.getElementById("pmodal");
  let h = '<button id="pmClose" onclick="closePerson()">&times;</button>';
  h += '<h2>FAQ</h2>';
  h += '<div class="faqList">'+FAQ_ITEMS.map(f=>
    '<details class="faqItem"><summary>'+f.q+'</summary><div class="faqA">'+f.a+'</div></details>'
  ).join("")+'</div>';
  el.innerHTML = h;
  document.getElementById("overlay").style.display = "block";
  el.style.display = "block"; el.scrollTop = 0;
};

applyStaticI18n();
if(!tourSeenGet()) startTour(false);

