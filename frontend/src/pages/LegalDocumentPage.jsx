import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Shield, FileText, Database } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DOCS = {
  gdpr: {
    title: 'Conformitate GDPR',
    icon: <Shield className="w-6 h-6 text-emerald-400" />,
    typeKey: 'gdpr', // for backend map
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

Pentru exercitarea acestor drepturi, ne poți trimite o solicitare oricând la adresa de email: privacy@syncfit.ro. Răspundem legal în maximum 30 de zile.

Prin acceptul exprimat pe această pagină, confirmi că ai citit, înțeles și agreat aceste condiții privind prelucrarea informațiilor tale personale în platforma SyncFit.`,
  },
  criptare: {
    title: 'Securitatea Datelor & Criptare',
    icon: <Database className="w-6 h-6 text-sky-400" />,
    typeKey: 'criptare',
    content: `POLITICA PRIVIND SECURITATEA INFORMAȚIEI ȘI CRIPTAREA DATELOR

Securitatea datelor tale este tratată cu maximă responsabilitate tehnică.

1. CRIPTAREA ÎN TRANZIT (IN-TRANSIT)
Toate comunicațiile dintre browserul/dispozitivul tău și serverele SyncFit sunt securizate pe baza protocolului TLS 1.3 (HTTPS). Nimeni din exterior, inclusiv rețelele prin care faci browsing, nu poate intercepta informațiile trimise sau primite de tine.

2. CRIPTAREA LA REPAUS (AT-REST)
Informațiile salvate în baza noastră de date, ce conțin jurnale de ședințe, programe de lucru sau orice informații extrase din calendar, sunt protejate prin mecanisme de criptare AES-256 (Advanced Encryption Standard). 

3. SECURITATEA PAROLELOR
Nu stocăm parolele în format text simplu, sub nicio formă. Toate credențialele tale sunt hashuite și sărate (hashed & salted) folosind algoritmii standard de bază (bcrypt cu factor de lucru securizat), implementați nativ.

4. GĂZDUIRE ȘI INFRASTRUCTURĂ (CLOUD)
Platforma folosește exclusiv resurse enterprise. Toate rețelele pe care operăm aplică standardelor de control stricte. Auditurile de securitate au loc recurent, iar accesul inginerilor la date de producție este limitat exclusiv în interesul depănării și cu audit logs active.

Ești în siguranță cu SyncFit.`,
  },
  anspdcp: {
    title: 'Prevederi ANSPDCP',
    icon: <FileText className="w-6 h-6 text-violet-400" />,
    typeKey: 'anspdcp',
    content: `CONFORMITATEA NAȚIONALĂ – ANSPDCP

Pe lângă normele europene, la SyncFit (EcoSync SRL) ne asigurăm că respectăm reglementările naționale de supraveghere. 

1. CADRUL LEGAL
Operăm strict în conformitate cu:
• Regulamentul (UE) 2016/679 (GDPR).
• Legea 190/2018 privind măsuri de punere în aplicare a GDPR în România.
• Recomandările ghidate de ANSPDCP.

2. OPERATOR DE DATE
EcoSync SRL este declarat ca operator de date cu caracter personal, asumându-ne oficial prelucrarea conform bunelor practici. Adresa noastră de corespondență este Str. Dorobanților 15, București. 

3. RAPORTAREA INCIDENTELOR
Conform Art. 33 din GDPR, în caz de breșă de securitate ce îți poate afecta datele personale, ne asumăm prin proceduri interne stricte alertarea neîntârziată (sub termenul stabilit de 72 de ore) a autorității competente ANSPDCP. Utilizatorii vor fi de asemenea notificați.

4. INSTRUMENTE DE SUPRAVEGHERE
Orice utilizator care se consideră lezat sub rezerva GDPR și care constată refuzuri privind exercitarea drepturilor la SyncFit se poate adresa Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal:
Website direct: www.dataprotection.ro.

Ne propunem un mediu corporativ digital etic 100%.`,
  }
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

  // Check current consent status
  const alreadyConsented = user && user[`${doc.typeKey}Consent`] === true

  const handleConsent = async () => {
    if (!user) {
      alert("Trebuie să fii conectat(ă) pentru a acorda sau actualiza consimțământul (Setări Profil / Cont).")
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

      // Update local context immediately
      updateUser({ [`${doc.typeKey}Consent`]: true })
      
      alert(`Consimțământul pentru '${doc.title}' a fost înregistrat cu succes în baza de date!`)
      
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="border-b border-surface-border bg-surface-card sticky top-0 z-10 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-border border border-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-border/30 flex items-center justify-center">
            {doc.icon}
          </div>
          <h1 className="text-lg font-bold text-white leading-tight">{doc.title}</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 md:py-12 flex flex-col gap-8">
        
        {/* Document Content */}
        <section className="bg-surface-card/40 border border-surface-border rounded-2xl p-6 md:p-10 shadow-lg">
          <div className="prose prose-invert prose-slate max-w-none prose-p:text-sm prose-p:leading-relaxed prose-h4:text-sm prose-p:text-slate-300">
            {doc.content.split('\n').map((line, i) => {
              if (line.match(/^\d+\./)) {
                return <h3 key={i} className="text-base font-bold text-white mt-6 mb-3">{line}</h3>
              }
              if (line.startsWith('•')) {
                return <p key={i} className="text-sm text-slate-300 ml-4 mb-1">{line}</p>
              }
              if (line === '') return <br key={i} />
              
              if (i === 0) {
                 // The very first line is usually the big document title
                 return <h2 key={i} className="text-xl font-bold text-indigo-400 mb-6">{line}</h2>
              }
              
              return <p key={i} className="text-sm text-slate-300 mb-4">{line}</p>
            })}
          </div>
        </section>

        {/* Consent Block */}
        <section className={`rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
          alreadyConsented 
            ? 'bg-emerald-500/10 border-emerald-500/20' 
            : 'bg-indigo-500/10 border-indigo-500/20'
        }`}>
          <div className="flex-1">
            <h4 className={`text-base font-bold mb-1 ${alreadyConsented ? 'text-emerald-400' : 'text-indigo-400'}`}>
              {alreadyConsented ? 'Consimțământ Activ' : 'Acord de specialitate'}
            </h4>
            <p className="text-sm text-slate-400">
              {alreadyConsented 
                ? `Ai acceptat această prevedere juridică. Baza de date atestă că ne-ai acordat consimțământul valid pentru politica privind ${doc.title}. Îți mulțumim pentru încredere.`
                : `Te rugăm să îți declari explicit acordul privind ${doc.title} apăsând butonul alăturat, moment în care un pachet securizat se va sincroniza cu serverele noastre.`}
            </p>
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </div>

          <div className="shrink-0">
            {alreadyConsented ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold cursor-not-allowed">
                <CheckCircle className="w-5 h-5" /> Acordat · Totul e în regulă
              </div>
            ) : (
              <button 
                onClick={handleConsent} 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Se înregistrează...' : 'Sunt de acord'}
              </button>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
