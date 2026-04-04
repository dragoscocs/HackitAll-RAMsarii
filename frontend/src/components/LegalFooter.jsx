import { useState } from 'react'
import { X } from 'lucide-react'

// ── Legal content ─────────────────────────────────────────────────────────────
const LEGAL_CONTENT = {
  'Politica de Confidențialitate': {
    icon: '🔒',
    body: `SyncFit prelucrează datele tale personale (nume, email, preferințe sportive, locație de lucru) în conformitate cu Regulamentul General privind Protecția Datelor (GDPR) 2016/679.

Datele sunt utilizate exclusiv pentru furnizarea serviciilor de wellbeing corporativ și matching sportiv. Nu transmitem datele tale către terțe părți fără consimțământul explicit.

Categorii de date prelucrate:
• Date de identificare: nume, adresă de email
• Date de preferințe: sporturi preferate, oraș
• Date de utilizare: program de lucru, ore de pauze, locație de lucru (birou/acasă)
• Date de calendar: ședințe și evenimente (numai cu integrare Microsoft 365 activată)

Baza legală pentru prelucrare: executarea contractului (furnizarea serviciului) și interesul legitim (îmbunătățirea wellbeing-ului angajaților).

Durata de stocare: datele sunt păstrate pe durata utilizării platformei și 12 luni ulterior dezactivării contului.

Ai dreptul la acces, rectificare, ștergere și portabilitate a datelor. Contact DPO: privacy@syncfit.ro`,
  },
  'Termeni și Condiții': {
    icon: '📄',
    body: `Prin utilizarea platformei SyncFit, ești de acord cu prezentele Termeni și Condiții.

1. ELIGIBILITATE
Platforma este destinată exclusiv angajaților companiilor partenere ING Group. Utilizarea abuzivă sau partajarea accesului este interzisă.

2. UTILIZAREA SERVICIULUI
• SyncFit nu înlocuiește sfatul medical profesionist.
• Recomandările de pauze și activitate fizică sunt orientative.
• Utilizatorul este responsabil pentru acuratețea datelor introduse.

3. PROPRIETATE INTELECTUALĂ
Toate elementele platformei (design, cod, conținut) sunt proprietatea EcoSync SRL și sunt protejate de legea drepturilor de autor.

4. LIMITAREA RĂSPUNDERII
EcoSync SRL nu răspunde pentru daune indirecte rezultate din utilizarea platformei. Disponibilitatea serviciului este de 99.5% din timp (SLA).

5. MODIFICĂRI
Ne rezervăm dreptul de a modifica acești termeni cu notificare de 30 de zile. Continuarea utilizării constituie acceptul modificărilor.

6. LEGISLAȚIE APLICABILĂ
Prezentele Termeni sunt guvernate de legislația română. Litigiile se soluționează la instanțele din București.`,
  },
  'Politica de Cookies': {
    icon: '🍪',
    body: `SyncFit folosește cookie-uri și tehnologii similare pentru funcționarea și îmbunătățirea platformei.

TIPURI DE COOKIE-URI UTILIZATE:

1. Cookie-uri esențiale (obligatorii)
• Sesiune de autentificare: păstrează starea de login
• Preferințe interfață: tema, setări afișare
• Nu pot fi dezactivate fără a afecta funcționalitatea

2. Cookie-uri funcționale
• Memorizarea orașului și preferințelor
• Setări de notificări
• Pot fi gestionate din setările contului

3. Cookie-uri analitice (opționale)
• Statistici anonime de utilizare pentru îmbunătățirea platformei
• Utilizăm date agregate, nu date individuale
• Pot fi dezactivate din setările browserului

GESTIONAREA COOKIE-URILOR:
Poți gestiona preferințele de cookie-uri din:
• Setările browserului (Chrome, Firefox, Safari, Edge)
• Setările contului SyncFit

Dezactivarea cookie-urilor esențiale va afecta funcționarea platformei.`,
  },
  'GDPR': {
    icon: '🛡️',
    body: `DREPTURILE TALE CONFORM GDPR (Regulamentul UE 2016/679)

Ca persoană vizată, ai următoarele drepturi:

1. DREPTUL LA INFORMARE
Ai dreptul să știi cum îți sunt prelucrate datele personale. Această politică GDPR și Politica de Confidențialitate îți oferă aceste informații.

2. DREPTUL DE ACCES
Poți solicita o copie a datelor tale personale prelucrate de SyncFit la orice moment.

3. DREPTUL LA RECTIFICARE
Poți corecta datele inexacte sau incomplete direct din profilul tău sau prin contactarea noastră.

4. DREPTUL LA ȘTERGERE ("DREPTUL DE A FI UITAT")
Poți solicita ștergerea datelor tale când acestea nu mai sunt necesare sau îți retragi consimțământul.

5. DREPTUL LA RESTRICȚIONAREA PRELUCRĂRII
Poți solicita limitarea prelucrării datelor tale în anumite circumstanțe.

6. DREPTUL LA PORTABILITATEA DATELOR
Poți solicita datele tale într-un format structurat, uzual și lizibil automat.

7. DREPTUL DE OPOZIȚIE
Poți te opune prelucrării datelor tale pentru marketing direct sau în baza interesului legitim.

EXERCITAREA DREPTURILOR:
Trimite o solicitare scrisă la: privacy@syncfit.ro
Vom răspunde în termen de 30 de zile.

AUTORITATEA DE SUPRAVEGHERE:
Ai dreptul de a depune plângere la ANSPDCP (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal).
Website: www.dataprotection.ro | Tel: +40 31 805 9211`,
  },
  'Contact': {
    icon: '📬',
    body: `CONTACTEAZĂ-NE

SyncFit by EcoSync
Str. Dorobanților 15
București 010573
România

EMAIL:
• General: contact@syncfit.ro
• Suport tehnic: support@syncfit.ro
• DPO (Protecția datelor): privacy@syncfit.ro
• Parteneriate: partners@syncfit.ro

TELEFON:
+40 21 123 4567 (Luni-Vineri, 9:00-17:00)

PROGRAM ASISTENȚĂ:
Luni – Vineri: 9:00 – 18:00
Weekend: Suport email (răspuns în 24h)

SOCIAL MEDIA:
• LinkedIn: linkedin.com/company/syncfit-ecosync
• Twitter/X: @SyncFitRO

Pentru solicitări GDPR și exercitarea drepturilor tale, te rugăm să contactezi DPO-ul nostru la privacy@syncfit.ro cu subiectul "Solicitare GDPR – [tipul solicitării]".`,
  },
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function LegalModal({ title, onClose }) {
  const content = LEGAL_CONTENT[title]
  if (!content) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-lg bg-zinc-900 border border-surface-border rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{content.icon}</span>
            <h2 className="text-base font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-surface-border bg-surface hover:bg-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {content.body.split('\n').map((line, i) => {
            if (line.trim() === '') return <div key={i} className="h-2" />
            if (line.match(/^[A-ZĂÎÂȘȚ][A-ZĂÎÂȘȚ\s()]+:$/) || line.match(/^\d+\. [A-ZĂÎÂȘȚ]/)) {
              return <p key={i} className="text-xs font-bold text-indigo-300 mt-3 mb-1">{line}</p>
            }
            if (line.startsWith('•')) {
              return <p key={i} className="text-xs text-slate-300 leading-relaxed pl-3">{line}</p>
            }
            return <p key={i} className="text-xs text-slate-300 leading-relaxed">{line}</p>
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-border shrink-0">
          <button
            onClick={onClose}
            className="w-full h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-sm font-medium hover:bg-indigo-600/40 transition-all"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Footer component (default export) ─────────────────────────────────────────
export default function LegalFooter() {
  const [openModal, setOpenModal] = useState(null)

  const links = Object.keys(LEGAL_CONTENT)

  return (
    <>
      {openModal && <LegalModal title={openModal} onClose={() => setOpenModal(null)} />}

      <footer className="border-t border-surface-border bg-zinc-950/80 mt-auto">
        {/* Main footer row */}
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left — brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">SyncFit</p>
                <p className="text-[10px] text-slate-500 leading-none">by EcoSync</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
              Platforma de wellbeing corporativ care te ajută să rămâi în echilibru.
            </p>
            <p className="text-[10px] text-slate-600">
              © 2026 SyncFit by EcoSync. Toate drepturile rezervate.
            </p>
          </div>

          {/* Center — quick links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Legal & Politici</p>
            <div className="flex flex-col gap-2">
              {links.map(link => (
                <button
                  key={link}
                  onClick={() => setOpenModal(link)}
                  className="text-left text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          {/* Right — trust signals */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conformitate</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                <span className="text-emerald-400 text-base">🛡️</span>
                <div>
                  <p className="text-xs font-semibold text-emerald-300">GDPR Compliant</p>
                  <p className="text-[10px] text-slate-500">Regulamentul UE 2016/679</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-sky-500/8 border border-sky-500/20 rounded-xl px-3 py-2.5">
                <span className="text-sky-400 text-base">🔒</span>
                <div>
                  <p className="text-xs font-semibold text-sky-300">Date Criptate</p>
                  <p className="text-[10px] text-slate-500">TLS 1.3 · AES-256</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-violet-500/8 border border-violet-500/20 rounded-xl px-3 py-2.5">
                <span className="text-violet-400 text-base">🏛️</span>
                <div>
                  <p className="text-xs font-semibold text-violet-300">ANSPDCP</p>
                  <p className="text-[10px] text-slate-500">Înregistrat ca operator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-surface-border/50 px-6 py-3">
          <p className="max-w-7xl mx-auto text-center text-[10px] text-slate-600 leading-relaxed">
            SyncFit prelucrează datele personale în conformitate cu GDPR (Regulamentul UE 2016/679) exclusiv în scopul furnizării serviciilor de wellbeing corporativ.
            Datele nu sunt transmise terților fără consimțământ explicit. DPO: privacy@syncfit.ro · ANSPDCP: www.dataprotection.ro
          </p>
        </div>
      </footer>
    </>
  )
}
