import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const alt = 'DevCipher — Free Cryptography & Developer Tools'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TOOLS = ['SHA-256', 'AES-256', 'JWT', 'Base64', 'bcrypt', 'RSA']

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow — indigo */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '700px',
            height: '500px',
            marginTop: '-250px',
            marginLeft: '-350px',
            background:
              'radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, rgba(9,9,11,0) 70%)',
            display: 'flex',
          }}
        />

        {/* Secondary glow — purple, offset */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '15%',
            width: '400px',
            height: '300px',
            background:
              'radial-gradient(ellipse at center, rgba(168,85,247,0.10) 0%, rgba(9,9,11,0) 70%)',
            display: 'flex',
          }}
        />

        {/* Lock icon */}
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <svg
            width="72"
            height="72"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3" y="11" width="18" height="11" rx="2"
              fill="rgba(99,102,241,0.15)"
              stroke="#818cf8"
              stroke-width="1.75"
            />
            <path
              d="M7 11V7a5 5 0 0 1 10 0v4"
              stroke="#818cf8"
              stroke-width="1.75"
              stroke-linecap="round"
              fill="none"
            />
            <circle cx="12" cy="16.5" r="1.75" fill="#a5b4fc" />
            <line
              x1="12" y1="18.25" x2="12" y2="20"
              stroke="#a5b4fc"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </div>

        {/* Main title */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0px' }}>
          <span
            style={{
              fontSize: '92px',
              fontWeight: '900',
              color: '#f4f4f5',
              letterSpacing: '-4px',
              lineHeight: 1,
            }}
          >
            Dev
          </span>
          <span
            style={{
              fontSize: '92px',
              fontWeight: '900',
              color: '#818cf8',
              letterSpacing: '-4px',
              lineHeight: 1,
            }}
          >
            Cipher
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '26px',
            color: '#71717a',
            marginTop: '14px',
            letterSpacing: '0.3px',
            display: 'flex',
          }}
        >
          Free Cryptography &amp; Developer Tools
        </div>

        {/* Tool chips */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '36px',
          }}
        >
          {TOOLS.map((tool) => (
            <div
              key={tool}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                background: '#18181b',
                color: '#a1a1aa',
                fontSize: '15px',
                fontWeight: '500',
                display: 'flex',
              }}
            >
              {tool}
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: '28px',
            marginTop: '28px',
            fontSize: '15px',
            color: '#52525b',
          }}
        >
          <span style={{ display: 'flex' }}>100+ tools</span>
          <span style={{ display: 'flex', color: '#3f3f46' }}>·</span>
          <span style={{ display: 'flex' }}>All client-side</span>
          <span style={{ display: 'flex', color: '#3f3f46' }}>·</span>
          <span style={{ display: 'flex' }}>No tracking</span>
          <span style={{ display: 'flex', color: '#3f3f46' }}>·</span>
          <span style={{ display: 'flex' }}>Open source</span>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: '22px',
            color: '#3b82f6',
            marginTop: '32px',
            letterSpacing: '1.5px',
            fontWeight: '600',
            display: 'flex',
          }}
        >
          devcipher.dev
        </div>

        {/* Bottom gradient bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(to right, #3b82f6, #6366f1, #a855f7)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
