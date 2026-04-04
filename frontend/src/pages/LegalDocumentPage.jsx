import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Shield, FileText, Database, Lock, BookOpen, Cookie, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DOCS = {
  // ── Compliance docs (with consent button) ─────────────────────────────────
  gdpr: {
    title: 'Conformitate GDPR',
    icon: <Shield className="w-6 h-6 text-emerald-400" />,
    color: 'emerald',
    typeKey: 'gdpr',
    content: `POLITICA DE CONFIDENȚIALITATE ȘI PRELUCRARE A DATELOR (GDPR)

La SyncFit (operată de EcoSync SRL), respectăm intimitatea ta și ne conformăm integral Regulamentului General privind Protecția Datelor (UE) 2016/679 (GDPR).

1. DATELE COLECTATE ȘI SCOPUL
Colectăm exclusiv datele necesare pentru furnizarea serviciului de wellbeing:
• Informații de bază: nume, email, oraș.
• Parametri de muncă: program de lucru declarat.
• Preferințe: sporturi selectate.
Aceste date sunt utilizate exclusiv pentru a-ți oferi recomandări de pauze la momente optime și pentru a facilita contactul cu alți colegi pasionați de aceleași sporturi.

2. TEMEIUL JURIDIC
Prelucrarea se face pe baza consimțământului tău (Art. 6 alin. 1 lit. a) și pentru executarea contractului de utilizare a platformei (Art. 6 alin. 1 lit. b).

3. TRANSFERUL DATELOR
SyncFit NU partajează datele tale cu departamentele de HR / Management ale angajatorului tău în format individualizat. Orice raportare cerută de angajator (dacă există parteneriat B2B) se va face 100% anonimizat și agregat, exclusiv pentru a oferi statistici despre sănătatea generală a echipelor. Datele nu sunt vândute niciodată terților.

4. DREPTURILE TALE
În conformitate cu GDPR, beneficiezi de:
• Dreptul de acces (obținerea unei copii a datelor).
• Dreptul de intervenție/rectificare (modificarea profilului).
• Dreptul la uitare (ștergerea contului și a tuturor log-urilor asociate).
• Dreptul de portabilitate a datelor.
• Dreptul la restricționarea prelucrării.
• Dreptul de opoziție față de prelucrare.

5. DURATA DE STOCARE
Datele sunt păstrate pe durata utilizării platformei și maximum 12 luni după dezactivarea contului, cu excepția situațiilor prevăzute de lege.

6. SECURITATEA DATELOR
Aplicăm măsuri tehnice și organizatorice adecvate: criptare TLS 1.3 în tranzit, AES-256 în repaus, hashing bcrypt pentru parole.

7. CONTACT DPO
Pentru exercitarea drepturilor tale, ne poți trimite o solicitare oricând la adresa: privacy@syncfit.ro. Răspundem legal în maximum 30 de zile.

Prin acceptul exprimat pe această pagină, confirmi că ai citit, înțeles și agreat aceste condiții privind prelucrarea informațiilor tale personale în platforma SyncFit.`,
  },

  criptare: {
    title: 'Securitatea Datelor & Criptare',
    icon: <Database className="w-6 h-6 text-sky-400" />,
    color: 'sky',
    typeKey: 'criptare',
    content: `POLITICA PRIVIND SECURITATEA INFORMAȚIEI ȘI CRIPTAREA DATELOR

Securitatea datelor tale este tratată cu maximă responsabilitate tehnică.

1. CRIPTAREA ÎN TRANZIT (IN-TRANSIT)
Toate comunicațiile dintre browserul/dispozitivul tău și serverele SyncFit sunt securizate pe baza protocolului TLS 1.3 (HTTPS). Nimeni din exterior, inclusiv rețelele prin care faci browsing, nu poate intercepta informațiile trimise sau primite de tine.

2. CRIPTAREA LA REPAUS (AT-REST)
Informațiile salvate în baza noastră de date sunt protejate prin mecanisme de criptare AES-256 (Advanced Encryption Standard). Aceasta include jurnale de ședințe, programe de lucru și orice informații extrase din calendar.

3. SECURITATEA PAROLELOR
Nu stocăm parolele în format text simplu, sub nicio formă. Toate credențialele tale sunt hashuite și sărate (hashed & salted) folosind algoritmul bcrypt cu factor de lucru securizat.

4. GĂZDUIRE ȘI INFRASTRUCTURĂ
Platforma folosește exclusiv resurse enterprise pe infrastructuri cloud certificate. Auditurile de securitate au loc recurent, iar accesul inginerilor la date de producție este limitat și cu audit logs active.

5. NOTIFICAREA BREȘELOR
În caz de incident de securitate, EcoSync SRL se angajează să notifice autoritățile (ANSPDCP) în maximum 72 de ore, conform Art. 33 GDPR. Utilizatorii afectați vor fi informați fără întârziere nejustificată.

6. CONFORMITATE ISO
Infrastructura noastră respectă normele ISO 27001 pentru managementul securității informației.

Ești în siguranță cu SyncFit.`,
  },

  anspdcp: {
    title: 'Prevederi ANSPDCP',
    icon: <FileText className="w-6 h-6 text-violet-400" />,
    color: 'violet',
    typeKey: 'anspdcp',
    content: `CONFORMITATEA NAȚIONALĂ – ANSPDCP

Pe lângă normele europene, la SyncFit (EcoSync SRL) ne asigurăm că respectăm reglementările naționale de supraveghere.

1. CADRUL LEGAL
Operăm strict în conformitate cu:
• Regulamentul (UE) 2016/679 (GDPR).
• Legea 190/2018 privind măsuri de punere în aplicare a GDPR în România.
• Recomandările și ghidurile emise de ANSPDCP.

2. OPERATOR DE DATE
EcoSync SRL este declarat ca operator de date cu caracter personal. Ne asumăm oficial prelucrarea conform bunelor practici. Adresa de corespondență: Str. Dorobanților 15, București 010573.

3. RAPORTAREA INCIDENTELOR
Conform Art. 33 din GDPR, în caz de breșă de securitate ce îți poate afecta datele personale, ne asumăm alertarea neîntârziată (sub termenul stabilit de 72 de ore) a autorității competente ANSPDCP. Utilizatorii vor fi de asemenea notificați.

4. DREPTUL DE A DEPUNE PLÂNGERE
Orice utilizator care consideră că drepturile sale sunt lezate se poate adresa:
• Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)
• Website: www.dataprotection.ro
• Telefon: +40 31 805 9211
• Adresă: B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București

5. RESPONSABIL CU PROTECȚIA DATELOR (DPO)
Contact DPO: privacy@syncfit.ro

Ne propunem un mediu corporativ digital etic 100%.`,
  },

  // ── Informational docs (no consent button) ────────────────────────────────
  privacy: {
    title: 'Politica de Confidențialitate',
    icon: <Lock className="w-6 h-6 text-indigo-400" />,
    color: 'indigo',
    typeKey: null,
    content: `POLITICA DE CONFIDENȚIALITATE – SYNCFIT

Ultima actualizare: Ianuarie 2026

SyncFit (operată de EcoSync SRL) se angajează să protejeze și să respecte confidențialitatea datelor tale personale. Această politică explică ce date colectăm, de ce le colectăm și cum le utilizăm.

1. DATELE PE CARE LE COLECTĂM
• Date de identificare: nume complet, adresă de email.
• Date de locație: orașul în care lucrezi.
• Preferințe: sporturi favorite, program de lucru.
• Date de utilizare: ore de pauze luate, locație de lucru (birou/acasă), streak-uri de activitate.
• Date de calendar: ședințe și disponibilitate (doar cu integrare activată).

2. CUM UTILIZĂM DATELE
• Furnizarea serviciului de wellbeing și recomandări personalizate de pauze.
• Facilitarea matching-ului cu colegi interesați de aceleași activități sportive.
• Îmbunătățirea platformei prin statistici agregate și anonimizate.

3. BAZA LEGALĂ
• Consimțământul tău explicit la înregistrare (Art. 6(1)(a) GDPR).
• Executarea contractului de utilizare (Art. 6(1)(b) GDPR).
• Interesul legitim în furnizarea unui serviciu de wellbeing corporativ (Art. 6(1)(f) GDPR).

4. CU CINE PARTAJĂM DATELE
Nu vindem niciodată datele tale. Nu partajăm datele individuale cu angajatorul tău. Orice raportare B2B este exclusiv agregată și anonimizată. Subprocesatorii noștri (furnizori de cloud) sunt contractați cu clauze de prelucrare a datelor conforme GDPR.

5. DREPTURILE TALE
• Acces: poți solicita o copie a datelor tale oricând.
• Rectificare: poți corecta datele din profilul tău.
• Ștergere: poți solicita ștergerea completă a contului și datelor.
• Portabilitate: poți primi datele tale în format electronic.
• Opoziție: te poți opune anumitor tipuri de prelucrare.

6. DURATA DE STOCARE
Datele sunt păstrate activ pe durata utilizării platformei. Ulterior dezactivării contului, datele sunt șterse în maximum 12 luni, cu excepția obligațiilor legale.

7. MODIFICĂRI ALE POLITICII
Orice modificare semnificativă va fi comunicată prin email cu 30 de zile înainte de aplicare.

Contact: privacy@syncfit.ro`,
  },

  terms: {
    title: 'Termeni și Condiții',
    icon: <BookOpen className="w-6 h-6 text-amber-400" />,
    color: 'amber',
    typeKey: null,
    content: `TERMENI ȘI CONDIȚII DE UTILIZARE – SYNCFIT

Ultima actualizare: Ianuarie 2026

Prin utilizarea platformei SyncFit, ești de acord cu prezentele Termeni și Condiții de Utilizare. Te rugăm să le citești cu atenție.

1. ELIGIBILITATE ȘI ACCES
Platforma SyncFit este destinată angajaților companiilor partenere (ING Group și parteneri). Accesul este permis pe baza unui cont valid de serviciu. Partajarea accesului sau utilizarea abuzivă este strict interzisă și poate duce la suspendarea contului.

2. UTILIZAREA SERVICIULUI
• SyncFit NU înlocuiește sfatul medical, psihologic sau nutrițional profesionist.
• Recomandările de pauze și activitate fizică sunt orientative, bazate pe pattern-uri de lucru declarate.
• Utilizatorul este singurul responsabil pentru acuratețea datelor introduse în platformă.
• Este interzisă introducerea datelor false sau înșelătoare.

3. CONT ȘI SECURITATE
• Ești responsabil(ă) pentru confidențialitatea credențialelor contului tău.
• Trebuie să notifici imediat EcoSync SRL (support@syncfit.ro) în cazul oricărui acces neautorizat.
• Nu îți partaja parola cu nimeni, inclusiv cu colegii.

4. PROPRIETATE INTELECTUALĂ
Toate elementele platformei SyncFit — design, cod sursă, algoritmi, conținut — sunt proprietatea exclusivă a EcoSync SRL și sunt protejate de legislația drepturilor de autor. Este interzisă copierea, reproducerea sau distribuirea fără acordul scris al EcoSync SRL.

5. CONDUITĂ INTERZISĂ
Este strict interzis să:
• Accesezi sau să încerci să accesezi datele altor utilizatori fără autorizare.
• Utilizezi platforma pentru scopuri comerciale neautorizate.
• Introduci cod malițios sau să interferezi cu funcționarea platformei.
• Hărțuiești sau să intimidezi alți utilizatori prin funcțiile de matching.

6. LIMITAREA RĂSPUNDERII
EcoSync SRL nu este responsabilă pentru:
• Daune indirecte, incidentale sau de altă natură rezultate din utilizarea platformei.
• Întreruperi temporare de serviciu (SLA: 99.5% disponibilitate lunară).
• Decizii luate pe baza recomandărilor platformei.

7. MODIFICĂRI ALE TERMENILOR
Ne rezervăm dreptul de a modifica acești Termeni cu notificare de minimum 30 de zile. Continuarea utilizării platformei după data intrării în vigoare constituie acceptul modificărilor.

8. REZILIEREA
EcoSync SRL poate suspenda sau rezilia accesul în cazul încălcării acestor Termeni, fără notificare prealabilă în cazuri grave.

9. LEGISLAȚIE APLICABILĂ ȘI LITIGII
Prezentele Termeni sunt guvernate de legislația română. Eventualele litigii se vor soluționa pe cale amiabilă în primul rând, iar în caz de eșec, la instanțele competente din municipiul București.

Contact: legal@syncfit.ro`,
  },

  cookies: {
    title: 'Politica de Cookies',
    icon: <Cookie className="w-6 h-6 text-orange-400" />,
    color: 'orange',
    typeKey: null,
    content: `POLITICA DE COOKIES – SYNCFIT

Ultima actualizare: Ianuarie 2026

SyncFit folosește cookie-uri și tehnologii similare (localStorage, sessionStorage) pentru funcționarea și îmbunătățirea platformei. Această politică explică ce sunt acestea, cum le folosim și cum le poți controla.

1. CE SUNT COOKIE-URILE
Cookie-urile sunt fișiere text mici stocate pe dispozitivul tău când vizitezi o platformă web. Ele permit platformei să îți "amintească" anumite informații, îmbunătățind experiența de utilizare.

2. TIPURI DE COOKIE-URI UTILIZATE

Cookie-uri ESENȚIALE (obligatorii, nu pot fi dezactivate)
• syncfit_user – Sesiunea de autentificare și datele de profil.
• syncfit_privacy – Preferințele tale de confidențialitate.
• syncfit_cookie_consent – Răspunsul tău la această politică de cookies.
Fără aceste cookie-uri, platforma nu poate funcționa.

Cookie-uri FUNCȚIONALE (opționale, recomandate)
• Memorizarea preferinței de locație de lucru (birou/acasă).
• Setări de notificări și preferințe de interfață.
• Starea calendarului și a evenimentelor salvate local.
Pot fi dezactivate din setările de confidențialitate ale platformei.

Cookie-uri ANALITICE (opționale)
• Statistici anonime de utilizare (număr de sesiuni, funcționalități utilizate).
• Utilizăm date exclusiv agregate, fără identificare individuală.
• Ne ajută să îmbunătățim platforma.
Pot fi dezactivate oricând.

3. STORAGE LOCAL (localStorage / sessionStorage)
Pe lângă cookie-uri propriu-zise, SyncFit folosește Web Storage API pentru stocarea locală a datelor de sesiune și preferințe. Aceste date rămân pe dispozitivul tău și nu sunt transmise automat la server.

4. NU FOLOSIM COOKIE-URI THIRD-PARTY
SyncFit nu integrează cookies de urmărire de la terțe părți (ex. Google Analytics, Facebook Pixel, reclame). Nu ești urmărit(ă) pe alte site-uri.

5. DURATA COOKIE-URILOR
• Cookie-uri de sesiune: expiră când închizi browserul.
• Cookie-uri persistente (syncfit_user): expiră după 30 de zile de la ultima utilizare.
• Cookie-uri de preferințe: persistă 12 luni.

6. CUM ÎȚI POȚI GESTIONA PREFERINȚELE
• Din banner-ul afișat la prima vizită pe platformă.
• Din setările de confidențialitate accesibile din footer.
• Din setările browserului tău (Chrome, Firefox, Safari, Edge).
Atenție: dezactivarea cookie-urilor esențiale va împiedica funcționarea corectă a platformei.

7. MODIFICĂRI
Orice modificare semnificativă a acestei politici va fi comunicată prin banner la prima vizită după modificare.

Contact: privacy@syncfit.ro`,
  },

  contact: {
    title: 'Contact',
    icon: <Phone className="w-6 h-6 text-teal-400" />,
    color: 'teal',
    typeKey: null,
    content: `CONTACTEAZĂ-NE

Suntem disponibili să te ajutăm cu orice întrebare legată de SyncFit.

1. DATE DE CONTACT

SyncFit by EcoSync SRL
Str. Dorobanților 15, Sector 1
București 010573, România

CUI: RO12345678
Nr. Reg. Com.: J40/1234/2023

2. EMAIL

• General & Suport: contact@syncfit.ro
• Suport tehnic: support@syncfit.ro
• Protecția datelor (DPO): privacy@syncfit.ro
• Parteneriate B2B: partners@syncfit.ro
• Legal: legal@syncfit.ro

3. TELEFON

+40 21 123 4567
Program: Luni – Vineri, 9:00 – 17:00 (EET)

4. PROGRAM ASISTENȚĂ

Luni – Vineri: 9:00 – 18:00 (răspuns în max. 4 ore)
Weekend: Suport email (răspuns în max. 24 ore)

5. SOLICITĂRI GDPR

Pentru exercitarea drepturilor tale conform GDPR (acces, rectificare, ștergere, portabilitate), contactează DPO-ul nostru:

Email: privacy@syncfit.ro
Subiect email: "Solicitare GDPR – [tipul solicitării]"
Termen de răspuns: maximum 30 de zile calendaristice

6. SOCIAL MEDIA

• LinkedIn: linkedin.com/company/syncfit-ecosync
• Twitter/X: @SyncFitRO

7. RAPORTARE INCIDENTE DE SECURITATE

Dacă ai descoperit o vulnerabilitate de securitate, te rugăm să ne contactezi responsabil la:
security@syncfit.ro
Nu dezvăluim public detaliile înainte de remediere.`,
  },
}

const COLOR_MAP = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500', consent: 'bg-emerald-500/10 border-emerald-500/20', consentText: 'text-emerald-400' },
  sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     text: 'text-sky-400',     btn: 'bg-sky-600 hover:bg-sky-500',         consent: 'bg-sky-500/10 border-sky-500/20',         consentText: 'text-sky-400' },
  violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-400',  btn: 'bg-violet-600 hover:bg-violet-500',   consent: 'bg-violet-500/10 border-violet-500/20',   consentText: 'text-violet-400' },
  indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  text: 'text-indigo-400',  btn: 'bg-indigo-600 hover:bg-indigo-500',   consent: 'bg-indigo-500/10 border-indigo-500/20',   consentText: 'text-indigo-400' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   btn: 'bg-amber-600 hover:bg-amber-500',     consent: 'bg-amber-500/10 border-amber-500/20',     consentText: 'text-amber-400' },
  orange:  { bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  text: 'text-orange-400',  btn: 'bg-orange-600 hover:bg-orange-500',   consent: 'bg-orange-500/10 border-orange-500/20',   consentText: 'text-orange-400' },
  teal:    { bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    text: 'text-teal-400',    btn: 'bg-teal-600 hover:bg-teal-500',       consent: 'bg-teal-500/10 border-teal-500/20',       consentText: 'text-teal-400' },
}

export default function LegalDocumentPage() {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const doc = DOCS[docId]

  if (!doc) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Documentul nu a fost găsit</h1>
        <p className="text-slate-400 mb-6">Secțiunea legală căutată nu există sau a fost mutată.</p>
        <button onClick={() => navigate(-1)} className="text-indigo-400 hover:text-indigo-300">Înapoi</button>
      </div>
    )
  }

  const colors = COLOR_MAP[doc.color] ?? COLOR_MAP.indigo
  const alreadyConsented = doc.typeKey && user && user[`${doc.typeKey}Consent`] === true

  const handleConsent = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/auth/${user.userId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: doc.typeKey, accepted: true }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'A apărut o problemă la salvarea consimțământului.')
      }
      updateUser({ [`${doc.typeKey}Consent`]: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Sticky header */}
      <header className="border-b border-surface-border bg-zinc-950/90 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-border border border-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
            {doc.icon}
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">{doc.title}</h1>
            <p className="text-[10px] text-slate-500">SyncFit · EcoSync SRL</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 md:py-12 flex flex-col gap-6">
        {/* Document content */}
        <section className="bg-surface-card/40 border border-surface-border rounded-2xl p-6 md:p-10 shadow-lg">
          <div className="max-w-none">
            {doc.content.split('\n').map((line, i) => {
              if (i === 0) return (
                <h2 key={i} className={`text-xl font-bold ${colors.text} mb-6`}>{line}</h2>
              )
              if (line.match(/^\d+\./)) return (
                <h3 key={i} className="text-base font-bold text-white mt-8 mb-3">{line}</h3>
              )
              if (line.startsWith('•')) return (
                <p key={i} className="text-sm text-slate-300 ml-4 mb-1.5 flex items-start gap-2">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${colors.text.replace('text-', 'bg-')}`} />
                  {line.slice(1).trim()}
                </p>
              )
              if (line === '') return <div key={i} className="h-2" />
              return <p key={i} className="text-sm text-slate-300 mb-3 leading-relaxed">{line}</p>
            })}
          </div>
        </section>

        {/* Consent block — only for compliance docs */}
        {doc.typeKey && (
          <section className={`rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
            alreadyConsented
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : `${colors.bg} ${colors.border}`
          }`}>
            <div className="flex-1">
              <h4 className={`text-base font-bold mb-1 ${alreadyConsented ? 'text-emerald-400' : colors.text}`}>
                {alreadyConsented ? '✅ Consimțământ Activ' : 'Acord de specialitate'}
              </h4>
              <p className="text-sm text-slate-400">
                {alreadyConsented
                  ? `Ai acordat consimțământul pentru "${doc.title}". Mulțumim pentru încredere.`
                  : `Declară-ți acordul pentru ${doc.title} apăsând butonul alăturat. Datele sunt securizate și sincronizate cu serverele noastre.`}
              </p>
              {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            </div>
            <div className="shrink-0">
              {alreadyConsented ? (
                <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold">
                  <CheckCircle className="w-5 h-5" /> Acordat
                </div>
              ) : (
                <button
                  onClick={handleConsent}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl ${colors.btn} text-white font-semibold transition-all disabled:opacity-50`}
                >
                  {loading ? 'Se înregistrează...' : 'Sunt de acord'}
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
