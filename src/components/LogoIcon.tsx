import React from 'react';
import Svg, {
    Circle,
    Defs,
    Ellipse,
    G,
    Line,
    LinearGradient,
    Path,
    Polygon,
    Polyline,
    Rect,
    Stop,
    Text as SvgText
} from 'react-native-svg';

interface LogoIconProps {
  size?: number;
  showText?: boolean;
}

export function LogoIcon({ size = 100, showText = false }: LogoIconProps) {
  // Scale factor based on original 400x400 viewBox
  const viewBoxSize = showText ? 400 : 320;
  
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
      <Defs>
        {/* Golden shimmer gradient */}
        <LinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F4E4BA" />
          <Stop offset="25%" stopColor="#D4AF37" />
          <Stop offset="50%" stopColor="#FFD700" />
          <Stop offset="75%" stopColor="#D4AF37" />
          <Stop offset="100%" stopColor="#8B6914" />
        </LinearGradient>

        {/* Chocolate gradient */}
        <LinearGradient id="chocolateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#5D4037" />
          <Stop offset="50%" stopColor="#3E2723" />
          <Stop offset="100%" stopColor="#2C1810" />
        </LinearGradient>

        {/* Factory smoke gradient */}
        <LinearGradient id="smokeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#D7CCC8" />
          <Stop offset="100%" stopColor="#D7CCC8" stopOpacity="0" />
        </LinearGradient>

        {/* Receipt paper gradient */}
        <LinearGradient id="receiptGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFDF7" />
          <Stop offset="100%" stopColor="#F5F0E6" />
        </LinearGradient>
      </Defs>

      {/* Offset to center in viewBox */}
      <G transform={showText ? "translate(0, 0)" : "translate(-40, -40)"}>
        {/* Background circle (chocolate) with gold outline */}
        <Circle cx="200" cy="200" r="140" fill="url(#chocolateGradient)" stroke="#D4AF37" strokeWidth="4" />

        {/* Decorative chocolate swirl border */}
        <Circle
          cx="200"
          cy="200"
          r="132"
          fill="none"
          stroke="#8B6914"
          strokeWidth="2"
          strokeDasharray="12,6"
          opacity="0.6"
        />

        {/* Factory Building Base */}
        <G transform="translate(200, 200)">
          {/* Main factory body */}
          <Rect
            x="-55"
            y="-20"
            width="110"
            height="80"
            rx="6"
            fill="url(#chocolateGradient)"
            stroke="#D4AF37"
            strokeWidth="1.5"
          />

          {/* Factory roof */}
          <Polygon
            points="-62,-20 0,-52 62,-20"
            fill="#5D4037"
            stroke="#D4AF37"
            strokeWidth="1.5"
          />

          {/* Left chimney */}
          <Rect
            x="-42"
            y="-72"
            width="16"
            height="32"
            fill="#3E2723"
            stroke="#D4AF37"
            strokeWidth="1"
          />
          {/* Smoke puffs from left chimney */}
          <Ellipse cx="-34" cy="-80" rx="10" ry="6" fill="url(#smokeGradient)" opacity="0.7" />
          <Ellipse cx="-32" cy="-90" rx="7" ry="5" fill="url(#smokeGradient)" opacity="0.5" />

          {/* Right chimney */}
          <Rect
            x="26"
            y="-72"
            width="16"
            height="32"
            fill="#3E2723"
            stroke="#D4AF37"
            strokeWidth="1"
          />
          {/* Smoke puffs from right chimney */}
          <Ellipse cx="34" cy="-80" rx="10" ry="6" fill="url(#smokeGradient)" opacity="0.7" />
          <Ellipse cx="36" cy="-90" rx="7" ry="5" fill="url(#smokeGradient)" opacity="0.5" />

          {/* Factory windows (golden glow) */}
          <Rect x="-40" y="-8" width="20" height="24" rx="2" fill="#FFF8E1" stroke="#D4AF37" strokeWidth="1" />
          <Rect x="-10" y="-8" width="20" height="24" rx="2" fill="#FFF8E1" stroke="#D4AF37" strokeWidth="1" />
          <Rect x="20" y="-8" width="20" height="24" rx="2" fill="#FFF8E1" stroke="#D4AF37" strokeWidth="1" />

          {/* Factory door */}
          <Rect x="-12" y="30" width="24" height="30" rx="12" fill="#2C1810" stroke="#D4AF37" strokeWidth="1.5" />
          <Circle cx="6" cy="46" r="2.5" fill="#D4AF37" />
        </G>

        {/* Golden Ticket Receipt emerging from factory */}
        <G transform="translate(200, 200)">
          {/* Receipt paper with golden ticket styling */}
          <G transform="rotate(-15)">
            <Path
              d="M 45,-15 
                 L 45,70 
                 Q 48,73 45,76 Q 42,79 45,82 Q 48,85 45,88 Q 42,91 45,94
                 L -8,94 
                 Q -11,91 -8,88 Q -5,85 -8,82 Q -11,79 -8,76 Q -5,73 -8,70
                 L -8,-15 Z"
              fill="url(#goldGradient)"
              stroke="#8B6914"
              strokeWidth="1.5"
            />

            {/* Receipt lines */}
            <Line x1="0" y1="-2" x2="36" y2="-2" stroke="#5D4037" strokeWidth="1.5" opacity="0.7" />
            <Line x1="0" y1="10" x2="32" y2="10" stroke="#5D4037" strokeWidth="1.5" opacity="0.7" />
            <Line x1="0" y1="22" x2="28" y2="22" stroke="#5D4037" strokeWidth="1.5" opacity="0.7" />

            {/* Checkmark */}
            <G transform="translate(16, 48)">
              <Circle cx="0" cy="0" r="14" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1.5" />
              <Polyline
                points="-6,0 -2,6 8,-6"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>

            {/* Dollar sign */}
            <SvgText
              x="16"
              y="80"
              fontFamily="Georgia"
              fontSize="11"
              fontWeight="bold"
              fill="#3E2723"
              textAnchor="middle"
            >
              $$$
            </SvgText>
          </G>
        </G>

        {/* Magnifying glass (detective element) - positioned to examine receipt */}
        <G transform="translate(250, 205)">
          <Circle cx="0" cy="0" r="24" fill="url(#chocolateGradient)" stroke="#D4AF37" strokeWidth="4" />
          <Circle cx="0" cy="0" r="16" fill="#FFF8E1" fillOpacity="0.3" />
          <Line x1="16" y1="16" x2="32" y2="32" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" />
          {/* Shine on glass */}
          <Ellipse cx="-5" cy="-5" rx="5" ry="3" fill="#FFFFFF" opacity="0.6" />
        </G>

        {/* Text (only if showText is true) */}
        {showText && (
          <>
            <SvgText
              x="200"
              y="355"
              fontFamily="Georgia"
              fontSize="24"
              fontWeight="bold"
              fill="url(#goldGradient)"
              textAnchor="middle"
            >
              RECEIPT FACTORY
            </SvgText>
            <SvgText
              x="200"
              y="375"
              fontFamily="Arial"
              fontSize="10"
              fill="#D7CCC8"
              textAnchor="middle"
            >
              YOUR GOLDEN TICKET TO SAVINGS
            </SvgText>
          </>
        )}
      </G>
    </Svg>
  );
}
