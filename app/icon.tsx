import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '28px',
            height: '28px',
            marginTop: '-14px',
            marginLeft: '-14px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(9,9,11,0) 70%)',
            display: 'flex',
          }}
        />

        {/* Lock icon scaled to 32px */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3" y="11" width="18" height="11" rx="2"
            fill="rgba(99,102,241,0.25)"
            stroke="#818cf8"
            stroke-width="2"
          />
          <path
            d="M7 11V7a5 5 0 0 1 10 0v4"
            stroke="#818cf8"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
          <circle cx="12" cy="16.5" r="1.5" fill="#a5b4fc" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
