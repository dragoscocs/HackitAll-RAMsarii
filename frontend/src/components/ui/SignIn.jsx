import {
  memo,
  useState,
  useEffect,
  useRef,
  forwardRef,
} from 'react'
import {
  motion,
  useAnimation,
  useInView,
  useMotionTemplate,
  useMotionValue,
} from 'motion/react'
import { Eye, EyeOff } from 'lucide-react'

// ==================== cn helper ====================
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// ==================== Input ====================
const Input = memo(
  forwardRef(function Input({ className, type, ...props }, ref) {
    const radius = 100
    const [visible, setVisible] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }) {
      const { left, top } = currentTarget.getBoundingClientRect()
      mouseX.set(clientX - left)
      mouseY.set(clientY - top)
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
              #6366f1,
              transparent 80%
            )
          `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border-none bg-zinc-800 px-3 py-2 text-sm text-white transition duration-400 placeholder:text-neutral-500 focus-visible:ring-[2px] focus-visible:ring-indigo-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-[0px_0px_1px_1px_#334155]',
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    )
  })
)
Input.displayName = 'Input'

// ==================== BoxReveal ====================
const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor,
  duration,
  overflow = 'hidden',
  position = 'relative',
  className,
}) {
  const mainControls = useAnimation()
  const slideControls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible')
      mainControls.start('visible')
    } else {
      slideControls.start('hidden')
      mainControls.start('hidden')
    }
  }, [isInView, mainControls, slideControls])

  return (
    <section ref={ref} style={{ position, width, overflow }} className={className}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: duration ?? 0.5, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor ?? '#6366f1',
          borderRadius: 4,
        }}
      />
    </section>
  )
})

// ==================== Ripple ====================
const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className = '',
}) {
  return (
    <section
      className={`absolute inset-0 flex items-center justify-center
        [mask-image:linear-gradient(to_bottom,white,transparent)] ${className}`}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70
        const opacity = mainCircleOpacity - i * 0.025
        const animationDelay = `${i * 0.06}s`
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid'

        return (
          <span
            key={i}
            className="absolute animate-ripple rounded-full border border-indigo-500/20"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: Math.max(opacity, 0.04),
              animationDelay,
              borderStyle,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </section>
  )
})

// ==================== OrbitingCircles ====================
const OrbitingCircles = memo(function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
}) {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-indigo-500/10 stroke-1"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}
      <section
        style={{
          '--duration': duration,
          '--radius': radius,
          '--delay': -delay,
        }}
        className={cn(
          'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full [animation-delay:calc(var(--delay)*1000ms)]',
          { '[animation-direction:reverse]': reverse },
          className
        )}
      >
        {children}
      </section>
    </>
  )
})

// ==================== EcoOrbitDisplay ====================
const SPORT_ICONS = [
  { emoji: '🎾', label: 'Tennis',    radius: 100, duration: 20, delay: 0,  reverse: false },
  { emoji: '🏸', label: 'Badminton', radius: 100, duration: 20, delay: 10, reverse: false },
  { emoji: '🏓', label: 'Ping Pong', radius: 150, duration: 22, delay: 5,  reverse: true  },
  { emoji: '🧘', label: 'Yoga',      radius: 150, duration: 22, delay: 18, reverse: true  },
  { emoji: '🚴', label: 'Cycling',   radius: 210, duration: 28, delay: 0,  reverse: false },
  { emoji: '⚽', label: 'Football',  radius: 210, duration: 28, delay: 14, reverse: false },
  { emoji: '🌿', label: 'Eco',       radius: 270, duration: 35, delay: 8,  reverse: true  },
  { emoji: '🤝', label: 'Connect',   radius: 270, duration: 35, delay: 25, reverse: true  },
]

export const EcoOrbitDisplay = memo(function EcoOrbitDisplay() {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <Ripple mainCircleSize={80} numCircles={6} />

      {/* Center logo */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-32 h-32 flex items-center justify-center mb-[-0.5rem]">
          <img src="/logo.png?v=2" alt="SyncFit Logo" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">SyncFit</span>
        <span className="text-xs text-slate-400 text-center max-w-[160px]">
          Wellbeing & Active Matchmaking
        </span>
      </div>

      {SPORT_ICONS.map((icon, i) => (
        <OrbitingCircles
          key={i}
          radius={icon.radius}
          duration={icon.duration}
          delay={icon.delay}
          reverse={icon.reverse}
          path={i % 2 === 0}
          className="border-none bg-transparent size-auto"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-card border border-surface-border flex items-center justify-center text-xl shadow-lg">
            {icon.emoji}
          </div>
        </OrbitingCircles>
      ))}
    </section>
  )
})

// ==================== BottomGradient ====================
const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
  </>
)

// ==================== Label ====================
const Label = memo(function Label({ className, ...props }) {
  return (
    <label
      className={cn('text-sm font-medium leading-none text-slate-300', className)}
      {...props}
    />
  )
})

// ==================== AnimatedForm ====================
export const AnimatedForm = memo(function AnimatedForm({
  header,
  subHeader,
  fields,
  submitButton,
  textVariantButton,
  errorField,
  onSubmit,
  googleLogin,
  goTo,
  loading = false,
}) {
  const [visible, setVisible] = useState(false)
  const [errors, setErrors] = useState({})

  const toggleVisibility = () => setVisible(!visible)

  const validateForm = (event) => {
    const currentErrors = {}
    fields.forEach((field) => {
      const value = event.target[field.label]?.value
      if (field.required && !value) {
        currentErrors[field.label] = `${field.label} este obligatoriu`
      }
      if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
        currentErrors[field.label] = 'Adresă de email invalidă'
      }
      if (field.type === 'password' && value && value.length < 6) {
        currentErrors[field.label] = 'Parola trebuie să aibă cel puțin 6 caractere'
      }
    })
    return currentErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const formErrors = validateForm(event)
    if (Object.keys(formErrors).length === 0) {
      onSubmit(event)
    } else {
      setErrors(formErrors)
    }
  }

  return (
    <section className="w-full max-w-sm mx-auto flex flex-col gap-4">
      <BoxReveal boxColor="#6366f1" duration={0.3}>
        <h2 className="font-bold text-3xl text-white">{header}</h2>
      </BoxReveal>

      {subHeader && (
        <BoxReveal boxColor="#6366f1" duration={0.3} className="pb-1">
          <p className="text-slate-400 text-sm">{subHeader}</p>
        </BoxReveal>
      )}

      {googleLogin && (
        <>
          <BoxReveal boxColor="#6366f1" duration={0.3} overflow="visible" width="100%">
            <button
              className="g-button group/btn bg-transparent w-full rounded-md h-10 font-medium hover:cursor-pointer relative overflow-hidden"
              type="button"
              onClick={googleLogin}
            >
              <span className="flex items-center justify-center w-full h-full gap-3 text-white text-sm">
                <img
                  src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                  width={22}
                  height={22}
                  alt="Google"
                />
                Login with Google
              </span>
              <BottomGradient />
            </button>
          </BoxReveal>

          <BoxReveal boxColor="#6366f1" duration={0.3} width="100%">
            <section className="flex items-center gap-4">
              <hr className="flex-1 border-dashed border-surface-border" />
              <p className="text-slate-500 text-sm">sau</p>
              <hr className="flex-1 border-dashed border-surface-border" />
            </section>
          </BoxReveal>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <section className="flex flex-col gap-4 mb-4">
          {fields.map((field) => (
            <section key={field.label} className="flex flex-col gap-2">
              <BoxReveal boxColor="#6366f1" duration={0.3}>
                <Label htmlFor={field.label}>
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </Label>
              </BoxReveal>
              <BoxReveal width="100%" boxColor="#6366f1" duration={0.3}>
                <div className="relative">
                  <Input
                    type={
                      field.type === 'password'
                        ? visible ? 'text' : 'password'
                        : field.type
                    }
                    id={field.label}
                    placeholder={field.placeholder}
                    onChange={field.onChange}
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={toggleVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                {errors[field.label] && (
                  <p className="text-red-400 text-xs mt-1">{errors[field.label]}</p>
                )}
              </BoxReveal>
            </section>
          ))}
        </section>

        {errorField && (
          <BoxReveal width="100%" boxColor="#6366f1" duration={0.3}>
            <p className="text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {errorField}
            </p>
          </BoxReveal>
        )}

        <BoxReveal width="100%" boxColor="#6366f1" duration={0.3} overflow="visible">
          <button
            className="bg-gradient-to-br from-brand to-brand-dark relative group/btn w-full text-white rounded-md h-10 font-medium shadow-lg shadow-brand/30 hover:cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Se procesează...' : `${submitButton} →`}
            <BottomGradient />
          </button>
        </BoxReveal>

        {textVariantButton && goTo && (
          <BoxReveal boxColor="#6366f1" duration={0.3}>
            <div className="mt-4 text-center">
              <button
                className="text-sm text-indigo-400 hover:text-indigo-300 hover:cursor-pointer transition-colors"
                type="button"
                onClick={goTo}
              >
                {textVariantButton}
              </button>
            </div>
          </BoxReveal>
        )}
      </form>
    </section>
  )
})

export { Input, BoxReveal, Ripple, OrbitingCircles, Label, BottomGradient }
