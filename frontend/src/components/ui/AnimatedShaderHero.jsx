import { useRef, useEffect } from 'react'

const DEFAULT_SHADER = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) { p=fract(p*vec2(12.9898,78.233)); p+=dot(p,p+34.56); return fract(p.x*p.y); }
float noise(in vec2 p) { vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f); float a=rnd(i), b=rnd(i+vec2(1,0)), c=rnd(i+vec2(0,1)), d=rnd(i+1.); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
float fbm(vec2 p) { float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2); for (int i=0; i<5; i++) { t+=a*noise(p); p*=2.*m; a*=.5; } return t; }
float clouds(vec2 p) { float d=1., t=.0; for (float i=.0; i<3.; i++) { float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p); t=mix(t,d,a); d=a; p*=2./(i+1.); } return t; }
void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv; float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.15,bg*.05,bg*.2),d);
  }
  O=vec4(col,1);
}`

const VERTEX_SRC = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`

class WebGLRenderer {
  constructor(canvas, scale) {
    this.canvas = canvas
    this.scale = scale
    this.gl = canvas.getContext('webgl2')
    this.program = null
    this.vs = null
    this.fs = null
    this.buffer = null
    this.mouseMove = [0, 0]
    this.mouseCoords = [0, 0]
    this.pointerCoords = [0, 0]
    this.nbrOfPointers = 0
    this.vertices = [-1, 1, -1, -1, 1, 1, 1, -1]
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale)
  }

  compile(shader, source) {
    const { gl } = this
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(shader))
    }
  }

  setup() {
    const { gl } = this
    this.vs = gl.createShader(gl.VERTEX_SHADER)
    this.fs = gl.createShader(gl.FRAGMENT_SHADER)
    this.compile(this.vs, VERTEX_SRC)
    this.compile(this.fs, DEFAULT_SHADER)
    this.program = gl.createProgram()
    gl.attachShader(this.program, this.vs)
    gl.attachShader(this.program, this.fs)
    gl.linkProgram(this.program)
  }

  init() {
    const { gl, program } = this
    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    program.resolution   = gl.getUniformLocation(program, 'resolution')
    program.time         = gl.getUniformLocation(program, 'time')
    program.move         = gl.getUniformLocation(program, 'move')
    program.touch        = gl.getUniformLocation(program, 'touch')
    program.pointerCount = gl.getUniformLocation(program, 'pointerCount')
    program.pointers     = gl.getUniformLocation(program, 'pointers')
  }

  reset() {
    const { gl, program } = this
    if (program && !gl.getProgramParameter(program, gl.DELETE_STATUS)) {
      if (this.vs) { gl.detachShader(program, this.vs); gl.deleteShader(this.vs) }
      if (this.fs) { gl.detachShader(program, this.fs); gl.deleteShader(this.fs) }
      gl.deleteProgram(program)
    }
  }

  updateScale(scale) {
    this.scale = scale
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale)
  }

  updateMove(d)  { this.mouseMove     = d }
  updateMouse(c) { this.mouseCoords   = c }
  updatePointerCoords(c) { this.pointerCoords = c }
  updatePointerCount(n)  { this.nbrOfPointers = n }

  render(now = 0) {
    const { gl, program } = this
    if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.uniform2f(program.resolution, this.canvas.width, this.canvas.height)
    gl.uniform1f(program.time, now * 1e-3)
    gl.uniform2f(program.move, ...this.mouseMove)
    gl.uniform2f(program.touch, ...this.mouseCoords)
    gl.uniform1i(program.pointerCount, this.nbrOfPointers)
    gl.uniform2fv(program.pointers, this.pointerCoords)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}

class PointerHandler {
  constructor(element, scale) {
    this.scale = scale
    this.active = false
    this.pointers = new Map()
    this.lastCoords = [0, 0]
    this.moves = [0, 0]

    const map = (el, sc, x, y) => [x * sc, el.height - y * sc]

    element.addEventListener('pointerdown', (e) => {
      this.active = true
      this.pointers.set(e.pointerId, map(element, this.scale, e.clientX, e.clientY))
    })
    element.addEventListener('pointerup', (e) => {
      if (this.pointers.size === 1) this.lastCoords = this.first
      this.pointers.delete(e.pointerId)
      this.active = this.pointers.size > 0
    })
    element.addEventListener('pointerleave', (e) => {
      if (this.pointers.size === 1) this.lastCoords = this.first
      this.pointers.delete(e.pointerId)
      this.active = this.pointers.size > 0
    })
    element.addEventListener('pointermove', (e) => {
      if (!this.active) return
      this.lastCoords = [e.clientX, e.clientY]
      this.pointers.set(e.pointerId, map(element, this.scale, e.clientX, e.clientY))
      this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY]
    })
  }

  get count()  { return this.pointers.size }
  get move()   { return this.moves }
  get coords() { return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0] }
  get first()  { return this.pointers.values().next().value ?? this.lastCoords }
}

function useShaderBackground() {
  const canvasRef        = useRef(null)
  const rafRef           = useRef(null)
  const rendererRef      = useRef(null)
  const pointersRef      = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio)
    canvas.width  = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr

    const renderer = new WebGLRenderer(canvas, dpr)
    const pointers = new PointerHandler(canvas, dpr)
    rendererRef.current = renderer
    pointersRef.current = pointers

    renderer.setup()
    renderer.init()

    const resize = () => {
      const r = Math.max(1, 0.5 * window.devicePixelRatio)
      canvas.width  = window.innerWidth * r
      canvas.height = window.innerHeight * r
      renderer.updateScale(r)
    }

    const loop = (now) => {
      renderer.updateMouse(pointers.first)
      renderer.updatePointerCount(pointers.count)
      renderer.updatePointerCoords(pointers.coords)
      renderer.updateMove(pointers.move)
      renderer.render(now)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      renderer.reset()
    }
  }, [])

  return canvasRef
}

export default function AnimatedShaderHero({ trustBadge, headline, subtitle, buttons, className = '' }) {
  const canvasRef = useShaderBackground()

  return (
    <div className={`relative w-full h-[52vh] overflow-hidden bg-black rounded-3xl border border-zinc-800 ${className}`}>
      <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-up   { animation: hero-fade-up 0.75s ease-out forwards; opacity: 0; }
        .hero-delay-200 { animation-delay: 0.2s; }
        .hero-delay-400 { animation-delay: 0.4s; }
      `}</style>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover touch-none" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white p-8 bg-black/35 backdrop-blur-[1px]">
        {trustBadge && (
          <div className="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-sm font-medium hero-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-300">{trustBadge.text}</span>
          </div>
        )}

        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-300 bg-clip-text text-transparent hero-fade-up hero-delay-200 leading-tight">
            {headline.line1} <br /> {headline.line2}
          </h1>
          <p className="text-base md:text-lg text-zinc-300 font-light max-w-2xl mx-auto hero-fade-up hero-delay-400">
            {subtitle}
          </p>

          {buttons && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 hero-fade-up hero-delay-400">
              {buttons.primary && (
                <button
                  onClick={buttons.primary.onClick}
                  className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-indigo-500/30 text-sm"
                >
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button
                  onClick={buttons.secondary.onClick}
                  className="px-7 py-3.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-600 text-white rounded-full font-semibold transition-all duration-200 hover:scale-105 backdrop-blur-md text-sm"
                >
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
