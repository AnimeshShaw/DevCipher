import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          borderRadius: '40px',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '160px',
            height: '160px',
            marginTop: '-80px',
            marginLeft: '-80px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(9,9,11,0) 70%)',
            display: 'flex',
          }}
        />

        {/* Lock icon */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3" y="11" width="18" height="11" rx="2"
            fill="rgba(99,102,241,0.2)"
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

        {/* "DevCipher" text */}
        <div style={{ display: 'flex', marginTop: '10px' }}>
          <span style={{ fontSize: '28px', fontWeight: '900', color: '#f4f4f5', letterSpacing: '-1px' }}>Dev</span>
          <span style={{ fontSize: '28px', fontWeight: '900', color: '#818cf8', letterSpacing: '-1px' }}>Cipher</span>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '3px',
            background: 'linear-gradient(to right, #3b82f6, #6366f1, #a855f7)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
